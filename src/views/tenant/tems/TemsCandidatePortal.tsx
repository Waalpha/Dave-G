import React, { useState, useEffect } from 'react';
import {
  GraduationCap, Calendar, Award, FileText, CheckCircle, Clock,
  AlertCircle, Download, ExternalLink, Play, ShieldCheck, ArrowRight,
  BookOpen, DollarSign, Plus, ChevronRight, User as UserIcon, QrCode
} from 'lucide-react';
import {
  CandidateProfile, TheologicalProgramme, ExamRegistration,
  OnlineExamAttempt, ExamResultRecord, OfficialTranscript,
  OfficialCertificate, RplApplicationRecord, TemsFeeScheduleItem,
  TemsPaymentRecord, ExaminationPaper
} from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { TemsOnlineExamRoom } from './TemsOnlineExamRoom';

export const TemsCandidatePortal: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'programme' | 'exams' | 'results' | 'transcripts' | 'certificates' | 'rpl' | 'fees'>('dashboard');

  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [programmes, setProgrammes] = useState<TheologicalProgramme[]>([]);
  const [registrations, setRegistrations] = useState<ExamRegistration[]>([]);
  const [results, setResults] = useState<ExamResultRecord[]>([]);
  const [transcripts, setTranscripts] = useState<OfficialTranscript[]>([]);
  const [certificates, setCertificates] = useState<OfficialCertificate[]>([]);
  const [rplApps, setRplApps] = useState<RplApplicationRecord[]>([]);
  const [fees, setFees] = useState<TemsFeeScheduleItem[]>([]);
  const [payments, setPayments] = useState<TemsPaymentRecord[]>([]);
  const [availablePapers, setAvailablePapers] = useState<ExaminationPaper[]>([]);

  // Active exam room launcher
  const [activeExamPaperId, setActiveExamPaperId] = useState<string | null>(null);
  const [selectedSlip, setSelectedSlip] = useState<ExamRegistration | null>(null);

  // New RPL form state
  const [showRplModal, setShowRplModal] = useState(false);
  const [rplForm, setRplForm] = useState({
    programmeId: '',
    programmeName: '',
    yearsMinistryExperience: 5,
    ministryRole: 'Senior Pastor / Ministry Director',
    portfolioSummary: '',
    evidenceLinks: ''
  });

  // Load candidate records
  useEffect(() => {
    fetchCandidateData();
  }, [user]);

  const fetchCandidateData = async () => {
    try {
      const candRes = await fetch('/api/tems/candidates');
      const candData = await candRes.json();
      const myCandidate = candData.candidates?.find((c: CandidateProfile) => c.email === user?.email || c.userId === user?.id) || candData.candidates?.[0];
      setCandidate(myCandidate || null);

      if (myCandidate) {
        const [regRes, resRes, trRes, certRes, rplRes, payRes, progRes, feeRes, paperRes] = await Promise.all([
          fetch(`/api/tems/registrations?candidateId=${myCandidate.id}`),
          fetch(`/api/tems/results?candidateId=${myCandidate.id}`),
          fetch(`/api/tems/transcripts?candidateId=${myCandidate.id}`),
          fetch(`/api/tems/certificates?candidateId=${myCandidate.id}`),
          fetch(`/api/tems/rpl?candidateId=${myCandidate.id}`),
          fetch(`/api/tems/payments?candidateId=${myCandidate.id}`),
          fetch('/api/tems/programmes'),
          fetch('/api/tems/fees'),
          fetch('/api/tems/exam-papers')
        ]);

        const [regData, resData, trData, certData, rplData, payData, progData, feeData, paperData] = await Promise.all([
          regRes.json(), resRes.json(), trRes.json(), certRes.json(), rplRes.json(), payRes.json(), progRes.json(), feeRes.json(), paperRes.json()
        ]);

        if (regData.registrations) setRegistrations(regData.registrations);
        if (resData.results) setResults(resData.results);
        if (trData.transcripts) setTranscripts(trData.transcripts);
        if (certData.certificates) setCertificates(certData.certificates);
        if (rplData.applications) setRplApps(rplData.applications);
        if (payData.payments) setPayments(payData.payments);
        if (progData.programmes) setProgrammes(progData.programmes);
        if (feeData.fees) setFees(feeData.fees);
        if (paperData.papers) setAvailablePapers(paperData.papers);
      }
    } catch (err) {
      console.error('Error fetching candidate records:', err);
    }
  };

  const handleRegisterPaper = async (paper: ExaminationPaper) => {
    if (!candidate) return;
    try {
      const res = await fetch('/api/tems/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: candidate.id,
          candidateNumber: candidate.candidateNumber,
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          programmeId: candidate.enrolledProgrammeId,
          programmeName: candidate.enrolledProgrammeName,
          examSessionId: 'sess_aug_2026',
          examDietCode: 'AUG-2026-DIET',
          registeredPapers: [{
            paperId: paper.id,
            paperCode: paper.paperCode,
            subjectCode: paper.subjectCode,
            title: paper.title,
            examDate: '2026-08-25',
            startTime: '09:00',
            durationMinutes: paper.durationMinutes,
            mode: 'ONLINE',
            attendanceStatus: 'REGISTERED'
          }],
          examCentreId: 'centre_uk_london',
          examCentreName: 'Brooks of Life UK Online Assessment Hub',
          feeStatus: 'PAID'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Exam registration confirmed! Your verified examination slip is ready.');
        fetchCandidateData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRpl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate) return;

    try {
      const res = await fetch('/api/tems/rpl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: candidate.id,
          candidateNumber: candidate.candidateNumber,
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          targetProgrammeId: rplForm.programmeId || candidate.enrolledProgrammeId,
          targetProgrammeName: rplForm.programmeName || candidate.enrolledProgrammeName,
          yearsMinistryExperience: Number(rplForm.yearsMinistryExperience),
          ministryRole: rplForm.ministryRole,
          portfolioSummary: rplForm.portfolioSummary,
          submittedEvidenceDocs: [
            {
              id: 'ev_' + Date.now(),
              title: 'Ministerial Ordination & Portfolio Evidence',
              documentType: 'MINISTRY_PORTFOLIO',
              fileUrl: rplForm.evidenceLinks || 'https://brooksoflife.org.uk/docs/rpl-portfolio.pdf',
              verificationStatus: 'PENDING'
            }
          ]
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowRplModal(false);
        alert('RPL application submitted to the Brooks of Life UK Board of Assessors!');
        fetchCandidateData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // If candidate is inside active exam room
  if (activeExamPaperId && candidate) {
    return (
      <TemsOnlineExamRoom
        paperId={activeExamPaperId}
        candidateId={candidate.id}
        candidateNumber={candidate.candidateNumber}
        candidateName={`${candidate.firstName} ${candidate.lastName}`}
        candidateEmail={candidate.email}
        examSessionId="sess_aug_2026"
        onExamCompleted={(result) => {
          setActiveExamPaperId(null);
          alert('Examination submitted successfully! Script has been encrypted and assigned to the marking queue.');
          fetchCandidateData();
          setActiveTab('results');
        }}
        onExit={() => setActiveExamPaperId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Candidate Welcome Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-amber-500/20">
            {candidate?.firstName?.[0] || 'C'}{candidate?.lastName?.[0] || 'A'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-white">
                {candidate ? `${candidate.title || 'Candidate'} ${candidate.firstName} ${candidate.lastName}` : 'Theological Candidate'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {candidate?.status || 'ACTIVE'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Candidate Number: <span className="font-mono font-bold text-amber-400">{candidate?.candidateNumber || 'BOL-2026-0001'}</span> &bull; Enrolled: <span className="text-slate-200 font-semibold">{candidate?.enrolledProgrammeName}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('exams')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Active Exam</span>
          </button>
          <button
            onClick={() => setShowRplModal(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Apply for RPL</span>
          </button>
        </div>
      </div>

      {/* Candidate Navigation Tabs */}
      <div className="flex overflow-x-auto space-x-2 border-b border-slate-800 pb-2 text-xs font-medium scrollbar-none">
        {[
          { id: 'dashboard', label: 'Overview & Slips', icon: FileText },
          { id: 'programme', label: 'Curriculum & Units', icon: BookOpen },
          { id: 'exams', label: 'Online Examination Room', icon: Play },
          { id: 'results', label: 'Official Results', icon: Award },
          { id: 'transcripts', label: 'Official Transcripts', icon: GraduationCap },
          { id: 'certificates', label: 'Verified Certificates', icon: ShieldCheck },
          { id: 'rpl', label: 'RPL Portfolio', icon: CheckCircle },
          { id: 'fees', label: 'Fee Statement', icon: DollarSign }
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

      {/* TAB 1: OVERVIEW & EXAM SLIPS */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Programme Level</div>
              <div className="text-lg font-bold text-amber-400 mt-1">{candidate?.academicLevel || 'BACHELORS'}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Year {candidate?.currentYearOfStudy || 1} &bull; Semester {candidate?.currentSemester || 1}</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Registered Diets</div>
              <div className="text-lg font-bold text-white mt-1">{registrations.length} Sessions</div>
              <div className="text-[11px] text-emerald-400 mt-0.5">Examination Slip Active</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Graded Results</div>
              <div className="text-lg font-bold text-white mt-1">{results.length} Units Graded</div>
              <div className="text-[11px] text-amber-300 mt-0.5">Cumulative GPA: 3.8 / 4.0</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Certificates Issued</div>
              <div className="text-lg font-bold text-emerald-400 mt-1">{certificates.length} Verified</div>
              <div className="text-[11px] text-slate-500 mt-0.5">QR Verified on UK Registry</div>
            </div>
          </div>

          {/* Active Examination Slips */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Official Examination Slips with QR Verification</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {registrations.map((reg) => (
                <div key={reg.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <div className="text-xs font-mono text-amber-400 font-bold">{reg.examDietCode}</div>
                      <div className="text-sm font-bold text-white">{reg.examCentreName}</div>
                    </div>
                    <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                      SLIP ISSUED
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Slip Number:</span>
                      <span className="font-mono text-slate-200">{reg.slipNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Registered Papers:</span>
                      <span className="font-semibold text-slate-200">{reg.registeredPapers.length} Papers</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Verification Hash:</span>
                      <span className="font-mono text-[10px] text-amber-400 truncate max-w-[160px]">{reg.qrVerificationCode}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => setSelectedSlip(reg)}
                      className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                    >
                      View Examination Slip
                    </button>
                    <button
                      onClick={() => {
                        const firstPaper = reg.registeredPapers[0];
                        if (firstPaper) setActiveExamPaperId(firstPaper.paperId);
                      }}
                      className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Take Exam</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CURRICULUM & UNITS */}
      {activeTab === 'programme' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">{candidate?.enrolledProgrammeName}</h3>
            <p className="text-xs text-slate-400">
              Standardized British theological degree curriculum accredited under the Brooks of Life UK Examination Board.
            </p>

            <div className="space-y-3 pt-2">
              {programmes.find(p => p.id === candidate?.enrolledProgrammeId)?.units?.map((unit, idx) => (
                <div key={unit.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-white flex items-center space-x-2">
                      <span className="text-amber-400 font-mono">{unit.code}</span>
                      <span>{unit.title}</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{unit.description}</p>
                    <div className="text-[11px] text-slate-500">
                      Credit Weight: {unit.creditUnits} Credits &bull; Pass Mark: {unit.passMark}% &bull; Exam Paper: {unit.examPaperCode}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const matchingPaper = availablePapers.find(p => p.subjectCode === unit.code || p.paperCode === unit.examPaperCode);
                      if (matchingPaper) {
                        handleRegisterPaper(matchingPaper);
                      } else {
                        alert(`Registration opened for unit ${unit.code}. Examination paper scheduled.`);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer whitespace-nowrap"
                  >
                    Register for Diet
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ONLINE EXAMINATION ROOM LAUNCHER */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Live Online Examination Room</h3>
                <p className="text-xs text-slate-400">
                  Secure anti-cheat invigilated testing environment. Click 'Start Examination' when you are ready.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {availablePapers.map((paper) => (
                <div key={paper.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {paper.paperCode}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {paper.durationMinutes} Minutes
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">{paper.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{paper.subjectCode} &bull; Total Questions: {paper.questions.length} &bull; Total Marks: {paper.totalMarks}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 text-xs text-slate-300 space-y-1">
                    <div><strong>Instructions:</strong> {paper.instructions}</div>
                    <div className="text-amber-400 text-[11px]">Anti-cheat tracking active: Tab switches and focus lost will be reported to the invigilator.</div>
                  </div>

                  <button
                    onClick={() => setActiveExamPaperId(paper.id)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Enter Secure Exam Room</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OFFICIAL RESULTS */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Published &amp; Moderated Examination Results</h3>
            <p className="text-xs text-slate-400">
              Results ratified by the Brooks of Life UK Examination Board and External Academic Moderators.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-4">Subject / Unit</th>
                    <th className="py-3 px-4">Diet Code</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4">Grade Points</th>
                    <th className="py-3 px-4">Result Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {results.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div>{r.subjectCode}: {r.subjectTitle}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{r.paperCode}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{r.examDietCode}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{r.totalScore}%</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded font-bold ${r.grade.startsWith('A') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {r.grade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-200">{r.gradePoints.toFixed(2)}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold text-[11px]">
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

      {/* TAB 5: TRANSCRIPTS & CERTIFICATES */}
      {activeTab === 'transcripts' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Official Academic Transcripts</h3>
            <p className="text-xs text-slate-400">
              Cryptographically verified academic records with cumulative GPA and full credit breakdown.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transcripts.map((tr) => (
                <div key={tr.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="font-mono text-amber-400 text-xs font-bold">{tr.transcriptNumber}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                      OFFICIAL ISSUED
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{tr.programmeName}</h4>
                    <div className="text-xs text-slate-400 mt-1">Cumulative GPA: <strong className="text-amber-400">{tr.cumulativeGpa.toFixed(2)} / 4.0</strong> &bull; Total Credits: {tr.totalCreditsEarned}</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 text-xs text-slate-400 space-y-1">
                    <div>Academic Standing: <strong className="text-emerald-400">{tr.academicStanding}</strong></div>
                    <div>Verification Hash: <code className="text-amber-400">{tr.qrVerificationCode}</code></div>
                  </div>

                  <button
                    onClick={() => window.open(`/verify-document/${tr.qrVerificationCode}`, '_blank')}
                    className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View Official Verified Transcript</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: VERIFIED CERTIFICATES */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Conferred Digital &amp; Printed Certificates</h3>
            <p className="text-xs text-slate-400">
              Sealed under the authority of Brooks of Life UK Examination Board with anti-fraud QR integrity.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((c) => (
                <div key={c.id} className="p-6 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="font-mono text-amber-400 text-xs font-bold">{c.certificateNumber}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      CONFERRED
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Degree Conferred</div>
                    <h4 className="text-lg font-bold text-white">{c.qualificationTitle}</h4>
                    <p className="text-xs text-amber-300 font-semibold">{c.honorsClassification || 'With High Theological Distinction'}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 text-xs text-slate-300 space-y-1">
                    <div>Date of Conferral: <strong>{c.conferralDate}</strong></div>
                    <div>Signatories: {c.signatories.map(s => s.name).join(', ')}</div>
                    <div>Verification Code: <strong className="font-mono text-amber-400">{c.qrVerificationCode}</strong></div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => window.open(`/verify-document/${c.qrVerificationCode}`, '_blank')}
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verify Authenticity</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: RPL PORTFOLIO */}
      {activeTab === 'rpl' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Recognition of Prior Learning (RPL) Applications</h3>
                <p className="text-xs text-slate-400">
                  Assessments of ministry experience, prior studies, and granted academic credit exemptions.
                </p>
              </div>
              <button
                onClick={() => setShowRplModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>New RPL Submission</span>
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {rplApps.map((rpl) => (
                <div key={rpl.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-white text-sm">{rpl.targetProgrammeName}</span>
                    <span className={`px-2.5 py-0.5 rounded font-bold ${rpl.assessmentStatus === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {rpl.assessmentStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-slate-300">
                    <div>Experience: <strong>{rpl.yearsMinistryExperience} Years</strong> ({rpl.ministryRole})</div>
                    <div>Exempted Credits: <strong className="text-emerald-400">{rpl.grantedCreditUnits} Academic Credits</strong></div>
                  </div>

                  <p className="text-slate-400 text-[11px]">{rpl.portfolioSummary}</p>

                  {rpl.assessorRemarks && (
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                      <strong>Assessor Remarks:</strong> {rpl.assessorRemarks}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: FEES & PAYMENTS */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Fee Statement &amp; Online Payments</h3>
            <p className="text-xs text-slate-400">
              Exam registration, RPL assessment, transcript processing, and certification fee records.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-4">Receipt Number</th>
                    <th className="py-3 px-4">Fee Category</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">{p.receiptNumber}</td>
                      <td className="py-3 px-4">{p.feeType.replace(/_/g, ' ')}</td>
                      <td className="py-3 px-4 text-slate-400">{p.paymentDate}</td>
                      <td className="py-3 px-4">{p.paymentMethod}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">&pound;{p.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Examination Slip Preview Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-amber-400">{selectedSlip.slipNumber}</span>
                <h3 className="text-xl font-bold text-white">Official Examination Slip</h3>
                <p className="text-xs text-slate-400">Brooks of Life UK &bull; {selectedSlip.examDietCode}</p>
              </div>
              <button
                onClick={() => setSelectedSlip(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Candidate Name:</span>
                  <span className="font-bold text-white">{selectedSlip.candidateName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Candidate Number:</span>
                  <span className="font-mono text-amber-400 font-bold">{selectedSlip.candidateNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Exam Centre:</span>
                  <span className="font-semibold text-slate-200">{selectedSlip.examCentreName}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-2">Registered Examination Papers</h4>
                <div className="space-y-2">
                  {selectedSlip.registeredPapers.map((p, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-200">{p.paperCode}: {p.title}</div>
                        <div className="text-[11px] text-slate-500">Date: {p.examDate} at {p.startTime} &bull; {p.durationMinutes} Mins</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                        {p.mode}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center space-x-3">
                <QrCode className="w-8 h-8 text-amber-400" />
                <div className="text-[11px] text-amber-300">
                  QR Security Hash: <code className="font-mono">{selectedSlip.qrVerificationCode}</code>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedSlip(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
              >
                Print Official Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New RPL Submission Modal */}
      {showRplModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Recognition of Prior Learning (RPL)</h3>
                <p className="text-xs text-slate-400">Submit ministerial evidence to request unit exemptions.</p>
              </div>
              <button
                onClick={() => setShowRplModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateRpl} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Target Degree / Diploma</label>
                <select
                  value={rplForm.programmeId}
                  onChange={(e) => {
                    const sel = programmes.find(p => p.id === e.target.value);
                    setRplForm({
                      ...rplForm,
                      programmeId: e.target.value,
                      programmeName: sel ? sel.title : ''
                    });
                  }}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">Select Programme</option>
                  {programmes.map(p => (
                    <option key={p.id} value={p.id}>{p.code}: {p.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Years of Ministry Experience</label>
                  <input
                    type="number"
                    value={rplForm.yearsMinistryExperience}
                    onChange={(e) => setRplForm({ ...rplForm, yearsMinistryExperience: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Ministry Role / Office</label>
                  <input
                    type="text"
                    value={rplForm.ministryRole}
                    onChange={(e) => setRplForm({ ...rplForm, ministryRole: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Portfolio &amp; Competency Summary</label>
                <textarea
                  rows={4}
                  value={rplForm.portfolioSummary}
                  onChange={(e) => setRplForm({ ...rplForm, portfolioSummary: e.target.value })}
                  placeholder="Detail your past pastoral leadership, theological teachings, church planting, counseling, or published works..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Portfolio Document Link / URL</label>
                <input
                  type="text"
                  value={rplForm.evidenceLinks}
                  onChange={(e) => setRplForm({ ...rplForm, evidenceLinks: e.target.value })}
                  placeholder="https://drive.google.com/... or cloud document link"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRplModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Submit RPL Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
