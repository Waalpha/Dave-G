import React, { useState, useEffect } from 'react';
import { TimetableEntry, StudentAttendance, SchoolClass, Unit, LecturerStaff, Student } from '../../../types';
import {
  Calendar, Clock, Users, Plus, CheckCircle2, AlertCircle, Trash2,
  Check, X, Search, Filter, Layers, UserCheck, AlertTriangle, WifiOff
} from 'lucide-react';
import { offlineSyncService } from '../../../lib/offlineSyncService';
import { useAuth } from '../../../context/AuthContext';

export const TimetableAttendance: React.FC = () => {
  const { currentTenant, user } = useAuth();
  const [subTab, setSubTab] = useState<'timetable' | 'attendance'>('timetable');

  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [staffList, setStaffList] = useState<LecturerStaff[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<StudentAttendance[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Timetable Filter & Form
  const [selectedDayFilter, setSelectedDayFilter] = useState('ALL');
  const [isTTModalOpen, setIsTTModalOpen] = useState(false);
  const [ttDay, setTtDay] = useState('Monday');
  const [ttStartTime, setTtStartTime] = useState('08:30');
  const [ttEndTime, setTtEndTime] = useState('11:30');
  const [ttUnitId, setTtUnitId] = useState('');
  const [ttLecturerId, setTtLecturerId] = useState('');
  const [ttRoom, setTtRoom] = useState('Lecture Hall 1');
  const [ttGroupId, setTtGroupId] = useState('');
  const [deleteTTId, setDeleteTTId] = useState<string | null>(null);

  // Attendance Form
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attClassId, setAttClassId] = useState('');
  const [attUnitId, setAttUnitId] = useState('');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: StudentAttendance['status']; remarks: string }>>({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  const getHeaders = () => ({
    'x-user-id': user?.id || localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchData = async () => {
    const tenantId = currentTenant?.id || '';
    try {
      setLoading(true);
      setErrorMsg('');
      const [resTT, resCls, resAcad, resFac, resStud] = await Promise.all([
        fetch('/api/app/education/timetable', { headers: getHeaders() }),
        fetch('/api/app/education/classes', { headers: getHeaders() }),
        fetch('/api/app/education/academics', { headers: getHeaders() }),
        fetch('/api/app/education/faculty', { headers: getHeaders() }),
        fetch('/api/app/education/students', { headers: getHeaders() })
      ]);

      if (resTT.ok) {
        const tt = await resTT.json();
        setTimetable(tt);
        if (tenantId) offlineSyncService.cacheLookupData(tenantId, 'edu_timetable', tt);
      }
      if (resCls.ok) {
        const cls = await resCls.json();
        setClasses(cls);
        if (cls.length > 0 && !attClassId) setAttClassId(cls[0].id);
        if (tenantId) offlineSyncService.cacheLookupData(tenantId, 'edu_classes', cls);
      }
      if (resAcad.ok) {
        const acad = await resAcad.json();
        const un = acad.units || [];
        setUnits(un);
        if (un.length > 0 && !attUnitId) setAttUnitId(un[0].id);
        if (tenantId) offlineSyncService.cacheLookupData(tenantId, 'edu_units', un);
      }
      if (resFac.ok) {
        const fac = await resFac.json();
        setStaffList(fac);
        if (tenantId) offlineSyncService.cacheLookupData(tenantId, 'edu_faculty', fac);
      }
      if (resStud.ok) {
        const stud = await resStud.json();
        setStudents(stud);
        if (tenantId) offlineSyncService.cacheLookupData(tenantId, 'edu_students', stud);
      }
    } catch (err: any) {
      console.warn('[TimetableAttendance] Network fetch error, loading from offline cache:', err);
      if (tenantId) {
        const [cTT, cCls, cUnits, cFac, cStud] = await Promise.all([
          offlineSyncService.getCachedLookupData<TimetableEntry[]>(tenantId, 'edu_timetable'),
          offlineSyncService.getCachedLookupData<SchoolClass[]>(tenantId, 'edu_classes'),
          offlineSyncService.getCachedLookupData<Unit[]>(tenantId, 'edu_units'),
          offlineSyncService.getCachedLookupData<LecturerStaff[]>(tenantId, 'edu_faculty'),
          offlineSyncService.getCachedLookupData<Student[]>(tenantId, 'edu_students')
        ]);
        if (cTT) setTimetable(cTT);
        if (cCls && cCls.length > 0) {
          setClasses(cCls);
          if (!attClassId) setAttClassId(cCls[0].id);
        }
        if (cUnits && cUnits.length > 0) {
          setUnits(cUnits);
          if (!attUnitId) setAttUnitId(cUnits[0].id);
        }
        if (cFac) setStaffList(cFac);
        if (cStud) setStudents(cStud);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch Attendance for selected class/unit/date
  const fetchAttendanceRecords = async () => {
    if (!attClassId) return;
    try {
      const res = await fetch(`/api/app/education/attendance?classId=${attClassId}&date=${attDate}&unitId=${attUnitId}`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const records: StudentAttendance[] = await res.json();
        setAttendanceRecords(records);
        const map: Record<string, { status: StudentAttendance['status']; remarks: string }> = {};
        records.forEach(r => {
          map[r.studentId] = { status: r.status, remarks: r.remarks || '' };
        });
        setAttendanceMap(map);
      }
    } catch (err) {
      console.error('Error fetching attendance records:', err);
    }
  };

  useEffect(() => {
    if (subTab === 'attendance' && attClassId) {
      fetchAttendanceRecords();
    }
  }, [subTab, attClassId, attUnitId, attDate]);

  // Timetable Add
  const handleAddTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const unit = units.find(u => u.id === ttUnitId);
      const lec = staffList.find(s => s.id === ttLecturerId);
      const cls = classes.find(c => c.id === ttGroupId);

      const payload = {
        dayOfWeek: ttDay,
        startTime: ttStartTime,
        endTime: ttEndTime,
        unitId: ttUnitId,
        unitCode: unit?.code || 'UNIT101',
        unitName: unit?.name || 'Unit Name',
        lecturerId: ttLecturerId,
        lecturerName: lec?.fullName || 'Lecturer',
        roomVenue: ttRoom.trim(),
        groupName: cls?.name || 'All Students'
      };

      const res = await fetch('/api/app/education/timetable', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to add timetable slot');

      setSuccessMsg('Timetable session added.');
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsTTModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error adding timetable entry');
    }
  };

  const handleDeleteTimetable = async (id: string) => {
    try {
      const res = await fetch(`/api/app/education/timetable/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setSuccessMsg('Timetable entry removed.');
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchData();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to remove timetable entry');
    }
  };

  // Mark all present
  const markAllPresent = () => {
    const classStudents = students.filter(s => s.classId === attClassId);
    const newMap = { ...attendanceMap };
    classStudents.forEach(s => {
      newMap[s.id] = { status: 'PRESENT', remarks: '' };
    });
    setAttendanceMap(newMap);
  };

  // Save Attendance
  const handleSaveAttendance = async () => {
    const classStudents = students.filter(s => s.classId === attClassId);
    if (classStudents.length === 0) return;

    // Check offline permission and subscription lease validity
    const writeCheck = offlineSyncService.canPerformOfflineWrite('education');
    if (!writeCheck.allowed) {
      setErrorMsg(writeCheck.reason || 'Offline attendance marking is currently blocked.');
      setTimeout(() => setErrorMsg(''), 5000);
      return;
    }

    const tenantId = currentTenant?.id || '';
    const userId = user?.id || localStorage.getItem('erp_user_id') || '';

    try {
      setSavingAttendance(true);
      const unit = units.find(u => u.id === attUnitId);
      const cls = classes.find(c => c.id === attClassId);

      const records = classStudents.map(s => ({
        studentId: s.id,
        studentName: s.fullName,
        admissionNo: s.admissionNo,
        classId: attClassId,
        className: cls?.name || '',
        unitId: attUnitId || undefined,
        unitName: unit?.name || undefined,
        date: attDate,
        status: attendanceMap[s.id]?.status || 'PRESENT',
        remarks: attendanceMap[s.id]?.remarks || ''
      }));

      try {
        const res = await fetch('/api/app/education/attendance', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ records })
        });

        if (!res.ok) throw new Error('Server request failed');

        setSuccessMsg(`Attendance saved online for ${records.length} students on ${attDate}.`);
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchAttendanceRecords();
      } catch (networkErr) {
        // Enqueue into offline sync service
        await offlineSyncService.enqueueMutation(tenantId, userId, 'education', 'education.record_attendance', { records });
        setSuccessMsg(`Attendance recorded in Controlled Offline Mode (${records.length} students). Will synchronize automatically when connection is restored.`);
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving attendance');
    } finally {
      setSavingAttendance(false);
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const filteredTimetable = timetable.filter(t => {
    if (selectedDayFilter === 'ALL') return true;
    return t.dayOfWeek.toLowerCase() === selectedDayFilter.toLowerCase();
  });

  const currentClassStudents = students.filter(s => s.classId === attClassId);

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

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-2xs gap-2 py-1 text-xs font-medium text-slate-600">
        <button
          onClick={() => setSubTab('timetable')}
          className={`flex items-center space-x-2 py-2.5 px-3 border-b-2 font-medium transition-colors cursor-pointer ${
            subTab === 'timetable'
              ? 'border-blue-600 text-blue-700 font-semibold'
              : 'border-transparent hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Lecture Timetable Schedule</span>
        </button>

        <button
          onClick={() => setSubTab('attendance')}
          className={`flex items-center space-x-2 py-2.5 px-3 border-b-2 font-medium transition-colors cursor-pointer ${
            subTab === 'attendance'
              ? 'border-blue-600 text-blue-700 font-semibold'
              : 'border-transparent hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Daily Student Attendance Register</span>
        </button>
      </div>

      {/* TIMETABLE TAB */}
      {subTab === 'timetable' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Weekly Class Timetable & Room Venues</h3>
              <p className="text-xs text-slate-500">Scheduled lecture periods, lecturer assignments, and room allocations.</p>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={selectedDayFilter}
                onChange={e => setSelectedDayFilter(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
              >
                <option value="ALL">All Days (Mon - Sat)</option>
                {daysOfWeek.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <button
                onClick={() => {
                  setTtUnitId(units[0]?.id || '');
                  setTtLecturerId(staffList[0]?.id || '');
                  setTtGroupId(classes[0]?.id || '');
                  setIsTTModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Timetable Slot</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Day</th>
                  <th className="p-3">Time Period</th>
                  <th className="p-3">Unit / Module</th>
                  <th className="p-3">Lecturer</th>
                  <th className="p-3">Room / Venue</th>
                  <th className="p-3">Student Cohort / Group</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTimetable.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      No timetable slots scheduled.
                    </td>
                  </tr>
                ) : (
                  filteredTimetable.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-blue-700">{t.dayOfWeek}</td>
                      <td className="p-3 font-mono font-medium text-slate-800">
                        {t.startTime} - {t.endTime}
                      </td>
                      <td className="p-3 font-semibold text-slate-900">
                        <span className="font-mono text-blue-600 mr-1.5">{t.unitCode}:</span>
                        {t.unitName}
                      </td>
                      <td className="p-3 text-slate-700">{t.lecturerName}</td>
                      <td className="p-3 font-mono font-bold text-slate-800">{t.roomVenue}</td>
                      <td className="p-3 text-slate-600">{t.groupName}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteTimetable(t.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ATTENDANCE REGISTER TAB */}
      {subTab === 'attendance' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Class Attendance Roll Call</h3>
              <p className="text-xs text-slate-500">Record and track daily attendance registers for each student cohort.</p>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={markAllPresent}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Mark All Present
              </button>
              <button
                onClick={handleSaveAttendance}
                disabled={savingAttendance || currentClassStudents.length === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>{savingAttendance ? 'Saving...' : 'Save Attendance Sheet'}</span>
              </button>
            </div>
          </div>

          {/* Session Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Select Date</label>
              <input
                type="date"
                value={attDate}
                onChange={e => setAttDate(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Select Class / Cohort</label>
              <select
                value={attClassId}
                onChange={e => setAttClassId(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Select Unit / Subject (Optional)</label>
              <select
                value={attUnitId}
                onChange={e => setAttUnitId(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
              >
                <option value="">-- General Daily Roll Call --</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.code}: {u.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Admission No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Attendance Status</th>
                  <th className="p-3">Remarks / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentClassStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-400">
                      No students enrolled in this class. Please assign students in the SIS tab.
                    </td>
                  </tr>
                ) : (
                  currentClassStudents.map(s => {
                    const currentStatus = attendanceMap[s.id]?.status || 'PRESENT';
                    return (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-blue-700">{s.admissionNo}</td>
                        <td className="p-3 font-semibold text-slate-900">{s.fullName}</td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map(st => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => {
                                  setAttendanceMap(prev => ({
                                    ...prev,
                                    [s.id]: { ...prev[s.id], status: st, remarks: prev[s.id]?.remarks || '' }
                                  }));
                                }}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                                  currentStatus === st
                                    ? st === 'PRESENT'
                                      ? 'bg-emerald-600 text-white'
                                      : st === 'ABSENT'
                                      ? 'bg-red-600 text-white'
                                      : st === 'LATE'
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            placeholder="e.g. Doctor's appointment"
                            value={attendanceMap[s.id]?.remarks || ''}
                            onChange={e => {
                              const r = e.target.value;
                              setAttendanceMap(prev => ({
                                ...prev,
                                [s.id]: { status: prev[s.id]?.status || 'PRESENT', remarks: r }
                              }));
                            }}
                            className="p-1.5 bg-slate-50 border border-slate-200 rounded text-xs w-full max-w-xs"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD TIMETABLE SLOT MODAL */}
      {isTTModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddTimetable} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <h3 className="text-base font-bold text-slate-900">Add Timetable Session Slot</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Day of Week</label>
                  <select
                    value={ttDay}
                    onChange={e => setTtDay(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    {daysOfWeek.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Start Time</label>
                  <input
                    type="time"
                    value={ttStartTime}
                    onChange={e => setTtStartTime(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">End Time</label>
                  <input
                    type="time"
                    value={ttEndTime}
                    onChange={e => setTtEndTime(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Unit / Module</label>
                <select
                  value={ttUnitId}
                  onChange={e => setTtUnitId(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  {units.map(u => (
                    <option key={u.id} value={u.id}>{u.code}: {u.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Lecturer</label>
                  <select
                    value={ttLecturerId}
                    onChange={e => setTtLecturerId(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    {staffList.map(s => (
                      <option key={s.id} value={s.id}>{s.fullName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Venue / Room</label>
                  <input
                    type="text"
                    value={ttRoom}
                    onChange={e => setTtRoom(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Target Student Cohort / Class</label>
                <select
                  value={ttGroupId}
                  onChange={e => setTtGroupId(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsTTModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
              >
                Schedule Slot
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
