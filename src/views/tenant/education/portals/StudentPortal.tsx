import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import {
  Student, UnitSubject, TimetableEntry, StudentGradeRecord,
  FeePayment, StudentInvoice, AcademicTranscript, AcademicCertificate, AdmissionLetter
} from '../../../../types';
import {
  GraduationCap, BookOpen, Calendar, Clock, CheckCircle2,
  AlertCircle, DollarSign, Award, FileText, QrCode, User as UserIcon,
  Phone, Mail, MapPin, Building, ChevronRight, ShieldCheck, Printer, Download, Eye, Sparkles
} from 'lucide-react';
import { QrAttendanceScannerModal } from '../components/QrAttendanceScannerModal';
import QRCode from 'qrcode';

interface StudentPortalProps {
  initialStudentId?: string;
  onBackToAdmin?: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  initialStudentId,
  onBackToAdmin
}) => {
  const { user, tenant } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'units' | 'timetable' | 'attendance' | 'results' | 'fees' | 'documents' | 'profile'>('overview');
  
  const [portalData, setPortalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Available students list for Admin simulation
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || user?.studentId || '');

  // Scanner modal state
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Document modal states
  const [viewingDoc, setViewingDoc] = useState<{
    type: 'transcript' | 'certificate' | 'admission' | 'fee_statement';
    data: any;
    qrUrl?: string;
  } | null>(null);

  const isSimulating = user?.role === 'SUPER_ADMIN' || user?.role === 'TENANT_ADMIN' || user?.role === 'REGISTRAR' || user?.role === 'ACADEMIC_ADMIN';

  const getHeaders = () => ({
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchStudentList = async () => {
    if (!isSimulating) return;
    try {
      const res = await fetch('/api/app/education/students', { headers: getHeaders() });
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          setAllStudents(list);
          if (!selectedStudentId) {
            setSelectedStudentId(list[0].id);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching students list:', e);
    }
  };

  const fetchPortalData = async (studentIdToFetch?: string) => {
    try {
      setLoading(true);
      setError(null);
      const queryParam = studentIdToFetch ? `?studentId=${studentIdToFetch}` : '';
      const res = await fetch(`/api/app/education/student-portal/data${queryParam}`, {
        headers: getHeaders()
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to load student portal data');
      }

      const data = await res.json();
      setPortalData(data);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve student profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentList();
  }, []);

  useEffect(() => {
    fetchPortalData(selectedStudentId);
  }, [selectedStudentId]);

  // Document generator helpers
  const handleGenerateDoc = async (type: 'transcript' | 'certificate' | 'admission') => {
    if (!portalData?.student?.id) return;
    try {
      let endpoint = '/api/app/education/transcripts/generate';
      let payload: any = { studentId: portalData.student.id };

      if (type === 'certificate') {
        endpoint = '/api/app/education/certificates/generate';
        payload = {
          studentId: portalData.student.id,
          awardType: 'DIPLOMA',
          awardTitle: `Diploma in ${portalData.student.programName}`,
          classification: portalData.academics?.gpa >= 3.6 ? 'Distinction' : 'Credit'
        };
      } else if (type === 'admission') {
        endpoint = '/api/app/education/admission-letters/generate';
        payload = {
          studentId: portalData.student.id,
          intake: portalData.student.intake || 'September 2026'
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const doc = await res.json();
        // Generate QR code data URL
        const qrUrl = await QRCode.toDataURL(doc.verificationUrl || `https://davetech-erp.app/verify-document/${doc.verificationCode}`);
        setViewingDoc({ type, data: doc, qrUrl });
        fetchPortalData(portalData.student.id);
      }
    } catch (e) {
      console.error('Error generating document:', e);
    }
  };

  const handleOpenExistingDoc = async (type: 'transcript' | 'certificate' | 'admission', docData: any) => {
    const qrUrl = await QRCode.toDataURL(docData.verificationUrl || `https://davetech-erp.app/verify-document/${docData.verificationCode}`);
    setViewingDoc({ type, data: docData, qrUrl });
  };

  const student = portalData?.student;
  const currency = portalData?.tenant?.currency || 'KES';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Simulation / Admin Preview Banner */}
      {isSimulating && (
        <div className="bg-indigo-900/90 border border-indigo-700 text-white p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-indigo-700 rounded-lg">
              <Eye className="w-4 h-4 text-indigo-200" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Administrator Student Portal Preview
              </div>
              <p className="text-[11px] text-indigo-100">
                Viewing student experience as: <span className="font-bold text-white">{student?.fullName || 'Selected Student'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {allStudents.length > 0 && (
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="bg-indigo-950 border border-indigo-700 text-xs text-white rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
              >
                {allStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.admissionNo}) — {s.programName}
                  </option>
                ))}
              </select>
            )}

            {onBackToAdmin && (
              <button
                onClick={onBackToAdmin}
                className="px-3 py-1.5 bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Return to Admin ERP
              </button>
            )}
          </div>
        </div>
      )}

      {/* Student Profile Hero Card */}
      {student && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center space-x-4 sm:space-x-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-600/30 border-2 border-blue-400/40 flex items-center justify-center text-blue-300 text-2xl font-bold shrink-0 shadow-inner">
                {student.fullName?.charAt(0) || 'S'}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{student.fullName}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {student.status || 'ACTIVE'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-blue-200 font-mono font-medium">
                  Admission No: <span className="text-white font-bold">{student.admissionNo}</span>
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 pt-1">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                    {student.programName}
                  </span>
                  {student.className && (
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      Class: {student.className}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    Academic Year: {student.academicYear || '2025/2026'} ({student.academicTerm || 'Semester 1'})
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Button: Scan Attendance */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all transform active:scale-98 cursor-pointer"
              >
                <QrCode className="w-4 h-4 shrink-0" />
                <span>Scan Attendance QR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Portal Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 bg-white px-3 rounded-2xl shadow-2xs gap-1.5 py-1.5 text-xs font-medium text-slate-600">
        {[
          { id: 'overview', label: 'Dashboard', icon: Sparkles },
          { id: 'units', label: 'My Units & Courses', icon: BookOpen },
          { id: 'timetable', label: 'My Timetable', icon: Calendar },
          { id: 'attendance', label: 'My Attendance', icon: CheckCircle2 },
          { id: 'results', label: 'My Results & GPA', icon: Award },
          { id: 'fees', label: 'Fees & Invoices', icon: DollarSign },
          { id: 'documents', label: 'Official Documents', icon: FileText },
          { id: 'profile', label: 'Student Profile', icon: UserIcon }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-3.5 border-b-2 font-medium transition-colors whitespace-nowrap cursor-pointer rounded-xl ${
                isActive
                  ? 'border-blue-600 text-blue-700 font-semibold bg-blue-50/70 shadow-2xs'
                  : 'border-transparent hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-medium">Loading student records...</p>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center text-rose-800 space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {!loading && !error && portalData && (
        <>
          {/* TAB 1: DASHBOARD / OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Clusters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Attendance Card */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Attendance Rate</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-slate-900">
                      {portalData.attendance?.percentage || 100}%
                    </span>
                    <span className="text-[11px] text-emerald-600 font-medium">
                      ({portalData.attendance?.presentCount || 0}/{portalData.attendance?.totalSessions || 0} sessions)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${portalData.attendance?.percentage || 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Fee Balance Card */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Fee Balance</span>
                    <DollarSign className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold font-mono text-slate-900">
                      {currency} {(portalData.fees?.balance || 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Paid: {currency} {(portalData.fees?.totalPaid || 0).toLocaleString()} of {currency} {(portalData.fees?.totalInvoiced || 0).toLocaleString()}
                  </p>
                </div>

                {/* Enrolled Units Card */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Enrolled Units</span>
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-slate-900">
                      {portalData.myUnits?.length || 0}
                    </span>
                    <span className="text-[11px] text-blue-600 font-medium">Active this term</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{student.programName}</p>
                </div>

                {/* Academic Standing & GPA */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Cumulative GPA</span>
                    <Award className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-indigo-600">
                      {portalData.academics?.gpa || '3.50'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">/ 4.00</span>
                  </div>
                  <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md text-[10px] font-semibold">
                    {portalData.academics?.standing || 'GOOD STANDING'}
                  </span>
                </div>
              </div>

              {/* Active Today Sessions Banner */}
              {portalData.activeSessions && portalData.activeSessions.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-5 rounded-2xl border border-emerald-700 shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                      <h3 className="font-bold text-sm">Live Attendance Sessions In Progress</h3>
                    </div>
                    <span className="text-xs bg-emerald-800 px-2.5 py-1 rounded-full text-emerald-200">
                      {portalData.activeSessions.length} Active Now
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {portalData.activeSessions.map((sess: any) => (
                      <div key={sess.id} className="bg-emerald-950/80 border border-emerald-700/60 p-3.5 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-xs text-white">{sess.unitCode} - {sess.unitName}</div>
                          <div className="text-[11px] text-emerald-300">Lecturer: {sess.teacherName} • Venue: {sess.venue}</div>
                          <div className="text-[10px] text-emerald-400 font-mono">Code: {sess.sessionCode}</div>
                        </div>
                        <button
                          onClick={() => setIsScannerOpen(true)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                        >
                          Check In Now
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Two Column Layout: Today's Classes & Recent Results */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Timetable schedule preview */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <h3 className="font-bold text-sm text-slate-900">Weekly Schedule & Classes</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('timetable')}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  </div>

                  {portalData.myTimetable?.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">No scheduled classes found.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {portalData.myTimetable?.slice(0, 4).map((tt: TimetableEntry) => (
                        <div key={tt.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="text-xs font-semibold text-slate-900">{tt.unitCode} - {tt.unitName}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2">
                              <span>{tt.dayOfWeek}</span>
                              <span>•</span>
                              <span>{tt.startTime} - {tt.endTime}</span>
                              <span>•</span>
                              <span className="text-slate-700 font-medium">Room: {tt.roomVenue}</span>
                            </div>
                          </div>
                          <span className="text-[11px] px-2 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium">
                            {tt.lecturerName}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Academic Results */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-indigo-600" />
                      <h3 className="font-bold text-sm text-slate-900">Recent Academic Results</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('results')}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  </div>

                  {portalData.academics?.grades?.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">No exam grades published yet.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {portalData.academics?.grades?.slice(0, 4).map((gr: StudentGradeRecord) => (
                        <div key={gr.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-semibold text-slate-900">{gr.unitCode} - {gr.unitName}</div>
                            <div className="text-[11px] text-slate-500">
                              CAT: {gr.catScore} • Exam: {gr.examScore} • Total: {gr.totalScore}%
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-base font-bold text-blue-700 font-mono">{gr.grade}</span>
                            <div className="text-[10px] text-slate-500">{gr.remarks}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY UNITS & COURSES */}
          {activeTab === 'units' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Enrolled Course Units</h3>
                <p className="text-xs text-slate-500">Curriculum units assigned to your academic program: {student.programName}</p>
              </div>

              {portalData.myUnits?.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No units registered under this program.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portalData.myUnits?.map((unit: UnitSubject) => (
                    <div key={unit.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md font-mono">
                            {unit.code}
                          </span>
                          <h4 className="text-sm font-semibold text-slate-900 mt-1">{unit.name}</h4>
                        </div>
                        <span className="text-xs font-semibold text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200">
                          {unit.creditHours || 3} Credits
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-200/60">
                        <div>Lecturer: <span className="font-medium text-slate-700">{unit.lecturerName || 'Assigned Faculty'}</span></div>
                        <div>Term: <span className="font-medium text-slate-700">{unit.semester || (unit as any).academicTerm || 'Semester 1'}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY TIMETABLE */}
          {activeTab === 'timetable' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Weekly Class Timetable</h3>
                <p className="text-xs text-slate-500">Scheduled lectures, laboratory practicals, and tutorial sessions</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-3 px-4">Day</th>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Unit Code & Name</th>
                      <th className="py-3 px-4">Room / Venue</th>
                      <th className="py-3 px-4">Lecturer</th>
                      <th className="py-3 px-4">Class Group</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {portalData.myTimetable?.map((tt: TimetableEntry) => (
                      <tr key={tt.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-semibold text-slate-900">{tt.dayOfWeek}</td>
                        <td className="py-3 px-4 text-blue-700 font-mono">{tt.startTime} - {tt.endTime}</td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-slate-800 mr-1.5">{tt.unitCode}</span>
                          <span className="text-slate-600">{tt.unitName}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">{tt.roomVenue}</td>
                        <td className="py-3 px-4 text-slate-600">{tt.lecturerName}</td>
                        <td className="py-3 px-4 text-slate-500">{tt.groupName || student.className || 'General'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: MY ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-slate-900">Attendance Log & Verification</h3>
                  <p className="text-xs text-slate-500">Official log of class attendance recorded via QR scanning and teacher roll call</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Scan QR Code</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Chronological Attendance Records</span>
                  <span className="text-xs font-medium text-emerald-600">
                    Overall: {portalData.attendance?.percentage || 100}% Verified Attendance
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Unit</th>
                        <th className="py-3 px-4">Class</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Verification & Remarks</th>
                        <th className="py-3 px-4">Recorded By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {portalData.attendance?.records?.map((rec: any) => (
                        <tr key={rec.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-mono text-slate-700">{rec.date}</td>
                          <td className="py-3 px-4 font-medium text-slate-900">{rec.unitCode || rec.unitName}</td>
                          <td className="py-3 px-4 text-slate-600">{rec.className || student.className || 'General'}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                rec.status === 'PRESENT'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : rec.status === 'LATE'
                                  ? 'bg-amber-100 text-amber-800'
                                  : rec.status === 'EXCUSED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {rec.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">{rec.remarks || 'Standard Session Roll'}</td>
                          <td className="py-3 px-4 text-slate-600">{rec.markedBy || 'Lecturer'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MY RESULTS & GPA */}
          {activeTab === 'results' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Examination Results & Performance</h3>
                  <p className="text-xs text-slate-500">Official grades confirmed by the Academic Department</p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl text-center">
                    <div className="text-[10px] font-semibold text-blue-700 uppercase">Cumulative GPA</div>
                    <div className="text-lg font-bold text-blue-900 font-mono">{portalData.academics?.gpa || '3.50'}</div>
                  </div>

                  <button
                    onClick={() => handleGenerateDoc('transcript')}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Generate Official Transcript</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-3 px-4">Unit Code</th>
                        <th className="py-3 px-4">Unit Name</th>
                        <th className="py-3 px-4 text-center">CAT Score (30/40)</th>
                        <th className="py-3 px-4 text-center">Exam Score (70/60)</th>
                        <th className="py-3 px-4 text-center">Total (100)</th>
                        <th className="py-3 px-4 text-center">Grade</th>
                        <th className="py-3 px-4 text-center">Grade Points</th>
                        <th className="py-3 px-4">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {portalData.academics?.grades?.map((g: StudentGradeRecord) => (
                        <tr key={g.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{g.unitCode}</td>
                          <td className="py-3 px-4 text-slate-800 font-medium">{g.unitName}</td>
                          <td className="py-3 px-4 text-center font-mono text-slate-600">{g.catScore}</td>
                          <td className="py-3 px-4 text-center font-mono text-slate-600">{g.examScore}</td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">{g.totalScore}%</td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold rounded-md font-mono">
                              {g.grade}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-slate-700">{g.points ?? 4.0}</td>
                          <td className="py-3 px-4 text-slate-500">{g.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FEES & INVOICES */}
          {activeTab === 'fees' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">Total Billed Fees</span>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                    {currency} {(portalData.fees?.totalInvoiced || 0).toLocaleString()}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">Total Amount Paid</span>
                  <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
                    {currency} {(portalData.fees?.totalPaid || 0).toLocaleString()}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">Outstanding Balance</span>
                  <div className="text-xl font-bold font-mono text-amber-600 mt-1">
                    {currency} {(portalData.fees?.balance || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Invoices Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-100">
                  <h4 className="font-bold text-xs text-slate-800">Fee Invoices & Statements</h4>
                </div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-3 px-4">Invoice No</th>
                      <th className="py-3 px-4">Term</th>
                      <th className="py-3 px-4">Total Amount</th>
                      <th className="py-3 px-4">Amount Paid</th>
                      <th className="py-3 px-4">Balance</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {portalData.fees?.invoices?.map((inv: StudentInvoice) => (
                      <tr key={inv.id}>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.invoiceNo}</td>
                        <td className="py-3 px-4 text-slate-600">{inv.academicTerm} ({inv.academicYear})</td>
                        <td className="py-3 px-4 font-mono">{currency} {inv.totalAmount.toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono text-emerald-700">{currency} {inv.amountPaid.toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-600">{currency} {inv.balance.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Payment Receipts Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-100">
                  <h4 className="font-bold text-xs text-slate-800">Payment History & Receipts</h4>
                </div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-3 px-4">Receipt No</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4">Transaction Ref</th>
                      <th className="py-3 px-4 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {portalData.fees?.payments?.map((p: FeePayment) => (
                      <tr key={p.id}>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.receiptNo}</td>
                        <td className="py-3 px-4 text-slate-600">{p.paidAt?.split('T')[0]}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">{p.paymentMethod}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">{p.referenceNo}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                          {currency} {p.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: OFFICIAL DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Student Official Documents</h3>
                  <p className="text-xs text-slate-500">Authentic academic documents generated with cryptographically verified QR codes</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {/* Academic Transcript Card */}
                  <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-b from-slate-50 to-white flex flex-col justify-between space-y-4 shadow-2xs">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">Official Academic Transcript</h4>
                      <p className="text-xs text-slate-500">Complete record of all units, grades, credit hours, cumulative GPA, and registrar signature.</p>
                    </div>

                    <div className="space-y-2">
                      {portalData.documents?.transcripts?.length > 0 && (
                        <div className="text-[11px] text-slate-500 font-mono">
                          Latest: {portalData.documents.transcripts[0].documentNumber}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          if (portalData.documents?.transcripts?.length > 0) {
                            handleOpenExistingDoc('transcript', portalData.documents.transcripts[0]);
                          } else {
                            handleGenerateDoc('transcript');
                          }
                        }}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>{portalData.documents?.transcripts?.length > 0 ? 'View / Print Transcript' : 'Generate Transcript'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Certificate Card */}
                  <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-b from-slate-50 to-white flex flex-col justify-between space-y-4 shadow-2xs">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                        <Award className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">Academic Award Certificate</h4>
                      <p className="text-xs text-slate-500">Official diploma/certificate conferring graduation award classification and honors.</p>
                    </div>

                    <div className="space-y-2">
                      {portalData.documents?.certificates?.length > 0 && (
                        <div className="text-[11px] text-slate-500 font-mono">
                          Latest: {portalData.documents.certificates[0].certificateNumber}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          if (portalData.documents?.certificates?.length > 0) {
                            handleOpenExistingDoc('certificate', portalData.documents.certificates[0]);
                          } else {
                            handleGenerateDoc('certificate');
                          }
                        }}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                      >
                        <Award className="w-4 h-4" />
                        <span>{portalData.documents?.certificates?.length > 0 ? 'View / Print Certificate' : 'Issue Certificate'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Admission Letter Card */}
                  <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-b from-slate-50 to-white flex flex-col justify-between space-y-4 shadow-2xs">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">Official Admission Letter</h4>
                      <p className="text-xs text-slate-500">Branded letter of admission containing program details, intake, fees outline, and reporting instructions.</p>
                    </div>

                    <div className="space-y-2">
                      {portalData.documents?.admissionLetters?.length > 0 && (
                        <div className="text-[11px] text-slate-500 font-mono">
                          Latest: {portalData.documents.admissionLetters[0].letterNumber}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          if (portalData.documents?.admissionLetters?.length > 0) {
                            handleOpenExistingDoc('admission', portalData.documents.admissionLetters[0]);
                          } else {
                            handleGenerateDoc('admission');
                          }
                        }}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        <span>{portalData.documents?.admissionLetters?.length > 0 ? 'View / Print Letter' : 'Generate Letter'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: STUDENT PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div>
                <h3 className="font-bold text-base text-slate-900">Student Profile & Academic Record</h3>
                <p className="text-xs text-slate-500">Official biodata and registration details on file</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal & Academic Information</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Full Name</span>
                      <span className="font-semibold text-slate-900">{student.fullName}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Admission / Student No</span>
                      <span className="font-mono font-bold text-slate-900">{student.admissionNo}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Program</span>
                      <span className="font-medium text-slate-900">{student.programName}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Department</span>
                      <span className="font-medium text-slate-900">{student.departmentName || 'Academic Dept'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Class / Cohort</span>
                      <span className="font-medium text-slate-900">{student.className || 'General'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Campus</span>
                      <span className="font-medium text-slate-900">{student.campusName || 'Main Campus'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact & Guardian Information</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Email Address</span>
                      <span className="font-medium text-slate-900">{student.email}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Phone Number</span>
                      <span className="font-medium text-slate-900">{student.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">National ID / Birth Cert</span>
                      <span className="font-medium text-slate-900">{student.nationalId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Guardian Name</span>
                      <span className="font-medium text-slate-900">{student.guardianName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Guardian Phone</span>
                      <span className="font-medium text-slate-900">{student.guardianPhone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Enrollment Date</span>
                      <span className="font-mono text-slate-700">{student.enrolledAt?.split('T')[0] || '2024-09-01'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* QR Scanner Modal */}
      <QrAttendanceScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSuccess={() => fetchPortalData(student?.id)}
        studentId={student?.id}
        admissionNo={student?.admissionNo}
      />

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-sm">
                  {viewingDoc.type === 'transcript' && 'Official Academic Transcript'}
                  {viewingDoc.type === 'certificate' && 'Official Academic Award Certificate'}
                  {viewingDoc.type === 'admission' && 'Official Admission Letter'}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Document Printable Body */}
            <div className="p-8 sm:p-12 space-y-6 text-slate-900 bg-white">
              {/* TRANSCRIPT VIEW */}
              {viewingDoc.type === 'transcript' && (
                <div className="space-y-6">
                  {/* Institutional Header */}
                  <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                    <h2 className="text-xl font-black uppercase tracking-wider text-slate-950">
                      {portalData?.tenant?.name || 'Academic Institution'}
                    </h2>
                    <p className="text-xs text-slate-600 font-medium">
                      OFFICE OF THE REGISTRAR (ACADEMIC AFFAIRS)
                    </p>
                    <div className="text-sm font-bold uppercase tracking-widest text-blue-900 pt-2">
                      Official Academic Transcript
                    </div>
                  </div>

                  {/* Student Details Header */}
                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <div><span className="text-slate-500">Student Name:</span> <strong className="text-slate-900">{viewingDoc.data.studentName}</strong></div>
                      <div><span className="text-slate-500">Admission No:</span> <strong className="font-mono text-slate-900">{viewingDoc.data.admissionNo}</strong></div>
                      <div><span className="text-slate-500">Program:</span> <strong className="text-slate-900">{viewingDoc.data.programName}</strong></div>
                    </div>
                    <div>
                      <div><span className="text-slate-500">Doc Number:</span> <strong className="font-mono text-blue-700">{viewingDoc.data.documentNumber}</strong></div>
                      <div><span className="text-slate-500">Issue Date:</span> <strong className="text-slate-900">{viewingDoc.data.issuedAt?.split('T')[0]}</strong></div>
                      <div><span className="text-slate-500">Academic Standing:</span> <strong className="text-emerald-700">{viewingDoc.data.academicStanding}</strong></div>
                    </div>
                  </div>

                  {/* Units Table */}
                  <table className="w-full text-left text-xs border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                        <th className="py-2 px-3 border-r border-slate-300">Code</th>
                        <th className="py-2 px-3 border-r border-slate-300">Unit Title</th>
                        <th className="py-2 px-2 text-center border-r border-slate-300">Credits</th>
                        <th className="py-2 px-2 text-center border-r border-slate-300">CAT</th>
                        <th className="py-2 px-2 text-center border-r border-slate-300">Exam</th>
                        <th className="py-2 px-2 text-center border-r border-slate-300">Total %</th>
                        <th className="py-2 px-2 text-center border-r border-slate-300">Grade</th>
                        <th className="py-2 px-2 text-center border-r border-slate-300">GP</th>
                        <th className="py-2 px-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {viewingDoc.data.units?.map((u: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-1.5 px-3 font-mono font-semibold border-r border-slate-200">{u.unitCode}</td>
                          <td className="py-1.5 px-3 border-r border-slate-200">{u.unitName}</td>
                          <td className="py-1.5 px-2 text-center font-mono border-r border-slate-200">{u.creditHours || 3}</td>
                          <td className="py-1.5 px-2 text-center font-mono border-r border-slate-200">{u.catScore}</td>
                          <td className="py-1.5 px-2 text-center font-mono border-r border-slate-200">{u.examScore}</td>
                          <td className="py-1.5 px-2 text-center font-mono font-bold border-r border-slate-200">{u.totalScore}%</td>
                          <td className="py-1.5 px-2 text-center font-bold font-mono border-r border-slate-200">{u.grade}</td>
                          <td className="py-1.5 px-2 text-center font-mono border-r border-slate-200">{u.gradePoints}</td>
                          <td className="py-1.5 px-3 text-slate-600">{u.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Summary & QR Verification Footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t-2 border-slate-900">
                    <div className="flex items-center space-x-4">
                      {viewingDoc.qrUrl && (
                        <img src={viewingDoc.qrUrl} alt="Verification QR Code" className="w-20 h-20 border border-slate-300 rounded-lg p-1 bg-white" />
                      )}
                      <div className="space-y-0.5 text-[11px] text-slate-600">
                        <div className="font-bold text-slate-900">Official Document Verification</div>
                        <div className="font-mono text-[10px] text-blue-700">Code: {viewingDoc.data.verificationCode}</div>
                        <div>Scan with any camera or visit verify portal to validate authenticity.</div>
                      </div>
                    </div>

                    <div className="text-right space-y-1 text-xs">
                      <div className="text-sm font-bold text-slate-900">
                        Cumulative GPA: <span className="font-mono text-blue-800 text-base">{viewingDoc.data.gpa}</span> / 4.00
                      </div>
                      <div className="pt-4 border-t border-slate-300 font-semibold text-slate-700">
                        Authorized Registrar Signature & Seal
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CERTIFICATE VIEW */}
              {viewingDoc.type === 'certificate' && (
                <div className="border-8 border-double border-slate-900 p-8 sm:p-12 text-center space-y-6 bg-amber-50/20 rounded-xl relative">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black uppercase tracking-wider text-slate-950">
                      {portalData?.tenant?.name || 'Academic Institution'}
                    </h2>
                    <p className="text-xs uppercase tracking-widest text-slate-600 font-semibold">
                      COUNCIL & SENATE OF THE INSTITUTION
                    </p>
                  </div>

                  <p className="text-xs italic text-slate-500">This is to certify that</p>

                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-blue-950 border-b border-slate-300 pb-2 inline-block px-8">
                    {viewingDoc.data.studentName}
                  </h3>

                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    having satisfied all the academic requirements prescribed by the Senate was admitted to the award of
                  </p>

                  <div className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-slate-900 font-serif">
                    {viewingDoc.data.awardTitle}
                  </div>

                  <p className="text-xs font-semibold text-emerald-800">
                    Classification: {viewingDoc.data.classification || 'Credit with Distinction'}
                  </p>

                  {/* Signatures & Seal */}
                  <div className="flex flex-col sm:flex-row items-center justify-between pt-8 gap-6 border-t border-slate-300 text-xs">
                    <div className="text-center space-y-1">
                      <div className="font-serif italic text-sm text-slate-800">{viewingDoc.data.signatory1Name || 'Prof. David Ndung\'u'}</div>
                      <div className="border-t border-slate-400 pt-1 text-[11px] font-semibold text-slate-600">{viewingDoc.data.signatory1Title || 'Principal / Vice Chancellor'}</div>
                    </div>

                    <div className="flex flex-col items-center">
                      {viewingDoc.qrUrl && (
                        <img src={viewingDoc.qrUrl} alt="Certificate QR" className="w-16 h-16 border border-slate-300 p-0.5 bg-white rounded-md" />
                      )}
                      <span className="text-[9px] font-mono text-slate-500 mt-1">{viewingDoc.data.certificateNumber}</span>
                    </div>

                    <div className="text-center space-y-1">
                      <div className="font-serif italic text-sm text-slate-800">{viewingDoc.data.signatory2Name || 'Academic Registrar'}</div>
                      <div className="border-t border-slate-400 pt-1 text-[11px] font-semibold text-slate-600">{viewingDoc.data.signatory2Title || 'Academic Registrar'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ADMISSION LETTER VIEW */}
              {viewingDoc.type === 'admission' && (
                <div className="space-y-6 text-xs text-slate-800">
                  <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
                    <div>
                      <h2 className="text-base font-bold uppercase text-slate-950">{portalData?.tenant?.name || 'Academic Institution'}</h2>
                      <p className="text-[11px] text-slate-500">Office of Admissions & Student Affairs</p>
                    </div>
                    <div className="text-right font-mono text-[11px]">
                      <div>Ref: <strong>{viewingDoc.data.letterNumber}</strong></div>
                      <div>Date: {viewingDoc.data.issueDate}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div>To: <strong>{viewingDoc.data.studentName}</strong></div>
                    <div>Admission No: <strong className="font-mono">{viewingDoc.data.admissionNo}</strong></div>
                  </div>

                  <div className="font-bold text-sm uppercase text-blue-900 border-b border-slate-200 pb-1">
                    RE: PROVISIONAL LETTER OF ADMISSION — {viewingDoc.data.programName}
                  </div>

                  <p>
                    We are pleased to inform you that following your application, you have been offered admission into the
                    <strong> {viewingDoc.data.programName}</strong> at <strong>{portalData?.tenant?.name}</strong> for the <strong>{viewingDoc.data.intake}</strong> intake.
                  </p>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <div className="font-semibold text-slate-900">Key Admission Details:</div>
                    <div>• Program Duration: {viewingDoc.data.duration}</div>
                    <div>• Reporting Date: {viewingDoc.data.reportingDate}</div>
                    <div>• Tuition Fee per Term: {currency} {viewingDoc.data.termTuitionFee?.toLocaleString()}</div>
                    <div>• Statutory & Registration Fees: {currency} {viewingDoc.data.statutoryFees?.toLocaleString()}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900">Conditions of Offer:</div>
                    {viewingDoc.data.admissionConditions?.map((cond: string, i: number) => (
                      <div key={i} className="text-slate-600">• {cond}</div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                    <div className="flex items-center space-x-3">
                      {viewingDoc.qrUrl && (
                        <img src={viewingDoc.qrUrl} alt="Admission QR" className="w-16 h-16 border border-slate-300 p-0.5 bg-white rounded-md" />
                      )}
                      <div className="text-[10px] text-slate-500 font-mono">
                        Verify: {viewingDoc.data.verificationCode}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-slate-900">{viewingDoc.data.issuedBy || 'Registrar Admissions'}</div>
                      <div className="text-[11px] text-slate-500">Academic Registrar</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
