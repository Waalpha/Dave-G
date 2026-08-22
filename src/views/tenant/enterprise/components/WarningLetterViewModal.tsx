import React from 'react';
import { StaffWarningLetter, Tenant } from '../../../../types';
import { X, Printer, Download, ShieldCheck, AlertTriangle, Building2, Calendar, FileText } from 'lucide-react';

interface WarningLetterViewModalProps {
  letter: StaffWarningLetter | null;
  tenant: Tenant | null;
  onClose: () => void;
  onStatusChange?: (id: string, newStatus: StaffWarningLetter['status']) => void;
}

export const WarningLetterViewModal: React.FC<WarningLetterViewModalProps> = ({
  letter,
  tenant,
  onClose,
  onStatusChange
}) => {
  if (!letter) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(letter.issuedAt || letter.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const getWarningLevelLabel = (level: string) => {
    switch (level) {
      case 'FIRST_WARNING': return 'FIRST FORMAL DISCIPLINARY WARNING';
      case 'SECOND_WARNING': return 'SECOND FORMAL DISCIPLINARY WARNING';
      case 'FINAL_WARNING': return 'FINAL FORMAL DISCIPLINARY WARNING';
      case 'PERFORMANCE_IMPROVEMENT_PLAN': return 'OFFICIAL PERFORMANCE IMPROVEMENT NOTICE';
      default: return 'FORMAL WARNING LETTER';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 border border-slate-200">
        {/* Modal Controls Bar */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Official Disciplinary Letter: {letter.letterNumber}</h3>
              <p className="text-xs text-slate-400">Issued to {letter.employeeName} ({letter.employeeNo})</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onStatusChange && (
              <select
                value={letter.status}
                onChange={e => onStatusChange(letter.id, e.target.value as any)}
                className="bg-slate-800 border border-slate-700 text-xs text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-hidden"
              >
                <option value="ISSUED">Status: ISSUED</option>
                <option value="ACKNOWLEDGED">Status: ACKNOWLEDGED</option>
                <option value="RESOLVED">Status: RESOLVED</option>
                <option value="ESCALATED">Status: ESCALATED</option>
              </select>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Formal Document Area */}
        <div className="p-8 sm:p-12 text-slate-900 bg-white space-y-6 max-h-[85vh] overflow-y-auto print:max-h-none print:p-0 print:overflow-visible">
          {/* Header & Letterhead */}
          <div className="border-b-2 border-slate-900 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                  {tenant?.branding?.companyName || tenant?.name || 'ENTERPRISE ADMINISTRATION'}
                </h1>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mt-0.5">
                  Human Resources & People Operations Division
                </p>
                <p className="text-xs text-slate-500 mt-2 max-w-md">
                  {tenant?.branding?.address || 'Headquarters • Corporate Offices & Operations'}
                </p>
                <p className="text-xs text-slate-500">
                  Tel: {tenant?.branding?.contactPhone || 'N/A'} | Email: {tenant?.branding?.contactEmail || 'hr@organization.org'}
                </p>
              </div>
              <div className="text-right">
                <div className="inline-block bg-amber-50 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-lg text-xs font-bold font-mono">
                  REF: {letter.letterNumber}
                </div>
                <div className="text-xs text-slate-500 mt-2 font-medium">Date: {formattedDate}</div>
                <div className="text-xs text-slate-400">Classification: STRICTLY CONFIDENTIAL</div>
              </div>
            </div>
          </div>

          {/* Recipient Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="font-bold text-sm text-slate-900">{letter.employeeName}</div>
            <div className="text-slate-700">Staff Number: <span className="font-mono font-semibold">{letter.employeeNo}</span></div>
            <div className="text-slate-700">Designation: <span className="font-semibold">{letter.jobTitle}</span></div>
            <div className="text-slate-700">Department: <span className="font-semibold">{letter.department}</span></div>
          </div>

          {/* Letter Title Banner */}
          <div className="text-center py-2 border-y border-slate-300">
            <h2 className="text-base font-black tracking-wide text-rose-950 uppercase">
              RE: {getWarningLevelLabel(letter.warningLevel)}
            </h2>
            <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mt-0.5">
              INFRACTION CATEGORY: {letter.infractionCategory.replace(/_/g, ' ')}
            </div>
          </div>

          {/* Letter Body Content */}
          <div className="text-sm leading-relaxed space-y-4 text-slate-800">
            <p>
              Dear <span className="font-semibold">{letter.employeeName}</span>,
            </p>

            <p>
              This official communication serves as a formal <span className="font-semibold">{letter.warningLevel.replace(/_/g, ' ').toLowerCase()}</span> regarding non-compliance with organizational code of conduct, employment terms, and workplace standards.
            </p>

            {/* Factual Narrative Box */}
            <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-amber-500 text-xs space-y-2">
              <div className="font-bold text-slate-900 uppercase tracking-wider">1. Summary of Incident & Grounds</div>
              <p className="text-slate-700 leading-relaxed">{letter.incidentDescription}</p>
              <div className="text-slate-500 pt-1">
                <span className="font-semibold">Recorded Incident Date:</span> {letter.incidentDate}
                {letter.priorDiscussionDate && (
                  <span className="ml-4"><span className="font-semibold">Prior Verbal Notice:</span> {letter.priorDiscussionDate}</span>
                )}
              </div>
            </div>

            {/* Required Actions Box */}
            <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-blue-500 text-xs space-y-2">
              <div className="font-bold text-slate-900 uppercase tracking-wider">2. Mandatory Corrective Action Plan</div>
              <p className="text-slate-700 leading-relaxed">{letter.requiredCorrectiveActions}</p>
              <div className="text-blue-700 font-semibold pt-1">
                Formal Review & Monitoring Period: {letter.improvementTimelineDays} calendar days from date of receipt.
              </div>
            </div>

            {/* Consequence Clause */}
            <div className="bg-rose-50 p-4 rounded-xl border-l-4 border-rose-500 text-xs space-y-1">
              <div className="font-bold text-rose-950 uppercase tracking-wider">3. Consequences of Continued Non-Compliance</div>
              <p className="text-rose-900 leading-relaxed">{letter.consequenceSummary}</p>
            </div>

            <p className="text-xs text-slate-600">
              A copy of this letter shall remain on your permanent employment personnel file. You are requested to sign the acknowledgment receipt below confirming delivery and comprehension of this notice.
            </p>
          </div>

          {/* Signatures & Execution Section */}
          <div className="pt-8 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-xs">
            <div>
              <div className="font-bold text-slate-900 uppercase tracking-wider">Issued On Behalf of Management:</div>
              <div className="mt-8 border-b border-slate-400 w-48" />
              <div className="mt-1.5 font-bold text-slate-900">{letter.issuedBy}</div>
              <div className="text-slate-600">{letter.issuedByTitle}</div>
              <div className="text-slate-400 text-[11px] mt-0.5">Date: {formattedDate}</div>
            </div>

            <div>
              <div className="font-bold text-slate-900 uppercase tracking-wider">Employee Acknowledgment Receipt:</div>
              <div className="mt-8 border-b border-slate-400 w-48" />
              <div className="mt-1.5 font-bold text-slate-900">{letter.employeeName}</div>
              <div className="text-slate-600">Signature: ______________________</div>
              <div className="text-slate-400 text-[11px] mt-0.5">Date: ________________________</div>
            </div>
          </div>

          {/* Footer stamp */}
          <div className="pt-4 text-center text-[10px] text-slate-400 border-t border-slate-200">
            Official Personnel Record • Generated electronically by Enterprise HR Management Suite
          </div>
        </div>
      </div>
    </div>
  );
};
