import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  Prescription, MedicineItem, MedicineBatch, PharmacyDispense, Patient
} from '../../../types';
import {
  Pill, Plus, Search, Filter, AlertTriangle, CheckCircle2, DollarSign,
  Package, Clock, RefreshCw, Layers, ShieldCheck, XCircle, ShoppingBag
} from 'lucide-react';

export const PharmacyManagement: React.FC = () => {
  const { tenant } = useAuth();
  const [activeTab, setActiveTab] = useState<'PRESCRIPTIONS' | 'CATALOGUE' | 'BATCHES' | 'DISPENSED'>('PRESCRIPTIONS');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [batches, setBatches] = useState<MedicineBatch[]>([]);
  const [dispenses, setDispenses] = useState<PharmacyDispense[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Medicine Modal State
  const [isAddMedModalOpen, setIsAddMedModalOpen] = useState(false);
  const [medName, setMedName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState<'ANTIBIOTIC' | 'ANALGESIC' | 'ANTIHYPERTENSIVE' | 'ANTIDIABETIC' | 'ANTIHISTAMINE' | 'VITAMIN' | 'OTHER'>('ANTIBIOTIC');
  const [dosageForm, setDosageForm] = useState<'TABLET' | 'CAPSULE' | 'SYRUP' | 'INJECTION' | 'OINTMENT' | 'DROPS' | 'INHALER'>('TABLET');
  const [strength, setStrength] = useState('500mg');
  const [unitPrice, setUnitPrice] = useState('15');
  const [reorderLevel, setReorderLevel] = useState('50');
  const [initialStock, setInitialStock] = useState('200');

  // Receive Stock Batch Modal State
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchMedicineId, setBatchMedicineId] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [batchQuantity, setBatchQuantity] = useState('100');
  const [batchUnitCost, setBatchUnitCost] = useState('10');
  const [batchSellingPrice, setBatchSellingPrice] = useState('15');
  const [batchExpiryDate, setBatchExpiryDate] = useState('');
  const [batchManufacturer, setBatchManufacturer] = useState('');

  // Dispense Action State
  const [dispensingRx, setDispensingRx] = useState<Prescription | null>(null);
  const [pharmacistNotes, setPharmacistNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getHeaders = () => ({
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rxRes, medRes, batRes, disRes] = await Promise.all([
        fetch('/api/app/hospital/prescriptions', { headers: getHeaders() }),
        fetch('/api/app/hospital/medicines', { headers: getHeaders() }),
        fetch('/api/app/hospital/medicine-batches', { headers: getHeaders() }),
        fetch('/api/app/hospital/dispenses', { headers: getHeaders() })
      ]);

      if (rxRes.ok) setPrescriptions((await rxRes.json()).prescriptions || []);
      if (medRes.ok) {
        const mData = (await medRes.json()).medicines || [];
        setMedicines(mData);
        if (mData.length > 0 && !batchMedicineId) setBatchMedicineId(mData[0].id);
      }
      if (batRes.ok) setBatches((await batRes.json()).batches || []);
      if (disRes.ok) setDispenses((await disRes.json()).dispenses || []);
    } catch (err) {
      console.error('Failed to load pharmacy data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/app/hospital/medicines', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: medName.trim(),
          genericName: genericName.trim() || medName.trim(),
          category,
          dosageForm,
          strength: strength.trim(),
          unitPrice: parseFloat(unitPrice) || 10,
          stockOnHand: parseInt(initialStock) || 100,
          reorderLevel: parseInt(reorderLevel) || 50
        })
      });

      if (res.ok) {
        setIsAddMedModalOpen(false);
        setMedName('');
        setGenericName('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to create medicine:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const medObj = medicines.find(m => m.id === batchMedicineId);
    if (!medObj || !batchNumber.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/app/hospital/medicine-batches', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          medicineId: medObj.id,
          medicineName: medObj.name,
          batchNumber: batchNumber.trim(),
          quantityReceived: parseInt(batchQuantity) || 100,
          quantityAvailable: parseInt(batchQuantity) || 100,
          unitCost: parseFloat(batchUnitCost) || 10,
          sellingPrice: parseFloat(batchSellingPrice) || medObj.unitPrice,
          expiryDate: batchExpiryDate || '2027-12-31',
          manufacturer: batchManufacturer.trim()
        })
      });

      if (res.ok) {
        setIsBatchModalOpen(false);
        setBatchNumber('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to record stock batch:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDispenseRx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispensingRx) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/app/hospital/dispenses', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          prescriptionId: dispensingRx.id,
          patientId: dispensingRx.patientId,
          patientName: dispensingRx.patientName,
          mrn: dispensingRx.mrn,
          items: dispensingRx.items.map(item => ({
            medicineId: item.medicineId || item.id,
            medicineName: item.medicineName,
            quantityDispensed: item.quantity || 10,
            unitPrice: 15,
            totalPrice: (item.quantity || 10) * 15
          })),
          totalAmount: dispensingRx.items.reduce((sum, item) => sum + ((item.quantity || 10) * 15), 0),
          notes: pharmacistNotes.trim() || 'Dispensed as prescribed by attending physician'
        })
      });

      if (res.ok) {
        setDispensingRx(null);
        setPharmacistNotes('');
        fetchData();
      }
    } catch (err) {
      console.error('Error dispensing prescription:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingPrescriptions = prescriptions.filter(p => p.status === 'PENDING' || p.status === 'PARTIALLY_DISPENSED');
  const lowStockMeds = medicines.filter(m => m.stockOnHand <= m.reorderLevel);

  return (
    <div className="space-y-6">
      {/* Pharmacy Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-amber-600" />
            <span>Hospital Pharmacy & Formulary Inventory</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Prescription dispensing, batch tracking, expiry monitoring, and drug catalogue
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Package className="w-4 h-4" />
            <span>Receive Stock Batch</span>
          </button>
          <button
            onClick={() => setIsAddMedModalOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Pharmacy Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('PRESCRIPTIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'PRESCRIPTIONS'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Pending Prescriptions ({pendingPrescriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('CATALOGUE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'CATALOGUE'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Medicine Catalogue ({medicines.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('BATCHES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'BATCHES'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Stock Batches & Expiries ({batches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('DISPENSED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'DISPENSED'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Dispense Logs ({dispenses.length})</span>
        </button>
      </div>

      {/* Tab 1: Pending Prescriptions Queue */}
      {activeTab === 'PRESCRIPTIONS' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading prescription queue...</div>
          ) : pendingPrescriptions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-800">Prescription Queue Clear</p>
              <p className="text-xs text-slate-400">No unfulfilled doctor prescriptions pending in pharmacy.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingPrescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{rx.patientName}</span>
                      <div className="text-xs text-blue-600 font-mono mt-0.5">{rx.mrn}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                      {rx.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium">
                    Prescribed by: <strong className="text-slate-700">{rx.doctorName}</strong> • {new Date(rx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {/* Rx Line Items */}
                  <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs border border-slate-100">
                    <span className="font-bold text-slate-800 text-[11px]">Medications:</span>
                    {rx.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-slate-200/60 pb-1 text-slate-700">
                        <div>
                          <strong className="text-slate-900">{item.medicineName}</strong> ({item.dosage})
                          <div className="text-[10px] text-slate-400">{item.frequency} for {item.durationDays} days • {item.instructions}</div>
                        </div>
                        <span className="font-mono text-slate-600 font-semibold">{item.quantity || (item.durationDays * 3)} units</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-end pt-2">
                    <button
                      onClick={() => setDispensingRx(rx)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Pill className="w-3.5 h-3.5" />
                      <span>Verify & Dispense</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Medicine Catalogue */}
      {activeTab === 'CATALOGUE' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3">Medicine / Generic</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Dosage Form</th>
                  <th className="px-4 py-3">Stock on Hand</th>
                  <th className="px-4 py-3">Unit Price</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {medicines.map((m) => {
                  const isLow = m.stockOnHand <= m.reorderLevel;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{m.name}</div>
                        <div className="text-[11px] text-slate-400">{m.genericName} • {m.strength}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">{m.category}</td>
                      <td className="px-4 py-3.5 text-slate-700">{m.dosageForm}</td>
                      <td className="px-4 py-3.5 font-mono font-bold">
                        <span className={isLow ? 'text-red-600' : 'text-slate-800'}>{m.stockOnHand} units</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">${m.unitPrice}</td>
                      <td className="px-4 py-3.5">
                        {isLow ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold text-[10px] flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Low Stock (Reorder: {m.reorderLevel})</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                            Adequate Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Stock Batches */}
      {activeTab === 'BATCHES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3">Medicine</th>
                  <th className="px-4 py-3">Batch Number</th>
                  <th className="px-4 py-3">Qty Available</th>
                  <th className="px-4 py-3">Unit Cost / Price</th>
                  <th className="px-4 py-3">Expiry Date</th>
                  <th className="px-4 py-3">Manufacturer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{b.medicineName}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-600">{b.batchNumber}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-800">{b.quantityAvailable} / {b.quantityReceived}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-700">${b.unitCost} / ${b.sellingPrice}</td>
                    <td className="px-4 py-3.5 font-mono text-amber-700 font-semibold">{b.expiryDate}</td>
                    <td className="px-4 py-3.5 text-slate-500">{b.manufacturer || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Dispensed History */}
      {activeTab === 'DISPENSED' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3">Date / Patient</th>
                  <th className="px-4 py-3">Items Dispensed</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Pharmacist</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {dispenses.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{d.patientName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{d.mrn} • {new Date(d.dispensedAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        {d.items.map((it, idx) => (
                          <div key={idx} className="text-slate-800 text-[11px]">
                            • {it.medicineName} ({it.quantityDispensed} units)
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-emerald-700">${d.totalAmount}</td>
                    <td className="px-4 py-3.5 text-slate-700">{d.pharmacistName}</td>
                    <td className="px-4 py-3.5 text-slate-500">{d.notes || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Dispense Verification */}
      {dispensingRx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Dispense Prescription</h3>
                <p className="text-xs text-slate-500">Patient: <strong className="text-slate-800">{dispensingRx.patientName}</strong> ({dispensingRx.mrn})</p>
              </div>
              <button onClick={() => setDispensingRx(null)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispenseRx} className="space-y-4 text-xs">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <span className="font-bold text-amber-900 text-xs">Items to Dispense & Bill:</span>
                {dispensingRx.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-800">
                    <span>{it.medicineName} ({it.dosage}) - {it.frequency}</span>
                    <strong className="font-mono text-amber-900">{it.quantity || (it.durationDays * 3)} units</strong>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Pharmacist Verification Notes</label>
                <textarea
                  rows={2}
                  placeholder="Patient counselled on dosage, side effects, and storage..."
                  value={pharmacistNotes}
                  onChange={(e) => setPharmacistNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDispensingRx(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Dispensing...' : 'Confirm Dispensing & Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Medicine */}
      {isAddMedModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Add Medicine to Catalogue</h3>
              <button onClick={() => setIsAddMedModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMedicine} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Augmentin"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">Generic / Chemical Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Amoxicillin + Clavulanic Acid"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="ANTIBIOTIC">ANTIBIOTIC</option>
                    <option value="ANALGESIC">ANALGESIC</option>
                    <option value="ANTIHYPERTENSIVE">ANTIHYPERTENSIVE</option>
                    <option value="ANTIDIABETIC">ANTIDIABETIC</option>
                    <option value="ANTIHISTAMINE">ANTIHISTAMINE</option>
                    <option value="VITAMIN">VITAMIN</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Dosage Form</label>
                  <select
                    value={dosageForm}
                    onChange={(e) => setDosageForm(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="TABLET">TABLET</option>
                    <option value="CAPSULE">CAPSULE</option>
                    <option value="SYRUP">SYRUP</option>
                    <option value="INJECTION">INJECTION</option>
                    <option value="OINTMENT">OINTMENT</option>
                    <option value="DROPS">DROPS</option>
                    <option value="INHALER">INHALER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Strength (e.g. 625mg)</label>
                  <input
                    type="text"
                    value={strength}
                    onChange={(e) => setStrength(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Selling Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Initial Stock Quantity</label>
                  <input
                    type="number"
                    value={initialStock}
                    onChange={(e) => setInitialStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Reorder Threshold</label>
                  <input
                    type="number"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMedModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add to Catalogue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Receive Stock Batch */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Receive Medicine Batch</h3>
              <button onClick={() => setIsBatchModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBatch} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Select Medicine *</label>
                <select
                  value={batchMedicineId}
                  onChange={(e) => setBatchMedicineId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                >
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.strength})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Batch / Lot Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BATCH-2026-X8"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Quantity Received</label>
                  <input
                    type="number"
                    value={batchQuantity}
                    onChange={(e) => setBatchQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={batchUnitCost}
                    onChange={(e) => setBatchUnitCost(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={batchSellingPrice}
                    onChange={(e) => setBatchSellingPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={batchExpiryDate}
                    onChange={(e) => setBatchExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-amber-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. GSK / Dawa Ltd"
                    value={batchManufacturer}
                    onChange={(e) => setBatchManufacturer(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Stocking...' : 'Stock Batch & Update Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
