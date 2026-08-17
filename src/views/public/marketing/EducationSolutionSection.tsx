import React from 'react';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar, 
  CreditCard, 
  FileText, 
  Award, 
  Building2, 
  Layers, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface EducationSolutionSectionProps {
  onOpenDemoModal: () => void;
  onExploreModule?: (moduleId: string) => void;
}

export const EducationSolutionSection: React.FC<EducationSolutionSectionProps> = ({
  onOpenDemoModal,
  onExploreModule
}) => {
  const educationFeatures = [
    { title: 'Students', desc: 'Centralized student dossiers, biometric records, and academic status.' },
    { title: 'Staff', desc: 'Faculty profiles, teaching workloads, department heads, and contracts.' },
    { title: 'Departments', desc: 'Multi-faculty organizational tree with designated deans & coordinators.' },
    { title: 'Courses', desc: 'Degree, diploma, certificate, and TVET curriculum definitions.' },
    { title: 'Units', desc: 'Core & elective course units, credit hours, and syllabus tracking.' },
    { title: 'Classes', desc: 'Cohort grouping, student stream rosters, and classroom capacity.' },
    { title: 'Admissions', desc: 'Public online application portal with automated document verification.' },
    { title: 'Attendance', desc: 'Class-by-class roll call, biometric logs, and absentee alerts.' },
    { title: 'Timetable', desc: 'Automated clash-free schedule generation for lecturers and halls.' },
    { title: 'Fees', desc: 'Configurable term-based fee structures per program and student category.' },
    { title: 'Invoices', desc: 'Automated term invoicing, balance carry-forward, and fee statements.' },
    { title: 'Payments', desc: 'Instant M-Pesa Paybill push, bank reconciliations, and receipt slips.' },
    { title: 'Reports', desc: 'Transcripts, exam result slips, graduation lists, and audit logs.' }
  ];

  return (
    <section id="education-showcase" className="py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Higher Ed, TVET & School System</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 uppercase">
              POWERFUL SCHOOL MANAGEMENT
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              A comprehensive academic ERP suite built for modern universities, colleges, TVET institutes, and primary/secondary schools across Africa.
            </p>
          </div>

          <div>
            <button
              onClick={onOpenDemoModal}
              className="px-6 py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center space-x-2 whitespace-nowrap"
            >
              <span>Explore Education ERP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Mockup + Feature List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left: 13 Core Capabilities Grid */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {educationFeatures.map((feat, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-300 transition-all group"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-5 h-5 rounded-md bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {idx + 1}
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                    {feat.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pl-7">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Right: Academic Portal Visual Mockup */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl bg-slate-900 p-3 sm:p-5 border border-slate-800 shadow-2xl text-white space-y-4">
              
              {/* Mockup Header Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-slate-400 font-mono text-[11px] ml-2">portal.university.edu/dashboard</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-blue-600/30 text-blue-400 font-mono text-[10px] font-bold">
                  Academic Year 2026/27 - Term 2
                </span>
              </div>

              {/* Roster & Metrics Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Active Students</div>
                  <div className="text-lg sm:text-xl font-black text-white mt-0.5">3,420</div>
                  <div className="text-[10px] text-emerald-400 font-semibold mt-1">100% Enrolled</div>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Faculty Staff</div>
                  <div className="text-lg sm:text-xl font-black text-white mt-0.5">86</div>
                  <div className="text-[10px] text-blue-400 font-semibold mt-1">12 Departments</div>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Fee Clearance</div>
                  <div className="text-lg sm:text-xl font-black text-white mt-0.5">92.4%</div>
                  <div className="text-[10px] text-indigo-400 font-semibold mt-1">M-Pesa Integrated</div>
                </div>
              </div>

              {/* Sample Timetable & Fees Table */}
              <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/60 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Today's Campus Timetable Schedule</span>
                  </span>
                  <span className="text-[11px] text-blue-400">Live Sync</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div>
                      <div className="font-bold text-white">CSC 302: Distributed Systems Architecture</div>
                      <div className="text-[11px] text-slate-400">Hall 4B • Dr. Kennedy Mwangi • Computer Science</div>
                    </div>
                    <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                      09:00 - 11:00 AM
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div>
                      <div className="font-bold text-white">BBA 204: Financial Accounting II & Taxation</div>
                      <div className="text-[11px] text-slate-400">Auditorium A • Prof. Agnes Korir • Business School</div>
                    </div>
                    <span className="px-2 py-1 rounded-md bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">
                      11:30 - 01:30 PM
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Badge */}
              <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>KNEC, TVET & Higher Education Regulatory Compliant</span>
                </span>
                <button 
                  onClick={onOpenDemoModal}
                  className="text-blue-400 font-bold hover:underline"
                >
                  Book Campus Demo →
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
