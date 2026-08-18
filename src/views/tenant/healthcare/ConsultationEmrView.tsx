import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  Patient, ConsultationEncounter, Prescription, LabRequest, RadiologyRequest,
  TriageAssessment, PrescriptionItem, LabTestItem, RadiologyServiceItem,
  InpatientWard, InpatientBed
} from '../../../types';
import {
  Stethoscope, User, Heart, Activity, FileText, Pill, FlaskConical, Eye,
  Plus, CheckCircle2, AlertTriangle, Clock, ArrowRight, Bed, DollarSign,
  ChevronDown, Trash2
} from 'lucide-react';

interface ConsultationEmrViewProps {
  initialPatientId?: string;
  onNavigateTab?: (tab: string) => void;
}

export const ConsultationEmrView: React.FC<ConsultationEmrViewProps> = ({
  initialPatientId,
  onNavigateTab
}) => {
  const { user, tenant } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId || '');
  const [triages, setTriages] = useState<TriageAssessment[]>([]);
  const [labCatalogue, setLabCatalogue] = useState<LabTestItem[]>([]);
  const [radiologyCatalogue, setRadiologyCatalogue] = useState<RadiologyServiceItem[]>([]);
  const [encounters, setEncounters] = useState<ConsultationEncounter[]>([]);
  const [wards, setWards] = useState<InpatientWard[]>([]);
  const [beds, setBeds] = useState<InpatientBed[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Encounter Form State
  const [presentingComplaints, setPresentingComplaints] = useState('');
  const [historyOfPresentIllness, setHistoryOfPresentIllness] = useState('');
  const [physicalExamination, setPhysicalExamination] = useState('');
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('');
  const [icd10Code, setIcd10Code] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [disposition, setDisposition] = useState<'DISCHARGED' | 'ADMIT' | 'REFER' | 'FOLLOW_UP'>('DISCHARGED');

  // e-Prescription Items
  const [rxItems, setRxItems] = useState<Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    durationDays: number;
    instructions: string;
  }>>([]);
  const [newRxName, setNewRxName] = useState('');
  const [newRxDosage, setNewRxDosage] = useState('500mg');
  const [newRxFrequency, setNewRxFrequency] = useState('TDS (3x Daily)');
  const [newRxDuration, setNewRxDuration] = useState('5');
  const [newRxInstructions, setNewRxInstructions] = useState('Take after meals');

  // Lab Investigation Requests
  const [selectedLabTestIds, setSelectedLabTestIds] = useState<string[]>([]);
  const [labPriority, setLabPriority] = useState<'ROUTINE' | 'URGENT' | 'STAT'>('ROUTINE');

  // Radiology Investigation Requests
  const [selectedRadioServiceIds, setSelectedRadioServiceIds] = useState<string[]>([]);
  const [radioClinicalIndication, setRadioClinicalIndication] = useState('');

  // Inpatient Admission Request
  const [selectedWardId, setSelectedWardId] = useState('');
  const [selectedBedId, setSelectedBedId] = useState('');
  const [admissionReason, setAdmissionReason] = useState('');

  const getHeaders = () => ({
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, tRes, lRes, rRes, eRes, wRes, bRes] = await Promise.all([
        fetch('/api/app/hospital/patients', { headers: getHeaders() }),
        fetch('/api/app/hospital/triages', { headers: getHeaders() }),
        fetch('/api/app/hospital/lab-tests', { headers: getHeaders() }),
        fetch('/api/app/hospital/radiology-services', { headers: getHeaders() }),
        fetch('/api/app/hospital/encounters', { headers: getHeaders() }),
        fetch('/api/app/hospital/wards', { headers: getHeaders() }),
        fetch('/api/app/hospital/beds', { headers: getHeaders() })
      ]);

      if (pRes.ok) {
        const data = await pRes.json();
        const pList = data.patients || [];
        setPatients(pList);
        if (!selectedPatientId && pList.length > 0) {
          setSelectedPatientId(pList[0].id);
        }
      }
      if (tRes.ok) setTriages((await tRes.json()).triages || []);
      if (lRes.ok) setLabCatalogue((await lRes.json()).labTests || []);
      if (rRes.ok) setRadiologyCatalogue((await rRes.json()).services || []);
      if (eRes.ok) setEncounters((await eRes.json()).encounters || []);
      if (wRes.ok) {
        const wData = (await wRes.json()).wards || [];
        setWards(wData);
        if (wData.length > 0) setSelectedWardId(wData[0].id);
      }
      if (bRes.ok) setBeds((await bRes.json()).beds || []);
    } catch (err) {
      console.error('Failed to load consultation room data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const patientTriage = triages.find(t => t.patientId === selectedPatientId);
  const patientEncounters = encounters.filter(e => e.patientId === selectedPatientId);

  const handleAddRxItem = () => {
    if (!newRxName.trim()) return;
    setRxItems([
      ...rxItems,
      {
        medicineName: newRxName.trim(),
        dosage: newRxDosage.trim(),
        frequency: newRxFrequency.trim(),
        durationDays: parseInt(newRxDuration) || 5,
        instructions: newRxInstructions.trim()
      }
    ]);
    setNewRxName('');
    setNewRxDosage('500mg');
    setNewRxFrequency('TDS (3x Daily)');
    setNewRxDuration('5');
    setNewRxInstructions('Take after meals');
  };

  const handleRemoveRxItem = (idx: number) => {
    setRxItems(rxItems.filter((_, i) => i !== idx));
  };

  const handleSaveConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    try {
      setIsSubmitting(true);

      // 1. Record Encounter
      const encounterPayload = {
        patientId: selectedPatient.id,
        patientName: selectedPatient.fullName,
        mrn: selectedPatient.mrn,
        doctorId: user?.id || 'doc-1',
        doctorName: user?.name || 'Dr. Attending',
        presentingComplaints: presentingComplaints.trim() || 'Routine follow-up',
        historyOfPresentIllness: historyOfPresentIllness.trim(),
        physicalExamination: physicalExamination.trim(),
        diagnosis: {
          primary: primaryDiagnosis.trim() || 'Clinical Review',
          icd10Code: icd10Code.trim() || 'Z00.0',
          type: 'CONFIRMED'
        },
        clinicalNotes: clinicalNotes.trim(),
        followUpDate: followUpDate || undefined,
        disposition
      };

      const encRes = await fetch('/api/app/hospital/encounters', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(encounterPayload)
      });

      const encounterData = await encRes.json();
      const encounterId = encounterData.encounter?.id;

      // 2. Submit e-Prescription if drugs were added
      if (rxItems.length > 0) {
        await fetch('/api/app/hospital/prescriptions', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            encounterId,
            patientId: selectedPatient.id,
            patientName: selectedPatient.fullName,
            mrn: selectedPatient.mrn,
            doctorId: user?.id || 'doc-1',
            doctorName: user?.name || 'Dr. Attending',
            items: rxItems.map((item, idx) => ({
              id: `rx-item-${Date.now()}-${idx}`,
              medicineName: item.medicineName,
              dosage: item.dosage,
              frequency: item.frequency,
              durationDays: item.durationDays,
              quantity: (item.durationDays * 3),
              instructions: item.instructions
            }))
          })
        });
      }

      // 3. Submit Lab Requests if selected
      for (const testId of selectedLabTestIds) {
        const testObj = labCatalogue.find(t => t.id === testId);
        if (testObj) {
          await fetch('/api/app/hospital/lab-requests', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
              patientId: selectedPatient.id,
              patientName: selectedPatient.fullName,
              mrn: selectedPatient.mrn,
              encounterId,
              testId: testObj.id,
              testName: testObj.name,
              category: testObj.category,
              priority: labPriority,
              doctorId: user?.id || 'doc-1',
              doctorName: user?.name || 'Dr. Attending'
            })
          });
        }
      }

      // 4. Submit Radiology Requests if selected
      for (const radioId of selectedRadioServiceIds) {
        const radioObj = radiologyCatalogue.find(r => r.id === radioId);
        if (radioObj) {
          await fetch('/api/app/hospital/radiology-requests', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
              patientId: selectedPatient.id,
              patientName: selectedPatient.fullName,
              mrn: selectedPatient.mrn,
              encounterId,
              serviceId: radioObj.id,
              serviceName: radioObj.name,
              modality: radioObj.modality,
              bodyPart: radioObj.bodyPart,
              clinicalIndication: radioClinicalIndication || presentingComplaints,
              doctorId: user?.id || 'doc-1',
              doctorName: user?.name || 'Dr. Attending'
            })
          });
        }
      }

      // 5. Inpatient Admission if disposition is ADMIT
      if (disposition === 'ADMIT' && selectedWardId) {
        const wardObj = wards.find(w => w.id === selectedWardId);
        const bedObj = beds.find(b => b.id === selectedBedId);
        await fetch('/api/app/hospital/admissions', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            patientId: selectedPatient.id,
            patientName: selectedPatient.fullName,
            mrn: selectedPatient.mrn,
            wardId: selectedWardId,
            wardName: wardObj?.name || 'General Ward',
            bedId: selectedBedId || undefined,
            bedNumber: bedObj?.bedNumber || 'Bed-1',
            admittingDoctorId: user?.id || 'doc-1',
            admittingDoctorName: user?.name || 'Dr. Attending',
            diagnosis: primaryDiagnosis || 'Inpatient observation',
            reason: admissionReason || 'Admitted for active management and nursing care'
          })
        });
      }

      // 6. Update Queue item status to COMPLETED
      alert(`Consultation encounter saved successfully for ${selectedPatient.fullName}.`);
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Error saving consultation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPresentingComplaints('');
    setHistoryOfPresentIllness('');
    setPhysicalExamination('');
    setPrimaryDiagnosis('');
    setIcd10Code('');
    setClinicalNotes('');
    setFollowUpDate('');
    setDisposition('DISCHARGED');
    setRxItems([]);
    setSelectedLabTestIds([]);
    setSelectedRadioServiceIds([]);
  };

  const availableBeds = beds.filter(b => b.wardId === selectedWardId && b.status === 'AVAILABLE');

  return (
    <div className="space-y-6">
      {/* Consultation Hub Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-600" />
            <span>Doctor Consultation & Clinical EMR Room</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Attending Physician: <strong className="text-slate-800">{user?.name || 'Doctor'}</strong> • Facility: <strong className="text-slate-800">{tenant?.name}</strong>
          </p>
        </div>

        {/* Patient Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">Select Patient:</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.fullName} ({p.mrn})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Clinical Summary Ribbon */}
      {selectedPatient && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Patient Info</div>
              <div className="text-base font-bold text-white mt-0.5">{selectedPatient.fullName}</div>
              <div className="text-xs text-slate-300 font-mono mt-0.5">{selectedPatient.mrn} • {selectedPatient.gender}, {selectedPatient.dateOfBirth}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-medium">Blood Group & Allergies</div>
              <div className="text-xs font-bold text-red-400 mt-1">
                Blood Group: {selectedPatient.bloodGroup.replace('_', ' ')}
              </div>
              <div className="text-xs text-amber-300 mt-0.5 truncate">
                Allergies: {selectedPatient.allergies?.join(', ') || 'NKDA'}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-medium">Today's Vitals (Triage)</div>
              {patientTriage ? (
                <div className="text-xs text-emerald-300 font-mono mt-1 space-y-0.5">
                  <div>BP: <strong>{patientTriage.vitals.bloodPressure}</strong> | HR: {patientTriage.vitals.heartRateBpm} bpm</div>
                  <div>Temp: {patientTriage.vitals.temperatureCelsius}°C | SpO2: {patientTriage.vitals.oxygenSaturationSpo2}%</div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 mt-1 italic">No vitals recorded today</div>
              )}
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-medium">Billing / Coverage</div>
              <div className="text-xs text-white font-medium mt-1">
                {selectedPatient.insurance?.provider ? (
                  <span className="text-blue-300 font-semibold">{selectedPatient.insurance.provider} ({selectedPatient.insurance.policyNumber})</span>
                ) : (
                  <span className="text-slate-300">Self Pay / Cash Patient</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main EMR Consultation Form */}
      <form onSubmit={handleSaveConsultation} className="space-y-6">
        {/* Step 1: Clinical Notes & Examination */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h4 className="font-bold text-slate-900 text-sm">1. Clinical Examination & History</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Chief Presenting Complaints *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Severe throbbing headache, blurred vision, intermittent fever for 4 days..."
                value={presentingComplaints}
                onChange={(e) => setPresentingComplaints(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">History of Present Illness (HPI)</label>
              <textarea
                rows={3}
                placeholder="Onset, character, aggravating factors, relieving factors, previous treatments..."
                value={historyOfPresentIllness}
                onChange={(e) => setHistoryOfPresentIllness(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Physical Examination Findings</label>
              <textarea
                rows={2}
                placeholder="Chest clear, abdomen soft non-tender, no peripheral edema..."
                value={physicalExamination}
                onChange={(e) => setPhysicalExamination(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Clinical Impressions / Doctor Notes</label>
              <textarea
                rows={2}
                placeholder="Patient oriented in time and space, counselled on hydration and rest..."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Primary Diagnosis *</label>
              <input
                type="text"
                required
                placeholder="e.g. Acute Bacterial Sinusitis / Essential Hypertension"
                value={primaryDiagnosis}
                onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">ICD-10 Code</label>
              <input
                type="text"
                placeholder="e.g. J01.9 / I10 / E11.9"
                value={icd10Code}
                onChange={(e) => setIcd10Code(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Diagnostic Investigations (Lab & Radiology Orders) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FlaskConical className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-slate-900 text-sm">2. Order Diagnostic Tests (Laboratory & Radiology)</h4>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Laboratory Tests */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Laboratory Requests</span>
                <select
                  value={labPriority}
                  onChange={(e) => setLabPriority(e.target.value as any)}
                  className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-700"
                >
                  <option value="ROUTINE">ROUTINE</option>
                  <option value="URGENT">URGENT</option>
                  <option value="STAT">STAT (Emergency)</option>
                </select>
              </div>

              {labCatalogue.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No lab tests available in catalog.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-xl">
                  {labCatalogue.map(t => {
                    const isSelected = selectedLabTestIds.includes(t.id);
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedLabTestIds(selectedLabTestIds.filter(id => id !== t.id));
                          } else {
                            setSelectedLabTestIds([...selectedLabTestIds, t.id]);
                          }
                        }}
                        className={`p-2.5 rounded-lg text-left text-xs border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{t.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{t.code}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{t.category} • ${t.price}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Radiology & Imaging */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-800">Radiology & Imaging Requests</span>
              {radiologyCatalogue.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No radiology services configured.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-xl">
                  {radiologyCatalogue.map(r => {
                    const isSelected = selectedRadioServiceIds.includes(r.id);
                    return (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedRadioServiceIds(selectedRadioServiceIds.filter(id => id !== r.id));
                          } else {
                            setSelectedRadioServiceIds([...selectedRadioServiceIds, r.id]);
                          }
                        }}
                        className={`p-2.5 rounded-lg text-left text-xs border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-50 border-purple-300 text-purple-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{r.name}</span>
                          <span className="text-[10px] font-bold text-purple-700">{r.modality}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{r.bodyPart} • ${r.price}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: e-Prescription Generation */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-amber-600" />
              <h4 className="font-bold text-slate-900 text-sm">3. Electronic Prescriptions (e-Rx)</h4>
            </div>
            <span className="text-xs text-slate-500 font-medium">{rxItems.length} Drugs Prescribed</span>
          </div>

          {/* Quick Drug Adder Form */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
            <span className="font-bold text-slate-800">Add Medication to Prescription</span>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Medicine Name (e.g. Amoxicillin / Paracetamol)"
                  value={newRxName}
                  onChange={(e) => setNewRxName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-medium text-xs focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Dosage (500mg)"
                  value={newRxDosage}
                  onChange={(e) => setNewRxDosage(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <select
                  value={newRxFrequency}
                  onChange={(e) => setNewRxFrequency(e.target.value)}
                  className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="OD (1x Daily)">OD (1x Daily)</option>
                  <option value="BD (2x Daily)">BD (2x Daily)</option>
                  <option value="TDS (3x Daily)">TDS (3x Daily)</option>
                  <option value="QID (4x Daily)">QID (4x Daily)</option>
                  <option value="PRN (As Needed)">PRN (As Needed)</option>
                  <option value="STAT (Once Immediately)">STAT (Once)</option>
                </select>
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Days (5)"
                  value={newRxDuration}
                  onChange={(e) => setNewRxDuration(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Special Instructions (e.g. Take with food, finish complete dosage)"
                value={newRxInstructions}
                onChange={(e) => setNewRxInstructions(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddRxItem}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer shrink-0"
              >
                Add Drug
              </button>
            </div>
          </div>

          {/* Rx Items Table */}
          {rxItems.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <tr>
                    <th className="px-4 py-2">Medication</th>
                    <th className="px-3 py-2">Dosage</th>
                    <th className="px-3 py-2">Frequency</th>
                    <th className="px-3 py-2">Duration</th>
                    <th className="px-3 py-2">Instructions</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {rxItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-bold text-slate-900">{item.medicineName}</td>
                      <td className="px-3 py-2.5 text-slate-700">{item.dosage}</td>
                      <td className="px-3 py-2.5 text-slate-700">{item.frequency}</td>
                      <td className="px-3 py-2.5 text-slate-700">{item.durationDays} Days</td>
                      <td className="px-3 py-2.5 text-slate-500">{item.instructions}</td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveRxItem(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Step 4: Patient Disposition & Admission Option */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Bed className="w-4 h-4 text-purple-600" />
            <h4 className="font-bold text-slate-900 text-sm">4. Patient Disposition & Inpatient Admission Order</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Clinical Disposition *</label>
              <select
                value={disposition}
                onChange={(e) => setDisposition(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
              >
                <option value="DISCHARGED">Discharge to Home (Outpatient)</option>
                <option value="ADMIT">Admit to Inpatient Ward</option>
                <option value="FOLLOW_UP">Schedule OPD Follow-up Visit</option>
                <option value="REFER">Refer to Specialized Facility</option>
              </select>
            </div>

            {disposition === 'FOLLOW_UP' && (
              <div>
                <label className="block text-slate-700 font-medium mb-1">Next Follow-up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            )}

            {disposition === 'ADMIT' && (
              <>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Select Inpatient Ward</label>
                  <select
                    value={selectedWardId}
                    onChange={(e) => setSelectedWardId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  >
                    {wards.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.gender} - {w.wardType})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Available Bed</label>
                  <select
                    value={selectedBedId}
                    onChange={(e) => setSelectedBedId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  >
                    <option value="">Auto-Assign / Any Available Bed</option>
                    {availableBeds.map(b => (
                      <option key={b.id} value={b.id}>{b.bedNumber} ({b.bedType})</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Submit Consultation Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isSubmitting ? 'Submitting Clinical Record...' : 'Complete Encounter & Dispatch Orders'}</span>
          </button>
        </div>
      </form>

      {/* Patient Past Medical History Encounters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <h4 className="font-bold text-slate-900 text-sm">Past Consultation Encounters for this Patient ({patientEncounters.length})</h4>
        {patientEncounters.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No prior consultation encounters recorded for this patient.</p>
        ) : (
          <div className="space-y-3">
            {patientEncounters.map(enc => (
              <div key={enc.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{enc.diagnosis.primary}</span>
                    {enc.diagnosis.icd10Code && (
                      <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                        {enc.diagnosis.icd10Code}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(enc.createdAt).toLocaleDateString()} • {enc.doctorName}
                  </span>
                </div>
                <p className="text-slate-700"><strong>Complaints:</strong> {enc.presentingComplaints}</p>
                {enc.clinicalNotes && <p className="text-slate-600"><strong>Notes:</strong> {enc.clinicalNotes}</p>}
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">
                    Disposition: {enc.disposition}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
