import React, { useState, useEffect } from 'react';
import {
  GraduationCap, BookOpen, Calendar, MapPin, Users, Award,
  FileCheck, ShieldCheck, Plus, Search, Filter, Edit3, Trash2,
  DollarSign, CheckCircle, Clock, AlertCircle, QrCode, RefreshCw
} from 'lucide-react';
import {
  TheologicalProgramme, TheologicalUnit, ExaminationSession,
  ExaminationCentre, CandidateProfile, ExamPaperQuestion,
  ExaminationPaper, ExamResultRecord, OfficialTranscript,
  OfficialCertificate, TemsFeeScheduleItem, TemsPaymentRecord
} from '../../../types';

export const TemsAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'programmes' | 'sessions' | 'centres' | 'papers' | 'candidates' | 'results' | 'transcripts' | 'certificates' | 'fees'>('programmes');

  // Domain data
  const [programmes, setProgrammes] = useState<TheologicalProgramme[]>([]);
  const [sessions, setSessions] = useState<ExaminationSession[]>([]);
  const [centres, setCentres] = useState<ExaminationCentre[]>([]);
  const [papers, setPapers] = useState<ExaminationPaper[]>([]);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [results, setResults] = useState<ExamResultRecord[]>([]);
  const [transcripts, setTranscripts] = useState<OfficialTranscript[]>([]);
  const [certificates, setCertificates] = useState<OfficialCertificate[]>([]);
  const [fees, setFees] = useState<TemsFeeScheduleItem[]>([]);
  const [payments, setPayments] = useState<TemsPaymentRecord[]>([]);

  // Modals & New Form States
  const [showProgrammeModal, setShowProgrammeModal] = useState(false);
  const [programmeForm, setProgrammeForm] = useState({
    code: '',
    title: '',
    level: 'BACHELORS',
    departmentName: 'Department of Systematic & Pastoral Theology',
    durationMonths: 36,
    totalCredits: 120,
    description: ''
  });

  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    dietCode: '',
    title: '',
    academicYear: '2026/2027',
    startDate: '2026-10-01',
    endDate: '2026-10-15',
    registrationDeadline: '2026-09-20'
  });

  const [showPaperModal, setShowPaperModal] = useState(false);
  const [paperForm, setPaperForm] = useState({
    paperCode: '',
    subjectCode: '',
    title: '',
    durationMinutes: 120,
    totalMarks: 100,
    passingScore: 40,
    instructions: 'Answer all questions in Section A and two questions from Section B.'
  });

  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certForm, setCertForm] = useState({
    candidateId: '',
    candidateNumber: '',
    candidateName: '',
    programmeId: '',
    programmeName: '',
    qualificationTitle: '',
    honorsClassification: 'First Class Honors (Distinction)',
    conferralDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [progRes, sessRes, centRes, papRes, candRes, resRes, trRes, certRes, feeRes, payRes] = await Promise.all([
        fetch('/api/tems/programmes'),
        fetch('/api/tems/exam-sessions'),
        fetch('/api/tems/exam-centres'),
        fetch('/api/tems/exam-papers'),
        fetch('/api/tems/candidates'),
        fetch('/api/tems/results'),
        fetch('/api/tems/transcripts'),
        fetch('/api/tems/certificates'),
        fetch('/api/tems/fees'),
        fetch('/api/tems/payments')
      ]);

      const [progData, sessData, centData, papData, candData, resData, trData, certData, feeData, payData] = await Promise.all([
        progRes.json(), sessRes.json(), centRes.json(), papRes.json(), candRes.json(), resRes.json(), trRes.json(), certRes.json(), feeRes.json(), payRes.json()
      ]);

      if (progData.programmes) setProgrammes(progData.programmes);
      if (sessData.sessions) setSessions(sessData.sessions);
      if (centData.centres) setCentres(centData.centres);
      if (papData.papers) setPapers(papData.papers);
      if (candData.candidates) setCandidates(candData.candidates);
      if (resData.results) setResults(resData.results);
      if (trData.transcripts) setTranscripts(trData.transcripts);
      if (certData.certificates) setCertificates(certData.certificates);
      if (feeData.fees) setFees(feeData.fees);
      if (payData.payments) setPayments(payData.payments);
    } catch (err) {
      console.error('Failed to load TEMS admin data:', err);
    }
  };

  const handleCreateProgramme = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tems/programmes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(programmeForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowProgrammeModal(false);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tems/exam-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowSessionModal(false);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tems/exam-papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paperForm,
          questions: [
            {
              id: 'q_' + Date.now() + '_1',
              paperId: 'new',
              questionNumber: 1,
              prompt: 'Evaluate the hermeneutical principles governing biblical exegesis in historical theology.',
              questionType: 'ESSAY',
              marks: 30,
              allocatedMarks: 30
            },
            {
              id: 'q_' + Date.now() + '_2',
              paperId: 'new',
              questionNumber: 2,
              prompt: 'Which biblical passage directly establishes the Christian doctrine of the Trinity?',
              questionType: 'MCQ',
              marks: 10,
              allocatedMarks: 10,
              options: ['Matthew 28:19', 'Genesis 1:1', 'Exodus 20:3', 'Psalm 23:1'],
              correctOption: 'Matthew 28:19'
            }
          ]
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowPaperModal(false);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tems/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(certForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowCertificateModal(false);
        alert('Cryptographically sealed certificate issued! Verifiable on UK public registry.');
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xl">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-white">TEMS Examination Council &amp; Registry</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                UK Executive Administration
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              End-to-end management of programmes, examination diets, question banks, scripts, transcripts, and cryptographic certificates.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAllData}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all cursor-pointer flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto space-x-2 border-b border-slate-800 pb-2 text-xs font-medium scrollbar-none">
        {[
          { id: 'programmes', label: 'Programmes & Curriculum', icon: BookOpen },
          { id: 'sessions', label: 'Exam Diets & Sessions', icon: Calendar },
          { id: 'centres', label: 'Centres & Invigilation', icon: MapPin },
          { id: 'papers', label: 'Papers & Question Bank', icon: FileCheck },
          { id: 'candidates', label: 'Candidates & Slips', icon: Users },
          { id: 'results', label: 'Results Ratification', icon: Award },
          { id: 'transcripts', label: 'Official Transcripts', icon: GraduationCap },
          { id: 'certificates', label: 'Conferred Certificates', icon: ShieldCheck },
          { id: 'fees', label: 'Fee Schedules & Payments', icon: DollarSign }
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center space-x-2 whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: PROGRAMMES */}
      {activeTab === 'programmes' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Theological Academic Programmes</h3>
              <button
                onClick={() => setShowProgrammeModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>New Programme</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {programmes.map((p) => (
                <div key={p.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-amber-400 font-bold text-xs">{p.code}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[11px]">{p.level}</span>
                  </div>
                  <h4 className="text-base font-bold text-white">{p.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800 flex justify-between">
                    <span>{p.durationMonths} Months</span>
                    <span>{p.totalCredits} Credits</span>
                    <span>{p.units?.length || 0} Units</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Examination Diets &amp; Sessions</h3>
              <button
                onClick={() => setShowSessionModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Exam Diet</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((s) => (
                <div key={s.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-amber-400 font-bold text-xs">{s.dietCode}</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-xs ${s.status === 'REGISTRATION_OPEN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {s.status}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">{s.title}</h4>
                  <div className="text-xs text-slate-400 space-y-1">
                    <div>Academic Cycle: {s.academicYear}</div>
                    <div>Registration Deadline: <strong>{s.registrationDeadline}</strong></div>
                    <div>Exam Window: {s.startDate} to {s.endDate}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: CENTRES */}
      {activeTab === 'centres' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Examination Centres &amp; Invigilation Stations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {centres.map((c) => (
                <div key={c.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <span className="font-mono text-amber-400 font-bold">{c.centreCode}</span>
                  <h4 className="text-sm font-bold text-white">{c.name}</h4>
                  <p className="text-slate-400">{c.city}, {c.country}</p>
                  <div className="pt-2 border-t border-slate-800 flex justify-between text-slate-300">
                    <span>Capacity: {c.capacitySeats} Candidates</span>
                    <span className="text-emerald-400 font-bold">{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: PAPERS */}
      {activeTab === 'papers' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Examination Papers &amp; Question Bank</h3>
              <button
                onClick={() => setShowPaperModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Exam Paper</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {papers.map((p) => (
                <div key={p.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-amber-400 font-bold">{p.paperCode}</span>
                    <span className="text-slate-400">{p.durationMinutes} Minutes</span>
                  </div>
                  <h4 className="text-base font-bold text-white">{p.title}</h4>
                  <div className="text-slate-400">
                    Subject: <strong className="text-slate-200">{p.subjectCode}</strong> &bull; Total Marks: {p.totalMarks} &bull; Questions: {p.questions.length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: CANDIDATES */}
      {activeTab === 'candidates' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Registered Candidates Registry</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-4">Candidate Number</th>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Enrolled Programme</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {candidates.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{c.candidateNumber}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{c.title} {c.firstName} {c.lastName}</td>
                      <td className="py-3.5 px-4">{c.enrolledProgrammeName}</td>
                      <td className="py-3.5 px-4">{c.academicLevel}</td>
                      <td className="py-3.5 px-4 text-slate-400">{c.email}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                          {c.status}
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

      {/* TAB: RESULTS */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Ratified Examination Results</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Diet</th>
                    <th className="py-3 px-4">Total Score</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {results.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div>{r.candidateName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{r.candidateNumber}</div>
                      </td>
                      <td className="py-3.5 px-4">{r.subjectCode}: {r.subjectTitle}</td>
                      <td className="py-3.5 px-4 font-mono">{r.examDietCode}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{r.totalScore}%</td>
                      <td className="py-3.5 px-4 font-bold text-amber-400">{r.grade}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                          {r.status}
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

      {/* TAB: CERTIFICATES */}
      {activeTab === 'certificates' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Cryptographically Sealed Certificates</h3>
              <button
                onClick={() => setShowCertificateModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Issue Conferred Certificate</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((c) => (
                <div key={c.id} className="p-5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-amber-400 font-bold">{c.certificateNumber}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                      VERIFIED ON REGISTRY
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{c.qualificationTitle}</h4>
                  <div className="text-slate-300">Awarded to: <strong className="text-white">{c.candidateName}</strong> ({c.candidateNumber})</div>
                  <div className="p-2.5 rounded bg-slate-900 text-slate-400 font-mono text-[11px] flex items-center justify-between">
                    <span>QR: {c.qrVerificationCode}</span>
                    <a
                      href={`/verify-document/${c.qrVerificationCode}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 hover:underline"
                    >
                      Verify Link &rarr;
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: TRANSCRIPTS */}
      {activeTab === 'transcripts' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Issued Official Transcripts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transcripts.map((t) => (
                <div key={t.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-amber-400 font-bold">{t.transcriptNumber}</span>
                    <span className="text-emerald-400 font-bold">GPA: {t.cumulativeGpa.toFixed(2)}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{t.programmeName}</h4>
                  <div className="text-slate-300">Candidate: <strong className="text-white">{t.candidateName}</strong></div>
                  <div className="text-[11px] text-slate-500">Issued Date: {t.issueDate} &bull; Total Units: {t.entries.length}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: FEES & PAYMENTS */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Standardized Fee Schedules</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4 text-right">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {fees.map((f) => (
                    <tr key={f.id}>
                      <td className="py-3 px-4 font-bold text-white">{f.feeType}</td>
                      <td className="py-3 px-4">{f.description}</td>
                      <td className="py-3 px-4 font-mono">{f.academicLevel}</td>
                      <td className="py-3 px-4 text-right font-bold text-amber-400">&pound;{f.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Programme */}
      {showProgrammeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Create Theological Programme</h3>
              <button onClick={() => setShowProgrammeModal(false)} className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer">&times;</button>
            </div>
            <form onSubmit={handleCreateProgramme} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Programme Code</label>
                <input
                  type="text"
                  placeholder="e.g. BTH-2026"
                  value={programmeForm.code}
                  onChange={(e) => setProgrammeForm({ ...programmeForm, code: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Programme Title</label>
                <input
                  type="text"
                  placeholder="e.g. Bachelor of Theology (B.Th)"
                  value={programmeForm.title}
                  onChange={(e) => setProgrammeForm({ ...programmeForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Academic Level</label>
                  <select
                    value={programmeForm.level}
                    onChange={(e) => setProgrammeForm({ ...programmeForm, level: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="CERTIFICATE">CERTIFICATE</option>
                    <option value="DIPLOMA">DIPLOMA</option>
                    <option value="BACHELORS">BACHELORS</option>
                    <option value="MASTERS">MASTERS</option>
                    <option value="DOCTORATE">DOCTORATE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Total Credits</label>
                  <input
                    type="number"
                    value={programmeForm.totalCredits}
                    onChange={(e) => setProgrammeForm({ ...programmeForm, totalCredits: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={programmeForm.description}
                  onChange={(e) => setProgrammeForm({ ...programmeForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowProgrammeModal(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold">Save Programme</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Certificate */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Issue Conferred Certificate</h3>
              <button onClick={() => setShowCertificateModal(false)} className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer">&times;</button>
            </div>
            <form onSubmit={handleIssueCertificate} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Select Candidate</label>
                <select
                  value={certForm.candidateId}
                  onChange={(e) => {
                    const cand = candidates.find(c => c.id === e.target.value);
                    if (cand) {
                      setCertForm({
                        ...certForm,
                        candidateId: cand.id,
                        candidateNumber: cand.candidateNumber,
                        candidateName: `${cand.firstName} ${cand.lastName}`,
                        programmeId: cand.enrolledProgrammeId,
                        programmeName: cand.enrolledProgrammeName,
                        qualificationTitle: cand.enrolledProgrammeName
                      });
                    }
                  }}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  required
                >
                  <option value="">Select Candidate</option>
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>{c.candidateNumber}: {c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Honors / Classification</label>
                <select
                  value={certForm.honorsClassification}
                  onChange={(e) => setCertForm({ ...certForm, honorsClassification: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="First Class Honors (Distinction)">First Class Honors (Distinction)</option>
                  <option value="Upper Second Class Honors">Upper Second Class Honors</option>
                  <option value="Lower Second Class Honors">Lower Second Class Honors</option>
                  <option value="Pass with Merit">Pass with Merit</option>
                </select>
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button type="button" onClick={() => setShowCertificateModal(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold">Issue &amp; Seal Certificate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
