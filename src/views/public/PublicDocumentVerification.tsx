import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, FileText, Award, GraduationCap, Building, Calendar, Search } from 'lucide-react';
import { DocumentVerificationRecord } from '../../types';

interface PublicDocumentVerificationProps {
  initialCode?: string;
}

export const PublicDocumentVerification: React.FC<PublicDocumentVerificationProps> = ({
  initialCode
}) => {
  const [code, setCode] = useState(initialCode || '');
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<DocumentVerificationRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleVerify = async (codeToVerify: string) => {
    const cleanCode = codeToVerify.trim();
    if (!cleanCode) return;

    setLoading(true);
    setError(null);
    setRecord(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/public/verify-document/${encodeURIComponent(cleanCode)}`);
      const data = await res.json();

      if (res.ok && data.success && data.record) {
        setRecord(data.record);
      } else {
        setError(data.message || 'No official document record found for this verification code.');
      }
    } catch (e: any) {
      setError(e.message || 'Connection error verifying document record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If URL has code, verify immediately
    const pathname = window.location.pathname;
    const match = pathname.match(/\/verify-document\/(.+)/);
    const urlCode = match ? match[1] : initialCode;

    if (urlCode) {
      setCode(urlCode);
      handleVerify(urlCode);
    }
  }, [initialCode]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-xl w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-blue-600/20 border border-blue-500/30 rounded-2xl text-blue-400 mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Academic Document Verification Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Davetech ERP Institutional Credential & Authenticity Registry
          </p>
        </div>

        {/* Search / Verification Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleVerify(code);
            }}
            className="space-y-3"
          >
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Enter Verification Code or Document Ref No
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. VRF-TR-M9K3-8F2 or TR-2026-00001"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-sm font-mono text-white placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500 uppercase"
              />
              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl flex items-center space-x-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? 'Checking...' : 'Verify'}</span>
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-rose-950/50 border border-rose-800/60 rounded-2xl flex items-start space-x-3 text-rose-200 text-xs animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-rose-300">Document Unverified / Record Not Found</div>
                <div className="mt-0.5 text-rose-200/80">{error}</div>
              </div>
            </div>
          )}

          {/* Success / Authentic Record Result */}
          {record && (
            <div className="p-6 bg-slate-950 border-2 border-emerald-500/50 rounded-2xl space-y-4 animate-in fade-in">
              <div className="flex items-center space-x-3 text-emerald-400 border-b border-slate-800 pb-4">
                <CheckCircle2 className="w-7 h-7 shrink-0 text-emerald-400" />
                <div>
                  <div className="font-bold text-sm text-white">Official Authenticated Document</div>
                  <div className="text-[11px] text-emerald-400 font-mono">STATUS: {record.status}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[11px] block">Document Type</span>
                  <span className="font-bold text-white uppercase">{record.documentType}</span>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[11px] block">Document Number</span>
                  <span className="font-mono font-bold text-blue-400">{record.documentNumber}</span>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[11px] block">Student Name (Masked for Privacy)</span>
                  <span className="font-bold text-white">{record.studentNameMasked}</span>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[11px] block">Admission Number</span>
                  <span className="font-mono font-bold text-slate-200">{record.admissionNo}</span>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 sm:col-span-2">
                  <span className="text-slate-500 text-[11px] block">Academic Program / Award</span>
                  <span className="font-semibold text-white">{record.programName}</span>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[11px] block">Issuing Institution</span>
                  <span className="font-medium text-slate-300">{record.institutionName}</span>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[11px] block">Issue Date</span>
                  <span className="font-mono text-slate-300">{record.issueDate}</span>
                </div>
              </div>

              <div className="pt-2 text-center text-[11px] text-slate-500 border-t border-slate-800/80">
                Verified {record.verifiedCount} time{record.verifiedCount === 1 ? '' : 's'}. Tamper-proof institutional verification by Davetech ERP.
              </div>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center">
          <a
            href="/"
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Return to Davetech ERP Login
          </a>
        </div>
      </div>
    </div>
  );
};
