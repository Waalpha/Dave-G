import React, { useState, useEffect } from 'react';
import { 
  Users, X, Plus, KeyRound, Edit2, Trash2, Mail, Shield, AlertCircle, 
  RefreshCw, CheckCircle2, Search, UserPlus, AlertTriangle
} from 'lucide-react';
import { Tenant, User } from '../../../types';
import { ResetPasswordModal } from './ResetPasswordModal';
import { EditUserModal } from './EditUserModal';

interface TenantUsersModalProps {
  tenant: Tenant;
  onClose: () => void;
}

export const TenantUsersModal: React.FC<TenantUsersModalProps> = ({
  tenant,
  onClose
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Sub-modals
  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // Create user form
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('STAFF');
  const [newUserDepartment, setNewUserDepartment] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('password123');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/platform/tenants/${tenant.id}/users`, {
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
      console.error('Failed to fetch tenant users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [tenant.id]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      setCreateError('Name and Email are required.');
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError(null);
      const res = await fetch(`/api/platform/tenants/${tenant.id}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('erp_user_id') || ''
        },
        body: JSON.stringify({
          name: newUserName.trim(),
          email: newUserEmail.trim().toLowerCase(),
          role: newUserRole,
          department: newUserDepartment.trim() || undefined,
          password: newUserPassword.trim() || 'password123'
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNotification(`User ${newUserName} successfully created with password "${newUserPassword}"`);
        setIsCreatingUser(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserDepartment('');
        setNewUserPassword('password123');
        fetchUsers();
        setTimeout(() => setNotification(null), 5000);
      } else {
        setCreateError(data.error || 'Failed to create user.');
      }
    } catch (err: any) {
      setCreateError(err.message || 'Error creating user.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

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
        setUserToDelete(null);
        setNotification(`User account "${deletedName}" was successfully deleted.`);
        await fetchUsers();
        setTimeout(() => setNotification(null), 4000);
      } else {
        setDeleteError(data.error || data.message || 'Failed to delete user.');
      }
    } catch (err: any) {
      console.error('Delete user error:', err);
      setDeleteError(err.message || 'Failed to delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase()) ||
    (u.department && u.department.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-[#1F2937]">
      <div className="bg-white border border-[#D8DCEB] rounded-2xl max-w-4xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D8DCEB] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBE2F5] border border-[#D8DCEB] text-[#1D53D9] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-[#1D53D9]">Users & Credentials</h3>
                <span className="px-2 py-0.5 bg-[#EBE2F5] text-[#1D53D9] border border-[#D8DCEB] rounded text-[10px] font-mono font-bold">
                  {tenant.name}
                </span>
              </div>
              <p className="text-xs text-[#777E8C] font-medium">
                Manage accounts, reset passwords, change emails, and provision new staff or admin credentials.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#777E8C] hover:text-[#1F2937] p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {notification && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2 shadow-2xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-[#14B57A] shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#777E8C]" />
            <input
              type="text"
              placeholder="Search by name, email, role..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#D8DCEB] rounded-xl pl-9 pr-3 py-2 text-[#1F2937] placeholder-[#777E8C] focus:outline-none focus:border-[#1D53D9] text-xs font-medium"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchUsers}
              className="px-3 py-2 bg-[#F8FAFC] hover:bg-slate-100 text-[#1F2937] border border-[#D8DCEB] rounded-xl flex items-center space-x-1 font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setIsCreatingUser(!isCreatingUser)}
              className="px-3.5 py-2 bg-[#1D53D9] hover:bg-blue-700 text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isCreatingUser ? 'Cancel Provisioning' : 'Add New User'}</span>
            </button>
          </div>
        </div>

        {/* Create User Collapsible Drawer */}
        {isCreatingUser && (
          <form onSubmit={handleCreateUser} className="bg-[#F8FAFC] border border-[#D8DCEB] rounded-xl p-4 space-y-3 animate-fade-in text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1D53D9] flex items-center space-x-1.5 text-xs">
                <UserPlus className="w-4 h-4 text-[#1D53D9]" />
                <span>Provision New User for {tenant.name}</span>
              </span>
            </div>

            {createError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[11px] flex items-center space-x-1.5 font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[#1F2937] font-bold">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full bg-white border border-[#D8DCEB] rounded-lg p-2 text-[#1F2937] focus:outline-none focus:border-[#1D53D9]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#1F2937] font-bold">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="user@institution.ac.ke"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  className="w-full bg-white border border-[#D8DCEB] rounded-lg p-2 text-[#1F2937] font-mono focus:outline-none focus:border-[#1D53D9]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#1F2937] font-bold">System Role *</label>
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value)}
                  className="w-full bg-white border border-[#D8DCEB] rounded-lg p-2 text-[#1F2937] font-bold focus:outline-none focus:border-[#1D53D9]"
                >
                  <option value="TENANT_ADMIN">TENANT_ADMIN (Admin)</option>
                  <option value="LECTURER">LECTURER / FACULTY</option>
                  <option value="ACCOUNTANT">ACCOUNTANT / BURSAR</option>
                  <option value="STUDENT">STUDENT</option>
                  <option value="STAFF">GENERAL STAFF</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[#1F2937] font-bold">Initial Password *</label>
                <input
                  type="text"
                  required
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  className="w-full bg-white border border-[#D8DCEB] rounded-lg p-2 text-[#1F2937] font-mono text-xs focus:outline-none focus:border-[#1D53D9]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingUser(false)}
                className="px-3 py-1.5 bg-white border border-[#D8DCEB] text-[#1F2937] rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="px-4 py-1.5 bg-[#1D53D9] hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer"
              >
                {createLoading ? 'Provisioning...' : 'Confirm & Create Account'}
              </button>
            </div>
          </form>
        )}

        {/* Users Table */}
        <div className="flex-1 overflow-y-auto border border-[#D8DCEB] rounded-xl bg-white">
          <table className="w-full text-left text-xs text-[#1F2937]">
            <thead className="bg-[#F8FAFC] text-[#777E8C] uppercase font-mono text-[10px] sticky top-0 z-10 border-b border-[#D8DCEB]">
              <tr>
                <th className="p-3.5 font-bold">User Identity</th>
                <th className="p-3.5 font-bold">Email (Login)</th>
                <th className="p-3.5 font-bold">Role</th>
                <th className="p-3.5 font-bold">Department</th>
                <th className="p-3.5 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DCEB]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#777E8C]">
                    {loading ? 'Loading user accounts...' : 'No users found for this organization.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-semibold text-[#1F2937]">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#EBE2F5] border border-[#D8DCEB] text-[#1D53D9] font-bold flex items-center justify-center text-xs shrink-0">
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
                    <td className="p-3.5 text-[#777E8C] text-xs font-medium">
                      {u.department || '—'}
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      {/* Reset Password Button */}
                      <button
                        onClick={() => setSelectedUserForReset(u)}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                        title="Reset Account Password Directly"
                      >
                        <KeyRound className="w-3 h-3 text-[#F49C10]" />
                        <span>Reset Pass</span>
                      </button>

                      {/* Edit User Button */}
                      <button
                        onClick={() => setSelectedUserForEdit(u)}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1D53D9] border border-blue-200 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center space-x-1 cursor-pointer"
                        title="Edit Name, Email, Role"
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
                          title="Delete User Account"
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

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#D8DCEB] text-xs text-[#777E8C]">
          <span>Total Organization Users: <strong className="text-[#1D53D9]">{users.length}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#F8FAFC] hover:bg-slate-100 text-[#1F2937] border border-[#D8DCEB] rounded-xl font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xs flex items-center justify-center p-4 z-60 animate-fade-in text-slate-100">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center font-bold shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete User Account</h3>
                <p className="text-xs text-slate-400">Permanent account removal</p>
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
                <span className="text-slate-400">User Name:</span>
                <span className="font-semibold text-white">{userToDelete.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Email:</span>
                <span className="font-mono text-purple-300 select-all">{userToDelete.email}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Role:</span>
                <span className="font-mono text-amber-400 font-bold">{userToDelete.role}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Are you sure you want to permanently delete this user account? All login sessions will be immediately invalidated.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-lg flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete User</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub Modals */}
      {selectedUserForReset && (
        <ResetPasswordModal
          user={selectedUserForReset}
          onClose={() => setSelectedUserForReset(null)}
          onSuccess={fetchUsers}
        />
      )}

      {selectedUserForEdit && (
        <EditUserModal
          user={selectedUserForEdit}
          tenants={[tenant]}
          onClose={() => setSelectedUserForEdit(null)}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
};
