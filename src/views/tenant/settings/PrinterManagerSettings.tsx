import React, { useState, useEffect } from 'react';
import {
  Printer,
  Plus,
  RefreshCw,
  Trash2,
  Edit2,
  CheckCircle,
  AlertTriangle,
  Play,
  DollarSign,
  Network,
  Usb,
  Cpu,
  Sliders,
  Clock,
  ShieldCheck,
  FileText,
  HelpCircle,
  Check,
  X
} from 'lucide-react';
import { PrinterDevice, PrinterInterfaceType, PrinterPaperWidth, PrinterStationTarget, PrintJobRecord, PrinterAuditLog, Tenant } from '../../../types';
import { printService } from '../../../lib/printService';

interface PrinterManagerSettingsProps {
  tenant: Tenant;
}

export const PrinterManagerSettings: React.FC<PrinterManagerSettingsProps> = ({ tenant }) => {
  const [activeTab, setActiveTab] = useState<'printers' | 'queue' | 'audit'>('printers');
  const [printers, setPrinters] = useState<PrinterDevice[]>([]);
  const [printJobs, setPrintJobs] = useState<PrintJobRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<PrinterAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState<string>('ALL');

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Partial<PrinterDevice> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testingPrinterId, setTestingPrinterId] = useState<string | null>(null);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-user-id': localStorage.getItem('erp_user_id') || '',
    'x-tenant-id': tenant.id
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prnRes, jobRes, logRes] = await Promise.all([
        fetch('/api/app/printers', { headers: getHeaders() }),
        fetch('/api/app/print-jobs', { headers: getHeaders() }),
        fetch('/api/app/printers/audit-logs', { headers: getHeaders() })
      ]);

      if (prnRes.ok) {
        const prnData = await prnRes.json();
        setPrinters(prnData.printers || []);
      }
      if (jobRes.ok) {
        const jobData = await jobRes.json();
        setPrintJobs(jobData.jobs || []);
      }
      if (logRes.ok) {
        const logData = await logRes.json();
        setAuditLogs(logData.logs || []);
      }
    } catch (err) {
      console.error('Failed to load printer data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenant.id]);

  const handleOpenAdd = () => {
    setEditingPrinter({
      name: 'EPSON TM-T20 / Standard Thermal',
      stationTarget: 'CASHIER',
      interfaceType: 'SYSTEM_DEFAULT',
      paperWidth: '80mm',
      isDefault: printers.length === 0,
      autoPrint: true,
      kickCashDrawer: false,
      cutPaper: true,
      copies: 1,
      port: 9100,
      serialBaudRate: 9600,
      bridgeUrl: 'http://127.0.0.1:9100',
      status: 'ONLINE'
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (printer: PrinterDevice) => {
    setEditingPrinter({ ...printer });
    setIsEditModalOpen(true);
  };

  const handleSavePrinter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrinter || !editingPrinter.name) return;

    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/app/printers', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(editingPrinter)
      });
      const data = await res.json();
      if (res.ok && data.printer) {
        setStatusMessage({ type: 'success', text: `Printer "${data.printer.name}" saved successfully.` });
        setIsEditModalOpen(false);
        await loadData();
      } else {
        throw new Error(data.error || 'Failed to save printer');
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Save error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePrinter = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove printer "${name}"?`)) return;
    try {
      const res = await fetch(`/api/app/printers/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setStatusMessage({ type: 'success', text: `Printer "${name}" deleted.` });
        await loadData();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Delete failed' });
    }
  };

  const handleTestPrint = async (printer: PrinterDevice) => {
    setTestingPrinterId(printer.id);
    setStatusMessage(null);
    try {
      const tenantName = tenant.branding?.companyName || tenant.name;
      const res = await printService.testPrinter(printer, tenantName, 'Admin');
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
      } else {
        setStatusMessage({ type: 'error', text: res.message + (res.error ? `: ${res.error}` : '') });
      }
      await loadData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Test failed' });
    } finally {
      setTestingPrinterId(null);
    }
  };

  const handleKickDrawer = async (printer: PrinterDevice) => {
    try {
      const ok = await printService.kickCashDrawer(printer);
      if (ok) {
        setStatusMessage({ type: 'success', text: `Cash drawer pulse sent to ${printer.name}` });
      } else {
        setStatusMessage({ type: 'error', text: `Failed to trigger drawer on ${printer.name}` });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const handleRetryJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/app/print-jobs/${jobId}/retry`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: `Retrying print job ${jobId}...` });
        await loadData();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const filteredPrinters = selectedStation === 'ALL'
    ? printers
    : printers.filter(p => p.stationTarget === selectedStation || p.stationTarget === 'ALL');

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Printer className="h-6 w-6 text-emerald-400" />
            Physical Receipt Printers & Hardware Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure direct ESC/POS USB, LAN Network, Serial, and Print Bridge hardware for POS, fees, medical, and hospitality counters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" />
            <span>Add Physical Printer</span>
          </button>
        </div>
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div
          className={`flex items-center justify-between rounded-lg p-3 text-xs font-medium ${
            statusMessage.type === 'success'
              ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
              : 'border border-rose-500/20 bg-rose-500/10 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('printers')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
            activeTab === 'printers'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Printer className="h-4 w-4" />
          <span>Configured Printers ({printers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
            activeTab === 'queue'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Print Queue & Retries ({printJobs.filter(j => j.status === 'OFFLINE_QUEUED' || j.status === 'PRINTING').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-colors ${
            activeTab === 'audit'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Security Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: CONFIGURED PRINTERS */}
      {activeTab === 'printers' && (
        <div className="space-y-4">
          {/* Station Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Target Station:</span>
            {['ALL', 'CASHIER', 'KITCHEN', 'BAR', 'RECEPTION', 'FINANCE', 'DISPENSARY', 'BOOKSHOP'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStation(st)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedStation === st
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Printers Grid */}
          {filteredPrinters.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center">
              <Printer className="mx-auto h-10 w-10 text-slate-600 mb-2" />
              <h3 className="text-sm font-semibold text-slate-300">No Physical Printers Configured</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Connect your ESC/POS thermal receipt printer via USB, Network LAN, or Serial to enable automatic printing on checkout.
              </p>
              <button
                onClick={handleOpenAdd}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                <Plus className="h-4 w-4" />
                <span>Configure Your First Printer</span>
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPrinters.map((printer) => (
                <div
                  key={printer.id}
                  className={`flex flex-col justify-between rounded-xl border bg-slate-900/80 p-5 shadow-sm transition-all ${
                    printer.isDefault ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' : 'border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-emerald-400">
                          {printer.interfaceType === 'NETWORK_LAN' ? (
                            <Network className="h-5 w-5 text-sky-400" />
                          ) : printer.interfaceType === 'WEB_USB' ? (
                            <Usb className="h-5 w-5 text-purple-400" />
                          ) : printer.interfaceType === 'LOCAL_BRIDGE' ? (
                            <Cpu className="h-5 w-5 text-amber-400" />
                          ) : (
                            <Printer className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-100">{printer.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
                              {printer.stationTarget}
                            </span>
                            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
                              {printer.paperWidth}
                            </span>
                            {printer.isDefault && (
                              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(printer)}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                          title="Edit Settings"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePrinter(printer.id, printer.name)}
                          className="rounded p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400"
                          title="Remove Printer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Printer Connection Specs */}
                    <div className="rounded-lg bg-slate-950/60 p-3 text-[11px] space-y-1 text-slate-300 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Interface:</span>
                        <span className="text-slate-200">{printer.interfaceType.replace('_', ' ')}</span>
                      </div>
                      {printer.interfaceType === 'NETWORK_LAN' && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Endpoint:</span>
                          <span className="text-sky-300">{printer.ipAddress}:{printer.port || 9100}</span>
                        </div>
                      )}
                      {printer.interfaceType === 'LOCAL_BRIDGE' && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Bridge URL:</span>
                          <span className="text-amber-300 truncate max-w-[160px]">{printer.bridgeUrl}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-500">Auto-Print:</span>
                        <span className={printer.autoPrint ? 'text-emerald-400' : 'text-slate-400'}>
                          {printer.autoPrint ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Cash Drawer Pulse:</span>
                        <span className={printer.kickCashDrawer ? 'text-emerald-400' : 'text-slate-400'}>
                          {printer.kickCashDrawer ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-4 flex items-center gap-2 border-t border-slate-800 pt-3">
                    <button
                      onClick={() => handleTestPrint(printer)}
                      disabled={testingPrinterId === printer.id}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50"
                    >
                      <Play className={`h-3 w-3 text-emerald-400 ${testingPrinterId === printer.id ? 'animate-spin' : ''}`} />
                      <span>{testingPrinterId === printer.id ? 'Testing...' : 'Test Slip'}</span>
                    </button>
                    {printer.kickCashDrawer && (
                      <button
                        onClick={() => handleKickDrawer(printer)}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                        title="Kick Cash Drawer"
                      >
                        <DollarSign className="h-3 w-3 text-amber-400" />
                        <span>Drawer</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRINT QUEUE & RETRIES */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Live Thermal Print Queue</h3>
                <p className="text-xs text-slate-400">
                  Transactions are safely recorded in the database regardless of printer connectivity. Failed jobs queue automatically.
                </p>
              </div>
              <button
                onClick={loadData}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
              >
                Refresh Queue
              </button>
            </div>

            {printJobs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No active or pending print jobs. All previous receipts printed successfully.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-medium">
                    <tr>
                      <th className="p-3">Job ID</th>
                      <th className="p-3">Receipt No</th>
                      <th className="p-3">Target Printer</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Attempts</th>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {printJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-mono text-slate-400">{job.id.substring(0, 10)}...</td>
                        <td className="p-3 font-mono font-medium text-emerald-400">{job.receiptNumber}</td>
                        <td className="p-3 text-slate-300">{job.printerName} ({job.stationTarget})</td>
                        <td className="p-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              job.status === 'COMPLETED'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : job.status === 'OFFLINE_QUEUED'
                                ? 'bg-amber-500/10 text-amber-400'
                                : job.status === 'PRINTING'
                                ? 'bg-sky-500/10 text-sky-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {job.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{job.attempts} / {job.maxAttempts}</td>
                        <td className="p-3 text-slate-400">{new Date(job.createdAt).toLocaleTimeString()}</td>
                        <td className="p-3 text-right">
                          {job.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleRetryJob(job.id)}
                              className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/20"
                            >
                              Retry Print
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h3 className="text-sm font-semibold text-slate-100 mb-1">Receipt & Printer Security Audit Trail</h3>
            <p className="text-xs text-slate-400 mb-4">
              Every printed receipt, official reprint, hardware test, and configuration modification is immutably logged with operator identity.
            </p>

            {auditLogs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No audit events recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-medium">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Operator</th>
                      <th className="p-3">Receipt / Printer</th>
                      <th className="p-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40">
                        <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-3">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                              log.action === 'REPRINT_ISSUED'
                                ? 'bg-amber-500/10 text-amber-400'
                                : log.action === 'PRINT_SUCCESS'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 text-slate-200">{log.userName} ({log.userRole})</td>
                        <td className="p-3 text-emerald-400">{log.receiptNumber || log.printerName || '-'}</td>
                        <td className="p-3 text-slate-300 font-sans">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD / EDIT PRINTER MODAL */}
      {isEditModalOpen && editingPrinter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Printer className="h-5 w-5 text-emerald-400" />
                <span>{editingPrinter.id ? 'Edit Printer Configuration' : 'Add Physical Receipt Printer'}</span>
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrinter} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* Printer Name */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">Printer Device Name *</label>
                <input
                  type="text"
                  required
                  value={editingPrinter.name || ''}
                  onChange={(e) => setEditingPrinter({ ...editingPrinter, name: e.target.value })}
                  placeholder="e.g. Front Cashier Thermal / Kitchen EPSON TM-T20"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Station Target & Interface Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Target Station / Department</label>
                  <select
                    value={editingPrinter.stationTarget || 'CASHIER'}
                    onChange={(e) => setEditingPrinter({ ...editingPrinter, stationTarget: e.target.value as PrinterStationTarget })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="CASHIER">Cashier Counter / Retail POS</option>
                    <option value="KITCHEN">Kitchen (Hot Food Orders)</option>
                    <option value="BAR">Bar & Beverage Station</option>
                    <option value="RECEPTION">Reception / Front Desk</option>
                    <option value="FINANCE">Finance & Bursary Fees</option>
                    <option value="DISPENSARY">Hospital Pharmacy / Dispensary</option>
                    <option value="BOOKSHOP">Bookshop & Merchandise</option>
                    <option value="ALL">All Stations (Universal Default)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Hardware Interface Type</label>
                  <select
                    value={editingPrinter.interfaceType || 'SYSTEM_DEFAULT'}
                    onChange={(e) => setEditingPrinter({ ...editingPrinter, interfaceType: e.target.value as PrinterInterfaceType })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="SYSTEM_DEFAULT">System Default / Browser Driver</option>
                    <option value="NETWORK_LAN">Network LAN / Ethernet TCP (Direct IP)</option>
                    <option value="LOCAL_BRIDGE">Local Print Bridge (Port 9100 / Agent)</option>
                    <option value="WEB_USB">WebUSB Direct Hardware API</option>
                    <option value="WEB_SERIAL">Web Serial / COM Port</option>
                  </select>
                </div>
              </div>

              {/* Interface Parameters */}
              {editingPrinter.interfaceType === 'NETWORK_LAN' && (
                <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-3 space-y-3">
                  <div className="text-[11px] font-semibold text-sky-400 flex items-center gap-1.5">
                    <Network className="h-4 w-4" />
                    <span>Network LAN Configuration (Raw TCP Socket)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block font-medium text-slate-300 mb-1">Printer IP Address *</label>
                      <input
                        type="text"
                        placeholder="192.168.1.150"
                        value={editingPrinter.ipAddress || ''}
                        onChange={(e) => setEditingPrinter({ ...editingPrinter, ipAddress: e.target.value })}
                        className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-300 mb-1">Port (Default 9100)</label>
                      <input
                        type="number"
                        placeholder="9100"
                        value={editingPrinter.port || 9100}
                        onChange={(e) => setEditingPrinter({ ...editingPrinter, port: Number(e.target.value) })}
                        className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editingPrinter.interfaceType === 'LOCAL_BRIDGE' && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-2">
                  <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5">
                    <Cpu className="h-4 w-4" />
                    <span>Local Print Bridge Agent Endpoint</span>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Bridge Agent URL</label>
                    <input
                      type="text"
                      placeholder="http://127.0.0.1:9100"
                      value={editingPrinter.bridgeUrl || 'http://127.0.0.1:9100'}
                      onChange={(e) => setEditingPrinter({ ...editingPrinter, bridgeUrl: e.target.value })}
                      className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Paper Width & Copies */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Paper Format / Page Size</label>
                  <select
                    value={editingPrinter.paperWidth || '80mm'}
                    onChange={(e) => setEditingPrinter({ ...editingPrinter, paperWidth: e.target.value as PrinterPaperWidth })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="80mm">80mm (Standard POS Thermal Roll - 48 cols)</option>
                    <option value="58mm">58mm (Compact Mobile POS Thermal Roll - 32 cols)</option>
                    <option value="A4">A4 Full Page Document (Standard Laser / Inkjet)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Copies per Transaction</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={editingPrinter.copies || 1}
                    onChange={(e) => setEditingPrinter({ ...editingPrinter, copies: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Hardware Feature Checkboxes */}
              <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPrinter.autoPrint ?? true}
                    onChange={(e) => setEditingPrinter({ ...editingPrinter, autoPrint: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-emerald-500"
                  />
                  <span className="text-slate-200">Automatically print receipt on completed checkout</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPrinter.kickCashDrawer ?? false}
                    onChange={(e) => setEditingPrinter({ ...editingPrinter, kickCashDrawer: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-emerald-500"
                  />
                  <span className="text-slate-200">Send cash drawer pulse command (pin 2/5 trigger)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPrinter.cutPaper ?? true}
                    onChange={(e) => setEditingPrinter({ ...editingPrinter, cutPaper: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-emerald-500"
                  />
                  <span className="text-slate-200">Trigger automatic paper cutter at end of receipt</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPrinter.isDefault ?? false}
                    onChange={(e) => setEditingPrinter({ ...editingPrinter, isDefault: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-emerald-500"
                  />
                  <span className="text-slate-200 font-medium text-emerald-400">Set as default printer for this organization</span>
                </label>
              </div>

              {/* Custom Header / Footer */}
              <div className="space-y-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Custom Header Message (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Welcome to our Store / Branch"
                    value={editingPrinter.customHeader || ''}
                    onChange={(e) => setEditingPrinter({ ...editingPrinter, customHeader: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Custom Footer Message (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Goods once sold are not returnable / God Bless You"
                    value={editingPrinter.customFooter || ''}
                    onChange={(e) => setEditingPrinter({ ...editingPrinter, customFooter: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Printer Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
