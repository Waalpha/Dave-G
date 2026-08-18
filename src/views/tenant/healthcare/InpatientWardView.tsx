import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  InpatientWard, InpatientBed, InpatientAdmission, NursingCareRecord,
  MedicationAdministration, Patient
} from '../../../types';
import {
  Bed, Plus, Users, Activity, CheckCircle2, Clock, AlertTriangle,
  FileText, Pill, LogOut, ChevronRight, XCircle, ShieldCheck
} from 'lucide-react';

export const InpatientWardView: React.FC = () => {
  const { user, tenant } = useAuth();
  const [activeTab, setActiveTab] = useState<'BED_MAP' | 'ADMISSIONS' | 'NURSING' | 'MAR' | 'WARDS_CONFIG'>('BED_MAP');
  const [wards, setWards] = useState<InpatientWard[]>([]);
  const [beds, setBeds] = useState<InpatientBed[]>([]);
  const [admissions, setAdmissions] = useState<InpatientAdmission[]>([]);
  const [nursingRecords, setNursingRecords] = useState<NursingCareRecord[]>([]);
  const [medAdministrations, setMedAdministrations] = useState<MedicationAdministration[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // New Ward Modal State
  const [isAddWardModalOpen, setIsAddWardModalOpen] = useState(false);
  const [newWardName, setNewWardName] = useState('');
  const [newWardType, setNewWardType] = useState<'GENERAL' | 'ICU' | 'HDU' | 'PEDIATRIC' | 'MATERNITY' | 'SURGICAL' | 'ISOLATION' | 'VIP'>('GENERAL');
  const [newWardGender, setNewWardGender] = useState<'MALE' | 'FEMALE' | 'MIXED' | 'PEDIATRIC'>('MIXED');
  const [newWardFloor, setNewWardFloor] = useState('1st Floor');
  const [newWardRate, setNewWardRate] = useState('50');

  // New Bed Modal State
  const [isAddBedModalOpen, setIsAddBedModalOpen] = useState(false);
  const [targetWardId, setTargetWardId] = useState('');
  const [newBedNumber, setNewBedNumber] = useState('');
  const [newBedType, setNewBedType] = useState<'STANDARD' | 'ICU' | 'ELECTRIC' | 'PEDIATRIC_COT' | 'INCUBATOR'>('STANDARD');
  const [newBedRate, setNewBedRate] = useState('50');

  // Direct Admission Modal State
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [admitPatientId, setAdmitPatientId] = useState('');
  const [admitWardId, setAdmitWardId] = useState('');
  const [admitBedId, setAdmitBedId] = useState('');
  const [admitDiagnosis, setAdmitDiagnosis] = useState('');
  const [admitReason, setAdmitReason] = useState('');

  // Nursing Care Note Modal State
  const [isNursingModalOpen, setIsNursingModalOpen] = useState(false);
  const [activeAdmissionForNursing, setActiveAdmissionForNursing] = useState<InpatientAdmission | null>(null);
  const [nurseShift, setNurseShift] = useState<'MORNING' | 'AFTERNOON' | 'NIGHT'>('MORNING');
  const [nursingNotes, setNursingNotes] = useState('');
  const [nurseBP, setNurseBP] = useState('120/80');
  const [nurseTemp, setNurseTemp] = useState('36.8');
  const [nurseHR, setNurseHR] = useState('74');
  const [nurseSpO2, setNurseSpO2] = useState('98');

  // Medication Administration (MAR) Modal State
  const [isMarModalOpen, setIsMarModalOpen] = useState(false);
  const [activeAdmissionForMar, setActiveAdmissionForMar] = useState<InpatientAdmission | null>(null);
  const [marDrugName, setMarDrugName] = useState('');
  const [marDosage, setMarDosage] = useState('1g IV');
  const [marRoute, setMarRoute] = useState<'ORAL' | 'IV' | 'IM' | 'SC' | 'TOPICAL' | 'INHALATION'>('IV');
  const [marNotes, setMarNotes] = useState('Administered on schedule with no adverse reaction');

  // Discharge Modal State
  const [dischargeAdmission, setDischargeAdmission] = useState<InpatientAdmission | null>(null);
  const [dischargeSummary, setDischargeSummary] = useState('');
  const [dischargeInstructions, setDischargeInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getHeaders = () => ({
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wRes, bRes, aRes, nRes, mRes, pRes] = await Promise.all([
        fetch('/api/app/hospital/wards', { headers: getHeaders() }),
        fetch('/api/app/hospital/beds', { headers: getHeaders() }),
        fetch('/api/app/hospital/admissions', { headers: getHeaders() }),
        fetch('/api/app/hospital/nursing-care', { headers: getHeaders() }),
        fetch('/api/app/hospital/med-administrations', { headers: getHeaders() }),
        fetch('/api/app/hospital/patients', { headers: getHeaders() })
      ]);

      if (wRes.ok) {
        const wData = (await wRes.json()).wards || [];
        setWards(wData);
        if (wData.length > 0 && !targetWardId) setTargetWardId(wData[0].id);
        if (wData.length > 0 && !admitWardId) setAdmitWardId(wData[0].id);
      }
      if (bRes.ok) setBeds((await bRes.json()).beds || []);
      if (aRes.ok) setAdmissions((await aRes.json()).admissions || []);
      if (nRes.ok) setNursingRecords((await nRes.json()).records || []);
      if (mRes.ok) setMedAdministrations((await mRes.json()).records || []);
      if (pRes.ok) {
        const pData = (await pRes.json()).patients || [];
        setPatients(pData);
        if (pData.length > 0 && !admitPatientId) setAdmitPatientId(pData[0].id);
      }
    } catch (err) {
      console.error('Failed to load inpatient data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddWard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWardName.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/app/hospital/wards', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: newWardName.trim(),
          wardType: newWardType,
          gender: newWardGender,
          floorNumber: newWardFloor.trim(),
          dailyRate: parseFloat(newWardRate) || 50,
          isActive: true
        })
      });

      if (res.ok) {
        setIsAddWardModalOpen(false);
        setNewWardName('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to create ward:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddBed = async (e: React.FormEvent) => {
    e.preventDefault();
    const wardObj = wards.find(w => w.id === targetWardId);
    if (!wardObj || !newBedNumber.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/app/hospital/beds', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          wardId: wardObj.id,
          wardName: wardObj.name,
          bedNumber: newBedNumber.trim(),
          bedType: newBedType,
          status: 'AVAILABLE',
          dailyRate: parseFloat(newBedRate) || wardObj.dailyRate
        })
      });

      if (res.ok) {
        setIsAddBedModalOpen(false);
        setNewBedNumber('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to register bed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectAdmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pObj = patients.find(p => p.id === admitPatientId);
    const wObj = wards.find(w => w.id === admitWardId);
    const bObj = beds.find(b => b.id === admitBedId);
    if (!pObj || !wObj) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/app/hospital/admissions', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          patientId: pObj.id,
          patientName: pObj.fullName,
          mrn: pObj.mrn,
          wardId: wObj.id,
          wardName: wObj.name,
          bedId: bObj?.id,
          bedNumber: bObj?.bedNumber || 'Bed-1',
          admittingDoctorId: user?.id || 'doc-1',
          admittingDoctorName: user?.name || 'Dr. Attending',
          diagnosis: admitDiagnosis.trim() || 'Inpatient active management',
          reason: admitReason.trim() || 'Medical admission'
        })
      });

      if (res.ok) {
        setIsAdmitModalOpen(false);
        setAdmitDiagnosis('');
        setAdmitReason('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to admit patient:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNursingNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAdmissionForNursing) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/app/hospital/nursing-care', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          admissionId: activeAdmissionForNursing.id,
          patientId: activeAdmissionForNursing.patientId,
          patientName: activeAdmissionForNursing.patientName,
          mrn: activeAdmissionForNursing.mrn,
          nurseId: user?.id || 'nurse-1',
          nurseName: user?.name || 'Nurse on Duty',
          shift: nurseShift,
          vitals: {
            bloodPressure: nurseBP,
            temperatureCelsius: parseFloat(nurseTemp) || 36.8,
            heartRateBpm: parseFloat(nurseHR) || 74,
            oxygenSaturationSpo2: parseFloat(nurseSpO2) || 98
          },
          careNotes: nursingNotes.trim() || 'Patient comfortable in bed. Vitals stable.'
        })
      });

      if (res.ok) {
        setIsNursingModalOpen(false);
        setActiveAdmissionForNursing(null);
        setNursingNotes('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to record nursing care note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveMar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAdmissionForMar || !marDrugName.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/app/hospital/med-administrations', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          admissionId: activeAdmissionForMar.id,
          patientId: activeAdmissionForMar.patientId,
          patientName: activeAdmissionForMar.patientName,
          mrn: activeAdmissionForMar.mrn,
          medicineName: marDrugName.trim(),
          dosage: marDosage.trim(),
          route: marRoute,
          administeredByNurseId: user?.id || 'nurse-1',
          administeredByNurseName: user?.name || 'Staff Nurse',
          status: 'GIVEN',
          notes: marNotes.trim()
        })
      });

      if (res.ok) {
        setIsMarModalOpen(false);
        setActiveAdmissionForMar(null);
        setMarDrugName('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to record medication administration:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDischargePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dischargeAdmission) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/app/hospital/admissions/${dischargeAdmission.id}/discharge`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          dischargeSummary: dischargeSummary.trim() || 'Patient stabilized and recovered, cleared for home discharge.',
          dischargeInstructions: dischargeInstructions.trim() || 'Follow prescribed oral medication course and return in case of fever.',
          dischargedByDoctorId: user?.id || 'doc-1',
          dischargedByDoctorName: user?.name || 'Dr. Attending'
        })
      });

      if (res.ok) {
        setDischargeAdmission(null);
        setDischargeSummary('');
        setDischargeInstructions('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to discharge patient:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeAdmissions = admissions.filter(a => a.status === 'ADMITTED');
  const availableBeds = beds.filter(b => b.wardId === admitWardId && b.status === 'AVAILABLE');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bed className="w-5 h-5 text-purple-600" />
            <span>Inpatient Wards, Bed Matrix & Admissions</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ward occupancy tracking, daily nursing care logs, MAR charts and clinical discharge
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddBedModalOpen(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Bed</span>
          </button>
          <button
            onClick={() => setIsAddWardModalOpen(true)}
            className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Ward</span>
          </button>
          <button
            onClick={() => setIsAdmitModalOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Admit Patient</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('BED_MAP')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'BED_MAP' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bed className="w-4 h-4" />
          <span>Live Ward & Bed Matrix ({beds.length} Beds)</span>
        </button>

        <button
          onClick={() => setActiveTab('ADMISSIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ADMISSIONS' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Active Inpatient Roster ({activeAdmissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('NURSING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'NURSING' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Nursing Vitals & Notes ({nursingRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('MAR')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'MAR' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Medication Admin Record - MAR ({medAdministrations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('WARDS_CONFIG')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'WARDS_CONFIG' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Ward Units ({wards.length})</span>
        </button>
      </div>

      {/* Tab 1: Live Ward & Bed Visual Matrix */}
      {activeTab === 'BED_MAP' && (
        <div className="space-y-6">
          {wards.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
              <Bed className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No Wards Created Yet</p>
              <p className="text-xs text-slate-400">Create wards and beds to start managing inpatient hospital occupancy.</p>
            </div>
          ) : (
            wards.map((ward) => {
              const wardBeds = beds.filter(b => b.wardId === ward.id);
              const occupiedCount = wardBeds.filter(b => b.status === 'OCCUPIED').length;
              return (
                <div key={ward.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{ward.name}</h4>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold text-[10px]">
                          {ward.wardType} • {ward.gender}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Floor: {ward.floorNumber} • Daily Rate: ${ward.dailyRate}/day</p>
                    </div>

                    <div className="text-xs font-bold text-slate-700">
                      Occupancy: <strong className="text-purple-700">{occupiedCount}</strong> / {wardBeds.length} Beds
                    </div>
                  </div>

                  {/* Bed Tiles Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {wardBeds.map((bed) => {
                      const isOccupied = bed.status === 'OCCUPIED';
                      const isCleaning = bed.status === 'CLEANING';
                      return (
                        <div
                          key={bed.id}
                          className={`p-3.5 rounded-xl border transition-all text-center space-y-1.5 ${
                            isOccupied
                              ? 'bg-red-50/80 border-red-200 text-red-950'
                              : isCleaning
                              ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                              : 'bg-emerald-50/80 border-emerald-200 text-emerald-950 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <Bed className={`w-4 h-4 ${isOccupied ? 'text-red-600' : 'text-emerald-600'}`} />
                            <span className="font-bold text-xs">{bed.bedNumber}</span>
                          </div>

                          <div className="text-[10px] font-semibold uppercase">
                            {bed.status}
                          </div>

                          {isOccupied && bed.currentPatientName && (
                            <div className="text-[10px] font-bold text-red-800 truncate pt-1 border-t border-red-200/60">
                              {bed.currentPatientName}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Active Inpatient Roster */}
      {activeTab === 'ADMISSIONS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {activeAdmissions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Users className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No active inpatient admissions</p>
              <p className="text-xs text-slate-400">Patients admitted to wards will be listed here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="px-5 py-3">Patient / MRN</th>
                    <th className="px-4 py-3">Ward & Bed</th>
                    <th className="px-4 py-3">Admitted Date</th>
                    <th className="px-4 py-3">Diagnosis</th>
                    <th className="px-4 py-3">Attending Doctor</th>
                    <th className="px-5 py-3 text-right">Care Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {activeAdmissions.map((adm) => (
                    <tr key={adm.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{adm.patientName}</div>
                        <div className="text-[10px] text-blue-600 font-mono">{adm.mrn}</div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-purple-900">
                        {adm.wardName} - {adm.bedNumber}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-700">
                        {new Date(adm.admissionDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5 text-slate-800 max-w-[180px] truncate">{adm.diagnosis}</td>
                      <td className="px-4 py-3.5 text-slate-700">{adm.admittingDoctorName}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setActiveAdmissionForNursing(adm);
                              setIsNursingModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-semibold"
                          >
                            Vitals Note
                          </button>
                          <button
                            onClick={() => {
                              setActiveAdmissionForMar(adm);
                              setIsMarModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-[11px] font-semibold"
                          >
                            MAR Drug
                          </button>
                          <button
                            onClick={() => setDischargeAdmission(adm)}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-semibold"
                          >
                            Discharge
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Nursing Care Progress Logs */}
      {activeTab === 'NURSING' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3">Time / Patient</th>
                  <th className="px-4 py-3">Shift</th>
                  <th className="px-4 py-3">Blood Pressure</th>
                  <th className="px-4 py-3">Temp / HR / SpO2</th>
                  <th className="px-4 py-3">Nursing Progress Notes</th>
                  <th className="px-4 py-3">Nurse on Duty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {nursingRecords.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{n.patientName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{n.mrn} • {new Date(n.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-800">{n.shift}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{n.vitals.bloodPressure}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-700">
                      {n.vitals.temperatureCelsius}°C • {n.vitals.heartRateBpm}bpm • {n.vitals.oxygenSaturationSpo2}%
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 max-w-[240px] truncate">{n.careNotes}</td>
                    <td className="px-4 py-3.5 text-slate-800">{n.nurseName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: MAR (Medication Administration Record) */}
      {activeTab === 'MAR' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3">Administered At / Patient</th>
                  <th className="px-4 py-3">Medicine & Dosage</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Administered By</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Clinical Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {medAdministrations.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{m.patientName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{m.mrn} • {new Date(m.administeredAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{m.medicineName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{m.dosage}</div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-purple-700">{m.route}</td>
                    <td className="px-4 py-3.5 text-slate-800">{m.administeredByNurseName}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 max-w-[200px] truncate">{m.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Ward Units Configuration */}
      {activeTab === 'WARDS_CONFIG' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3">Ward Name</th>
                  <th className="px-4 py-3">Ward Type</th>
                  <th className="px-4 py-3">Gender / Floor</th>
                  <th className="px-4 py-3">Daily Rate</th>
                  <th className="px-4 py-3">Total Beds</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {wards.map((w) => {
                  const count = beds.filter(b => b.wardId === w.id).length;
                  return (
                    <tr key={w.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5 font-bold text-slate-900">{w.name}</td>
                      <td className="px-4 py-3.5 text-slate-800">{w.wardType}</td>
                      <td className="px-4 py-3.5 text-slate-700">{w.gender} • {w.floorNumber}</td>
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">${w.dailyRate}/day</td>
                      <td className="px-4 py-3.5 font-mono font-bold text-purple-700">{count} Beds</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                          OPERATIONAL
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Direct Inpatient Admission */}
      {isAdmitModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Admit Patient to Ward</h3>
              <button onClick={() => setIsAdmitModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDirectAdmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Select Patient *</label>
                <select
                  value={admitPatientId}
                  onChange={(e) => setAdmitPatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.fullName} ({p.mrn})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Select Ward *</label>
                  <select
                    value={admitWardId}
                    onChange={(e) => setAdmitWardId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  >
                    {wards.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.wardType})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Available Bed</label>
                  <select
                    value={admitBedId}
                    onChange={(e) => setAdmitBedId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="">Auto-Assign Bed</option>
                    {availableBeds.map(b => (
                      <option key={b.id} value={b.id}>{b.bedNumber} ({b.bedType})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Admitting Diagnosis *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute Appendicitis / Post-operative Recovery"
                  value={admitDiagnosis}
                  onChange={(e) => setAdmitDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Reason for Admission</label>
                <textarea
                  rows={2}
                  placeholder="Clinical indication for 24-hour observation and IV therapy..."
                  value={admitReason}
                  onChange={(e) => setAdmitReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdmitModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Admitting...' : 'Confirm Admission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Ward */}
      {isAddWardModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Create Inpatient Ward</h3>
              <button onClick={() => setIsAddWardModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWard} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Ward Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. St. Luke Surgical Wing"
                  value={newWardName}
                  onChange={(e) => setNewWardName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Ward Type</label>
                  <select
                    value={newWardType}
                    onChange={(e) => setNewWardType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="GENERAL">GENERAL</option>
                    <option value="ICU">ICU</option>
                    <option value="HDU">HDU</option>
                    <option value="PEDIATRIC">PEDIATRIC</option>
                    <option value="MATERNITY">MATERNITY</option>
                    <option value="SURGICAL">SURGICAL</option>
                    <option value="ISOLATION">ISOLATION</option>
                    <option value="VIP">VIP SUITE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Gender</label>
                  <select
                    value={newWardGender}
                    onChange={(e) => setNewWardGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="MIXED">MIXED</option>
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                    <option value="PEDIATRIC">PEDIATRIC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Floor / Wing</label>
                  <input
                    type="text"
                    value={newWardFloor}
                    onChange={(e) => setNewWardFloor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Daily Bed Rate ($)</label>
                  <input
                    type="number"
                    value={newWardRate}
                    onChange={(e) => setNewWardRate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddWardModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Create Ward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Bed */}
      {isAddBedModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Register Bed</h3>
              <button onClick={() => setIsAddBedModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBed} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Assign to Ward *</label>
                <select
                  value={targetWardId}
                  onChange={(e) => setTargetWardId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                >
                  {wards.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Bed Number / Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bed-104"
                    value={newBedNumber}
                    onChange={(e) => setNewBedNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Bed Type</label>
                  <select
                    value={newBedType}
                    onChange={(e) => setNewBedType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="STANDARD">STANDARD</option>
                    <option value="ICU">ICU ELECTRIC</option>
                    <option value="ELECTRIC">ELECTRIC ADJUSTABLE</option>
                    <option value="PEDIATRIC_COT">PEDIATRIC COT</option>
                    <option value="INCUBATOR">INCUBATOR</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddBedModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Register Bed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nursing Vitals Note */}
      {isNursingModalOpen && activeAdmissionForNursing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Log Nursing Progress & Vitals</h3>
                <p className="text-xs text-slate-500">Patient: <strong className="text-slate-800">{activeAdmissionForNursing.patientName}</strong> ({activeAdmissionForNursing.bedNumber})</p>
              </div>
              <button onClick={() => setIsNursingModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNursingNote} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Nursing Shift</label>
                <select
                  value={nurseShift}
                  onChange={(e) => setNurseShift(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                >
                  <option value="MORNING">MORNING SHIFT</option>
                  <option value="AFTERNOON">AFTERNOON SHIFT</option>
                  <option value="NIGHT">NIGHT SHIFT</option>
                </select>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-slate-500 text-[10px] mb-1">BP (mmHg)</label>
                  <input
                    type="text"
                    value={nurseBP}
                    onChange={(e) => setNurseBP(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] mb-1">Temp (°C)</label>
                  <input
                    type="text"
                    value={nurseTemp}
                    onChange={(e) => setNurseTemp(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] mb-1">HR (bpm)</label>
                  <input
                    type="text"
                    value={nurseHR}
                    onChange={(e) => setNurseHR(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] mb-1">SpO2 (%)</label>
                  <input
                    type="text"
                    value={nurseSpO2}
                    onChange={(e) => setNurseSpO2(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Nursing Care Notes & Observations</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Patient oral intake adequate, surgical wound dry, IV cannula patent..."
                  value={nursingNotes}
                  onChange={(e) => setNursingNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNursingModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Nursing Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: MAR (Medication Administration) */}
      {isMarModalOpen && activeAdmissionForMar && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Record Inpatient Medication (MAR)</h3>
                <p className="text-xs text-slate-500">Patient: <strong className="text-slate-800">{activeAdmissionForMar.patientName}</strong></p>
              </div>
              <button onClick={() => setIsMarModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMar} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Medication Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ceftriaxone / Tramadol"
                  value={marDrugName}
                  onChange={(e) => setMarDrugName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Dosage</label>
                  <input
                    type="text"
                    value={marDosage}
                    onChange={(e) => setMarDosage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Administration Route</label>
                  <select
                    value={marRoute}
                    onChange={(e) => setMarRoute(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="IV">IV (Intravenous)</option>
                    <option value="IM">IM (Intramuscular)</option>
                    <option value="ORAL">ORAL</option>
                    <option value="SC">SC (Subcutaneous)</option>
                    <option value="TOPICAL">TOPICAL</option>
                    <option value="INHALATION">INHALATION</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Nurse Signature / Remarks</label>
                <input
                  type="text"
                  value={marNotes}
                  onChange={(e) => setMarNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMarModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Record MAR Administration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Patient Discharge */}
      {dischargeAdmission && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Clinical Discharge Summary</h3>
                <p className="text-xs text-slate-500">Patient: <strong className="text-slate-800">{dischargeAdmission.patientName}</strong> ({dischargeAdmission.mrn})</p>
              </div>
              <button onClick={() => setDischargeAdmission(null)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDischargePatient} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Discharge Summary *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Clinical recovery notes, condition on discharge, resolved issues..."
                  value={dischargeSummary}
                  onChange={(e) => setDischargeSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Discharge & Home Care Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Wound dressing instructions, activity restrictions, return to clinic date..."
                  value={dischargeInstructions}
                  onChange={(e) => setDischargeInstructions(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-[11px] text-purple-900">
                ✓ Releasing this bed ({dischargeAdmission.bedNumber}) back to AVAILABLE status automatically.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDischargeAdmission(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Authorize Discharge & Clear Bed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
