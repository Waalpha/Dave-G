import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  Student, LecturerStaff, Campus, Program, FeePayment, TimetableEntry, AcademicYear, EducationType
} from '../../../types';
import {
  GraduationCap, Users, BookOpen, Calendar, DollarSign, Library, Building, Building2,
  Plus, Search, CheckCircle, FileText, Clock, Layers, Award, Shield, ArrowUpRight,
  Download, Upload, FileSpreadsheet, X, Check, AlertCircle, Trash2
} from 'lucide-react';
import { DepartmentManagement } from './DepartmentManagement';

export const EducationDashboard: React.FC = () => {
  const { tenant } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Education state
  const [summary, setSummary] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [academics, setAcademics] = useState<any>(null);
  const [faculty, setFaculty] = useState<LecturerStaff[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Institution Setup / Education Type State
  const [educationType, setEducationType] = useState<EducationType>(
    tenant?.educationType || 'TVET'
  );

  // Student Search Filter
  const [studentSearch, setStudentSearch] = useState('');

  // New Student Modal Form
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentProgram, setNewStudentProgram] = useState('prog_1');
  const [newStudentGender, setNewStudentGender] = useState('Male');

  // Fee Payment Modal Form
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payStudentId, setPayStudentId] = useState('');
  const [payAmount, setPayAmount] = useState('15000');
  const [payMethod, setPayMethod] = useState<'M-PESA' | 'BANK_TRANSFER' | 'CHEQUE'>('M-PESA');
  const [payRef, setPayRef] = useState('QKH9201481');

  // Student Bulk Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState<'upload' | 'preview'>('upload');
  const [parsedStudents, setParsedStudents] = useState<Array<Partial<Student>>>([]);
  const [importFileName, setImportFileName] = useState('');
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);

  // Deletion modals state
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState<LecturerStaff | null>(null);
  const [isDeletingFaculty, setIsDeletingFaculty] = useState(false);
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  const getHeaders = () => ({
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchEducationData = async () => {
    try {
      setLoading(true);
      const [resSum, resStud, resAcad, resFac, resPay, resTT] = await Promise.all([
        fetch('/api/app/education/summary', { headers: getHeaders() }),
        fetch('/api/app/education/students', { headers: getHeaders() }),
        fetch('/api/app/education/academics', { headers: getHeaders() }),
        fetch('/api/app/education/faculty', { headers: getHeaders() }),
        fetch('/api/app/education/payments', { headers: getHeaders() }),
        fetch('/api/app/education/timetable', { headers: getHeaders() })
      ]);

      if (resSum.ok) setSummary(await resSum.json().catch(() => null));
      if (resStud.ok) {
        const sData = await resStud.json().catch(() => []);
        if (Array.isArray(sData)) {
          setStudents(sData);
          if (sData.length > 0) setPayStudentId(sData[0].id);
        }
      }
      if (resAcad.ok) setAcademics(await resAcad.json().catch(() => null));
      if (resFac.ok) setFaculty(await resFac.json().catch(() => []));
      if (resPay.ok) setPayments(await resPay.json().catch(() => []));
      if (resTT.ok) setTimetable(await resTT.json().catch(() => []));
    } catch (e) {
      console.error('Error loading education data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducationData();
  }, []);

  const handleAdmitStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName) return;

    try {
      const selectedProg = academics?.programs?.find((p: any) => p.id === newStudentProgram);
      const res = await fetch('/api/app/education/students', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          admissionNo: `BITC/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
          fullName: newStudentName,
          email: newStudentEmail || `${newStudentName.toLowerCase().replace(/\s+/g, '.')}@student.ac.ke`,
          phone: newStudentPhone || '+254 700 000 000',
          programId: newStudentProgram,
          programName: selectedProg?.name || 'Diploma Program',
          campusId: 'camp_1',
          campusName: 'Main Campus',
          academicYear: '2025/2026',
          status: 'ACTIVE',
          feeBalance: 25000,
          gender: newStudentGender,
          dateOfBirth: '2003-01-01',
          guardianName: 'Guardian',
          guardianPhone: '+254 711 000 000'
        })
      });

      if (res.ok) {
        setIsAdmitModalOpen(false);
        setNewStudentName('');
        fetchEducationData();
      }
    } catch (err) {
      console.error('Admit error:', err);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payStudentId) return;

    try {
      const res = await fetch('/api/app/education/payments', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          studentId: payStudentId,
          amount: parseFloat(payAmount),
          paymentMethod: payMethod,
          referenceNo: payRef,
          receivedBy: 'Bursar / Accounts Office'
        })
      });

      if (res.ok) {
        setIsPaymentModalOpen(false);
        fetchEducationData();
      }
    } catch (err) {
      console.error('Payment error:', err);
    }
  };

  const handleConfirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    try {
      setIsDeletingStudent(true);
      const res = await fetch(`/api/app/education/students/${studentToDelete.id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        const name = studentToDelete.fullName;
        setStudentToDelete(null);
        setActionNotification(`Student record for "${name}" successfully deleted.`);
        fetchEducationData();
        setTimeout(() => setActionNotification(null), 4000);
      }
    } catch (err) {
      console.error('Delete student error:', err);
    } finally {
      setIsDeletingStudent(false);
    }
  };

  const handleConfirmDeleteFaculty = async () => {
    if (!facultyToDelete) return;
    try {
      setIsDeletingFaculty(true);
      const res = await fetch(`/api/app/education/faculty/${facultyToDelete.id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        const name = facultyToDelete.fullName;
        setFacultyToDelete(null);
        setActionNotification(`Staff member "${name}" successfully deleted.`);
        fetchEducationData();
        setTimeout(() => setActionNotification(null), 4000);
      }
    } catch (err) {
      console.error('Delete faculty error:', err);
    } finally {
      setIsDeletingFaculty(false);
    }
  };

  // Filtered Students
  const filteredStudents = students.filter(s => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return (
      (s.fullName || '').toLowerCase().includes(q) ||
      (s.admissionNo || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.programName || '').toLowerCase().includes(q) ||
      (s.campusName || '').toLowerCase().includes(q)
    );
  });

  // CSV Export Handler
  const handleExportStudentsCSV = () => {
    const listToExport = filteredStudents.length > 0 ? filteredStudents : students;
    if (!listToExport || listToExport.length === 0) {
      alert('No student records available to export.');
      return;
    }

    const headers = [
      'Admission No',
      'Full Name',
      'Email',
      'Phone',
      'Program Name',
      'Campus Name',
      'Fee Balance',
      'Guardian Name',
      'Guardian Phone',
      'Status'
    ];

    const rows = listToExport.map(s => [
      `"${(s.admissionNo || '').replace(/"/g, '""')}"`,
      `"${(s.fullName || '').replace(/"/g, '""')}"`,
      `"${(s.email || '').replace(/"/g, '""')}"`,
      `"${(s.phone || '').replace(/"/g, '""')}"`,
      `"${(s.programName || '').replace(/"/g, '""')}"`,
      `"${(s.campusName || '').replace(/"/g, '""')}"`,
      s.feeBalance || 0,
      `"${(s.guardianName || '').replace(/"/g, '""')}"`,
      `"${(s.guardianPhone || '').replace(/"/g, '""')}"`,
      `"${(s.status || 'ACTIVE').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const sanitizedTenant = (tenant?.name || 'institution').toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.setAttribute('download', `students_export_${sanitizedTenant}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Template Download Handler
  const handleDownloadCSVTemplate = () => {
    const headers = ['fullName', 'email', 'phone', 'programName', 'campusName', 'guardianName', 'guardianPhone', 'feeBalance'];
    const sampleRows = [
      ['Jane Mwangi', 'jane.mwangi@student.edu', '+254712345678', 'Diploma in Business Management', 'Main Campus', 'Peter Mwangi', '+254722334455', '25000'],
      ['Kevin Omondi', 'kevin.omondi@student.edu', '+254798765432', 'Diploma in Information Technology', 'Town Campus', 'Mary Omondi', '+254733445566', '18000'],
      ['Sarah Chebet', 'sarah.chebet@student.edu', '+254701234567', 'Certificate in Software Engineering', 'Main Campus', 'David Chebet', '+254711223344', '0']
    ];
    const csvContent = [headers.join(','), ...sampleRows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `students_import_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV File Upload & Parsing Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setImportError('');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error('Uploaded CSV file appears to be empty.');

        const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          throw new Error('CSV file must contain a header row and at least 1 student row.');
        }

        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let cur = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' || char === "'") {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(cur.trim().replace(/^["']|["']$/g, ''));
              cur = '';
            } else {
              cur += char;
            }
          }
          result.push(cur.trim().replace(/^["']|["']$/g, ''));
          return result;
        };

        const rawHeaders = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
        
        const parsed: Array<Partial<Student>> = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVLine(lines[i]);
          if (cols.length === 0 || cols.every(c => !c)) continue;

          const getCol = (possibleNames: string[]): string => {
            for (const name of possibleNames) {
              const idx = rawHeaders.findIndex(h => h.includes(name));
              if (idx !== -1 && cols[idx]) return cols[idx];
            }
            return '';
          };

          const fullName = getCol(['fullname', 'studentname', 'name', 'student']);
          if (!fullName) continue;

          const email = getCol(['email', 'mail']);
          const phone = getCol(['phone', 'contact', 'mobile']);
          const programName = getCol(['program', 'course']);
          const campusName = getCol(['campus', 'branch']);
          const guardianName = getCol(['guardianname', 'parentname', 'guardian', 'parent']);
          const guardianPhone = getCol(['guardianphone', 'parentphone']);
          const feeBalanceStr = getCol(['feebalance', 'balance', 'fee']);
          const admissionNo = getCol(['admissionno', 'admno', 'admission']);

          parsed.push({
            admissionNo: admissionNo || undefined,
            fullName,
            email,
            phone,
            programName: programName || academics?.programs?.[0]?.name || 'Diploma Program',
            campusName: campusName || academics?.campuses?.[0]?.name || 'Main Campus',
            guardianName: guardianName || 'N/A',
            guardianPhone: guardianPhone || 'N/A',
            feeBalance: parseFloat(feeBalanceStr) || 0,
            status: 'ACTIVE'
          });
        }

        if (parsed.length === 0) {
          throw new Error('No valid student rows found. Please ensure headers include fullName, email, phone, etc.');
        }

        setParsedStudents(parsed);
        setImportStep('preview');
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse CSV file.');
      }
    };

    reader.readAsText(file);
  };

  // Confirm Bulk Import
  const handleConfirmBulkImport = async () => {
    if (parsedStudents.length === 0) return;

    setImporting(true);
    setImportError('');
    try {
      const res = await fetch('/api/app/education/students/bulk-import', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ students: parsedStudents })
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.addedCount) {
        setIsImportModalOpen(false);
        setParsedStudents([]);
        setImportStep('upload');
        setImportFileName('');
        fetchEducationData();
      } else {
        setImportError(data?.error || 'Failed to import students.');
      }
    } catch (err: any) {
      setImportError('An error occurred while attempting bulk import.');
    } finally {
      setImporting(false);
    }
  };

  const currencySymbol = tenant?.branding?.currencySymbol || 'KSh';

  return (
    <div className="space-y-6">
      {/* Education Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center font-bold">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900">Education & School ERP</h2>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[11px] font-bold">
                {educationType} Institution
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Integrated academic management for {tenant?.name}. Manage admissions, courses, fees, lecturers, timetables, and library.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAdmitModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Admit New Student</span>
          </button>

          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <DollarSign className="w-4 h-4" />
            <span>Record Fee Payment</span>
          </button>
        </div>
      </div>

      {/* Education Sub-Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 bg-white px-4 rounded-xl shadow-2xs gap-2 py-1 text-xs font-medium text-slate-600">
        {[
          { id: 'overview', label: 'Overview & Analytics', icon: Layers },
          { id: 'departments', label: 'Departments', icon: Building2 },
          { id: 'students', label: 'Students & Admissions', icon: Users },
          { id: 'academics', label: 'Programs, Units & Campuses', icon: BookOpen },
          { id: 'faculty', label: 'Lecturers & Staff', icon: Award },
          { id: 'timetable', label: 'Timetable & Attendance', icon: Calendar },
          { id: 'fees', label: 'Fees & Payments Ledger', icon: DollarSign },
          { id: 'facilities', label: 'Library, Hostel & Transport', icon: Library },
          { id: 'setup', label: 'Institution Profile & Setup', icon: Building }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center space-x-2 py-2.5 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-700 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-1">
              <span className="text-xs font-medium text-slate-500">Total Enrolled Students</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900">{summary?.totalStudents || students.length}</span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-[11px] text-emerald-600 font-medium">Active Status: {summary?.activeStudents || students.length}</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-1">
              <span className="text-xs font-medium text-slate-500">Total Fee Collections</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900">
                  {currencySymbol} {(summary?.totalCollected || 0).toLocaleString()}
                </span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-[11px] text-slate-500">M-Pesa & Bank Receipts</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-1">
              <span className="text-xs font-medium text-slate-500">Outstanding Fee Balances</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-amber-600">
                  {currencySymbol} {(summary?.totalOutstanding || 0).toLocaleString()}
                </span>
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-[11px] text-slate-500">Student Ledger Balances</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-1">
              <span className="text-xs font-medium text-slate-500">Faculty & Campuses</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900">{faculty.length} Lecturers</span>
                <Building className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-[11px] text-slate-500">Across {academics?.campuses?.length || 3} Campuses</p>
            </div>
          </div>

          {/* Quick Enrolled Student Table Preview */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Recent Student Admissions</h3>
                <p className="text-xs text-slate-500">Currently registered students in {tenant?.name}</p>
              </div>
              <button
                onClick={() => setActiveSubTab('students')}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                View All Students →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="p-3">Admission No</th>
                    <th className="p-3">Student Full Name</th>
                    <th className="p-3">Program</th>
                    <th className="p-3">Campus</th>
                    <th className="p-3">Fee Balance</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-700">{s.admissionNo}</td>
                      <td className="p-3 font-semibold text-slate-900">{s.fullName}</td>
                      <td className="p-3">{s.programName}</td>
                      <td className="p-3">{s.campusName}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {currencySymbol} {s.feeBalance.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DEPARTMENTS MANAGEMENT */}
      {activeSubTab === 'departments' && (
        <DepartmentManagement educationType={educationType} />
      )}

      {/* TAB 2: STUDENTS & ADMISSIONS */}
      {activeSubTab === 'students' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <span>Student Admissions & Directory</span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
                  {filteredStudents.length} {filteredStudents.length === 1 ? 'Student' : 'Students'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Manage enrolled student profiles, academic status, fee statements, and bulk CSV operations.</p>
            </div>

            <div className="flex items-center flex-wrap gap-2.5">
              <button
                onClick={handleExportStudentsCSV}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="Export current student list as CSV"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => {
                  setImportStep('upload');
                  setImportError('');
                  setParsedStudents([]);
                  setImportFileName('');
                  setIsImportModalOpen(true);
                }}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="Bulk import students from CSV file"
              >
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Import CSV</span>
              </button>

              <button
                onClick={() => setIsAdmitModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Student Admission</span>
              </button>
            </div>
          </div>

          {/* Search Filter Bar */}
          <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name, admission no, email, program or campus..."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {studentSearch && (
              <button
                onClick={() => setStudentSearch('')}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2"
              >
                Clear
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase">
                <tr>
                  <th className="p-3">Admission No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Email & Contact</th>
                  <th className="p-3">Enrolled Program</th>
                  <th className="p-3">Campus</th>
                  <th className="p-3">Fee Balance</th>
                  <th className="p-3">Guardian Info</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      No students found matching your search term.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-700">{s.admissionNo}</td>
                      <td className="p-3 font-semibold text-slate-900">{s.fullName}</td>
                      <td className="p-3 text-slate-500">
                        <div>{s.email}</div>
                        <div className="text-[11px] font-mono text-slate-400">{s.phone}</div>
                      </td>
                      <td className="p-3 font-medium">{s.programName}</td>
                      <td className="p-3 text-slate-600">{s.campusName || 'Main Campus'}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {currencySymbol} {(s.feeBalance || 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-slate-500 text-[11px]">
                        <div>{s.guardianName}</div>
                        <div className="font-mono text-slate-400">{s.guardianPhone}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => {
                              setPayStudentId(s.id);
                              setIsPaymentModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Receive Fee
                          </button>
                          <button
                            onClick={() => setStudentToDelete(s)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Delete Student Record"
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
      )}

      {/* TAB 3: ACADEMICS & PROGRAMS */}
      {activeSubTab === 'academics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Programs & Qualifications Offered</span>
            </h3>
            <div className="space-y-2">
              {academics?.programs?.map((p: Program) => (
                <div key={p.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{p.name}</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-mono font-bold">
                      {p.code}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Level: {p.level}</span>
                    <span>Duration: {p.durationYears} Year(s)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Building className="w-4 h-4 text-indigo-600" />
              <span>Campuses & Facilities</span>
            </h3>
            <div className="space-y-2">
              {academics?.campuses?.map((c: Campus) => (
                <div key={c.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-slate-900">{c.name}</p>
                    <p className="text-[11px] text-slate-500">{c.location}</p>
                  </div>
                  {c.isMain && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                      Main Campus
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FACULTY & LECTURERS */}
      {activeSubTab === 'faculty' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Lecturers & Teaching Staff Directory</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {faculty.map(f => (
              <div key={f.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2 relative group">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 text-white font-bold text-sm rounded-full flex items-center justify-center shrink-0">
                    {f.fullName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-xs truncate">{f.fullName}</p>
                    <p className="text-[11px] text-blue-600 font-semibold truncate">{f.designation}</p>
                  </div>
                  <button
                    onClick={() => setFacultyToDelete(f)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Staff Member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200 space-y-0.5">
                  <p>Department: {f.departmentName}</p>
                  <p className="font-mono text-[10px]">Email: {f.email}</p>
                  <p className="font-mono text-[10px]">Phone: {f.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: TIMETABLE */}
      {activeSubTab === 'timetable' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Academic Timetable & Lecture Schedule</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase">
                <tr>
                  <th className="p-3">Day</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Unit / Subject</th>
                  <th className="p-3">Lecturer</th>
                  <th className="p-3">Venue / Lab</th>
                  <th className="p-3">Student Group</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {timetable.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-blue-700">{t.dayOfWeek}</td>
                    <td className="p-3 font-mono">{t.startTime} - {t.endTime}</td>
                    <td className="p-3 font-semibold text-slate-900">
                      {t.unitCode}: {t.unitName}
                    </td>
                    <td className="p-3">{t.lecturerName}</td>
                    <td className="p-3 font-mono">{t.roomVenue}</td>
                    <td className="p-3">{t.groupName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: FEES & PAYMENTS */}
      {activeSubTab === 'fees' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Fee Payments & M-Pesa Receipt Logs</h3>
              <p className="text-xs text-slate-500">Official fee ledger entries recorded for {tenant?.name}.</p>
            </div>
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5"
            >
              <DollarSign className="w-4 h-4" />
              <span>Record Payment Receipt</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase">
                <tr>
                  <th className="p-3">Receipt No</th>
                  <th className="p-3">Payment Date</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Admission No</th>
                  <th className="p-3">Method & Ref</th>
                  <th className="p-3">Amount Paid</th>
                  <th className="p-3">Cashier / Bursar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-emerald-700">{p.receiptNo}</td>
                    <td className="p-3 font-mono text-slate-500">{new Date(p.paidAt).toLocaleDateString()}</td>
                    <td className="p-3 font-semibold text-slate-900">{p.studentName}</td>
                    <td className="p-3 font-mono">{p.admissionNo}</td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-800">{p.paymentMethod}</span>
                      <div className="text-[11px] font-mono text-slate-500">{p.referenceNo}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-700 text-sm">
                      {currencySymbol} {p.amount.toLocaleString()}
                    </td>
                    <td className="p-3 text-slate-500">{p.receivedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: FACILITIES */}
      {activeSubTab === 'facilities' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Library className="w-4 h-4 text-blue-600" />
              <span>Library Management</span>
            </h3>
            <p className="text-xs text-slate-500">Catalog of 1,240 physical & digital textbooks available for borrowing.</p>
            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <p className="font-semibold text-slate-900">Total Books: 1,240</p>
              <p className="text-slate-600">Currently Borrowed: 142</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>Hostels & Accommodation</span>
            </h3>
            <p className="text-xs text-slate-500">Student residential blocks and room capacity allocations.</p>
            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <p className="font-semibold text-slate-900">Hostel Block A & B</p>
              <p className="text-slate-600">Capacity: 120 / 150 Occupied</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Transport & Routes</span>
            </h3>
            <p className="text-xs text-slate-500">Campus shuttle buses and daily commuter transport logs.</p>
            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <p className="font-semibold text-slate-900">3 Active Campus Buses</p>
              <p className="text-slate-600">Routes: CBD, Westlands, Eastlands</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: INSTITUTION SETUP */}
      {activeSubTab === 'setup' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-2xl space-y-6">
          <h3 className="font-bold text-slate-900 text-base">Institution Type Adaptation Setup</h3>
          <p className="text-xs text-slate-500">
            Select your specific education subtype. The ERP adapts terminology, grading, and course structures automatically.
          </p>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700">Education Category</label>
            <select
              value={educationType}
              onChange={e => setEducationType(e.target.value as EducationType)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-medium"
            >
              <option value="UNIVERSITY">University (Degrees & Master Programs)</option>
              <option value="COLLEGE">College (Higher Diplomas & Certificates)</option>
              <option value="TVET">TVET / Vocational Training Institute</option>
              <option value="SECONDARY_SCHOOL">Secondary High School</option>
              <option value="PRIMARY_SCHOOL">Primary School</option>
              <option value="TRAINING_INSTITUTE">Professional Corporate Institute</option>
            </select>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
            <span className="font-bold">Active Configuration:</span>
            <p>
              The system is tailored for <strong className="underline">{educationType}</strong> operations with semester terms, diploma/certificate program levels, and TVET curriculum units.
            </p>
          </div>
        </div>
      )}

      {/* ADMIT STUDENT MODAL */}
      {isAdmitModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAdmitStudent} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-slate-900">New Student Admission Entry</h3>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Maina Mwangi"
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    placeholder="s.maina@student.ac.ke"
                    value={newStudentEmail}
                    onChange={e => setNewStudentEmail(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+254 700 111 222"
                    value={newStudentPhone}
                    onChange={e => setNewStudentPhone(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Program / Course *</label>
                <select
                  value={newStudentProgram}
                  onChange={e => setNewStudentProgram(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  {academics?.programs?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button type="button" onClick={() => setIsAdmitModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">
                Confirm Admission
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleRecordPayment} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-slate-900">Record Fee Payment Receipt</h3>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Select Student *</label>
                <select
                  value={payStudentId}
                  onChange={e => setPayStudentId(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.admissionNo}) - Fee Balance: {currencySymbol} {s.feeBalance}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Amount Paid ({currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value as any)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="M-PESA">M-PESA Mobile Money</option>
                    <option value="BANK_TRANSFER">Bank Direct Deposit</option>
                    <option value="CHEQUE">Banker's Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Transaction Reference No / Receipt *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. QKH9201481"
                  value={payRef}
                  onChange={e => setPayRef(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">
                Generate Receipt
              </button>
            </div>
          </form>
        </div>
      )}

      {/* BULK IMPORT STUDENTS MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Bulk Import Student Records</h3>
                  <p className="text-xs text-slate-500">Upload CSV spreadsheet to batch admit students into {tenant?.name}.</p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner */}
            {importError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{importError}</span>
              </div>
            )}

            {/* STEP 1: UPLOAD CSV */}
            {importStep === 'upload' && (
              <div className="space-y-5">
                <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-indigo-950">Need a CSV template?</h4>
                    <p className="text-xs text-indigo-800">Download our formatted sample CSV with required column headers.</p>
                  </div>
                  <button
                    onClick={handleDownloadCSVTemplate}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Template (.csv)</span>
                  </button>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-indigo-400 transition-colors bg-slate-50/50 space-y-3">
                  <div className="w-12 h-12 bg-white rounded-full shadow-xs border border-slate-200 flex items-center justify-center mx-auto text-indigo-600">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="cursor-pointer text-indigo-600 hover:text-indigo-700 font-bold underline">
                      <span>Click to browse CSV file</span>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-slate-500 mt-1">or select your CSV spreadsheet file here</p>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Supported Headers: fullName, email, phone, programName, campusName, guardianName, guardianPhone, feeBalance
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: PREVIEW & CONFIRM */}
            {importStep === 'preview' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-slate-800">
                      Parsed <strong className="text-indigo-600">{parsedStudents.length}</strong> valid student records from <span className="font-mono text-slate-600">{importFileName}</span>
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setImportStep('upload');
                      setParsedStudents([]);
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Choose Different File
                  </button>
                </div>

                <div className="overflow-x-auto max-h-60 border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 text-slate-600 font-mono text-[10px] uppercase sticky top-0">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">Student Name</th>
                        <th className="p-2.5">Email</th>
                        <th className="p-2.5">Phone</th>
                        <th className="p-2.5">Program</th>
                        <th className="p-2.5">Campus</th>
                        <th className="p-2.5">Fee Balance</th>
                        <th className="p-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {parsedStudents.map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-2.5 font-semibold text-slate-900">{s.fullName}</td>
                          <td className="p-2.5 text-slate-600">{s.email || '-'}</td>
                          <td className="p-2.5 font-mono text-slate-600">{s.phone || '-'}</td>
                          <td className="p-2.5 text-slate-800">{s.programName}</td>
                          <td className="p-2.5 text-slate-600">{s.campusName}</td>
                          <td className="p-2.5 font-mono font-bold text-slate-900">
                            {currencySymbol} {(s.feeBalance || 0).toLocaleString()}
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => {
                                setParsedStudents(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                              title="Remove row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <span className="text-xs text-slate-500">
                    Ready to admit {parsedStudents.length} students into ERP system.
                  </span>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsImportModalOpen(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmBulkImport}
                      disabled={importing || parsedStudents.length === 0}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center space-x-2 shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      <span>{importing ? 'Importing Students...' : `Admit ${parsedStudents.length} Students`}</span>
                      {!importing && <Check className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Notification Banner */}
      {actionNotification && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-3 text-xs z-50 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotification}</span>
        </div>
      )}

      {/* Delete Student In-App Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center font-bold shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Student Record</h3>
                <p className="text-xs text-slate-500">Permanent removal of academic profile</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-slate-900">{studentToDelete.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Admission No:</span>
                <span className="font-mono font-bold text-blue-600">{studentToDelete.admissionNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Program:</span>
                <span className="text-slate-800">{studentToDelete.programName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Outstanding Balance:</span>
                <span className="font-mono font-bold text-slate-900">{currencySymbol} {(studentToDelete.feeBalance || 0).toLocaleString()}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this student record? All associated enrollment records and fee accounts will be removed.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                disabled={isDeletingStudent}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStudent}
                disabled={isDeletingStudent}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isDeletingStudent ? (
                  <span>Deleting Record...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm &amp; Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Faculty In-App Confirmation Modal */}
      {facultyToDelete && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center font-bold shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Faculty / Staff</h3>
                <p className="text-xs text-slate-500">Remove staff member profile</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Full Name:</span>
                <span className="font-bold text-slate-900">{facultyToDelete.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Designation:</span>
                <span className="font-medium text-slate-800">{facultyToDelete.designation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="text-slate-800">{facultyToDelete.departmentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono text-slate-700">{facultyToDelete.email}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove this lecturer/staff member from the institutional directory?
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setFacultyToDelete(null)}
                disabled={isDeletingFaculty}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteFaculty}
                disabled={isDeletingFaculty}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isDeletingFaculty ? (
                  <span>Deleting Staff...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm &amp; Remove Staff</span>
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
