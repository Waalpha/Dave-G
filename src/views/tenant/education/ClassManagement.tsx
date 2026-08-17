import React, { useState, useEffect } from 'react';
import { SchoolClass, Program, LecturerStaff, Student, AcademicYear } from '../../../types';
import {
  Layers, Plus, Search, Edit, Trash2, CheckCircle2, AlertCircle,
  Users, User, Building, Clock, X, Check, Eye
} from 'lucide-react';

export const ClassManagement: React.FC = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [staffList, setStaffList] = useState<LecturerStaff[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [viewingClassStudents, setViewingClassStudents] = useState<SchoolClass | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<SchoolClass | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [programId, setProgramId] = useState('');
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [term, setTerm] = useState('Semester 1');
  const [classTeacherId, setClassTeacherId] = useState('');
  const [capacity, setCapacity] = useState('40');
  const [room, setRoom] = useState('Lab 2B');
  const [submitting, setSubmitting] = useState(false);

  const getHeaders = () => ({
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [resCls, resAcad, resFac, resStud, resYrs] = await Promise.all([
        fetch('/api/app/education/classes', { headers: getHeaders() }),
        fetch('/api/app/education/academics', { headers: getHeaders() }),
        fetch('/api/app/education/faculty', { headers: getHeaders() }),
        fetch('/api/app/education/students', { headers: getHeaders() }),
        fetch('/api/app/education/academic-years', { headers: getHeaders() })
      ]);

      if (resCls.ok) setClasses(await resCls.json());
      if (resAcad.ok) {
        const acad = await resAcad.json();
        setPrograms(acad.programs || []);
      }
      if (resFac.ok) setStaffList(await resFac.json());
      if (resStud.ok) setStudents(await resStud.json());
      if (resYrs.ok) setAcademicYears(await resYrs.json());
    } catch (err: any) {
      console.error('Error fetching class data:', err);
      setErrorMsg('Failed to load classes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingClass(null);
    setName('');
    setCode('');
    setProgramId(programs[0]?.id || '');
    setAcademicYear('2025/2026');
    setTerm('Semester 1');
    setClassTeacherId(staffList[0]?.id || '');
    setCapacity('40');
    setRoom('Room 101');
    setIsModalOpen(true);
  };

  const openEditModal = (c: SchoolClass) => {
    setEditingClass(c);
    setName(c.name);
    setCode(c.code);
    setProgramId(c.programId || '');
    setAcademicYear(c.academicYear || '2025/2026');
    setTerm(c.term || 'Semester 1');
    setClassTeacherId(c.classTeacherId || '');
    setCapacity(String(c.capacity || 40));
    setRoom(c.room || '');
    setIsModalOpen(true);
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    try {
      setSubmitting(true);
      const prog = programs.find(p => p.id === programId);
      const teacher = staffList.find(s => s.id === classTeacherId);

      const payload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        programId,
        programName: prog?.name || '',
        academicYear,
        term,
        classTeacherId,
        classTeacherName: teacher?.fullName || '',
        capacity: Number(capacity) || 40,
        room: room.trim(),
        status: 'ACTIVE'
      };

      const url = editingClass
        ? `/api/app/education/classes/${editingClass.id}`
        : '/api/app/education/classes';
      const method = editingClass ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save class cohort');

      setSuccessMsg(`Class "${name}" saved successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!deleteCandidate) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/app/education/classes/${deleteCandidate.id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setSuccessMsg(`Class "${deleteCandidate.name}" deleted.`);
        setTimeout(() => setSuccessMsg(''), 4000);
        setDeleteCandidate(null);
        fetchData();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete class');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredClasses = classes.filter(c => {
    const matchesSearch = !searchTerm.trim() ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProg = programFilter === 'ALL' || c.programId === programFilter;
    return matchesSearch && matchesProg;
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
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Class Cohorts & Stream Management</span>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
                {filteredClasses.length} Cohorts Active
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Organize student streams, class mentors/teachers, lecture room venues, and cohort capacities.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Class Cohort</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by class name or code..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <select
              value={programFilter}
              onChange={e => setProgramFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Programs</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map(c => {
          const enrolledCount = students.filter(s => s.classId === c.id).length;
          return (
            <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-mono font-bold text-[10px]">
                    {c.code}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteCandidate(c)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                <p className="text-xs text-blue-600 font-semibold">{c.programName}</p>

                <div className="text-[11px] text-slate-500 space-y-1 mt-3 pt-3 border-t border-slate-100">
                  <p className="flex items-center justify-between">
                    <span>Class Teacher:</span>
                    <strong className="text-slate-800">{c.classTeacherName || 'Not Assigned'}</strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Venue / Room:</span>
                    <strong className="text-slate-800 font-mono">{c.room || 'TBD'}</strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Academic Term:</span>
                    <strong className="text-slate-800">{c.term} ({c.academicYear})</strong>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {enrolledCount} / {c.capacity || 40} Students
                </span>
                <button
                  onClick={() => setViewingClassStudents(c)}
                  className="text-blue-600 font-semibold hover:underline flex items-center space-x-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Roster</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT CLASS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveClass} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-slate-900">
              {editingClass ? 'Edit Class Cohort' : 'Create Class Cohort'}
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Class Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DIT-2026-A"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Class Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DIT Year 1 Stream A"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Academic Program</label>
                <select
                  value={programId}
                  onChange={e => setProgramId(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Class Teacher / Tutor</label>
                  <select
                    value={classTeacherId}
                    onChange={e => setClassTeacherId(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="">-- None --</option>
                    {staffList.map(s => (
                      <option key={s.id} value={s.id}>{s.fullName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Lecture Room Venue</label>
                  <input
                    type="text"
                    placeholder="e.g. Lab 2B, Room 304"
                    value={room}
                    onChange={e => setRoom(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Academic Year</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={e => setAcademicYear(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Capacity Limit</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={e => setCapacity(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
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
                {submitting ? 'Saving...' : 'Save Class'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ROSTER MODAL */}
      {viewingClassStudents && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Enrolled Students: {viewingClassStudents.name}</h3>
                <p className="text-slate-500 font-mono text-[11px]">{viewingClassStudents.code}</p>
              </div>
              <button onClick={() => setViewingClassStudents(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {students.filter(s => s.classId === viewingClassStudents.id).length === 0 ? (
                <p className="text-center py-6 text-slate-400">No students currently assigned to this class.</p>
              ) : (
                students.filter(s => s.classId === viewingClassStudents.id).map(s => (
                  <div key={s.id} className="p-2.5 bg-slate-50 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900">{s.fullName}</p>
                      <p className="font-mono text-[10px] text-blue-700">{s.admissionNo}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                      {s.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setViewingClassStudents(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteCandidate && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Delete Class Cohort</h3>
            </div>
            <p className="text-slate-600">
              Are you sure you want to delete <strong>{deleteCandidate.name}</strong> ({deleteCandidate.code})?
            </p>
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClass}
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
