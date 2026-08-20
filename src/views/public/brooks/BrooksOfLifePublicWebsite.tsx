import React, { useState, useEffect } from 'react';
import {
  BookOpen, Tv, Award, ShieldCheck, CheckCircle, GraduationCap,
  Calendar, MapPin, Users, Play, Clock, Search, ArrowRight,
  FileCheck, Globe, Star, Mail, Phone, ExternalLink, ChevronRight,
  Sparkles, Video, Compass, Layers, AlertCircle
} from 'lucide-react';
import {
  TheologicalProgramme, ExaminationSession, TVScheduleItem,
  MediaContentItem, MinistryEventRecord, TheologicalArticleRecord,
  TemsFeeScheduleItem, CertificateVerificationLookupResult
} from '../../../types';

interface BrooksOfLifePublicWebsiteProps {
  onNavigateToLogin: () => void;
  onNavigateToVerification?: (code?: string) => void;
  onCandidateRegister?: () => void;
  onRplApply?: () => void;
}

export const BrooksOfLifePublicWebsite: React.FC<BrooksOfLifePublicWebsiteProps> = ({
  onNavigateToLogin,
  onNavigateToVerification,
  onCandidateRegister,
  onRplApply
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'programmes' | 'tems' | 'tv' | 'rpl' | 'verify' | 'events' | 'articles'>('home');
  const [programmes, setProgrammes] = useState<TheologicalProgramme[]>([]);
  const [sessions, setSessions] = useState<ExaminationSession[]>([]);
  const [tvSchedule, setTvSchedule] = useState<TVScheduleItem[]>([]);
  const [mediaList, setMediaList] = useState<MediaContentItem[]>([]);
  const [events, setEvents] = useState<MinistryEventRecord[]>([]);
  const [articles, setArticles] = useState<TheologicalArticleRecord[]>([]);
  const [fees, setFees] = useState<TemsFeeScheduleItem[]>([]);
  const [selectedProgramme, setSelectedProgramme] = useState<TheologicalProgramme | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaContentItem | null>(null);
  const [mediaFilter, setMediaFilter] = useState<string>('ALL');

  // Verification state
  const [verifyCode, setVerifyCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<CertificateVerificationLookupResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Load public info
  useEffect(() => {
    fetch('/api/tems/public-info')
      .then(res => res.json())
      .then(data => {
        if (data.programmes) setProgrammes(data.programmes);
        if (data.sessions) setSessions(data.sessions);
        if (data.tvSchedule) setTvSchedule(data.tvSchedule);
        if (data.media) {
          setMediaList(data.media);
          if (data.media.length > 0) setSelectedMedia(data.media[0]);
        }
        if (data.events) setEvents(data.events);
        if (data.articles) setArticles(data.articles);
        if (data.fees) setFees(data.fees);
      })
      .catch(err => console.error('Failed to load public info:', err));
  }, []);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!verifyCode.trim()) return;
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/tems/verify/${encodeURIComponent(verifyCode.trim())}`);
      const data = await res.json();
      setVerificationResult(data);
    } catch (err) {
      console.error('Verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-amber-50 text-xs px-4 py-2 text-center font-medium flex items-center justify-center space-x-3">
        <span className="flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-semibold">Brooks of Life UK</span>
        </span>
        <span className="hidden sm:inline">|</span>
        <span className="hidden sm:inline">
          August / September 2026 Theological Examination Diet Registrations & RPL Applications Now Open
        </span>
        <button
          onClick={onNavigateToLogin}
          className="ml-2 underline font-bold hover:text-white transition-colors cursor-pointer"
        >
          Candidate / Staff Portal &rarr;
        </button>
      </div>

      {/* Main Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-2xl tracking-tighter">
              BL
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-white flex items-center space-x-2">
                <span>Brooks of Life UK</span>
              </div>
              <p className="text-xs text-amber-400/90 font-medium tracking-wide">
                Theological Examination & Christian Media
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${activeTab === 'home' ? 'text-amber-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'}`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('programmes')}
              className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${activeTab === 'programmes' ? 'text-amber-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'}`}
            >
              Academic Programmes
            </button>
            <button
              onClick={() => setActiveTab('tems')}
              className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${activeTab === 'tems' ? 'text-amber-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'}`}
            >
              TEMS Examinations
            </button>
            <button
              onClick={() => setActiveTab('rpl')}
              className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${activeTab === 'rpl' ? 'text-amber-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'}`}
            >
              RPL Accreditation
            </button>
            <button
              onClick={() => setActiveTab('tv')}
              className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 ${activeTab === 'tv' ? 'text-red-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'}`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
              <span>Brooks of Life TV</span>
            </button>
            <button
              onClick={() => setActiveTab('verify')}
              className={`px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${activeTab === 'verify' ? 'text-amber-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'}`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verification</span>
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('verify')}
              className="hidden lg:flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-amber-400" />
              <span>Verify Certificate</span>
            </button>
            <button
              onClick={onNavigateToLogin}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              Sign In to Portal
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {activeTab === 'home' && (
        <div>
          {/* Hero Section */}
          <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800/80">
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500 via-slate-950 to-slate-950" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide uppercase">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Brooks of Life UK &bull; Theological Board &bull; TV Broadcast</span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                    Advancing Truth, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
                      Equipping Leaders,
                    </span> <br />
                    Broadcasting Faith.
                  </h1>

                  <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
                    Brooks of Life UK is a premier institution dedicated to academic theological excellence, standardized ministerial assessment, Recognition of Prior Learning (RPL), and Christian media broadcasting across the United Kingdom and global diaspora.
                  </p>

                  <div className="flex flex-wrap gap-4 pt-4">
                    <button
                      onClick={() => setActiveTab('programmes')}
                      className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center space-x-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                    >
                      <GraduationCap className="w-5 h-5" />
                      <span>Explore Programmes</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('tv')}
                      className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700 font-bold text-sm flex items-center space-x-2 transition-all cursor-pointer"
                    >
                      <Tv className="w-5 h-5 text-red-400" />
                      <span>Watch Brooks of Life TV</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('verify')}
                      className="px-6 py-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-amber-300 border border-amber-500/30 font-semibold text-sm flex items-center space-x-2 transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span>Verify Certificate</span>
                    </button>
                  </div>

                  {/* Trust Badges */}
                  <div className="pt-8 grid grid-cols-3 gap-6 border-t border-slate-800/80">
                    <div>
                      <div className="text-2xl font-black text-amber-400">100%</div>
                      <div className="text-xs text-slate-400">Standardized Theological Rigour</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-white">QR &amp; Cryptographic</div>
                      <div className="text-xs text-slate-400">Tamper-Proof Verification</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-amber-400">24 / 7</div>
                      <div className="text-xs text-slate-400">Brooks of Life TV Broadcast</div>
                    </div>
                  </div>
                </div>

                {/* Right Hero Visual Card */}
                <div className="lg:col-span-5">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        <h3 className="font-bold text-white text-sm">Official Institutional Registry</h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        UK Registered
                      </span>
                    </div>

                    <div className="py-5 space-y-4">
                      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Theological Body</div>
                        <div className="text-sm font-bold text-slate-100 mt-0.5">Brooks of Life UK — Examination Council</div>
                        <p className="text-xs text-slate-400 mt-1">Regulating high-calibre Biblical doctrine, ethics, pastoral care, and systematic theology examinations.</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Media Channel</div>
                        <div className="text-sm font-bold text-amber-300 mt-0.5">Brooks of Life TV — “For Your Christian Vibes”</div>
                        <p className="text-xs text-slate-400 mt-1">Uplifting gospel sermons, worship live streams, theological symposia, and youth talk shows.</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Accreditation &amp; RPL Pathway</div>
                        <div className="text-sm font-bold text-slate-100 mt-0.5">Recognition of Prior Learning (RPL)</div>
                        <p className="text-xs text-slate-400 mt-1">Formal academic credits awarded for proven ministerial experience and prior theological studies.</p>
                      </div>
                    </div>

                    <button
                      onClick={onNavigateToLogin}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <span>Access Examination Portal (TEMS)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Institutional Pillars */}
          <section className="py-16 bg-slate-900/40 border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
                <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Institutional Pillars</span>
                <h2 className="text-3xl font-extrabold text-white">Why Leaders Choose Brooks of Life UK</h2>
                <p className="text-slate-400 text-sm">
                  Integrated examination management, standardized grading rubrics, external moderation, and verifiable digital credentials.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Theological Examination Management (TEMS)</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    End-to-end exam cycles from syllabus syllabus generation, question bank vetting, invigilated diets, double-blind marking, and external moderation.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Recognition of Prior Learning (RPL)</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Comprehensive competency mapping for pastors, church planters, and ministry executives to convert years of proven experience into academic exemptions.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4">
                    <Tv className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Brooks of Life TV Broadcast</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    “For Your Christian Vibes” — 24/7 continuous digital broadcast featuring biblical analysis, praise &amp; worship, theological documentaries, and live services.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Certificate Verification Callout Banner */}
          <section className="py-12 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-slate-950/80 rounded-2xl border border-amber-500/30 p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start space-x-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Official Registry Verification</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Instant Academic Certificate Verification</h3>
                  <p className="text-slate-400 text-sm max-w-xl">
                    Churches, educational institutions, and employers can independently verify the authenticity of any Brooks of Life UK certificate or transcript record.
                  </p>
                </div>

                <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <input
                    type="text"
                    placeholder="Enter Certificate / Trans Script Code (e.g. BOL-VRF-49102)"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 w-full sm:w-80"
                  />
                  <button
                    type="submit"
                    onClick={() => {
                      if (verifyCode.trim()) setActiveTab('verify');
                    }}
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer whitespace-nowrap"
                  >
                    Verify Now
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Academic Programmes View */}
      {activeTab === 'programmes' && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Academic Offerings</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Theological Degrees &amp; Diplomas</h2>
            <p className="text-slate-400 text-sm">
              Standardized curricula developed under British theological benchmarks and biblical orthodoxy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programmes.map((prog) => (
              <div
                key={prog.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between hover:border-amber-500/50 transition-all shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {prog.level}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{prog.code}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white">{prog.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{prog.description}</p>

                  <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Duration:</span>
                      <span className="font-semibold">{prog.durationMonths} Months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Credits:</span>
                      <span className="font-semibold">{prog.totalCredits} Credits</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Department:</span>
                      <span className="font-semibold">{prog.departmentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Curriculum Units:</span>
                      <span className="font-semibold">{prog.units?.length || 0} Core Units</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-800 flex gap-2">
                  <button
                    onClick={() => setSelectedProgramme(prog)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    View Syllabus
                  </button>
                  <button
                    onClick={onNavigateToLogin}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Programme Syllabus Modal */}
          {selectedProgramme && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-mono text-amber-400">{selectedProgramme.code}</span>
                    <h3 className="text-xl font-bold text-white">{selectedProgramme.title}</h3>
                    <p className="text-xs text-slate-400">{selectedProgramme.level} &bull; {selectedProgramme.totalCredits} Academic Credits</p>
                  </div>
                  <button
                    onClick={() => setSelectedProgramme(null)}
                    className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
                  >
                    &times;
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-200 mb-2">Programme Overview</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedProgramme.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-200 mb-3">Core Curriculum Units</h4>
                  <div className="space-y-2">
                    {selectedProgramme.units?.map((u) => (
                      <div key={u.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-100">{u.code}: {u.title}</div>
                          <div className="text-[11px] text-slate-400">Exam Paper: {u.examPaperCode || 'Standard Diet'} &bull; Pass Mark: {u.passMark}%</div>
                        </div>
                        <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 font-bold">
                          {u.creditUnits} Credits
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedProgramme(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProgramme(null);
                      onNavigateToLogin();
                    }}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                  >
                    Register as Candidate
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* TEMS Examination Diets & Information */}
      {activeTab === 'tems' && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">TEMS Examination Diets</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Theological Examination Management System</h2>
            <p className="text-slate-400 text-sm">
              Standardized examination sessions, physical invigilation centres in the UK, and secure anti-cheat online examination rooms.
            </p>
          </div>

          {/* Active Examination Sessions */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>Upcoming &amp; Scheduled Examination Diets</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sessions.map((sess) => (
                <div key={sess.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {sess.dietCode}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${sess.status === 'REGISTRATION_OPEN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {sess.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white">{sess.title}</h4>
                  <p className="text-xs text-slate-400">{sess.academicYear} Academic Cycle &bull; Managed by Brooks of Life UK Examination Board</p>

                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-800 text-xs">
                    <div>
                      <div className="text-slate-500">Registration Deadline:</div>
                      <div className="font-semibold text-slate-200">{sess.registrationDeadline}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Exam Period:</div>
                      <div className="font-semibold text-slate-200">{sess.startDate} to {sess.endDate}</div>
                    </div>
                  </div>

                  <button
                    onClick={onNavigateToLogin}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition-all cursor-pointer"
                  >
                    Register for this Exam Diet
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Fee Schedules */}
          <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">Standardized Examination &amp; Certification Fees</h3>
                <p className="text-xs text-slate-400">All fees are set in British Pounds Sterling (GBP &pound;) with secure online processing.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-4">Fee Category</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Academic Level</th>
                    <th className="py-3 px-4 text-right">Standard Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {fees.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-bold text-white">{f.feeType.replace(/_/g, ' ')}</td>
                      <td className="py-3 px-4 text-slate-400">{f.description}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px]">
                          {f.academicLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-400">
                        {f.currencySymbol}{f.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Recognition of Prior Learning (RPL) */}
      {activeTab === 'rpl' && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">RPL Assessment Gateway</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Recognition of Prior Learning (RPL)</h2>
            <p className="text-slate-400 text-sm">
              We formally assess ministry leadership, church planting, biblical counseling, and non-accredited Bible college coursework against British theological credit benchmarks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">1</div>
              <h3 className="text-lg font-bold text-white">Portfolio Submission</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Submit your ministerial resume, ordination certificates, sermon transcripts, published theological works, and verification letters.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">2</div>
              <h3 className="text-lg font-bold text-white">Assessor Evaluation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Brooks of Life UK appointed academic assessors map your submitted competencies directly to target degree units.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">3</div>
              <h3 className="text-lg font-bold text-white">Credit Exemption Award</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive an official Certificate of Prior Learning Credit Recognition, reducing examination and coursework requirements.
              </p>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-amber-950/30 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Ready to Fast-Track Your Theological Qualification?</h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Create an account or sign in to submit your RPL documentation directly to the Board of Assessors.
              </p>
            </div>
            <button
              onClick={onNavigateToLogin}
              className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 whitespace-nowrap cursor-pointer"
            >
              Start RPL Application
            </button>
          </div>
        </section>
      )}

      {/* Brooks of Life TV & Christian Vibes Broadcast */}
      {activeTab === 'tv' && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
              <Tv className="w-3.5 h-3.5" />
              <span>Brooks of Life TV &bull; For Your Christian Vibes</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">24/7 Christian Media &amp; Ministry Broadcast</h2>
            <p className="text-slate-400 text-sm">
              Live sermon broadcasts, theological talk shows, gospel worship vibes, and documentary features.
            </p>
          </div>

          {/* TV Player and Guide Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Live / Video Player Container */}
            <div className="lg:col-span-8 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl space-y-4">
              <div className="relative aspect-video bg-black flex items-center justify-center group">
                <img
                  src={selectedMedia?.thumbnailUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80"}
                  alt="Broadcast Stream"
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity"
                />
                <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>ON AIR &bull; BROOKS OF LIFE TV</span>
                </div>
                <button
                  onClick={() => alert(`Now playing: ${selectedMedia?.title || 'Brooks of Life Live Feed'}`)}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
                >
                  <Play className="w-8 h-8 ml-1 fill-current" />
                </button>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {selectedMedia?.category || 'THEOLOGY_LECTURE'}
                  </span>
                  <span className="text-xs text-slate-400">{selectedMedia?.durationMinutes || 45} mins</span>
                </div>
                <h3 className="text-2xl font-bold text-white">{selectedMedia?.title || 'Live Theological Broadcast Stream'}</h3>
                <p className="text-sm text-slate-400">{selectedMedia?.description || 'Broadcasting live across the UK and international digital streaming platforms.'}</p>
                <div className="text-xs text-amber-300 font-semibold pt-2 border-t border-slate-800">
                  Featured Speaker / Minister: {selectedMedia?.speakerMinister || 'Brooks of Life Faculty Council'}
                </div>
              </div>
            </div>

            {/* 24/7 TV Guide Schedule */}
            <div className="lg:col-span-4 rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="font-bold text-white flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Today's Broadcasting Guide</span>
                </h4>
                <span className="text-[11px] text-amber-400 font-mono">GMT (London)</span>
              </div>

              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {tvSchedule.map((prog) => (
                  <div
                    key={prog.id}
                    className={`p-3 rounded-xl border text-xs transition-all ${prog.isLiveNow ? 'bg-amber-500/10 border-amber-500/40 text-amber-200' : 'bg-slate-950 border-slate-800 text-slate-300'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-amber-400 font-bold">{prog.startTime} - {prog.endTime}</span>
                      {prog.isLiveNow && (
                        <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-bold text-[10px] animate-pulse">
                          LIVE NOW
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-white">{prog.programmeTitle}</div>
                    <div className="text-[11px] text-slate-400">{prog.hostOrSpeaker} &bull; {prog.category}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* On-Demand Christian Vibes & Sermon Library */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-white">On-Demand Media &amp; Christian Vibes</h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {['ALL', 'SERMON', 'THEOLOGY_LECTURE', 'PRAISE_WORSHIP', 'YOUTH_TALK', 'CONFERENCE'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMediaFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${mediaFilter === cat ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mediaList
                .filter(m => mediaFilter === 'ALL' || m.category === mediaFilter)
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMedia(item)}
                    className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden group cursor-pointer hover:border-amber-500/50 transition-all"
                  >
                    <div className="relative aspect-video bg-slate-950 overflow-hidden">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent opacity-80" />
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px]">
                        {item.durationMinutes}m
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">{item.category}</span>
                      <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">{item.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                      <div className="text-[11px] text-slate-500 pt-2 flex justify-between">
                        <span>{item.speakerMinister}</span>
                        <span>{item.viewsCount} views</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Official Certificate & Document Verification View */}
      {activeTab === 'verify' && (
        <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Brooks of Life Official Central Registry</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Document &amp; Certificate Verification</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Verify the authenticity of Brooks of Life UK academic certificates, transcripts, and examination registration slips in real time.
            </p>
          </div>

          {/* Search Box */}
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <form onSubmit={handleVerify} className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Enter Verification Code or Certificate Number
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="e.g. BOL-VRF-49102 or BOL-CERT-2026-0001"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  className="flex-1 px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  {isVerifying ? 'Searching Registry...' : 'Verify Authenticity'}
                </button>
              </div>
            </form>

            <div className="text-xs text-slate-400 flex flex-wrap gap-2 items-center">
              <span className="text-slate-500">Quick Test Examples:</span>
              <button
                type="button"
                onClick={() => {
                  setVerifyCode('BOL-VRF-49102');
                }}
                className="underline hover:text-amber-400 cursor-pointer font-mono"
              >
                BOL-VRF-49102 (BTh Certificate)
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => {
                  setVerifyCode('BOL-TR-89201');
                }}
                className="underline hover:text-amber-400 cursor-pointer font-mono"
              >
                BOL-TR-89201 (Official Transcript)
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => {
                  setVerifyCode('REG-BOL-2026-8801');
                }}
                className="underline hover:text-amber-400 cursor-pointer font-mono"
              >
                REG-BOL-2026-8801 (Exam Slip)
              </button>
            </div>
          </div>

          {/* Verification Result Card */}
          {verificationResult && (
            <div className={`p-8 rounded-2xl border shadow-2xl space-y-6 ${verificationResult.verified ? 'bg-slate-900/90 border-emerald-500/50' : 'bg-red-950/20 border-red-500/50'}`}>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  {verificationResult.verified ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {verificationResult.verified ? 'Verified Official Record' : 'Record Not Verified'}
                    </h3>
                    <p className="text-xs text-slate-400">{verificationResult.remarks}</p>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold ${verificationResult.verified ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                  {verificationResult.status}
                </span>
              </div>

              {verificationResult.verified && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block mb-1">Candidate Name:</span>
                    <span className="text-sm font-bold text-white">{verificationResult.candidateName}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block mb-1">Qualification / Award:</span>
                    <span className="text-sm font-bold text-amber-300">{verificationResult.qualificationTitle || verificationResult.programmeName}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block mb-1">Document Number:</span>
                    <span className="font-mono text-slate-200 font-semibold">{verificationResult.documentNumber}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block mb-1">Date of Conferral / Issue:</span>
                    <span className="text-slate-200 font-semibold">{verificationResult.conferralDate || verificationResult.issueDate}</span>
                  </div>

                  {verificationResult.honorsClassification && (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 sm:col-span-2">
                      <span className="text-slate-500 block mb-1">Honors / Classification:</span>
                      <span className="text-emerald-400 font-bold text-sm">{verificationResult.honorsClassification}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="text-[11px] text-slate-500 text-center pt-2">
                Validated against Brooks of Life UK Cryptographic Registry &bull; Verified at {new Date(verificationResult.verificationTimestamp).toLocaleString()}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-900 text-xs">
            {/* Brand column */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-lg">
                  BL
                </div>
                <span className="text-base font-bold text-white">Brooks of Life UK</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Professional Christian media, theological education, examination, assessment, and certification organization.
              </p>
              <div className="text-slate-500">
                London &bull; United Kingdom
              </div>
            </div>

            {/* Academic Navigation */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider">Theological Education</h4>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => setActiveTab('programmes')} className="hover:text-amber-400 cursor-pointer">Certificate in Biblical Studies</button></li>
                <li><button onClick={() => setActiveTab('programmes')} className="hover:text-amber-400 cursor-pointer">Diploma in Christian Ministry</button></li>
                <li><button onClick={() => setActiveTab('programmes')} className="hover:text-amber-400 cursor-pointer">Bachelor of Theology (B.Th)</button></li>
                <li><button onClick={() => setActiveTab('programmes')} className="hover:text-amber-400 cursor-pointer">Master of Divinity (M.Div)</button></li>
                <li><button onClick={() => setActiveTab('rpl')} className="hover:text-amber-400 cursor-pointer">Recognition of Prior Learning (RPL)</button></li>
              </ul>
            </div>

            {/* TEMS & Verification */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider">TEMS &amp; Registry</h4>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => setActiveTab('tems')} className="hover:text-amber-400 cursor-pointer">Examination Diets &amp; Sessions</button></li>
                <li><button onClick={() => setActiveTab('verify')} className="hover:text-amber-400 cursor-pointer">Certificate Verification Portal</button></li>
                <li><button onClick={onNavigateToLogin} className="hover:text-amber-400 cursor-pointer">Candidate Exam Portal</button></li>
                <li><button onClick={onNavigateToLogin} className="hover:text-amber-400 cursor-pointer">Examiner &amp; Moderator Login</button></li>
                <li><button onClick={() => setActiveTab('tv')} className="hover:text-amber-400 cursor-pointer">Brooks of Life TV Schedule</button></li>
              </ul>
            </div>

            {/* Contact & Legal */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider">UK Headquarters</h4>
              <p className="text-slate-400 leading-relaxed">
                Brooks of Life UK — Examination Council &amp; Media Studios<br />
                United Kingdom
              </p>
              <div className="pt-2">
                <button
                  onClick={onNavigateToLogin}
                  className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 font-semibold cursor-pointer transition-colors"
                >
                  Portal Sign In &rarr;
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div>
              &copy; {new Date().getFullYear()} Brooks of Life UK. All rights reserved. Registered in the United Kingdom.
            </div>
            <div className="flex space-x-6">
              <span>Theological Examination Management System (TEMS)</span>
              <span>Brooks of Life TV</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
