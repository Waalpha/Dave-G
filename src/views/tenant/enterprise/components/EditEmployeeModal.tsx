import React, { useState, useEffect } from 'react';
import { EmployeeRecord } from '../../../../types';
import { User, X, CheckCircle2, ShieldAlert } from 'lucide-react';

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employee: EmployeeRecord | null;
  currencySymbol?: string;
  token?: string;
}

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employee,
  currencySymbol = 'KES',
  token
}) => {
  const [fullName, setFullName] = useState('');
  const [employeeNo, setEmployeeNo] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [department, setDepartment] = useState('Sales & Operations');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [contractEndDate, setContractEndDate] = useState('');
  const [basicSalary, setBasicSalary] = useState(40000);
  const [allowances, setAllowances] = useState(0);
  const [deductions, setDeductions] = useState(0);
  const [employmentStatus, setEmploymentStatus] = useState<EmployeeRecord['employmentStatus']>('FULL_TIME');
  const [kraPin, setKraPin] = useState('');
  const [nssfNo, setNssfNo] = useState('');
  const [nhifShifNo, setNhifShifNo] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (employee) {
      setFullName(employee.fullName || '');
      setEmployeeNo(employee.employeeNo || '');
      setNationalId(employee.nationalId || '');
      setDepartment(employee.department || 'General Operations');
      setJobTitle(employee.jobTitle || '');
      setPhone(employee.phone || '');
      setEmail(employee.email || '');
      setHireDate(employee.hireDate || '');
      setContractEndDate(employee.contractEndDate || '');
      setBasicSalary(employee.basicSalary || 0);
      setAllowances(employee.allowances || 0);
      setDeductions(employee.deductions || 0);
      setEmploymentStatus(employee.employmentStatus || 'FULL_TIME');
      setKraPin(employee.kraPin || '');
      setNssfNo(employee.nssfNo || '');
      setNhifShifNo(employee.nhifShifNo || '');
      setBankName(employee.bankName || '');
      setBankAccountNo(employee.bankAccountNo || '');
      setEmergencyContactName(employee.emergencyContactName || '');
      setEmergencyContactPhone(employee.emergencyContactPhone || '');
      setNotes(employee.notes || '');
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Staff full name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        fullName: fullName.trim(),
        employeeNo: employeeNo.trim(),
        nationalId: nationalId.trim(),
        department: department.trim(),
        jobTitle: jobTitle.trim(),
        phone: phone.trim(),
        email: email.trim(),
        hireDate,
        contractEndDate: contractEndDate || undefined,
        basicSalary: Number(basicSalary) || 0,
        allowances: Number(allowances) || 0,
        deductions: Number(deductions) || 0,
        employmentStatus,
        kraPin: kraPin.trim() || undefined,
        nssfNo: nssfNo.trim() || undefined,
        nhifShifNo: nhifShifNo.trim() || undefined,
        bankName: bankName.trim() || undefined,
        bankAccountNo: bankAccountNo.trim() || undefined,
        emergencyContactName: emergencyContactName.trim() || undefined,
        emergencyContactPhone: emergencyContactPhone.trim() || undefined,
        notes: notes.trim() || undefined
      };

      const res = await fetch(`/api/app/hr/employees/${employee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to update employee details');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error updating employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 border border-slate-200">
        <div className="bg-blue-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Edit Staff Profile: {employee.fullName}</h3>
              <p className="text-xs text-blue-100">Update employee credentials, remuneration & status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-100 hover:text-white p-1.5 rounded-lg hover:bg-blue-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Staff / Employee # *</label>
              <input
                type="text"
                required
                value={employeeNo}
                onChange={e => setEmployeeNo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">National ID / Passport #</label>
              <input
                type="text"
                value={nationalId}
                onChange={e => setNationalId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Status</label>
              <select
                value={employmentStatus}
                onChange={e => setEmploymentStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="FULL_TIME">Full Time Permanent</option>
                <option value="CONTRACT">Fixed Term Contract</option>
                <option value="PROBATION">Probationary Period</option>
                <option value="ON_LEAVE">On Authorized Leave</option>
                <option value="SUSPENDED">Suspended Pending Review</option>
                <option value="TERMINATED">Terminated / Separated</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                required
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title / Designation</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Salary & Remuneration */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Remuneration & Compensation ({currencySymbol})</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Basic Salary</label>
                <input
                  type="number"
                  min={0}
                  value={basicSalary}
                  onChange={e => setBasicSalary(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Allowances</label>
                <input
                  type="number"
                  min={0}
                  value={allowances}
                  onChange={e => setAllowances(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm font-bold text-emerald-600 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Deductions</label>
                <input
                  type="number"
                  min={0}
                  value={deductions}
                  onChange={e => setDeductions(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm font-bold text-rose-600 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Statutory & Banking */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">KRA PIN</label>
              <input
                type="text"
                placeholder="A00..."
                value={kraPin}
                onChange={e => setKraPin(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">NSSF Number</label>
              <input
                type="text"
                value={nssfNo}
                onChange={e => setNssfNo(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SHIF / NHIF Number</label>
              <input
                type="text"
                value={nhifShifNo}
                onChange={e => setNhifShifNo(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
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
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-md disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
