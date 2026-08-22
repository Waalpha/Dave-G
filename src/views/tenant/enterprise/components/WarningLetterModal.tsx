import React, { useState } from 'react';
import { StaffWarningLetter, EmployeeRecord, WarningLevel, InfractionCategory } from '../../../../types';
import { AlertTriangle, X, ShieldAlert, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';

interface WarningLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employees: EmployeeRecord[];
  initialEmployeeId?: string;
  token?: string;
}

export const WarningLetterModal: React.FC<WarningLetterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employees,
  initialEmployeeId,
  token
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(initialEmployeeId || (employees[0]?.id || ''));
  const [warningLevel, setWarningLevel] = useState<WarningLevel>('FIRST_WARNING');
  const [infractionCategory, setInfractionCategory] = useState<InfractionCategory>('ATTENDANCE_TARDINESS');
  const [incidentDate, setIncidentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [priorDiscussionDate, setPriorDiscussionDate] = useState<string>('');
  const [incidentDescription, setIncidentDescription] = useState<string>('');
  const [requiredCorrectiveActions, setRequiredCorrectiveActions] = useState<string>('');
  const [improvementTimelineDays, setImprovementTimelineDays] = useState<number>(30);
  const [consequenceSummary, setConsequenceSummary] = useState<string>(
    'Failure to demonstrate sustained improvement within the stipulated timeline will lead to escalation of disciplinary action up to and including termination of employment.'
  );
  const [issuedBy, setIssuedBy] = useState<string>('Head of Human Resources');
  const [issuedByTitle, setIssuedByTitle] = useState<string>('HR & Administration Director');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetEmp = employees.find(e => e.id === selectedEmpId) || employees[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmp) {
      setError('Please select an employee');
      return;
    }
    if (!incidentDescription.trim()) {
      setError('Incident narrative description is required');
      return;
    }
    if (!requiredCorrectiveActions.trim()) {
      setError('Required corrective actions are required');
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
        warningLevel,
        infractionCategory,
        incidentDate,
        priorDiscussionDate: priorDiscussionDate || undefined,
        incidentDescription: incidentDescription.trim(),
        requiredCorrectiveActions: requiredCorrectiveActions.trim(),
        improvementTimelineDays: Number(improvementTimelineDays) || 30,
        consequenceSummary: consequenceSummary.trim(),
        issuedBy: issuedBy.trim(),
        issuedByTitle: issuedByTitle.trim(),
        issuedAt: new Date().toISOString(),
        status: 'ISSUED',
        notes: notes.trim() || undefined
      };

      const res = await fetch('/api/app/hr/warning-letters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to issue warning letter');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error issuing warning letter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 border border-slate-200">
        <div className="bg-amber-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Issue Formal Disciplinary Warning</h3>
              <p className="text-xs text-amber-100">Draft and register an official letter for employee record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-amber-100 hover:text-white p-1.5 rounded-lg hover:bg-amber-700/50 transition"
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
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
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
                <div><span className="text-slate-400">National ID:</span> <span className="font-semibold">{targetEmp.nationalId}</span></div>
                <div><span className="text-slate-400">Status:</span> <span className="font-semibold">{targetEmp.employmentStatus}</span></div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Warning Level *</label>
              <select
                value={warningLevel}
                onChange={e => setWarningLevel(e.target.value as WarningLevel)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="FIRST_WARNING">First Formal Warning</option>
                <option value="SECOND_WARNING">Second Formal Warning</option>
                <option value="FINAL_WARNING">Final Warning Letter</option>
                <option value="PERFORMANCE_IMPROVEMENT_PLAN">Performance Improvement Plan (PIP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Infraction Category *</label>
              <select
                value={infractionCategory}
                onChange={e => setInfractionCategory(e.target.value as InfractionCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="ATTENDANCE_TARDINESS">Attendance & Chronic Tardiness</option>
                <option value="INSUBORDINATION">Insubordination / Disobedience</option>
                <option value="POLICY_VIOLATION">Company Policy Violation</option>
                <option value="NEGLIGENCE_OF_DUTY">Negligence of Duty</option>
                <option value="POOR_PERFORMANCE">Unsatisfactory Job Performance</option>
                <option value="GROSS_MISCONDUCT">Gross Misconduct</option>
                <option value="FINANCIAL_IRREGULARITY">Financial / Asset Irregularity</option>
                <option value="CONFIDENTIALITY_BREACH">Confidentiality & Data Breach</option>
                <option value="WORKPLACE_SAFETY">Safety / Environmental Violation</option>
                <option value="OTHER">Other Disciplinary Grounds</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Incident / Infraction *</label>
              <input
                type="date"
                required
                value={incidentDate}
                onChange={e => setIncidentDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prior Verbal Discussion Date (Optional)</label>
              <input
                type="date"
                value={priorDiscussionDate}
                onChange={e => setPriorDiscussionDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Description & Narrative *</label>
            <textarea
              rows={3}
              required
              placeholder="State the factual specifics, dates, and impact of the infraction..."
              value={incidentDescription}
              onChange={e => setIncidentDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Required Corrective Actions & Expected Performance *</label>
            <textarea
              rows={3}
              required
              placeholder="Specify the clear benchmarks, behavior modifications, and deliverables required..."
              value={requiredCorrectiveActions}
              onChange={e => setRequiredCorrectiveActions(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Review Period (Days)</label>
              <input
                type="number"
                min={7}
                max={180}
                required
                value={improvementTimelineDays}
                onChange={e => setImprovementTimelineDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Consequence Clause</label>
              <input
                type="text"
                required
                value={consequenceSummary}
                onChange={e => setConsequenceSummary(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Authorized Issuer Name</label>
              <input
                type="text"
                required
                value={issuedBy}
                onChange={e => setIssuedBy(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issuer Title / Designation</label>
              <input
                type="text"
                required
                value={issuedByTitle}
                onChange={e => setIssuedByTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Internal HR Notes (Optional)</label>
            <input
              type="text"
              placeholder="Confidential remarks for HR personnel record..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
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
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition shadow-md disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Issue Warning Letter</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
