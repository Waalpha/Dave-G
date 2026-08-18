import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  Activity, Users, Stethoscope, Pill, FlaskConical, Bed, DollarSign,
  Truck, Droplet, Heart, UserPlus, Clock, AlertTriangle, ShieldCheck,
  CheckCircle2, Calendar, FileText, ShoppingBag, Eye, ShieldAlert,
  ArrowUpRight, RefreshCw, Plus, Building
} from 'lucide-react';
import { PatientManagement } from './PatientManagement';
import { TriageQueueManagement } from './TriageQueueManagement';
import { ConsultationEmrView } from './ConsultationEmrView';
import { PharmacyManagement } from './PharmacyManagement';
import { LaboratoryRadiologyView } from './LaboratoryRadiologyView';
import { InpatientWardView } from './InpatientWardView';
import { TheatreSurgeryView } from './TheatreSurgeryView';
import { MedicalBillingView } from './MedicalBillingView';
import { AmbulanceBloodMortuaryView } from './AmbulanceBloodMortuaryView';
import { Patient } from '../../../types';

type HealthcareTab =
  | 'OVERVIEW'
  | 'PATIENTS'
  | 'TRIAGE'
  | 'CONSULTATION'
  | 'PHARMACY'
  | 'LAB_RADIO'
  | 'WARDS'
  | 'THEATRE'
  | 'BILLING'
  | 'ANCILLARY';

export const HealthcareDashboard: React.FC = () => {
  const { user, tenant } = useAuth();
  const [activeTab, setActiveTab] = useState<HealthcareTab>('OVERVIEW');
  const [selectedPatientForConsult, setSelectedPatientForConsult] = useState<string>('');
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isModuleEnabled = tenant?.modules?.includes('hospital') || tenant?.subscription?.plan === 'ENTERPRISE';

  const getHeaders = () => ({
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchSummary = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/app/hospital/summary', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary || null);
      }
    } catch (err) {
      console.error('Failed to load healthcare summary:', err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleStartConsultationWithPatient = (patient: Patient) => {
    setSelectedPatientForConsult(patient.id);
    setActiveTab('CONSULTATION');
  };

  const handleRouteQueueToConsult = (patientId: string) => {
    setSelectedPatientForConsult(patientId);
    setActiveTab('CONSULTATION');
  };

  if (!isModuleEnabled) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Activity className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Healthcare Module Inactive</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              The Hospital & Healthcare Management System is not enabled for <strong>{tenant?.name}</strong>.
            </p>
          </div>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Contact Tenant Administrator to enable Hospital vertical in Organization Settings</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Main Healthcare App Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Hospital & Clinical ERP</h1>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold">
                PROD v2.4
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Facility: <strong className="text-slate-800">{tenant?.name}</strong> • Isolated Tenant Environment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSummary}
            disabled={isRefreshing}
            className="p-2 text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setActiveTab('PATIENTS')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Patient</span>
          </button>
        </div>
      </div>

      {/* Navigation Department Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'OVERVIEW'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Central Command</span>
        </button>

        <button
          onClick={() => setActiveTab('PATIENTS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'PATIENTS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Patients (MPI)</span>
        </button>

        <button
          onClick={() => setActiveTab('TRIAGE')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'TRIAGE'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Triage & Queues</span>
        </button>

        <button
          onClick={() => setActiveTab('CONSULTATION')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'CONSULTATION'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Doctor EMR Room</span>
        </button>

        <button
          onClick={() => setActiveTab('PHARMACY')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'PHARMACY'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Pharmacy & Drugs</span>
        </button>

        <button
          onClick={() => setActiveTab('LAB_RADIO')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'LAB_RADIO'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Lab & Radiology</span>
        </button>

        <button
          onClick={() => setActiveTab('WARDS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'WARDS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Bed className="w-4 h-4" />
          <span>Wards & Inpatient</span>
        </button>

        <button
          onClick={() => setActiveTab('THEATRE')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'THEATRE'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4 text-rose-500" />
          <span>Theatre & Surgery</span>
        </button>

        <button
          onClick={() => setActiveTab('BILLING')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'BILLING'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Billing & Claims</span>
        </button>

        <button
          onClick={() => setActiveTab('ANCILLARY')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ANCILLARY'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Emergency & Blood</span>
        </button>
      </div>

      {/* Main Tab Content Switching */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Executive Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Patients (MPI)</span>
              <div className="text-xl font-bold font-mono text-slate-900">
                {summary?.totalPatients || 0}
              </div>
              <span className="text-[10px] text-blue-600 font-semibold">Registered</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Queue Waiting</span>
              <div className="text-xl font-bold font-mono text-amber-600">
                {summary?.activeQueueCount || 0}
              </div>
              <span className="text-[10px] text-amber-600 font-semibold">OPD & Triage</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Inpatients</span>
              <div className="text-xl font-bold font-mono text-purple-600">
                {summary?.activeInpatients || 0}
              </div>
              <span className="text-[10px] text-purple-600 font-semibold">Admitted</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Available Beds</span>
              <div className="text-xl font-bold font-mono text-emerald-600">
                {summary?.availableBeds || 0}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">Ready</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Pending Rx</span>
              <div className="text-xl font-bold font-mono text-amber-700">
                {summary?.pendingPrescriptions || 0}
              </div>
              <span className="text-[10px] text-amber-700 font-semibold">Pharmacy</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Lab Orders</span>
              <div className="text-xl font-bold font-mono text-blue-600">
                {summary?.pendingLabRequests || 0}
              </div>
              <span className="text-[10px] text-blue-600 font-semibold">Pending Specimen</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Surgeries Today</span>
              <div className="text-xl font-bold font-mono text-rose-600">
                {summary?.theatreBookingsToday || 0}
              </div>
              <span className="text-[10px] text-rose-600 font-semibold">OT Suites</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Today's Revenue</span>
              <div className="text-xl font-bold font-mono text-slate-900">
                ${summary?.todayRevenue || 0}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">Billed</span>
            </div>
          </div>

          {/* Quick Department Shortcuts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveTab('TRIAGE')}
              className="p-5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-xs text-left transition-all group cursor-pointer space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Nurse Triage & Vitals</div>
                <p className="text-xs text-slate-500 mt-0.5">Record blood pressure, pulse, SpO2, and acuity categorization</p>
              </div>
              <div className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                <span>Go to Triage Station</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </button>

            <button
              onClick={() => setActiveTab('CONSULTATION')}
              className="p-5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-xs text-left transition-all group cursor-pointer space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Physician EMR Room</div>
                <p className="text-xs text-slate-500 mt-0.5">Clinical notes, ICD-10 diagnosis, investigations, and e-Rx</p>
              </div>
              <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <span>Open Consultation Room</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </button>

            <button
              onClick={() => setActiveTab('PHARMACY')}
              className="p-5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-xs text-left transition-all group cursor-pointer space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Pharmacy & Dispensing</div>
                <p className="text-xs text-slate-500 mt-0.5">Verify doctor prescriptions, stock batches, and calculate billing</p>
              </div>
              <div className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                <span>Manage Pharmacy</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </button>

            <button
              onClick={() => setActiveTab('WARDS')}
              className="p-5 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-xs text-left transition-all group cursor-pointer space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Wards & Inpatient Care</div>
                <p className="text-xs text-slate-500 mt-0.5">Live bed occupancy matrix, nursing care logs, MAR, and discharge</p>
              </div>
              <div className="text-xs font-semibold text-purple-600 flex items-center gap-1">
                <span>View Bed Matrix</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>

          {/* Quick Patient Registration & Master Index Preview */}
          <PatientManagement
            onQuickConsult={handleStartConsultationWithPatient}
          />
        </div>
      )}

      {activeTab === 'PATIENTS' && (
        <PatientManagement
          onQuickConsult={handleStartConsultationWithPatient}
        />
      )}

      {activeTab === 'TRIAGE' && (
        <TriageQueueManagement
          onRouteToConsultation={handleRouteQueueToConsult}
        />
      )}

      {activeTab === 'CONSULTATION' && (
        <ConsultationEmrView
          initialPatientId={selectedPatientForConsult}
        />
      )}

      {activeTab === 'PHARMACY' && (
        <PharmacyManagement />
      )}

      {activeTab === 'LAB_RADIO' && (
        <LaboratoryRadiologyView />
      )}

      {activeTab === 'WARDS' && (
        <InpatientWardView />
      )}

      {activeTab === 'THEATRE' && (
        <TheatreSurgeryView />
      )}

      {activeTab === 'BILLING' && (
        <MedicalBillingView />
      )}

      {activeTab === 'ANCILLARY' && (
        <AmbulanceBloodMortuaryView />
      )}
    </div>
  );
};
