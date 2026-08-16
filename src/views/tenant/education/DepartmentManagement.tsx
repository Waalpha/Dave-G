import React, { useState, useEffect } from 'react';
import { Department, Campus, LecturerStaff, EducationType, Program } from '../../../types';
import {
  Building2, Plus, Search, Filter, Edit, Trash2, CheckCircle2, XCircle,
  AlertCircle, Phone, Mail, User, Layers, ShieldCheck, ChevronRight, X, Info
} from 'lucide-react';

interface DepartmentManagementProps {
  educationType?: EducationType;
}

export const DepartmentManagement: React.FC<DepartmentManagementProps> = ({ educationType = 'TVET' }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [staffList, setStaffList] = useState<LecturerStaff[]>([]);
  const [programsList, setProgramsList] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [campusFilter, setCampusFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [viewingDept, setViewingDept] = useState<Department | null>(null);
  const [deleteDeptCandidate, setDeleteDeptCandidate] = useState<Department | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState('');

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCampusId, setFormCampusId] = useState('');
  const [formHodId, setFormHodId] = useState('');
  const [formHodManual, setFormHodManual] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [submitting, setSubmitting] = useState(false);

  const getHeaders = () => ({
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [resDepts, resAcad, resFac] = await Promise.all([
        fetch('/api/app/education/departments', { headers: getHeaders() }),
        fetch('/api/app/education/academics', { headers: getHeaders() }),
        fetch('/api/app/education/faculty', { headers: getHeaders() })
      ]);

      if (resDepts.ok) {
        const data = await resDepts.json();
        setDepartments(Array.isArray(data) ? data : []);
      }
      if (resAcad.ok) {
        const acad = await resAcad.json();
        if (acad.campuses) setCampuses(acad.campuses);
        if (acad.programs) setProgramsList(acad.programs);
      }
      if (resFac.ok) {
        const fac = await resFac.json();
        if (Array.isArray(fac)) setStaffList(fac);
      }
    } catch (err: any) {
      console.error('Error fetching departments:', err);
      setErrorMsg('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const resetForm = () => {
    setFormName('');
    setFormCode('');
    setFormCampusId('');
    setFormHodId('');
    setFormHodManual('');
    setFormDescription('');
    setFormPhone('');
    setFormEmail('');
    setFormStatus('ACTIVE');
    setEditingDept(null);
    setErrorMsg('');
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setFormName(dept.name);
    setFormCode(dept.code);
    setFormCampusId(dept.campusId || '');
    setFormHodId(dept.headOfDepartmentId || '');
    setFormHodManual(dept.headOfDepartmentName || dept.headOfDepartment || '');
    setFormDescription(dept.description || '');
    setFormPhone(dept.phone || '');
    setFormEmail(dept.email || '');
    setFormStatus(dept.status || 'ACTIVE');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) {
      setErrorMsg('Department Name and Department Code are required.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const payload = {
        name: formName.trim(),
        code: formCode.trim(),
        campusId: formCampusId,
        headOfDepartmentId: formHodId,
        headOfDepartmentName: formHodManual || (staffList.find(s => s.id === formHodId)?.fullName || ''),
        description: formDescription.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        status: formStatus
      };

      const url = editingDept
        ? `/api/app/education/departments/${editingDept.id}`
        : '/api/app/education/departments';

      const method = editingDept ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save department.');
      }

      setSuccessMsg(editingDept ? 'Department updated successfully!' : 'Department created successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsModalOpen(false);
      resetForm();
      fetchDepartments();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (dept: Department) => {
    const nextStatus = dept.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`/api/app/education/departments/${dept.id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: nextStatus })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to toggle status');
      }

      setSuccessMsg(`Department "${dept.name}" set to ${nextStatus}.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchDepartments();
    } catch (err: any) {
      alert(err.message || 'Failed to change status.');
    }
  };

  const handleDelete = async () => {
    if (!deleteDeptCandidate) return;
    setDeleteErrorMsg('');

    try {
      const res = await fetch(`/api/app/education/departments/${deleteDeptCandidate.id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      const data = await res.json();

      if (!res.ok) {
        setDeleteErrorMsg(data.error || 'Failed to delete department.');
        return;
      }

      setSuccessMsg(data.message || 'Department deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      setDeleteDeptCandidate(null);
      fetchDepartments();
    } catch (err: any) {
      setDeleteErrorMsg(err.message || 'Error occurred while deleting.');
    }
  };

  // Helper title based on Institution Type
  const getDeptSectionTitle = () => {
    switch (educationType) {
      case 'UNIVERSITY':
        return 'Faculties & Academic Departments';
      case 'TVET':
        return 'Technical & TVET Departments';
      case 'VOCATIONAL_TRAINING':
        return 'Vocational Trade Divisions & Departments';
      case 'SECONDARY_SCHOOL':
      case 'PRIMARY_SCHOOL':
        return 'Academic Subject Departments & Panels';
      case 'COLLEGE':
      default:
        return 'Academic Departments & Divisions';
    }
  };

  // Filtered Departments
  const filteredDepartments = departments.filter(d => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.headOfDepartmentName && d.headOfDepartmentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.email && d.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const matchesCampus = campusFilter === 'ALL' || d.campusId === campusFilter;

    return matchesSearch && matchesStatus && matchesCampus;
  });

  const activeCount = departments.filter(d => d.status === 'ACTIVE').length;
  const inactiveCount = departments.filter(d => d.status === 'INACTIVE').length;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-[11px] font-semibold uppercase tracking-wider">
              {educationType.replace('_', ' ')} MODULE
            </span>
            <span className="text-slate-400 text-xs">• Shared ERP Feature</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mt-1.5 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-400" />
            <span>{getDeptSectionTitle()}</span>
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Manage your institution's departments, academic divisions, code allocations, and head of department assignments with strict tenant data isolation.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center space-x-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Department</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Total Departments</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{departments.length}</span>
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-[11px] text-slate-500">Configured for this tenant</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Active Departments</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-700">{activeCount}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">Operational status</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Inactive Departments</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-600">{inactiveCount}</span>
            <XCircle className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-[11px] text-slate-500">Deactivated/Archived</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs space-y-1">
          <span className="text-xs font-medium text-slate-500">Academic Programs</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-indigo-700">{programsList.length}</span>
            <Layers className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-[11px] text-indigo-600 font-medium">Linked under departments</p>
        </div>
      </div>

      {/* Action Bar (Search & Filters) */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by department name, code, HOD or email..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-hidden cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>

          {/* Campus Filter */}
          {campuses.length > 0 && (
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
              <span className="text-slate-500 font-medium text-[11px]">Campus:</span>
              <select
                value={campusFilter}
                onChange={e => setCampusFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 outline-hidden cursor-pointer"
              >
                <option value="ALL">All Campuses</option>
                {campuses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Departments Table / Grid */}
      {loading ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-xl space-y-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading department records...</p>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-xl space-y-3">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-800">No Departments Found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'ALL' || campusFilter !== 'ALL'
              ? 'No departments match your search or filter criteria.'
              : 'No departments have been created for this institution yet.'}
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 inline-flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Department</span>
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Code & Department Name</th>
                  <th className="py-3 px-4">Head of Department</th>
                  <th className="py-3 px-4">Campus / Contact</th>
                  <th className="py-3 px-4">Linked Programs</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {filteredDepartments.map(dept => {
                  const linkedProgs = programsList.filter(p => p.departmentId === dept.id);
                  const linkedStaff = staffList.filter(s => s.departmentId === dept.id);

                  return (
                    <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-start space-x-3">
                          <span className="px-2 py-1 bg-slate-900 text-slate-100 rounded text-[11px] font-mono font-bold shrink-0 mt-0.5">
                            {dept.code}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{dept.name}</p>
                            {dept.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-1 max-w-md mt-0.5">
                                {dept.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-xs">
                              {dept.headOfDepartmentName || dept.headOfDepartment || 'Unassigned'}
                            </p>
                            <p className="text-[10px] text-slate-400">Head of Dept</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 space-y-0.5">
                        <p className="font-medium text-slate-800 text-xs">
                          {dept.campusName || 'Institution-Wide'}
                        </p>
                        <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                          {dept.phone && (
                            <span className="flex items-center space-x-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{dept.phone}</span>
                            </span>
                          )}
                          {dept.email && (
                            <span className="flex items-center space-x-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{dept.email}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-md font-semibold text-[11px]">
                          {linkedProgs.length} Program(s)
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{linkedStaff.length} Faculty Staff</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(dept)}
                          title="Click to toggle status"
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center space-x-1 cursor-pointer transition-all ${
                            dept.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {dept.status === 'ACTIVE' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-500" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setViewingDept(dept)}
                          className="px-2 py-1 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded text-[11px] font-semibold transition-all cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openEditModal(dept)}
                          className="px-2 py-1 text-blue-700 hover:bg-blue-50 rounded text-[11px] font-semibold transition-all cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDeleteDeptCandidate(dept);
                            setDeleteErrorMsg('');
                          }}
                          className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded text-[11px] font-semibold transition-all cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT DEPARTMENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">
                  {editingDept ? 'Edit Department' : 'Create New Department'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1 space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ICT"
                    value={formCode}
                    onChange={e => setFormCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                  />
                  <p className="text-[10px] text-slate-400">Unique per tenant</p>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Department Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Information & Communication Technology"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Campus (Optional)
                  </label>
                  <select
                    value={formCampusId}
                    onChange={e => setFormCampusId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden cursor-pointer"
                  >
                    <option value="">-- Institution-Wide --</option>
                    {campuses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden cursor-pointer"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Head of Department (Staff Assignment)
                </label>
                {staffList.length > 0 ? (
                  <select
                    value={formHodId}
                    onChange={e => {
                      setFormHodId(e.target.value);
                      const selected = staffList.find(s => s.id === e.target.value);
                      if (selected) setFormHodManual(selected.fullName);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden cursor-pointer"
                  >
                    <option value="">-- Select Lecturer / Staff --</option>
                    {staffList.map(s => (
                      <option key={s.id} value={s.id}>{s.fullName} ({s.designation || 'Lecturer'})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter Head of Department Name (e.g. Dr. Jane Doe)"
                    value={formHodManual}
                    onChange={e => setFormHodManual(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Contact Phone (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="+254 700 000 000"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Official Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="dept@institution.ac.ke"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Description / Academic Objectives
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide a brief description of academic goals, programs, or courses under this department..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-500 transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs"
                >
                  {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{editingDept ? 'Save Changes' : 'Create Department'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW DETAILS */}
      {viewingDept && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Department Profile</h3>
              </div>
              <button
                onClick={() => setViewingDept(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="px-2 py-0.5 bg-slate-900 text-slate-100 rounded text-[11px] font-mono font-bold">
                    {viewingDept.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{viewingDept.name}</h3>
                  <p className="text-slate-500 text-xs">{viewingDept.campusName || 'Institution-Wide Campus'}</p>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  viewingDept.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}>
                  {viewingDept.status}
                </span>
              </div>

              {viewingDept.description && (
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</span>
                  <p className="text-slate-700 leading-relaxed">{viewingDept.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Head of Department</span>
                  <p className="font-bold text-slate-900">{viewingDept.headOfDepartmentName || viewingDept.headOfDepartment || 'Unassigned'}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contact Info</span>
                  <p className="text-slate-800">{viewingDept.email || 'No email provided'}</p>
                  <p className="text-slate-800">{viewingDept.phone || 'No phone provided'}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setViewingDept(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION & SAFETY WARNING */}
      {deleteDeptCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-rose-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-rose-300" />
                <h3 className="font-bold text-sm">Delete Department Confirmation</h3>
              </div>
              <button
                onClick={() => setDeleteDeptCandidate(null)}
                className="text-rose-300 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-700">
                Are you sure you want to delete the department <strong className="text-slate-900">{deleteDeptCandidate.name} ({deleteDeptCandidate.code})</strong>?
              </p>

              {deleteErrorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl space-y-2">
                  <div className="flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs">Delete Protected by System Safety Rule</p>
                      <p className="mt-1 leading-normal text-[11px]">{deleteErrorMsg}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleToggleStatus(deleteDeptCandidate);
                      setDeleteDeptCandidate(null);
                    }}
                    className="w-full mt-2 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-500 transition-all cursor-pointer"
                  >
                    Deactivate Department Instead
                  </button>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  onClick={() => setDeleteDeptCandidate(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                {!deleteErrorMsg && (
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-500 transition-all cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
