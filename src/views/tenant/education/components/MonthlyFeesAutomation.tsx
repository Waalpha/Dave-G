import React, { useState, useEffect, useMemo } from 'react';
import {
  MonthlyFeeAutomationConfig,
  MonthlyFeeAutomationLog,
  StudentInvoice,
  FeeStructure,
  Student,
  SchoolGrade,
  SchoolClass,
  Program
} from '../../../../types';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Settings,
  History,
  Bell,
  RefreshCw,
  FileText,
  Users,
  Shield,
  Sliders,
  AlertTriangle,
  ArrowRight,
  Send,
  Zap,
  Check,
  Search,
  Filter,
  DollarSign,
  ChevronRight
} from 'lucide-react';

interface MonthlyFeesAutomationProps {
  currencySymbol?: string;
  grades: SchoolGrade[];
  classes: SchoolClass[];
  programs: Program[];
  feeStructures: FeeStructure[];
  students: Student[];
  onInvoicesGenerated?: () => void;
  onNavigateToInvoices?: (monthFilter?: string) => void;
}

export const MonthlyFeesAutomation: React.FC<MonthlyFeesAutomationProps> = ({
  currencySymbol = 'KSh',
  grades,
  classes,
  programs,
  feeStructures,
  students,
  onInvoicesGenerated,
  onNavigateToInvoices
}) => {
  const [activeSection, setActiveSection] = useState<'runner' | 'settings' | 'history' | 'reminders'>('runner');

  // Backend Automation State
  const [config, setConfig] = useState<MonthlyFeeAutomationConfig | null>(null);
  const [logs, setLogs] = useState<MonthlyFeeAutomationLog[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [runningAutomation, setRunningAutomation] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Runner Parameters
  const currentDate = new Date();
  const defaultMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonthStr);
  const [selectedScope, setSelectedScope] = useState<'ALL' | 'GRADE' | 'CLASS' | 'PROGRAM'>('ALL');
  const [selectedGradeId, setSelectedGradeId] = useState<string>('ALL');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('ALL');
  const [selectedStructureId, setSelectedStructureId] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [issueDate, setIssueDate] = useState<string>(currentDate.toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [forceRegenerate, setForceRegenerate] = useState(false);

  // Live Preview State
  const [previewData, setPreviewData] = useState<{
    monthYear: string;
    eligibleStudentsCount: number;
    alreadyInvoicedCount: number;
    willGenerateCount: number;
    estimatedTotalAmount: number;
    students: Array<{
      studentId: string;
      fullName: string;
      admissionNo: string;
      gradeName?: string;
      className?: string;
      programName?: string;
      alreadyInvoiced: boolean;
      existingInvoiceNo?: string;
      projectedFee: number;
      feeStructureName: string;
    }>;
  } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewSearch, setPreviewSearch] = useState('');
  const [previewFilter, setPreviewFilter] = useState<'ALL' | 'UNINVOICED' | 'ALREADY_INVOICED'>('ALL');

  // Form State for Automation Settings
  const [settingsForm, setSettingsForm] = useState<Partial<MonthlyFeeAutomationConfig>>({
    enabled: true,
    billingDayOfMonth: 1,
    dueDaysOffset: 15,
    targetScope: 'ALL_STUDENTS',
    selectedGradeIds: [],
    selectedClassIds: [],
    selectedProgramIds: [],
    defaultFeeStructureId: '',
    customMonthlyAmount: undefined,
    invoicePrefix: 'MINV',
    autoSendNotification: true,
    autoApplyLateFee: false,
    lateFeeAmount: 500,
    lateFeeDaysAfterDue: 5,
    notes: ''
  });

  // Reminder Broadcast Template
  const [reminderTemplate, setReminderTemplate] = useState(
    'Dear Parent/Guardian, friendly reminder that {student_name}\'s school fees of KSh {balance} for {month} is due on {due_date}. Please pay via School Paybill 123456, Acc: {admission_no}. Thank you.'
  );

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-tenant-id': localStorage.getItem('erp_tenant_id') || '',
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    Authorization: `Bearer ${localStorage.getItem('erp_token') || ''}`
  });

  // Fetch Config and Logs
  const loadAutomationData = async () => {
    try {
      setLoadingConfig(true);
      const headers = getHeaders();
      const [cfgRes, logsRes] = await Promise.all([
        fetch('/api/app/education/fees/automation/config', { headers }),
        fetch('/api/app/education/fees/automation/logs', { headers })
      ]);

      if (cfgRes.ok) {
        const data = await cfgRes.json();
        setConfig(data);
        setSettingsForm(data);
      }
      if (logsRes.ok) {
        setLogs(await logsRes.json());
      }
    } catch (err) {
      console.error('Failed to load monthly fee automation data', err);
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    loadAutomationData();
  }, []);

  // Fetch Live Preview whenever runner params change
  const fetchPreview = async () => {
    try {
      setPreviewLoading(true);
      const headers = getHeaders();
      const res = await fetch('/api/app/education/fees/automation/preview', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          monthYear: selectedMonth,
          gradeId: selectedScope === 'GRADE' ? selectedGradeId : undefined,
          classId: selectedScope === 'CLASS' ? selectedClassId : undefined,
          programId: selectedScope === 'PROGRAM' ? selectedProgramId : undefined,
          feeStructureId: selectedStructureId || undefined,
          customAmount: customAmount ? Number(customAmount) : undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPreviewData(data);
      }
    } catch (err) {
      console.error('Failed to fetch preview', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, [
    selectedMonth,
    selectedScope,
    selectedGradeId,
    selectedClassId,
    selectedProgramId,
    selectedStructureId,
    customAmount
  ]);

  // Execute Monthly Fee Automation Run
  const handleRunAutomation = async () => {
    if (!previewData || previewData.eligibleStudentsCount === 0) {
      setStatusMessage({ type: 'error', text: 'No active eligible students found for this selection.' });
      return;
    }

    const monthName = getFormattedMonthName(selectedMonth);
    const countToGenerate = forceRegenerate 
      ? previewData.eligibleStudentsCount 
      : previewData.willGenerateCount;

    if (countToGenerate === 0 && !forceRegenerate) {
      setStatusMessage({
        type: 'error',
        text: `All ${previewData.eligibleStudentsCount} students already have invoices generated for ${monthName}. Enable "Force Re-generate" if you wish to create duplicate/extra invoices.`
      });
      return;
    }

    const confirmRun = window.confirm(
      `Are you sure you want to generate ${countToGenerate} monthly invoices for ${monthName}? Projected Total: ${currencySymbol} ${previewData.estimatedTotalAmount.toLocaleString()}`
    );
    if (!confirmRun) return;

    try {
      setRunningAutomation(true);
      setStatusMessage(null);
      const headers = getHeaders();
      const res = await fetch('/api/app/education/fees/automation/run', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          monthYear: selectedMonth,
          gradeId: selectedScope === 'GRADE' ? selectedGradeId : undefined,
          classId: selectedScope === 'CLASS' ? selectedClassId : undefined,
          programId: selectedScope === 'PROGRAM' ? selectedProgramId : undefined,
          feeStructureId: selectedStructureId || undefined,
          issueDate,
          dueDate,
          customAmount: customAmount ? Number(customAmount) : undefined,
          forceRegenerate
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage({
          type: 'success',
          text: `Monthly Fee Automation Completed: Successfully generated ${data.generatedCount} invoices (${currencySymbol} ${data.totalAmount.toLocaleString()}). ${data.skippedCount} duplicates skipped.`
        });
        await loadAutomationData();
        await fetchPreview();
        if (onInvoicesGenerated) onInvoicesGenerated();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to execute monthly automation run.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Network error during monthly automation run.' });
    } finally {
      setRunningAutomation(false);
    }
  };

  // Save Automation Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingConfig(true);
      setStatusMessage(null);
      const headers = getHeaders();
      const res = await fetch('/api/app/education/fees/automation/config', {
        method: 'POST',
        headers,
        body: JSON.stringify(settingsForm)
      });

      if (res.ok) {
        const updated = await res.json();
        setConfig(updated);
        setStatusMessage({
          type: 'success',
          text: 'Monthly school fee automation settings updated and saved successfully.'
        });
      } else {
        const err = await res.json();
        setStatusMessage({ type: 'error', text: err.error || 'Failed to save automation settings.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error saving settings.' });
    } finally {
      setSavingConfig(false);
    }
  };

  // Dispatch Fee Reminders
  const handleSendReminders = async () => {
    const monthName = getFormattedMonthName(selectedMonth);
    const confirmSend = window.confirm(
      `Send automated fee payment reminder notifications (SMS & Email) to parents of all students with outstanding balances for ${monthName}?`
    );
    if (!confirmSend) return;

    try {
      setSendingReminders(true);
      setStatusMessage(null);
      const headers = getHeaders();
      const res = await fetch('/api/app/education/fees/automation/send-reminders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          monthYear: selectedMonth,
          gradeId: selectedScope === 'GRADE' ? selectedGradeId : undefined,
          classId: selectedScope === 'CLASS' ? selectedClassId : undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage({
          type: 'success',
          text: data.message || `Dispatched fee reminders to ${data.sentCount} parents.`
        });
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to send reminders.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error sending reminders.' });
    } finally {
      setSendingReminders(false);
    }
  };

  // Helper to format Month Name
  function getFormattedMonthName(monthStr: string) {
    if (!monthStr) return 'Current Month';
    const [y, m] = monthStr.split('-');
    const d = new Date(Number(y), Number(m) - 1, 1);
    return isNaN(d.getTime()) ? monthStr : d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }

  // Filtered Preview Students
  const filteredPreviewStudents = useMemo(() => {
    if (!previewData?.students) return [];
    return previewData.students.filter(st => {
      const matchSearch =
        st.fullName.toLowerCase().includes(previewSearch.toLowerCase()) ||
        st.admissionNo.toLowerCase().includes(previewSearch.toLowerCase()) ||
        (st.gradeName && st.gradeName.toLowerCase().includes(previewSearch.toLowerCase()));

      if (!matchSearch) return false;

      if (previewFilter === 'UNINVOICED') return !st.alreadyInvoiced;
      if (previewFilter === 'ALREADY_INVOICED') return st.alreadyInvoiced;
      return true;
    });
  }, [previewData, previewSearch, previewFilter]);

  // Quick Month Options
  const monthOptions = useMemo(() => {
    const opts: Array<{ value: string; label: string }> = [];
    const now = new Date();
    // 3 months back, current month, 3 months ahead
    for (let i = -2; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const lbl = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      opts.push({
        value: val,
        label: i === 0 ? `${lbl} (Current)` : lbl
      });
    }
    return opts;
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner & Status Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-500/20 border border-blue-400/30 rounded-xl text-blue-300">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Monthly School Fees Automation Engine</h2>
                <p className="text-xs text-slate-300">
                  Automated monthly recurring tuition &amp; service billing cycles, bulk generation, duplicate prevention, and parent reminders.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  config?.enabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${config?.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{config?.enabled ? 'Auto-Billing Engine Active' : 'Auto-Billing Paused'}</span>
              </span>

              <span className="text-xs text-slate-400 flex items-center space-x-1 bg-slate-800/60 px-3 py-1 rounded-lg border border-slate-700">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Billing Day: {config?.billingDayOfMonth || 1}st of Month</span>
              </span>

              <span className="text-xs text-slate-400 flex items-center space-x-1 bg-slate-800/60 px-3 py-1 rounded-lg border border-slate-700">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Due Date Offset: +{config?.dueDaysOffset || 15} Days</span>
              </span>

              {config?.lastRunDate && (
                <span className="text-xs text-slate-400 flex items-center space-x-1 bg-slate-800/60 px-3 py-1 rounded-lg border border-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Last Run: {new Date(config.lastRunDate).toLocaleDateString()} ({config.lastRunCount || 0} Invoices)</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveSection('runner')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-sm ${
                activeSection === 'runner'
                  ? 'bg-blue-600 text-white shadow-blue-500/25'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>1-Click Monthly Invoicing</span>
            </button>

            <button
              onClick={() => setActiveSection('settings')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-sm ${
                activeSection === 'settings'
                  ? 'bg-blue-600 text-white shadow-blue-500/25'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Automation Rules &amp; Schedule</span>
            </button>

            <button
              onClick={() => setActiveSection('history')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-sm ${
                activeSection === 'history'
                  ? 'bg-blue-600 text-white shadow-blue-500/25'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Execution Logs ({logs.length})</span>
            </button>

            <button
              onClick={() => setActiveSection('reminders')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-sm ${
                activeSection === 'reminders'
                  ? 'bg-blue-600 text-white shadow-blue-500/25'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Fee Reminders &amp; SMS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status / Alert Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: 1-CLICK MONTHLY INVOICING RUNNER & PREVIEW STUDIO               */}
      {/* ========================================================================= */}
      {activeSection === 'runner' && (
        <div className="space-y-6">
          {/* Runner Control Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <span>Interactive Monthly Invoicing Studio</span>
                  <span className="text-xs px-2.5 py-0.5 bg-blue-100 text-blue-700 font-mono rounded-full">
                    {getFormattedMonthName(selectedMonth)}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select target month, scope, and pricing model. The engine inspects every student, verifies duplicate status, and generates numbered monthly invoices.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={fetchPreview}
                  disabled={previewLoading}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${previewLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Preview</span>
                </button>
              </div>
            </div>

            {/* Parameter Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Month Picker */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Billing Month &amp; Year *
                </label>
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
                >
                  {monthOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Scope */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Student Scope *
                </label>
                <select
                  value={selectedScope}
                  onChange={e => setSelectedScope(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="ALL">All Active Enrolled Students ({students.filter(s => s.status === 'ACTIVE').length})</option>
                  <option value="GRADE">By Specific Grade / Level</option>
                  <option value="CLASS">By Specific Classroom</option>
                  <option value="PROGRAM">By Academic Program</option>
                </select>
              </div>

              {/* Conditional Scope Filter */}
              {selectedScope === 'GRADE' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Grade *
                  </label>
                  <select
                    value={selectedGradeId}
                    onChange={e => setSelectedGradeId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 cursor-pointer"
                  >
                    <option value="ALL">All Grades</option>
                    {grades.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedScope === 'CLASS' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Class *
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={e => setSelectedClassId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 cursor-pointer"
                  >
                    <option value="ALL">All Classes</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedScope === 'PROGRAM' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Program *
                  </label>
                  <select
                    value={selectedProgramId}
                    onChange={e => setSelectedProgramId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 cursor-pointer"
                  >
                    <option value="ALL">All Programs</option>
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Fee Structure / Rate Model */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Fee Structure / Rate Model
                </label>
                <select
                  value={selectedStructureId}
                  onChange={e => {
                    setSelectedStructureId(e.target.value);
                    if (e.target.value) setCustomAmount('');
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 cursor-pointer"
                >
                  <option value="">Auto-Match per Student Grade/Level</option>
                  {feeStructures.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({currencySymbol} {f.totalFee?.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Issue Date */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Invoice Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={e => setIssueDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Payment Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                />
              </div>

              {/* Custom Fixed Amount Override */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Fixed Monthly Amount ({currencySymbol})
                </label>
                <input
                  type="number"
                  placeholder="Leave empty for structure rate"
                  value={customAmount}
                  onChange={e => {
                    setCustomAmount(e.target.value);
                    if (e.target.value) setSelectedStructureId('');
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                />
              </div>

              {/* Force Regenerate Option */}
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="forceRegen"
                  checked={forceRegenerate}
                  onChange={e => setForceRegenerate(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <label htmlFor="forceRegen" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Force re-invoicing (skip duplicate protection)
                </label>
              </div>
            </div>

            {/* Live Metrics Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Target Eligible Students</span>
                <p className="text-xl font-bold font-mono text-slate-900">
                  {previewData?.eligibleStudentsCount || 0}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-emerald-600 uppercase">Will Generate (New)</span>
                <p className="text-xl font-bold font-mono text-emerald-700">
                  {forceRegenerate ? (previewData?.eligibleStudentsCount || 0) : (previewData?.willGenerateCount || 0)}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-blue-600 uppercase">Already Invoiced (Skipped)</span>
                <p className="text-xl font-bold font-mono text-blue-700">
                  {previewData?.alreadyInvoicedCount || 0}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-indigo-600 uppercase">Projected Monthly Total</span>
                <p className="text-xl font-bold font-mono text-indigo-700">
                  {currencySymbol} {(previewData?.estimatedTotalAmount || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Execute Run Action Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-500 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Duplicate protection is active: students with an existing invoice for {getFormattedMonthName(selectedMonth)} will not be billed twice unless forced.
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleSendReminders}
                  disabled={sendingReminders || !previewData || previewData.alreadyInvoicedCount === 0}
                  className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center space-x-2 cursor-pointer transition-colors disabled:opacity-50"
                  title="Send reminder SMS to parents with existing invoices"
                >
                  <Send className={`w-4 h-4 ${sendingReminders ? 'animate-bounce' : ''}`} />
                  <span>Send Fee Reminders</span>
                </button>

                <button
                  type="button"
                  onClick={handleRunAutomation}
                  disabled={runningAutomation || previewLoading || (previewData?.willGenerateCount === 0 && !forceRegenerate)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-blue-500/25 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Zap className={`w-4 h-4 ${runningAutomation ? 'animate-spin' : ''}`} />
                  <span>
                    {runningAutomation
                      ? 'Generating Invoices...'
                      : `Run Monthly Invoicing for ${getFormattedMonthName(selectedMonth)}`}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Student Matrix & Duplicate Inspection Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Target Students &amp; Generation Status ({filteredPreviewStudents.length})
                </h4>
                <p className="text-xs text-slate-500">
                  Review student list, fee pricing structure, and duplicate billing state before executing.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search student or admission..."
                    value={previewSearch}
                    onChange={e => setPreviewSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-56 focus:bg-white transition-all"
                  />
                </div>

                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
                  <button
                    onClick={() => setPreviewFilter('ALL')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      previewFilter === 'ALL' ? 'bg-white shadow-2xs font-semibold text-slate-900' : 'text-slate-600'
                    }`}
                  >
                    All ({previewData?.students?.length || 0})
                  </button>
                  <button
                    onClick={() => setPreviewFilter('UNINVOICED')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      previewFilter === 'UNINVOICED' ? 'bg-white shadow-2xs font-semibold text-emerald-700' : 'text-slate-600'
                    }`}
                  >
                    To Invoice ({previewData?.willGenerateCount || 0})
                  </button>
                  <button
                    onClick={() => setPreviewFilter('ALREADY_INVOICED')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      previewFilter === 'ALREADY_INVOICED' ? 'bg-white shadow-2xs font-semibold text-blue-700' : 'text-slate-600'
                    }`}
                  >
                    Already Invoiced ({previewData?.alreadyInvoicedCount || 0})
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Adm No.</th>
                    <th className="p-3">Grade / Class</th>
                    <th className="p-3">Fee Structure Rate</th>
                    <th className="p-3 text-right">Projected Amount</th>
                    <th className="p-3 text-center">Status for {getFormattedMonthName(selectedMonth)}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {previewLoading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
                        Evaluating student fee records and checking duplicate status...
                      </td>
                    </tr>
                  ) : filteredPreviewStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No students match the selected scope and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPreviewStudents.map((st, idx) => (
                      <tr key={st.studentId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-semibold text-slate-900 flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                            {st.fullName.charAt(0)}
                          </div>
                          <span>{st.fullName}</span>
                        </td>
                        <td className="p-3 font-mono font-medium text-slate-600">{st.admissionNo}</td>
                        <td className="p-3 text-slate-600">
                          {st.gradeName || st.className || st.programName || 'General'}
                        </td>
                        <td className="p-3 text-slate-500 font-mono text-[11px]">
                          {st.feeStructureName}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">
                          {currencySymbol} {st.projectedFee.toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          {st.alreadyInvoiced ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              <Check className="w-3 h-3 text-blue-600" />
                              <span>Invoiced ({st.existingInvoiceNo || 'Generated'})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Zap className="w-3 h-3 text-emerald-600" />
                              <span>Ready to Invoice</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: AUTOMATION RULES & RECURRING SETTINGS                          */}
      {/* ========================================================================= */}
      {activeSection === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Monthly Fee Automation Policies &amp; Schedule
                </h3>
                <p className="text-xs text-slate-500">
                  Configure automated schedule, default due date offsets, invoice numbering prefixes, and late payment penalties.
                </p>
              </div>

              <button
                type="submit"
                disabled={savingConfig}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-2 cursor-pointer transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{savingConfig ? 'Saving Settings...' : 'Save Automation Rules'}</span>
              </button>
            </div>

            {/* Master Toggle */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Enable Automated Monthly Invoicing</h4>
                <p className="text-xs text-slate-500">
                  When active, recurring fee invoices will be scheduled and eligible for 1-click batch generation.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.enabled}
                  onChange={e => setSettingsForm(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Schedule & Timing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Billing Day of Month (1 - 28)
                </label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={settingsForm.billingDayOfMonth || 1}
                  onChange={e => setSettingsForm(prev => ({ ...prev, billingDayOfMonth: Number(e.target.value) }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                />
                <p className="text-[11px] text-slate-400 mt-1">E.g. 1st of every month</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Payment Due Date Offset (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={settingsForm.dueDaysOffset || 15}
                  onChange={e => setSettingsForm(prev => ({ ...prev, dueDaysOffset: Number(e.target.value) }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                />
                <p className="text-[11px] text-slate-400 mt-1">E.g. 15 days after invoice issue date</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Invoice Number Prefix
                </label>
                <input
                  type="text"
                  value={settingsForm.invoicePrefix || 'MINV'}
                  onChange={e => setSettingsForm(prev => ({ ...prev, invoicePrefix: e.target.value.toUpperCase() }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                />
                <p className="text-[11px] text-slate-400 mt-1">E.g. MINV-{new Date().getFullYear()}-08-1001</p>
              </div>
            </div>

            {/* Scope & Default Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Default Target Student Scope
                </label>
                <select
                  value={settingsForm.targetScope || 'ALL_STUDENTS'}
                  onChange={e => setSettingsForm(prev => ({ ...prev, targetScope: e.target.value as any }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 cursor-pointer"
                >
                  <option value="ALL_STUDENTS">All Active Enrolled Students</option>
                  <option value="BY_GRADE">Specific Grades / Levels Only</option>
                  <option value="BY_CLASS">Specific Classrooms Only</option>
                  <option value="BY_PROGRAM">Specific Academic Programs Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Default Fee Structure Fallback
                </label>
                <select
                  value={settingsForm.defaultFeeStructureId || ''}
                  onChange={e => setSettingsForm(prev => ({ ...prev, defaultFeeStructureId: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 cursor-pointer"
                >
                  <option value="">Auto-Detect from Grade Fee Structure</option>
                  {feeStructures.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({currencySymbol} {f.totalFee?.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Late Fee & Notifications Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Auto-Apply Late Fee Penalties</h5>
                    <p className="text-[11px] text-slate-500">Automatically append late penalty if invoice is unpaid.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsForm.autoApplyLateFee}
                    onChange={e => setSettingsForm(prev => ({ ...prev, autoApplyLateFee: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>

                {settingsForm.autoApplyLateFee && (
                  <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-200">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Penalty Amount ({currencySymbol})</label>
                      <input
                        type="number"
                        value={settingsForm.lateFeeAmount || 500}
                        onChange={e => setSettingsForm(prev => ({ ...prev, lateFeeAmount: Number(e.target.value) }))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Days After Due Date</label>
                      <input
                        type="number"
                        value={settingsForm.lateFeeDaysAfterDue || 5}
                        onChange={e => setSettingsForm(prev => ({ ...prev, lateFeeDaysAfterDue: Number(e.target.value) }))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Auto-Dispatch Parent SMS &amp; Email</h5>
                    <p className="text-[11px] text-slate-500">Notify parents immediately upon monthly invoice creation.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsForm.autoSendNotification}
                    onChange={e => setSettingsForm(prev => ({ ...prev, autoSendNotification: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: AUTOMATION EXECUTION HISTORY & AUDIT LOGS                       */}
      {/* ========================================================================= */}
      {activeSection === 'history' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Monthly Automation Run History &amp; Audit Logs ({logs.length})
              </h3>
              <p className="text-xs text-slate-500">
                Complete traceability of automated and manual monthly batch invoice runs.
              </p>
            </div>

            <button
              onClick={loadAutomationData}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Logs</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Execution Date</th>
                  <th className="p-3">Month &amp; Year</th>
                  <th className="p-3">Triggered By</th>
                  <th className="p-3">Target Scope</th>
                  <th className="p-3 text-center">Invoices Created</th>
                  <th className="p-3 text-center">Duplicates Prevented</th>
                  <th className="p-3 text-right">Total Billed</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      No monthly automated runs executed yet. Go to "1-Click Monthly Invoicing" to run your first batch.
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono text-slate-600 text-[11px]">
                        {new Date(log.triggeredAt).toLocaleString()}
                      </td>
                      <td className="p-3 font-bold text-slate-900">{log.monthYear}</td>
                      <td className="p-3 text-slate-600">{log.triggeredBy}</td>
                      <td className="p-3 text-slate-500">{log.targetFilter}</td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-700">
                        {log.invoicesCreated}
                      </td>
                      <td className="p-3 text-center font-mono text-blue-700">
                        {log.duplicatesSkipped}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {currencySymbol} {log.totalAmountBilled.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {onNavigateToInvoices && (
                          <button
                            onClick={() => onNavigateToInvoices(log.monthYear)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-semibold flex items-center space-x-1 ml-auto cursor-pointer"
                          >
                            <span>View Invoices</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: FEE REMINDERS & BROADCAST                                      */}
      {/* ========================================================================= */}
      {activeSection === 'reminders' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Automated Monthly Fee Reminders &amp; Parent Broadcasts
              </h3>
              <p className="text-xs text-slate-500">
                Send bulk SMS, WhatsApp, and Email notices for monthly fee balances and upcoming payment deadlines.
              </p>
            </div>

            <button
              onClick={handleSendReminders}
              disabled={sendingReminders}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{sendingReminders ? 'Broadcasting...' : 'Broadcast Monthly Reminders Now'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                SMS / WhatsApp Notification Template
              </label>
              <textarea
                rows={5}
                value={reminderTemplate}
                onChange={e => setReminderTemplate(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-mono text-xs focus:bg-white transition-all"
              />
              <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
                <span className="font-semibold text-slate-700">Dynamic Tags:</span>
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-600">{'{student_name}'}</code>
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-600">{'{admission_no}'}</code>
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-600">{'{balance}'}</code>
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-600">{'{month}'}</code>
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-600">{'{due_date}'}</code>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Automated Schedule Cadence</h4>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Day 1 of Month:</strong> Automated invoice issuance alert with payment link &amp; Paybill details.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>3 Days Prior to Due Date:</strong> Gentle upcoming due date reminder sent to all pending balances.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Day After Due Date:</strong> Overdue notice and late fee alert.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
