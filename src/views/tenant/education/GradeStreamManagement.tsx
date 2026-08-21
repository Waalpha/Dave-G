import React, { useState, useEffect } from 'react';
import { SchoolGrade, GradeStream, Student, StudentPromotionRecord } from '../../../types';
import {
  Layers, Plus, Search, Edit, Trash2, CheckCircle2, AlertCircle,
  Users, User, Building, Clock, X, Check, Eye, ArrowRight,
  TrendingUp, RefreshCw, ShieldCheck, Award, BookOpen, ChevronRight,
  Sparkles, CheckSquare, Square
} from 'lucide-react';

interface GradeStreamManagementProps {
  onOpenStudentProfile?: (studentId: string) => void;
}

export const GradeStreamManagement: React.FC<GradeStreamManagementProps> = ({
  onOpenStudentProfile
}) => {
  const [grades, setGrades] = useState<SchoolGrade[]>([]);
  const [streams, setStreams] = useState<GradeStream[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [promotionHistory, setPromotionHistory] = useState<StudentPromotionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Active view: 'hierarchy' | 'promotions' | 'history'
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'promotions' | 'history'>('hierarchy');

  // Selected Grade filter
  const [selectedGradeId, setSelectedGradeId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<SchoolGrade | null>(null);

  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<GradeStream | null>(null);
  const [targetGradeForStream, setTargetGradeForStream] = useState<string>('');

  const [deleteCandidate, setDeleteCandidate] = useState<{ type: 'GRADE' | 'STREAM'; id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [viewingStreamRoster, setViewingStreamRoster] = useState<{ stream: GradeStream; grade: SchoolGrade } | null>(null);

  // Grade Form State
  const [gradeName, setGradeName] = useState('');
  const [gradeCode, setGradeCode] = useState('');
  const [gradeLevelNumber, setGradeLevelNumber] = useState<number>(1);
  const [gradeStage, setGradeStage] = useState<'LOWER_PRIMARY' | 'UPPER_PRIMARY' | 'JUNIOR_SCHOOL'>('LOWER_PRIMARY');
  const [gradeClassTeacher, setGradeClassTeacher] = useState('');
  const [gradeRoom, setGradeRoom] = useState('');
  const [gradeCapacity, setGradeCapacity] = useState('80');
  const [gradeDescription, setGradeDescription] = useState('');

  // Stream Form State
  const [streamName, setStreamName] = useState('');
  const [streamCode, setStreamCode] = useState('');
  const [streamClassTeacher, setStreamClassTeacher] = useState('');
  const [streamRoom, setStreamRoom] = useState('');
  const [streamCapacity, setStreamCapacity] = useState('40');

  // Promotion Form State
  const [sourceGradeId, setSourceGradeId] = useState<string>('');
  const [sourceStreamId, setSourceStreamId] = useState<string>('');
  const [targetGradeId, setTargetGradeId] = useState<string>('');
  const [targetStreamId, setTargetStreamId] = useState<string>('');
  const [promotionAcademicYear, setPromotionAcademicYear] = useState<string>('2026/2027');
  const [promotionReason, setPromotionReason] = useState<string>('End of Academic Year Progression');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isPromoting, setIsPromoting] = useState(false);
  const [promotionSuccessDetails, setPromotionSuccessDetails] = useState<any>(null);

  const getHeaders = () => ({
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [resGrades, resStreams, resStudents, resPromos] = await Promise.all([
        fetch('/api/app/education/grades', { headers: getHeaders() }),
        fetch('/api/app/education/streams', { headers: getHeaders() }),
        fetch('/api/app/education/students', { headers: getHeaders() }),
        fetch('/api/app/education/promotions/history', { headers: getHeaders() })
      ]);

      if (resGrades.ok) {
        const g = await resGrades.json();
        setGrades(Array.isArray(g) ? g : []);
      }
      if (resStreams.ok) {
        const s = await resStreams.json();
        setStreams(Array.isArray(s) ? s : []);
      }
      if (resStudents.ok) {
        const st = await resStudents.json();
        setStudents(Array.isArray(st) ? st : []);
      }
      if (resPromos.ok) {
        const p = await resPromos.json();
        setPromotionHistory(Array.isArray(p) ? p : []);
      }
    } catch (err: any) {
      console.error('Error fetching grades/streams data:', err);
      setErrorMsg('Failed to load grades and streams.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update stage automatically when grade level changes
  useEffect(() => {
    if (gradeLevelNumber <= 3) setGradeStage('LOWER_PRIMARY');
    else if (gradeLevelNumber <= 6) setGradeStage('UPPER_PRIMARY');
    else setGradeStage('JUNIOR_SCHOOL');
  }, [gradeLevelNumber]);

  // Seed default Grade 1 to Grade 9
  const handleSeedDefaults = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch('/api/app/education/grades/seed-defaults', {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to seed default grades');
      setSuccessMsg('Successfully initialized standard Grade 1 to Grade 9 and default streams!');
      setTimeout(() => setSuccessMsg(''), 4000);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to seed default grades');
    } finally {
      setLoading(false);
    }
  };

  // Grade Modal Handlers
  const openAddGradeModal = () => {
    setEditingGrade(null);
    const nextLevel = Math.min(9, grades.length + 1);
    setGradeLevelNumber(nextLevel);
    setGradeName(`Grade ${nextLevel}`);
    setGradeCode(`G${nextLevel}`);
    setGradeClassTeacher('');
    setGradeRoom(`Block A, Room ${nextLevel}`);
    setGradeCapacity('80');
    setGradeDescription(`Grade ${nextLevel} Primary/Junior basic education curriculum`);
    setIsGradeModalOpen(true);
  };

  const openEditGradeModal = (grade: SchoolGrade) => {
    setEditingGrade(grade);
    setGradeName(grade.name);
    setGradeCode(grade.code);
    setGradeLevelNumber(grade.levelNumber);
    setGradeStage(grade.stage || 'LOWER_PRIMARY');
    setGradeClassTeacher(grade.classTeacherId || '');
    setGradeRoom(grade.room || '');
    setGradeCapacity(String(grade.capacity || 80));
    setGradeDescription(grade.description || '');
    setIsGradeModalOpen(true);
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeName.trim() || !gradeCode.trim()) {
      setErrorMsg('Grade name and code are required.');
      return;
    }

    try {
      const payload = {
        name: gradeName.trim(),
        code: gradeCode.trim().toUpperCase(),
        levelNumber: Number(gradeLevelNumber),
        stage: gradeStage,
        classTeacherId: gradeClassTeacher.trim() || undefined,
        room: gradeRoom.trim() || undefined,
        capacity: Number(gradeCapacity) || 80,
        description: gradeDescription.trim() || undefined,
        isActive: true
      };

      const url = editingGrade ? `/api/app/education/grades/${editingGrade.id}` : '/api/app/education/grades';
      const method = editingGrade ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save grade');

      setSuccessMsg(`Grade ${payload.name} saved successfully.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setIsGradeModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving grade');
    }
  };

  // Stream Modal Handlers
  const openAddStreamModal = (gradeId?: string) => {
    setEditingStream(null);
    const targetGId = gradeId || grades[0]?.id || '';
    setTargetGradeForStream(targetGId);
    const existingForGrade = streams.filter(s => s.gradeId === targetGId);
    const nextSuffix = String.fromCharCode(65 + existingForGrade.length); // A, B, C...
    const gObj = grades.find(g => g.id === targetGId);
    const gName = gObj ? gObj.name : 'Grade';

    setStreamName(nextSuffix);
    setStreamCode(`${gObj?.code || 'G'}${nextSuffix}`);
    setStreamClassTeacher('');
    setStreamRoom(`${gName} Room ${nextSuffix}`);
    setStreamCapacity('40');
    setIsStreamModalOpen(true);
  };

  const openEditStreamModal = (stream: GradeStream) => {
    setEditingStream(stream);
    setTargetGradeForStream(stream.gradeId);
    setStreamName(stream.name);
    setStreamCode(stream.code);
    setStreamClassTeacher(stream.classTeacherId || '');
    setStreamRoom(stream.room || '');
    setStreamCapacity(String(stream.capacity || 40));
    setIsStreamModalOpen(true);
  };

  const handleSaveStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetGradeForStream || !streamName.trim() || !streamCode.trim()) {
      setErrorMsg('Grade, stream name, and code are required.');
      return;
    }

    try {
      const payload = {
        gradeId: targetGradeForStream,
        name: streamName.trim(),
        code: streamCode.trim().toUpperCase(),
        classTeacherId: streamClassTeacher.trim() || undefined,
        room: streamRoom.trim() || undefined,
        capacity: Number(streamCapacity) || 40,
        isActive: true
      };

      const url = editingStream ? `/api/app/education/streams/${editingStream.id}` : '/api/app/education/streams';
      const method = editingStream ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save stream');

      setSuccessMsg(`Stream "${payload.name}" saved successfully.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setIsStreamModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving stream');
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      setIsDeleting(true);
      const url = deleteCandidate.type === 'GRADE'
        ? `/api/app/education/grades/${deleteCandidate.id}`
        : `/api/app/education/streams/${deleteCandidate.id}`;

      const res = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      setSuccessMsg(`${deleteCandidate.type === 'GRADE' ? 'Grade' : 'Stream'} deleted successfully.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setDeleteCandidate(null);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  // Student Promotion Handlers
  const availableSourceStudents = students.filter(s => {
    if (!sourceGradeId) return false;
    const matchGrade = s.gradeId === sourceGradeId || (!s.gradeId && !s.classId);
    const matchStream = !sourceStreamId || s.streamId === sourceStreamId;
    return matchGrade && matchStream && s.status === 'ACTIVE';
  });

  const handleSelectAllStudents = () => {
    if (selectedStudentIds.length === availableSourceStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(availableSourceStudents.map(s => s.id));
    }
  };

  const handleToggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const handleExecutePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0) {
      setErrorMsg('Please select at least one student to promote.');
      return;
    }
    if (!targetGradeId) {
      setErrorMsg('Please select a destination target Grade.');
      return;
    }

    try {
      setIsPromoting(true);
      setErrorMsg('');

      const payload = {
        studentIds: selectedStudentIds,
        fromGradeId: sourceGradeId,
        fromStreamId: sourceStreamId || undefined,
        toGradeId: targetGradeId,
        toStreamId: targetStreamId || undefined,
        academicYear: promotionAcademicYear,
        reason: promotionReason
      };

      const res = await fetch('/api/app/education/promotions', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to promote students');

      setPromotionSuccessDetails(data);
      setSuccessMsg(`Successfully promoted ${data.promotedCount} students!`);
      setSelectedStudentIds([]);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to execute student promotion');
    } finally {
      setIsPromoting(false);
    }
  };

  // Helper count methods
  const getGradeStudentCount = (gradeId: string) => {
    return students.filter(s => s.gradeId === gradeId && s.status === 'ACTIVE').length;
  };

  const getStreamStudentCount = (streamId: string) => {
    return students.filter(s => s.streamId === streamId && s.status === 'ACTIVE').length;
  };

  const filteredGrades = grades
    .filter(g => selectedGradeId === 'ALL' || g.id === selectedGradeId)
    .filter(g => !searchQuery || g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.code.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Grade & Stream Structure (Grades 1 – 9)</h2>
                <p className="text-xs text-slate-500">
                  School → Grade → Stream → Students hierarchy with automatic student promotion workflow
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {grades.length === 0 && (
              <button
                onClick={handleSeedDefaults}
                disabled={loading}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Initialize Grades 1–9</span>
              </button>
            )}

            <button
              onClick={openAddGradeModal}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Grade</span>
            </button>

            <button
              onClick={() => openAddStreamModal()}
              disabled={grades.length === 0}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stream</span>
            </button>

            <button
              onClick={() => setActiveTab('promotions')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Promote Students</span>
            </button>
          </div>
        </div>

        {/* Navigation Subtabs */}
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'hierarchy'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Grades & Streams Hierarchy ({grades.length} Grades, {streams.length} Streams)</span>
          </button>

          <button
            onClick={() => setActiveTab('promotions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'promotions'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Student Promotion Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Promotion Audit Logs ({promotionHistory.length})</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-rose-100 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="p-1 hover:bg-emerald-100 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: GRADES & STREAMS HIERARCHY */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-6">
          {/* Summary Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <span className="text-xs font-medium text-slate-500">Active Grades</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-slate-900">{grades.length}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">Grades 1–9</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Primary & Junior Secondary</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <span className="text-xs font-medium text-slate-500">Total Streams</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-slate-900">{streams.length}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                  Avg {(streams.length / (grades.length || 1)).toFixed(1)} / grade
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">e.g. 4A, 4B, 4C, 7 East</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <span className="text-xs font-medium text-slate-500">Total Enrolled Learners</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-slate-900">
                  {students.filter(s => s.gradeId && s.status === 'ACTIVE').length}
                </span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Active grade-assigned students</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <span className="text-xs font-medium text-slate-500">Curriculum Stages</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-slate-900">CBC 2-6-3-3</span>
                <Award className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Lower, Upper & Junior School</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search grade or stream name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="text-xs border-0 focus:ring-0 text-slate-800 placeholder-slate-400 w-full sm:w-64 outline-hidden"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500">Filter Grade:</span>
              <select
                value={selectedGradeId}
                onChange={e => setSelectedGradeId(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 outline-hidden font-medium"
              >
                <option value="ALL">All Grades (1–9)</option>
                {grades.map(g => (
                  <option key={g.id} value={g.id}>{g.name} ({g.code})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grades List & Streams Hierarchy Cards */}
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
              Loading Grade & Stream structure...
            </div>
          ) : filteredGrades.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-3">
              <Layers className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No Grades Configured</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You can initialize standard Grade 1 through Grade 9 with default streams in 1-click.
              </p>
              <button
                onClick={handleSeedDefaults}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Initialize Grades 1–9 Now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGrades.map(grade => {
                const gradeStreams = streams.filter(s => s.gradeId === grade.id);
                const gradeTotalLearners = getGradeStudentCount(grade.id);

                const stageBadge = () => {
                  if (grade.levelNumber <= 3) {
                    return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">Lower Primary (Gr 1-3)</span>;
                  }
                  if (grade.levelNumber <= 6) {
                    return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">Upper Primary (Gr 4-6)</span>;
                  }
                  return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700">Junior School (Gr 7-9)</span>;
                };

                return (
                  <div key={grade.id} className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
                    {/* Grade Header */}
                    <div className="p-4 bg-slate-50/75 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          {grade.code}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-bold text-slate-900">{grade.name}</h3>
                            {stageBadge()}
                            <span className="text-[11px] text-slate-500 font-mono">Level {grade.levelNumber}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {grade.room ? `Room: ${grade.room} • ` : ''}
                            Capacity: {grade.capacity || 80} learners • Total Enrolled: <strong className="text-slate-800">{gradeTotalLearners}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openAddStreamModal(grade.id)}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium flex items-center space-x-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-blue-600" />
                          <span>Add Stream</span>
                        </button>

                        <button
                          onClick={() => openEditGradeModal(grade)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="Edit Grade"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteCandidate({ type: 'GRADE', id: grade.id, name: grade.name })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Delete Grade"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Streams Sub-grid */}
                    <div className="p-4">
                      {gradeStreams.length === 0 ? (
                        <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center space-y-2">
                          <p className="text-xs text-slate-500">No streams configured for {grade.name} yet.</p>
                          <button
                            onClick={() => openAddStreamModal(grade.id)}
                            className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create Stream (e.g. Stream A)</span>
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {gradeStreams.map(stream => {
                            const streamLearners = getStreamStudentCount(stream.id);
                            return (
                              <div
                                key={stream.id}
                                className="border border-slate-200 bg-white p-3.5 rounded-xl hover:border-blue-300 transition-colors space-y-2"
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="flex items-center space-x-1.5">
                                      <span className="font-bold text-xs text-slate-900">
                                        {grade.name} {stream.name.startsWith('Stream') ? stream.name : `Stream ${stream.name}`}
                                      </span>
                                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                                        {stream.code}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                      {stream.room ? `Room: ${stream.room}` : 'Classroom assigned'}
                                    </p>
                                  </div>

                                  <div className="flex items-center space-x-1">
                                    <button
                                      onClick={() => openEditStreamModal(stream)}
                                      className="p-1 text-slate-400 hover:text-blue-600 rounded-md cursor-pointer"
                                      title="Edit Stream"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setDeleteCandidate({ type: 'STREAM', id: stream.id, name: `${grade.name} - ${stream.name}` })}
                                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                                      title="Delete Stream"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                                  <div className="flex items-center space-x-1 text-slate-600">
                                    <Users className="w-3.5 h-3.5 text-blue-600" />
                                    <span className="font-semibold text-slate-900">{streamLearners}</span>
                                    <span className="text-slate-400">/ {stream.capacity || 40} max</span>
                                  </div>

                                  <button
                                    onClick={() => setViewingStreamRoster({ stream, grade })}
                                    className="text-blue-600 hover:text-blue-700 font-medium text-[11px] flex items-center space-x-0.5 cursor-pointer"
                                  >
                                    <span>View Roster</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STUDENT PROMOTION ENGINE */}
      {activeTab === 'promotions' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>Grade-to-Grade Student Promotion & Transition Engine</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Select learners from a source Grade/Stream to advance them to the next Grade level (e.g. Grade 3 → Grade 4) or transition Grade 9 learners to Senior School.
              </p>
            </div>

            <form onSubmit={handleExecutePromotion} className="space-y-6">
              {/* Step 1 & 2 Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                {/* SOURCE */}
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">1</span>
                    <span>Source Grade & Stream</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Source Grade *</label>
                      <select
                        value={sourceGradeId}
                        onChange={e => {
                          setSourceGradeId(e.target.value);
                          setSourceStreamId('');
                          setSelectedStudentIds([]);
                        }}
                        className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-medium"
                      >
                        <option value="">-- Select Source Grade --</option>
                        {grades.map(g => (
                          <option key={g.id} value={g.id}>
                            {g.name} ({getGradeStudentCount(g.id)} active learners)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Source Stream (Optional)</label>
                      <select
                        value={sourceStreamId}
                        onChange={e => {
                          setSourceStreamId(e.target.value);
                          setSelectedStudentIds([]);
                        }}
                        className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-medium"
                        disabled={!sourceGradeId}
                      >
                        <option value="">All Streams in this Grade</option>
                        {streams.filter(s => s.gradeId === sourceGradeId).map(s => (
                          <option key={s.id} value={s.id}>
                            Stream {s.name} ({getStreamStudentCount(s.id)} learners)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* DESTINATION */}
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">2</span>
                    <span>Destination Target Grade</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Target Grade *</label>
                      <select
                        value={targetGradeId}
                        onChange={e => {
                          setTargetGradeId(e.target.value);
                          setTargetStreamId('');
                        }}
                        className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-medium"
                      >
                        <option value="">-- Select Destination Grade --</option>
                        {grades.map(g => (
                          <option key={g.id} value={g.id}>
                            {g.name} (Capacity: {g.capacity || 80})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Target Stream (Optional)</label>
                      <select
                        value={targetStreamId}
                        onChange={e => setTargetStreamId(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-medium"
                        disabled={!targetGradeId}
                      >
                        <option value="">Auto-Assign / Default Stream</option>
                        {streams.filter(s => s.gradeId === targetGradeId).map(s => (
                          <option key={s.id} value={s.id}>
                            Stream {s.name} ({getStreamStudentCount(s.id)} / {s.capacity || 40})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Promotion Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">New Academic Year *</label>
                  <input
                    type="text"
                    value={promotionAcademicYear}
                    onChange={e => setPromotionAcademicYear(e.target.value)}
                    placeholder="e.g. 2026/2027"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Promotion Reason / Notes</label>
                  <input
                    type="text"
                    value={promotionReason}
                    onChange={e => setPromotionReason(e.target.value)}
                    placeholder="e.g. Annual Academic Year Progression"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              {/* Step 3: Student Selection Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">3</span>
                    <span className="text-xs font-bold text-slate-900">Select Learners to Advance</span>
                    <span className="text-xs text-slate-500 font-medium">
                      ({selectedStudentIds.length} of {availableSourceStudents.length} selected)
                    </span>
                  </div>

                  {availableSourceStudents.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAllStudents}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                    >
                      {selectedStudentIds.length === availableSourceStudents.length ? (
                        <>
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>Deselect All</span>
                        </>
                      ) : (
                        <>
                          <Square className="w-3.5 h-3.5" />
                          <span>Select All ({availableSourceStudents.length})</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {!sourceGradeId ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                    Please select a source Grade above to load the learner roster.
                  </div>
                ) : availableSourceStudents.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                    No active students found enrolled in the selected Grade / Stream.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                        <tr>
                          <th className="p-3 w-10">
                            <input
                              type="checkbox"
                              checked={selectedStudentIds.length === availableSourceStudents.length && availableSourceStudents.length > 0}
                              onChange={handleSelectAllStudents}
                              className="rounded-sm border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                            />
                          </th>
                          <th className="p-3 font-semibold text-slate-700">Learner Name</th>
                          <th className="p-3 font-semibold text-slate-700">Assessment No / Adm</th>
                          <th className="p-3 font-semibold text-slate-700">Current Stream</th>
                          <th className="p-3 font-semibold text-slate-700">Fee Status</th>
                          <th className="p-3 font-semibold text-slate-700">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {availableSourceStudents.map(student => {
                          const isSelected = selectedStudentIds.includes(student.id);
                          const streamObj = streams.find(s => s.id === student.streamId);
                          return (
                            <tr
                              key={student.id}
                              onClick={() => handleToggleStudentSelection(student.id)}
                              className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                                isSelected ? 'bg-blue-50/50' : ''
                              }`}
                            >
                              <td className="p-3" onClick={e => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleStudentSelection(student.id)}
                                  className="rounded-sm border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                                />
                              </td>
                              <td className="p-3 font-medium text-slate-900">{student.fullName}</td>
                              <td className="p-3 font-mono text-slate-600">
                                {student.learnerAssessmentNo || student.admissionNo}
                              </td>
                              <td className="p-3 text-slate-600">
                                {streamObj ? `Stream ${streamObj.name}` : 'Unassigned'}
                              </td>
                              <td className="p-3">
                                {student.feeBalance <= 0 ? (
                                  <span className="text-emerald-600 font-medium">Cleared</span>
                                ) : (
                                  <span className="text-amber-600 font-mono">Bal: {student.feeBalance.toLocaleString()}</span>
                                )}
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                                  {student.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={isPromoting || selectedStudentIds.length === 0 || !targetGradeId}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-2 transition-colors cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>
                    {isPromoting
                      ? 'Executing Student Promotion...'
                      : `Advance & Promote Selected Learners (${selectedStudentIds.length})`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: PROMOTION AUDIT LOGS */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Historical Promotion Audit Trail</h3>
              <p className="text-xs text-slate-500">Record of all past student grade promotions and transitions</p>
            </div>
          </div>

          {promotionHistory.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
              No promotions have been recorded yet.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-semibold text-slate-700">Date</th>
                    <th className="p-3 font-semibold text-slate-700">Learner</th>
                    <th className="p-3 font-semibold text-slate-700">Previous Grade</th>
                    <th className="p-3 font-semibold text-slate-700">New Promoted Grade</th>
                    <th className="p-3 font-semibold text-slate-700">Academic Year</th>
                    <th className="p-3 font-semibold text-slate-700">Promoted By</th>
                    <th className="p-3 font-semibold text-slate-700">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {promotionHistory.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50/50">
                      <td className="p-3 text-slate-500 whitespace-nowrap">
                        {new Date(record.promotedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 font-medium text-slate-900">
                        {record.studentName || record.studentId}
                      </td>
                      <td className="p-3 text-slate-600">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium">
                          {record.fromGradeName || record.fromGradeId || 'N/A'}
                        </span>
                      </td>
                      <td className="p-3 text-emerald-700 font-semibold">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 font-medium flex items-center space-x-1 w-fit">
                          <ArrowRight className="w-3 h-3 text-emerald-600" />
                          <span>{record.toGradeName || record.toGradeId}</span>
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-600">{record.academicYear}</td>
                      <td className="p-3 text-slate-600">{record.promotedByName || 'Administrator'}</td>
                      <td className="p-3 text-slate-500 text-[11px]">{record.reason || 'Annual Progression'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* GRADE MODAL (ADD / EDIT) */}
      {isGradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingGrade ? `Edit ${editingGrade.name}` : 'Add New Grade'}
              </h3>
              <button onClick={() => setIsGradeModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-md">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Grade Name *</label>
                  <input
                    type="text"
                    value={gradeName}
                    onChange={e => setGradeName(e.target.value)}
                    placeholder="e.g. Grade 4"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Grade Code *</label>
                  <input
                    type="text"
                    value={gradeCode}
                    onChange={e => setGradeCode(e.target.value)}
                    placeholder="e.g. G4"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Level Number (1–9) *</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={gradeLevelNumber}
                    onChange={e => setGradeLevelNumber(Number(e.target.value))}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Stage *</label>
                  <select
                    value={gradeStage}
                    onChange={e => setGradeStage(e.target.value as any)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-medium"
                  >
                    <option value="LOWER_PRIMARY">Lower Primary (Gr 1-3)</option>
                    <option value="UPPER_PRIMARY">Upper Primary (Gr 4-6)</option>
                    <option value="JUNIOR_SCHOOL">Junior School (Gr 7-9)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Room / Block</label>
                  <input
                    type="text"
                    value={gradeRoom}
                    onChange={e => setGradeRoom(e.target.value)}
                    placeholder="e.g. Block B, Room 10"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Total Capacity</label>
                  <input
                    type="number"
                    value={gradeCapacity}
                    onChange={e => setGradeCapacity(e.target.value)}
                    placeholder="80"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  value={gradeDescription}
                  onChange={e => setGradeDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={2}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGradeModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {editingGrade ? 'Update Grade' : 'Create Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STREAM MODAL (ADD / EDIT) */}
      {isStreamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingStream ? `Edit Stream ${editingStream.name}` : 'Add New Stream to Grade'}
              </h3>
              <button onClick={() => setIsStreamModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-md">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveStream} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Parent Grade *</label>
                <select
                  value={targetGradeForStream}
                  onChange={e => setTargetGradeForStream(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-medium"
                  required
                >
                  <option value="">-- Select Grade --</option>
                  {grades.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Stream Name / Suffix *</label>
                  <input
                    type="text"
                    value={streamName}
                    onChange={e => {
                      setStreamName(e.target.value);
                      const g = grades.find(x => x.id === targetGradeForStream);
                      if (g) setStreamCode(`${g.code}${e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}`);
                    }}
                    placeholder="e.g. A, B, East, Blue"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Stream Code *</label>
                  <input
                    type="text"
                    value={streamCode}
                    onChange={e => setStreamCode(e.target.value)}
                    placeholder="e.g. G4A"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Assigned Classroom</label>
                  <input
                    type="text"
                    value={streamRoom}
                    onChange={e => setStreamRoom(e.target.value)}
                    placeholder="e.g. Room 4A"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Max Capacity</label>
                  <input
                    type="number"
                    value={streamCapacity}
                    onChange={e => setStreamCapacity(e.target.value)}
                    placeholder="40"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStreamModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {editingStream ? 'Update Stream' : 'Create Stream'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STREAM ROSTER DRAWER / MODAL */}
      {viewingStreamRoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {viewingStreamRoster.grade.name} - Stream {viewingStreamRoster.stream.name} Roster
                </h3>
                <p className="text-xs text-slate-500">
                  Room: {viewingStreamRoster.stream.room || 'N/A'} • Enrolled Learners:{' '}
                  {getStreamStudentCount(viewingStreamRoster.stream.id)}
                </p>
              </div>
              <button onClick={() => setViewingStreamRoster(null)} className="p-1 hover:bg-slate-100 rounded-md">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Student List */}
            {(() => {
              const streamLearners = students.filter(s => s.streamId === viewingStreamRoster.stream.id);
              if (streamLearners.length === 0) {
                return (
                  <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
                    No learners are currently assigned to this stream.
                  </div>
                );
              }
              return (
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-3 font-semibold text-slate-700">#</th>
                        <th className="p-3 font-semibold text-slate-700">Learner Name</th>
                        <th className="p-3 font-semibold text-slate-700">Assessment / Adm No</th>
                        <th className="p-3 font-semibold text-slate-700">Gender</th>
                        <th className="p-3 font-semibold text-slate-700">Guardian Contact</th>
                        <th className="p-3 font-semibold text-slate-700">Fee Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {streamLearners.map((st, idx) => (
                        <tr key={st.id} className="hover:bg-slate-50/50">
                          <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-3 font-semibold text-slate-900">{st.fullName}</td>
                          <td className="p-3 font-mono text-slate-600">{st.learnerAssessmentNo || st.admissionNo}</td>
                          <td className="p-3 text-slate-600">{st.gender}</td>
                          <td className="p-3 text-slate-600">
                            {st.guardianPhone ? (
                              <span className="font-mono">{st.guardianPhone}</span>
                            ) : (
                              <span className="text-slate-400">N/A</span>
                            )}
                          </td>
                          <td className="p-3">
                            {st.feeBalance <= 0 ? (
                              <span className="text-emerald-600 font-medium">Cleared</span>
                            ) : (
                              <span className="text-amber-600 font-mono">Bal: {st.feeBalance.toLocaleString()}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setViewingStreamRoster(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900">
                Delete {deleteCandidate.type === 'GRADE' ? 'Grade' : 'Stream'}?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <strong className="text-slate-800">{deleteCandidate.name}</strong>?
                This action cannot be undone if learners are currently assigned.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                disabled={isDeleting}
                className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
