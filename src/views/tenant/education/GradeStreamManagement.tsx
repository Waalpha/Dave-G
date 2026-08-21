import React, { useState, useEffect } from 'react';
import { SchoolGrade, GradeStream, Student, StudentPromotionRecord, LecturerStaff } from '../../../types';
import {
  Layers, Plus, Search, Edit, Trash2, CheckCircle2, AlertCircle,
  Users, User, Building, Clock, X, Check, Eye, ArrowRight,
  TrendingUp, RefreshCw, ShieldCheck, Award, BookOpen, ChevronRight,
  Sparkles, CheckSquare, Square, ArrowRightLeft, UserPlus, Phone, Mail,
  GraduationCap, Calendar, ChevronDown, Filter, FileText
} from 'lucide-react';

interface GradeStreamManagementProps {
  onOpenStudentProfile?: (studentId: string) => void;
  onOpenFeePayment?: (studentId: string) => void;
}

// Ordered standard academic levels
export const STANDARD_ACADEMIC_LEVELS = [
  { name: 'Playgroup', code: 'PG', levelNumber: 0, category: 'EARLY_YEARS', label: 'Playgroup (Age 3-4)' },
  { name: 'PP1', code: 'PP1', levelNumber: 0, category: 'EARLY_YEARS', label: 'Pre-Primary 1 (PP1)' },
  { name: 'PP2', code: 'PP2', levelNumber: 0, category: 'EARLY_YEARS', label: 'Pre-Primary 2 (PP2)' },
  { name: 'Grade 1', code: 'G1', levelNumber: 1, category: 'LOWER_PRIMARY', label: 'Grade 1' },
  { name: 'Grade 2', code: 'G2', levelNumber: 2, category: 'LOWER_PRIMARY', label: 'Grade 2' },
  { name: 'Grade 3', code: 'G3', levelNumber: 3, category: 'LOWER_PRIMARY', label: 'Grade 3' },
  { name: 'Grade 4', code: 'G4', levelNumber: 4, category: 'UPPER_PRIMARY', label: 'Grade 4' },
  { name: 'Grade 5', code: 'G5', levelNumber: 5, category: 'UPPER_PRIMARY', label: 'Grade 5' },
  { name: 'Grade 6', code: 'G6', levelNumber: 6, category: 'UPPER_PRIMARY', label: 'Grade 6' },
  { name: 'Grade 7', code: 'G7', levelNumber: 7, category: 'JUNIOR_SCHOOL', label: 'Grade 7 (JSS 1)' },
  { name: 'Grade 8', code: 'G8', levelNumber: 8, category: 'JUNIOR_SCHOOL', label: 'Grade 8 (JSS 2)' },
  { name: 'Grade 9', code: 'G9', levelNumber: 9, category: 'JUNIOR_SCHOOL', label: 'Grade 9 (JSS 3)' }
];

export const GradeStreamManagement: React.FC<GradeStreamManagementProps> = ({
  onOpenStudentProfile,
  onOpenFeePayment
}) => {
  const [grades, setGrades] = useState<SchoolGrade[]>([]);
  const [streams, setStreams] = useState<GradeStream[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<LecturerStaff[]>([]);
  const [promotionHistory, setPromotionHistory] = useState<StudentPromotionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'promotions' | 'transfers' | 'history'>('hierarchy');

  // Selected Stage / Grade filter
  const [selectedStageFilter, setSelectedStageFilter] = useState<'ALL' | 'EARLY_YEARS' | 'LOWER_PRIMARY' | 'UPPER_PRIMARY' | 'JUNIOR_SCHOOL'>('ALL');
  const [selectedGradeId, setSelectedGradeId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Grade Modals
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<SchoolGrade | null>(null);

  // Stream Modals
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<GradeStream | null>(null);
  const [targetGradeForStream, setTargetGradeForStream] = useState<string>('');

  // Student Modals (Add, Edit, Delete, Transfer)
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [preselectedGradeId, setPreselectedGradeId] = useState<string>('');
  const [preselectedStreamId, setPreselectedStreamId] = useState<string>('');

  const [transferCandidate, setTransferCandidate] = useState<Student | null>(null);
  const [transferTargetGradeId, setTransferTargetGradeId] = useState<string>('');
  const [transferTargetStreamId, setTransferTargetStreamId] = useState<string>('');
  const [transferReason, setTransferReason] = useState<string>('Stream / Level Re-allocation');
  const [isTransferring, setIsTransferring] = useState(false);

  // Delete Candidate
  const [deleteCandidate, setDeleteCandidate] = useState<{
    type: 'GRADE' | 'STREAM' | 'STUDENT';
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Roster Viewer Modal
  const [viewingStreamRoster, setViewingStreamRoster] = useState<{ stream: GradeStream; grade: SchoolGrade } | null>(null);

  // Grade Form State
  const [gradeName, setGradeName] = useState('');
  const [gradeCode, setGradeCode] = useState('');
  const [gradeLevelNumber, setGradeLevelNumber] = useState<number>(1);
  const [gradeCategory, setGradeCategory] = useState<'EARLY_YEARS' | 'LOWER_PRIMARY' | 'UPPER_PRIMARY' | 'JUNIOR_SCHOOL'>('LOWER_PRIMARY');
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

  // Student Form State
  const [studFullName, setStudFullName] = useState('');
  const [studAdmissionNo, setStudAdmissionNo] = useState('');
  const [studAssessmentNo, setStudAssessmentNo] = useState('');
  const [studGender, setStudGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [studDob, setStudDob] = useState('2017-01-01');
  const [studGradeId, setStudGradeId] = useState('');
  const [studStreamId, setStudStreamId] = useState('');
  const [studGuardianName, setStudGuardianName] = useState('');
  const [studGuardianPhone, setStudGuardianPhone] = useState('');
  const [studGuardianEmail, setStudGuardianEmail] = useState('');
  const [studGuardianRelation, setStudGuardianRelation] = useState('Parent');
  const [studFeeBalance, setStudFeeBalance] = useState('0');
  const [studStatus, setStudStatus] = useState<Student['status']>('ACTIVE');
  const [isSavingStudent, setIsSavingStudent] = useState(false);

  // Promotion Form State
  const [sourceGradeId, setSourceGradeId] = useState<string>('');
  const [sourceStreamId, setSourceStreamId] = useState<string>('');
  const [targetGradeId, setTargetGradeId] = useState<string>('');
  const [targetStreamId, setTargetStreamId] = useState<string>('');
  const [promotionAcademicYear, setPromotionAcademicYear] = useState<string>('2026/2027');
  const [promotionReason, setPromotionReason] = useState<string>('End of Academic Year Progression');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isPromoting, setIsPromoting] = useState(false);

  const getHeaders = () => ({
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [resGrades, resStreams, resStudents, resPromos, resFac] = await Promise.all([
        fetch('/api/app/education/grades', { headers: getHeaders() }),
        fetch('/api/app/education/streams', { headers: getHeaders() }),
        fetch('/api/app/education/students', { headers: getHeaders() }),
        fetch('/api/app/education/promotions/history', { headers: getHeaders() }),
        fetch('/api/app/education/faculty', { headers: getHeaders() })
      ]);

      if (resGrades.ok) {
        const g = await resGrades.json();
        setGrades(Array.isArray(g) ? g.sort((a: SchoolGrade, b: SchoolGrade) => (a.orderIndex || 0) - (b.orderIndex || 0)) : []);
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
      if (resFac.ok) {
        const f = await resFac.json();
        setFaculty(Array.isArray(f) ? f : []);
      }
    } catch (err: any) {
      console.error('Error fetching grades/streams data:', err);
      setErrorMsg('Failed to load academic grades and streams data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // When source grade changes in promotion engine, auto-match the logical next target grade!
  useEffect(() => {
    if (!sourceGradeId) return;
    const currentGrade = grades.find(g => g.id === sourceGradeId);
    if (!currentGrade) return;

    // Standard sequence progression:
    // Playgroup -> PP1 -> PP2 -> Grade 1 -> Grade 2 -> Grade 3 -> Grade 4 -> Grade 5 -> Grade 6 -> Grade 7 -> Grade 8 -> Grade 9
    const sortedGrades = [...grades].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    const currentIndex = sortedGrades.findIndex(g => g.id === sourceGradeId);
    if (currentIndex >= 0 && currentIndex < sortedGrades.length - 1) {
      const nextGrade = sortedGrades[currentIndex + 1];
      setTargetGradeId(nextGrade.id);
    }
  }, [sourceGradeId, grades]);

  // Seed default Playgroup to Grade 9 structure
  const handleSeedDefaults = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch('/api/app/education/grades/seed-defaults', {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize academic levels');
      setSuccessMsg(`Successfully verified and initialized complete academic structure (Playgroup → PP1 → PP2 → Grade 1 through Grade 9) with multi-streams!`);
      setTimeout(() => setSuccessMsg(''), 5000);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to seed default levels');
    } finally {
      setLoading(false);
    }
  };

  // Grade Modal Handlers
  const openAddGradeModal = () => {
    setEditingGrade(null);
    setGradeName('Grade 1');
    setGradeCode('G1');
    setGradeLevelNumber(1);
    setGradeCategory('LOWER_PRIMARY');
    setGradeClassTeacher('');
    setGradeRoom('Block A, Room 1');
    setGradeCapacity('80');
    setGradeDescription('Basic education curriculum level');
    setIsGradeModalOpen(true);
  };

  const openEditGradeModal = (grade: SchoolGrade) => {
    setEditingGrade(grade);
    setGradeName(grade.name);
    setGradeCode(grade.code);
    setGradeLevelNumber(grade.levelNumber);
    setGradeCategory((grade.category as any) || (grade.stage as any) || 'LOWER_PRIMARY');
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
        category: gradeCategory,
        stage: gradeCategory,
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

      setSuccessMsg(`Academic Level "${payload.name}" saved successfully.`);
      setTimeout(() => setSuccessMsg(''), 3500);
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
    const gName = gObj ? gObj.name : 'Level';

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
      setErrorMsg('Grade level, stream name, and stream code are required.');
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
      setTimeout(() => setSuccessMsg(''), 3500);
      setIsStreamModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving stream');
    }
  };

  // Student Add / Edit Handlers
  const openAddStudentModal = (gradeId?: string, streamId?: string) => {
    setEditingStudent(null);
    const chosenGradeId = gradeId || grades[0]?.id || '';
    const availableStreams = streams.filter(s => s.gradeId === chosenGradeId);
    const chosenStreamId = streamId || availableStreams[0]?.id || '';

    setPreselectedGradeId(chosenGradeId);
    setPreselectedStreamId(chosenStreamId);
    setStudFullName('');
    const randAdm = Math.floor(1000 + Math.random() * 9000);
    setStudAdmissionNo(`ADM/${new Date().getFullYear()}/${randAdm}`);
    setStudAssessmentNo('');
    setStudGender('MALE');
    setStudDob('2017-01-01');
    setStudGradeId(chosenGradeId);
    setStudStreamId(chosenStreamId);
    setStudGuardianName('');
    setStudGuardianPhone('');
    setStudGuardianEmail('');
    setStudGuardianRelation('Parent');
    setStudFeeBalance('0');
    setStudStatus('ACTIVE');
    setIsStudentModalOpen(true);
  };

  const openEditStudentModal = (student: Student) => {
    setEditingStudent(student);
    setStudFullName(student.fullName || '');
    setStudAdmissionNo(student.admissionNo || '');
    setStudAssessmentNo(student.learnerAssessmentNo || student.assessmentNumber || '');
    setStudGender((student.gender?.toUpperCase() as any) || 'MALE');
    setStudDob(student.dateOfBirth ? student.dateOfBirth.slice(0, 10) : '2017-01-01');
    setStudGradeId(student.gradeId || '');
    setStudStreamId(student.streamId || '');
    setStudGuardianName(student.guardianName || '');
    setStudGuardianPhone(student.guardianPhone || '');
    setStudGuardianEmail(student.guardianEmail || '');
    setStudGuardianRelation(student.guardianRelation || 'Parent');
    setStudFeeBalance(String(student.feeBalance || 0));
    setStudStatus(student.status || 'ACTIVE');
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studFullName.trim()) {
      setErrorMsg('Learner Full Name is required.');
      return;
    }

    try {
      setIsSavingStudent(true);
      setErrorMsg('');

      const grd = grades.find(g => g.id === studGradeId);
      const strm = streams.find(s => s.id === studStreamId);

      const payload = {
        fullName: studFullName.trim(),
        admissionNo: studAdmissionNo.trim() || undefined,
        learnerAssessmentNo: studAssessmentNo.trim() || undefined,
        assessmentNumber: studAssessmentNo.trim() || undefined,
        gender: studGender,
        dateOfBirth: studDob,
        gradeId: studGradeId || undefined,
        gradeName: grd?.name || undefined,
        streamId: studStreamId || undefined,
        streamName: strm?.fullName || (strm ? `${grd?.name || ''} Stream ${strm.name}` : undefined),
        guardianName: studGuardianName.trim() || undefined,
        guardianPhone: studGuardianPhone.trim() || undefined,
        guardianEmail: studGuardianEmail.trim() || undefined,
        guardianRelation: studGuardianRelation || 'Parent',
        feeBalance: Number(studFeeBalance) || 0,
        status: studStatus
      };

      const url = editingStudent ? `/api/app/education/students/${editingStudent.id}` : '/api/app/education/students';
      const method = editingStudent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save student record');

      setSuccessMsg(`Learner "${payload.fullName}" ${editingStudent ? 'updated' : 'admitted'} successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsStudentModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving student');
    } finally {
      setIsSavingStudent(false);
    }
  };

  // Student Transfer Modal Handlers
  const openTransferModal = (student: Student) => {
    setTransferCandidate(student);
    setTransferTargetGradeId(student.gradeId || grades[0]?.id || '');
    setTransferTargetStreamId(student.streamId || '');
    setTransferReason(`Transfer to stream / level requested`);
  };

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferCandidate) return;

    try {
      setIsTransferring(true);
      setErrorMsg('');

      const res = await fetch(`/api/app/education/students/${transferCandidate.id}/transfer`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          toGradeId: transferTargetGradeId || undefined,
          toStreamId: transferTargetStreamId || undefined,
          reason: transferReason
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to execute student transfer');

      setSuccessMsg(`Learner "${transferCandidate.fullName}" transferred successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setTransferCandidate(null);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to transfer learner');
    } finally {
      setIsTransferring(false);
    }
  };

  // Delete Action Handler (Grades, Streams, Students)
  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      setIsDeleting(true);
      let url = '';
      if (deleteCandidate.type === 'GRADE') url = `/api/app/education/grades/${deleteCandidate.id}`;
      else if (deleteCandidate.type === 'STREAM') url = `/api/app/education/streams/${deleteCandidate.id}`;
      else if (deleteCandidate.type === 'STUDENT') url = `/api/app/education/students/${deleteCandidate.id}`;

      const res = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete record');

      setSuccessMsg(`${deleteCandidate.type} "${deleteCandidate.name}" deleted successfully.`);
      setTimeout(() => setSuccessMsg(''), 3500);
      setDeleteCandidate(null);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete record');
    } finally {
      setIsDeleting(false);
    }
  };

  // Student Promotion Handlers
  const availableSourceStudents = students.filter(s => {
    if (!sourceGradeId) return false;
    const matchGrade = s.gradeId === sourceGradeId;
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
      setErrorMsg('Please select at least one learner to promote.');
      return;
    }
    if (!targetGradeId) {
      setErrorMsg('Please select a destination target level.');
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

      setSuccessMsg(`Successfully promoted ${data.promotedCount} learners to the next academic level!`);
      setTimeout(() => setSuccessMsg(''), 5000);
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
    .filter(g => {
      if (selectedStageFilter === 'ALL') return true;
      const cat = g.category || g.stage;
      return cat === selectedStageFilter;
    })
    .filter(g => selectedGradeId === 'ALL' || g.id === selectedGradeId)
    .filter(g => !searchQuery || g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.code.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Academic Structure & Multi-Stream Management</h2>
                <p className="text-xs text-slate-500">
                  Playgroup → PP1 → PP2 → Grade 1 through Grade 9 with multi-stream class allocation, student transfers & promotions
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSeedDefaults}
              disabled={loading}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Verify or seed standard Playgroup to Grade 9 hierarchy"
            >
              <Sparkles className="w-4 h-4" />
              <span>Verify Standard Levels (PG - Gr 9)</span>
            </button>

            <button
              onClick={() => openAddStudentModal()}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Admit Learner</span>
            </button>

            <button
              onClick={openAddGradeModal}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Level</span>
            </button>

            <button
              onClick={() => openAddStreamModal()}
              disabled={grades.length === 0}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stream</span>
            </button>
          </div>
        </div>

        {/* Academic Hierarchy Visual Stepper Strip */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>Academic Progression Flow (Playgroup to Grade 9)</span>
            </span>
            <span className="text-[11px] text-slate-500">
              {students.filter(s => s.gradeId && s.status === 'ACTIVE').length} Total Active Learners Across All Levels
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            {STANDARD_ACADEMIC_LEVELS.map((std, idx) => {
              const matchedGrade = grades.find(g => g.name.toLowerCase() === std.name.toLowerCase() || g.code.toLowerCase() === std.code.toLowerCase());
              const count = matchedGrade ? getGradeStudentCount(matchedGrade.id) : 0;
              const isSelected = matchedGrade && selectedGradeId === matchedGrade.id;

              return (
                <React.Fragment key={std.name}>
                  <button
                    onClick={() => {
                      if (matchedGrade) {
                        setSelectedGradeId(selectedGradeId === matchedGrade.id ? 'ALL' : matchedGrade.id);
                        setActiveTab('hierarchy');
                      }
                    }}
                    className={`shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : matchedGrade
                        ? 'bg-slate-50 hover:bg-blue-50 text-slate-800 border-slate-200 hover:border-blue-300'
                        : 'bg-slate-50/50 text-slate-400 border-dashed border-slate-200'
                    }`}
                  >
                    <span className="font-bold">{std.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {count}
                    </span>
                  </button>

                  {idx < STANDARD_ACADEMIC_LEVELS.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Navigation Subtabs */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'hierarchy'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Levels & Streams ({grades.length} Levels, {streams.length} Streams)</span>
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
            <span>Promotion Engine</span>
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
            <span>Audit & Transfer Logs ({promotionHistory.length})</span>
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

      {/* TAB 1: LEVELS & STREAMS HIERARCHY */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-6">
          {/* Summary Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <span className="text-xs font-medium text-slate-500">Active Academic Levels</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-slate-900">{grades.length}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">PG to Grade 9</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Early Years, Primary & JSS</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <span className="text-xs font-medium text-slate-500">Total Stream Classes</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-slate-900">{streams.length}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                  Avg {(streams.length / (grades.length || 1)).toFixed(1)} / level
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">e.g. Grade 1A, Grade 1B, 4 East</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <span className="text-xs font-medium text-slate-500">Enrolled Learners</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold text-slate-900">
                  {students.filter(s => s.gradeId && s.status === 'ACTIVE').length}
                </span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Active grade & stream learners</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <span className="text-xs font-medium text-slate-500">Curriculum Structure</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-slate-900">CBC Complete</span>
                <Award className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Playgroup to Junior Secondary</p>
            </div>
          </div>

          {/* Filter & Stage Selector Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search level or stream name (e.g. PP1, Grade 4, East)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="text-xs border-0 focus:ring-0 text-slate-800 placeholder-slate-400 w-full md:w-64 outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs">
                <button
                  onClick={() => setSelectedStageFilter('ALL')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    selectedStageFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Stages
                </button>
                <button
                  onClick={() => setSelectedStageFilter('EARLY_YEARS')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    selectedStageFilter === 'EARLY_YEARS' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Early Years (PG, PP1, PP2)
                </button>
                <button
                  onClick={() => setSelectedStageFilter('LOWER_PRIMARY')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    selectedStageFilter === 'LOWER_PRIMARY' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Lower Primary (Gr 1-3)
                </button>
                <button
                  onClick={() => setSelectedStageFilter('UPPER_PRIMARY')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    selectedStageFilter === 'UPPER_PRIMARY' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upper Primary (Gr 4-6)
                </button>
                <button
                  onClick={() => setSelectedStageFilter('JUNIOR_SCHOOL')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    selectedStageFilter === 'JUNIOR_SCHOOL' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Junior School (Gr 7-9)
                </button>
              </div>

              {selectedGradeId !== 'ALL' && (
                <button
                  onClick={() => setSelectedGradeId('ALL')}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 bg-blue-50 rounded-lg cursor-pointer flex items-center space-x-1"
                >
                  <span>Reset Level Filter</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Grades List & Streams Hierarchy Cards */}
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
              Loading Academic Levels & Streams...
            </div>
          ) : filteredGrades.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-3">
              <Layers className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No Academic Levels Matching Filter</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You can initialize standard Playgroup through Grade 9 with default streams in 1-click.
              </p>
              <button
                onClick={handleSeedDefaults}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Initialize Playgroup to Grade 9 Now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGrades.map(grade => {
                const gradeStreams = streams.filter(s => s.gradeId === grade.id);
                const gradeTotalLearners = getGradeStudentCount(grade.id);
                const stageCat = grade.category || grade.stage;

                const stageBadge = () => {
                  if (stageCat === 'EARLY_YEARS' || grade.levelNumber === 0) {
                    return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">Early Years Foundation</span>;
                  }
                  if (stageCat === 'LOWER_PRIMARY' || grade.levelNumber <= 3) {
                    return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">Lower Primary (Gr 1-3)</span>;
                  }
                  if (stageCat === 'UPPER_PRIMARY' || grade.levelNumber <= 6) {
                    return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">Upper Primary (Gr 4-6)</span>;
                  }
                  return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700">Junior Secondary (Gr 7-9)</span>;
                };

                return (
                  <div key={grade.id} className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
                    {/* Grade Level Header */}
                    <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          {grade.code}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-bold text-slate-900">{grade.name}</h3>
                            {stageBadge()}
                            <span className="text-[11px] text-slate-500 font-mono">
                              {grade.levelNumber > 0 ? `Level ${grade.levelNumber}` : 'Early Years'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {grade.room ? `Block/Room: ${grade.room} • ` : ''}
                            Max Capacity: {grade.capacity || 80} • Enrolled Learners: <strong className="text-slate-900">{gradeTotalLearners}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openAddStudentModal(grade.id)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Admit to {grade.name}</span>
                        </button>

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
                          title="Edit Level Settings"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteCandidate({ type: 'GRADE', id: grade.id, name: grade.name })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Delete Level"
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
                                className="border border-slate-200 bg-white p-3.5 rounded-xl hover:border-blue-300 transition-all space-y-3"
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
                                      {stream.room ? `Room: ${stream.room}` : 'Assigned Classroom'}
                                    </p>
                                  </div>

                                  <div className="flex items-center space-x-1">
                                    <button
                                      onClick={() => openAddStudentModal(grade.id, stream.id)}
                                      className="p-1 text-slate-400 hover:text-emerald-600 rounded-md cursor-pointer"
                                      title="Admit Student to this Stream"
                                    >
                                      <UserPlus className="w-3.5 h-3.5" />
                                    </button>
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
                                  <div className="flex items-center space-x-1.5 text-slate-600">
                                    <Users className="w-3.5 h-3.5 text-blue-600" />
                                    <span className="font-bold text-slate-900">{streamLearners}</span>
                                    <span className="text-slate-400">/ {stream.capacity || 40} max</span>
                                  </div>

                                  <button
                                    onClick={() => setViewingStreamRoster({ stream, grade })}
                                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md font-semibold text-[11px] flex items-center space-x-1 cursor-pointer transition-colors"
                                  >
                                    <span>Class Roster</span>
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
                <span>Academic Grade-to-Grade Promotion & Transition Engine</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Advance learners along the continuous CBC academic progression: Playgroup → PP1 → PP2 → Grade 1 → Grade 2 → ... → Grade 9.
              </p>
            </div>

            <form onSubmit={handleExecutePromotion} className="space-y-6">
              {/* Step 1 & 2 Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                {/* SOURCE */}
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">1</span>
                    <span>Source Level & Stream</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Source Level *</label>
                      <select
                        value={sourceGradeId}
                        onChange={e => {
                          setSourceGradeId(e.target.value);
                          setSourceStreamId('');
                          setSelectedStudentIds([]);
                        }}
                        className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-medium"
                      >
                        <option value="">-- Select Source Academic Level --</option>
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
                        <option value="">All Streams in this Level</option>
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
                    <span>Destination Target Level</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Target Next Level *</label>
                      <select
                        value={targetGradeId}
                        onChange={e => {
                          setTargetGradeId(e.target.value);
                          setTargetStreamId('');
                        }}
                        className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-medium"
                      >
                        <option value="">-- Select Destination Level --</option>
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
                        <option value="">Auto-Assign / Keep Suffix Stream</option>
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
                    Please select a source Level above to load the learner roster.
                  </div>
                ) : availableSourceStudents.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                    No active students found enrolled in the selected Level / Stream.
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
                          <th className="p-3 font-semibold text-slate-700">Assessment / Adm No</th>
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
                      ? 'Executing Promotion...'
                      : `Advance Selected Learners (${selectedStudentIds.length})`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: PROMOTION & TRANSFER AUDIT LOGS */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Historical Promotion & Transfer Audit Trail</h3>
              <p className="text-xs text-slate-500">Record of all past student grade promotions, level transfers, and stream changes</p>
            </div>
          </div>

          {promotionHistory.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
              No promotions or transfers recorded yet.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-semibold text-slate-700">Date</th>
                    <th className="p-3 font-semibold text-slate-700">Type</th>
                    <th className="p-3 font-semibold text-slate-700">Learner</th>
                    <th className="p-3 font-semibold text-slate-700">Previous Level / Stream</th>
                    <th className="p-3 font-semibold text-slate-700">New Level / Stream</th>
                    <th className="p-3 font-semibold text-slate-700">Academic Year</th>
                    <th className="p-3 font-semibold text-slate-700">Authorized By</th>
                    <th className="p-3 font-semibold text-slate-700">Reason / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {promotionHistory.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50/50">
                      <td className="p-3 text-slate-500 whitespace-nowrap">
                        {new Date(record.promotedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          record.promotionType === 'TRANSFERRED'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {record.promotionType || 'PROMOTED'}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-900">
                        {record.studentName || record.studentId}
                      </td>
                      <td className="p-3 text-slate-600">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium">
                          {record.fromGradeName || record.fromGradeId || 'None'} {record.fromStreamName ? `(${record.fromStreamName})` : ''}
                        </span>
                      </td>
                      <td className="p-3 text-emerald-700 font-semibold">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 font-medium flex items-center space-x-1 w-fit">
                          <ArrowRight className="w-3 h-3 text-emerald-600" />
                          <span>{record.toGradeName || record.toGradeId} {record.toStreamName ? `(${record.toStreamName})` : ''}</span>
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-600">{record.academicYear || record.toAcademicYear || '-'}</td>
                      <td className="p-3 text-slate-600">{record.promotedBy || record.promotedByName || 'Administrator'}</td>
                      <td className="p-3 text-slate-500 text-[11px]">{record.notes || record.reason || 'Progression'}</td>
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
                {editingGrade ? `Edit Level: ${editingGrade.name}` : 'Add Academic Level'}
              </h3>
              <button onClick={() => setIsGradeModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-md cursor-pointer">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Level Name *</label>
                  <input
                    type="text"
                    value={gradeName}
                    onChange={e => setGradeName(e.target.value)}
                    placeholder="e.g. Playgroup, Grade 1"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    value={gradeCode}
                    onChange={e => setGradeCode(e.target.value)}
                    placeholder="e.g. PG, PP1, G1"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Level Number (0-9) *</label>
                  <input
                    type="number"
                    min={0}
                    max={12}
                    value={gradeLevelNumber}
                    onChange={e => setGradeLevelNumber(Number(e.target.value))}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category / Stage *</label>
                  <select
                    value={gradeCategory}
                    onChange={e => setGradeCategory(e.target.value as any)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-medium"
                  >
                    <option value="EARLY_YEARS">Early Years (Playgroup, PP1, PP2)</option>
                    <option value="LOWER_PRIMARY">Lower Primary (Grade 1-3)</option>
                    <option value="UPPER_PRIMARY">Upper Primary (Grade 4-6)</option>
                    <option value="JUNIOR_SCHOOL">Junior Secondary (Grade 7-9)</option>
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
                    placeholder="e.g. Block A, Room 1"
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
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={gradeDescription}
                  onChange={e => setGradeDescription(e.target.value)}
                  placeholder="Optional description / learning areas"
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
                  {editingGrade ? 'Update Level' : 'Create Level'}
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
                {editingStream ? `Edit Stream: ${editingStream.name}` : 'Add Stream Class'}
              </h3>
              <button onClick={() => setIsStreamModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-md cursor-pointer">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveStream} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Parent Level *</label>
                <select
                  value={targetGradeForStream}
                  onChange={e => setTargetGradeForStream(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-medium"
                  required
                >
                  <option value="">-- Select Academic Level --</option>
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
                    placeholder="e.g. A, B, East, Blue, Red"
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
                    placeholder="e.g. G1A, PP1-B"
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
                    placeholder="e.g. Room 1A"
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

      {/* STUDENT ADMIT / EDIT MODAL */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingStudent ? `Edit Learner: ${editingStudent.fullName}` : 'Admit New Learner'}
              </h3>
              <button onClick={() => setIsStudentModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-md cursor-pointer">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={studFullName}
                  onChange={e => setStudFullName(e.target.value)}
                  placeholder="e.g. Brian Kiprop"
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Admission Number *</label>
                  <input
                    type="text"
                    value={studAdmissionNo}
                    onChange={e => setStudAdmissionNo(e.target.value)}
                    placeholder="ADM/2026/001"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Assessment No (UPI/NEMIS)</label>
                  <input
                    type="text"
                    value={studAssessmentNo}
                    onChange={e => setStudAssessmentNo(e.target.value)}
                    placeholder="e.g. 102938475"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Gender</label>
                  <select
                    value={studGender}
                    onChange={e => setStudGender(e.target.value as any)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-medium"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={studDob}
                    onChange={e => setStudDob(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Academic Level *</label>
                  <select
                    value={studGradeId}
                    onChange={e => {
                      setStudGradeId(e.target.value);
                      const strms = streams.filter(s => s.gradeId === e.target.value);
                      setStudStreamId(strms[0]?.id || '');
                    }}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-medium"
                    required
                  >
                    <option value="">-- Select Level --</option>
                    {grades.map(g => (
                      <option key={g.id} value={g.id}>{g.name} ({g.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Stream Class</label>
                  <select
                    value={studStreamId}
                    onChange={e => setStudStreamId(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-medium"
                  >
                    <option value="">-- Unassigned Stream --</option>
                    {streams.filter(s => s.gradeId === studGradeId).map(s => (
                      <option key={s.id} value={s.id}>Stream {s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Parent / Guardian Name</label>
                  <input
                    type="text"
                    value={studGuardianName}
                    onChange={e => setStudGuardianName(e.target.value)}
                    placeholder="e.g. Mary Wanjiku"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Guardian Phone</label>
                  <input
                    type="text"
                    value={studGuardianPhone}
                    onChange={e => setStudGuardianPhone(e.target.value)}
                    placeholder="e.g. +254 712 345 678"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={studStatus}
                    onChange={e => setStudStatus(e.target.value as any)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-medium"
                  >
                    <option value="ACTIVE">Active (Enrolled)</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="GRADUATED">Graduated / Transitioned</option>
                    <option value="TRANSFERRED">Transferred Out</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Fee Balance</label>
                  <input
                    type="number"
                    value={studFeeBalance}
                    onChange={e => setStudFeeBalance(e.target.value)}
                    placeholder="0"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingStudent}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {isSavingStudent ? 'Saving...' : editingStudent ? 'Update Learner' : 'Complete Admission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT TRANSFER MODAL */}
      {transferCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ArrowRightLeft className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Transfer Learner Between Levels / Streams</h3>
              </div>
              <button onClick={() => setTransferCandidate(null)} className="p-1 hover:bg-slate-100 rounded-md cursor-pointer">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-4">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-1">
                <p className="font-bold text-purple-900">{transferCandidate.fullName}</p>
                <p className="text-purple-700">
                  Adm: {transferCandidate.admissionNo} • Current: <strong>{transferCandidate.gradeName || 'None'}</strong> {transferCandidate.streamName ? `(${transferCandidate.streamName})` : ''}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Academic Level *</label>
                <select
                  value={transferTargetGradeId}
                  onChange={e => {
                    setTransferTargetGradeId(e.target.value);
                    const strms = streams.filter(s => s.gradeId === e.target.value);
                    setTransferTargetStreamId(strms[0]?.id || '');
                  }}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-medium"
                  required
                >
                  <option value="">-- Select Destination Level --</option>
                  {grades.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Stream Class</label>
                <select
                  value={transferTargetStreamId}
                  onChange={e => setTransferTargetStreamId(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden font-medium"
                >
                  <option value="">-- Unassigned Stream --</option>
                  {streams.filter(s => s.gradeId === transferTargetGradeId).map(s => (
                    <option key={s.id} value={s.id}>
                      Stream {s.name} ({getStreamStudentCount(s.id)} / {s.capacity || 40} learners)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Transfer Reason / Authorization</label>
                <input
                  type="text"
                  value={transferReason}
                  onChange={e => setTransferReason(e.target.value)}
                  placeholder="e.g. Stream balancing or parent request"
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 outline-hidden"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTransferCandidate(null)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTransferring}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {isTransferring ? 'Transferring...' : 'Execute Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STREAM ROSTER DRAWER / MODAL */}
      {viewingStreamRoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {viewingStreamRoster.grade.name} - Stream {viewingStreamRoster.stream.name} Class Roster
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono font-bold">
                    {viewingStreamRoster.stream.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Room: {viewingStreamRoster.stream.room || 'N/A'} • Enrolled Learners:{' '}
                  <strong className="text-slate-900">{getStreamStudentCount(viewingStreamRoster.stream.id)}</strong> / {viewingStreamRoster.stream.capacity || 40} max
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openAddStudentModal(viewingStreamRoster.grade.id, viewingStreamRoster.stream.id)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Admit Learner</span>
                </button>

                <button onClick={() => setViewingStreamRoster(null)} className="p-1 hover:bg-slate-100 rounded-md cursor-pointer">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Student List */}
            {(() => {
              const streamLearners = students.filter(s => s.streamId === viewingStreamRoster.stream.id);
              if (streamLearners.length === 0) {
                return (
                  <div className="p-10 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl space-y-3">
                    <Users className="w-8 h-8 text-slate-300 mx-auto" />
                    <p>No learners are currently assigned to this stream class.</p>
                    <button
                      onClick={() => openAddStudentModal(viewingStreamRoster.grade.id, viewingStreamRoster.stream.id)}
                      className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Admit First Learner</span>
                    </button>
                  </div>
                );
              }
              return (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-3 font-semibold text-slate-700 w-10">#</th>
                        <th className="p-3 font-semibold text-slate-700">Learner Full Name</th>
                        <th className="p-3 font-semibold text-slate-700">Assessment / Adm No</th>
                        <th className="p-3 font-semibold text-slate-700">Gender</th>
                        <th className="p-3 font-semibold text-slate-700">Guardian Contact</th>
                        <th className="p-3 font-semibold text-slate-700">Fee Status</th>
                        <th className="p-3 font-semibold text-slate-700 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {streamLearners.map((st, idx) => (
                        <tr key={st.id} className="hover:bg-slate-50/50">
                          <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-900 block">{st.fullName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {st.id}</span>
                          </td>
                          <td className="p-3 font-mono text-slate-600">
                            {st.learnerAssessmentNo || st.admissionNo}
                          </td>
                          <td className="p-3 text-slate-600">{st.gender}</td>
                          <td className="p-3 text-slate-600">
                            {st.guardianPhone ? (
                              <div>
                                <span className="font-mono block">{st.guardianPhone}</span>
                                <span className="text-[10px] text-slate-400">{st.guardianName || 'Guardian'}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">N/A</span>
                            )}
                          </td>
                          <td className="p-3">
                            {st.feeBalance <= 0 ? (
                              <span className="text-emerald-600 font-medium">Cleared</span>
                            ) : (
                              <span className="text-amber-600 font-mono font-medium">Bal: {st.feeBalance.toLocaleString()}</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => openTransferModal(st)}
                                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-md cursor-pointer"
                                title="Transfer Stream or Level"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEditStudentModal(st)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md cursor-pointer"
                                title="Edit Learner"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteCandidate({ type: 'STUDENT', id: st.id, name: st.fullName })}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                                title="Delete Learner"
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
                Delete {deleteCandidate.type === 'GRADE' ? 'Level' : deleteCandidate.type === 'STREAM' ? 'Stream' : 'Learner'}?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <strong className="text-slate-800">{deleteCandidate.name}</strong>?
                This action cannot be undone.
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
