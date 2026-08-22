import React from 'react';
import { X, Printer, Download, CheckCircle2, AlertTriangle, ShieldCheck, DollarSign, Calendar } from 'lucide-react';
import { FeesPieChart } from './FeesPieChart';

interface SchoolFeesReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: any;
  tenantName: string;
  currencySymbol?: string;
  selectedYear?: string;
  selectedTerm?: string;
  selectedGradeName?: string;
}

export const SchoolFeesReportModal: React.FC<SchoolFeesReportModalProps> = ({
  isOpen,
  onClose,
  reportData,
  tenantName,
  currencySymbol = 'KSh',
  selectedYear = 'All Years',
  selectedTerm = 'All Terms',
  selectedGradeName = 'All Grades & Streams'
}) => {
  if (!isOpen || !reportData) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (!reportData.allStudentReports || reportData.allStudentReports.length === 0) return;

    const headers = ['Admission No', 'Student Name', 'Grade/Stream', 'Class', 'Total Invoiced', 'Total Paid', 'Fee Balance', 'Status', 'Last Payment Date', 'Guardian Name', 'Guardian Phone'];
    const rows = reportData.allStudentReports.map((st: any) => [
      `"${st.admissionNo || ''}"`,
      `"${st.studentName || ''}"`,
      `"${st.gradeName || ''}"`,
      `"${st.className || ''}"`,
      st.totalInvoiced || 0,
      st.totalPaid || 0,
      st.feeBalance || 0,
      `"${st.status || ''}"`,
      `"${st.lastPaymentDate ? new Date(st.lastPaymentDate).toLocaleDateString() : 'None'}"`,
      `"${st.guardianName || ''}"`,
      `"${st.guardianPhone || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `School_Fees_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const collectionSlices = [
    {
      label: 'Fees Collected',
      value: reportData.totalCollected || 0,
      color: '#10B981',
      sublabel: `${reportData.paymentsCount || 0} payment receipts`
    },
    {
      label: 'Outstanding Balance',
      value: reportData.totalOutstanding || 0,
      color: '#EF4444',
      sublabel: `${reportData.debtorsCount || 0} student balances`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Header - Screen only */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Official School Fees & Financial Report</h2>
              <p className="text-xs text-slate-500">{tenantName} • Comprehensive Institutional Audit</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-xs whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 print:p-0 print:overflow-visible text-slate-900 bg-white">
          
          {/* Institutional Letterhead */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-indigo-700 uppercase bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  OFFICIAL BURSARY & FINANCE STATEMENT
                </span>
                <h1 className="text-2xl font-black text-slate-900 mt-2 uppercase tracking-tight">
                  {tenantName}
                </h1>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Institutional School Fees Revenue, Collection & Debtors Financial Report
                </p>
              </div>

              <div className="text-right text-xs space-y-1">
                <div className="font-mono text-slate-700">
                  <span className="text-slate-400">Date: </span>
                  <span className="font-bold">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="font-mono text-slate-700">
                  <span className="text-slate-400">Filter Scope: </span>
                  <span className="font-semibold">{selectedYear} • {selectedTerm}</span>
                </div>
                <div className="font-mono text-slate-700">
                  <span className="text-slate-400">Cohort Scope: </span>
                  <span className="font-semibold">{selectedGradeName}</span>
                </div>
                <div className="inline-flex items-center space-x-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>AUDITED REVENUE LEDGER</span>
                </div>
              </div>
            </div>
          </div>

          {/* Executive Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Total Fees Billed</span>
              <span className="text-lg sm:text-xl font-extrabold font-mono text-slate-900 mt-1 block">
                {currencySymbol} {(reportData.totalInvoiced || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">{reportData.invoicesCount || 0} active invoices</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">Total Collected</span>
              <span className="text-lg sm:text-xl font-extrabold font-mono text-emerald-900 mt-1 block">
                {currencySymbol} {(reportData.totalCollected || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-700 font-medium mt-0.5 block">{reportData.paymentsCount || 0} payment entries</span>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block">Outstanding Arrears</span>
              <span className="text-lg sm:text-xl font-extrabold font-mono text-rose-900 mt-1 block">
                {currencySymbol} {(reportData.totalOutstanding || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-rose-700 font-medium mt-0.5 block">{reportData.debtorsCount || 0} student accounts</span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 block">Collection Rate</span>
              <span className="text-lg sm:text-xl font-extrabold font-mono text-indigo-900 mt-1 block">
                {reportData.collectionRate || 0}%
              </span>
              <div className="w-full bg-indigo-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, reportData.collectionRate || 0)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Visual Financial Summary (Pie Chart & Channels) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50/60 border border-slate-200">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Overall Revenue Allocation
              </h3>
              <FeesPieChart
                data={collectionSlices}
                size={180}
                donutWidth={36}
                currencySymbol={currencySymbol}
                centerLabel={`${reportData.collectionRate || 0}%`}
                centerSublabel="Collected"
              />
            </div>

            <div className="flex flex-col justify-center space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Settlement Status Distribution
              </h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800">Fully Settled Students</span>
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-900">
                    {reportData.statusBreakdown?.fullyPaidStudents || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-800">Partial Payment (In Installments)</span>
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-900">
                    {reportData.statusBreakdown?.partialPaidStudents || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800">Zero Payment (In Full Arrears)</span>
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-900">
                    {reportData.statusBreakdown?.zeroPaidStudents || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cohort / Grade Level Performance Table */}
          {reportData.cohortBreakdown && reportData.cohortBreakdown.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Revenue & Fee Collection Performance by Grade / Cohort
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5">Grade / Stream / Level</th>
                      <th className="px-3 py-2.5 text-center">Students</th>
                      <th className="px-3 py-2.5 text-right">Total Invoiced</th>
                      <th className="px-3 py-2.5 text-right">Total Collected</th>
                      <th className="px-3 py-2.5 text-right">Outstanding</th>
                      <th className="px-3 py-2.5 text-center">Efficiency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {reportData.cohortBreakdown.map((cohort: any) => (
                      <tr key={cohort.name} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-bold text-slate-900">{cohort.name}</td>
                        <td className="px-3 py-2 text-center font-mono">{cohort.studentCount}</td>
                        <td className="px-3 py-2 text-right font-mono">{currencySymbol} {cohort.totalInvoiced.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-mono text-emerald-700 font-bold">{currencySymbol} {cohort.totalCollected.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-mono text-rose-700 font-bold">{currencySymbol} {cohort.totalBalance.toLocaleString()}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            cohort.collectionRate >= 80 ? 'bg-emerald-100 text-emerald-800' : (cohort.collectionRate >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')
                          }`}>
                            {cohort.collectionRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Full Student Fees & Balances Register */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Comprehensive Student Fees & Balances Register ({reportData.allStudentReports?.length || 0} Students)
              </h3>
            </div>
            
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">Adm No</th>
                    <th className="px-3 py-2.5">Student Name</th>
                    <th className="px-3 py-2.5">Grade / Stream</th>
                    <th className="px-3 py-2.5 text-right">Invoiced</th>
                    <th className="px-3 py-2.5 text-right">Fees Paid</th>
                    <th className="px-3 py-2.5 text-right">Balance</th>
                    <th className="px-3 py-2.5 text-center">Status</th>
                    <th className="px-3 py-2.5">Last Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {reportData.allStudentReports && reportData.allStudentReports.length > 0 ? (
                    reportData.allStudentReports.map((st: any) => (
                      <tr key={st.studentId} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-mono font-bold text-slate-900">{st.admissionNo}</td>
                        <td className="px-3 py-2 font-bold text-slate-900">{st.studentName}</td>
                        <td className="px-3 py-2 text-slate-600">{st.gradeName}</td>
                        <td className="px-3 py-2 text-right font-mono">{currencySymbol} {(st.totalInvoiced || 0).toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-mono text-emerald-700 font-bold">
                          {currencySymbol} {(st.totalPaid || 0).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold">
                          <span className={st.feeBalance > 0 ? 'text-rose-700' : 'text-slate-400'}>
                            {currencySymbol} {(st.feeBalance || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            st.status === 'SETTLED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : (st.status === 'PARTIAL' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')
                          }`}>
                            {st.status === 'SETTLED' ? 'Cleared' : (st.status === 'PARTIAL' ? 'Partial' : 'Arrears')}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-500 font-mono text-[11px]">
                          {st.lastPaymentDate ? new Date(st.lastPaymentDate).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                        No students found for this reporting criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Official Sign-off & Signatures section */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-slate-600 print:pt-6">
            <div>
              <div className="border-b border-slate-300 pb-8 mb-2"></div>
              <p className="font-bold text-slate-900">Bursar / Financial Controller</p>
              <p className="text-[10px] text-slate-400">Signature & Date</p>
            </div>
            <div>
              <div className="border-b border-slate-300 pb-8 mb-2"></div>
              <p className="font-bold text-slate-900">Principal / Head of Institution</p>
              <p className="text-[10px] text-slate-400">Signature & Official Stamp</p>
            </div>
            <div className="text-right">
              <div className="border-b border-slate-300 pb-8 mb-2"></div>
              <p className="font-bold text-slate-900">System Verification</p>
              <p className="text-[10px] font-mono text-slate-400">
                REF-REP-{Date.now().toString(36).toUpperCase()}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
