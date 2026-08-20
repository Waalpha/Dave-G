import React, { useState } from 'react';
import {
  GraduationCap, BookOpen, FileCheck, Award, Scale,
  UserCheck, Tv, ShieldCheck, Play, Users, DollarSign
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { TemsCandidatePortal } from './TemsCandidatePortal';
import { TemsExaminerPortal } from './TemsExaminerPortal';
import { TemsModeratorPortal } from './TemsModeratorPortal';
import { TemsRplAssessorPortal } from './TemsRplAssessorPortal';
import { TemsAdminDashboard } from './TemsAdminDashboard';
import { BrooksOfLifeMediaStudio } from './BrooksOfLifeMediaStudio';

interface TemsHubViewProps {
  initialRoleView?: 'candidate' | 'examiner' | 'moderator' | 'rpl' | 'admin' | 'media';
}

export const TemsHubView: React.FC<TemsHubViewProps> = ({ initialRoleView }) => {
  const { user, tenant } = useAuth();

  // Determine starting view by user role
  const getDefaultRoleView = (): 'candidate' | 'examiner' | 'moderator' | 'rpl' | 'admin' | 'media' => {
    if (initialRoleView) return initialRoleView;
    if (user?.role === 'CANDIDATE') return 'candidate';
    if (user?.role === 'EXAMINER') return 'examiner';
    if (user?.role === 'MODERATOR') return 'moderator';
    if (user?.role === 'RPL_ASSESSOR') return 'rpl';
    if (user?.role === 'MEDIA_ADMIN') return 'media';
    return 'admin';
  };

  const [activeRoleView, setActiveRoleView] = useState<'candidate' | 'examiner' | 'moderator' | 'rpl' | 'admin' | 'media'>(getDefaultRoleView);

  return (
    <div className="space-y-6">
      {/* Role Switcher Toolbar for Staff & Admin context */}
      {(user?.role === 'TENANT_ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'EXAMINATION_OFFICER' || user?.role === 'EXAMINER' || user?.role === 'MODERATOR') && (
        <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 px-2 text-slate-400 font-semibold">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Brooks of Life UK — Departmental Workspace Switcher:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveRoleView('admin')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeRoleView === 'admin' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>TEMS Administration</span>
            </button>

            <button
              onClick={() => setActiveRoleView('candidate')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeRoleView === 'candidate' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Candidate Portal</span>
            </button>

            <button
              onClick={() => setActiveRoleView('examiner')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeRoleView === 'examiner' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Examiner Marking</span>
            </button>

            <button
              onClick={() => setActiveRoleView('moderator')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeRoleView === 'moderator' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>External Moderation</span>
            </button>

            <button
              onClick={() => setActiveRoleView('rpl')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeRoleView === 'rpl' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>RPL Assessment</span>
            </button>

            <button
              onClick={() => setActiveRoleView('media')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeRoleView === 'media' ? 'bg-red-600 text-white shadow-md' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Brooks of Life TV Studio</span>
            </button>
          </div>
        </div>
      )}

      {/* Render Active Role View */}
      {activeRoleView === 'candidate' && <TemsCandidatePortal />}
      {activeRoleView === 'examiner' && <TemsExaminerPortal />}
      {activeRoleView === 'moderator' && <TemsModeratorPortal />}
      {activeRoleView === 'rpl' && <TemsRplAssessorPortal />}
      {activeRoleView === 'admin' && <TemsAdminDashboard />}
      {activeRoleView === 'media' && <BrooksOfLifeMediaStudio />}
    </div>
  );
};
