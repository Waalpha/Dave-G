import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { Student, AcademicTranscript, AcademicCertificate, AdmissionLetter } from '../../../../types';
import {
  FileText, Award, GraduationCap, Plus, Search, Eye,
  Printer, CheckCircle2, ShieldCheck, Download, RefreshCw, AlertCircle
} from 'lucide-react';
import QRCode from 'qrcode';

export const TranscriptsCertificatesManager: React.FC = () => {
  const { user, tenant } = useAuth();
  const [docTab, setDocTab] = useState<'transcripts' | 'certificates' | 'admissions'>('transcripts');

  const [students, setStudents] = useState<Student[]>([]);
  const [transcripts, setTranscripts] = useState<AcademicTranscript[]>([]);
  const [certificates, setCertificates] = useState<AcademicCertificate[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionLetter[]>([]);
  const [loading, setLoading] = useState(true);

  // Issue modal state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueStudentId, setIssueStudentId] = useState('');
  const [issueAwardType, setIssueAwardType] = useState<any>('DIPLOMA');
  const [issueAwardTitle, setIssueAwardTitle] = useState('');
  const [issueClassification, setIssueClassification] = useState('Credit');
  const [issueIntake, setIssueIntake] = useState('September 2026');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Document preview state
  const [previewDoc, setPreviewDoc] = useState<{
    type: 'transcript' | 'certificate' | 'admission';
    data: any;
    qrUrl?: string;
  } | null>(null);

  const getHeaders = () => ({
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'Content-Type': 'application/json'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resStud, resTr, resCert, resAdm] = await Promise.all([
        fetch('/api/app/education/students', { headers: getHeaders() }),
        fetch('/api/app/education/transcripts', { headers: getHeaders() }),
        fetch('/api/app/education/certificates', { headers: getHeaders() }),
        fetch('/api/app/education/admission-letters', { headers: getHeaders() })
      ]);

      if (resStud.ok) {
        const sList = await resStud.json();
        setStudents(sList || []);
        if (sList?.length > 0 && !issueStudentId) setIssueStudentId(sList[0].id);
      }
      if (resTr.ok) setTranscripts(await resTr.json().catch(() => []));
      if (resCert.ok) setCertificates(await resCert.json().catch(() => []));
      if (resAdm.ok) setAdmissions(await resAdm.json().catch(() => []));
    } catch (e) {
      console.error('Error fetching document records:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleIssueDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueStudentId) return;

    setIsSubmitting(true);
    try {
      let endpoint = '/api/app/education/transcripts/generate';
      let payload: any = { studentId: issueStudentId };

      if (docTab === 'certificates') {
        endpoint = '/api/app/education/certificates/generate';
        payload = {
          studentId: issueStudentId,
          awardType: issueAwardType,
          awardTitle: issueAwardTitle || undefined,
          classification: issueClassification
        };
      } else if (docTab === 'admissions') {
        endpoint = '/api/app/education/admission-letters/generate';
        payload = {
          studentId: issueStudentId,
          intake: issueIntake
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const doc = await res.json();
        setIsIssueModalOpen(false);
        fetchData();
        handleOpenPreview(docTab === 'transcripts' ? 'transcript' : (docTab === 'certificates' ? 'certificate' : 'admission'), doc);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to issue document');
      }
    } catch (e: any) {
      alert(e.message || 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenPreview = async (type: 'transcript' | 'certificate' | 'admission', docData: any) => {
    const qrUrl = await QRCode.toDataURL(docData.verificationUrl || `https://davetech-erp.app/verify-document/${docData.verificationCode}`);
    setPreviewDoc({ type, data: docData, qrUrl });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="font-bold text-base text-slate-900">Official Document Registry & Generation</h3>
          <p className="text-xs text-slate-500">
            Issue, verify, and print tamper-proof Academic Transcripts, Graduation Certificates, and Admission Letters with QR authenticity codes.
          </p>
        </div>

        <button
          onClick={() => setIsIssueModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Issue New {docTab === 'transcripts' ? 'Transcript' : (docTab === 'certificates' ? 'Certificate' : 'Admission Letter')}</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setDocTab('transcripts')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-colors cursor-pointer ${
            docTab === 'transcripts' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Academic Transcripts ({transcripts.length})</span>
        </button>

        <button
          onClick={() => setDocTab('certificates')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-colors cursor-pointer ${
            docTab === 'certificates' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Graduation Certificates ({certificates.length})</span>
        </button>

        <button
          onClick={() => setDocTab('admissions')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-colors cursor-pointer ${
            docTab === 'admissions' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Admission Letters ({admissions.length})</span>
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-medium">Loading document archives...</p>
        </div>
      )}

      {/* TRANSCRIPTS TABLE */}
      {!loading && docTab === 'transcripts' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Doc Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Admission No</th>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4 text-center">GPA</th>
                <th className="py-3 px-4">Standing</th>
                <th className="py-3 px-4">Verification Code</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transcripts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No academic transcripts issued yet. Click "Issue New Transcript" above.
                  </td>
                </tr>
              ) : (
                transcripts.map((t: AcademicTranscript) => (
                  <tr key={t.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{t.documentNumber}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{t.studentName}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{t.admissionNo}</td>
                    <td className="py-3 px-4 text-slate-600">{t.programName}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-blue-800">{t.gpa}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded-md text-[10px]">
                        {t.academicStanding}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-500">{t.verificationCode}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenPreview('transcript', t)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        View & Print
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CERTIFICATES TABLE */}
      {!loading && docTab === 'certificates' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Cert Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Admission No</th>
                <th className="py-3 px-4">Award Title</th>
                <th className="py-3 px-4">Award Type</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {certificates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No academic certificates issued yet. Click "Issue New Certificate" above.
                  </td>
                </tr>
              ) : (
                certificates.map((c: AcademicCertificate) => (
                  <tr key={c.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">{c.certificateNumber}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{c.studentName}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{c.admissionNo}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{c.awardTitle}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{c.awardType}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-semibold rounded-md text-[10px]">
                        {c.classification}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{c.issueDate}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenPreview('certificate', c)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        View & Print
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ADMISSION LETTERS TABLE */}
      {!loading && docTab === 'admissions' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Letter Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Admission No</th>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4">Intake</th>
                <th className="py-3 px-4">Reporting Date</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No admission letters generated yet. Click "Issue New Admission Letter" above.
                  </td>
                </tr>
              ) : (
                admissions.map((l: AdmissionLetter) => (
                  <tr key={l.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">{l.letterNumber}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{l.studentName}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{l.admissionNo}</td>
                    <td className="py-3 px-4 text-slate-600">{l.programName}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{l.intake}</td>
                    <td className="py-3 px-4 text-slate-600">{l.reportingDate}</td>
                    <td className="py-3 px-4 text-slate-600">{l.issueDate}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenPreview('admission', l)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        View & Print
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ISSUE MODAL */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
              <h3 className="font-semibold text-sm">
                Issue Official {docTab === 'transcripts' ? 'Academic Transcript' : (docTab === 'certificates' ? 'Certificate' : 'Admission Letter')}
              </h3>
              <button onClick={() => setIsIssueModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueDocument} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Select Student *</label>
                <select
                  required
                  value={issueStudentId}
                  onChange={e => setIssueStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.admissionNo}) - {s.programName}
                    </option>
                  ))}
                </select>
              </div>

              {docTab === 'certificates' && (
                <>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Award Type</label>
                    <select
                      value={issueAwardType}
                      onChange={e => setIssueAwardType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="DEGREE">Bachelor Degree</option>
                      <option value="DIPLOMA">Diploma</option>
                      <option value="HIGHER_DIPLOMA">Higher National Diploma</option>
                      <option value="CERTIFICATE">Certificate</option>
                      <option value="VOCATIONAL_AWARD">Vocational Competency Award</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Classification / Honors</label>
                    <select
                      value={issueClassification}
                      onChange={e => setIssueClassification(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="First Class Honours / Distinction">First Class Honours / Distinction</option>
                      <option value="Second Class Honours (Upper) / Credit">Second Class Honours (Upper) / Credit</option>
                      <option value="Second Class Honours (Lower) / Pass">Second Class Honours (Lower) / Pass</option>
                      <option value="Pass">Pass</option>
                    </select>
                  </div>
                </>
              )}

              {docTab === 'admissions' && (
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Intake / Semester</label>
                  <input
                    type="text"
                    value={issueIntake}
                    onChange={e => setIssueIntake(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              )}

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
                >
                  {isSubmitting ? 'Generating...' : 'Confirm & Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-sm">
                  {previewDoc.type === 'transcript' && 'Official Academic Transcript'}
                  {previewDoc.type === 'certificate' && 'Official Academic Award Certificate'}
                  {previewDoc.type === 'admission' && 'Official Admission Letter'}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Document Printable Body */}
            <div className="p-8 sm:p-12 space-y-6 text-slate-900 bg-white">
              {/* TRANSCRIPT VIEW */}
              {previewDoc.type === 'transcript' && (
                <div className="space-y-6">
                  <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                    <h2 className="text-xl font-black uppercase tracking-wider text-slate-950">
                      {tenant?.name || 'Academic Institution'}
                    </h2>
                    <p className="text-xs text-slate-600 font-medium">OFFICE OF THE REGISTRAR (ACADEMIC AFFAIRS)</p>
                    <div className="text-sm font-bold uppercase tracking-widest text-blue-900 pt-2">
                      Official Academic Transcript
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <div><span className="text-slate-500">Student Name:</span> <strong className="text-slate-900">{previewDoc.data.studentName}</strong></div>
                      <div><span className="text-slate-500">Admission No:</span> <strong className="font-mono text-slate-900">{previewDoc.data.admissionNo}</strong></div>
                      <div><span className="text-slate-500">Program:</span> <strong className="text-slate-900">{previewDoc.data.programName}</strong></div>
                    </div>
                    <div>
                      <div><span className="text-slate-500">Doc Number:</span> <strong className="font-mono text-blue-700">{previewDoc.data.documentNumber}</strong></div>
                      <div><span className="text-slate-500">Issue Date:</span> <strong className="text-slate-900">{previewDoc.data.issuedAt?.split('T')[0]}</strong></div>
                      <div><span className="text-slate-500">Academic Standing:</span> <strong className="text-emerald-700">{previewDoc.data.academicStanding}</strong></div>
                    </div>
                  </div>

                  <table className="w-full text-left text-xs border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                        <th className="py-2 px-3 border-r border-slate-300">Code</th>
                        <th className="py-2 px-3 border-r border-slate-300">Unit Title</th>
                        <th className="py-2 px-2 text-center border-r border-slate-300">Credits</th>
                        <th className="py-2 px-2 text-center border-r border-slate-300">CAT</th>
                        <th className="py-2 px-2 text-center border-r border-slate-300">Exam</th>
                        <th className="py-2 px-2 text-center border-r border-slate-300">Total %</th>
                        <th className="py-2 px-2 text-center border-r border-slate-300">Grade</th>
                        <th className="py-2 px-2 text-center border-r border-slate-300">GP</th>
                        <th className="py-2 px-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {previewDoc.data.units?.map((u: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-1.5 px-3 font-mono font-semibold border-r border-slate-200">{u.unitCode}</td>
                          <td className="py-1.5 px-3 border-r border-slate-200">{u.unitName}</td>
                          <td className="py-1.5 px-2 text-center font-mono border-r border-slate-200">{u.creditHours || 3}</td>
                          <td className="py-1.5 px-2 text-center font-mono border-r border-slate-200">{u.catScore}</td>
                          <td className="py-1.5 px-2 text-center font-mono border-r border-slate-200">{u.examScore}</td>
                          <td className="py-1.5 px-2 text-center font-mono font-bold border-r border-slate-200">{u.totalScore}%</td>
                          <td className="py-1.5 px-2 text-center font-bold font-mono border-r border-slate-200">{u.grade}</td>
                          <td className="py-1.5 px-2 text-center font-mono border-r border-slate-200">{u.gradePoints}</td>
                          <td className="py-1.5 px-3 text-slate-600">{u.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t-2 border-slate-900">
                    <div className="flex items-center space-x-4">
                      {previewDoc.qrUrl && (
                        <img src={previewDoc.qrUrl} alt="QR" className="w-20 h-20 border border-slate-300 rounded-lg p-1 bg-white" />
                      )}
                      <div className="text-[11px] text-slate-600">
                        <div className="font-bold text-slate-900">Official Document Verification</div>
                        <div className="font-mono text-[10px] text-blue-700">Code: {previewDoc.data.verificationCode}</div>
                        <div>Scan to verify institutional authenticity.</div>
                      </div>
                    </div>

                    <div className="text-right space-y-1 text-xs">
                      <div className="text-sm font-bold text-slate-900">
                        Cumulative GPA: <span className="font-mono text-blue-800 text-base">{previewDoc.data.gpa}</span> / 4.00
                      </div>
                      <div className="pt-4 border-t border-slate-300 font-semibold text-slate-700">
                        Authorized Registrar Signature & Seal
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CERTIFICATE VIEW */}
              {previewDoc.type === 'certificate' && (
                <div className="border-8 border-double border-slate-900 p-8 sm:p-12 text-center space-y-6 bg-amber-50/20 rounded-xl relative">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black uppercase tracking-wider text-slate-950">
                      {tenant?.name || 'Academic Institution'}
                    </h2>
                    <p className="text-xs uppercase tracking-widest text-slate-600 font-semibold">
                      COUNCIL & SENATE OF THE INSTITUTION
                    </p>
                  </div>

                  <p className="text-xs italic text-slate-500">This is to certify that</p>

                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-blue-950 border-b border-slate-300 pb-2 inline-block px-8">
                    {previewDoc.data.studentName}
                  </h3>

                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    having satisfied all the academic requirements prescribed by the Senate was admitted to the award of
                  </p>

                  <div className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-slate-900 font-serif">
                    {previewDoc.data.awardTitle}
                  </div>

                  <p className="text-xs font-semibold text-emerald-800">
                    Classification: {previewDoc.data.classification}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-between pt-8 gap-6 border-t border-slate-300 text-xs">
                    <div className="text-center space-y-1">
                      <div className="font-serif italic text-sm text-slate-800">{previewDoc.data.signatory1Name}</div>
                      <div className="border-t border-slate-400 pt-1 text-[11px] font-semibold text-slate-600">{previewDoc.data.signatory1Title}</div>
                    </div>

                    <div className="flex flex-col items-center">
                      {previewDoc.qrUrl && (
                        <img src={previewDoc.qrUrl} alt="QR" className="w-16 h-16 border border-slate-300 p-0.5 bg-white rounded-md" />
                      )}
                      <span className="text-[9px] font-mono text-slate-500 mt-1">{previewDoc.data.certificateNumber}</span>
                    </div>

                    <div className="text-center space-y-1">
                      <div className="font-serif italic text-sm text-slate-800">{previewDoc.data.signatory2Name}</div>
                      <div className="border-t border-slate-400 pt-1 text-[11px] font-semibold text-slate-600">{previewDoc.data.signatory2Title}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ADMISSION LETTER VIEW */}
              {previewDoc.type === 'admission' && (
                <div className="space-y-6 text-xs text-slate-800">
                  <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
                    <div>
                      <h2 className="text-base font-bold uppercase text-slate-950">{tenant?.name || 'Academic Institution'}</h2>
                      <p className="text-[11px] text-slate-500">Office of Admissions & Student Affairs</p>
                    </div>
                    <div className="text-right font-mono text-[11px]">
                      <div>Ref: <strong>{previewDoc.data.letterNumber}</strong></div>
                      <div>Date: {previewDoc.data.issueDate}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div>To: <strong>{previewDoc.data.studentName}</strong></div>
                    <div>Admission No: <strong className="font-mono">{previewDoc.data.admissionNo}</strong></div>
                  </div>

                  <div className="font-bold text-sm uppercase text-blue-900 border-b border-slate-200 pb-1">
                    RE: PROVISIONAL LETTER OF ADMISSION — {previewDoc.data.programName}
                  </div>

                  <p>
                    We are pleased to inform you that following your application, you have been offered admission into the
                    <strong> {previewDoc.data.programName}</strong> for the <strong>{previewDoc.data.intake}</strong> intake.
                  </p>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <div className="font-semibold text-slate-900">Key Admission Details:</div>
                    <div>• Program Duration: {previewDoc.data.duration}</div>
                    <div>• Reporting Date: {previewDoc.data.reportingDate}</div>
                    <div>• Tuition Fee per Term: {tenant?.currency || 'KES'} {previewDoc.data.termTuitionFee?.toLocaleString()}</div>
                    <div>• Statutory & Registration Fees: {tenant?.currency || 'KES'} {previewDoc.data.statutoryFees?.toLocaleString()}</div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                    <div className="flex items-center space-x-3">
                      {previewDoc.qrUrl && (
                        <img src={previewDoc.qrUrl} alt="QR" className="w-16 h-16 border border-slate-300 p-0.5 bg-white rounded-md" />
                      )}
                      <div className="text-[10px] text-slate-500 font-mono">
                        Verify: {previewDoc.data.verificationCode}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-slate-900">{previewDoc.data.issuedBy || 'Registrar Admissions'}</div>
                      <div className="text-[11px] text-slate-500">Academic Registrar</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
