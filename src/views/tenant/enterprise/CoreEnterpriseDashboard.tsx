import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Users, TrendingUp, Plus, 
  RefreshCw, FileText, CheckCircle2, Shield
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { AccountingLedgerEntry, EmployeeRecord, CrmLeadCustomer } from '../../../types';

export const CoreEnterpriseDashboard: React.FC<{ defaultTab?: 'accounting' | 'hr' | 'crm' }> = ({
  defaultTab = 'accounting'
}) => {
  const { currentTenant, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'accounting' | 'hr' | 'crm'>(defaultTab);

  const [ledger, setLedger] = useState<AccountingLedgerEntry[]>([]);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [leads, setLeads] = useState<CrmLeadCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);

  const [ledgerForm, setLedgerForm] = useState({
    transactionDate: new Date().toISOString().split('T')[0],
    accountCategory: 'EXPENSE' as const,
    accountName: 'Office Rent & Utilities',
    description: 'Monthly office rent payment',
    debit: 45000,
    credit: 0,
    referenceNo: `LDG-${Date.now().toString(36).toUpperCase()}`,
    paymentMethod: 'BANK_TRANSFER'
  });

  const [empForm, setEmpForm] = useState({
    employeeNo: `EMP-${Math.floor(100 + Math.random() * 900)}`,
    fullName: '',
    nationalId: '',
    department: 'Sales & Operations',
    jobTitle: 'Store Manager',
    phone: '',
    email: '',
    hireDate: new Date().toISOString().split('T')[0],
    basicSalary: 40000,
    employmentStatus: 'FULL_TIME' as const,
    allowances: 5000,
    deductions: 2000
  });

  const [leadForm, setLeadForm] = useState({
    fullName: '',
    companyOrOrg: '',
    phone: '',
    email: '',
    stage: 'PROSPECT' as const,
    estimatedValue: 150000,
    assignedTo: 'Lead Executive',
    source: 'WALK_IN' as const,
    lastContactDate: new Date().toISOString().split('T')[0],
    notes: 'Inquired about bulk supply contracts'
  });

  const currencySymbol = currentTenant?.branding?.currencySymbol || 'KES';
  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const fetchEnterpriseData = async () => {
    setLoading(true);
    try {
      const [ldgRes, empRes, crmRes] = await Promise.all([
        fetch('/api/app/accounting/ledger', { headers: authHeaders }),
        fetch('/api/app/hr/employees', { headers: authHeaders }),
        fetch('/api/app/crm/leads', { headers: authHeaders })
      ]);
      if (ldgRes.ok) {
        const d = await ldgRes.json();
        setLedger(d.entries || []);
      }
      if (empRes.ok) {
        const e = await empRes.json();
        setEmployees(e.employees || []);
      }
      if (crmRes.ok) {
        const c = await crmRes.json();
        setLeads(c.leads || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnterpriseData();
  }, [currentTenant?.id]);

  const handleAddLedger = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/app/accounting/ledger', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(ledgerForm)
      });
      if (res.ok) {
        setShowLedgerModal(false);
        fetchEnterpriseData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/app/hr/employees', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(empForm)
      });
      if (res.ok) {
        setShowEmployeeModal(false);
        fetchEnterpriseData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/app/crm/leads', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(leadForm)
      });
      if (res.ok) {
        setShowLeadModal(false);
        fetchEnterpriseData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enterprise Administration</h1>
          <p className="text-sm text-gray-500 mt-1">Unified general ledger, human resources & CRM pipelines</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'accounting' && (
            <button
              onClick={() => setShowLedgerModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>Post Ledger Entry</span>
            </button>
          )}
          {activeTab === 'hr' && (
            <button
              onClick={() => setShowEmployeeModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Employee</span>
            </button>
          )}
          {activeTab === 'crm' && (
            <button
              onClick={() => setShowLeadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Customer Deal</span>
            </button>
          )}
          <button
            onClick={fetchEnterpriseData}
            className="p-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-6 rounded-t-xl">
        {[
          { id: 'accounting', label: `Accounting & Ledger (${ledger.length})`, icon: DollarSign },
          { id: 'hr', label: `HR & Staff (${employees.length})`, icon: Users },
          { id: 'crm', label: `CRM & Pipeline (${leads.length})`, icon: TrendingUp }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 py-4 px-4 text-sm font-medium border-b-2 transition ${
                activeTab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: ACCOUNTING */}
      {activeTab === 'accounting' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Account Name & Category</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Debit ({currencySymbol})</th>
                <th className="px-6 py-3">Credit ({currencySymbol})</th>
                <th className="px-6 py-3">Ref & User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ledger.map(l => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-xs">{l.transactionDate}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900 block">{l.accountName}</span>
                    <span className="text-xs text-blue-600 font-medium">{l.accountCategory}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-700">{l.description}</td>
                  <td className="px-6 py-4 font-mono text-rose-600 font-semibold">
                    {l.debit > 0 ? l.debit.toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 font-mono text-emerald-600 font-semibold">
                    {l.credit > 0 ? l.credit.toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    <div>{l.referenceNo}</div>
                    <div>{l.recordedBy}</div>
                  </td>
                </tr>
              ))}
              {ledger.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No ledger entries posted. Click "Post Ledger Entry" to add.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: HR */}
      {activeTab === 'hr' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
              <tr>
                <th className="px-6 py-3">Employee #</th>
                <th className="px-6 py-3">Name & National ID</th>
                <th className="px-6 py-3">Department & Role</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Basic Salary</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono font-medium">{emp.employeeNo}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900 block">{emp.fullName}</span>
                    <span className="text-xs text-gray-400">ID: {emp.nationalId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">{emp.jobTitle}</div>
                    <div className="text-xs text-gray-500">{emp.department}</div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div>{emp.phone}</div>
                    <div className="text-gray-400">{emp.email}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {currencySymbol} {emp.basicSalary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                      {emp.employmentStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No staff records found. Click "Enroll Employee" to onboard staff.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: CRM */}
      {activeTab === 'crm' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
              <tr>
                <th className="px-6 py-3">Client / Prospect</th>
                <th className="px-6 py-3">Company</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Pipeline Stage</th>
                <th className="px-6 py-3">Estimated Value</th>
                <th className="px-6 py-3">Assigned Lead</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{lead.fullName}</td>
                  <td className="px-6 py-4 text-xs text-gray-700">{lead.companyOrOrg || 'Individual'}</td>
                  <td className="px-6 py-4 text-xs">
                    <div>{lead.phone}</div>
                    <div className="text-gray-400">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                      {lead.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600">
                    {currencySymbol} {lead.estimatedValue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600">{lead.assignedTo}</td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No CRM deals in pipeline. Click "Create Customer Deal" to add.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* LEDGER MODAL */}
      {showLedgerModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Post General Ledger Entry</h3>
            <form onSubmit={handleAddLedger} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">Account Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stock Purchases / Electricity Bill"
                  value={ledgerForm.accountName}
                  onChange={e => setLedgerForm({ ...ledgerForm, accountName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Account Category</label>
                  <select
                    value={ledgerForm.accountCategory}
                    onChange={e => setLedgerForm({ ...ledgerForm, accountCategory: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="REVENUE">Revenue</option>
                    <option value="ASSET">Asset</option>
                    <option value="LIABILITY">Liability</option>
                    <option value="EQUITY">Equity</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Amount ({currencySymbol})</label>
                  <input
                    type="number"
                    required
                    value={ledgerForm.debit || ledgerForm.credit}
                    onChange={e => setLedgerForm({ ...ledgerForm, debit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Description / Memo</label>
                <input
                  type="text"
                  required
                  value={ledgerForm.description}
                  onChange={e => setLedgerForm({ ...ledgerForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowLedgerModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMPLOYEE MODAL */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Enroll Employee</h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={empForm.fullName}
                  onChange={e => setEmpForm({ ...empForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">National ID</label>
                  <input
                    type="text"
                    required
                    value={empForm.nationalId}
                    onChange={e => setEmpForm({ ...empForm, nationalId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    required
                    value={empForm.phone}
                    onChange={e => setEmpForm({ ...empForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Department</label>
                  <input
                    type="text"
                    required
                    value={empForm.department}
                    onChange={e => setEmpForm({ ...empForm, department: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Job Title</label>
                  <input
                    type="text"
                    required
                    value={empForm.jobTitle}
                    onChange={e => setEmpForm({ ...empForm, jobTitle: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Monthly Basic Salary ({currencySymbol})</label>
                <input
                  type="number"
                  required
                  value={empForm.basicSalary}
                  onChange={e => setEmpForm({ ...empForm, basicSalary: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRM LEAD MODAL */}
      {showLeadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Create Pipeline Deal</h3>
            <form onSubmit={handleAddLead} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">Contact / Lead Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Peter Njoroge"
                  value={leadForm.fullName}
                  onChange={e => setLeadForm({ ...leadForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Company / Organization</label>
                  <input
                    type="text"
                    value={leadForm.companyOrOrg}
                    onChange={e => setLeadForm({ ...leadForm, companyOrOrg: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    required
                    value={leadForm.phone}
                    onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Estimated Value ({currencySymbol})</label>
                  <input
                    type="number"
                    required
                    value={leadForm.estimatedValue}
                    onChange={e => setLeadForm({ ...leadForm, estimatedValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1 font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Stage</label>
                  <select
                    value={leadForm.stage}
                    onChange={e => setLeadForm({ ...leadForm, stage: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  >
                    <option value="PROSPECT">Prospect</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="PROPOSAL_SENT">Proposal Sent</option>
                    <option value="WON_CUSTOMER">Won Customer</option>
                    <option value="LOST">Lost</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowLeadModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                >
                  Save Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
