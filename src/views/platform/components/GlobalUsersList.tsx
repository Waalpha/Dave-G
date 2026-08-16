import React, { useState, useEffect } from 'react';
import { 
  Users, KeyRound, Edit2, Trash2, Search, Filter, RefreshCw, 
  CheckCircle2, AlertCircle, Building2, ShieldCheck, Mail, X, AlertTriangle
} from 'lucide-react';
import { User, Tenant } from '../../../types';
import { ResetPasswordModal } from './ResetPasswordModal';
import { EditUserModal } from './EditUserModal';

interface GlobalUsersListProps {
  tenants: Tenant[];
}

export const GlobalUsersList: React.FC<GlobalUsersListProps> = ({ tenants }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tenantFilter, setTenantFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  
  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/platform/users', {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('erp_user_id') || ''
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch global users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    if (userToDelete.id === 'user_super_admin') {
      setDeleteError('Cannot delete the primary Platform Super Admin.');
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);
      const res = await fetch(`/api/platform/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('erp_user_id') || ''
        }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const deletedName = userToDelete.name;
        const deletedEmail = userToDelete.email;
        setUserToDelete(null);
        setNotification(`User account ${deletedName} (${deletedEmail}) has been permanently deleted.`);
        await fetchAllUsers();
        setTimeout(() => setNotification(null), 4500);
      } else {
        setDeleteError(data.error || data.message || 'Failed to delete user.');
      }
    } catch (err: any) {
      console.error('Delete user error:', err);
      setDeleteError(err.message || 'An error occurred while deleting user.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getTenantName = (tId: string) => {
    if (tId === 'platform_super_admin') return 'Platform Super Admin';
    const found = tenants.find(t => t.id === tId);
    return found ? found.name : tId;
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase())) ||
      getTenantName(u.tenantId).toLowerCase().includes(search.toLowerCase());

    const matchesTenant = tenantFilter === 'ALL' || u.tenantId === tenantFilter;
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesTenant && matchesRole;
  });

  return (
    <div className="space-y-4 text-[#1F2937]">
      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#14B57A] shrink-0" />
          <span className="font-semibold">{notification}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#D8DCEB] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#777E8C]" />
            <input
              type="text"
              placeholder="Search by user name, email, department, institution..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#D8DCEB] rounded-xl pl-9 pr-3 py-2 text-[#1F2937] placeholder-[#777E8C] focus:outline-none focus:border-[#1D53D9] text-xs font-medium"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-[#777E8C] shrink-0" />
            <select
              value={tenantFilter}
              onChange={e => setTenantFilter(e.target.value)}
              className="bg-[#F8FAFC] border border-[#D8DCEB] rounded-xl px-3 py-2 text-[#1F2937] focus:outline-none focus:border-[#1D53D9] text-xs font-semibold"
            >
              <option value="ALL">All Institutions ({tenants.length})</option>
              <option value="platform_super_admin">Platform Root</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="bg-[#F8FAFC] border border-[#D8DCEB] rounded-xl px-3 py-2 text-[#1F2937] focus:outline-none focus:border-[#1D53D9] text-xs font-semibold"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="TENANT_ADMIN">TENANT_ADMIN</option>
              <option value="LECTURER">LECTURER</option>
              <option value="ACCOUNTANT">ACCOUNTANT</option>
              <option value="STUDENT">STUDENT</option>
              <option value="STAFF">STAFF</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchAllUsers}
          className="px-3.5 py-2 bg-[#F8FAFC] hover:bg-slate-100 text-[#1D53D9] border border-[#D8DCEB] font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reload Users</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-[#D8DCEB] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1F2937]">
            <thead className="bg-[#F8FAFC] text-[#777E8C] uppercase font-mono text-[10px] border-b border-[#D8DCEB]">
              <tr>
                <th className="p-3.5 font-bold">User Identity</th>
                <th className="p-3.5 font-bold">Login Email</th>
                <th className="p-3.5 font-bold">Institution / Tenant</th>
                <th className="p-3.5 font-bold">Role</th>
                <th className="p-3.5 font-bold">Department</th>
                <th className="p-3.5 text-right font-bold">Super Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DCEB]">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#777E8C]">
                    Loading accounts across all tenants...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#777E8C]">
                    No user accounts match your search query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#EBE2F5] border border-[#D8DCEB] text-[#1D53D9] font-bold flex items-center justify-center text-xs shrink-0">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-[#1D53D9] text-xs">{u.name}</p>
                          <p className="text-[10px] text-[#777E8C] font-mono">ID: {u.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-[#1D53D9] font-semibold text-xs select-all">
                      {u.email}
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center space-x-1.5 text-xs text-[#1F2937]">
                        <Building2 className="w-3.5 h-3.5 text-[#777E8C] shrink-0" />
                        <span className="truncate max-w-[180px] font-semibold" title={getTenantName(u.tenantId)}>
                          {getTenantName(u.tenantId)}
                        </span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        u.role === 'TENANT_ADMIN'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : u.role === 'SUPER_ADMIN'
                          ? 'bg-[#EBE2F5] text-[#1D53D9] border border-[#D8DCEB]'
                          : 'bg-[#F8FAFC] text-[#1F2937] border border-[#D8DCEB]'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="p-3.5 text-[#777E8C] font-medium text-xs">
                      {u.department || '—'}
                    </td>

                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {/* Reset Password Button */}
                      <button
                        onClick={() => setSelectedUserForReset(u)}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                        title="Reset Account Password Directly"
                      >
                        <KeyRound className="w-3 h-3 text-[#F49C10]" />
                        <span>Reset Password</span>
                      </button>

                      {/* Edit User Button */}
                      <button
                        onClick={() => setSelectedUserForEdit(u)}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1D53D9] border border-blue-200 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                        title="Edit Name, Email, Role, Institution"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      {/* Delete User Button */}
                      {u.id !== 'user_super_admin' && (
                        <button
                          onClick={() => {
                            setDeleteError(null);
                            setUserToDelete(u);
                          }}
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                          title="Delete User Account Permanently"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-[#F8FAFC] border-t border-[#D8DCEB] flex items-center justify-between text-xs text-[#777E8C]">
          <span>Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> total users</span>
          <span className="text-[11px] text-[#777E8C] font-semibold">Super Admin Credential & Identity Authority</span>
        </div>
      </div>

      {/* Delete User In-App Modal Dialog (Safe for iframe environments) */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-slate-100">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center font-bold shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete User Account</h3>
                <p className="text-xs text-slate-400">This action is permanent and irreversible.</p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Full Name:</span>
                <span className="font-semibold text-white">{userToDelete.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Email Address:</span>
                <span className="font-mono text-purple-300 select-all">{userToDelete.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Institution / Tenant:</span>
                <span className="font-medium text-slate-200">{getTenantName(userToDelete.tenantId)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Assigned Role:</span>
                <span className="font-mono text-amber-400 font-bold">{userToDelete.role}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to permanently delete this user account? The user will immediately lose all login access and session tokens across the platform.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting Account...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm &amp; Delete User</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedUserForReset && (
        <ResetPasswordModal
          user={selectedUserForReset}
          onClose={() => setSelectedUserForReset(null)}
          onSuccess={fetchAllUsers}
        />
      )}

      {selectedUserForEdit && (
        <EditUserModal
          user={selectedUserForEdit}
          tenants={tenants}
          onClose={() => setSelectedUserForEdit(null)}
          onSuccess={fetchAllUsers}
        />
      )}
    </div>
  );
};
