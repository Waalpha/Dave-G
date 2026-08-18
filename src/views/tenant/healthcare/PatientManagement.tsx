import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Patient, PatientStatus, Gender, BloodGroup, QueueEntry } from '../../../types';
import {
  Users, UserPlus, Search, Filter, Phone, Mail, MapPin, Heart, AlertTriangle,
  FileText, Calendar, Plus, Clock, ChevronRight, CheckCircle2, XCircle, Stethoscope,
  Activity, Bed, DollarSign, Shield
} from 'lucide-react';

interface PatientManagementProps {
  onSelectPatient?: (patient: Patient) => void;
  onQuickConsult?: (patient: Patient) => void;
  onQuickTriage?: (patient: Patient) => void;
  onQuickAdmit?: (patient: Patient) => void;
  onQuickBill?: (patient: Patient) => void;
}

export const PatientManagement: React.FC<PatientManagementProps> = ({
  onSelectPatient,
  onQuickConsult,
  onQuickTriage,
  onQuickAdmit,
  onQuickBill
}) => {
  const { tenant } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [genderFilter, setGenderFilter] = useState<string>('ALL');

  // Registration Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState<Patient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<Gender>('MALE');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [address, setAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O_POSITIVE');
  const [allergies, setAllergies] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');

  const getHeaders = () => ({
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/app/hospital/patients', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setPatients(data.patients || []);
      }
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    try {
      setIsSubmitting(true);
      const payload = {
        fullName: fullName.trim(),
        gender,
        dateOfBirth: dateOfBirth || '1990-01-01',
        phone: phone.trim(),
        email: email.trim(),
        nationalId: nationalId.trim(),
        address: address.trim(),
        bloodGroup,
        allergies: allergies ? allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
        chronicConditions: chronicConditions ? chronicConditions.split(',').map(s => s.trim()).filter(Boolean) : [],
        emergencyContact: emergencyContactName ? {
          name: emergencyContactName,
          phone: emergencyContactPhone,
          relationship: emergencyContactRelation
        } : undefined,
        insurance: insuranceProvider ? {
          provider: insuranceProvider,
          policyNumber: insurancePolicyNumber,
          isPrimary: true
        } : undefined
      };

      const res = await fetch('/api/app/hospital/patients', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsRegisterModalOpen(false);
        resetForm();
        fetchPatients();
      }
    } catch (err) {
      console.error('Failed to register patient:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFullName('');
    setGender('MALE');
    setDateOfBirth('');
    setPhone('');
    setEmail('');
    setNationalId('');
    setAddress('');
    setBloodGroup('O_POSITIVE');
    setAllergies('');
    setChronicConditions('');
    setEmergencyContactName('');
    setEmergencyContactPhone('');
    setEmergencyContactRelation('');
    setInsuranceProvider('');
    setInsurancePolicyNumber('');
  };

  const handleSendToQueue = async (patient: Patient, department = 'OPD_TRIAGE', priority = 'NORMAL') => {
    try {
      const res = await fetch('/api/app/hospital/queues', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          patientId: patient.id,
          patientName: patient.fullName,
          mrn: patient.mrn,
          department,
          priority,
          status: 'WAITING'
        })
      });
      if (res.ok) {
        alert(`${patient.fullName} (${patient.mrn}) queued to ${department}.`);
      }
    } catch (err) {
      console.error('Error queuing patient:', err);
    }
  };

  const filteredPatients = patients.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.fullName.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      (p.phone && p.phone.includes(q)) ||
      (p.nationalId && p.nationalId.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesGender = genderFilter === 'ALL' || p.gender === genderFilter;

    return matchesSearch && matchesStatus && matchesGender;
  });

  return (
    <div className="space-y-6">
      {/* Top Action & Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Master Patient Index & Records</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {patients.length} registered patients under {tenant?.name || 'this facility'}
          </p>
        </div>

        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Patient Name, MRN #, Phone, National ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="OUTPATIENT">Outpatient</option>
            <option value="INPATIENT">Inpatient (Admitted)</option>
            <option value="EMERGENCY">Emergency</option>
            <option value="DISCHARGED">Discharged</option>
          </select>

          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Genders</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Patient List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading patient directory...</div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No patient records found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery ? 'No patients matching your search criteria.' : 'Start by registering your first patient to begin admissions, triage, and consultations.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Patient / MRN</th>
                  <th className="px-4 py-3">Demographics</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Medical Summary</th>
                  <th className="px-4 py-3">Insurance / Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{p.fullName}</div>
                      <div className="text-[11px] font-mono text-blue-600">{p.mrn}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-slate-800 capitalize">{p.gender.toLowerCase()}</div>
                      <div className="text-[11px] text-slate-400">DOB: {p.dateOfBirth}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 text-slate-700">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{p.phone || 'N/A'}</span>
                      </div>
                      {p.email && <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{p.email}</div>}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-[10px] font-bold">
                          {p.bloodGroup.replace('_', ' ')}
                        </span>
                        {p.allergies && p.allergies.length > 0 && (
                          <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-medium" title={p.allergies.join(', ')}>
                            {p.allergies.length} Allergies
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'INPATIENT' ? 'bg-purple-100 text-purple-800' :
                          p.status === 'EMERGENCY' ? 'bg-red-100 text-red-800' :
                          p.status === 'DISCHARGED' ? 'bg-slate-100 text-slate-600' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {p.status}
                        </span>
                        {p.insurance?.provider && (
                          <div className="text-[10px] text-slate-500 font-medium truncate max-w-[130px]">
                            {p.insurance.provider}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPatientDetails(p)}
                          title="View Full EMR Profile"
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendToQueue(p, 'OPD_TRIAGE', 'NORMAL')}
                          title="Send to Triage Queue"
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Queue
                        </button>
                        {onQuickConsult && (
                          <button
                            onClick={() => onQuickConsult(p)}
                            title="Start Consultation"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Stethoscope className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient Profile View Modal */}
      {selectedPatientDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-6 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{selectedPatientDetails.fullName}</h3>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-xs font-bold">
                    {selectedPatientDetails.mrn}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Registered: {new Date(selectedPatientDetails.createdAt).toLocaleDateString()} • Status: <strong className="text-slate-800">{selectedPatientDetails.status}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedPatientDetails(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <span className="font-bold text-slate-900">Demographics</span>
                <p className="text-slate-600">Gender: <strong className="text-slate-800">{selectedPatientDetails.gender}</strong></p>
                <p className="text-slate-600">Date of Birth: <strong className="text-slate-800">{selectedPatientDetails.dateOfBirth}</strong></p>
                <p className="text-slate-600">National ID / Passport: <strong className="text-slate-800">{selectedPatientDetails.nationalId || 'N/A'}</strong></p>
                <p className="text-slate-600">Address: <strong className="text-slate-800">{selectedPatientDetails.address || 'N/A'}</strong></p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <span className="font-bold text-slate-900">Clinical Background</span>
                <p className="text-slate-600">Blood Group: <strong className="text-red-600 font-bold">{selectedPatientDetails.bloodGroup.replace('_', ' ')}</strong></p>
                <p className="text-slate-600">Allergies: <strong className="text-amber-700">{selectedPatientDetails.allergies?.join(', ') || 'No known drug allergies (NKDA)'}</strong></p>
                <p className="text-slate-600">Chronic Conditions: <strong className="text-slate-800">{selectedPatientDetails.chronicConditions?.join(', ') || 'None recorded'}</strong></p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <span className="font-bold text-slate-900">Emergency Contact (Next of Kin)</span>
                <p className="text-slate-600">Name: <strong className="text-slate-800">{selectedPatientDetails.emergencyContact?.name || 'N/A'}</strong></p>
                <p className="text-slate-600">Relation: <strong className="text-slate-800">{selectedPatientDetails.emergencyContact?.relationship || 'N/A'}</strong></p>
                <p className="text-slate-600">Phone: <strong className="text-slate-800">{selectedPatientDetails.emergencyContact?.phone || 'N/A'}</strong></p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <span className="font-bold text-slate-900">Insurance & Billing</span>
                <p className="text-slate-600">Provider: <strong className="text-slate-800">{selectedPatientDetails.insurance?.provider || 'Self Pay (Cash)'}</strong></p>
                <p className="text-slate-600">Policy / Member #: <strong className="text-slate-800">{selectedPatientDetails.insurance?.policyNumber || 'N/A'}</strong></p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  handleSendToQueue(selectedPatientDetails, 'EMERGENCY', 'EMERGENCY');
                  setSelectedPatientDetails(null);
                }}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Send to Emergency
              </button>
              <button
                onClick={() => {
                  handleSendToQueue(selectedPatientDetails, 'OPD_TRIAGE', 'NORMAL');
                  setSelectedPatientDetails(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Send to Triage Station
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Register New Patient</h3>
                <p className="text-xs text-slate-500">Generates unique Medical Record Number (MRN) under {tenant?.name}</p>
              </div>
              <button onClick={() => setIsRegisterModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterPatient} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Full Patient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Mwangi"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Gender *</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as Gender)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+254 712 345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">National ID / Passport</label>
                  <input
                    type="text"
                    placeholder="e.g. 32984712"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                  <label className="block text-slate-700 font-medium mb-1">Physical Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Kilimani, Nairobi"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Clinical Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Known Drug Allergies (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Aspirin, Sulfa"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Chronic Conditions (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Hypertension, Type 2 Diabetes, Asthma"
                    value={chronicConditions}
                    onChange={(e) => setChronicConditions(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Next of Kin & Insurance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Next of Kin Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Mwangi"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Next of Kin Phone</label>
                  <input
                    type="tel"
                    placeholder="+254 700 000000"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Relationship</label>
                  <input
                    type="text"
                    placeholder="Spouse / Parent / Sibling"
                    value={emergencyContactRelation}
                    onChange={(e) => setEmergencyContactRelation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Insurance Provider (Leave blank if Cash)</label>
                  <input
                    type="text"
                    placeholder="e.g. NHIF / SHA / Jubilee / Britam"
                    value={insuranceProvider}
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Insurance Policy / Card Number</label>
                  <input
                    type="text"
                    placeholder="e.g. JUB-9842104"
                    value={insurancePolicyNumber}
                    onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Register Patient & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
