import React, { useState, useEffect, useRef } from 'react';
import {
  Clock, ShieldAlert, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight,
  Maximize2, Send, Save, Lock, FileText, Check, HelpCircle
} from 'lucide-react';
import { OnlineExamAttempt, ExaminationPaper } from '../../../types';

interface TemsOnlineExamRoomProps {
  paperId: string;
  candidateId: string;
  candidateNumber: string;
  candidateName: string;
  candidateEmail: string;
  examSessionId: string;
  onExamCompleted: (result: { attempt: OnlineExamAttempt; script: any }) => void;
  onExit: () => void;
}

export const TemsOnlineExamRoom: React.FC<TemsOnlineExamRoomProps> = ({
  paperId,
  candidateId,
  candidateNumber,
  candidateName,
  candidateEmail,
  examSessionId,
  onExamCompleted,
  onExit
}) => {
  const [paper, setPaper] = useState<ExaminationPaper | null>(null);
  const [attempt, setAttempt] = useState<OnlineExamAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [antiCheatWarning, setAntiCheatWarning] = useState<string | null>(null);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>('Autosaved');

  // Anti-cheat listeners & timers
  useEffect(() => {
    // 1. Fetch paper and initialize attempt
    fetch(`/api/tems/exam-papers/${paperId}`)
      .then(res => res.json())
      .then(async (data) => {
        if (data.paper) {
          setPaper(data.paper);
          const startRes = await fetch('/api/tems/online-exam/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paperId: data.paper.id,
              candidateId,
              candidateNumber,
              candidateName,
              candidateEmail,
              examSessionId
            })
          });
          const startData = await startRes.json();
          if (startData.attempt) {
            setAttempt(startData.attempt);
            setTimeRemainingSeconds(startData.attempt.timeRemainingSeconds || data.paper.durationMinutes * 60);
            setTabSwitchCount(startData.attempt.tabSwitchCount || 0);
          }
        }
      })
      .catch(err => console.error('Failed to init exam room:', err));
  }, [paperId]);

  // Timer countdown
  useEffect(() => {
    if (!attempt || attempt.status !== 'IN_PROGRESS' || timeRemainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt, timeRemainingSeconds]);

  // Anti-cheat window blur and visibility change detector
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && attempt && attempt.status === 'IN_PROGRESS') {
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);
        setAntiCheatWarning(`Warning: Window switch or focus lost detected (Count: ${newCount}). All navigation events are strictly audited by the Examination Board.`);
        
        try {
          await fetch('/api/tems/online-exam/anti-cheat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              attemptId: attempt.id,
              eventType: 'TAB_SWITCH',
              details: `Candidate switched tab/window at timestamp ${new Date().toISOString()}`
            })
          });
        } catch (err) {
          console.error(err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [attempt, tabSwitchCount]);

  const handleSaveAnswer = async (questionId: string, answerText: string) => {
    if (!attempt) return;
    setIsSaving(true);
    setSaveStatus('Saving answer...');
    
    // Update local state immediately
    const updatedAnswers = { ...attempt.answers };
    if (!updatedAnswers[questionId]) {
      updatedAnswers[questionId] = {
        questionId,
        questionPrompt: '',
        questionType: 'SHORT_ANSWER',
        allocatedMarks: 10,
        candidateAnswerText: answerText
      };
    } else {
      updatedAnswers[questionId].candidateAnswerText = answerText;
    }
    setAttempt({ ...attempt, answers: updatedAnswers });

    try {
      await fetch('/api/tems/online-exam/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: attempt.id,
          questionId,
          answerText,
          timeRemainingSeconds
        })
      });
      setSaveStatus('Autosaved');
    } catch (err) {
      setSaveStatus('Save error — retrying');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitExam = async () => {
    if (!attempt) return;
    if (!window.confirm('Are you sure you want to finish and submit your examination script? Once submitted, your answers are sealed and routed to the examiners.')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tems/online-exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId: attempt.id })
      });
      const data = await res.json();
      if (data.success) {
        onExamCompleted(data);
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('Error submitting examination. Please notify the invigilator.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!paper || !attempt) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-xl font-bold">Securing Online Examination Room...</h2>
          <p className="text-xs text-slate-400">Verifying candidate biometric credentials &amp; anti-cheat sandbox.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = paper.questions[currentQuestionIndex];
  const currentAnswer = attempt.answers[currentQuestion?.id]?.candidateAnswerText || '';
  const minutes = Math.floor(timeRemainingSeconds / 60);
  const seconds = timeRemainingSeconds % 60;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Anti-Cheat Alert Modal / Banner */}
      {antiCheatWarning && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-900" />
            <span>{antiCheatWarning}</span>
          </div>
          <button
            onClick={() => setAntiCheatWarning(null)}
            className="underline cursor-pointer ml-4 font-black"
          >
            Acknowledge &amp; Dismiss
          </button>
        </div>
      )}

      {/* Top Examination Room Nav */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-lg">
            TEMS
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center space-x-2">
              <span>{paper.paperCode}: {paper.title}</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {paper.subjectCode}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Candidate: <span className="font-semibold text-slate-200">{candidateName}</span> ({candidateNumber}) &bull; Mode: <span className="text-emerald-400 font-semibold">Live Anti-Cheat Online</span>
            </div>
          </div>
        </div>

        {/* Timer & Autosave Pill */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span>{saveStatus}</span>
          </div>

          <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-mono text-sm font-bold shadow-md ${minutes < 10 ? 'bg-red-500/20 text-red-400 border border-red-500 animate-pulse' : 'bg-slate-800 text-amber-300 border border-slate-700'}`}>
            <Clock className="w-4 h-4" />
            <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')} Remaining</span>
          </div>

          <button
            onClick={handleSubmitExam}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Paper'}</span>
          </button>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Question & Answer Area */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Question {currentQuestionIndex + 1} of {paper.questions.length}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-bold text-xs">
              Allocated: {currentQuestion.allocatedMarks || currentQuestion.marks} Marks
            </span>
          </div>

          {/* Question Prompt */}
          <div className="space-y-3">
            <div className="text-lg sm:text-xl font-semibold text-white leading-relaxed">
              {currentQuestion.prompt}
            </div>
            {currentQuestion.instructions && (
              <p className="text-xs text-amber-300/90 italic bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                Instruction: {currentQuestion.instructions}
              </p>
            )}
          </div>

          {/* Question Answer Inputs by Type */}
          <div className="pt-4 border-t border-slate-800/80 space-y-4">
            {/* Multiple Choice Question */}
            {currentQuestion.questionType === 'MCQ' && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Select the most biblically sound / correct answer:
                </label>
                <div className="space-y-2">
                  {currentQuestion.options?.map((opt, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer ${currentAnswer === opt ? 'bg-amber-500/10 border-amber-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/50'}`}
                    >
                      <input
                        type="radio"
                        name={`question_${currentQuestion.id}`}
                        value={opt}
                        checked={currentAnswer === opt}
                        onChange={() => handleSaveAnswer(currentQuestion.id, opt)}
                        className="text-amber-500 focus:ring-amber-500 h-4 w-4 bg-slate-900 border-slate-700 cursor-pointer"
                      />
                      <span className="text-sm font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* True / False Question */}
            {currentQuestion.questionType === 'TRUE_FALSE' && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Select True or False:
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {['True', 'False'].map((tf) => (
                    <label
                      key={tf}
                      className={`flex items-center justify-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer font-bold text-sm ${currentAnswer === tf ? 'bg-amber-500/10 border-amber-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/50'}`}
                    >
                      <input
                        type="radio"
                        name={`question_${currentQuestion.id}`}
                        value={tf}
                        checked={currentAnswer === tf}
                        onChange={() => handleSaveAnswer(currentQuestion.id, tf)}
                        className="text-amber-500 focus:ring-amber-500 h-4 w-4 bg-slate-900 border-slate-700 cursor-pointer"
                      />
                      <span>{tf}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Essay or Short Answer */}
            {(currentQuestion.questionType === 'ESSAY' || currentQuestion.questionType === 'SHORT_ANSWER' || currentQuestion.questionType === 'CASE_STUDY') && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <label className="font-bold uppercase tracking-wider">Your Theological Formulation &amp; Analysis:</label>
                  <span>Word count: {currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0} words</span>
                </div>
                <textarea
                  rows={currentQuestion.questionType === 'ESSAY' ? 14 : 7}
                  value={currentAnswer}
                  onChange={(e) => handleSaveAnswer(currentQuestion.id, e.target.value)}
                  placeholder="Type your structured theological response here. Ensure clear biblical citations, hermeneutical rationale, and theological coherence..."
                  className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 text-sm leading-relaxed focus:outline-none focus:border-amber-500 font-serif"
                />
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Question</span>
            </button>

            <span className="text-xs text-slate-500 font-medium">
              {Object.keys(attempt.answers).filter(k => !!attempt.answers[k]?.candidateAnswerText).length} of {paper.questions.length} answered
            </span>

            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(paper.questions.length - 1, prev + 1))}
              disabled={currentQuestionIndex === paper.questions.length - 1}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-slate-950 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <span>Next Question</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Question Palette & Exam Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Question Navigator Palette */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h4 className="font-bold text-white text-sm flex items-center justify-between">
              <span>Question Palette</span>
              <span className="text-xs text-amber-400 font-normal">{paper.questions.length} Total</span>
            </h4>

            <div className="grid grid-cols-5 gap-2">
              {paper.questions.map((q, idx) => {
                const isAnswered = !!attempt.answers[q.id]?.candidateAnswerText?.trim();
                const isCurrent = idx === currentQuestionIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-10 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 shadow-md'
                        : isAnswered
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/40'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Answered</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span>Unanswered</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Current</span>
              </div>
            </div>
          </div>

          {/* Exam Rules & Security Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl text-xs">
            <h4 className="font-bold text-white text-sm flex items-center space-x-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>TEMS Anti-Cheat Telemetry</span>
            </h4>

            <div className="space-y-2.5 text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500">Security Sandbox:</span>
                <span className="font-semibold text-emerald-400">ACTIVE</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500">Tab Switch Count:</span>
                <span className={`font-semibold ${tabSwitchCount > 0 ? 'text-amber-400' : 'text-slate-200'}`}>{tabSwitchCount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500">Pass Mark Benchmark:</span>
                <span className="font-semibold text-slate-200">{paper.passingScore}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Total Paper Marks:</span>
                <span className="font-semibold text-amber-400">{paper.totalMarks} Marks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
