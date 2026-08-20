import React, { useState, useEffect } from 'react';
import {
  FileCheck, Edit3, CheckCircle, Clock, Award, ShieldAlert,
  Send, ChevronRight, Eye, User, BookOpen, AlertCircle, Save
} from 'lucide-react';
import { ExamScriptRecord, ExaminerProfile } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

export const TemsExaminerPortal: React.FC = () => {
  const { user } = useAuth();
  const [scripts, setScripts] = useState<ExamScriptRecord[]>([]);
  const [selectedScript, setSelectedScript] = useState<ExamScriptRecord | null>(null);
  const [examinerProfile, setExaminerProfile] = useState<ExaminerProfile | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Grading form state
  const [gradedResponses, setGradedResponses] = useState<Record<string, { marksAwarded: number; feedback: string }>>({});
  const [generalFeedback, setGeneralFeedback] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    fetchExaminerData();
  }, [user]);

  const fetchExaminerData = async () => {
    try {
      const [exRes, scRes] = await Promise.all([
        fetch('/api/tems/examiners'),
        fetch('/api/tems/scripts')
      ]);

      const [exData, scData] = await Promise.all([exRes.json(), scRes.json()]);

      if (exData.examiners) {
        const me = exData.examiners.find((e: ExaminerProfile) => e.email === user?.email || e.userId === user?.id) || exData.examiners[0];
        setExaminerProfile(me);
      }

      if (scData.scripts) {
        setScripts(scData.scripts);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenGrading = (script: ExamScriptRecord) => {
    setSelectedScript(script);
    setGeneralFeedback(script.examinerFeedback || '');
    const initial: Record<string, { marksAwarded: number; feedback: string }> = {};
    script.responses.forEach(r => {
      initial[r.questionId] = {
        marksAwarded: r.marksAwarded !== undefined ? r.marksAwarded : 0,
        feedback: r.examinerFeedback || ''
      };
    });
    setGradedResponses(initial);
  };

  const handleSaveMarks = async (submitToModeration: boolean = false) => {
    if (!selectedScript) return;
    setIsSaving(true);

    const responsesPayload = selectedScript.responses.map(r => ({
      questionId: r.questionId,
      marksAwarded: Number(gradedResponses[r.questionId]?.marksAwarded || 0),
      examinerFeedback: gradedResponses[r.questionId]?.feedback || ''
    }));

    try {
      const res = await fetch(`/api/tems/scripts/${selectedScript.id}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: responsesPayload,
          examinerFeedback: generalFeedback,
          examinerId: examinerProfile?.id || 'ex_001',
          examinerName: examinerProfile ? `${examinerProfile.title} ${examinerProfile.firstName} ${examinerProfile.lastName}` : 'Dr. Andrew MacDonald',
          status: submitToModeration ? 'SUBMITTED_FOR_MODERATION' : 'MARKED'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(submitToModeration ? 'Script submitted to External Moderation!' : 'Grading progress saved.');
        setSelectedScript(null);
        fetchExaminerData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const calculateTotalMarksAwarded = () => {
    return Object.values(gradedResponses).reduce((acc: number, curr: { marksAwarded: number; feedback: string }) => acc + (Number(curr.marksAwarded) || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Examiner Welcome & Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xl">
            <Edit3 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-white">
                {examinerProfile ? `${examinerProfile.title} ${examinerProfile.firstName} ${examinerProfile.lastName}` : 'Appointed Theological Examiner'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {examinerProfile?.roleType || 'CHIEF_EXAMINER'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Field: <strong className="text-slate-200">{examinerProfile?.theologicalField || 'Systematic Theology & Biblical Exegesis'}</strong> &bull; Total Scripts: <span className="text-amber-400 font-bold">{scripts.length}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            Pending Grading: <strong className="text-amber-400">{scripts.filter(s => s.status !== 'APPROVED').length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            Approved: <strong className="text-emerald-400">{scripts.filter(s => s.status === 'APPROVED').length}</strong>
          </span>
        </div>
      </div>

      {/* Script Queue */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-amber-400" />
            <span>Assigned Examination Scripts</span>
          </h3>

          <div className="flex gap-2 text-xs">
            {['ALL', 'SUBMITTED', 'ASSIGNED_TO_EXAMINER', 'MARKED', 'SUBMITTED_FOR_MODERATION', 'APPROVED'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${filterStatus === st ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white'}`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4">Script Reference</th>
                <th className="py-3 px-4">Candidate (Double Blind)</th>
                <th className="py-3 px-4">Paper / Unit</th>
                <th className="py-3 px-4">Submission Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Total Score</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {scripts
                .filter(s => filterStatus === 'ALL' || s.status === filterStatus)
                .map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{s.scriptNumber}</td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      <div>{s.candidateName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{s.candidateNumber}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{s.subjectCode}: {s.subjectTitle}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{s.paperCode}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{s.submissionTimestamp ? new Date(s.submissionTimestamp).toLocaleDateString() : 'Active'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        s.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                        s.status === 'SUBMITTED_FOR_MODERATION' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {s.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {s.examinerMark !== undefined ? `${s.examinerMark} / ${s.totalMaxMarks}` : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenGrading(s)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Grade Script &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Script Grading Modal / Workspace */}
      {selectedScript && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold">{selectedScript.scriptNumber}</span>
                <h3 className="text-xl font-bold text-white">{selectedScript.subjectCode}: {selectedScript.subjectTitle}</h3>
                <p className="text-xs text-slate-400">Candidate: {selectedScript.candidateName} ({selectedScript.candidateNumber}) &bull; Total Paper Marks: {selectedScript.totalMaxMarks}</p>
              </div>
              <button
                onClick={() => setSelectedScript(null)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Score Calculator Pill */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Current Examiner Tally: <strong className="text-xl font-bold text-amber-400 ml-2">{calculateTotalMarksAwarded()}</strong> / {selectedScript.totalMaxMarks} Marks
              </div>
              <span className="text-xs text-slate-400">
                Passing Benchmark: {selectedScript.totalMaxMarks * 0.4} Marks (40%)
              </span>
            </div>

            {/* Question by Question Responses and Marking Form */}
            <div className="space-y-6">
              {selectedScript.responses.map((resp, idx) => {
                const currentGrading = gradedResponses[resp.questionId] || { marksAwarded: 0, feedback: '' };
                return (
                  <div key={resp.questionId} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        Question {idx + 1} ({resp.questionType})
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        Max Marks: {resp.allocatedMarks}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-white">
                      {resp.questionPrompt}
                    </div>

                    {/* Candidate's submitted text */}
                    <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed font-serif">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Candidate Answer:</span>
                      {resp.candidateAnswerText || <span className="text-slate-500 italic">No answer provided by candidate.</span>}
                    </div>

                    {/* Grading Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-2">
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Marks Awarded</label>
                        <input
                          type="number"
                          min="0"
                          max={resp.allocatedMarks}
                          value={currentGrading.marksAwarded}
                          onChange={(e) => {
                            setGradedResponses({
                              ...gradedResponses,
                              [resp.questionId]: {
                                ...currentGrading,
                                marksAwarded: Math.min(resp.allocatedMarks, Math.max(0, Number(e.target.value)))
                              }
                            });
                          }}
                          className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="sm:col-span-9">
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Examiner Rubric Remarks / Feedback</label>
                        <input
                          type="text"
                          placeholder="e.g. Excellent exegetical depth, clear biblical references..."
                          value={currentGrading.feedback}
                          onChange={(e) => {
                            setGradedResponses({
                              ...gradedResponses,
                              [resp.questionId]: {
                                ...currentGrading,
                                feedback: e.target.value
                              }
                            });
                          }}
                          className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Overall Examiner Feedback */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase">Overall Examiner Feedback &amp; Synthesis</label>
              <textarea
                rows={3}
                value={generalFeedback}
                onChange={(e) => setGeneralFeedback(e.target.value)}
                placeholder="Summary remarks on overall theological mastery, academic formatting, and recommendation to the External Moderator..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Action Footer */}
            <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedScript(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSaveMarks(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold cursor-pointer flex items-center space-x-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft Marks</span>
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSaveMarks(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold cursor-pointer flex items-center space-x-1.5 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to Moderation Board</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
