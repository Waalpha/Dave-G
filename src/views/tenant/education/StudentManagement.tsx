import React, { useState, useEffect } from 'react';
import { Student, Program, Campus, Department, SchoolClass, SchoolGrade, GradeStream } from '../../../types';
import {
  Users, Plus, Search, Filter, Edit, Trash2, CheckCircle2, XCircle,
  Phone, Mail, User, Layers, Download, Upload, FileSpreadsheet,
  Calendar, DollarSign, X, Check, AlertCircle, FileText, ChevronRight,
  TrendingUp, Award, Printer, UserPlus, Eye, ShieldCheck, BookOpen, Clock
} from 'lucide-react';
import { StudentAdmissionLetterModal } from './components/StudentAdmissionLetterModal';

interface StudentManagementProps {
  currencySymbol?: string;
  onOpenFeePayment?: (studentId: string) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  currencySymbol = 'KSh',
  onOpenFeePayment
}) => {
  // Navigation Subtabs
  const [activeTab, setActiveTab] = useState<'all' | 'admit' | 'applicants' | 'letters' | 'import'>('all');

  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [grades, setGrades] = useState<SchoolGrade[]>([]);
  const [streams, setStreams] = useState<GradeStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [gradeFilter, setGradeFilter] = useState('ALL');

  // Modals & Viewers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [admissionLetterStudent, setAdmissionLetterStudent] = useState<Student | null>(null);

  // Delete All State
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [deleteAllConfirmInput, setDeleteAllConfirmInput] = useState('');

  // Bulk Import State
  const [importStep, setImportStep] = useState<'upload' | 'preview'>('upload');
  const [parsedStudents, setParsedStudents] = useState<Array<Partial<Student>>>([]);
  const [importFileName, setImportFileName] = useState('');
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);

  // Form State
  const [formFullName, setFormFullName] = useState('');
  const [formAdmissionNo, setFormAdmissionNo] = useState('');
  const [formLearnerAssessmentNo, setFormLearnerAssessmentNo] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formGender, setFormGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [formDob, setFormDob] = useState('2014-01-01');
  const [formNationalId, setFormNationalId] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formGradeId, setFormGradeId] = useState('');
  const [formStreamId, setFormStreamId] = useState('');
  const [formProgramId, setFormProgramId] = useState('');
  const [formDepartmentId, setFormDepartmentId] = useState('');
  const [formCampusId, setFormCampusId] = useState('');
  const [formClassId, setFormClassId] = useState('');
  const [formIntake, setFormIntake] = useState('January 2026');
  const [formAcademicYear, setFormAcademicYear] = useState('2025/2026');
  const [formAcademicTerm, setFormAcademicTerm] = useState('Term 1');
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
      const [resStud, resAcad, resDept, resCls, resGrades, resStreams] = await Promise.all([
        fetch('/api/app/education/students', { headers: getHeaders() }),
        fetch('/api/app/education/academics', { headers: getHeaders() }),
        fetch('/api/app/education/departments', { headers: getHeaders() }),
        fetch('/api/app/education/classes', { headers: getHeaders() }),
        fetch('/api/app/education/grades', { headers: getHeaders() }),
        fetch('/api/app/education/streams', { headers: getHeaders() })
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
      if (resGrades.ok) {
        const gData = await resGrades.json();
        setGrades(Array.isArray(gData) ? gData : []);
      }
      if (resStreams.ok) {
        const strData = await resStreams.json();
        setStreams(Array.isArray(strData) ? strData : []);
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

  const generateNextAdmNo = () => {
    const year = new Date().getFullYear();
    const count = students.length + 1;
    return `ADM/${year}/${String(count).padStart(3, '0')}`;
  };

  const resetForm = () => {
    setFormFullName('');
    setFormAdmissionNo(generateNextAdmNo());
    setFormLearnerAssessmentNo('');
    setFormEmail('');
    setFormPhone('');
    setFormGender('MALE');
    setFormDob('2014-01-01');
    setFormNationalId('');
    setFormAddress('');
    setFormGradeId(grades[0]?.id || '');
    setFormStreamId('');
    setFormProgramId(programs[0]?.id || '');
    setFormDepartmentId(departments[0]?.id || '');
    setFormCampusId(campuses[0]?.id || '');
    setFormClassId(classes[0]?.id || '');
    setFormIntake('January 2026');
    setFormAcademicYear('2025/2026');
    setFormAcademicTerm('Term 1');
    setFormFeeBalance('0');
    setFormStatus('ACTIVE');
    setFormGuardianName('');
    setFormGuardianPhone('');
    setFormGuardianEmail('');
    setFormGuardianRelation('Parent');
    setEditingStudent(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (s: Student) => {
    setEditingStudent(s);
    setFormFullName(s.fullName || '');
    setFormAdmissionNo(s.admissionNo || '');
    setFormLearnerAssessmentNo(s.learnerAssessmentNo || s.assessmentNumber || '');
    setFormEmail(s.email || '');
    setFormPhone(s.phone || '');
    setFormGender((s.gender?.toUpperCase() as any) || 'MALE');
    setFormDob(s.dateOfBirth ? s.dateOfBirth.slice(0, 10) : '2014-01-01');
    setFormNationalId(s.nationalId || '');
    setFormAddress(s.address || '');
    setFormGradeId(s.gradeId || '');
    setFormStreamId(s.streamId || '');
    setFormProgramId(s.programId || '');
    setFormDepartmentId(s.departmentId || '');
    setFormCampusId(s.campusId || '');
    setFormClassId(s.classId || '');
    setFormIntake(s.intake || 'January 2026');
    setFormAcademicYear(s.academicYear || '2025/2026');
    setFormAcademicTerm(s.academicTerm || 'Term 1');
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
      const grd = grades.find(g => g.id === formGradeId);
      const strm = streams.find(s => s.id === formStreamId);

      const payload = {
        fullName: formFullName.trim(),
        admissionNo: formAdmissionNo.trim() || undefined,
        learnerAssessmentNo: formLearnerAssessmentNo.trim() || undefined,
        email: formEmail.trim() || undefined,
        phone: formPhone.trim() || undefined,
        gender: formGender,
        dateOfBirth: formDob,
        nationalId: formNationalId.trim(),
        address: formAddress.trim(),
        gradeId: formGradeId || undefined,
        gradeName: grd?.name || undefined,
        streamId: formStreamId || undefined,
        streamName: strm?.name || undefined,
        programId: formProgramId || undefined,
        programName: prog?.name || (grd ? grd.name : 'Academic Program'),
        departmentId: formDepartmentId || undefined,
        departmentName: dept?.name || '',
        campusId: formCampusId || undefined,
        campusName: camp?.name || 'Main Campus',
        classId: formClassId || undefined,
        className: cls?.name || (strm ? `${grd?.name || 'Grade'} Stream ${strm.name}` : ''),
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

      const savedStudent = await res.json();
      setSuccessMsg(editingStudent ? 'Student details successfully updated.' : 'New student admitted successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsModalOpen(false);
      resetForm();
      fetchData();

      // If user admitted on the dedicated "admit" tab, switch back to all list or offer admission letter
      if (activeTab === 'admit') {
        setActiveTab('all');
        if (savedStudent && !editingStudent) {
          setAdmissionLetterStudent(savedStudent);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickEnrollApplicant = async (applicant: Student) => {
    try {
      const res = await fetch(`/api/app/education/students/${applicant.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          ...applicant,
          status: 'ACTIVE'
        })
      });
      if (res.ok) {
        setSuccessMsg(`Student "${applicant.fullName}" has been officially enrolled.`);
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchData();
      }
    } catch (err) {
      console.error('Error approving applicant:', err);
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
      'Admission No', 'Full Name', 'UPI/Assessment No', 'Email', 'Phone', 'Gender', 'Date of Birth',
      'Grade/Program', 'Stream', 'Department', 'Class', 'Campus', 'Intake', 'Academic Year',
      'Fee Balance', 'Status', 'Guardian Name', 'Guardian Phone'
    ];

    const rows = listToExport.map(s => [
      `"${(s.admissionNo || '').replace(/"/g, '""')}"`,
      `"${(s.fullName || '').replace(/"/g, '""')}"`,
      `"${(s.learnerAssessmentNo || s.assessmentNumber || '').replace(/"/g, '""')}"`,
      `"${(s.email || '').replace(/"/g, '""')}"`,
      `"${(s.phone || '').replace(/"/g, '""')}"`,
      `"${(s.gender || '').replace(/"/g, '""')}"`,
      `"${(s.dateOfBirth || '').replace(/"/g, '""')}"`,
      `"${(s.gradeName || s.programName || '').replace(/"/g, '""')}"`,
      `"${(s.streamName || '').replace(/"/g, '""')}"`,
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
    link.setAttribute('download', `student_admissions_${new Date().toISOString().slice(0, 10)}.csv`);
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
            learnerAssessmentNo: getCol(['upi', 'assessment', 'nemis', 'learner']),
            email: getCol(['email', 'mail']),
            phone: getCol(['phone', 'contact', 'mobile']),
            programName: getCol(['program', 'course', 'grade']) || grades[0]?.name || programs[0]?.name || 'Standard Curriculum',
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
        setSuccessMsg(`Successfully admitted ${data.addedCount || parsedStudents.length} students via bulk import!`);
        setTimeout(() => setSuccessMsg(''), 4000);
        setActiveTab('all');
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
      (s.learnerAssessmentNo || s.assessmentNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.phone || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade = gradeFilter === 'ALL' || s.gradeId === gradeFilter || (!s.gradeId && gradeFilter === 'UNASSIGNED');
    const matchesProg = programFilter === 'ALL' || s.programId === programFilter || s.programName === programFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesClass = classFilter === 'ALL' || s.classId === classFilter;

    return matchesSearch && matchesGrade && matchesProg && matchesStatus && matchesClass;
  });

  const applicantStudents = students.filter(s => s.status === 'APPLICANT' || s.status === 'DEFERRED');

  return (
    <div className="space-y-6">
      {/* Action Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Admissions Module Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Student Admissions & Student Information System (SIS)</h2>
              <p className="text-xs text-slate-500">
                Manage student admissions, learner enrollment, academic cohorts, fee ledger balance, and official joining letters.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Admit New Student</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export Admissions</span>
          </button>
        </div>
      </div>

      {/* Admissions Sub-Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 bg-white px-3 rounded-xl shadow-2xs gap-1.5 py-1 text-xs font-medium text-slate-600">
        {[
          { id: 'all', label: 'Enrolled Students Register', count: students.length, icon: Users },
          { id: 'admit', label: 'New Admission Desk (Form)', icon: UserPlus },
          { id: 'applicants', label: 'Admission Inquiries & Applicants', count: applicantStudents.length, icon: Clock },
          { id: 'letters', label: 'Admission Letters & Joining Forms', icon: Printer },
          { id: 'import', label: 'Bulk CSV Student Import', icon: Upload }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'admit') {
                  resetForm();
                }
                setActiveTab(tab.id as any);
              }}
              className={`flex items-center space-x-2 py-2.5 px-3.5 border-b-2 font-medium transition-colors whitespace-nowrap cursor-pointer rounded-t-lg text-xs ${
                isActive
                  ? 'border-blue-600 text-blue-700 font-bold bg-blue-50/50'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ALL ENROLLED STUDENTS REGISTER */}
      {/* ========================================================================= */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, adm no, UPI..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <select
                  value={gradeFilter}
                  onChange={e => setGradeFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="ALL">All Academic Levels (Playgroup → Grade 9)</option>
                  {grades.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.code})</option>
                  ))}
                </select>
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
                  <option value="ALL">All Classes / Streams</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="APPLICANT">APPLICANT</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="ALUMNI">ALUMNI / GRADUATED</option>
                  <option value="DEFERRED">DEFERRED</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
              <span>Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> admitted students</span>
              <button
                onClick={() => {
                  setDeleteAllConfirmInput('');
                  setIsDeleteAllModalOpen(true);
                }}
                disabled={students.length === 0}
                className="text-red-600 hover:text-red-800 font-semibold flex items-center space-x-1 cursor-pointer disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All Records</span>
              </button>
            </div>
          </div>

          {/* Student List Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Admission / UPI</th>
                    <th className="p-3.5">Student Full Name</th>
                    <th className="p-3.5">Grade / Stream / Program</th>
                    <th className="p-3.5">Campus</th>
                    <th className="p-3.5">Fee Balance</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Admissions Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-600">No student admission records found.</p>
                        <p className="text-xs text-slate-400 mt-1">Click "Admit New Student" to enroll your first student.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-mono">
                          <span className="font-bold text-blue-700 block">{s.admissionNo || 'PENDING'}</span>
                          {(s.learnerAssessmentNo || s.assessmentNumber) && (
                            <span className="text-[10px] text-slate-400 block font-mono">UPI: {s.learnerAssessmentNo || s.assessmentNumber}</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 text-sm">{s.fullName}</div>
                          <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                            {s.phone && <span>{s.phone}</span>}
                            {s.gender && <span>• {s.gender}</span>}
                            {s.academicYear && <span>• {s.academicYear}</span>}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-800">
                            {s.gradeName ? (
                              <span>{s.gradeName} {s.streamName ? `• Stream ${s.streamName}` : ''}</span>
                            ) : (
                              <span>{s.programName || 'Basic Curriculum'}</span>
                            )}
                          </div>
                          {s.className && <div className="text-[10px] text-slate-500 font-mono">Class: {s.className}</div>}
                        </td>
                        <td className="p-3.5 text-slate-600">{s.campusName || 'Main Campus'}</td>
                        <td className="p-3.5 font-mono font-bold">
                          <span className={s.feeBalance > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                            {currencySymbol} {(s.feeBalance || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
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
                            <button
                              onClick={() => setAdmissionLetterStudent(s)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center space-x-1"
                              title="Generate & Print Official Admission Letter"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Letter</span>
                            </button>

                            {onOpenFeePayment && (
                              <button
                                onClick={() => onOpenFeePayment(s.id)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                                title="Record fee payment receipt"
                              >
                                Fee
                              </button>
                            )}

                            <button
                              onClick={() => setViewingStudent(s)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="View Full Student Profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => openEditModal(s)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Student Record"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setDeleteCandidate(s)}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: NEW ADMISSION FORM (DEDICATED FULL-PAGE DESK) */}
      {/* ========================================================================= */}
      {activeTab === 'admit' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span>Student Admission Registration Desk</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Register a new learner, assign academic grade/program cohort, configure fee obligations, and issue joining instructions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Back to Register
            </button>
          </div>

          <form onSubmit={handleSaveStudent} className="space-y-6 text-xs">
            {/* 1. Student Personal Demographics */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-blue-800 flex items-center space-x-1.5">
                <span>1. Personal Demographics & Identification</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel Maina Mwangi"
                    value={formFullName}
                    onChange={e => setFormFullName(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Admission Number</label>
                  <input
                    type="text"
                    placeholder="e.g. ADM/2026/001"
                    value={formAdmissionNo}
                    onChange={e => setFormAdmissionNo(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">UPI / NEMIS / Assessment No</label>
                  <input
                    type="text"
                    placeholder="e.g. KICD-9812-402"
                    value={formLearnerAssessmentNo}
                    onChange={e => setFormLearnerAssessmentNo(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono uppercase"
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
                  <label className="font-semibold text-slate-700">National ID / Birth Cert No</label>
                  <input
                    type="text"
                    placeholder="e.g. 38291044 / BC-10294"
                    value={formNationalId}
                    onChange={e => setFormNationalId(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
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
                  <label className="font-semibold text-slate-700">Student Phone Contact</label>
                  <input
                    type="text"
                    placeholder="+254 700 111 222"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Physical Address / Hometown</label>
                  <input
                    type="text"
                    placeholder="P.O. Box 102 - 00100 Nairobi"
                    value={formAddress}
                    onChange={e => setFormAddress(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* 2. Academic Placement & Cohort */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-blue-800 flex items-center space-x-1.5">
                <span>2. Academic Placement & Cohort Assignment</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-700">Academic Level (Playgroup → Grade 9)</label>
                  <select
                    value={formGradeId}
                    onChange={e => {
                      setFormGradeId(e.target.value);
                      setFormStreamId('');
                    }}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="">-- Select Academic Level (Playgroup to Grade 9) --</option>
                    {grades.map(g => (
                      <option key={g.id} value={g.id}>{g.name} ({g.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Grade Stream (e.g. 4A, 4 Blue)</label>
                  <select
                    value={formStreamId}
                    onChange={e => setFormStreamId(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="">-- Select Stream --</option>
                    {streams.filter(s => !formGradeId || s.gradeId === formGradeId).map(s => (
                      <option key={s.id} value={s.id}>Stream {s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Program / Curriculum Course</label>
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
                  <label className="font-semibold text-slate-700">Academic Year & Term</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <select
                      value={formAcademicYear}
                      onChange={e => setFormAcademicYear(e.target.value)}
                      className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                    >
                      <option value="2025/2026">2025/2026</option>
                      <option value="2026/2027">2026/2027</option>
                      <option value="2024/2025">2024/2025</option>
                    </select>
                    <select
                      value={formAcademicTerm}
                      onChange={e => setFormAcademicTerm(e.target.value)}
                      className="p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                    >
                      <option value="Term 1">Term 1</option>
                      <option value="Term 2">Term 2</option>
                      <option value="Term 3">Term 3</option>
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Campus / Center</label>
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
                  <label className="font-semibold text-slate-700">Initial Fee Balance ({currencySymbol})</label>
                  <input
                    type="number"
                    value={formFeeBalance}
                    onChange={e => setFormFeeBalance(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* 3. Guardian & Emergency Contacts */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-blue-800 flex items-center space-x-1.5">
                <span>3. Parent / Guardian Contact Details</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="font-semibold text-slate-700">Guardian Name</label>
                  <input
                    type="text"
                    placeholder="Mary W. Mwangi"
                    value={formGuardianName}
                    onChange={e => setFormGuardianName(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Guardian Phone *</label>
                  <input
                    type="text"
                    placeholder="+254 722 000 111"
                    value={formGuardianPhone}
                    onChange={e => setFormGuardianPhone(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Guardian Email</label>
                  <input
                    type="email"
                    placeholder="guardian@gmail.com"
                    value={formGuardianEmail}
                    onChange={e => setFormGuardianEmail(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Relationship</label>
                  <input
                    type="text"
                    placeholder="Mother / Father / Guardian"
                    value={formGuardianRelation}
                    onChange={e => setFormGuardianRelation(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action Row */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs cursor-pointer flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? 'Admitting Student...' : 'Confirm & Complete Admission'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ADMISSION INQUIRIES & APPLICANTS PIPELINE */}
      {/* ========================================================================= */}
      {activeTab === 'applicants' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Admissions & Applicant Inquiries Pipeline</h3>
              <p className="text-xs text-slate-500">Review prospective learners, approve admission offers, and enroll onto the active register.</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setFormStatus('APPLICANT');
                setIsModalOpen(true);
              }}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Application</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Applicant Name</th>
                  <th className="p-3">Target Grade / Program</th>
                  <th className="p-3">Contact Details</th>
                  <th className="p-3">Parent / Guardian</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applicantStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      <Clock className="w-7 h-7 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600">No pending applicants found.</p>
                      <p className="text-xs text-slate-400 mt-0.5">All prospective learners have been admitted or enrolled.</p>
                    </td>
                  </tr>
                ) : (
                  applicantStudents.map(ap => (
                    <tr key={ap.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <strong className="text-slate-900 block">{ap.fullName}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">{ap.admissionNo || 'Ref: APP-' + ap.id.slice(0, 6)}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        {ap.gradeName || ap.programName || 'General Placement'}
                      </td>
                      <td className="p-3 text-slate-600">
                        <div>{ap.phone || 'No phone'}</div>
                        <div className="text-[10px] text-slate-400">{ap.email}</div>
                      </td>
                      <td className="p-3">
                        <div>{ap.guardianName || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400">{ap.guardianPhone}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                          {ap.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleQuickEnrollApplicant(ap)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer"
                          >
                            Approve & Enroll
                          </button>
                          <button
                            onClick={() => setAdmissionLetterStudent(ap)}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[11px] font-semibold hover:bg-blue-100"
                          >
                            Admission Letter
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
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ADMISSION LETTERS & JOINING FORMS HUB */}
      {/* ========================================================================= */}
      {activeTab === 'letters' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <span>Official Admission Letters & Joining Instructions Hub</span>
              </h3>
              <p className="text-xs text-slate-500">
                Select any enrolled student to generate and print their official institutional admission offer letter.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {students.slice(0, 15).map(st => (
              <div key={st.id} className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-xs">{st.fullName}</p>
                  <p className="font-mono text-[10px] text-blue-700 font-semibold">{st.admissionNo}</p>
                  <p className="text-[10px] text-slate-500">{st.gradeName || st.programName}</p>
                </div>
                <button
                  onClick={() => setAdmissionLetterStudent(st)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Letter</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: BULK CSV IMPORT */}
      {/* ========================================================================= */}
      {activeTab === 'import' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Bulk Student CSV Import</h3>
            <p className="text-xs text-slate-500 mt-0.5">Upload a CSV spreadsheet with learner rows to admit multiple students at once.</p>
          </div>

          {importError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {importError}
            </div>
          )}

          {importStep === 'upload' ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <label className="block text-xs font-semibold text-blue-600 cursor-pointer">
                  <span className="px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg inline-block">Choose CSV file to upload</span>
                  <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                </label>
                <p className="text-[11px] text-slate-400 mt-2">CSV must include columns: fullName, email, phone, grade/program, feeBalance</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Parsed {parsedStudents.length} Students Preview:</span>
                <span className="text-slate-500 font-mono text-[11px]">{importFileName}</span>
              </div>
              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                {parsedStudents.map((st, i) => (
                  <div key={i} className="p-2.5 bg-white rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{st.fullName}</span>
                      <div className="text-[10px] text-slate-500">{st.email || st.phone} • {st.programName}</div>
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  {importing ? 'Importing...' : `Import ${parsedStudents.length} Students`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
                <label className="font-semibold text-slate-700">Admission Number</label>
                <input
                  type="text"
                  placeholder="e.g. ADM/2026/049"
                  value={formAdmissionNo}
                  onChange={e => setFormAdmissionNo(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Learner Assessment No / UPI</label>
                <input
                  type="text"
                  placeholder="e.g. KICD-9812-402"
                  value={formLearnerAssessmentNo}
                  onChange={e => setFormLearnerAssessmentNo(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono uppercase"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Grade (Basic School Gr 1–9)</label>
                <select
                  value={formGradeId}
                  onChange={e => {
                    setFormGradeId(e.target.value);
                    setFormStreamId('');
                  }}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                >
                  <option value="">-- Select Grade (Optional) --</option>
                  {grades.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Stream (e.g. 4A, 4B)</label>
                <select
                  value={formStreamId}
                  onChange={e => setFormStreamId(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                >
                  <option value="">-- Select Stream --</option>
                  {streams.filter(s => !formGradeId || s.gradeId === formGradeId).map(s => (
                    <option key={s.id} value={s.id}>Stream {s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Program / Course</label>
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

      {/* VIEW STUDENT DETAILS MODAL */}
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
                <span className="text-[10px] text-slate-400 font-medium">Grade / Stream</span>
                <p className="font-bold text-slate-900">
                  {viewingStudent.gradeName ? (
                    <span>{viewingStudent.gradeName} {viewingStudent.streamName ? `• Stream ${viewingStudent.streamName}` : ''}</span>
                  ) : (
                    <span className="text-slate-400 font-normal">Not Assigned</span>
                  )}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg space-y-0.5">
                <span className="text-[10px] text-slate-400 font-medium">Assessment / UPI No</span>
                <p className="font-bold text-slate-900 font-mono">
                  {viewingStudent.learnerAssessmentNo || viewingStudent.assessmentNumber || <span className="text-slate-400 font-normal">N/A</span>}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg space-y-0.5">
                <span className="text-[10px] text-slate-400 font-medium">Program / Course</span>
                <p className="font-bold text-slate-900">{viewingStudent.programName || 'Basic School Curriculum'}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg space-y-0.5">
                <span className="text-[10px] text-slate-400 font-medium">Fee Balance</span>
                <p className="font-bold text-amber-600 font-mono">
                  {currencySymbol} {(viewingStudent.feeBalance || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg space-y-0.5">
                <span className="text-[10px] text-slate-400 font-medium">Contact Phone</span>
                <p className="font-mono text-slate-800">{viewingStudent.phone || 'N/A'}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg space-y-0.5">
                <span className="text-[10px] text-slate-400 font-medium">Guardian</span>
                <p className="text-slate-800">{viewingStudent.guardianName || 'N/A'} ({viewingStudent.guardianRelation || 'Parent'})</p>
                <p className="font-mono text-[10px] text-slate-500">{viewingStudent.guardianPhone}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  const s = viewingStudent;
                  setViewingStudent(null);
                  setAdmissionLetterStudent(s);
                }}
                className="px-3.5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Admission Letter</span>
              </button>

              <div className="flex items-center space-x-2">
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
        </div>
      )}

      {/* PRINT OFFICIAL ADMISSION LETTER MODAL */}
      {admissionLetterStudent && (
        <StudentAdmissionLetterModal
          student={admissionLetterStudent}
          onClose={() => setAdmissionLetterStudent(null)}
          currencySymbol={currencySymbol}
        />
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
    </div>
  );
};
