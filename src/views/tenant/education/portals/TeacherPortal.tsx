import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import {
  LecturerStaff, UnitSubject, SchoolClass, TimetableEntry,
  Student, StudentGradeRecord, AttendanceSession, AttendanceScanRecord
} from '../../../../types';
import {
  GraduationCap, BookOpen, Calendar, Clock, CheckCircle2,
  AlertCircle, QrCode, User as UserIcon, Users, Play, StopCircle,
  Plus, Eye, Search, Check, X, ShieldAlert, Award, Sparkles, RefreshCw
} from 'lucide-react';
import QRCode from 'qrcode';

interface TeacherPortalProps {
  initialTeacherId?: string;
  onBackToAdmin?: () => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  initialTeacherId,
  onBackToAdmin
}) => {
  const { user, tenant } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance_sessions' | 'units' | 'timetable' | 'grading'>('overview');

  const [portalData, setPortalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Available staff for Admin simulation
  const [allStaff, setAllStaff] = useState<LecturerStaff[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(initialTeacherId || user?.staffId || '');

  // Live QR Attendance Session state
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [activeLiveSession, setActiveLiveSession] = useState<AttendanceSession | null>(null);
  const [liveSessionScans, setLiveSessionScans] = useState<AttendanceScanRecord[]>([]);
  const [liveQrCodeUrl, setLiveQrCodeUrl] = useState<string>('');
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');

  // Form state for creating session
  const [newSessionClassId, setNewSessionClassId] = useState('');
  const [newSessionUnitId, setNewSessionUnitId] = useState('');
  const [newSessionLessonTitle, setNewSessionLessonTitle] = useState('');
  const [newSessionVenue, setNewSessionVenue] = useState('');
  const [newSessionDuration, setNewSessionDuration] = useState('15');
  const [sessionSubmitting, setSessionSubmitting] = useState(false);

  // Manual marking modal state
  const [isManualMarkModalOpen, setIsManualMarkModalOpen] = useState(false);
  const [manualMarkStudentId, setManualMarkStudentId] = useState('');
  const [manualMarkStatus, setManualMarkStatus] = useState<'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED'>('PRESENT');
  const [manualMarkRemarks, setManualMarkRemarks] = useState('');

  // Grading Tab State
  const [gradingUnitId, setGradingUnitId] = useState<string>('');
  const [gradingTerm, setGradingTerm] = useState<string>('Semester 1');
  const [gradesDraft, setGradesDraft] = useState<{ [studentId: string]: { cat: number; exam: number } }>({});
  const [savingGrades, setSavingGrades] = useState(false);
  const [gradeSaveSuccess, setGradeSaveSuccess] = useState(false);

  const isSimulating = user?.role === 'SUPER_ADMIN' || user?.role === 'TENANT_ADMIN' || user?.role === 'REGISTRAR' || user?.role === 'ACADEMIC_ADMIN';

  const getHeaders = () => ({
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchStaffList = async () => {
    if (!isSimulating) return;
    try {
      const res = await fetch('/api/app/education/staff', { headers: getHeaders() });
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          setAllStaff(list);
          if (!selectedTeacherId) {
            setSelectedTeacherId(list[0].id);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching staff list:', e);
    }
  };

  const fetchPortalData = async (teacherIdToFetch?: string) => {
    try {
      setLoading(true);
      setError(null);
      const queryParam = teacherIdToFetch ? `?teacherId=${teacherIdToFetch}` : '';
      const res = await fetch(`/api/app/education/teacher-portal/data${queryParam}`, {
        headers: getHeaders()
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to load teacher portal data');
      }

      const data = await res.json();
      setPortalData(data);

      if (data.assignedUnits?.length > 0 && !gradingUnitId) {
        setGradingUnitId(data.assignedUnits[0].id);
      }

      // Check if there is an active session
      const active = data.attendanceSessions?.find((s: AttendanceSession) => s.status === 'ACTIVE' && new Date(s.expiresAt) > new Date());
      if (active) {
        openLiveSession(active);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve teacher profile');
    } finally {
      setLoading(false);
    }
  };

  const openLiveSession = async (session: AttendanceSession) => {
    setActiveLiveSession(session);
    try {
      // Generate QR Code with session token/code
      const qrData = session.sessionCode;
      const url = await QRCode.toDataURL(qrData, {
        width: 320,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' }
      });
      setLiveQrCodeUrl(url);

      // Fetch initial scans
      fetchSessionScans(session.id);
    } catch (e) {
      console.error('Error generating session QR code:', e);
    }
  };

  const fetchSessionScans = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/app/education/attendance/sessions/${sessionId}`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setLiveSessionScans(data.scans || []);
        if (data.session) {
          setActiveLiveSession(data.session);
        }
      }
    } catch (e) {
      console.error('Error fetching session scans:', e);
    }
  };

  // Poll active session scans every 4 seconds while modal/session is open
  useEffect(() => {
    let interval: any;
    if (activeLiveSession && activeLiveSession.status === 'ACTIVE') {
      interval = setInterval(() => {
        fetchSessionScans(activeLiveSession.id);
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeLiveSession]);

  // Expiry countdown timer
  useEffect(() => {
    let interval: any;
    if (activeLiveSession) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const expiry = new Date(activeLiveSession.expiresAt).getTime();
        const diff = expiry - now;

        if (diff <= 0) {
          setTimeLeftStr('Session Expired');
        } else {
          const mins = Math.floor(diff / (1000 * 60));
          const secs = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeftStr(`${mins}m ${secs < 10 ? '0' : ''}${secs}s remaining`);
        }
      };

      updateTimer();
      interval = setInterval(updateTimer, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeLiveSession]);

  useEffect(() => {
    fetchStaffList();
  }, []);

  useEffect(() => {
    fetchPortalData(selectedTeacherId);
  }, [selectedTeacherId]);

  // Handle create session submit
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionClassId || !newSessionUnitId) return;

    setSessionSubmitting(true);
    try {
      const res = await fetch('/api/app/education/attendance/sessions', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          classId: newSessionClassId,
          unitId: newSessionUnitId,
          teacherId: portalData?.lecturer?.id,
          lessonTitle: newSessionLessonTitle,
          venue: newSessionVenue,
          durationMinutes: Number(newSessionDuration) || 15
        })
      });

      if (res.ok) {
        const session = await res.json();
        setIsCreatingSession(false);
        openLiveSession(session);
        fetchPortalData(portalData?.lecturer?.id);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to create attendance session');
      }
    } catch (e: any) {
      alert(e.message || 'Error connecting to server');
    } finally {
      setSessionSubmitting(false);
    }
  };

  const handleCloseSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to close this attendance session? Students will no longer be able to scan.')) return;
    try {
      const res = await fetch(`/api/app/education/attendance/sessions/${sessionId}/close`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveLiveSession(updated);
        fetchPortalData(portalData?.lecturer?.id);
      }
    } catch (e) {
      console.error('Error closing session:', e);
    }
  };

  const handleManualMarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLiveSession || !manualMarkStudentId) return;

    try {
      const res = await fetch(`/api/app/education/attendance/sessions/${activeLiveSession.id}/manual-mark`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          studentId: manualMarkStudentId,
          status: manualMarkStatus,
          remarks: manualMarkRemarks
        })
      });

      if (res.ok) {
        setIsManualMarkModalOpen(false);
        setManualMarkRemarks('');
        fetchSessionScans(activeLiveSession.id);
        fetchPortalData(portalData?.lecturer?.id);
      }
    } catch (e) {
      console.error('Error manual marking attendance:', e);
    }
  };

  // Grade calculation helper
  const calculateGradeDetails = (cat: number, exam: number) => {
    const total = Math.min(100, Math.round(Number(cat || 0) + Number(exam || 0)));
    let grade = 'F';
    let points = 0;
    let remarks = 'Fail';
    if (total >= 70) { grade = 'A'; points = 4.0; remarks = 'Distinction'; }
    else if (total >= 60) { grade = 'B'; points = 3.0; remarks = 'Credit'; }
    else if (total >= 50) { grade = 'C'; points = 2.0; remarks = 'Pass'; }
    else if (total >= 40) { grade = 'D'; points = 1.0; remarks = 'Pass'; }
    else { grade = 'F'; points = 0; remarks = 'Referral'; }
    return { total, grade, points, remarks };
  };

  // Handle saving marksheet
  const handleSaveGrades = async () => {
    if (!gradingUnitId || !portalData?.students) return;
    setSavingGrades(true);
    setGradeSaveSuccess(false);

    try {
      const gradesToSubmit = portalData.students.map((st: Student) => {
        const draft = gradesDraft[st.id] || { cat: 0, exam: 0 };
        // If not in draft, check if student already had grades recorded
        const existing = portalData.grades?.find((g: StudentGradeRecord) => g.studentId === st.id && g.unitId === gradingUnitId);
        const cat = draft.cat !== undefined ? draft.cat : (existing?.catScore || 0);
        const exam = draft.exam !== undefined ? draft.exam : (existing?.examScore || 0);

        return {
          studentId: st.id,
          unitId: gradingUnitId,
          academicTerm: gradingTerm,
          academicYear: st.academicYear,
          catScore: cat,
          examScore: exam
        };
      });

      const res = await fetch('/api/app/education/grades', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ grades: gradesToSubmit })
      });

      if (res.ok) {
        setGradeSaveSuccess(true);
        setTimeout(() => setGradeSaveSuccess(false), 3000);
        fetchPortalData(portalData?.lecturer?.id);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to record grades');
      }
    } catch (e: any) {
      alert(e.message || 'Error recording grades');
    } finally {
      setSavingGrades(false);
    }
  };

  const lecturer = portalData?.lecturer;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Simulation / Admin Preview Banner */}
      {isSimulating && (
        <div className="bg-slate-900 border border-slate-700 text-white p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                Administrator Faculty Portal Preview
              </div>
              <p className="text-[11px] text-slate-300">
                Simulating faculty workspace as: <span className="font-bold text-white">{lecturer?.fullName || 'Selected Faculty Member'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {allStaff.length > 0 && (
              <select
                value={selectedTeacherId}
                onChange={e => setSelectedTeacherId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {allStaff.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.staffNo || 'Faculty'}) — {s.departmentName || 'Dept'}
                  </option>
                ))}
              </select>
            )}

            {onBackToAdmin && (
              <button
                onClick={onBackToAdmin}
                className="px-3 py-1.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Return to Admin ERP
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lecturer Hero Card */}
      {lecturer && (
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center space-x-4 sm:space-x-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-600/20 border-2 border-blue-500/30 flex items-center justify-center text-blue-400 text-2xl font-bold shrink-0 shadow-inner">
                {lecturer.fullName?.charAt(0) || 'T'}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{lecturer.fullName}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {lecturer.roleTitle || 'Faculty Lecturer'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-mono font-medium">
                  Staff ID: <span className="text-white font-bold">{lecturer.staffNo || 'STF-001'}</span>
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    Dept: {lecturer.departmentName || 'Academic Faculty'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    Designation: {lecturer.designation || 'Lecturer'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action: Start Live QR Attendance */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (portalData?.assignedClasses?.length > 0 && !newSessionClassId) {
                    setNewSessionClassId(portalData.assignedClasses[0].id);
                  }
                  if (portalData?.assignedUnits?.length > 0 && !newSessionUnitId) {
                    setNewSessionUnitId(portalData.assignedUnits[0].id);
                  }
                  setIsCreatingSession(true);
                }}
                className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all transform active:scale-98 cursor-pointer"
              >
                <QrCode className="w-4 h-4 shrink-0" />
                <span>Start Live QR Attendance</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex overflow-x-auto border-b border-slate-200 bg-white px-3 rounded-2xl shadow-2xs gap-1.5 py-1.5 text-xs font-medium text-slate-600">
        {[
          { id: 'overview', label: 'Faculty Dashboard', icon: Sparkles },
          { id: 'attendance_sessions', label: 'QR Attendance Sessions', icon: QrCode },
          { id: 'units', label: 'Assigned Units & Students', icon: BookOpen },
          { id: 'timetable', label: 'Teaching Schedule', icon: Calendar },
          { id: 'grading', label: 'Marksheet & Grading', icon: Award }
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
          <p className="text-xs font-medium">Loading faculty data...</p>
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
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Clusters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Assigned Units</span>
                  <div className="text-2xl font-bold text-slate-900">{portalData.assignedUnits?.length || 0}</div>
                  <p className="text-[11px] text-blue-600">Active Course Units</p>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Assigned Classes</span>
                  <div className="text-2xl font-bold text-slate-900">{portalData.assignedClasses?.length || 0}</div>
                  <p className="text-[11px] text-slate-500">Student Cohorts</p>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Enrolled Students</span>
                  <div className="text-2xl font-bold text-emerald-700">{portalData.students?.length || 0}</div>
                  <p className="text-[11px] text-emerald-600 font-medium">In your units</p>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Total Attendance Sessions</span>
                  <div className="text-2xl font-bold text-indigo-600">{portalData.attendanceSessions?.length || 0}</div>
                  <p className="text-[11px] text-slate-500">Recorded sessions</p>
                </div>
              </div>

              {/* Active Session Display if Running */}
              {activeLiveSession && activeLiveSession.status === 'ACTIVE' && (
                <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                        <h3 className="text-lg font-bold text-white">Live Attendance Session in Progress</h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {activeLiveSession.unitCode} - {activeLiveSession.unitName} ({activeLiveSession.className})
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 bg-blue-600/30 border border-blue-500/40 text-blue-300 rounded-xl text-xs font-mono font-bold">
                        {timeLeftStr}
                      </span>
                      <button
                        onClick={() => handleCloseSession(activeLiveSession.id)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <StopCircle className="w-3.5 h-3.5" />
                        <span>Close Session</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    {/* Left: Huge QR Display */}
                    <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-inner text-slate-900 space-y-3">
                      {liveQrCodeUrl ? (
                        <img src={liveQrCodeUrl} alt="Live QR Code" className="w-64 h-64 object-contain" />
                      ) : (
                        <div className="w-64 h-64 flex items-center justify-center bg-slate-100 rounded-xl">
                          <QrCode className="w-16 h-16 text-slate-400 animate-pulse" />
                        </div>
                      )}
                      <div className="text-center space-y-1">
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                          Session Check-In Code
                        </div>
                        <div className="text-2xl font-black font-mono tracking-widest text-blue-700 bg-blue-50 px-4 py-1.5 rounded-xl border border-blue-200">
                          {activeLiveSession.sessionCode}
                        </div>
                        <p className="text-[11px] text-slate-500 pt-1">
                          Students scan code or input above PIN into their Student Portal
                        </p>
                      </div>
                    </div>

                    {/* Right: Live Attendee Counter & Roster */}
                    <div className="md:col-span-7 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-sm font-bold text-white">Live Checked-In Attendees ({liveSessionScans.length})</h4>
                        </div>
                        <button
                          onClick={() => setIsManualMarkModalOpen(true)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg flex items-center space-x-1 border border-slate-700 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Manual Mark</span>
                        </button>
                      </div>

                      <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800 max-h-72 overflow-y-auto divide-y divide-slate-800/80">
                        {liveSessionScans.length === 0 ? (
                          <p className="text-xs text-slate-500 text-center py-10">
                            Waiting for students to scan attendance QR code...
                          </p>
                        ) : (
                          liveSessionScans.map((scan: AttendanceScanRecord) => (
                            <div key={scan.id} className="py-2.5 px-2 flex items-center justify-between text-xs">
                              <div className="space-y-0.5">
                                <div className="font-semibold text-white">{scan.studentName}</div>
                                <div className="text-[11px] text-slate-400 font-mono">{scan.admissionNo}</div>
                              </div>
                              <div className="text-right space-y-0.5">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  scan.status === 'PRESENT' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300'
                                }`}>
                                  {scan.status}
                                </span>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  {new Date(scan.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Two column: Today's Schedule & Quick Units */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Teaching Schedule */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <h3 className="font-bold text-sm text-slate-900">Teaching Timetable</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('timetable')}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  {portalData.timetable?.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No teaching sessions scheduled.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {portalData.timetable?.slice(0, 4).map((tt: TimetableEntry) => (
                        <div key={tt.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-semibold text-slate-900">{tt.unitCode} - {tt.unitName}</div>
                            <div className="text-[11px] text-slate-500">
                              {tt.dayOfWeek} • {tt.startTime} - {tt.endTime} • Venue: {tt.roomVenue}
                            </div>
                          </div>
                          <span className="text-xs font-mono font-medium text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                            {tt.groupName || 'General'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Assigned Course Units */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      <h3 className="font-bold text-sm text-slate-900">Assigned Curriculum Units</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('units')}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  {portalData.assignedUnits?.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No units assigned.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {portalData.assignedUnits?.slice(0, 4).map((u: UnitSubject) => (
                        <div key={u.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-semibold text-slate-900">{u.code} - {u.name}</div>
                            <div className="text-[11px] text-slate-500">Credits: {u.creditHours || 3} • Term: {u.semester || (u as any).academicTerm || 'Semester 1'}</div>
                          </div>
                          <button
                            onClick={() => {
                              setGradingUnitId(u.id);
                              setActiveTab('grading');
                            }}
                            className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-semibold transition-colors cursor-pointer"
                          >
                            Enter Grades
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QR ATTENDANCE SESSIONS */}
          {activeTab === 'attendance_sessions' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Attendance Session Manager</h3>
                  <p className="text-xs text-slate-500">Launch dynamic QR code sessions for lecture check-in and view scan history</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingSession(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start New Session</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-3 px-4">Session Code</th>
                      <th className="py-3 px-4">Unit</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Venue</th>
                      <th className="py-3 px-4 text-center">Attendees</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {portalData.attendanceSessions?.map((s: AttendanceSession) => (
                      <tr key={s.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono font-bold text-blue-700">{s.sessionCode}</td>
                        <td className="py-3 px-4 font-medium text-slate-900">{s.unitCode} - {s.unitName}</td>
                        <td className="py-3 px-4 text-slate-600">{s.className}</td>
                        <td className="py-3 px-4 text-slate-600">{s.date}</td>
                        <td className="py-3 px-4 text-slate-600">{s.venue}</td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-700">{s.attendeeCount || 0}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                              : s.status === 'CLOSED'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => openLiveSession(s)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Open QR Display
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: UNITS & STUDENTS */}
          {activeTab === 'units' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Assigned Units & Enrolled Students</h3>
                  <p className="text-xs text-slate-500">Student roster across your course units</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-3 px-4">Admission No</th>
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4">Program</th>
                        <th className="py-3 px-4">Class</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {portalData.students?.map((st: Student) => (
                        <tr key={st.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{st.admissionNo}</td>
                          <td className="py-3 px-4 font-medium text-slate-800">{st.fullName}</td>
                          <td className="py-3 px-4 text-slate-600">{st.programName}</td>
                          <td className="py-3 px-4 text-slate-600">{st.className || 'General'}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {st.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-slate-500">{st.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TEACHING SCHEDULE */}
          {activeTab === 'timetable' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Faculty Teaching Schedule</h3>
                <p className="text-xs text-slate-500">Timetable slots where you are assigned as the instructor</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-3 px-4">Day</th>
                      <th className="py-3 px-4">Time Slot</th>
                      <th className="py-3 px-4">Unit Code & Name</th>
                      <th className="py-3 px-4">Venue</th>
                      <th className="py-3 px-4">Class Group</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {portalData.timetable?.map((tt: TimetableEntry) => (
                      <tr key={tt.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-semibold text-slate-900">{tt.dayOfWeek}</td>
                        <td className="py-3 px-4 font-mono text-blue-700">{tt.startTime} - {tt.endTime}</td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-slate-800 mr-1.5">{tt.unitCode}</span>
                          <span className="text-slate-600">{tt.unitName}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">{tt.roomVenue}</td>
                        <td className="py-3 px-4 text-slate-600">{tt.groupName || 'General'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: MARKSHEET & GRADING */}
          {activeTab === 'grading' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Marksheet & Academic Assessment</h3>
                    <p className="text-xs text-slate-500">Record CAT and Final Exam marks for students in your units</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={gradingUnitId}
                      onChange={e => setGradingUnitId(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 rounded-xl px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    >
                      {portalData.assignedUnits?.map((u: UnitSubject) => (
                        <option key={u.id} value={u.id}>
                          {u.code} - {u.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={gradingTerm}
                      onChange={e => setGradingTerm(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 rounded-xl px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                      <option value="Term 1">Term 1</option>
                      <option value="Term 2">Term 2</option>
                      <option value="Term 3">Term 3</option>
                    </select>

                    <button
                      onClick={handleSaveGrades}
                      disabled={savingGrades}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center space-x-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>{savingGrades ? 'Saving...' : 'Save & Publish Grades'}</span>
                    </button>
                  </div>
                </div>

                {gradeSaveSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Academic grades successfully saved and published!</span>
                  </div>
                )}

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-3 px-4">Admission No</th>
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-3 text-center">CAT Score (30)</th>
                        <th className="py-3 px-3 text-center">Exam Score (70)</th>
                        <th className="py-3 px-3 text-center">Total Score (100)</th>
                        <th className="py-3 px-3 text-center">Grade</th>
                        <th className="py-3 px-3 text-center">GP</th>
                        <th className="py-3 px-4">Status & Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {portalData.students?.map((st: Student) => {
                        const existing = portalData.grades?.find(
                          (g: StudentGradeRecord) => g.studentId === st.id && g.unitId === gradingUnitId
                        );
                        const draft = gradesDraft[st.id];
                        const cat = draft?.cat !== undefined ? draft.cat : (existing?.catScore || 0);
                        const exam = draft?.exam !== undefined ? draft.exam : (existing?.examScore || 0);
                        const { total, grade, points, remarks } = calculateGradeDetails(cat, exam);

                        return (
                          <tr key={st.id} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{st.admissionNo}</td>
                            <td className="py-2.5 px-4 font-medium text-slate-800">{st.fullName}</td>
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="number"
                                min="0"
                                max="40"
                                value={cat}
                                onChange={e => {
                                  const val = Math.max(0, Math.min(40, Number(e.target.value) || 0));
                                  setGradesDraft(prev => ({
                                    ...prev,
                                    [st.id]: { cat: val, exam: prev[st.id]?.exam ?? exam }
                                  }));
                                }}
                                className="w-16 px-2 py-1 text-center bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="number"
                                min="0"
                                max="70"
                                value={exam}
                                onChange={e => {
                                  const val = Math.max(0, Math.min(70, Number(e.target.value) || 0));
                                  setGradesDraft(prev => ({
                                    ...prev,
                                    [st.id]: { cat: prev[st.id]?.cat ?? cat, exam: val }
                                  }));
                                }}
                                className="w-16 px-2 py-1 text-center bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">{total}%</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold font-mono rounded">
                                {grade}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono text-slate-700">{points}</td>
                            <td className="py-2.5 px-4 text-slate-500 text-[11px]">{remarks}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* CREATE SESSION MODAL */}
      {isCreatingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-sm">Start Live QR Attendance Session</h3>
              </div>
              <button
                onClick={() => setIsCreatingSession(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Select Class Cohort *</label>
                <select
                  required
                  value={newSessionClassId}
                  onChange={e => setNewSessionClassId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                >
                  <option value="">-- Choose Class --</option>
                  {portalData?.assignedClasses?.map((c: SchoolClass) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.academicYear})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Select Course Unit *</label>
                <select
                  required
                  value={newSessionUnitId}
                  onChange={e => setNewSessionUnitId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                >
                  <option value="">-- Choose Unit --</option>
                  {portalData?.assignedUnits?.map((u: UnitSubject) => (
                    <option key={u.id} value={u.id}>
                      {u.code} - {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Lesson Topic / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Introduction to Database Normalization"
                  value={newSessionLessonTitle}
                  onChange={e => setNewSessionLessonTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Venue / Room</label>
                  <input
                    type="text"
                    placeholder="e.g. Lab 3 / Hall B"
                    value={newSessionVenue}
                    onChange={e => setNewSessionVenue(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Duration (Minutes)</label>
                  <select
                    value={newSessionDuration}
                    onChange={e => setNewSessionDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  >
                    <option value="10">10 Minutes</option>
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">60 Minutes</option>
                    <option value="120">2 Hours</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingSession(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sessionSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center space-x-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{sessionSubmitting ? 'Starting...' : 'Launch QR Session'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL MARK MODAL */}
      {isManualMarkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-900 text-white">
              <h3 className="font-semibold text-xs">Manual Student Roll Override</h3>
              <button onClick={() => setIsManualMarkModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualMarkSubmit} className="p-5 space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Select Student</label>
                <select
                  required
                  value={manualMarkStudentId}
                  onChange={e => setManualMarkStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">-- Choose Student --</option>
                  {portalData?.students?.map((st: Student) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} ({st.admissionNo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Attendance Status</label>
                <select
                  value={manualMarkStatus}
                  onChange={e => setManualMarkStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="PRESENT">Present</option>
                  <option value="LATE">Late</option>
                  <option value="EXCUSED">Excused</option>
                  <option value="ABSENT">Absent</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Remarks / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Phone battery dead / permission granted"
                  value={manualMarkRemarks}
                  onChange={e => setManualMarkRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsManualMarkModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-xl"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
