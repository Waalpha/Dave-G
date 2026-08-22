import React, { useState, useMemo, useEffect } from 'react';
import {
  GraduationCap, BookOpen, Building2, MapPin, Users, Award,
  CheckCircle2, ArrowRight, ChevronRight, ChevronLeft, Phone, Mail,
  Calendar, Search, Filter, Sparkles, Send, X, Lock, FileText, Check, Megaphone
} from 'lucide-react';
import { PublicTenantResponse, Program, Department, Campus, TenantHeroSlide } from '../../../types';
import {
  getFontFamilyClass,
  getHeadingSizeClass,
  getSubtitleSizeClass,
  getFontWeightClass
} from '../../../lib/typography';

interface EducationWebsiteTemplateProps {
  data: PublicTenantResponse;
  tenantSlug: string;
  onPortalLogin: () => void;
  onNavigateToMainPlatform?: () => void;
}

export const EducationWebsiteTemplate: React.FC<EducationWebsiteTemplateProps> = ({
  data,
  tenantSlug,
  onPortalLogin,
  onNavigateToMainPlatform
}) => {
  const { tenant, departments = [], programs = [], campuses = [], stats = {} } = data;
  const branding = tenant.branding;
  const website = tenant.publicWebsite;

  const primaryColor = branding?.primaryColor || '#1D53D9';
  const secondaryColor = branding?.secondaryColor || '#F49C10';

  // Hero Slides
  const defaultSlides: TenantHeroSlide[] = [
    {
      id: 'edu_slide_1',
      title: website?.heroTitle || 'Empowering Minds, Shaping Tomorrow',
      subtitle: website?.heroDescription || 'Join our vibrant academic community with accredited programs, modern facilities, and expert faculty.',
      tagline: 'Admissions Open for 2026/2027 Academic Intake',
      badgeText: '🎓 ADMISSIONS OPEN • APPLY ONLINE',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80',
      primaryBtnText: 'Apply for Admission',
      primaryBtnAction: 'apply',
      secondaryBtnText: 'Explore Academic Programs',
      secondaryBtnAction: 'programs',
      alignment: 'center',
      overlayOpacity: 70
    }
  ];

  const heroSlides = website?.heroSlides && website.heroSlides.length > 0 ? website.heroSlides : defaultSlides;
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, (website?.autoSlideInterval || 6) * 1000);
    return () => clearInterval(interval);
  }, [heroSlides.length, website?.autoSlideInterval]);

  // Program Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');

  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.awardType && p.awardType.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchDept = selectedDeptId === 'ALL' || p.departmentId === selectedDeptId;
      return matchSearch && matchDept;
    });
  }, [programs, searchTerm, selectedDeptId]);

  // Admission Application Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [applyForm, setApplyForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'Female',
    dateOfBirth: '2005-01-01',
    programId: '',
    campusId: '',
    guardianName: '',
    guardianPhone: ''
  });
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [applyFeedback, setApplyFeedback] = useState<{ success: boolean; message: string; admissionNo?: string } | null>(null);

  const handleOpenApplyModal = (program?: Program) => {
    setSelectedProgram(program || null);
    setApplyFeedback(null);
    setApplyForm(prev => ({
      ...prev,
      programId: program?.id || (programs[0]?.id || ''),
      campusId: campuses[0]?.id || ''
    }));
    setIsApplyModalOpen(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyForm.fullName.trim() || !applyForm.email.trim() || !applyForm.phone.trim()) return;

    setIsSubmittingApp(true);
    setApplyFeedback(null);

    try {
      const res = await fetch(`/api/public/tenant/${encodeURIComponent(tenantSlug)}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applyForm)
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to submit admission application.');
      }

      setApplyFeedback({
        success: true,
        message: json.message || 'Your application has been received successfully!',
        admissionNo: json.admissionNo
      });
    } catch (err: any) {
      setApplyFeedback({
        success: false,
        message: err.message || 'An error occurred while submitting your application.'
      });
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const activeSlide = heroSlides[activeSlideIndex] || heroSlides[0];
  const slideAlignment = activeSlide.alignment || 'center';

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col ${getFontFamilyClass(website?.typography?.fontFamily)}`}>
      {/* 0. Top Announcement Ribbon */}
      {website?.announcementBarEnabled && (
        <div
          className="py-2 px-4 text-xs font-semibold text-center text-slate-950 flex items-center justify-center space-x-2"
          style={{ backgroundColor: secondaryColor }}
        >
          <Megaphone className="w-3.5 h-3.5 shrink-0" />
          <span>{website?.announcementBarText || 'Admissions are open for the upcoming academic session! Apply online today.'}</span>
          {website?.announcementBarLink && (
            <a href={website.announcementBarLink} className="underline font-bold hover:text-slate-800 ml-1">
              Learn More &rarr;
            </a>
          )}
        </div>
      )}

      {/* 1. Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.companyName || tenant.name} className="h-9 w-auto rounded object-contain" />
            ) : (
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                <GraduationCap className="w-5 h-5" />
              </div>
            )}
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 block">
                {branding?.companyName || tenant.name}
              </span>
              <span className="text-[10px] text-blue-700 font-semibold uppercase tracking-wider block">
                {tenant.educationType || 'Higher Education & TVET'}
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
            <a href="#programs" className="hover:text-blue-700 transition-colors">Academic Programs</a>
            <a href="#departments" className="hover:text-blue-700 transition-colors">Departments</a>
            <a href="#campuses" className="hover:text-blue-700 transition-colors">Campuses</a>
            <a href="#contact" className="hover:text-blue-700 transition-colors">Contact Us</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleOpenApplyModal()}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900 transition-colors cursor-pointer"
              style={{ backgroundColor: secondaryColor }}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Apply Online</span>
            </button>

            <button
              onClick={onPortalLogin}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Student / Staff Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative bg-slate-900 text-white py-20 sm:py-28 overflow-hidden min-h-[460px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
          style={{
            backgroundImage: `url(${activeSlide.imageUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80'})`
          }}
        >
          <div
            className="absolute inset-0 bg-slate-950"
            style={{ opacity: (activeSlide.overlayOpacity ?? 75) / 100 }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div
            className={`w-full max-w-3xl space-y-4 ${
              slideAlignment === 'center'
                ? 'mx-auto text-center items-center flex flex-col'
                : slideAlignment === 'right'
                ? 'ml-auto text-right items-end flex flex-col'
                : 'text-left items-start flex flex-col'
            }`}
          >
            {activeSlide.badgeText && (
              <span
                className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-slate-900 shadow-sm"
                style={{ backgroundColor: secondaryColor }}
              >
                <span>{activeSlide.badgeText}</span>
              </span>
            )}

            <h1
              className={`text-white leading-tight ${getFontFamilyClass(activeSlide.fontFamily || website?.typography?.fontFamily)} ${getHeadingSizeClass(activeSlide.titleFontSize || website?.typography?.headingSize)} ${getFontWeightClass(activeSlide.titleFontWeight || website?.typography?.headingWeight)} ${activeSlide.titleItalic ? 'italic' : ''}`}
            >
              {activeSlide.title}
            </h1>

            <p
              className={`text-slate-200 max-w-2xl leading-relaxed ${getSubtitleSizeClass(activeSlide.subtitleFontSize || website?.typography?.bodySize)} ${activeSlide.subtitleItalic ? 'italic' : ''}`}
            >
              {activeSlide.subtitle || website?.heroDescription || 'Providing excellence in education, professional diplomas, and research.'}
            </p>

            <div
              className={`pt-3 flex flex-wrap items-center gap-3 ${
                slideAlignment === 'center'
                  ? 'justify-center'
                  : slideAlignment === 'right'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <button
                onClick={() => handleOpenApplyModal()}
                className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-900 transition-transform active:scale-95 shadow-md flex items-center space-x-2 cursor-pointer"
                style={{ backgroundColor: secondaryColor }}
              >
                <span>{activeSlide.primaryBtnText || 'Apply for Admission'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#programs"
                className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 transition-colors"
              >
                {activeSlide.secondaryBtnText || 'Explore Programs'}
              </a>
            </div>
          </div>
        </div>

        {/* Carousel Slide Indicators */}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-4 inset-x-0 flex items-center justify-center space-x-2 z-20">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlideIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  activeSlideIndex === idx ? 'w-8 bg-blue-500' : 'w-2 bg-white/50 hover:bg-white'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. Academic Programs */}
      <section id="programs" className="py-14 bg-slate-100 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Curriculum & Intake</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Academic Programs & Courses
              </h2>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedDeptId('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                selectedDeptId === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              All Departments ({programs.length})
            </button>
            {departments.map((dept) => {
              const count = programs.filter((p) => p.departmentId === dept.id).length;
              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDeptId(dept.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                    selectedDeptId === dept.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {dept.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Program Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPrograms.map((prog) => (
              <div key={prog.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-400 font-bold">{prog.code}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                      {prog.awardType || 'Diploma / Certificate'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{prog.name}</h3>
                  <p className="text-xs text-slate-500">
                    Duration: <strong>{prog.durationYears || 2} Years ({prog.totalSemesters || 6} Semesters)</strong>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    KSh {(prog.tuitionFeePerTerm || 35000).toLocaleString()} / Term
                  </span>
                  <button
                    onClick={() => handleOpenApplyModal(prog)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer id="contact" className="bg-slate-950 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© {new Date().getFullYear()} {branding?.companyName || tenant.name}. All rights reserved.</span>
          <span>Powered by Davetech Cloud ERP</span>
        </div>
      </footer>

      {/* Admission Application Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative">
            <button onClick={() => setIsApplyModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Student Admission Application</h3>
              <p className="text-xs text-slate-500">Apply for the 2026/2027 academic intake.</p>
            </div>

            {applyFeedback ? (
              <div className={`p-4 rounded-xl text-xs space-y-2 ${applyFeedback.success ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
                <div className="font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Admission Number: {applyFeedback.admissionNo}</span>
                </div>
                <p>{applyFeedback.message}</p>
                <button onClick={() => setIsApplyModalOpen(false)} className="w-full py-1.5 bg-slate-900 text-white rounded-lg font-bold mt-2">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Applicant Name *</label>
                  <input
                    type="text"
                    required
                    value={applyForm.fullName}
                    onChange={(e) => setApplyForm({ ...applyForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="e.g. John Mutua"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={applyForm.email}
                      onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      placeholder="applicant@email.com"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={applyForm.phone}
                      onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      placeholder="+254 700 000 000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Program of Choice</label>
                  <select
                    value={applyForm.programId}
                    onChange={(e) => setApplyForm({ ...applyForm, programId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setIsApplyModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg font-bold">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmittingApp} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">
                    {isSubmittingApp ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
