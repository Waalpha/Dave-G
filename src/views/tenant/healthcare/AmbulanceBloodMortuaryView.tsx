import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  AmbulanceVehicle, AmbulanceTrip, BloodInventoryUnit, MortuaryIntake, BloodGroup
} from '../../../types';
import {
  Truck, Droplet, ShieldAlert, Plus, CheckCircle2, Clock, AlertTriangle,
  FileText, ShieldCheck, XCircle, MapPin, Phone, User
} from 'lucide-react';

export const AmbulanceBloodMortuaryView: React.FC = () => {
  const { user, tenant } = useAuth();
  const [activeTab, setActiveTab] = useState<'AMBULANCE' | 'BLOOD_BANK' | 'MORTUARY'>('AMBULANCE');
  const [ambulances, setAmbulances] = useState<AmbulanceVehicle[]>([]);
  const [trips, setTrips] = useState<AmbulanceTrip[]>([]);
  const [bloodUnits, setBloodUnits] = useState<BloodInventoryUnit[]>([]);
  const [mortuaryIntakes, setMortuaryIntakes] = useState<MortuaryIntake[]>([]);
  const [loading, setLoading] = useState(true);

  // Dispatch Ambulance Modal State
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchAmbulanceId, setDispatchAmbulanceId] = useState('');
  const [dispatchPatientName, setDispatchPatientName] = useState('');
  const [dispatchPickup, setDispatchPickup] = useState('');
  const [dispatchDestination, setDispatchDestination] = useState('Emergency Department (Main Hospital)');
  const [dispatchPriority, setDispatchPriority] = useState<'CRITICAL' | 'URGENT' | 'ROUTINE'>('CRITICAL');
  const [dispatchChiefComplaint, setDispatchChiefComplaint] = useState('');

  // Add Blood Unit Modal State
  const [isAddBloodModalOpen, setIsAddBloodModalOpen] = useState(false);
  const [unitBloodGroup, setUnitBloodGroup] = useState<BloodGroup>('O_POSITIVE');
  const [donorName, setDonorName] = useState('');
  const [bloodVolumeMl, setBloodVolumeMl] = useState('450');
  const [bloodExpiryDate, setBloodExpiryDate] = useState('');

  // Mortuary Intake Modal State
  const [isMortuaryModalOpen, setIsMortuaryModalOpen] = useState(false);
  const [deceasedName, setDeceasedName] = useState('');
  const [chamberNumber, setChamberNumber] = useState('Vault C-04');
  const [causeOfDeath, setCauseOfDeath] = useState('');
  const [nokName, setNokName] = useState('');
  const [nokPhone, setNokPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getHeaders = () => ({
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ambRes, trpRes, bldRes, morRes] = await Promise.all([
        fetch('/api/app/hospital/ambulances', { headers: getHeaders() }),
        fetch('/api/app/hospital/ambulance-trips', { headers: getHeaders() }),
        fetch('/api/app/hospital/blood-units', { headers: getHeaders() }),
        fetch('/api/app/hospital/mortuary-intakes', { headers: getHeaders() })
      ]);

      if (ambRes.ok) {
        const aData = (await ambRes.json()).ambulances || [];
        setAmbulances(aData);
        if (aData.length > 0 && !dispatchAmbulanceId) setDispatchAmbulanceId(aData[0].id);
      }
      if (trpRes.ok) setTrips((await trpRes.json()).trips || []);
      if (bldRes.ok) setBloodUnits((await bldRes.json()).units || []);
      if (morRes.ok) setMortuaryIntakes((await morRes.json()).intakes || []);
    } catch (err) {
      console.error('Failed to load ancillary emergency data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const ambObj = ambulances.find(a => a.id === dispatchAmbulanceId);
    if (!ambObj || !dispatchPickup.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/app/hospital/ambulance-trips', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ambulanceId: ambObj.id,
          vehicleRegNumber: ambObj.vehicleRegNumber,
          driverName: ambObj.driverName || 'Duty Paramedic Driver',
          paramedicName: ambObj.paramedicName || 'Critical Care EMT',
          patientName: dispatchPatientName.trim() || 'Emergency Caller',
          pickupLocation: dispatchPickup.trim(),
          destinationLocation: dispatchDestination.trim(),
          priority: dispatchPriority,
          chiefComplaint: dispatchChiefComplaint.trim() || 'Medical emergency'
        })
      });

      if (res.ok) {
        setIsDispatchModalOpen(false);
        setDispatchPatientName('');
        setDispatchPickup('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to dispatch ambulance:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddBloodUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/app/hospital/blood-units', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          bloodGroup: unitBloodGroup,
          donorName: donorName.trim() || 'Voluntary Donor',
          volumeMl: parseInt(bloodVolumeMl) || 450,
          collectionDate: new Date().toISOString().split('T')[0],
          expiryDate: bloodExpiryDate || new Date(Date.now() + 35 * 86400000).toISOString().split('T')[0],
          screeningStatus: 'PASSED',
          status: 'AVAILABLE'
        })
      });

      if (res.ok) {
        setIsAddBloodModalOpen(false);
        setDonorName('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to add blood unit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMortuaryIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deceasedName.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/app/hospital/mortuary-intakes', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          deceasedName: deceasedName.trim(),
          dateOfDeath: new Date().toISOString(),
          causeOfDeath: causeOfDeath.trim() || 'Cardiopulmonary arrest',
          chamberNumber: chamberNumber.trim(),
          nextOfKin: {
            name: nokName.trim() || 'Family Contact',
            phone: nokPhone.trim(),
            relationship: 'Next of Kin'
          }
        })
      });

      if (res.ok) {
        setIsMortuaryModalOpen(false);
        setDeceasedName('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to record mortuary intake:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableAmbulances = ambulances.filter(a => a.status === 'AVAILABLE');
  const availableBlood = bloodUnits.filter(b => b.status === 'AVAILABLE');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-red-600" />
            <span>Ancillary Emergency, Blood Bank & Support Units</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Emergency ambulance dispatch, screened blood unit bank, and mortuary documentation
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'AMBULANCE' && (
            <button
              onClick={() => setIsDispatchModalOpen(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Dispatch Ambulance</span>
            </button>
          )}

          {activeTab === 'BLOOD_BANK' && (
            <button
              onClick={() => setIsAddBloodModalOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Droplet className="w-4 h-4" />
              <span>Bank Blood Unit</span>
            </button>
          )}

          {activeTab === 'MORTUARY' && (
            <button
              onClick={() => setIsMortuaryModalOpen(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Mortuary Intake</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('AMBULANCE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'AMBULANCE' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Ambulance Fleet & Trips ({trips.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('BLOOD_BANK')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'BLOOD_BANK' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Droplet className="w-4 h-4" />
          <span>Blood Bank Unit Inventory ({availableBlood.length} Units)</span>
        </button>

        <button
          onClick={() => setActiveTab('MORTUARY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'MORTUARY' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Mortuary Logs ({mortuaryIntakes.length})</span>
        </button>
      </div>

      {/* Tab 1: Ambulance Fleet & Trips */}
      {activeTab === 'AMBULANCE' && (
        <div className="space-y-6">
          {/* Fleet Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ambulances.map(a => (
              <div key={a.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs font-mono">{a.vehicleRegNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    a.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                    a.status === 'ON_TRIP' ? 'bg-red-100 text-red-800 animate-pulse' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {a.status}
                  </span>
                </div>
                <div className="text-xs text-slate-600">{a.model} ({a.type})</div>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  Driver: <strong>{a.driverName || 'Duty Staff'}</strong> • Paramedic: {a.paramedicName || 'EMT Staff'}
                </div>
              </div>
            ))}
          </div>

          {/* Trips Log */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {trips.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Truck className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-700">No ambulance trips logged</p>
                <p className="text-xs text-slate-400">Dispatched emergency runs will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                    <tr>
                      <th className="px-5 py-3">Vehicle / Date</th>
                      <th className="px-4 py-3">Patient / Complaint</th>
                      <th className="px-4 py-3">Pickup Location</th>
                      <th className="px-4 py-3">Destination</th>
                      <th className="px-4 py-3">Priority / Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {trips.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900 font-mono">{t.vehicleRegNumber}</div>
                          <div className="text-[10px] text-slate-400">{new Date(t.dispatchedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">{t.patientName}</div>
                          <div className="text-[10px] text-slate-500">{t.chiefComplaint}</div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-700">{t.pickupLocation}</td>
                        <td className="px-4 py-3.5 text-slate-700">{t.destinationLocation}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {t.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Blood Bank Units */}
      {activeTab === 'BLOOD_BANK' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {bloodUnits.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Droplet className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">Blood Bank Vault Empty</p>
              <p className="text-xs text-slate-400">Screened whole blood and PRBC units will be cataloged here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="px-5 py-3">Unit Number</th>
                    <th className="px-4 py-3">Blood Group</th>
                    <th className="px-4 py-3">Volume</th>
                    <th className="px-4 py-3">Screening Status</th>
                    <th className="px-4 py-3">Expiry Date</th>
                    <th className="px-4 py-3">Inventory Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {bloodUnits.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{u.unitNumber}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-lg text-xs font-bold">
                          {u.bloodGroup.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-800">{u.volumeMl} mL</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                          {u.screeningStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-amber-700 font-semibold">{u.expiryDate}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Mortuary Logs */}
      {activeTab === 'MORTUARY' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {mortuaryIntakes.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No mortuary intakes recorded</p>
              <p className="text-xs text-slate-400">Deceased records, vault chamber tags and release logs appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="px-5 py-3">Tag / Date</th>
                    <th className="px-4 py-3">Deceased Name</th>
                    <th className="px-4 py-3">Vault Chamber</th>
                    <th className="px-4 py-3">Cause of Death</th>
                    <th className="px-4 py-3">Next of Kin</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {mortuaryIntakes.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                        {m.tagNumber}
                        <div className="text-[10px] text-slate-400 font-normal">{new Date(m.dateOfDeath).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">{m.deceasedName}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-800">{m.chamberNumber}</td>
                      <td className="px-4 py-3.5 text-slate-700 max-w-[180px] truncate">{m.causeOfDeath}</td>
                      <td className="px-4 py-3.5 text-slate-700">
                        <div>{m.nextOfKin?.name || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400">{m.nextOfKin?.phone}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.status === 'INTAKE' ? 'bg-slate-100 text-slate-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: Dispatch Ambulance */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Emergency Ambulance Dispatch</h3>
              <button onClick={() => setIsDispatchModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatch} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Select Available Ambulance *</label>
                <select
                  value={dispatchAmbulanceId}
                  onChange={(e) => setDispatchAmbulanceId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                >
                  {ambulances.map(a => (
                    <option key={a.id} value={a.id}>{a.vehicleRegNumber} - {a.model} ({a.status})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Patient / Caller Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe / Road Accident"
                  value={dispatchPatientName}
                  onChange={(e) => setDispatchPatientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Incident / Pickup Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Westlands Roundabout, Nairobi"
                  value={dispatchPickup}
                  onChange={(e) => setDispatchPickup(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Destination</label>
                  <input
                    type="text"
                    value={dispatchDestination}
                    onChange={(e) => setDispatchDestination(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Acuity Priority</label>
                  <select
                    value={dispatchPriority}
                    onChange={(e) => setDispatchPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-red-700"
                  >
                    <option value="CRITICAL">CRITICAL (Lights & Sirens)</option>
                    <option value="URGENT">URGENT</option>
                    <option value="ROUTINE">ROUTINE TRANSFER</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Chief Emergency Details</label>
                <input
                  type="text"
                  placeholder="Trauma, cardiac arrest, difficulty breathing..."
                  value={dispatchChiefComplaint}
                  onChange={(e) => setDispatchChiefComplaint(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Dispatching...' : 'Dispatch Siren Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bank Blood Unit */}
      {isAddBloodModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Add Screened Blood Unit</h3>
              <button onClick={() => setIsAddBloodModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBloodUnit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Blood Group *</label>
                  <select
                    value={unitBloodGroup}
                    onChange={(e) => setUnitBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-red-700"
                  >
                    <option value="A_POSITIVE">A+</option>
                    <option value="A_NEGATIVE">A-</option>
                    <option value="B_POSITIVE">B+</option>
                    <option value="B_NEGATIVE">B-</option>
                    <option value="AB_POSITIVE">AB+</option>
                    <option value="AB_NEGATIVE">AB-</option>
                    <option value="O_POSITIVE">O+</option>
                    <option value="O_NEGATIVE">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Volume (mL)</label>
                  <input
                    type="number"
                    value={bloodVolumeMl}
                    onChange={(e) => setBloodVolumeMl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Donor Name / Code</label>
                <input
                  type="text"
                  placeholder="e.g. Red Cross Drive #104"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={bloodExpiryDate}
                  onChange={(e) => setBloodExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-amber-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddBloodModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Catalog Blood Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Mortuary Intake */}
      {isMortuaryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Mortuary Intake & Tagging</h3>
              <button onClick={() => setIsMortuaryModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMortuaryIntake} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Deceased Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Full name of deceased"
                  value={deceasedName}
                  onChange={(e) => setDeceasedName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Vault Chamber Code</label>
                  <input
                    type="text"
                    value={chamberNumber}
                    onChange={(e) => setChamberNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Cause of Death</label>
                  <input
                    type="text"
                    value={causeOfDeath}
                    onChange={(e) => setCauseOfDeath(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Next of Kin Name</label>
                  <input
                    type="text"
                    value={nokName}
                    onChange={(e) => setNokName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Next of Kin Phone</label>
                  <input
                    type="text"
                    value={nokPhone}
                    onChange={(e) => setNokPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMortuaryModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Record Intake & Assign Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
