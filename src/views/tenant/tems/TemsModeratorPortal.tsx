import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CheckCircle2, AlertTriangle, Eye, Check, X,
  FileText, Award, Scale, MessageSquare
} from 'lucide-react';
import { ExamScriptRecord } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

export const TemsModeratorPortal: React.FC = () => {
  const { user } = useAuth();
  const [scripts, setScripts] = useState<ExamScriptRecord[]>([]);
  const [selectedScript, setSelectedScript] = useState<ExamScriptRecord | null>(null);
  const [moderatorMark, setModeratorMark] = useState<number>(0);
  const [moderatorNotes, setModeratorNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    try {
      const res = await fetch('/api/tems/scripts');
      const data = await res.json();
      if (data.scripts) {
        setScripts(data.scripts);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModeration = (script: ExamScriptRecord) => {
    setSelectedScript(script);
    setModeratorMark(script.moderatorMark !== undefined ? script.moderatorMark : (script.examinerMark || 0));
    setModeratorNotes(script.moderatorNotes || 'Approved following standard quality benchmark.');
  };

  const handleModerate = async (approved: boolean) => {
    if (!selectedScript) return;
    setIsProcessing(true);

    try {
      const res = await fetch(`/api/tems/scripts/${selectedScript.id}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moderatorMark: Number(moderatorMark),
          moderatorNotes,
          moderatorId: user?.id || 'mod_001',
          moderatorName: user ? `${user.firstName} ${user.lastName}` : 'Prof. Elizabeth Jenkins',
          status: approved ? 'APPROVED' : 'MARKED'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(approved ? 'Script successfully moderated and approved! Result generated.' : 'Script returned to examiner for remarking.');
        setSelectedScript(null);
        fetchScripts();
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
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold text-xl">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-white">External Academic Moderation</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                Quality Assurance
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Validating grading integrity, rubric compliance, and standard deviations across UK examination diets.
            </p>
          </div>
        </div>

        <div className="flex gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            Pending Moderation: <strong className="text-purple-400">{scripts.filter(s => s.status === 'SUBMITTED_FOR_MODERATION').length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            Ratified: <strong className="text-emerald-400">{scripts.filter(s => s.status === 'APPROVED').length}</strong>
          </span>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <span>Theological Examination Moderation Queue</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4">Script Number</th>
                <th className="py-3 px-4">Candidate Number</th>
                <th className="py-3 px-4">Subject / Paper</th>
                <th className="py-3 px-4">First Examiner</th>
                <th className="py-3 px-4">Examiner Score</th>
                <th className="py-3 px-4">Moderation Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {scripts.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30">
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{s.scriptNumber}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{s.candidateNumber}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{s.subjectCode}: {s.subjectTitle}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{s.paperCode}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-300">{s.firstExaminerName || 'Appointed Examiner'}</td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {s.examinerMark !== undefined ? `${s.examinerMark} / ${s.totalMaxMarks}` : '-'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                      s.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                      s.status === 'SUBMITTED_FOR_MODERATION' ? 'bg-purple-500/20 text-purple-400 animate-pulse' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {s.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenModeration(s)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Audit &amp; Moderate &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderation Detail Modal */}
      {selectedScript && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-purple-400 font-bold">{selectedScript.scriptNumber}</span>
                <h3 className="text-xl font-bold text-white">{selectedScript.subjectCode}: {selectedScript.subjectTitle}</h3>
                <p className="text-xs text-slate-400">Examiner: {selectedScript.firstExaminerName} &bull; Initial Examiner Mark: <strong className="text-amber-400">{selectedScript.examinerMark} / {selectedScript.totalMaxMarks}</strong></p>
              </div>
              <button
                onClick={() => setSelectedScript(null)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Question Breakdown and Examiner comments */}
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm">Examiner Breakdown by Question</h4>
              <div className="space-y-3">
                {selectedScript.responses.map((resp, idx) => (
                  <div key={resp.questionId} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-amber-400">Question {idx + 1} ({resp.allocatedMarks} Marks)</span>
                      <span className="font-bold text-white">Awarded: {resp.marksAwarded} Marks</span>
                    </div>
                    <div className="font-semibold text-slate-200">{resp.questionPrompt}</div>
                    <div className="p-3 rounded bg-slate-900 text-slate-300 font-serif leading-relaxed">
                      {resp.candidateAnswerText || <span className="text-slate-500 italic">No answer provided.</span>}
                    </div>
                    {resp.examinerFeedback && (
                      <div className="text-[11px] text-amber-300/90 italic">
                        Examiner Note: {resp.examinerFeedback}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Moderation Controls */}
            <div className="p-5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-4">
              <h4 className="font-bold text-purple-300 text-sm flex items-center space-x-2">
                <Scale className="w-4 h-4" />
                <span>Moderator Final Determination</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Ratified Final Score (Out of {selectedScript.totalMaxMarks})</label>
                  <input
                    type="number"
                    min="0"
                    max={selectedScript.totalMaxMarks}
                    value={moderatorMark}
                    onChange={(e) => setModeratorMark(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Moderator Audit &amp; Quality Notes</label>
                  <input
                    type="text"
                    value={moderatorNotes}
                    onChange={(e) => setModeratorNotes(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedScript(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleModerate(false)}
                className="px-4 py-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/40 hover:bg-red-600/30 text-xs font-bold cursor-pointer flex items-center space-x-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Return for Remarking</span>
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleModerate(true)}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white text-xs font-bold cursor-pointer flex items-center space-x-1.5 shadow-md"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Ratify &amp; Finalize Result</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
