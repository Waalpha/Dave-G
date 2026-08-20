import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, FileCheck, CheckCircle2, XCircle, Clock, AlertTriangle,
  Search, Filter, Eye, Edit3, Trash2, Printer, Download, Award, Calendar,
  MapPin, BookOpen, ShieldCheck, Mail, Phone, ExternalLink, QrCode,
  GraduationCap, RefreshCw, ChevronRight, Check, AlertCircle, FileText,
  Building, Church, Send, Sparkles, UserCheck, ArrowRight
} from 'lucide-react';
import {
  StudentAdmissionApplication, AdmissionsApplicationStatus, AdmissionsDocument,
  AdmissionsDocumentStatus, AdmissionsInterview, AdmissionsReviewNote,
  TheologicalProgramme, ExaminationCentre, CandidateProfile, Student
} from '../../../types';
import { useAuth } from '../../../context/AuthContext';

interface TemsAdmissionsDashboardProps {
  onNavigateToCandidates?: () => void;
}

export const TemsAdmissionsDashboard: React.FC<TemsAdmissionsDashboardProps> = ({ onNavigateToCandidates }) => {
  const { user } = useAuth();

  // Applications and Stats State
  const [applications, setApplications] = useState<StudentAdmissionApplication[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter and Search States
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [programmeFilter, setProgrammeFilter] = useState<string>('ALL');
  const [intakeFilter, setIntakeFilter] = useState<string>('ALL');
  const [centreFilter, setCentreFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dropdown Reference Data
  const [programmes, setProgrammes] = useState<TheologicalProgramme[]>([]);
  const [centres, setCentres] = useState<ExaminationCentre[]>([]);

  // Modals & Panels
  const [selectedApp, setSelectedApp] = useState<StudentAdmissionApplication | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);

  // Feedback / Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Application Form State
  const initialFormState = {
    firstName: '',
    middleName: '',
    lastName: '',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80',
    dateOfBirth: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    nationalIdOrPassport: '',
    phone: '',
    email: '',
    address: '',
    city: 'London',
    postalCode: '',
    country: 'United Kingdom',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: 'Spouse / Parent',
    homeChurch: '',
    denomination: 'Evangelical / Reformed',
    ministryRole: '',
    pastorName: '',
    pastorPhone: '',
    pastorEmail: '',
    programmeId: '',
    intake: 'September 2026',
    centreId: '',
    studyMode: 'FULL_TIME_CAMPUS' as any,
    academicYear: '2026/2027',
    previousEducation: [
      {
        id: 'edu_init',
        institutionName: '',
        qualificationAwarded: '',
        yearCompleted: new Date().getFullYear() - 2,
        gradeOrScore: '',
        country: 'United Kingdom'
      }
    ]
  };

  const [newForm, setNewForm] = useState(initialFormState);
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);

  // Review / Decision Form State
  const [reviewNoteText, setReviewNoteText] = useState('');
  const [decisionAction, setDecisionAction] = useState<AdmissionsApplicationStatus>('ACCEPTED');

  // Interview Form State
  const [interviewForm, setInterviewForm] = useState({
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '10:00',
    mode: 'IN_PERSON' as 'IN_PERSON' | 'VIDEO_CALL' | 'PHONE',
    locationOrLink: 'Deanery Assessment Boardroom, London Centre',
    interviewerName: 'Prof. David Olawale (Dean of Theology)',
    notes: ''
  });

  const [interviewScoreForm, setInterviewScoreForm] = useState({
    interviewId: '',
    score: 85,
    recommendation: 'RECOMMEND' as 'STRONGLY_RECOMMEND' | 'RECOMMEND' | 'CONDITIONAL' | 'DO_NOT_RECOMMEND',
    notes: 'Applicant demonstrated solid theological foundation, pastoral calling, and academic capability.'
  });

  // Document Upload Form State
  const [docUploadForm, setDocUploadForm] = useState({
    name: 'Academic Transcript',
    type: 'TRANSCRIPT' as AdmissionsDocument['type'],
    fileName: 'transcript_certified.pdf',
    fileUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',
    status: 'SUBMITTED' as AdmissionsDocumentStatus
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch all admissions data
  const fetchAdmissions = async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (programmeFilter !== 'ALL') params.append('programmeId', programmeFilter);
      if (intakeFilter !== 'ALL') params.append('intake', intakeFilter);
      if (centreFilter !== 'ALL') params.append('centreId', centreFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const [admRes, progRes, centRes] = await Promise.all([
        fetch(`/api/tems/admissions?${params.toString()}`),
        fetch('/api/tems/programmes'),
        fetch('/api/tems/exam-centres')
      ]);

      const [admData, progData, centData] = await Promise.all([
        admRes.json(),
        progRes.json(),
        centRes.json()
      ]);

      if (admData.applications) {
        setApplications(admData.applications);
        setStats(admData.stats);
      }
      if (progData.programmes) setProgrammes(progData.programmes);
      if (centData.centres) setCentres(centData.centres);
    } catch (err) {
      console.error('Error fetching admissions data:', err);
      showToast('Failed to load admissions applications', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, [statusFilter, programmeFilter, intakeFilter, centreFilter]);

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAdmissions();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Check duplicate applicant
  const handleCheckDuplicates = async (idNumber: string, email: string, phone: string, fullName: string, dob: string) => {
    if (!idNumber && !email && !phone && !fullName) return;
    setCheckingDuplicates(true);
    try {
      const res = await fetch('/api/tems/admissions/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nationalIdOrPassport: idNumber,
          email,
          phone,
          fullName,
          dateOfBirth: dob
        })
      });
      const data = await res.json();
      setDuplicateWarning(data.isDuplicate ? data : null);
    } catch (err) {
      console.error('Duplicate check error:', err);
    } finally {
      setCheckingDuplicates(false);
    }
  };

  // Create Application
  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const prog = programmes.find(p => p.id === newForm.programmeId);
      const cent = centres.find(c => c.id === newForm.centreId);

      const payload = {
        ...newForm,
        programmeName: prog?.title || prog?.name || 'Diploma in Pastoral Theology',
        programmeCode: prog?.code || 'DIP-THEO',
        centreName: cent?.name || 'London Central Assessment Centre',
        status: 'PENDING_REVIEW'
      };

      const res = await fetch('/api/tems/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Application ${data.application.applicationNumber} created successfully!`);
        setShowNewModal(false);
        setNewForm(initialFormState);
        setDuplicateWarning(null);
        fetchAdmissions();
      } else {
        showToast(data.error || 'Failed to submit application', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error', 'error');
    }
  };

  // Add Review Note & Decision
  const handleAddReviewNote = async () => {
    if (!selectedApp) return;
    try {
      const res = await fetch(`/api/tems/admissions/${selectedApp.id}/review-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: reviewNoteText || `Admissions panel decision: ${decisionAction}`,
          decision: decisionAction
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Decision updated to ${decisionAction}`);
        setSelectedApp(data.application);
        setShowReviewModal(false);
        setReviewNoteText('');
        fetchAdmissions();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review', 'error');
    }
  };

  // Schedule Interview
  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    try {
      const res = await fetch(`/api/tems/admissions/${selectedApp.id}/interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interviewForm)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Admissions interview scheduled successfully!');
        setSelectedApp(data.application);
        setShowInterviewModal(false);
        fetchAdmissions();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule interview', 'error');
    }
  };

  // Complete / Grade Interview
  const handleScoreInterview = async (interviewId: string) => {
    if (!selectedApp) return;
    try {
      const res = await fetch(`/api/tems/admissions/${selectedApp.id}/interviews/${interviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'COMPLETED',
          score: interviewScoreForm.score,
          recommendation: interviewScoreForm.recommendation,
          notes: interviewScoreForm.notes
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Interview assessment submitted successfully!');
        setSelectedApp(data.application);
        fetchAdmissions();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to score interview', 'error');
    }
  };

  // Verify / Reject Document
  const handleUpdateDocStatus = async (docId: string, status: AdmissionsDocumentStatus, notes?: string) => {
    if (!selectedApp) return;
    try {
      const res = await fetch(`/api/tems/admissions/${selectedApp.id}/documents/${docId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, verificationNotes: notes || `Document status set to ${status}` })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Document ${status.toLowerCase()} successfully`);
        setSelectedApp(data.application);
        fetchAdmissions();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update document status', 'error');
    }
  };

  // Upload Document to Application
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    try {
      const res = await fetch(`/api/tems/admissions/${selectedApp.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docUploadForm)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Document uploaded successfully!');
        setSelectedApp(data.application);
        setShowDocUploadModal(false);
        fetchAdmissions();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to upload document', 'error');
    }
  };

  // Approve & Admit
  const handleApproveAndAdmit = async () => {
    if (!selectedApp) return;
    try {
      const res = await fetch(`/api/tems/admissions/${selectedApp.id}/approve-admit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programmeId: selectedApp.programmeId,
          centreId: selectedApp.centreId,
          intake: selectedApp.intake,
          academicYear: selectedApp.academicYear,
          studyMode: selectedApp.studyMode
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Applicant admitted! Admission No: ${data.application.admissionNumber}`);
        setSelectedApp(data.application);
        setShowAdmitModal(false);
        fetchAdmissions();
      }
    } catch (err: any) {
      showToast(err.message || 'Admission failed', 'error');
    }
  };

  // Generate Admission Letter
  const handleGenerateAdmissionLetter = async () => {
    if (!selectedApp) return;
    try {
      const res = await fetch(`/api/tems/admissions/${selectedApp.id}/admission-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Official Admission Letter generated (${data.letterNumber})!`);
        setSelectedApp(data.application);
        setShowLetterModal(true);
        fetchAdmissions();
      }
    } catch (err: any) {
      showToast(err.message || 'Letter generation failed', 'error');
    }
  };

  // Student Registration Finalize
  const handleRegisterStudent = async () => {
    if (!selectedApp) return;
    try {
      const res = await fetch(`/api/tems/admissions/${selectedApp.id}/register-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intake: selectedApp.intake,
          academicYear: selectedApp.academicYear,
          studyMode: selectedApp.studyMode
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Student registered for academic year!');
        setSelectedApp(data.application);
        fetchAdmissions();
      }
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    }
  };

  // Enroll as Examination Candidate
  const handleEnrollCandidate = async () => {
    if (!selectedApp) return;
    try {
      const res = await fetch(`/api/tems/admissions/${selectedApp.id}/enroll-candidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Candidate enrolled in TEMS Examination Registry: ${data.candidate.candidateNumber}!`);
        setSelectedApp(data.application);
        fetchAdmissions();
      }
    } catch (err: any) {
      showToast(err.message || 'Candidate enrollment failed', 'error');
    }
  };

  // Helper badge renderers
  const getStatusBadge = (status: AdmissionsApplicationStatus) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">Draft</span>;
      case 'SUBMITTED':
      case 'PENDING_REVIEW':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending Review</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Under Review</span>;
      case 'DOCUMENTS_REQUIRED':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Docs Required</span>;
      case 'INTERVIEW_SCHEDULED':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1"><Calendar className="w-3 h-3" /> Interview</span>;
      case 'ACCEPTED':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Accepted</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
      case 'ADMITTED':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-sm"><GraduationCap className="w-3 h-3" /> Admitted</span>;
      case 'REGISTERED':
        return <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-sm"><Check className="w-3 h-3" /> Registered</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  const getDocStatusBadge = (status: AdmissionsDocumentStatus) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Verified</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">Rejected</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">Reviewing</span>;
      case 'SUBMITTED':
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">Submitted</span>;
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-sm font-medium border transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950 border-rose-500/50 text-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-wrap justify-between items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
              Admissions Board
            </span>
            <span className="text-xs text-slate-400 font-mono">Academic Year 2026/2027</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-amber-400" />
            Brooks of Life UK — Student Admissions &amp; Matriculation
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Complete lifecycle management: Applicant Registration → Document Verification → Theological Panel Interview → Board Approval → Formal Admission &amp; Student Registration → TEMS Examination Candidate Enrollment.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAdmissions}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Refresh Admissions List"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-lg hover:shadow-amber-500/20 cursor-pointer flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Application</span>
          </button>
        </div>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400">Total Applicants</div>
          <div className="text-2xl font-black text-white mt-1">{stats?.total ?? applications.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">All cycles</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30">
          <div className="text-[11px] font-medium text-amber-400">Pending Review</div>
          <div className="text-2xl font-black text-amber-300 mt-1">{stats?.pendingReview ?? 0}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Triage queue</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-rose-500/30">
          <div className="text-[11px] font-medium text-rose-400">Docs Required</div>
          <div className="text-2xl font-black text-rose-300 mt-1">{stats?.documentsRequired ?? 0}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Missing/Rejected</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/30">
          <div className="text-[11px] font-medium text-purple-400">Interviews</div>
          <div className="text-2xl font-black text-purple-300 mt-1">{stats?.interviewScheduled ?? 0}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Scheduled</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-blue-500/30">
          <div className="text-[11px] font-medium text-blue-400">Accepted</div>
          <div className="text-2xl font-black text-blue-300 mt-1">{stats?.accepted ?? 0}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Board Approved</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/50 bg-amber-950/10">
          <div className="text-[11px] font-bold text-amber-400">Admitted</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{stats?.admitted ?? 0}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Issued Adm No</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 bg-emerald-950/10">
          <div className="text-[11px] font-bold text-emerald-400">Registered</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{stats?.registered ?? 0}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Active Students</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400">Candidates</div>
          <div className="text-2xl font-black text-white mt-1">{stats?.candidateEnrolled ?? 0}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Exam Slips Active</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by App No, Name, Email, Passport, Adm No..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Status Filter */}
          <div className="w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="DOCUMENTS_REQUIRED">Documents Required</option>
              <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
              <option value="ADMITTED">Admitted</option>
              <option value="REGISTERED">Registered</option>
            </select>
          </div>

          {/* Programme Filter */}
          <div className="w-56">
            <select
              value={programmeFilter}
              onChange={(e) => setProgrammeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Theological Programmes</option>
              {programmes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.title || p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Intake Filter */}
          <div className="w-40">
            <select
              value={intakeFilter}
              onChange={(e) => setIntakeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Intakes</option>
              <option value="September 2026">September 2026</option>
              <option value="January 2027">January 2027</option>
              <option value="May 2027">May 2027</option>
            </select>
          </div>

          {/* Centre Filter */}
          <div className="w-48">
            <select
              value={centreFilter}
              onChange={(e) => setCentreFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Centres</option>
              {centres.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Student Admission Applications ({applications.length})
            </h3>
          </div>

          <div className="text-xs text-slate-400">
            Click on any applicant row for verification, interview marking, letter generation and admission.
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Applicant</th>
                <th className="py-3.5 px-4">App &amp; ID Details</th>
                <th className="py-3.5 px-4">Programme &amp; Centre</th>
                <th className="py-3.5 px-4">Intake &amp; Year</th>
                <th className="py-3.5 px-4">Docs &amp; Interview</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
                    Loading admissions applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    No admission applications found matching the selected filters.
                  </td>
                </tr>
              ) : (
                applications.map((app) => {
                  const verifiedDocs = (app.documents || []).filter(d => d.status === 'VERIFIED').length;
                  const totalDocs = (app.documents || []).length;
                  const completedInterviews = (app.interviews || []).filter(i => i.status === 'COMPLETED').length;

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedApp(app);
                        setShowDetailModal(true);
                      }}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={app.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'}
                            alt={app.firstName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                              {app.firstName} {app.middleName ? `${app.middleName} ` : ''}{app.lastName}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                              <span>{app.email}</span>
                              <span>•</span>
                              <span>{app.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono text-amber-400 font-semibold">{app.applicationNumber}</div>
                        <div className="text-[11px] text-slate-400">ID: {app.nationalIdOrPassport}</div>
                        {app.admissionNumber && (
                          <div className="text-[10px] text-emerald-400 font-mono font-bold mt-0.5">
                            Adm: {app.admissionNumber}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200 line-clamp-1">{app.programmeName}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span className="truncate max-w-[180px]">{app.centreName}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-200 font-medium">{app.intake}</div>
                        <div className="text-[11px] text-slate-400">{app.academicYear}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5 text-[11px]">
                            <FileCheck className={`w-3.5 h-3.5 ${verifiedDocs === totalDocs && totalDocs > 0 ? 'text-emerald-400' : 'text-amber-400'}`} />
                            <span className="text-slate-300">{verifiedDocs}/{totalDocs} Docs Verified</span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-[11px]">
                            <UserCheck className={`w-3.5 h-3.5 ${completedInterviews > 0 ? 'text-purple-400' : 'text-slate-500'}`} />
                            <span className="text-slate-400">{completedInterviews > 0 ? 'Interview Done' : (app.interviews?.length || 0) > 0 ? 'Interview Scheduled' : 'No Interview'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {getStatusBadge(app.status)}
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setShowDetailModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="View Full Application"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {(app.status === 'ACCEPTED' || app.status === 'UNDER_REVIEW') && !app.admissionNumber && (
                            <button
                              onClick={() => {
                                setSelectedApp(app);
                                setShowAdmitModal(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center space-x-1"
                              title="Approve & Admit"
                            >
                              <GraduationCap className="w-3.5 h-3.5" />
                              <span>Admit</span>
                            </button>
                          )}

                          {app.status === 'ADMITTED' && (
                            <button
                              onClick={() => {
                                setSelectedApp(app);
                                handleGenerateAdmissionLetter();
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs border border-amber-500/30 flex items-center space-x-1"
                              title="Generate/View Admission Letter"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Letter</span>
                            </button>
                          )}

                          {app.status === 'ADMITTED' && !app.registeredAt && (
                            <button
                              onClick={() => {
                                setSelectedApp(app);
                                handleRegisterStudent();
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center space-x-1"
                              title="Finalize Student Registration"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Register</span>
                            </button>
                          )}

                          {app.status === 'REGISTERED' && !app.candidateId && (
                            <button
                              onClick={() => {
                                setSelectedApp(app);
                                handleEnrollCandidate();
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center space-x-1"
                              title="Enroll as TEMS Candidate"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Exam Slip</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: APPLICATION DETAIL & WORKFLOW HUB */}
      {/* ========================================================================= */}
      {showDetailModal && selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedApp.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'}
                  alt={selectedApp.firstName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-500"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-white">
                      {selectedApp.firstName} {selectedApp.middleName ? `${selectedApp.middleName} ` : ''}{selectedApp.lastName}
                    </h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold">
                      {selectedApp.applicationNumber}
                    </span>
                    {getStatusBadge(selectedApp.status)}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap gap-x-3">
                    <span>Email: <strong className="text-slate-200">{selectedApp.email}</strong></span>
                    <span>Phone: <strong className="text-slate-200">{selectedApp.phone}</strong></span>
                    <span>ID/Passport: <strong className="text-slate-200">{selectedApp.nationalIdOrPassport}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content Tabs */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Top Quick Actions Bar */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2 text-slate-300 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Admissions Decision Pipeline:</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer flex items-center space-x-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Board Review &amp; Decision</span>
                  </button>

                  <button
                    onClick={() => setShowInterviewModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer flex items-center space-x-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule Interview</span>
                  </button>

                  <button
                    onClick={() => setShowDocUploadModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 cursor-pointer flex items-center space-x-1.5"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Upload Document</span>
                  </button>

                  {!selectedApp.admissionNumber && (
                    <button
                      onClick={() => setShowAdmitModal(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer flex items-center space-x-1.5 shadow-md"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Approve &amp; Admit</span>
                    </button>
                  )}

                  {selectedApp.admissionNumber && (
                    <button
                      onClick={handleGenerateAdmissionLetter}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold border border-amber-500/40 cursor-pointer flex items-center space-x-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Admission Letter</span>
                    </button>
                  )}

                  {selectedApp.status === 'ADMITTED' && (
                    <button
                      onClick={handleRegisterStudent}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer flex items-center space-x-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Register Student</span>
                    </button>
                  )}

                  {(selectedApp.status === 'REGISTERED' || selectedApp.status === 'ADMITTED') && !selectedApp.candidateId && (
                    <button
                      onClick={handleEnrollCandidate}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer flex items-center space-x-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Enroll in TEMS Candidates</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status summary banner */}
              {selectedApp.admissionNumber && (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">Admitted Student Profile Created</div>
                      <div className="text-emerald-300">
                        Admission No: <strong className="font-mono">{selectedApp.admissionNumber}</strong> | Student No: <strong className="font-mono">{selectedApp.studentNumber}</strong>
                      </div>
                    </div>
                  </div>

                  {selectedApp.candidateNumber && (
                    <div className="text-right">
                      <div className="text-slate-400">TEMS Candidate Number:</div>
                      <div className="font-mono font-bold text-amber-400 text-sm">{selectedApp.candidateNumber}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Details 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Personal & Academic Programme Info */}
                <div className="space-y-4">
                  {/* Academic Programme Choice */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      Theological Programme &amp; Assessment Centre
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>
                        <span className="text-slate-500 block">Programme</span>
                        <strong className="text-white text-xs">{selectedApp.programmeName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Intake &amp; Academic Year</span>
                        <strong>{selectedApp.intake} ({selectedApp.academicYear})</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Assessment Centre</span>
                        <strong>{selectedApp.centreName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Study Mode</span>
                        <strong className="capitalize">{selectedApp.studyMode.replace(/_/g, ' ').toLowerCase()}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Church & Ministry Background */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Church className="w-4 h-4" />
                      Church Affiliation &amp; Ministry Background
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>
                        <span className="text-slate-500 block">Home Church</span>
                        <strong className="text-white">{selectedApp.homeChurch || 'Not Specified'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Denomination</span>
                        <strong>{selectedApp.denomination || 'Independent Evangelical'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Ministry Role / Calling</span>
                        <strong>{selectedApp.ministryRole || 'Lay Minister / Aspirant'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Pastor / Minister Reference</span>
                        <strong>{selectedApp.pastorName || 'N/A'} ({selectedApp.pastorPhone || selectedApp.pastorEmail || 'N/A'})</strong>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact & Address */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      Residential Address &amp; Emergency Contact
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>
                        <span className="text-slate-500 block">Address</span>
                        <strong>{selectedApp.address}, {selectedApp.city}, {selectedApp.postalCode}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Country of Residence</span>
                        <strong>{selectedApp.country}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Emergency Contact</span>
                        <strong>{selectedApp.emergencyContactName} ({selectedApp.emergencyContactRelation})</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Emergency Phone</span>
                        <strong>{selectedApp.emergencyContactPhone}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Educational History, Documents & Interviews */}
                <div className="space-y-4">
                  {/* Previous Education */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      Prior Academic &amp; Theological Education
                    </h4>
                    <div className="space-y-2">
                      {(selectedApp.previousEducation || []).length === 0 ? (
                        <div className="text-slate-500">No previous education entered.</div>
                      ) : (
                        selectedApp.previousEducation.map((edu, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                            <div>
                              <div className="font-bold text-white">{edu.qualificationAwarded}</div>
                              <div className="text-[11px] text-slate-400">{edu.institutionName} ({edu.country})</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-amber-400">{edu.gradeOrScore}</div>
                              <div className="text-[10px] text-slate-500">Year {edu.yearCompleted}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Supporting Documents & Verification */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4" />
                        Uploaded Supporting Credentials ({(selectedApp.documents || []).length})
                      </h4>
                      <button
                        onClick={() => setShowDocUploadModal(true)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold"
                      >
                        + Add Doc
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(selectedApp.documents || []).length === 0 ? (
                        <div className="text-slate-500">No documents uploaded yet.</div>
                      ) : (
                        selectedApp.documents.map((doc) => (
                          <div key={doc.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-bold text-white">{doc.name}</div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                  <span>Type: {doc.type}</span>
                                  <span>•</span>
                                  <span>{doc.fileName}</span>
                                </div>
                              </div>
                              <div>{getDocStatusBadge(doc.status)}</div>
                            </div>

                            {doc.verificationNotes && (
                              <div className="text-[11px] text-slate-300 bg-slate-950 p-2 rounded border border-slate-800">
                                <strong>Registry Note:</strong> {doc.verificationNotes}
                                {doc.verifiedBy && <span className="text-slate-500 block text-[10px]">Verified by {doc.verifiedBy}</span>}
                              </div>
                            )}

                            {/* Verify / Reject Buttons */}
                            <div className="flex justify-end space-x-2 pt-1 border-t border-slate-800/80">
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" /> View
                              </a>

                              {doc.status !== 'VERIFIED' && (
                                <button
                                  onClick={() => handleUpdateDocStatus(doc.id, 'VERIFIED', 'Original document certified by Admissions Registrar')}
                                  className="px-2 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[10px] font-bold flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" /> Verify
                                </button>
                              )}

                              {doc.status !== 'REJECTED' && (
                                <button
                                  onClick={() => {
                                    const note = prompt('Enter rejection reason / document defect:', 'Illegible scan, please re-upload clear certified copy.');
                                    if (note) handleUpdateDocStatus(doc.id, 'REJECTED', note);
                                  }}
                                  className="px-2 py-1 rounded bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white text-[10px] font-bold flex items-center gap-1"
                                >
                                  <XCircle className="w-3 h-3" /> Reject
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Admissions Interview Schedule & Scores */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        Theological Panel Interviews ({(selectedApp.interviews || []).length})
                      </h4>
                      <button
                        onClick={() => setShowInterviewModal(true)}
                        className="px-2 py-1 rounded bg-purple-600/30 hover:bg-purple-600 text-purple-200 text-[11px] font-semibold"
                      >
                        + Schedule
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(selectedApp.interviews || []).length === 0 ? (
                        <div className="text-slate-500">No interview scheduled yet.</div>
                      ) : (
                        selectedApp.interviews.map((int) => (
                          <div key={int.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-bold text-white">Date: {int.scheduledDate} at {int.scheduledTime}</div>
                                <div className="text-[11px] text-slate-400">Interviewer: {int.interviewerName}</div>
                                <div className="text-[10px] text-slate-500">Mode: {int.mode} ({int.locationOrLink})</div>
                              </div>
                              <div>
                                {int.status === 'COMPLETED' ? (
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                                    Score: {int.score}/100
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-[10px]">
                                    Scheduled
                                  </span>
                                )}
                              </div>
                            </div>

                            {int.notes && (
                              <div className="text-[11px] text-slate-300 bg-slate-950 p-2 rounded border border-slate-800">
                                <strong>Assessment Notes:</strong> {int.notes}
                                {int.recommendation && (
                                  <div className="text-amber-400 font-bold mt-1">
                                    Recommendation: {int.recommendation.replace(/_/g, ' ')}
                                  </div>
                                )}
                              </div>
                            )}

                            {int.status !== 'COMPLETED' && (
                              <div className="flex justify-end pt-1 border-t border-slate-800">
                                <button
                                  onClick={() => {
                                    setInterviewScoreForm({ ...interviewScoreForm, interviewId: int.id });
                                    const score = prompt('Enter Interview Assessment Score (0 - 100):', '85');
                                    if (score !== null) {
                                      const recommendation = prompt('Recommendation (STRONGLY_RECOMMEND, RECOMMEND, CONDITIONAL, DO_NOT_RECOMMEND):', 'STRONGLY_RECOMMEND') as any;
                                      const notes = prompt('Enter Faculty Evaluation Notes:', 'Sound doctrinal grasp and mature Christian character.');
                                      if (recommendation && notes) {
                                        interviewScoreForm.score = Number(score);
                                        interviewScoreForm.recommendation = recommendation;
                                        interviewScoreForm.notes = notes;
                                        handleScoreInterview(int.id);
                                      }
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold"
                                >
                                  Submit Interview Assessment Score
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Audit Trail Timeline */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Official Admissions Audit Trail &amp; Decision History
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(selectedApp.auditTrail || []).map((audit) => (
                    <div key={audit.id} className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center text-[11px]">
                      <div>
                        <span className="font-bold text-amber-300">[{audit.action}]</span>{' '}
                        <span className="text-slate-300">{audit.description}</span>
                        <span className="text-slate-500 block text-[10px]">By {audit.performedBy}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 whitespace-nowrap">
                        {new Date(audit.timestamp).toLocaleString('en-GB')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
              <div className="text-slate-400 text-xs">
                Tenant: Brooks of Life UK (Strict isolation verified)
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NEW APPLICATION */}
      {/* ========================================================================= */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-amber-400" />
                  New Student Admission Application
                </h3>
                <p className="text-xs text-slate-400">
                  Unique application number will be generated automatically.
                </p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Duplicate Warning */}
              {duplicateWarning && duplicateWarning.isDuplicate && (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/60 text-amber-200 space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-amber-300">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span>Potential Duplicate Record Detected!</span>
                  </div>
                  <p className="text-xs">
                    Matched on: <strong>{duplicateWarning.matchedBy.join(', ')}</strong>.
                  </p>
                  {duplicateWarning.existingApplications?.length > 0 && (
                    <div className="text-[11px] text-slate-300">
                      Existing application found:{' '}
                      <strong className="text-amber-400 font-mono">
                        {duplicateWarning.existingApplications[0].applicationNumber}
                      </strong>{' '}
                      ({duplicateWarning.existingApplications[0].status})
                    </div>
                  )}
                  {duplicateWarning.existingStudents?.length > 0 && (
                    <div className="text-[11px] text-slate-300">
                      Active student already registered with Admission No:{' '}
                      <strong className="text-emerald-400 font-mono">
                        {duplicateWarning.existingStudents[0].admissionNo}
                      </strong>
                    </div>
                  )}
                </div>
              )}

              {/* 1. Personal Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-sm border-b border-slate-800 pb-1 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black">1</span>
                  Applicant Personal Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={newForm.firstName}
                      onChange={(e) => setNewForm({ ...newForm, firstName: e.target.value })}
                      placeholder="e.g. Samuel"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Middle Name</label>
                    <input
                      type="text"
                      value={newForm.middleName}
                      onChange={(e) => setNewForm({ ...newForm, middleName: e.target.value })}
                      placeholder="e.g. John"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Last Name / Surname *</label>
                    <input
                      type="text"
                      required
                      value={newForm.lastName}
                      onChange={(e) => setNewForm({ ...newForm, lastName: e.target.value })}
                      placeholder="e.g. Wesley"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={newForm.dateOfBirth}
                      onChange={(e) => {
                        setNewForm({ ...newForm, dateOfBirth: e.target.value });
                        handleCheckDuplicates(newForm.nationalIdOrPassport, newForm.email, newForm.phone, `${newForm.firstName} ${newForm.lastName}`, e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Gender *</label>
                    <select
                      value={newForm.gender}
                      onChange={(e) => setNewForm({ ...newForm, gender: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">ID / Passport Number *</label>
                    <input
                      type="text"
                      required
                      value={newForm.nationalIdOrPassport}
                      onChange={(e) => {
                        setNewForm({ ...newForm, nationalIdOrPassport: e.target.value });
                        handleCheckDuplicates(e.target.value, newForm.email, newForm.phone, `${newForm.firstName} ${newForm.lastName}`, newForm.dateOfBirth);
                      }}
                      placeholder="e.g. GBR92018471"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={newForm.email}
                      onChange={(e) => {
                        setNewForm({ ...newForm, email: e.target.value });
                        handleCheckDuplicates(newForm.nationalIdOrPassport, e.target.value, newForm.phone, `${newForm.firstName} ${newForm.lastName}`, newForm.dateOfBirth);
                      }}
                      placeholder="applicant@example.org"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={newForm.phone}
                      onChange={(e) => {
                        setNewForm({ ...newForm, phone: e.target.value });
                        handleCheckDuplicates(newForm.nationalIdOrPassport, newForm.email, e.target.value, `${newForm.firstName} ${newForm.lastName}`, newForm.dateOfBirth);
                      }}
                      placeholder="+44 7700 900123"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Photo URL</label>
                    <input
                      type="url"
                      value={newForm.photoUrl}
                      onChange={(e) => setNewForm({ ...newForm, photoUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 font-medium mb-1">Street Address</label>
                    <input
                      type="text"
                      value={newForm.address}
                      onChange={(e) => setNewForm({ ...newForm, address: e.target.value })}
                      placeholder="e.g. 12 Cathedral Close"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">City</label>
                    <input
                      type="text"
                      value={newForm.city}
                      onChange={(e) => setNewForm({ ...newForm, city: e.target.value })}
                      placeholder="London"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={newForm.postalCode}
                      onChange={(e) => setNewForm({ ...newForm, postalCode: e.target.value })}
                      placeholder="EC1A 1BB"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Academic Programme & Intake Selection */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-sm border-b border-slate-800 pb-1 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black">2</span>
                  Theological Academic Programme &amp; Assessment Centre
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Theological Programme *</label>
                    <select
                      required
                      value={newForm.programmeId}
                      onChange={(e) => setNewForm({ ...newForm, programmeId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="">-- Select Programme --</option>
                      {programmes.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.code} - {p.title || p.name} ({p.level})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Assessment / Exam Centre *</label>
                    <select
                      required
                      value={newForm.centreId}
                      onChange={(e) => setNewForm({ ...newForm, centreId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="">-- Select Examination Centre --</option>
                      {centres.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Intake Period *</label>
                    <select
                      value={newForm.intake}
                      onChange={(e) => setNewForm({ ...newForm, intake: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="September 2026">September 2026</option>
                      <option value="January 2027">January 2027</option>
                      <option value="May 2027">May 2027</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Study Mode *</label>
                    <select
                      value={newForm.studyMode}
                      onChange={(e) => setNewForm({ ...newForm, studyMode: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="FULL_TIME_CAMPUS">Full-Time Campus</option>
                      <option value="PART_TIME_EVENING">Part-Time Evening</option>
                      <option value="HYBRID_INTENSIVE">Hybrid Intensive</option>
                      <option value="DISTANCE_ONLINE">Distance / Online</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Church & Ministry Background */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-sm border-b border-slate-800 pb-1 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black">3</span>
                  Church Ministry &amp; Pastoral Endorsement
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Home Church / Fellowship</label>
                    <input
                      type="text"
                      value={newForm.homeChurch}
                      onChange={(e) => setNewForm({ ...newForm, homeChurch: e.target.value })}
                      placeholder="e.g. Grace City Fellowship"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Denomination</label>
                    <input
                      type="text"
                      value={newForm.denomination}
                      onChange={(e) => setNewForm({ ...newForm, denomination: e.target.value })}
                      placeholder="e.g. Evangelical / Baptist"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Current Ministry Calling / Role</label>
                    <input
                      type="text"
                      value={newForm.ministryRole}
                      onChange={(e) => setNewForm({ ...newForm, ministryRole: e.target.value })}
                      placeholder="e.g. Youth Leader / Deacon"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Senior Pastor / Referee Name</label>
                    <input
                      type="text"
                      value={newForm.pastorName}
                      onChange={(e) => setNewForm({ ...newForm, pastorName: e.target.value })}
                      placeholder="Rev. Dr. John Stott"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Pastor Contact Phone</label>
                    <input
                      type="tel"
                      value={newForm.pastorPhone}
                      onChange={(e) => setNewForm({ ...newForm, pastorPhone: e.target.value })}
                      placeholder="+44 7700 900331"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Pastor Email</label>
                    <input
                      type="email"
                      value={newForm.pastorEmail}
                      onChange={(e) => setNewForm({ ...newForm, pastorEmail: e.target.value })}
                      placeholder="pastor@gracecity.org"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Previous Education */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black">4</span>
                    Prior Academic Education
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setNewForm({
                        ...newForm,
                        previousEducation: [
                          ...newForm.previousEducation,
                          {
                            id: `edu_${Date.now()}`,
                            institutionName: '',
                            qualificationAwarded: '',
                            yearCompleted: new Date().getFullYear() - 1,
                            gradeOrScore: '',
                            country: 'United Kingdom'
                          }
                        ]
                      });
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-semibold"
                  >
                    + Add Academic Record
                  </button>
                </div>

                {newForm.previousEducation.map((edu, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-slate-500 text-[10px] mb-1">Institution</label>
                      <input
                        type="text"
                        value={edu.institutionName}
                        onChange={(e) => {
                          const list = [...newForm.previousEducation];
                          list[idx].institutionName = e.target.value;
                          setNewForm({ ...newForm, previousEducation: list });
                        }}
                        placeholder="e.g. Oxford University / High School"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[10px] mb-1">Qualification Awarded</label>
                      <input
                        type="text"
                        value={edu.qualificationAwarded}
                        onChange={(e) => {
                          const list = [...newForm.previousEducation];
                          list[idx].qualificationAwarded = e.target.value;
                          setNewForm({ ...newForm, previousEducation: list });
                        }}
                        placeholder="e.g. A-Levels / BA / Diploma"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[10px] mb-1">Grade / Score</label>
                      <input
                        type="text"
                        value={edu.gradeOrScore}
                        onChange={(e) => {
                          const list = [...newForm.previousEducation];
                          list[idx].gradeOrScore = e.target.value;
                          setNewForm({ ...newForm, previousEducation: list });
                        }}
                        placeholder="e.g. Distinction / Grade A"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[10px] mb-1">Year Completed</label>
                      <input
                        type="number"
                        value={edu.yearCompleted}
                        onChange={(e) => {
                          const list = [...newForm.previousEducation];
                          list[idx].yearCompleted = Number(e.target.value);
                          setNewForm({ ...newForm, previousEducation: list });
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Submission Buttons */}
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center rounded-xl">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center space-x-2 shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BOARD REVIEW & DECISION */}
      {/* ========================================================================= */}
      {showReviewModal && selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                Admissions Board Review &amp; Decision
              </h3>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Application: <strong className="text-amber-400 font-mono">{selectedApp.applicationNumber}</strong> — {selectedApp.firstName} {selectedApp.lastName}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Board Decision Action *</label>
                <select
                  value={decisionAction}
                  onChange={(e) => setDecisionAction(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold"
                >
                  <option value="ACCEPTED">ACCEPT — Pass for Full Admission</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW — Further Faculty Review</option>
                  <option value="DOCUMENTS_REQUIRED">DOCUMENTS REQUIRED — Request Additional/Certified Proof</option>
                  <option value="INTERVIEW_SCHEDULED">INTERVIEW REQUIRED — Call for Panel Oral Assessment</option>
                  <option value="REJECTED">REJECT — Decline Application</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Formal Minute / Review Note *</label>
                <textarea
                  rows={4}
                  value={reviewNoteText}
                  onChange={(e) => setReviewNoteText(e.target.value)}
                  placeholder="Enter board minute notes, conditions of acceptance, or document deficiencies..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAddReviewNote}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Save Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SCHEDULE INTERVIEW */}
      {/* ========================================================================= */}
      {showInterviewModal && selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                Schedule Theological Admissions Interview
              </h3>
              <button onClick={() => setShowInterviewModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Interview Date *</label>
                  <input
                    type="date"
                    required
                    value={interviewForm.scheduledDate}
                    onChange={(e) => setInterviewForm({ ...interviewForm, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Interview Time *</label>
                  <input
                    type="time"
                    required
                    value={interviewForm.scheduledTime}
                    onChange={(e) => setInterviewForm({ ...interviewForm, scheduledTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Interview Mode *</label>
                <select
                  value={interviewForm.mode}
                  onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option value="IN_PERSON">In-Person at Centre Boardroom</option>
                  <option value="VIDEO_CALL">Online Video Call (Google Meet / Zoom)</option>
                  <option value="PHONE">Telephone Assessment</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Location or Video Meeting URL *</label>
                <input
                  type="text"
                  required
                  value={interviewForm.locationOrLink}
                  onChange={(e) => setInterviewForm({ ...interviewForm, locationOrLink: e.target.value })}
                  placeholder="https://meet.google.com/... or Boardroom 2A"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Assigned Faculty Interviewer *</label>
                <input
                  type="text"
                  required
                  value={interviewForm.interviewerName}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewerName: e.target.value })}
                  placeholder="Prof. David Olawale (Dean of Theology)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInterviewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: UPLOAD DOCUMENT */}
      {/* ========================================================================= */}
      {showDocUploadModal && selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-400" />
                Upload Supporting Credential
              </h3>
              <button onClick={() => setShowDocUploadModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={docUploadForm.name}
                  onChange={(e) => setDocUploadForm({ ...docUploadForm, name: e.target.value })}
                  placeholder="e.g. Degree Certificate / Reference Letter"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Document Classification *</label>
                <select
                  value={docUploadForm.type}
                  onChange={(e) => setDocUploadForm({ ...docUploadForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option value="ID_PASSPORT">Passport / Photo ID</option>
                  <option value="ACADEMIC_CERTIFICATE">Academic Certificate</option>
                  <option value="TRANSCRIPT">Official Academic Transcript</option>
                  <option value="RECOMMENDATION_LETTER">Pastoral / Academic Recommendation Letter</option>
                  <option value="ESSAY_STATEMENT">Personal Statement of Faith / Calling</option>
                  <option value="OTHER">Other Credential</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">File Name</label>
                <input
                  type="text"
                  value={docUploadForm.fileName}
                  onChange={(e) => setDocUploadForm({ ...docUploadForm, fileName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">File URL</label>
                <input
                  type="url"
                  value={docUploadForm.fileUrl}
                  onChange={(e) => setDocUploadForm({ ...docUploadForm, fileUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDocUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Attach Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: APPROVE & ADMIT CONFIRMATION */}
      {/* ========================================================================= */}
      {showAdmitModal && selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-400" />
                Confirm Formal Student Admission
              </h3>
              <button onClick={() => setShowAdmitModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs space-y-2">
              <div className="font-bold text-amber-300">
                You are admitting {selectedApp.firstName} {selectedApp.lastName}
              </div>
              <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
                <li>Generates official Admission Number (e.g. <span className="font-mono text-amber-400">BOL/ADM/2026/00X</span>)</li>
                <li>Generates unique Student Number (e.g. <span className="font-mono text-amber-400">BOL-STU-2026-00X</span>)</li>
                <li>Creates linked Student Record in the institution database</li>
                <li>Enables generation of official Admission Letter with QR verification</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAdmitModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveAndAdmit}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg"
              >
                Confirm &amp; Issue Admission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: OFFICIAL ADMISSION LETTER (PRINTABLE VIEW) */}
      {/* ========================================================================= */}
      {showLetterModal && selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:max-h-none print:shadow-none print:border-none">
            {/* Top print toolbar */}
            <div className="p-3 bg-slate-950 text-white flex justify-between items-center print:hidden">
              <span className="text-xs font-bold text-amber-400">
                Official Brooks of Life UK — Offer of Admission Letter
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Letter (A4)</span>
                </button>
                <button
                  onClick={() => setShowLetterModal(false)}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Letter Body - Styled as prestigious official British academic letter */}
            <div className="p-10 overflow-y-auto space-y-6 text-sm bg-white font-serif">
              {/* Institution Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div className="space-y-1">
                  <div className="text-xl font-black tracking-tight text-slate-950 font-sans uppercase">
                    Brooks of Life Theological Seminary &amp; Ministry Institute UK
                  </div>
                  <div className="text-xs text-slate-600 font-sans">
                    Registry of Academic Admissions &amp; Theological Standards
                  </div>
                  <div className="text-[11px] text-slate-500 font-sans">
                    London Assessment Centre • Registered British Theological Institution
                  </div>
                </div>
                <div className="text-right font-sans text-xs space-y-0.5">
                  <div className="font-bold text-slate-950">Ref: {selectedApp.admissionLetterNumber || 'BOL-LET-2026-001'}</div>
                  <div className="text-slate-600">Date: {selectedApp.admissionLetterDate || new Date().toISOString().split('T')[0]}</div>
                  <div className="font-mono text-[10px] text-slate-500">Ver: {selectedApp.admissionLetterVerificationCode || 'BOL-VER-ADM-001'}</div>
                </div>
              </div>

              {/* Recipient */}
              <div className="space-y-1 font-sans text-xs">
                <div>To:</div>
                <div className="font-bold text-base text-slate-950 font-serif">
                  {selectedApp.firstName} {selectedApp.middleName ? `${selectedApp.middleName} ` : ''}{selectedApp.lastName}
                </div>
                <div className="text-slate-700">{selectedApp.address}</div>
                <div className="text-slate-700">{selectedApp.city}, {selectedApp.postalCode}, {selectedApp.country}</div>
                <div className="text-slate-700 font-mono">Passport/ID: {selectedApp.nationalIdOrPassport}</div>
              </div>

              {/* Letter Title */}
              <div className="pt-2 text-center">
                <h2 className="text-lg font-black text-slate-950 tracking-wide uppercase border-y border-slate-300 py-1.5 font-sans">
                  Official Offer of Admission &amp; Academic Matriculation
                </h2>
              </div>

              {/* Letter Paragraphs */}
              <div className="space-y-3 leading-relaxed text-slate-800 text-xs">
                <p>Dear {selectedApp.firstName},</p>
                <p>
                  Following the formal deliberation of the Academic Admissions Board and faculty examination panel, we are pleased to inform you that you have been granted <strong>unconditional admission</strong> to pursue theological studies at <strong>Brooks of Life UK</strong> for the academic year <strong>{selectedApp.academicYear}</strong>.
                </p>

                <div className="my-3 p-4 bg-slate-50 border border-slate-200 rounded-lg font-sans text-xs space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Academic Programme:</span>
                      <strong className="text-slate-900">{selectedApp.programmeName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Official Admission Number:</span>
                      <strong className="font-mono text-slate-900">{selectedApp.admissionNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Student Identification Number:</span>
                      <strong className="font-mono text-slate-900">{selectedApp.studentNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Academic Intake Diet:</span>
                      <strong className="text-slate-900">{selectedApp.intake}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Designated Assessment Centre:</span>
                      <strong className="text-slate-900">{selectedApp.centreName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Study Mode:</span>
                      <strong className="text-slate-900 capitalize">{selectedApp.studyMode.replace(/_/g, ' ').toLowerCase()}</strong>
                    </div>
                  </div>
                </div>

                <p className="font-bold text-slate-900">Conditions and Next Steps:</p>
                <ol className="list-decimal list-inside space-y-1 pl-2 text-slate-700">
                  <li>Presentation of certified original credentials during matriculation orientation week.</li>
                  <li>Strict adherence to the Brooks of Life UK Statement of Faith and Code of Academic Integrity.</li>
                  <li>Completion of student registration and examination unit enrollment prior to candidate slip issuance.</li>
                </ol>

                <p>
                  We look forward to welcoming you into our scholarly community as you prepare for faithful ministry and rigorous theological reflection.
                </p>
              </div>

              {/* Signatures & Seal */}
              <div className="pt-6 flex justify-between items-end border-t border-slate-200 font-sans">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-xs">Prof. David Olawale, PhD, DD</div>
                  <div className="text-[11px] text-slate-600">Dean of Theological Studies</div>
                  <div className="text-[10px] text-slate-500">Brooks of Life UK — Faculty of Theology</div>
                </div>

                <div className="text-center space-y-1">
                  <div className="w-16 h-16 border-2 border-slate-400 rounded-full mx-auto flex items-center justify-center text-[9px] font-black uppercase text-slate-700 tracking-tighter">
                    Official<br />Seal
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">{selectedApp.admissionLetterVerificationCode}</div>
                </div>

                <div className="space-y-1 text-right">
                  <div className="font-bold text-slate-900 text-xs">Dr. Rebecca Vance, ThM</div>
                  <div className="text-[11px] text-slate-600">Registrar of Admissions</div>
                  <div className="text-[10px] text-slate-500">Brooks of Life Examination Registry</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
