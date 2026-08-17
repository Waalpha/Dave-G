import React, { useState, useEffect } from 'react';
import { LecturerStaff, Department, Campus } from '../../../types';
import {
  Award, Plus, Search, Edit, Trash2, CheckCircle2, AlertCircle,
  Phone, Mail, User, Building, Briefcase, GraduationCap, X, Check
} from 'lucide-react';

export const FacultyManagement: React.FC = () => {
  const [staffList, setStaffList] = useState<LecturerStaff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<LecturerStaff | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<LecturerStaff | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [staffNumber, setStaffNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('Lecturer');
  const [departmentId, setDepartmentId] = useState('');
  const [campusId, setCampusId] = useState('');
  const [qualification, setQualification] = useState('Master of Science');
  const [employmentType, setEmploymentType] = useState<'FULL_TIME' | 'PART_TIME' | 'ADJUNCT'>('FULL_TIME');
  const [status, setStatus] = useState<'ACTIVE' | 'ON_LEAVE' | 'RESIGNED'>('ACTIVE');
  const [submitting, setSubmitting] = useState(false);

  const getHeaders = () => ({
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [resFac, resDepts, resAcad] = await Promise.all([
        fetch('/api/app/education/faculty', { headers: getHeaders() }),
        fetch('/api/app/education/departments', { headers: getHeaders() }),
        fetch('/api/app/education/academics', { headers: getHeaders() })
      ]);

      if (resFac.ok) setStaffList(await resFac.json());
      if (resDepts.ok) setDepartments(await resDepts.json());
      if (resAcad.ok) {
        const acad = await resAcad.json();
        setCampuses(acad.campuses || []);
      }
    } catch (err: any) {
      console.error('Error loading faculty:', err);
      setErrorMsg('Failed to load faculty directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingStaff(null);
    setFullName('');
    setStaffNumber('');
    setEmail('');
    setPhone('');
    setDesignation('Lecturer');
    setDepartmentId(departments[0]?.id || '');
    setCampusId(campuses[0]?.id || '');
    setQualification('Master of Science');
    setEmploymentType('FULL_TIME');
    setStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const openEditModal = (s: LecturerStaff) => {
    setEditingStaff(s);
    setFullName(s.fullName);
    setStaffNumber(s.staffNumber || '');
    setEmail(s.email || '');
    setPhone(s.phone || '');
    setDesignation(s.designation);
    setDepartmentId(s.departmentId || '');
    setCampusId(s.campusId || '');
    setQualification(s.qualification || 'Master of Science');
    setEmploymentType((s.employmentType as any) || 'FULL_TIME');
    setStatus((s.status as any) || 'ACTIVE');
    setIsModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;
    try {
      setSubmitting(true);
      const dept = departments.find(d => d.id === departmentId);
      const camp = campuses.find(c => c.id === campusId);

      const payload = {
        fullName: fullName.trim(),
        staffNumber: staffNumber.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        designation: designation.trim(),
        departmentId,
        departmentName: dept?.name || '',
        campusId,
        campusName: camp?.name || 'Main Campus',
        qualification: qualification.trim(),
        employmentType,
        status
      };

      const url = editingStaff
        ? `/api/app/education/faculty/${editingStaff.id}`
        : '/api/app/education/faculty';
      const method = editingStaff ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save staff record');

      setSuccessMsg(`Staff member "${fullName}" saved successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving staff');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!deleteCandidate) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/app/education/faculty/${deleteCandidate.id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setSuccessMsg(`Staff member "${deleteCandidate.fullName}" removed.`);
        setTimeout(() => setSuccessMsg(''), 4000);
        setDeleteCandidate(null);
        fetchData();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete staff member');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredStaff = staffList.filter(s => {
    const matchesSearch = !searchTerm.trim() ||
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.staffNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || s.departmentId === deptFilter;
    const matchesRole = roleFilter === 'ALL' || s.designation.toLowerCase().includes(roleFilter.toLowerCase());
    return matchesSearch && matchesDept && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span>Lecturers, Faculty & Academic Staff</span>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
                {filteredStaff.length} Members
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Faculty roster, departmental allocations, academic qualifications, and teaching loads.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, staff ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Designations</option>
              <option value="Dean">Dean / Principal</option>
              <option value="Head of Department">Head of Department (HOD)</option>
              <option value="Senior Lecturer">Senior Lecturer</option>
              <option value="Lecturer">Lecturer</option>
              <option value="Assistant Lecturer">Assistant Lecturer</option>
              <option value="Registrar">Registrar / Administrator</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map(f => (
          <div key={f.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 relative flex flex-col justify-between">
            <div>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-600 text-white font-bold text-sm rounded-full flex items-center justify-center shrink-0">
                  {f.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs truncate">{f.fullName}</h4>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(f)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteCandidate(f)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-blue-600 font-semibold truncate">{f.designation}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{f.staffNumber || 'No Staff ID'}</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-100 space-y-1 mt-3">
                <p className="flex items-center justify-between">
                  <span>Department:</span>
                  <strong className="text-slate-800">{f.departmentName || 'General'}</strong>
                </p>
                <p className="flex items-center justify-between">
                  <span>Qualification:</span>
                  <strong className="text-slate-800">{f.qualification || 'N/A'}</strong>
                </p>
                <p className="flex items-center justify-between">
                  <span>Campus:</span>
                  <strong className="text-slate-800">{f.campusName || 'Main'}</strong>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="truncate">{f.email}</span>
              <span className="shrink-0">{f.phone}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveStaff} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-slate-900">
              {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Catherine Njeri Kamau"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Staff / Payroll ID</label>
                  <input
                    type="text"
                    placeholder="e.g. STF-084"
                    value={staffNumber}
                    onChange={e => setStaffNumber(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Designation / Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Lecturer"
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    placeholder="c.kamau@institution.ac.ke"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+254 711 223 344"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Department</label>
                  <select
                    value={departmentId}
                    onChange={e => setDepartmentId(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Campus</label>
                  <select
                    value={campusId}
                    onChange={e => setCampusId(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    {campuses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Highest Academic Qualification</label>
                <input
                  type="text"
                  placeholder="e.g. PhD Computer Science, MSc Economics"
                  value={qualification}
                  onChange={e => setQualification(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
              >
                {submitting ? 'Saving...' : 'Save Staff Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteCandidate && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Delete Staff Record</h3>
            </div>
            <p className="text-slate-600">
              Are you sure you want to remove <strong>{deleteCandidate.fullName}</strong> ({deleteCandidate.designation})?
            </p>
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStaff}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-xs"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
