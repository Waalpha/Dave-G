import React, { useState, useEffect } from 'react';
import { LecturerStaff, Department, Campus } from '../../../types';
import {
  Award, Plus, Search, Edit, Trash2, CheckCircle2, AlertCircle,
  Phone, Mail, User, Building, Briefcase, GraduationCap, X, Check,
  LayoutGrid, List, Download, RefreshCw, Eye, ShieldCheck, CheckSquare,
  Square, Filter
} from 'lucide-react';

export const FacultyManagement: React.FC = () => {
  const [staffList, setStaffList] = useState<LecturerStaff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // View Layout
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Selection for bulk operations
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<LecturerStaff | null>(null);
  const [viewingStaff, setViewingStaff] = useState<LecturerStaff | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<LecturerStaff | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [staffNumber, setStaffNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('Class Teacher');
  const [departmentId, setDepartmentId] = useState('');
  const [campusId, setCampusId] = useState('');
  const [qualification, setQualification] = useState('Bachelor of Education (B.Ed)');
  const [specialization, setSpecialization] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [employmentType, setEmploymentType] = useState<'FULL_TIME' | 'PART_TIME' | 'CONTRACT'>('FULL_TIME');
  const [status, setStatus] = useState<'ACTIVE' | 'ON_LEAVE' | 'INACTIVE'>('ACTIVE');
  const [hireDate, setHireDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getHeaders = () => ({
    'x-tenant-id': localStorage.getItem('erp_tenant_id') || '',
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    Authorization: `Bearer ${localStorage.getItem('erp_token') || ''}`,
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

      if (resFac.ok) {
        const staff = await resFac.json();
        setStaffList(Array.isArray(staff) ? staff : []);
      }
      if (resDepts.ok) {
        const depts = await resDepts.json();
        setDepartments(Array.isArray(depts) ? depts : []);
      }
      if (resAcad.ok) {
        const acad = await resAcad.json();
        setCampuses(acad.campuses || []);
      }
    } catch (err: any) {
      console.error('Error loading faculty/staff:', err);
      setErrorMsg('Failed to load faculty and staff directory.');
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
    setStaffNumber(`STF-${Math.floor(100 + Math.random() * 900)}`);
    setEmail('');
    setPhone('');
    setDesignation('Class Teacher');
    setDepartmentId(departments[0]?.id || '');
    setCampusId(campuses[0]?.id || '');
    setQualification('Bachelor of Education (B.Ed)');
    setSpecialization('Languages / Mathematics');
    setNationalId('');
    setEmploymentType('FULL_TIME');
    setStatus('ACTIVE');
    setHireDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (s: LecturerStaff) => {
    setEditingStaff(s);
    setFullName(s.fullName || '');
    setStaffNumber(s.staffNumber || s.staffNo || '');
    setEmail(s.email || '');
    setPhone(s.phone || '');
    setDesignation(s.designation || 'Teacher');
    setDepartmentId(s.departmentId || '');
    setCampusId(s.campusId || '');
    setQualification(s.qualification || 'Bachelor of Education (B.Ed)');
    setSpecialization(s.specialization || '');
    setNationalId(s.nationalId || '');
    setEmploymentType((s.employmentType as any) || 'FULL_TIME');
    setStatus((s.status as any) || 'ACTIVE');
    setHireDate(s.hireDate || '');
    setIsModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Staff Full Name is required.');
      return;
    }
    try {
      setSubmitting(true);
      setErrorMsg('');
      const dept = departments.find(d => d.id === departmentId);
      const camp = campuses.find(c => c.id === campusId);

      const payload = {
        fullName: fullName.trim(),
        staffNo: staffNumber.trim() || undefined,
        staffNumber: staffNumber.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        designation: designation.trim(),
        departmentId: departmentId || '',
        departmentName: dept?.name || 'General Academic',
        campusId: campusId || '',
        campusName: camp?.name || 'Main Campus',
        qualification: qualification.trim(),
        specialization: specialization.trim(),
        nationalId: nationalId.trim(),
        employmentType,
        status,
        hireDate: hireDate || new Date().toISOString().split('T')[0]
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

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save staff record');
      }

      setSuccessMsg(`Staff member "${fullName}" ${editingStaff ? 'updated' : 'added'} successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!deleteCandidate) return;
    try {
      setIsDeleting(true);
      setErrorMsg('');
      const res = await fetch(`/api/app/education/faculty/${deleteCandidate.id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to delete staff member');
      }
      setSuccessMsg(`Staff member "${deleteCandidate.fullName}" deleted successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setDeleteCandidate(null);
      setSelectedStaffIds(prev => prev.filter(id => id !== deleteCandidate.id));
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete staff member');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStaffIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete the ${selectedStaffIds.length} selected staff member(s)?`)) {
      return;
    }
    try {
      setBulkDeleting(true);
      setErrorMsg('');
      const res = await fetch('/api/app/education/faculty/bulk-delete', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ staffIds: selectedStaffIds })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to delete selected staff members');
      }
      setSuccessMsg(`Successfully deleted ${selectedStaffIds.length} staff member(s).`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setSelectedStaffIds([]);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Bulk delete failed');
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleSelectStaff = (id: string) => {
    setSelectedStaffIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStaffIds.length === filteredStaff.length) {
      setSelectedStaffIds([]);
    } else {
      setSelectedStaffIds(filteredStaff.map(s => s.id));
    }
  };

  const exportStaffCSV = () => {
    if (filteredStaff.length === 0) return;
    const headers = ['Staff ID', 'Full Name', 'Designation', 'Department', 'Campus', 'Email', 'Phone', 'Qualification', 'Employment Type', 'Status'];
    const rows = filteredStaff.map(s => [
      `"${s.staffNo || s.staffNumber || ''}"`,
      `"${s.fullName}"`,
      `"${s.designation || ''}"`,
      `"${s.departmentName || ''}"`,
      `"${s.campusName || ''}"`,
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
      `"${s.qualification || ''}"`,
      `"${s.employmentType || 'FULL_TIME'}"`,
      `"${s.status || 'ACTIVE'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Staff_Faculty_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStaff = staffList.filter(s => {
    const matchesSearch = !searchTerm.trim() ||
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.staffNumber || s.staffNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.designation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.phone || '').includes(searchTerm);
    const matchesDept = deptFilter === 'ALL' || s.departmentId === deptFilter;
    const matchesRole = roleFilter === 'ALL' || s.designation.toLowerCase().includes(roleFilter.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || (s.status || 'ACTIVE') === statusFilter;
    return matchesSearch && matchesDept && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-red-700 hover:text-red-900 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span>Staff, Teachers & Faculty Directory</span>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
                {filteredStaff.length} Members
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Manage all academic teachers, class instructors, department heads, and institution support staff. Edit profiles or delete staff records at any time.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid / Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={exportStaffCSV}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={fetchData}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              title="Refresh Roster"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, staff ID, phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="ALL">All Departments ({departments.length})</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="ALL">All Designations & Roles</option>
              <option value="Headteacher">Headteacher / Principal</option>
              <option value="Deputy">Deputy Headteacher</option>
              <option value="Senior Teacher">Senior Teacher</option>
              <option value="Class Teacher">Class Teacher (CBC / Primary)</option>
              <option value="Teacher">Subject Teacher / CBC Facilitator</option>
              <option value="Dean">Dean of Faculty</option>
              <option value="Head of Department">Head of Department (HOD)</option>
              <option value="Lecturer">Lecturer / Senior Lecturer</option>
              <option value="Bursar">Bursar / Finance Officer</option>
              <option value="Nurse">School Nurse / Matron</option>
              <option value="ICT">ICT & Lab Technician</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Staff</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="INACTIVE">Inactive / Resigned</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Bar (when selected) */}
        {selectedStaffIds.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs animate-in fade-in">
            <div className="flex items-center space-x-2 text-blue-900 font-semibold">
              <CheckSquare className="w-4 h-4 text-blue-600" />
              <span>{selectedStaffIds.length} staff member(s) selected</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedStaffIds([])}
                className="px-3 py-1.5 bg-white text-slate-700 hover:bg-slate-100 rounded-lg font-medium border border-slate-200 cursor-pointer"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedStaffIds.length})`}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold">Loading staff directory...</p>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">No Staff Members Found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {searchTerm || deptFilter !== 'ALL' || roleFilter !== 'ALL'
                ? 'No staff members match the current search or filters. Try adjusting your query.'
                : 'No faculty or staff records exist yet. Click "Add Staff Member" to add your first teacher or administrator.'}
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedStaffIds.length === filteredStaff.length && filteredStaff.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded text-blue-600 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4 font-bold text-slate-900">Staff Member & ID</th>
                  <th className="py-3 px-4 font-bold text-slate-900">Designation & Role</th>
                  <th className="py-3 px-4 font-bold text-slate-900">Department / Section</th>
                  <th className="py-3 px-4 font-bold text-slate-900">Contact Details</th>
                  <th className="py-3 px-4 font-bold text-slate-900">Qualifications</th>
                  <th className="py-3 px-4 font-bold text-slate-900">Status</th>
                  <th className="py-3 px-4 font-bold text-slate-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map(staff => {
                  const isSelected = selectedStaffIds.includes(staff.id);
                  const isInactive = staff.status === 'INACTIVE';
                  const isOnLeave = staff.status === 'ON_LEAVE';
                  return (
                    <tr
                      key={staff.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectStaff(staff.id)}
                          className="rounded text-blue-600 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 bg-linear-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs rounded-full flex items-center justify-center shrink-0 shadow-xs">
                            {staff.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                              <span>{staff.fullName}</span>
                            </div>
                            <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {staff.staffNo || staff.staffNumber || 'STF-000'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md text-[11px]">
                          {staff.designation}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {staff.employmentType === 'FULL_TIME' ? 'Full Time' : staff.employmentType === 'PART_TIME' ? 'Part Time' : 'Contract'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{staff.departmentName || 'General Academic'}</div>
                        <div className="text-[11px] text-slate-400">{staff.campusName || 'Main Campus'}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {staff.email && (
                            <div className="flex items-center space-x-1 text-[11px] text-slate-600">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[150px]">{staff.email}</span>
                            </div>
                          )}
                          {staff.phone && (
                            <div className="flex items-center space-x-1 text-[11px] text-slate-600">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{staff.phone}</span>
                            </div>
                          )}
                          {!staff.email && !staff.phone && (
                            <span className="text-[11px] text-slate-400 italic">No contact info</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-700 truncate max-w-[160px]" title={staff.qualification}>
                          {staff.qualification || 'B.Ed / Higher Diploma'}
                        </div>
                        {staff.specialization && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[160px]" title={staff.specialization}>
                            {staff.specialization}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isInactive
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : isOnLeave
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {isInactive ? 'Inactive' : isOnLeave ? 'On Leave' : 'Active'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Quick View Button */}
                          <button
                            onClick={() => setViewingStaff(staff)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Profile Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* EDIT BUTTON */}
                          <button
                            onClick={() => openEditModal(staff)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Staff Member"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* DELETE BUTTON */}
                          <button
                            onClick={() => setDeleteCandidate(staff)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Staff Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID / CARD VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map(staff => {
            const isSelected = selectedStaffIds.includes(staff.id);
            const isInactive = staff.status === 'INACTIVE';
            const isOnLeave = staff.status === 'ON_LEAVE';
            return (
              <div
                key={staff.id}
                className={`bg-white border rounded-xl p-5 shadow-xs space-y-4 relative flex flex-col justify-between transition-all ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top card row with Checkbox, Avatar, Name and Action buttons */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectStaff(staff.id)}
                        className="rounded text-blue-600 mt-1 cursor-pointer"
                      />
                      <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-700 text-white font-bold text-sm rounded-full flex items-center justify-center shrink-0 shadow-xs">
                        {staff.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-900 text-xs truncate" title={staff.fullName}>
                          {staff.fullName}
                        </h4>
                        <p className="text-[11px] text-blue-600 font-semibold truncate">{staff.designation}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {staff.staffNo || staff.staffNumber || 'STF-000'}
                        </p>
                      </div>
                    </div>

                    {/* Top Action buttons */}
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => openEditModal(staff)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Staff Member"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteCandidate(staff)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Staff Member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="text-[11px] text-slate-600 pt-3 border-t border-slate-100 space-y-1.5 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Department:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[180px]">{staff.departmentName || 'General Academic'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Qualification:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[180px]">{staff.qualification || 'B.Ed'}</span>
                    </div>
                    {staff.specialization && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Subjects/Spec:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[180px]">{staff.specialization}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Campus:</span>
                      <span className="font-semibold text-slate-800">{staff.campusName || 'Main Campus'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isInactive
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : isOnLeave
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {isInactive ? 'Inactive' : isOnLeave ? 'On Leave' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer with Contact and View Details button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="truncate max-w-[180px]">
                    {staff.email ? staff.email : (staff.phone || 'No direct phone')}
                  </div>
                  <button
                    onClick={() => setViewingStaff(staff)}
                    className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Profile</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT STAFF MODAL */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl text-xs animate-in fade-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingStaff ? `Edit Staff: ${editingStaff.fullName}` : 'Add New Staff Member / Teacher'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {editingStaff ? 'Update employee profile, role designation, and departmental placement.' : 'Register a new instructor, class teacher, or institution staff member.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700">Full Official Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Catherine Njeri Kamau / Mr. David Mwangi"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Staff / Payroll / TSC No</label>
                  <input
                    type="text"
                    placeholder="e.g. STF-084 / TSC-982134"
                    value={staffNumber}
                    onChange={e => setStaffNumber(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">National ID / Passport</label>
                  <input
                    type="text"
                    placeholder="e.g. 29384721"
                    value={nationalId}
                    onChange={e => setNationalId(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700">Designation / Role Title *</label>
                  <div className="space-y-1.5 mt-1">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Class Teacher, Senior Lecturer, Headteacher, Bursar"
                      value={designation}
                      onChange={e => setDesignation(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                    />
                    {/* Quick suggestion pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 self-center">Quick pick:</span>
                      {[
                        'Headteacher',
                        'Deputy Headteacher',
                        'Senior Teacher',
                        'Class Teacher',
                        'Subject Teacher',
                        'Dean of Students',
                        'Head of Department',
                        'Senior Lecturer',
                        'Lecturer',
                        'Bursar',
                        'School Nurse'
                      ].map(title => (
                        <button
                          key={title}
                          type="button"
                          onClick={() => setDesignation(title)}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded text-[10px] transition-colors cursor-pointer"
                        >
                          {title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Official Email</label>
                  <input
                    type="email"
                    placeholder="c.kamau@school.ac.ke"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+254 711 223 344"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Department / Academic Section</label>
                  <select
                    value={departmentId}
                    onChange={e => setDepartmentId(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Campus Location</label>
                  <select
                    value={campusId}
                    onChange={e => setCampusId(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Main Campus</option>
                    {campuses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Highest Academic Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. B.Ed Arts, PhD Computer Science, M.Sc"
                    value={qualification}
                    onChange={e => setQualification(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Subject Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics, English, Biology, CBC Sciences"
                    value={specialization}
                    onChange={e => setSpecialization(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Employment Contract Type</label>
                  <select
                    value={employmentType}
                    onChange={e => setEmploymentType(e.target.value as any)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="FULL_TIME">Full Time Permanent</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract / Adjunct</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Employment Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="ACTIVE">Active Staff</option>
                    <option value="ON_LEAVE">On Leave</option>
                    <option value="INACTIVE">Inactive / Resigned</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{submitting ? 'Saving Record...' : editingStaff ? 'Update Staff Member' : 'Save Staff Member'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteCandidate && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Staff Record</h3>
                <p className="text-[11px] text-slate-500">This will permanently remove the staff member from the system.</p>
              </div>
            </div>

            <div className="p-3 bg-red-50/60 border border-red-200 rounded-xl text-slate-700 space-y-2">
              <p>
                Are you sure you want to permanently delete:
              </p>
              <div className="font-bold text-slate-900 text-sm">
                {deleteCandidate.fullName}
              </div>
              <div className="text-[11px] text-slate-600">
                <span>Role: <strong>{deleteCandidate.designation}</strong></span>
                {deleteCandidate.staffNo && <span> | ID: <strong>{deleteCandidate.staffNo}</strong></span>}
                {deleteCandidate.departmentName && <span> | Dept: <strong>{deleteCandidate.departmentName}</strong></span>}
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Note: This action is permanent and will remove their teaching allocations and profile credentials.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteStaff}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW PROFILE MODAL */}
      {/* ========================================================================= */}
      {viewingStaff && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-indigo-700 text-white font-bold text-lg rounded-full flex items-center justify-center shadow-xs">
                  {viewingStaff.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{viewingStaff.fullName}</h3>
                  <p className="text-xs text-blue-600 font-semibold">{viewingStaff.designation}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{viewingStaff.staffNo || viewingStaff.staffNumber || 'No Staff ID'}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingStaff(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Department</span>
                <p className="font-bold text-slate-900">{viewingStaff.departmentName || 'General Academic'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Campus</span>
                <p className="font-bold text-slate-900">{viewingStaff.campusName || 'Main Campus'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email Address</span>
                <p className="font-medium text-slate-800 break-all">{viewingStaff.email || 'Not specified'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone Number</span>
                <p className="font-medium text-slate-800">{viewingStaff.phone || 'Not specified'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Academic Qualification</span>
                <p className="font-semibold text-slate-800">{viewingStaff.qualification || 'N/A'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Specialization</span>
                <p className="font-semibold text-slate-800">{viewingStaff.specialization || 'N/A'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Employment Type</span>
                <p className="font-semibold text-slate-800">
                  {viewingStaff.employmentType === 'FULL_TIME' ? 'Full Time Permanent' : viewingStaff.employmentType === 'PART_TIME' ? 'Part Time' : 'Contract'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</span>
                <p className="font-semibold">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    viewingStaff.status === 'INACTIVE'
                      ? 'bg-slate-200 text-slate-700'
                      : viewingStaff.status === 'ON_LEAVE'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {viewingStaff.status === 'INACTIVE' ? 'Inactive' : viewingStaff.status === 'ON_LEAVE' ? 'On Leave' : 'Active'}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  const staffToDel = viewingStaff;
                  setViewingStaff(null);
                  setDeleteCandidate(staffToDel);
                }}
                className="px-3.5 py-2 text-red-600 hover:bg-red-50 rounded-xl font-bold flex items-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Staff</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewingStaff(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const staffToEdit = viewingStaff;
                    setViewingStaff(null);
                    openEditModal(staffToEdit);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
