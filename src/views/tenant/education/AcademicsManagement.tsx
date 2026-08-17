import React, { useState, useEffect } from 'react';
import { Program, Unit, AcademicYear, Term, Campus, Department, LecturerStaff } from '../../../types';
import {
  BookOpen, Layers, Calendar, Building, Plus, Search, Edit, Trash2,
  CheckCircle2, AlertCircle, Clock, Award, X, Check, ArrowRight
} from 'lucide-react';

export const AcademicsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'programs' | 'units' | 'years' | 'campuses'>('programs');

  const [programs, setPrograms] = useState<Program[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [staffList, setStaffList] = useState<LecturerStaff[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);

  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);

  const [isCampusModalOpen, setIsCampusModalOpen] = useState(false);
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null);

  // Deletion Candidate
  const [deleteCandidate, setDeleteCandidate] = useState<{ type: string; id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form States
  // Program Form
  const [progCode, setProgCode] = useState('');
  const [progName, setProgName] = useState('');
  const [progDeptId, setProgDeptId] = useState('');
  const [progLevel, setProgLevel] = useState<Program['level']>('DIPLOMA');
  const [progDuration, setProgDuration] = useState('2');
  const [progCredits, setProgCredits] = useState('120');
  const [progDescription, setProgDescription] = useState('');

  // Unit Form
  const [unitCode, setUnitCode] = useState('');
  const [unitName, setUnitName] = useState('');
  const [unitDeptId, setUnitDeptId] = useState('');
  const [unitProgId, setUnitProgId] = useState('');
  const [unitCredits, setUnitCredits] = useState('3');
  const [unitSemester, setUnitSemester] = useState('Semester 1');
  const [unitLecturerId, setUnitLecturerId] = useState('');
  const [unitDescription, setUnitDescription] = useState('');

  // Academic Year Form
  const [yearName, setYearName] = useState('');
  const [yearStartDate, setYearStartDate] = useState('2025-09-01');
  const [yearEndDate, setYearEndDate] = useState('2026-08-31');
  const [yearIsCurrent, setYearIsCurrent] = useState(true);

  // Term Form
  const [termName, setTermName] = useState('');
  const [termYearId, setTermYearId] = useState('');
  const [termStartDate, setTermStartDate] = useState('2025-09-01');
  const [termEndDate, setTermEndDate] = useState('2025-12-15');
  const [termIsCurrent, setTermIsCurrent] = useState(true);

  // Campus Form
  const [campusName, setCampusName] = useState('');
  const [campusCode, setCampusCode] = useState('');
  const [campusLocation, setCampusLocation] = useState('');
  const [campusIsMain, setCampusIsMain] = useState(false);
  const [campusPhone, setCampusPhone] = useState('');
  const [campusEmail, setCampusEmail] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const getHeaders = () => ({
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [resAcad, resDepts, resFac, resYrs, resTrms] = await Promise.all([
        fetch('/api/app/education/academics', { headers: getHeaders() }),
        fetch('/api/app/education/departments', { headers: getHeaders() }),
        fetch('/api/app/education/faculty', { headers: getHeaders() }),
        fetch('/api/app/education/academic-years', { headers: getHeaders() }),
        fetch('/api/app/education/terms', { headers: getHeaders() })
      ]);

      if (resAcad.ok) {
        const acad = await resAcad.json();
        setPrograms(acad.programs || []);
        setUnits(acad.units || []);
        setCampuses(acad.campuses || []);
      }
      if (resDepts.ok) {
        const depts = await resDepts.json();
        setDepartments(Array.isArray(depts) ? depts : []);
      }
      if (resFac.ok) {
        const fac = await resFac.json();
        setStaffList(Array.isArray(fac) ? fac : []);
      }
      if (resYrs.ok) {
        const yrs = await resYrs.json();
        setAcademicYears(Array.isArray(yrs) ? yrs : []);
      }
      if (resTrms.ok) {
        const trms = await resTrms.json();
        setTerms(Array.isArray(trms) ? trms : []);
      }
    } catch (err: any) {
      console.error('Error fetching academic data:', err);
      setErrorMsg('Failed to load academic records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Program Handlers
  const openAddProgram = () => {
    setEditingProgram(null);
    setProgCode('');
    setProgName('');
    setProgDeptId(departments[0]?.id || '');
    setProgLevel('DIPLOMA');
    setProgDuration('2');
    setProgCredits('120');
    setProgDescription('');
    setIsProgramModalOpen(true);
  };

  const openEditProgram = (p: Program) => {
    setEditingProgram(p);
    setProgCode(p.code || '');
    setProgName(p.name || '');
    setProgDeptId(p.departmentId || '');
    setProgLevel(p.level || 'DIPLOMA');
    setProgDuration(String(p.durationYears || 2));
    setProgCredits(String(p.totalCredits || 120));
    setProgDescription(p.description || '');
    setIsProgramModalOpen(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progName || !progCode) return;
    try {
      setSubmitting(true);
      const dept = departments.find(d => d.id === progDeptId);
      const payload = {
        code: progCode.trim().toUpperCase(),
        name: progName.trim(),
        departmentId: progDeptId,
        departmentName: dept?.name || '',
        level: progLevel,
        durationYears: Number(progDuration) || 2,
        totalCredits: Number(progCredits) || 120,
        description: progDescription.trim(),
        status: 'ACTIVE'
      };

      const url = editingProgram
        ? `/api/app/education/programs/${editingProgram.id}`
        : '/api/app/education/programs';
      const method = editingProgram ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save program');

      setSuccessMsg(`Program "${progName}" saved successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsProgramModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving program');
    } finally {
      setSubmitting(false);
    }
  };

  // Unit Handlers
  const openAddUnit = () => {
    setEditingUnit(null);
    setUnitCode('');
    setUnitName('');
    setUnitDeptId(departments[0]?.id || '');
    setUnitProgId(programs[0]?.id || '');
    setUnitCredits('3');
    setUnitSemester('Semester 1');
    setUnitLecturerId(staffList[0]?.id || '');
    setUnitDescription('');
    setIsUnitModalOpen(true);
  };

  const openEditUnit = (u: Unit) => {
    setEditingUnit(u);
    setUnitCode(u.code || '');
    setUnitName(u.name || '');
    setUnitDeptId(u.departmentId || '');
    setUnitProgId(u.programId || '');
    setUnitCredits(String(u.credits || 3));
    setUnitSemester(u.semester || 'Semester 1');
    setUnitLecturerId(u.lecturerId || '');
    setUnitDescription(u.description || '');
    setIsUnitModalOpen(true);
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitName || !unitCode) return;
    try {
      setSubmitting(true);
      const dept = departments.find(d => d.id === unitDeptId);
      const prog = programs.find(p => p.id === unitProgId);
      const lec = staffList.find(s => s.id === unitLecturerId);

      const payload = {
        code: unitCode.trim().toUpperCase(),
        name: unitName.trim(),
        departmentId: unitDeptId,
        departmentName: dept?.name || '',
        programId: unitProgId,
        programName: prog?.name || '',
        credits: Number(unitCredits) || 3,
        semester: unitSemester,
        lecturerId: unitLecturerId,
        lecturerName: lec?.fullName || '',
        description: unitDescription.trim(),
        status: 'ACTIVE'
      };

      const url = editingUnit
        ? `/api/app/education/units/${editingUnit.id}`
        : '/api/app/education/units';
      const method = editingUnit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save unit');

      setSuccessMsg(`Unit "${unitName}" saved successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsUnitModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving unit');
    } finally {
      setSubmitting(false);
    }
  };

  // Academic Year Handlers
  const openAddYear = () => {
    setEditingYear(null);
    setYearName('2025/2026');
    setYearStartDate('2025-09-01');
    setYearEndDate('2026-08-31');
    setYearIsCurrent(true);
    setIsYearModalOpen(true);
  };

  const handleSaveYear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        name: yearName.trim(),
        startDate: yearStartDate,
        endDate: yearEndDate,
        isCurrent: yearIsCurrent
      };
      const url = editingYear ? `/api/app/education/academic-years/${editingYear.id}` : '/api/app/education/academic-years';
      const res = await fetch(url, {
        method: editingYear ? 'PUT' : 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save academic year');
      setIsYearModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving year');
    } finally {
      setSubmitting(false);
    }
  };

  // Campus Handlers
  const openAddCampus = () => {
    setEditingCampus(null);
    setCampusName('');
    setCampusCode('');
    setCampusLocation('');
    setCampusIsMain(false);
    setCampusPhone('');
    setCampusEmail('');
    setIsCampusModalOpen(true);
  };

  const handleSaveCampus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campusName) return;
    try {
      setSubmitting(true);
      const payload = {
        name: campusName.trim(),
        code: campusCode.trim().toUpperCase() || undefined,
        location: campusLocation.trim(),
        isMain: campusIsMain,
        contactPhone: campusPhone.trim(),
        contactEmail: campusEmail.trim(),
        status: 'ACTIVE'
      };
      const url = editingCampus ? `/api/app/education/campuses/${editingCampus.id}` : '/api/app/education/campuses';
      const res = await fetch(url, {
        method: editingCampus ? 'PUT' : 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save campus');
      setIsCampusModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving campus');
    } finally {
      setSubmitting(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteCandidate) return;
    try {
      setIsDeleting(true);
      let endpoint = '';
      if (deleteCandidate.type === 'program') endpoint = `/api/app/education/programs/${deleteCandidate.id}`;
      else if (deleteCandidate.type === 'unit') endpoint = `/api/app/education/units/${deleteCandidate.id}`;
      else if (deleteCandidate.type === 'year') endpoint = `/api/app/education/academic-years/${deleteCandidate.id}`;
      else if (deleteCandidate.type === 'campus') endpoint = `/api/app/education/campuses/${deleteCandidate.id}`;

      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setSuccessMsg(`Record "${deleteCandidate.name}" removed successfully.`);
        setTimeout(() => setSuccessMsg(''), 4000);
        setDeleteCandidate(null);
        fetchData();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete record');
    } finally {
      setIsDeleting(false);
    }
  };

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

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-2xs gap-2 py-1 text-xs font-medium text-slate-600">
        {[
          { id: 'programs', label: `Programs & Courses (${programs.length})`, icon: BookOpen },
          { id: 'units', label: `Units & Modules (${units.length})`, icon: Layers },
          { id: 'years', label: `Academic Calendar (${academicYears.length} Years)`, icon: Calendar },
          { id: 'campuses', label: `Campuses (${campuses.length})`, icon: Building }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center space-x-2 py-2.5 px-3 border-b-2 font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'border-blue-600 text-blue-700 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: PROGRAMS */}
      {activeTab === 'programs' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Academic Programs & Qualifications</h3>
              <p className="text-xs text-slate-500">Degree, Diploma, Certificate, and Artisan curriculum structures.</p>
            </div>
            <button
              onClick={openAddProgram}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Program</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map(p => (
              <div key={p.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-mono font-bold">
                    {p.code}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditProgram(p)}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteCandidate({ type: 'program', id: p.id, name: p.name })}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <p>Level: <strong className="text-slate-700">{p.level}</strong></p>
                  <p>Duration: {p.durationYears} Years ({p.totalCredits || 120} Credits)</p>
                  <p>Department: {p.departmentName || 'General'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: UNITS */}
      {activeTab === 'units' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Course Units, Modules & Subjects</h3>
              <p className="text-xs text-slate-500">Curriculum units, assigned lecturers, and credit weightings.</p>
            </div>
            <button
              onClick={openAddUnit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Unit</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Unit Code</th>
                  <th className="p-3">Unit Name</th>
                  <th className="p-3">Program / Course</th>
                  <th className="p-3">Semester</th>
                  <th className="p-3">Credits</th>
                  <th className="p-3">Assigned Lecturer</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {units.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-blue-700">{u.code}</td>
                    <td className="p-3 font-semibold text-slate-900">{u.name}</td>
                    <td className="p-3 text-slate-600">{u.programName}</td>
                    <td className="p-3 text-slate-500">{u.semester}</td>
                    <td className="p-3 font-bold text-slate-800">{u.credits} CH</td>
                    <td className="p-3 text-slate-600">{u.lecturerName || 'Unassigned'}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => openEditUnit(u)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate({ type: 'unit', id: u.id, name: u.name })}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: ACADEMIC CALENDAR */}
      {activeTab === 'years' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Academic Years & Semesters/Terms</h3>
              <p className="text-xs text-slate-500">Configure academic session cycles, term boundaries, and active terms.</p>
            </div>
            <button
              onClick={openAddYear}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Academic Year</span>
            </button>
          </div>

          <div className="space-y-3">
            {academicYears.map(yr => (
              <div key={yr.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">{yr.name}</span>
                    {yr.isCurrent && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                        CURRENT ACTIVE YEAR
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {yr.startDate} to {yr.endDate}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setDeleteCandidate({ type: 'year', id: yr.id, name: yr.name })}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: CAMPUSES */}
      {activeTab === 'campuses' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Campus Locations & Branch Facilities</h3>
              <p className="text-xs text-slate-500">Manage institutional physical centers, branches, and main campus.</p>
            </div>
            <button
              onClick={openAddCampus}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Campus</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campuses.map(c => (
              <div key={c.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                  {c.isMain && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                      Main Campus
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">{c.location}</p>
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200 font-mono space-y-0.5">
                  <p>{c.contactPhone || 'No contact phone'}</p>
                  <p>{c.contactEmail || 'No contact email'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD/EDIT PROGRAM MODAL */}
      {isProgramModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveProgram} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-slate-900">
              {editingProgram ? 'Edit Academic Program' : 'Create New Academic Program'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Program Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DIT, DBA, BIT"
                  value={progCode}
                  onChange={e => setProgCode(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Program Title / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diploma in Information Technology"
                  value={progName}
                  onChange={e => setProgName(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Department</label>
                  <select
                    value={progDeptId}
                    onChange={e => setProgDeptId(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Level / Tier</label>
                  <select
                    value={progLevel}
                    onChange={e => setProgLevel(e.target.value as any)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="DEGREE">DEGREE / BACHELOR</option>
                    <option value="HIGHER_DIPLOMA">HIGHER DIPLOMA</option>
                    <option value="DIPLOMA">DIPLOMA</option>
                    <option value="CERTIFICATE">CERTIFICATE</option>
                    <option value="ARTISAN">ARTISAN / VOCATIONAL</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Duration (Years)</label>
                  <input
                    type="number"
                    value={progDuration}
                    onChange={e => setProgDuration(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Total Credits</label>
                  <input
                    type="number"
                    value={progCredits}
                    onChange={e => setProgCredits(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsProgramModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
              >
                {submitting ? 'Saving...' : 'Save Program'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD/EDIT UNIT MODAL */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveUnit} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-slate-900">
              {editingUnit ? 'Edit Unit / Subject' : 'Add New Unit / Subject'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Unit Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IT201, BUS102"
                  value={unitCode}
                  onChange={e => setUnitCode(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Unit Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Database Management Systems"
                  value={unitName}
                  onChange={e => setUnitName(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Program / Course</label>
                  <select
                    value={unitProgId}
                    onChange={e => setUnitProgId(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Assigned Lecturer</label>
                  <select
                    value={unitLecturerId}
                    onChange={e => setUnitLecturerId(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="">-- None --</option>
                    {staffList.map(s => (
                      <option key={s.id} value={s.id}>{s.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Credit Hours</label>
                  <input
                    type="number"
                    value={unitCredits}
                    onChange={e => setUnitCredits(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Semester / Term</label>
                  <input
                    type="text"
                    value={unitSemester}
                    onChange={e => setUnitSemester(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsUnitModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
              >
                {submitting ? 'Saving...' : 'Save Unit'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD/EDIT CAMPUS MODAL */}
      {isCampusModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveCampus} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-slate-900">
              {editingCampus ? 'Edit Campus' : 'Add Campus Branch'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Campus Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Campus, Town Campus"
                  value={campusName}
                  onChange={e => setCampusName(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Physical Location</label>
                <input
                  type="text"
                  placeholder="e.g. CBD Plaza, 4th Floor"
                  value={campusLocation}
                  onChange={e => setCampusLocation(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="mainCampusCheck"
                  checked={campusIsMain}
                  onChange={e => setCampusIsMain(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="mainCampusCheck" className="font-semibold text-slate-700">
                  Is Main / Principal Campus
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsCampusModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
              >
                {submitting ? 'Saving...' : 'Save Campus'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteCandidate && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Confirm Deletion</h3>
            </div>
            <p className="text-slate-600">
              Are you sure you want to delete <strong>{deleteCandidate.name}</strong>?
            </p>
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
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
