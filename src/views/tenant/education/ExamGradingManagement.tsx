import React, { useState, useEffect } from 'react';
import { StudentGradeRecord, SchoolClass, Unit, Student } from '../../../types';
import {
  Award, CheckCircle2, AlertCircle, Search, Filter, Plus, Check,
  FileText, Download, Printer, User, BookOpen
} from 'lucide-react';

export const ExamGradingManagement: React.FC = () => {
  const [grades, setGrades] = useState<StudentGradeRecord[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Selection Filters
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [term, setTerm] = useState('Semester 1');

  // Mark Entry Sheet State: { studentId: { catScore: number, examScore: number } }
  const [marksSheet, setMarksSheet] = useState<Record<string, { catScore: string; examScore: string }>>({});
  const [savingGrades, setSavingGrades] = useState(false);

  // Transcript modal
  const [viewingStudentReport, setViewingStudentReport] = useState<Student | null>(null);

  const getHeaders = () => ({
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [resCls, resAcad, resStud, resGrades] = await Promise.all([
        fetch('/api/app/education/classes', { headers: getHeaders() }),
        fetch('/api/app/education/academics', { headers: getHeaders() }),
        fetch('/api/app/education/students', { headers: getHeaders() }),
        fetch('/api/app/education/grades', { headers: getHeaders() })
      ]);

      if (resCls.ok) {
        const cls = await resCls.json();
        setClasses(cls);
        if (cls.length > 0 && !selectedClassId) setSelectedClassId(cls[0].id);
      }
      if (resAcad.ok) {
        const acad = await resAcad.json();
        setUnits(acad.units || []);
        if (acad.units?.length > 0 && !selectedUnitId) setSelectedUnitId(acad.units[0].id);
      }
      if (resStud.ok) setStudents(await resStud.json());
      if (resGrades.ok) setGrades(await resGrades.json());
    } catch (err: any) {
      console.error('Error loading grades:', err);
      setErrorMsg('Failed to load examination records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update marks sheet when grades or class/unit changes
  useEffect(() => {
    if (!selectedUnitId) return;
    const sheet: Record<string, { catScore: string; examScore: string }> = {};
    const classStudents = students.filter(s => !selectedClassId || s.classId === selectedClassId);

    classStudents.forEach(s => {
      const existing = grades.find(g => g.studentId === s.id && g.unitId === selectedUnitId);
      sheet[s.id] = {
        catScore: existing?.catScore !== undefined ? String(existing.catScore) : '',
        examScore: existing?.examScore !== undefined ? String(existing.examScore) : ''
      };
    });
    setMarksSheet(sheet);
  }, [selectedClassId, selectedUnitId, grades, students]);

  // Compute Grade helper
  const calculateGrade = (total: number) => {
    if (total >= 70) return { grade: 'A', gpa: 4.0, remarks: 'DISTINCTION' };
    if (total >= 60) return { grade: 'B', gpa: 3.0, remarks: 'CREDIT' };
    if (total >= 50) return { grade: 'C', gpa: 2.0, remarks: 'PASS' };
    if (total >= 40) return { grade: 'D', gpa: 1.0, remarks: 'SUBSIDIARY PASS' };
    return { grade: 'F', gpa: 0.0, remarks: 'FAIL' };
  };

  const handleSaveGrades = async () => {
    const unit = units.find(u => u.id === selectedUnitId);
    if (!unit) return;

    try {
      setSavingGrades(true);
      setErrorMsg('');

      const classStudents = students.filter(s => !selectedClassId || s.classId === selectedClassId);
      const gradePayloads: Partial<StudentGradeRecord>[] = [];

      classStudents.forEach(s => {
        const entry = marksSheet[s.id];
        if (entry && (entry.catScore || entry.examScore)) {
          const cat = Number(entry.catScore) || 0;
          const exam = Number(entry.examScore) || 0;
          const total = Math.min(100, cat + exam);
          const { grade, gpa, remarks } = calculateGrade(total);

          gradePayloads.push({
            studentId: s.id,
            studentName: s.fullName,
            admissionNo: s.admissionNo,
            unitId: unit.id,
            unitCode: unit.code,
            unitName: unit.name,
            academicYear,
            term,
            catScore: cat,
            examScore: exam,
            totalScore: total,
            grade,
            gradePoint: gpa,
            remarks
          });
        }
      });

      if (gradePayloads.length === 0) {
        setErrorMsg('Please enter CAT or Exam scores for at least one student.');
        setSavingGrades(false);
        return;
      }

      const res = await fetch('/api/app/education/grades', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ grades: gradePayloads })
      });

      if (!res.ok) throw new Error('Failed to record exam grades');

      setSuccessMsg(`Saved marks for ${gradePayloads.length} students in ${unit.code}.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving marks');
    } finally {
      setSavingGrades(false);
    }
  };

  const currentClassStudents = students.filter(s => !selectedClassId || s.classId === selectedClassId);
  const currentUnit = units.find(u => u.id === selectedUnitId);

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span>Examination, Grading & Transcripts Engine</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Continuous Assessment Tests (CATs), Final Examinations, GPA grading, and academic transcripts.
            </p>
          </div>

          <button
            onClick={handleSaveGrades}
            disabled={savingGrades}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>{savingGrades ? 'Submitting Marks...' : 'Save Unit Marks'}</span>
          </button>
        </div>

        {/* Selection Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Select Unit / Subject</label>
            <select
              value={selectedUnitId}
              onChange={e => setSelectedUnitId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
            >
              {units.map(u => (
                <option key={u.id} value={u.id}>{u.code}: {u.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Filter Class / Cohort</label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
            >
              <option value="">-- All Enrolled Students --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Academic Year</label>
            <input
              type="text"
              value={academicYear}
              onChange={e => setAcademicYear(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Semester / Term</label>
            <input
              type="text"
              value={term}
              onChange={e => setTerm(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Marks Entry Sheet */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <span className="font-bold text-slate-900 text-xs">
              Mark Sheet: {currentUnit?.code} - {currentUnit?.name}
            </span>
            <p className="text-[11px] text-slate-500">CAT (Max 30%) + Final Exam (Max 70%) = Total Score (100%)</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 font-mono">
            {currentClassStudents.length} Students Listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/70 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">Admission No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3 w-28">CAT Score (/30)</th>
                <th className="p-3 w-28">Exam Score (/70)</th>
                <th className="p-3 w-24">Total (/100)</th>
                <th className="p-3 w-20">Grade</th>
                <th className="p-3">Remarks</th>
                <th className="p-3 text-right">Transcript</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentClassStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    No students found for this class filter.
                  </td>
                </tr>
              ) : (
                currentClassStudents.map(s => {
                  const item = marksSheet[s.id] || { catScore: '', examScore: '' };
                  const cat = Number(item.catScore) || 0;
                  const exam = Number(item.examScore) || 0;
                  const hasScores = item.catScore !== '' || item.examScore !== '';
                  const total = hasScores ? Math.min(100, cat + exam) : 0;
                  const { grade, remarks } = calculateGrade(total);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-blue-700">{s.admissionNo}</td>
                      <td className="p-3 font-semibold text-slate-900">{s.fullName}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          min="0"
                          max="30"
                          placeholder="0-30"
                          value={item.catScore}
                          onChange={e => {
                            const val = e.target.value;
                            setMarksSheet(prev => ({
                              ...prev,
                              [s.id]: { ...prev[s.id], catScore: val }
                            }));
                          }}
                          className="w-20 p-1.5 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min="0"
                          max="70"
                          placeholder="0-70"
                          value={item.examScore}
                          onChange={e => {
                            const val = e.target.value;
                            setMarksSheet(prev => ({
                              ...prev,
                              [s.id]: { ...prev[s.id], examScore: val }
                            }));
                          }}
                          className="w-20 p-1.5 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900"
                        />
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {hasScores ? total : '-'}
                      </td>
                      <td className="p-3">
                        {hasScores ? (
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                            grade === 'A' || grade === 'B'
                              ? 'bg-emerald-100 text-emerald-800'
                              : grade === 'C' || grade === 'D'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {grade}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="p-3 text-[11px] text-slate-600 font-medium">
                        {hasScores ? remarks : '-'}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setViewingStudentReport(s)}
                          className="text-blue-600 font-semibold hover:underline"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STUDENT TRANSCRIPT REPORT CARD MODAL */}
      {viewingStudentReport && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="border-b border-slate-200 pb-3 flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-slate-900">OFFICIAL STUDENT ACADEMIC TRANSCRIPT</h3>
                <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                  {viewingStudentReport.fullName} • Admission No: {viewingStudentReport.admissionNo}
                </p>
              </div>
              <button onClick={() => setViewingStudentReport(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-600 text-xs py-1">
              <p>Program: <strong className="text-slate-900">{viewingStudentReport.programName}</strong></p>
              <p>Class: <strong className="text-slate-900">{viewingStudentReport.className || 'General'}</strong></p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Unit Code</th>
                    <th className="p-2.5">Unit Name</th>
                    <th className="p-2.5">CAT (/30)</th>
                    <th className="p-2.5">Exam (/70)</th>
                    <th className="p-2.5">Total (/100)</th>
                    <th className="p-2.5">Grade</th>
                    <th className="p-2.5">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {grades.filter(g => g.studentId === viewingStudentReport.id).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-400">
                        No recorded unit grades found for this student.
                      </td>
                    </tr>
                  ) : (
                    grades.filter(g => g.studentId === viewingStudentReport.id).map(g => (
                      <tr key={g.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono font-bold text-blue-700">{g.unitCode}</td>
                        <td className="p-2.5 font-semibold text-slate-900">{g.unitName}</td>
                        <td className="p-2.5 font-mono">{g.catScore}</td>
                        <td className="p-2.5 font-mono">{g.examScore}</td>
                        <td className="p-2.5 font-mono font-bold text-slate-900">{g.totalScore}</td>
                        <td className="p-2.5 font-mono font-bold text-blue-800">{g.grade}</td>
                        <td className="p-2.5 text-[11px] text-slate-600">{g.remarks}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setViewingStudentReport(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Transcript</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
