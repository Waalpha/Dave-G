import React, { useState, useEffect } from 'react';
import { AuditLog } from '../../types';
import { FileText, Search, Shield, RefreshCw, Calendar, User } from 'lucide-react';

export const PlatformAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/platform/audit-logs', {
        headers: { 'x-user-id': localStorage.getItem('erp_user_id') || '' }
      });
      if (res.ok) {
        const data = await res.json().catch(() => []);
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l =>
    (l?.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l?.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l?.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l?.tenantId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-[#1F2937]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1D53D9] flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#1D53D9]" />
            <span>Global System Audit Trail</span>
          </h2>
          <p className="text-xs text-[#777E8C] mt-1 font-medium">
            Real-time security log tracking tenant creation, module permissions changes, logins, and data transactions.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-3.5 py-2 bg-white border border-[#D8DCEB] hover:bg-slate-50 text-xs font-bold text-[#1D53D9] rounded-xl flex items-center space-x-1.5 shadow-2xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      <div className="bg-white border border-[#D8DCEB] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#D8DCEB] bg-[#F8FAFC] flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#777E8C]" />
            <input
              type="text"
              placeholder="Search audit actions, users, details..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#D8DCEB] rounded-xl pl-9 pr-4 py-1.5 text-xs text-[#1F2937] placeholder-[#777E8C] focus:outline-none focus:border-[#1D53D9]"
            />
          </div>
          <span className="text-xs text-[#777E8C] font-mono font-semibold">
            Records: {filteredLogs.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1F2937]">
            <thead className="bg-[#F8FAFC] text-[#777E8C] uppercase font-mono text-[10px] border-b border-[#D8DCEB]">
              <tr>
                <th className="p-3.5 font-bold">Timestamp</th>
                <th className="p-3.5 font-bold">Tenant Scope</th>
                <th className="p-3.5 font-bold">Actor / User</th>
                <th className="p-3.5 font-bold">Action</th>
                <th className="p-3.5 font-bold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DCEB] font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 text-[#777E8C] whitespace-nowrap font-medium">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 bg-[#F8FAFC] border border-[#D8DCEB] rounded text-[#1F2937] text-[10px] font-semibold">
                      {log.tenantId}
                    </span>
                  </td>
                  <td className="p-3.5 font-sans">
                    <p className="font-bold text-[#1D53D9]">{log.userName}</p>
                    <p className="text-[10px] text-[#777E8C] font-semibold font-mono">{log.userRole}</p>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 bg-[#EBE2F5] text-[#1D53D9] border border-[#D8DCEB] rounded-full text-[10px] font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 font-sans text-[#1F2937] max-w-lg font-medium">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
