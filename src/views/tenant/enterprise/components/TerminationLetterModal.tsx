import React, { useState } from 'react';
import { StaffTerminationLetter, EmployeeRecord, TerminationType } from '../../../../types';
import { UserX, X, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

interface TerminationLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employees: EmployeeRecord[];
  initialEmployeeId?: string;
  currencySymbol?: string;
  token?: string;
}

const DEFAULT_CLEARANCE_ITEMS = [
  'Handover of all departmental physical keys and security access badges',
  'Return of company-issued laptop, mobile phone, and hardware peripherals',
  'Transfer of email accounts, source code repositories, and system administrative logins',
  'Submission of outstanding departmental operational files and client contact records',
  'Reconciliation of outstanding petty cash floats and expense receipts',
  'Final signoff on formal Departmental Clearance Certificate'
];

export const TerminationLetterModal: React.FC<TerminationLetterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employees,
  initialEmployeeId,
  currencySymbol = 'KES',
  token
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(initialEmployeeId || (employees[0]?.id || ''));
  const [terminationType, setTerminationType] = useState<TerminationType>('TERMINATION_WITH_NOTICE');
  const [effectiveDate, setEffectiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [lastWorkingDate, setLastWorkingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [groundsForTermination, setGroundsForTermination] = useState<string>('');
  const [noticePeriodProvidedDays, setNoticePeriodProvidedDays] = useState<number>(30);
  const [severanceOrFinalDuesDescription, setSeveranceOrFinalDuesDescription] = useState<string>(
    'Final dues shall comprise pro-rata salary for the active month, payment in lieu of untaken accrued annual leave, and standard statutory benefits upon clearance.'
  );
  const [finalSettlementAmount, setFinalSettlementAmount] = useState<number>(0);
  const [clearanceRequirements, setClearanceRequirements] = useState<string[]>(DEFAULT_CLEARANCE_ITEMS);
  const [newClearanceItem, setNewClearanceItem] = useState<string>('');
  const [certificateOfServiceIssued, setCertificateOfServiceIssued] = useState<boolean>(true);
  const [updateEmployeeStatus, setUpdateEmployeeStatus] = useState<boolean>(true);
  const [issuedBy, setIssuedBy] = useState<string>('Managing Director / HR Director');
  const [issuedByTitle, setIssuedByTitle] = useState<string>('Chief Executive & Appointing Authority');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetEmp = employees.find(e => e.id === selectedEmpId) || employees[0];

  const handleAddClearanceItem = () => {
    if (newClearanceItem.trim()) {
      setClearanceRequirements([...clearanceRequirements, newClearanceItem.trim()]);
      setNewClearanceItem('');
    }
  };

  const handleRemoveClearanceItem = (idx: number) => {
    setClearanceRequirements(clearanceRequirements.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmp) {
      setError('Please select an employee');
      return;
    }
    if (!groundsForTermination.trim()) {
      setError('Grounds for termination are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        employeeId: targetEmp.id,
        employeeName: targetEmp.fullName,
        employeeNo: targetEmp.employeeNo,
        department: targetEmp.department,
        jobTitle: targetEmp.jobTitle,
        terminationType,
        effectiveDate,
        lastWorkingDate,
        groundsForTermination: groundsForTermination.trim(),
        noticePeriodProvidedDays: Number(noticePeriodProvidedDays) || 0,
        severanceOrFinalDuesDescription: severanceOrFinalDuesDescription.trim() || undefined,
        finalSettlementAmount: Number(finalSettlementAmount) || undefined,
        clearanceRequirements,
        certificateOfServiceIssued,
        updateEmployeeStatus,
        issuedBy: issuedBy.trim(),
        issuedByTitle: issuedByTitle.trim(),
        issuedAt: new Date().toISOString(),
        status: 'ISSUED',
        notes: notes.trim() || undefined
      };

      const res = await fetch('/api/app/hr/termination-letters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to issue termination letter');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error issuing termination letter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 border border-slate-200">
        <div className="bg-rose-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-600 rounded-lg">
              <UserX className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Issue Formal Termination Letter</h3>
              <p className="text-xs text-rose-100">Draft statutory termination notice, clearance terms & final dues</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-rose-100 hover:text-white p-1.5 rounded-lg hover:bg-rose-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Employee Selection */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Select Employee</label>
            <select
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.employeeNo}) — {emp.jobTitle} [{emp.department}]
                </option>
              ))}
            </select>
            {targetEmp && (
              <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200">
                <div><span className="text-slate-400">Department:</span> <span className="font-semibold">{targetEmp.department}</span></div>
                <div><span className="text-slate-400">Basic Salary:</span> <span className="font-semibold">{currencySymbol} {targetEmp.basicSalary.toLocaleString()}</span></div>
                <div><span className="text-slate-400">Status:</span> <span className="font-semibold">{targetEmp.employmentStatus}</span></div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Termination Type *</label>
              <select
                value={terminationType}
                onChange={e => setTerminationType(e.target.value as TerminationType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              >
                <option value="TERMINATION_WITH_NOTICE">Termination with Contractual Notice</option>
                <option value="SUMMARY_DISMISSAL">Summary Dismissal (Gross Misconduct)</option>
                <option value="REDUNDANCY">Redundancy / Structural Downsizing</option>
                <option value="END_OF_CONTRACT">Non-Renewal / Expiration of Fixed Term Contract</option>
                <option value="PROBATION_FAILURE">Unsuccessful Probation Assessment</option>
                <option value="MUTUAL_SEPARATION">Mutual Separation Agreement</option>
                <option value="RESIGNATION_ACCEPTANCE">Formal Acceptance of Staff Resignation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Period Provided (Days)</label>
              <input
                type="number"
                min={0}
                max={180}
                required
                value={noticePeriodProvidedDays}
                onChange={e => setNoticePeriodProvidedDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notice / Letter Effective Date *</label>
              <input
                type="date"
                required
                value={effectiveDate}
                onChange={e => setEffectiveDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Official Working Date *</label>
              <input
                type="date"
                required
                value={lastWorkingDate}
                onChange={e => setLastWorkingDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Grounds & Factual Summary of Termination *</label>
            <textarea
              rows={3}
              required
              placeholder="Detail the formal legal and contractual grounds supporting the termination action..."
              value={groundsForTermination}
              onChange={e => setGroundsForTermination(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Final Settlement ({currencySymbol})</label>
              <input
                type="number"
                min={0}
                value={finalSettlementAmount}
                onChange={e => setFinalSettlementAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Certificate of Service</label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={certificateOfServiceIssued}
                  onChange={e => setCertificateOfServiceIssued(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span className="text-xs text-slate-700 font-medium">Issue Certificate of Service upon full clearance</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Final Dues & Severance Settlement Narrative</label>
            <textarea
              rows={2}
              value={severanceOrFinalDuesDescription}
              onChange={e => setSeveranceOrFinalDuesDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          {/* Clearance Items Checklist */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Mandatory Clearance Checklist</label>
            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {clearanceRequirements.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                  <span>• {item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveClearanceItem(idx)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add custom clearance prerequisite item..."
                  value={newClearanceItem}
                  onChange={e => setNewClearanceItem(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddClearanceItem}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-medium shrink-0"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={updateEmployeeStatus}
                onChange={e => setUpdateEmployeeStatus(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
              <span className="text-xs text-amber-900 font-semibold">
                Automatically update employee status to "TERMINATED" in Staff Roster
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Authorized Issuer Name</label>
              <input
                type="text"
                required
                value={issuedBy}
                onChange={e => setIssuedBy(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issuer Title / Designation</label>
              <input
                type="text"
                required
                value={issuedByTitle}
                onChange={e => setIssuedByTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-sm font-semibold transition shadow-md disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Issue Termination Letter</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
