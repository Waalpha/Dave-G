import React from 'react';
import { StaffTerminationLetter, Tenant } from '../../../../types';
import { X, Printer, ShieldCheck, UserX, Building2, CheckCircle2, FileText } from 'lucide-react';

interface TerminationLetterViewModalProps {
  letter: StaffTerminationLetter | null;
  tenant: Tenant | null;
  onClose: () => void;
  currencySymbol?: string;
}

export const TerminationLetterViewModal: React.FC<TerminationLetterViewModalProps> = ({
  letter,
  tenant,
  onClose,
  currencySymbol = 'KES'
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

  const getTerminationTypeLabel = (type: string) => {
    switch (type) {
      case 'SUMMARY_DISMISSAL': return 'SUMMARY DISMISSAL (GROSS MISCONDUCT)';
      case 'TERMINATION_WITH_NOTICE': return 'NOTICE OF TERMINATION OF EMPLOYMENT';
      case 'REDUNDANCY': return 'NOTICE OF REDUNDANCY & SEPARATION';
      case 'END_OF_CONTRACT': return 'EXPIRATION OF FIXED-TERM CONTRACT';
      case 'PROBATION_FAILURE': return 'TERMINATION DURING PROBATIONARY PERIOD';
      case 'MUTUAL_SEPARATION': return 'MUTUAL SEPARATION AGREEMENT';
      case 'RESIGNATION_ACCEPTANCE': return 'FORMAL ACCEPTANCE OF RESIGNATION';
      default: return 'NOTICE OF SEPARATION OF EMPLOYMENT';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 border border-slate-200">
        {/* Modal Controls Bar */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Official Termination Notice: {letter.letterNumber}</h3>
              <p className="text-xs text-slate-400">Issued to {letter.employeeName} ({letter.employeeNo})</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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

        {/* Printable Document Area */}
        <div className="p-8 sm:p-12 text-slate-900 bg-white space-y-6 max-h-[85vh] overflow-y-auto print:max-h-none print:p-0 print:overflow-visible">
          {/* Header & Letterhead */}
          <div className="border-b-2 border-slate-900 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                  {tenant?.branding?.companyName || tenant?.name || 'ENTERPRISE ADMINISTRATION'}
                </h1>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mt-0.5">
                  Office of the Appointing Authority & Human Resources
                </p>
                <p className="text-xs text-slate-500 mt-2 max-w-md">
                  {tenant?.branding?.address || 'Headquarters • Corporate Offices & Operations'}
                </p>
                <p className="text-xs text-slate-500">
                  Tel: {tenant?.branding?.contactPhone || 'N/A'} | Email: {tenant?.branding?.contactEmail || 'hr@organization.org'}
                </p>
              </div>
              <div className="text-right">
                <div className="inline-block bg-rose-50 border border-rose-300 text-rose-900 px-3 py-1.5 rounded-lg text-xs font-bold font-mono">
                  REF: {letter.letterNumber}
                </div>
                <div className="text-xs text-slate-500 mt-2 font-medium">Date: {formattedDate}</div>
                <div className="text-xs text-rose-600 font-bold">STRICTLY CONFIDENTIAL</div>
              </div>
            </div>
          </div>

          {/* Recipient Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="font-bold text-sm text-slate-900">{letter.employeeName}</div>
            <div className="text-slate-700">Staff Identification: <span className="font-mono font-semibold">{letter.employeeNo}</span></div>
            <div className="text-slate-700">Designation: <span className="font-semibold">{letter.jobTitle}</span></div>
            <div className="text-slate-700">Department: <span className="font-semibold">{letter.department}</span></div>
          </div>

          {/* Letter Title Banner */}
          <div className="text-center py-2 border-y border-slate-300">
            <h2 className="text-base font-black tracking-wide text-rose-900 uppercase">
              RE: {getTerminationTypeLabel(letter.terminationType)}
            </h2>
          </div>

          {/* Letter Body Content */}
          <div className="text-sm leading-relaxed space-y-4 text-slate-800">
            <p>
              Dear <span className="font-semibold">{letter.employeeName}</span>,
            </p>

            <p>
              We write to formally inform you that your employment with <span className="font-semibold">{tenant?.branding?.companyName || tenant?.name || 'the Organization'}</span> as <span className="font-semibold">{letter.jobTitle}</span> is terminated effective <span className="font-semibold text-rose-700">{letter.effectiveDate}</span>. Your last working date with the organization shall be <span className="font-semibold">{letter.lastWorkingDate}</span>.
            </p>

            {/* Grounds Box */}
            <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-slate-700 text-xs space-y-2">
              <div className="font-bold text-slate-900 uppercase tracking-wider">1. Grounds for Termination</div>
              <p className="text-slate-700 leading-relaxed">{letter.groundsForTermination}</p>
              {letter.noticePeriodProvidedDays > 0 && (
                <div className="text-slate-600 pt-1 font-medium">
                  Notice Period Provided: {letter.noticePeriodProvidedDays} days in compliance with statutory provisions.
                </div>
              )}
            </div>

            {/* Final Dues & Settlement Box */}
            <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-emerald-600 text-xs space-y-2">
              <div className="font-bold text-slate-900 uppercase tracking-wider">2. Terminal Dues & Final Settlement</div>
              <p className="text-slate-700 leading-relaxed">
                {letter.severanceOrFinalDuesDescription || 'Your final dues will include remuneration up to your last working day, accrued unused leave, and applicable gratuity/severance.'}
              </p>
              {letter.finalSettlementAmount && letter.finalSettlementAmount > 0 ? (
                <div className="font-bold text-emerald-800 pt-1 text-sm">
                  Estimated Net Terminal Settlement: {currencySymbol} {letter.finalSettlementAmount.toLocaleString()}
                </div>
              ) : null}
            </div>

            {/* Clearance Requirements Box */}
            {letter.clearanceRequirements && letter.clearanceRequirements.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-amber-500 text-xs space-y-2">
                <div className="font-bold text-slate-900 uppercase tracking-wider">3. Clearance & Property Handover Requirements</div>
                <p className="text-slate-600">You are required to complete full handover and clearance of the following items prior to terminal dues disbursement:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                  {letter.clearanceRequirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {letter.certificateOfServiceIssued && (
              <p className="text-xs text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <span className="font-bold text-blue-900">Certificate of Service:</span> In accordance with employment laws, an official Certificate of Service summarizing your tenure and role will be issued upon conclusion of clearance.
              </p>
            )}

            <p className="text-xs text-slate-600">
              We thank you for the contributions you have made during your tenure and wish you the best in your future endeavors.
            </p>
          </div>

          {/* Signatures & Execution Section */}
          <div className="pt-8 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-xs">
            <div>
              <div className="font-bold text-slate-900 uppercase tracking-wider">Authorized Appointing Signatory:</div>
              <div className="mt-8 border-b border-slate-400 w-48" />
              <div className="mt-1.5 font-bold text-slate-900">{letter.issuedBy}</div>
              <div className="text-slate-600">{letter.issuedByTitle}</div>
              <div className="text-slate-400 text-[11px] mt-0.5">Date: {formattedDate}</div>
            </div>

            <div>
              <div className="font-bold text-slate-900 uppercase tracking-wider">Employee Clearance Acknowledgment:</div>
              <div className="mt-8 border-b border-slate-400 w-48" />
              <div className="mt-1.5 font-bold text-slate-900">{letter.employeeName}</div>
              <div className="text-slate-600">Signature: ______________________</div>
              <div className="text-slate-400 text-[11px] mt-0.5">Date: ________________________</div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 text-center text-[10px] text-slate-400 border-t border-slate-200">
            Confidential Employment Record • Official Document Generated via Enterprise HR Suite
          </div>
        </div>
      </div>
    </div>
  );
};
