import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  Student, LecturerStaff, FeePayment, TimetableEntry, EducationType
} from '../../../types';
import {
  GraduationCap, Users, BookOpen, Calendar, DollarSign, Building, Building2,
  Plus, Layers, Award, ArrowUpRight, TrendingUp,
  FileSpreadsheet, CheckCircle2, Clock
} from 'lucide-react';
import { StudentManagement } from './StudentManagement';
import { FacultyManagement } from './FacultyManagement';
import { DepartmentManagement } from './DepartmentManagement';
import { AcademicsManagement } from './AcademicsManagement';
import { ClassManagement } from './ClassManagement';
import { FeesFinanceManagement } from './FeesFinanceManagement';
import { TimetableAttendance } from './TimetableAttendance';
import { ExamGradingManagement } from './ExamGradingManagement';

export const EducationDashboard: React.FC = () => {
  const { tenant } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Overview summary state
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

  // Quick Admit Modal Form
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentProgram, setNewStudentProgram] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'Male' | 'Female' | 'Other'>('Male');

  // Quick Fee Payment Modal Form
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payStudentId, setPayStudentId] = useState('');
  const [payAmount, setPayAmount] = useState('15000');
  const [payMethod, setPayMethod] = useState<'M-PESA' | 'BANK_TRANSFER' | 'CHEQUE' | 'CASH'>('M-PESA');
  const [payRef, setPayRef] = useState('');

  const getHeaders = () => ({
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchOverviewData = async () => {
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
          if (sData.length > 0 && !payStudentId) setPayStudentId(sData[0].id);
        }
      }
      if (resAcad.ok) {
        const aData = await resAcad.json().catch(() => null);
        setAcademics(aData);
        if (aData?.programs?.length > 0 && !newStudentProgram) {
          setNewStudentProgram(aData.programs[0].id);
        }
      }
      if (resFac.ok) setFaculty(await resFac.json().catch(() => []));
      if (resPay.ok) setPayments(await resPay.json().catch(() => []));
      if (resTT.ok) setTimetable(await resTT.json().catch(() => []));
    } catch (e) {
      console.error('Error loading education overview data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, [activeSubTab]);

  const handleQuickAdmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    try {
      const selectedProg = academics?.programs?.find((p: any) => p.id === newStudentProgram) || academics?.programs?.[0];
      const res = await fetch('/api/app/education/students', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          fullName: newStudentName.trim(),
          email: newStudentEmail.trim() || `${newStudentName.toLowerCase().replace(/\s+/g, '.')}@student.ac.ke`,
          phone: newStudentPhone.trim() || '+254 700 000 000',
          programId: selectedProg?.id || 'prog_1',
          programName: selectedProg?.name || 'Academic Program',
          campusId: academics?.campuses?.[0]?.id || 'camp_1',
          campusName: academics?.campuses?.[0]?.name || 'Main Campus',
          academicYear: '2025/2026',
          status: 'ACTIVE',
          feeBalance: 25000,
          gender: newStudentGender,
          dateOfBirth: '2004-01-01',
          guardianName: 'Parent / Guardian',
          guardianPhone: '+254 711 000 000'
        })
      });

      if (res.ok) {
        setIsAdmitModalOpen(false);
        setNewStudentName('');
        setNewStudentEmail('');
        setNewStudentPhone('');
        fetchOverviewData();
      }
    } catch (err) {
      console.error('Quick admit error:', err);
    }
  };

  const handleQuickPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payStudentId || !payAmount) return;

    try {
      const res = await fetch('/api/app/education/payments', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          studentId: payStudentId,
          amount: parseFloat(payAmount) || 0,
          paymentMethod: payMethod,
          referenceNo: payRef.trim() || `RCP-${Math.floor(100000 + Math.random() * 900000)}`,
          receivedBy: 'Bursar / Accounts Office'
        })
      });

      if (res.ok) {
        setIsPaymentModalOpen(false);
        setPayRef('');
        fetchOverviewData();
      }
    } catch (err) {
      console.error('Quick payment error:', err);
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
              <h2 className="text-xl font-bold text-slate-900">School & Academic ERP</h2>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[11px] font-bold">
                {educationType}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Integrated multi-tenant academic and financial operations for {tenant?.name || 'Institution'}.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAdmitModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Admit Student</span>
          </button>

          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <DollarSign className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Education Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 bg-white px-3 rounded-xl shadow-2xs gap-1.5 py-1 text-xs font-medium text-slate-600">
        {[
          { id: 'overview', label: 'Overview', icon: Layers },
          { id: 'students', label: 'Students & Admissions', icon: Users },
          { id: 'faculty', label: 'Lecturers & Staff', icon: Award },
          { id: 'departments', label: 'Departments', icon: Building2 },
          { id: 'academics', label: 'Courses & Units', icon: BookOpen },
          { id: 'classes', label: 'Classes & Cohorts', icon: Layers },
          { id: 'fees', label: 'Fees & Invoices', icon: DollarSign },
          { id: 'timetable', label: 'Timetable & Attendance', icon: Calendar },
          { id: 'exams', label: 'Exams & Grading', icon: Award },
          { id: 'setup', label: 'Institution Profile', icon: Building }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-3 border-b-2 font-medium transition-colors whitespace-nowrap cursor-pointer rounded-t-lg ${
                isActive
                  ? 'border-blue-600 text-blue-700 font-semibold bg-blue-50/50'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-1">
              <span className="text-xs font-medium text-slate-500">Enrolled Students</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900">{summary?.totalStudents ?? students.length}</span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-[11px] text-emerald-600 font-medium">Active Students: {summary?.activeStudents ?? students.filter(s => s.status === 'ACTIVE').length}</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-1">
              <span className="text-xs font-medium text-slate-500">Total Fee Collections</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-emerald-700 font-mono">
                  {currencySymbol} {(summary?.totalCollected ?? payments.reduce((sum, p) => sum + p.amount, 0)).toLocaleString()}
                </span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-[11px] text-slate-500">{payments.length} Recorded Receipts</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-1">
              <span className="text-xs font-medium text-slate-500">Outstanding Balances</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-amber-600 font-mono">
                  {currencySymbol} {(summary?.totalOutstanding ?? students.reduce((sum, s) => sum + (s.feeBalance || 0), 0)).toLocaleString()}
                </span>
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-[11px] text-slate-500">Total Student Ledger Debt</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-1">
              <span className="text-xs font-medium text-slate-500">Faculty & Academic Units</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900">{faculty.length} Lecturers</span>
                <Award className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-[11px] text-slate-500">{academics?.programs?.length || 0} Programs Offered</p>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setActiveSubTab('students')}
              className="p-4 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 rounded-xl text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <Users className="w-5 h-5 text-blue-600" />
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="font-bold text-xs text-slate-900 mt-2">Manage Students</p>
              <p className="text-[11px] text-slate-500">Admissions, Bio & Status</p>
            </button>

            <button
              onClick={() => setActiveSubTab('fees')}
              className="p-4 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 rounded-xl text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
              <p className="font-bold text-xs text-slate-900 mt-2">Fees & Invoices</p>
              <p className="text-[11px] text-slate-500">Receipts & Billing</p>
            </button>

            <button
              onClick={() => setActiveSubTab('classes')}
              className="p-4 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 rounded-xl text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <Layers className="w-5 h-5 text-indigo-600" />
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
              <p className="font-bold text-xs text-slate-900 mt-2">Class Cohorts</p>
              <p className="text-[11px] text-slate-500">Enrollment & Teachers</p>
            </button>

            <button
              onClick={() => setActiveSubTab('timetable')}
              className="p-4 bg-white border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 rounded-xl text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <Calendar className="w-5 h-5 text-amber-600" />
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
              </div>
              <p className="font-bold text-xs text-slate-900 mt-2">Attendance & Schedule</p>
              <p className="text-[11px] text-slate-500">Daily Class Register</p>
            </button>
          </div>

          {/* Quick Enrolled Student Table Preview */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Recent Student Admissions</h3>
                <p className="text-xs text-slate-500">Registered students in {tenant?.name}</p>
              </div>
              <button
                onClick={() => setActiveSubTab('students')}
                className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                Open Student Directory →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="p-3">Admission No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Program</th>
                    <th className="p-3">Campus</th>
                    <th className="p-3">Fee Balance</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No students admitted yet. Click "Admit Student" to register a new student.
                      </td>
                    </tr>
                  ) : (
                    students.slice(0, 5).map(s => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-blue-700">{s.admissionNo}</td>
                        <td className="p-3 font-semibold text-slate-900">{s.fullName}</td>
                        <td className="p-3">{s.programName}</td>
                        <td className="p-3">{s.campusName || 'Main Campus'}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">
                          {currencySymbol} {(s.feeBalance || 0).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Fee Payments Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Recent Fee Payment Receipts</h3>
                <p className="text-xs text-slate-500">M-Pesa, Bank, and Cash collections logged</p>
              </div>
              <button
                onClick={() => setActiveSubTab('fees')}
                className="text-xs text-emerald-600 font-semibold hover:underline cursor-pointer"
              >
                Open Fee Finance Ledger →
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
                    <th className="p-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No fee payments logged yet. Click "Record Payment" to process a receipt.
                      </td>
                    </tr>
                  ) : (
                    payments.slice(0, 5).map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-emerald-700">{p.receiptNo}</td>
                        <td className="p-3 font-mono text-slate-500">{new Date(p.paidAt).toLocaleDateString()}</td>
                        <td className="p-3 font-semibold text-slate-900">{p.studentName}</td>
                        <td className="p-3 font-mono">{p.admissionNo}</td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-800">{p.paymentMethod}</span>
                          <div className="text-[11px] font-mono text-slate-400">{p.referenceNo}</div>
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-700">
                          {currencySymbol} {p.amount.toLocaleString()}
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

      {/* SUBTAB 2: STUDENTS & ADMISSIONS */}
      {activeSubTab === 'students' && (
        <StudentManagement
          currencySymbol={currencySymbol}
          onOpenFeePayment={(studentId) => {
            setPayStudentId(studentId);
            setActiveSubTab('fees');
          }}
        />
      )}

      {/* SUBTAB 3: FACULTY & STAFF */}
      {activeSubTab === 'faculty' && (
        <FacultyManagement />
      )}

      {/* SUBTAB 4: DEPARTMENTS */}
      {activeSubTab === 'departments' && (
        <DepartmentManagement educationType={educationType} />
      )}

      {/* SUBTAB 5: ACADEMICS / PROGRAMS / UNITS */}
      {activeSubTab === 'academics' && (
        <AcademicsManagement />
      )}

      {/* SUBTAB 6: CLASSES & COHORTS */}
      {activeSubTab === 'classes' && (
        <ClassManagement />
      )}

      {/* SUBTAB 7: FEES & FINANCE */}
      {activeSubTab === 'fees' && (
        <FeesFinanceManagement />
      )}

      {/* SUBTAB 8: TIMETABLE & ATTENDANCE */}
      {activeSubTab === 'timetable' && (
        <TimetableAttendance />
      )}

      {/* SUBTAB 9: EXAMS & GRADING */}
      {activeSubTab === 'exams' && (
        <ExamGradingManagement />
      )}

      {/* SUBTAB 10: INSTITUTION SETUP */}
      {activeSubTab === 'setup' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-2xl space-y-6">
          <h3 className="font-bold text-slate-900 text-base">Institution Type & Profile Setup</h3>
          <p className="text-xs text-slate-500">
            Select your specific education category. The ERP adapts terminology, grading, curricula, and course structures automatically.
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
              The system is configured for <strong className="underline">{educationType}</strong> operations with semester/term calendar structures, unit courses, and multi-tenant isolated student records.
            </p>
          </div>
        </div>
      )}

      {/* QUICK ADMIT MODAL */}
      {isAdmitModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleQuickAdmit} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-slate-900">Admit New Student</h3>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Student Full Name *</label>
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
                    placeholder="student@school.ac.ke"
                    value={newStudentEmail}
                    onChange={e => setNewStudentEmail(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+254 700 000 000"
                    value={newStudentPhone}
                    onChange={e => setNewStudentPhone(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Gender</label>
                  <select
                    value={newStudentGender}
                    onChange={e => setNewStudentGender(e.target.value as any)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Program / Course</label>
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
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAdmitModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
              >
                Confirm Admission
              </button>
            </div>
          </form>
        </div>
      )}

      {/* QUICK PAYMENT MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleQuickPayment} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
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
                      {s.fullName} ({s.admissionNo}) - Balance: {currencySymbol} {(s.feeBalance || 0).toLocaleString()}
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
                  <label className="font-semibold text-slate-700">Payment Channel</label>
                  <select
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value as any)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="M-PESA">M-PESA Mobile Money</option>
                    <option value="BANK_TRANSFER">Bank Direct Deposit</option>
                    <option value="CHEQUE">Banker's Cheque</option>
                    <option value="CASH">Cash at Accounts Office</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Transaction Reference No *</label>
                <input
                  type="text"
                  placeholder="e.g. QKH9201481"
                  value={payRef}
                  onChange={e => setPayRef(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
              >
                Generate Receipt
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
