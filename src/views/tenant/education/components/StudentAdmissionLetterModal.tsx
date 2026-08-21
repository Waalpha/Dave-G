import React, { useState } from 'react';
import { Student, Tenant } from '../../../../types';
import { Printer, X, Download, CheckCircle2, Calendar, FileText, School, UserCheck } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

interface StudentAdmissionLetterModalProps {
  student: Student;
  onClose: () => void;
  currencySymbol?: string;
}

export const StudentAdmissionLetterModal: React.FC<StudentAdmissionLetterModalProps> = ({
  student,
  onClose,
  currencySymbol = 'KSh'
}) => {
  const { tenant } = useAuth();
  const [reportingDate, setReportingDate] = useState('2026-09-08');
  const [reportingTime, setReportingTime] = useState('08:00 AM');
  const [termFee, setTermFee] = useState(student.feeBalance > 0 ? String(student.feeBalance) : '25000');
  const [letterRef, setLetterRef] = useState(`ADM-LTR/${new Date().getFullYear()}/${student.admissionNo.replace(/[^a-zA-Z0-9]/g, '') || Math.floor(1000 + Math.random() * 9000)}`);
  const [customNotes, setCustomNotes] = useState(
    'Please report promptly with original copies of Birth Certificate/National ID, two recent passport-size photos, medical clearance form, and bank payment slip.'
  );

  const institutionName = tenant?.branding?.companyName || tenant?.name || 'Academic Institution';
  const institutionAddress = tenant?.address || 'P.O. Box 40200 - 00100, Nairobi, Kenya';
  const institutionPhone = tenant?.contactPhone || '+254 700 000 000';
  const institutionEmail = tenant?.contactEmail || 'admissions@institution.ac.ke';
  const logoUrl = tenant?.branding?.logoUrl;
  const primaryColor = tenant?.branding?.primaryColor || '#1e3a8a';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-6 border border-slate-200">
        {/* Modal Toolbar (Hidden during print) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center space-x-2.5">
            <FileText className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm">Official Letter of Admission</h3>
              <p className="text-[11px] text-slate-400">Student: {student.fullName} ({student.admissionNo})</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Admission Letter</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customization bar (Hidden during print) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs print:hidden">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Reporting Date</label>
            <input
              type="date"
              value={reportingDate}
              onChange={e => setReportingDate(e.target.value)}
              className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Reporting Time</label>
            <input
              type="text"
              value={reportingTime}
              onChange={e => setReportingTime(e.target.value)}
              className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">First Term Fee ({currencySymbol})</label>
            <input
              type="number"
              value={termFee}
              onChange={e => setTermFee(e.target.value)}
              className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono"
            />
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 sm:p-12 text-slate-900 bg-white space-y-6 text-sm max-h-[75vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0">
          {/* Header Letterhead */}
          <div className="border-b-2 border-slate-800 pb-5 flex items-start justify-between gap-4">
            <div className="flex items-center space-x-4">
              {logoUrl ? (
                <img src={logoUrl} alt={institutionName} className="h-16 w-16 object-contain rounded-lg border border-slate-200 p-1" />
              ) : (
                <div
                  className="h-16 w-16 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  <School className="w-8 h-8" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-950 uppercase">{institutionName}</h1>
                <p className="text-xs text-slate-600">{institutionAddress}</p>
                <p className="text-xs text-slate-600">Tel: {institutionPhone} | Email: {institutionEmail}</p>
                <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider mt-0.5">Office of the Registrar & Admissions Desk</p>
              </div>
            </div>

            <div className="text-right font-mono text-xs text-slate-600">
              <p className="font-bold text-slate-900">REF: {letterRef}</p>
              <p>Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Student Address Block */}
          <div className="space-y-1 text-xs">
            <p className="font-bold text-slate-950 text-sm">{student.fullName}</p>
            {student.admissionNo && <p className="font-mono text-slate-700">Admission No: <strong>{student.admissionNo}</strong></p>}
            {student.learnerAssessmentNo && <p className="font-mono text-slate-700">UPI / Assessment No: <strong>{student.learnerAssessmentNo}</strong></p>}
            {student.guardianName && <p className="text-slate-700">C/O Guardian: {student.guardianName} ({student.guardianPhone})</p>}
            {student.address && <p className="text-slate-700">{student.address}</p>}
          </div>

          {/* Subject Line */}
          <div className="py-2 border-y border-slate-200">
            <h2 className="text-base font-bold text-slate-950 uppercase text-center tracking-wide">
              RE: PROVISIONAL OFFER OF ADMISSION ({student.academicYear || '2025/2026'})
            </h2>
          </div>

          {/* Letter Body */}
          <div className="space-y-4 text-xs leading-relaxed text-slate-800">
            <p>Dear <strong>{student.fullName}</strong>,</p>

            <p>
              Following your application and successful qualification review, we are pleased to inform you that you have been offered provisional admission into <strong>{institutionName}</strong> for the <strong>{student.academicYear || '2025/2026'} Academic Year</strong>.
            </p>

            {/* Academic Placement Details Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 uppercase tracking-wider">
                1. Academic Placement & Cohort Details
              </h3>
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div>
                  <span className="text-slate-500 text-[11px] block">Level / Class Placement:</span>
                  <span className="font-bold text-slate-900">
                    {student.gradeName ? `${student.gradeName} ${student.streamName ? `(Stream ${student.streamName})` : ''}` : student.programName || 'Standard Curriculum'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Campus / Center:</span>
                  <span className="font-bold text-slate-900">{student.campusName || 'Main Campus'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Reporting Date & Time:</span>
                  <span className="font-bold text-blue-900">
                    {new Date(reportingDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at {reportingTime}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Assigned Admission No:</span>
                  <span className="font-bold text-blue-900">{student.admissionNo}</span>
                </div>
              </div>
            </div>

            {/* Fee Schedule Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1 uppercase tracking-wider">
                2. Fee Obligations & Payment Guidelines
              </h3>
              <p className="text-[11px] text-slate-600">
                You are required to clear the term fee of <strong>{currencySymbol} {Number(termFee).toLocaleString()}</strong> prior to or on the reporting date. All payments must be deposited directly to the official institution bank account or verified M-Pesa Paybill.
              </p>
              <div className="flex flex-wrap items-center justify-between pt-1 font-mono text-[11px] text-slate-800">
                <span>Paybill / Account: <strong>{tenant?.name || 'Finance Desk'}</strong></span>
                <span>Term Billing: <strong className="text-blue-800 font-bold">{currencySymbol} {Number(termFee).toLocaleString()}</strong></span>
              </div>
            </div>

            {/* Requirements Checklist */}
            <div className="space-y-1.5 text-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                3. Mandatory Admission Requirements
              </h3>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                {customNotes}
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700 pl-2">
                <li>Original and copy of previous academic results / transfer certificate.</li>
                <li>Duly completed and signed student medical declaration form.</li>
                <li>Two recent clear passport-sized color photographs.</li>
                <li>Signed parent / guardian commitment & code of conduct agreement.</li>
              </ul>
            </div>

            <p className="text-xs pt-2">
              We look forward to welcoming you to our institution. Please present this official admission letter to the admissions desk upon arrival.
            </p>
          </div>

          {/* Signature Block */}
          <div className="pt-8 border-t border-slate-300 flex items-end justify-between">
            <div className="space-y-6">
              <div className="h-10 w-32 border-b border-slate-800"></div>
              <div>
                <p className="font-bold text-xs text-slate-950">Academic Registrar / Principal</p>
                <p className="text-[11px] text-slate-500">{institutionName}</p>
              </div>
            </div>

            <div className="text-center p-3 border border-dashed border-slate-400 rounded-xl w-36">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Official Seal / Stamp</div>
              <div className="h-12 flex items-center justify-center text-slate-300">
                <CheckCircle2 className="w-8 h-8 opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
