import React, { useState, useEffect } from 'react';
import { Student, Program, Campus, Department, SchoolClass } from '../../../types';
import {
  Users, Plus, Search, Filter, Edit, Trash2, CheckCircle2, XCircle,
  Phone, Mail, User, Layers, Download, Upload, FileSpreadsheet,
  Calendar, DollarSign, X, Check, AlertCircle, FileText, ChevronRight
} from 'lucide-react';

interface StudentManagementProps {
  currencySymbol?: string;
  onOpenFeePayment?: (studentId: string) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  currencySymbol = 'KSh',
  onOpenFeePayment
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Delete All State
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [deleteAllConfirmInput, setDeleteAllConfirmInput] = useState('');

  // Bulk Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState<'upload' | 'preview'>('upload');
  const [parsedStudents, setParsedStudents] = useState<Array<Partial<Student>>>([]);
  const [importFileName, setImportFileName] = useState('');
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);

  // Form State
  const [formFullName, setFormFullName] = useState('');
  const [formAdmissionNo, setFormAdmissionNo] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formGender, setFormGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [formDob, setFormDob] = useState('2004-01-01');
  const [formNationalId, setFormNationalId] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formProgramId, setFormProgramId] = useState('');
  const [formDepartmentId, setFormDepartmentId] = useState('');
  const [formCampusId, setFormCampusId] = useState('');
  const [formClassId, setFormClassId] = useState('');
  const [formIntake, setFormIntake] = useState('January 2026');
  const [formAcademicYear, setFormAcademicYear] = useState('2025/2026');
  const [formAcademicTerm, setFormAcademicTerm] = useState('Semester 1');
  const [formFeeBalance, setFormFeeBalance] = useState('0');
  const [formStatus, setFormStatus] = useState<Student['status']>('ACTIVE');
  const [formGuardianName, setFormGuardianName] = useState('');
  const [formGuardianPhone, setFormGuardianPhone] = useState('');
  const [formGuardianEmail, setFormGuardianEmail] = useState('');
  const [formGuardianRelation, setFormGuardianRelation] = useState('Parent');
  const [submitting, setSubmitting] = useState(false);

  const getHeaders = () => ({
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [resStud, resAcad, resDept, resCls] = await Promise.all([
        fetch('/api/app/education/students', { headers: getHeaders() }),
        fetch('/api/app/education/academics', { headers: getHeaders() }),
        fetch('/api/app/education/departments', { headers: getHeaders() }),
        fetch('/api/app/education/classes', { headers: getHeaders() })
      ]);

      if (resStud.ok) {
        const sData = await resStud.json();
        setStudents(Array.isArray(sData) ? sData : []);
      }
      if (resAcad.ok) {
        const acad = await resAcad.json();
        if (acad.programs) setPrograms(acad.programs);
        if (acad.campuses) setCampuses(acad.campuses);
      }
      if (resDept.ok) {
        const dData = await resDept.json();
        setDepartments(Array.isArray(dData) ? dData : []);
      }
      if (resCls.ok) {
        const cData = await resCls.json();
        setClasses(Array.isArray(cData) ? cData : []);
      }
    } catch (err: any) {
      console.error('Error fetching student data:', err);
      setErrorMsg('Failed to load students list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormFullName('');
    setFormAdmissionNo('');
    setFormEmail('');
    setFormPhone('');
    setFormGender('MALE');
    setFormDob('2004-01-01');
    setFormNationalId('');
    setFormAddress('');
    setFormProgramId(programs[0]?.id || '');
    setFormDepartmentId(departments[0]?.id || '');
    setFormCampusId(campuses[0]?.id || '');
    setFormClassId(classes[0]?.id || '');
    setFormIntake('January 2026');
    setFormAcademicYear('2025/2026');
    setFormAcademicTerm('Semester 1');
    setFormFeeBalance('0');
    setFormStatus('ACTIVE');
    setFormGuardianName('');
    setFormGuardianPhone('');
    setFormGuardianEmail('');
    setFormGuardianRelation('Parent');
    setEditingStudent(null);
    setErrorMsg('');
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (s: Student) => {
    setEditingStudent(s);
    setFormFullName(s.fullName || '');
    setFormAdmissionNo(s.admissionNo || '');
    setFormEmail(s.email || '');
    setFormPhone(s.phone || '');
    setFormGender((s.gender as any) || 'MALE');
    setFormDob(s.dateOfBirth || '2004-01-01');
    setFormNationalId(s.nationalId || '');
    setFormAddress(s.address || '');
    setFormProgramId(s.programId || '');
    setFormDepartmentId(s.departmentId || '');
    setFormCampusId(s.campusId || '');
    setFormClassId(s.classId || '');
    setFormIntake(s.intake || 'January 2026');
    setFormAcademicYear(s.academicYear || '2025/2026');
    setFormAcademicTerm(s.academicTerm || 'Semester 1');
    setFormFeeBalance(String(s.feeBalance || 0));
    setFormStatus(s.status || 'ACTIVE');
    setFormGuardianName(s.guardianName || '');
    setFormGuardianPhone(s.guardianPhone || '');
    setFormGuardianEmail(s.guardianEmail || '');
    setFormGuardianRelation(s.guardianRelation || 'Parent');
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim()) {
      setErrorMsg('Student Full Name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const prog = programs.find(p => p.id === formProgramId);
      const camp = campuses.find(c => c.id === formCampusId);
      const dept = departments.find(d => d.id === formDepartmentId);
      const cls = classes.find(c => c.id === formClassId);

      const payload = {
        fullName: formFullName.trim(),
        admissionNo: formAdmissionNo.trim() || undefined,
        email: formEmail.trim() || undefined,
        phone: formPhone.trim() || undefined,
        gender: formGender,
        dateOfBirth: formDob,
        nationalId: formNationalId.trim(),
        address: formAddress.trim(),
        programId: formProgramId,
        programName: prog?.name || 'Academic Program',
        departmentId: formDepartmentId,
        departmentName: dept?.name || '',
        campusId: formCampusId,
        campusName: camp?.name || 'Main Campus',
        classId: formClassId,
        className: cls?.name || '',
        intake: formIntake,
        academicYear: formAcademicYear,
        academicTerm: formAcademicTerm,
        feeBalance: Number(formFeeBalance) || 0,
        status: formStatus,
        guardianName: formGuardianName.trim(),
        guardianPhone: formGuardianPhone.trim(),
        guardianEmail: formGuardianEmail.trim(),
        guardianRelation: formGuardianRelation.trim()
      };

      let res;
      if (editingStudent) {
        res = await fetch(`/api/app/education/students/${editingStudent.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/app/education/students', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save student record');
      }

      setSuccessMsg(editingStudent ? 'Student details successfully updated.' : 'New student admitted successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteCandidate) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/app/education/students/${deleteCandidate.id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setSuccessMsg(`Student "${deleteCandidate.fullName}" successfully removed.`);
        setTimeout(() => setSuccessMsg(''), 4000);
        setDeleteCandidate(null);
        fetchData();
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete student');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete student');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAllStudents = async () => {
    try {
      setIsDeletingAll(true);
      setErrorMsg('');
      const res = await fetch('/api/app/education/students/all', {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || 'All student records successfully deleted.');
        setTimeout(() => setSuccessMsg(''), 4000);
        setIsDeleteAllModalOpen(false);
        setDeleteAllConfirmInput('');
        fetchData();
      } else {
        throw new Error(data.error || 'Failed to delete all students');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete all students');
    } finally {
      setIsDeletingAll(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const listToExport = filteredStudents.length > 0 ? filteredStudents : students;
    if (listToExport.length === 0) {
      alert('No student records available to export.');
      return;
    }

    const headers = [
      'Admission No', 'Full Name', 'Email', 'Phone', 'Gender', 'Date of Birth',
      'Program', 'Department', 'Class', 'Campus', 'Intake', 'Academic Year',
      'Fee Balance', 'Status', 'Guardian Name', 'Guardian Phone'
    ];

    const rows = listToExport.map(s => [
      `"${(s.admissionNo || '').replace(/"/g, '""')}"`,
      `"${(s.fullName || '').replace(/"/g, '""')}"`,
      `"${(s.email || '').replace(/"/g, '""')}"`,
      `"${(s.phone || '').replace(/"/g, '""')}"`,
      `"${(s.gender || '').replace(/"/g, '""')}"`,
      `"${(s.dateOfBirth || '').replace(/"/g, '""')}"`,
      `"${(s.programName || '').replace(/"/g, '""')}"`,
      `"${(s.departmentName || '').replace(/"/g, '""')}"`,
      `"${(s.className || '').replace(/"/g, '""')}"`,
      `"${(s.campusName || '').replace(/"/g, '""')}"`,
      `"${(s.intake || '').replace(/"/g, '""')}"`,
      `"${(s.academicYear || '').replace(/"/g, '""')}"`,
      s.feeBalance || 0,
      `"${(s.status || 'ACTIVE').replace(/"/g, '""')}"`,
      `"${(s.guardianName || '').replace(/"/g, '""')}"`,
      `"${(s.guardianPhone || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `students_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import Parse
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    setImportError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error('File is empty.');

        const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) throw new Error('CSV must have a header row and data.');

        const parseLine = (line: string): string[] => {
          const result: string[] = [];
          let cur = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (c === '"') inQuotes = !inQuotes;
            else if (c === ',' && !inQuotes) {
              result.push(cur.trim().replace(/^["']|["']$/g, ''));
              cur = '';
            } else cur += c;
          }
          result.push(cur.trim().replace(/^["']|["']$/g, ''));
          return result;
        };

        const rawHeaders = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
        const parsed: Array<Partial<Student>> = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = parseLine(lines[i]);
          if (cols.length === 0 || cols.every(c => !c)) continue;

          const getCol = (names: string[]) => {
            for (const n of names) {
              const idx = rawHeaders.findIndex(h => h.includes(n));
              if (idx !== -1 && cols[idx]) return cols[idx];
            }
            return '';
          };

          const fullName = getCol(['fullname', 'name', 'studentname']);
          if (!fullName) continue;

          parsed.push({
            fullName,
            admissionNo: getCol(['admissionno', 'admno', 'admission']) || undefined,
            email: getCol(['email', 'mail']),
            phone: getCol(['phone', 'contact', 'mobile']),
            programName: getCol(['program', 'course']) || programs[0]?.name || 'Diploma Program',
            campusName: getCol(['campus']) || campuses[0]?.name || 'Main Campus',
            guardianName: getCol(['guardianname', 'parentname', 'guardian']),
            guardianPhone: getCol(['guardianphone', 'parentphone']),
            feeBalance: parseFloat(getCol(['feebalance', 'balance', 'fee'])) || 0,
            status: 'ACTIVE'
          });
        }

        if (parsed.length === 0) throw new Error('No valid student rows found.');
        setParsedStudents(parsed);
        setImportStep('preview');
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse CSV.');
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (parsedStudents.length === 0) return;
    try {
      setImporting(true);
      setImportError('');
      const res = await fetch('/api/app/education/students/bulk-import', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ students: parsedStudents })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Successfully imported ${data.addedCount || parsedStudents.length} students!`);
        setTimeout(() => setSuccessMsg(''), 4000);
        setIsImportModalOpen(false);
        setParsedStudents([]);
        fetchData();
      } else {
        setImportError(data.error || 'Failed to import students.');
      }
    } catch (err: any) {
      setImportError('Import request failed.');
    } finally {
      setImporting(false);
    }
  };

  // Filtered Students
  const filteredStudents = students.filter(s => {
    const matchesSearch = !searchTerm.trim() ||
      (s.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.admissionNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.phone || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProg = programFilter === 'ALL' || s.programId === programFilter || s.programName === programFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesClass = classFilter === 'ALL' || s.classId === classFilter;

    return matchesSearch && matchesProg && matchesStatus && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Action Notifications */}
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

      {/* Header Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Student Admissions & Student Information System (SIS)</span>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
                {filteredStudents.length} of {students.length} Enrolled
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Complete student ledger, academic profile, class cohort registration, and fee statement tracking.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => {
                setImportStep('upload');
                setImportError('');
                setParsedStudents([]);
                setIsImportModalOpen(true);
              }}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>Bulk Import</span>
            </button>

            <button
              onClick={() => {
                setDeleteAllConfirmInput('');
                setIsDeleteAllModalOpen(true);
              }}
              disabled={students.length === 0}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed text-red-700 border border-red-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              title={students.length === 0 ? "No student records to delete" : "Delete all student records for this institution"}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>Delete All Students</span>
            </button>

            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Admit Student</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, adm no, phone, email..."
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
              <option value="ALL">All Programs / Courses</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Classes / Cohorts</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Academic Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="APPLICANT">APPLICANT</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="ALUMNI">ALUMNI / GRADUATED</option>
              <option value="DEFERRED">DEFERRED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
              <tr>
                <th className="p-3.5">Admission No</th>
                <th className="p-3.5">Student Full Name</th>
                <th className="p-3.5">Contact Details</th>
                <th className="p-3.5">Program & Class</th>
                <th className="p-3.5">Campus</th>
                <th className="p-3.5">Fee Balance</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">Loading student directory...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No student records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-blue-700">{s.admissionNo}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{s.fullName}</div>
                      <div className="text-[10px] text-slate-400">{s.gender} • DOB: {s.dateOfBirth}</div>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      <div>{s.email}</div>
                      <div className="text-[11px] font-mono text-slate-400">{s.phone || 'No phone'}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-900">{s.programName}</div>
                      <div className="text-[11px] text-slate-500">{s.className || 'No Class Assigned'}</div>
                    </td>
                    <td className="p-3.5 text-slate-600">{s.campusName || 'Main Campus'}</td>
                    <td className="p-3.5 font-mono font-bold">
                      <span className={s.feeBalance > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                        {currencySymbol} {(s.feeBalance || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'APPLICANT'
                          ? 'bg-blue-100 text-blue-800'
                          : s.status === 'SUSPENDED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {onOpenFeePayment && (
                          <button
                            onClick={() => onOpenFeePayment(s.id)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Record fee payment"
                          >
                            Receive Fee
                          </button>
                        )}
                        <button
                          onClick={() => setViewingStudent(s)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Student Record"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(s)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADMIT / EDIT STUDENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form onSubmit={handleSaveStudent} className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl text-xs my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingStudent ? `Edit Student: ${editingStudent.fullName}` : 'Admit New Student'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Maina Mwangi"
                  value={formFullName}
                  onChange={e => setFormFullName(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Admission Number (Auto if blank)</label>
                <input
                  type="text"
                  placeholder="e.g. ADM/2026/049"
                  value={formAdmissionNo}
                  onChange={e => setFormAdmissionNo(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  placeholder="s.maina@student.ac.ke"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Phone Number</label>
                <input
                  type="text"
                  placeholder="+254 700 111 222"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Gender</label>
                <select
                  value={formGender}
                  onChange={e => setFormGender(e.target.value as any)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Date of Birth</label>
                <input
                  type="date"
                  value={formDob}
                  onChange={e => setFormDob(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">National ID / Birth Certificate</label>
                <input
                  type="text"
                  placeholder="38291044"
                  value={formNationalId}
                  onChange={e => setFormNationalId(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Physical Address / Hometown</label>
                <input
                  type="text"
                  placeholder="P.O Box 102 - Nairobi"
                  value={formAddress}
                  onChange={e => setFormAddress(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Program / Course *</label>
                <select
                  value={formProgramId}
                  onChange={e => setFormProgramId(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="">-- Select Program --</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Department</label>
                <select
                  value={formDepartmentId}
                  onChange={e => setFormDepartmentId(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="">-- Select Department --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Class / Cohort</label>
                <select
                  value={formClassId}
                  onChange={e => setFormClassId(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="">-- Select Class --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Campus</label>
                <select
                  value={formCampusId}
                  onChange={e => setFormCampusId(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="">-- Select Campus --</option>
                  {campuses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Intake Batch</label>
                <input
                  type="text"
                  placeholder="January 2026"
                  value={formIntake}
                  onChange={e => setFormIntake(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Status</label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as any)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="APPLICANT">APPLICANT</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="ALUMNI">ALUMNI / GRADUATED</option>
                  <option value="DEFERRED">DEFERRED</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 text-xs mb-2">Guardian / Parent Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Guardian Name</label>
                  <input
                    type="text"
                    placeholder="Mary W. Mwangi"
                    value={formGuardianName}
                    onChange={e => setFormGuardianName(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Guardian Phone</label>
                  <input
                    type="text"
                    placeholder="+254 722 000 111"
                    value={formGuardianPhone}
                    onChange={e => setFormGuardianPhone(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Relationship</label>
                  <input
                    type="text"
                    placeholder="Mother / Guardian"
                    value={formGuardianRelation}
                    onChange={e => setFormGuardianRelation(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
              >
                {submitting ? 'Saving...' : editingStudent ? 'Update Student Record' : 'Confirm Admission'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW STUDENT DETAILS DRAWER / MODAL */}
      {viewingStudent && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {viewingStudent.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{viewingStudent.fullName}</h3>
                  <p className="font-mono text-[11px] text-blue-700 font-semibold">{viewingStudent.admissionNo}</p>
                </div>
              </div>
              <button onClick={() => setViewingStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="p-2.5 bg-slate-50 rounded-lg space-y-0.5">
                <span className="text-[10px] text-slate-400 font-medium">Program</span>
                <p className="font-bold text-slate-900">{viewingStudent.programName}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg space-y-0.5">
                <span className="text-[10px] text-slate-400 font-medium">Class / Cohort</span>
                <p className="font-bold text-slate-900">{viewingStudent.className || 'Not Assigned'}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg space-y-0.5">
                <span className="text-[10px] text-slate-400 font-medium">Campus</span>
                <p className="font-bold text-slate-900">{viewingStudent.campusName || 'Main Campus'}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg space-y-0.5">
                <span className="text-[10px] text-slate-400 font-medium">Fee Balance</span>
                <p className="font-bold text-amber-600 font-mono">
                  {currencySymbol} {(viewingStudent.feeBalance || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg space-y-0.5">
                <span className="text-[10px] text-slate-400 font-medium">Email</span>
                <p className="font-mono text-slate-800">{viewingStudent.email || 'N/A'}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg space-y-0.5">
                <span className="text-[10px] text-slate-400 font-medium">Phone</span>
                <p className="font-mono text-slate-800">{viewingStudent.phone || 'N/A'}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg space-y-0.5">
                <span className="text-[10px] text-slate-400 font-medium">Guardian</span>
                <p className="text-slate-800">{viewingStudent.guardianName || 'N/A'} ({viewingStudent.guardianRelation || 'Parent'})</p>
                <p className="font-mono text-[10px] text-slate-500">{viewingStudent.guardianPhone}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg space-y-0.5">
                <span className="text-[10px] text-slate-400 font-medium">Enrolled At</span>
                <p className="text-slate-800">{viewingStudent.enrolledAt ? new Date(viewingStudent.enrolledAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  const s = viewingStudent;
                  setViewingStudent(null);
                  openEditModal(s);
                }}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-100"
              >
                Edit Student
              </button>
              <button
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteCandidate && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Delete Student Record</h3>
            </div>
            <p className="text-slate-600">
              Are you sure you want to permanently delete <strong>{deleteCandidate.fullName}</strong> ({deleteCandidate.admissionNo})? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteStudent}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-xs"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ALL STUDENTS CONFIRMATION MODAL */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-red-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center space-x-3 text-red-600 border-b border-red-100 pb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete All Students</h3>
                <p className="text-[11px] text-red-600 font-medium">Permanent Bulk Deletion • {students.length} Records</p>
              </div>
            </div>

            <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl space-y-2 text-slate-700">
              <p className="font-semibold text-red-900 text-xs">
                ⚠️ Critical Warning:
              </p>
              <p className="text-[11px] leading-relaxed">
                You are about to permanently delete <strong>all {students.length} student records</strong> for this institution. This operation will purge all student directory listings, admission files, and associated records.
              </p>
              <p className="text-[11px] font-bold text-red-800">
                This action is irreversible and cannot be undone.
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="block text-slate-700 text-[11px] font-semibold">
                To confirm, type <span className="font-mono text-red-600 font-bold">DELETE</span> below:
              </label>
              <input
                type="text"
                placeholder="Type DELETE to confirm"
                value={deleteAllConfirmInput}
                onChange={e => setDeleteAllConfirmInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteAllModalOpen(false);
                  setDeleteAllConfirmInput('');
                }}
                disabled={isDeletingAll}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAllStudents}
                disabled={isDeletingAll || deleteAllConfirmInput.trim().toUpperCase() !== 'DELETE'}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                {isDeletingAll ? (
                  <span>Deleting All...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Delete All ({students.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Bulk Import Students from CSV</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {importError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                {importError}
              </div>
            )}

            {importStep === 'upload' ? (
              <div className="space-y-4">
                <p className="text-slate-600">
                  Upload a CSV file containing columns for <code>fullName</code>, <code>email</code>, <code>phone</code>, <code>programName</code>, <code>feeBalance</code>, etc.
                </p>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <label className="block text-xs font-semibold text-blue-600 cursor-pointer">
                    <span>Click to browse and upload CSV file</span>
                    <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <p className="text-[11px] text-slate-400 mt-1">Standard comma-separated spreadsheet file</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Parsed {parsedStudents.length} Students Preview:</span>
                  <span className="text-slate-500 font-mono text-[11px]">{importFileName}</span>
                </div>
                <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                  {parsedStudents.map((st, i) => (
                    <div key={i} className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{st.fullName}</span>
                        <div className="text-[10px] text-slate-500">{st.email} • {st.programName}</div>
                      </div>
                      <span className="font-mono font-bold text-slate-700">{currencySymbol} {st.feeBalance}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    onClick={() => setImportStep('upload')}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleExecuteImport}
                    disabled={importing}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                  >
                    {importing ? 'Importing...' : `Import ${parsedStudents.length} Students`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
