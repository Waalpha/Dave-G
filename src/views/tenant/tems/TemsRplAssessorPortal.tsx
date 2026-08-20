import React, { useState, useEffect } from 'react';
import {
  Award, CheckCircle, Clock, FileText, Check, X,
  ExternalLink, UserCheck, BookOpen, AlertCircle
} from 'lucide-react';
import { RplApplicationRecord, TheologicalProgramme } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

export const TemsRplAssessorPortal: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<RplApplicationRecord[]>([]);
  const [selectedApp, setSelectedApp] = useState<RplApplicationRecord | null>(null);
  const [grantedCredits, setGrantedCredits] = useState<number>(12);
  const [assessmentStatus, setAssessmentStatus] = useState<'APPROVED' | 'REJECTED' | 'CONDITIONAL_APPROVAL'>('APPROVED');
  const [remarks, setRemarks] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    fetchRpl();
  }, []);

  const fetchRpl = async () => {
    try {
      const res = await fetch('/api/tems/rpl');
      const data = await res.json();
      if (data.applications) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAssessment = (app: RplApplicationRecord) => {
    setSelectedApp(app);
    setGrantedCredits(app.grantedCreditUnits || 12);
    setAssessmentStatus((app.assessmentStatus as any) || 'APPROVED');
    setRemarks(app.assessorRemarks || 'Verified ministerial competency and prior non-accredited coursework.');
  };

  const handleSaveAssessment = async () => {
    if (!selectedApp) return;
    setIsProcessing(true);

    try {
      const res = await fetch(`/api/tems/rpl/${selectedApp.id}/assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentStatus,
          grantedCreditUnits: Number(grantedCredits),
          assessorRemarks: remarks,
          assessorId: user?.id || 'rpl_001',
          assessorName: user ? `${user.firstName} ${user.lastName}` : 'Dr. Sarah Jenkins (RPL Assessor)'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('RPL Assessment saved and credits awarded!');
        setSelectedApp(null);
        fetchRpl();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xl">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-white">Recognition of Prior Learning (RPL) Board</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Academic Accreditation
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Evaluating ministerial portfolios, pastoral experience, and granting statutory credit exemptions.
            </p>
          </div>
        </div>

        <div className="flex gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            Pending Portfolios: <strong className="text-amber-400">{applications.filter(a => a.assessmentStatus === 'SUBMITTED').length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            Assessed: <strong className="text-emerald-400">{applications.filter(a => a.assessmentStatus === 'APPROVED').length}</strong>
          </span>
        </div>
      </div>

      {/* Applications List */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <UserCheck className="w-5 h-5 text-amber-400" />
          <span>Candidate RPL Portfolios</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Target Programme</th>
                <th className="py-3 px-4">Ministry Experience</th>
                <th className="py-3 px-4">Role / Office</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Granted Credits</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-800/30">
                  <td className="py-3.5 px-4 font-bold text-white">
                    <div>{app.candidateName}</div>
                    <div className="text-[11px] font-mono text-slate-500">{app.candidateNumber}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-200">{app.targetProgrammeName}</td>
                  <td className="py-3.5 px-4 font-bold text-amber-400">{app.yearsMinistryExperience} Years</td>
                  <td className="py-3.5 px-4 text-slate-300">{app.ministryRole}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                      app.assessmentStatus === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                      app.assessmentStatus === 'SUBMITTED' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {app.assessmentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {app.grantedCreditUnits ? `${app.grantedCreditUnits} Credits` : '-'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenAssessment(app)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Audit Portfolio &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assessment Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">RPL Assessment: {selectedApp.candidateName}</h3>
                <p className="text-xs text-slate-400">{selectedApp.targetProgrammeName} &bull; {selectedApp.yearsMinistryExperience} Years Experience</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-slate-400 font-bold uppercase block">Portfolio Summary &amp; Competencies:</span>
                <p className="text-slate-200 leading-relaxed font-serif">{selectedApp.portfolioSummary}</p>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase block mb-2">Submitted Evidentiary Documents:</span>
                <div className="space-y-2">
                  {selectedApp.submittedEvidenceDocs?.map((doc, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-white">{doc.title}</div>
                        <div className="text-[11px] text-slate-500">{doc.documentType}</div>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded bg-slate-800 text-amber-400 font-semibold flex items-center space-x-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Evidence</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Assessment Determination</label>
                    <select
                      value={assessmentStatus}
                      onChange={(e) => setAssessmentStatus(e.target.value as any)}
                      className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold focus:outline-none focus:border-amber-500"
                    >
                      <option value="APPROVED">APPROVED (Full Credit Award)</option>
                      <option value="CONDITIONAL_APPROVAL">CONDITIONAL APPROVAL</option>
                      <option value="REJECTED">REJECTED (Insufficient Evidence)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Academic Credits Awarded</label>
                    <input
                      type="number"
                      value={grantedCredits}
                      onChange={(e) => setGrantedCredits(Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Assessor Official Justification &amp; Remarks</label>
                  <textarea
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSaveAssessment}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
              >
                Ratify &amp; Save Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
