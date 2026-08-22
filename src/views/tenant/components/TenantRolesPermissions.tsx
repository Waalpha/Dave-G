import React, { useState, useEffect } from 'react';
import { 
  Shield, KeyRound, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, 
  Search, RefreshCw, Layers, Check, X, Sliders, Copy, HelpCircle,
  Users, Lock, Sparkles, BookOpen, DollarSign, GraduationCap, UserCheck, 
  FileText, Briefcase, ShoppingBag, ShieldAlert, ArrowRight, CheckSquare, Square
} from 'lucide-react';
import { RoleDefinition, PermissionDefinition, User } from '../../../types';
import { SYSTEM_PERMISSIONS, DEFAULT_SYSTEM_ROLES } from '../../../data/rolesPermissions';

interface TenantRolesPermissionsProps {
  tenantId: string;
  tenantName?: string;
  currentUser?: User | null;
}

export const TenantRolesPermissions: React.FC<TenantRolesPermissionsProps> = ({
  tenantId,
  tenantName = 'Organization',
  currentUser
}) => {
  const [roles, setRoles] = useState<RoleDefinition[]>(DEFAULT_SYSTEM_ROLES);
  const [permissions, setPermissions] = useState<PermissionDefinition[]>(SYSTEM_PERMISSIONS);
  const [categories, setCategories] = useState<string[]>([
    'Settings & Branding',
    'Users & Access',
    'Academics & Classes',
    'Students & Admissions',
    'Fees & Finance',
    'Exams & Grading',
    'HR & Payroll',
    'Inventory & POS',
    'Security & Audit'
  ]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards');

  // Role Edit / Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    description: string;
    category: 'System' | 'Academic' | 'Financial' | 'Administrative' | 'Operations' | 'Custom';
    color: string;
    permissions: string[];
  }>({
    name: '',
    code: '',
    description: '',
    category: 'Custom',
    color: '#4F46E5',
    permissions: ['organization.profile.view']
  });

  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Role Delete State
  const [roleToDelete, setRoleToDelete] = useState<RoleDefinition | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRolesAndPermissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('erp_token') || '';
      const userId = localStorage.getItem('erp_user_id') || '';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-id': userId,
        'x-tenant-id': tenantId
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Fetch roles
      const rolesRes = await fetch(`/api/tenant/roles?tenantId=${tenantId}`, { headers });
      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        if (Array.isArray(rolesData) && rolesData.length > 0) {
          setRoles(rolesData);
        }
      }

      // Fetch permissions metadata
      const permsRes = await fetch('/api/tenant/permissions', { headers });
      if (permsRes.ok) {
        const permsData = await permsRes.json();
        if (Array.isArray(permsData.permissions) && permsData.permissions.length > 0) {
          setPermissions(permsData.permissions);
        }
        if (Array.isArray(permsData.categories) && permsData.categories.length > 0) {
          setCategories(permsData.categories);
        }
      }
    } catch (err) {
      console.error('Failed to load roles and permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchRolesAndPermissions();
    }
  }, [tenantId]);

  const handleOpenCreateModal = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      category: 'Custom',
      color: '#4F46E5',
      permissions: [
        'organization.profile.view',
        'students.view'
      ]
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (role: RoleDefinition) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      code: role.code,
      description: role.description || '',
      category: role.category || 'Custom',
      color: role.color || '#4F46E5',
      permissions: role.permissions.includes('*') 
        ? permissions.map(p => p.code) 
        : [...role.permissions]
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleDuplicateRole = (sourceRole: RoleDefinition) => {
    setEditingRole(null);
    setFormData({
      name: `${sourceRole.name} (Copy)`,
      code: `${sourceRole.code}_COPY`,
      description: `Customized replica of ${sourceRole.name}`,
      category: 'Custom',
      color: sourceRole.color || '#4F46E5',
      permissions: sourceRole.permissions.includes('*')
        ? permissions.map(p => p.code)
        : [...sourceRole.permissions]
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleTogglePermission = (permCode: string) => {
    setFormData(prev => {
      const exists = prev.permissions.includes(permCode);
      const updated = exists
        ? prev.permissions.filter(p => p !== permCode)
        : [...prev.permissions, permCode];
      return { ...prev, permissions: updated };
    });
  };

  const handleToggleCategory = (categoryName: string) => {
    const categoryPerms = permissions.filter(p => p.category === categoryName).map(p => p.code);
    const allSelected = categoryPerms.every(p => formData.permissions.includes(p));

    setFormData(prev => {
      let updated: string[];
      if (allSelected) {
        // Deselect all in category
        updated = prev.permissions.filter(p => !categoryPerms.includes(p));
      } else {
        // Select all in category
        const toAdd = categoryPerms.filter(p => !prev.permissions.includes(p));
        updated = [...prev.permissions, ...toAdd];
      }
      return { ...prev, permissions: updated };
    });
  };

  const handleSelectAll = () => {
    setFormData(prev => ({
      ...prev,
      permissions: permissions.map(p => p.code)
    }));
  };

  const handleDeselectAll = () => {
    setFormData(prev => ({
      ...prev,
      permissions: ['organization.profile.view']
    }));
  };

  const handleApplyPreset = (presetRoleCode: string) => {
    const preset = DEFAULT_SYSTEM_ROLES.find(r => r.code === presetRoleCode);
    if (!preset) return;

    const permsToApply = preset.permissions.includes('*')
      ? permissions.map(p => p.code)
      : preset.permissions;

    setFormData(prev => ({
      ...prev,
      permissions: permsToApply
    }));
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setModalError('Role Name is required');
      return;
    }

    try {
      setModalSaving(true);
      setModalError(null);
      const token = localStorage.getItem('erp_token') || '';
      const userId = localStorage.getItem('erp_user_id') || '';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-id': userId,
        'x-tenant-id': tenantId
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const endpoint = editingRole
        ? `/api/tenant/roles/${editingRole.id || editingRole.code}`
        : `/api/tenant/roles`;
      const method = editingRole ? 'PUT' : 'POST';

      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_') || formData.name.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_'),
        description: formData.description.trim(),
        category: formData.category,
        color: formData.color,
        permissions: formData.permissions
      };

      const res = await fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || resData.message || 'Failed to save role configuration');
      }

      setIsModalOpen(false);
      setStatusNotice({
        type: 'success',
        message: editingRole
          ? `Role "${formData.name}" permissions successfully updated.`
          : `Custom role "${formData.name}" successfully created.`
      });
      fetchRolesAndPermissions();
      setTimeout(() => setStatusNotice(null), 5000);
    } catch (err: any) {
      setModalError(err.message || 'Network error saving role');
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('erp_token') || '';
      const userId = localStorage.getItem('erp_user_id') || '';

      const res = await fetch(`/api/tenant/roles/${roleToDelete.id || roleToDelete.code}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'x-tenant-id': tenantId,
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to delete role');
      }

      setRoleToDelete(null);
      setStatusNotice({
        type: 'success',
        message: `Role "${roleToDelete.name}" successfully deleted.`
      });
      fetchRolesAndPermissions();
      setTimeout(() => setStatusNotice(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete role');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Roles
  const filteredRoles = roles.filter(r => {
    const matchesSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Settings & Branding':
        return <Sliders className="w-4 h-4 text-blue-600" />;
      case 'Users & Access':
        return <Users className="w-4 h-4 text-purple-600" />;
      case 'Academics & Classes':
        return <BookOpen className="w-4 h-4 text-amber-600" />;
      case 'Students & Admissions':
        return <GraduationCap className="w-4 h-4 text-sky-600" />;
      case 'Fees & Finance':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'Exams & Grading':
        return <FileText className="w-4 h-4 text-rose-600" />;
      case 'HR & Payroll':
        return <Briefcase className="w-4 h-4 text-indigo-600" />;
      case 'Inventory & POS':
        return <ShoppingBag className="w-4 h-4 text-cyan-600" />;
      case 'Security & Audit':
        return <ShieldAlert className="w-4 h-4 text-red-600" />;
      default:
        return <KeyRound className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      {statusNotice && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center space-x-2.5 shadow-xs animate-fade-in ${
          statusNotice.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {statusNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{statusNotice.message}</span>
        </div>
      )}

      {/* Header Controls Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Role-Based Access Control (RBAC)</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Define organizational roles, enforce granular security scopes, and control feature visibility for {tenantName}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Role Cards
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Permissions Matrix
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchRolesAndPermissions}
            disabled={loading}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Refresh Roles"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Create Custom Role Button */}
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Role</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search roles by title, code (e.g. FINANCE_OFFICER), or description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer w-full sm:w-auto"
          >
            <option value="all">All Role Categories</option>
            <option value="System">System &amp; Administration</option>
            <option value="Academic">Academic &amp; Faculty</option>
            <option value="Financial">Financial &amp; Billing</option>
            <option value="Administrative">Administrative &amp; Registry</option>
            <option value="Operations">Operations &amp; Support</option>
            <option value="Custom">Custom Tenant Roles</option>
          </select>
        </div>
      </div>

      {/* VIEW: ROLE CARDS */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoles.map(role => {
            const isAllPerms = role.permissions.includes('*');
            const permCount = isAllPerms ? permissions.length : role.permissions.length;

            return (
              <div 
                key={role.id || role.code}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Card Top Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <div 
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-xs"
                        style={{ backgroundColor: role.color || '#2563EB' }}
                      >
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">
                          {role.name}
                        </h4>
                        <span className="font-mono text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                          {role.code}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      role.isSystemRole 
                        ? 'bg-slate-100 text-slate-700 border-slate-200' 
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      {role.isSystemRole ? 'Built-In' : 'Custom'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-2 min-h-[32px]">
                    {role.description || 'Standard institutional role with tailored module access privileges.'}
                  </p>

                  {/* Metrics Badge Row */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-semibold text-slate-700">{role.userCount || 0} Users</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-semibold text-slate-700">
                        {isAllPerms ? 'All 35+ Permissions' : `${permCount} / ${permissions.length} Perms`}
                      </span>
                    </div>
                  </div>

                  {/* Top Permissions Badges */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {isAllPerms ? (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                        Full Institutional Access (*)
                      </span>
                    ) : (
                      role.permissions.slice(0, 3).map(pCode => {
                        const def = permissions.find(p => p.code === pCode);
                        return (
                          <span 
                            key={pCode} 
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200 truncate max-w-[140px]"
                            title={def?.name || pCode}
                          >
                            {def?.name || pCode.split('.').pop()}
                          </span>
                        );
                      })
                    )}
                    {!isAllPerms && role.permissions.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[10px] font-medium border border-slate-200">
                        +{role.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDuplicateRole(role)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                    title="Duplicate into new custom role"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Clone</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {!role.isSystemRole && (
                      <button
                        onClick={() => setRoleToDelete(role)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete custom role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenEditModal(role)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer border border-slate-200 hover:border-blue-300"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{role.isSystemRole ? 'View / Customize' : 'Edit Matrix'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: FULL PERMISSION MATRIX */}
      {viewMode === 'matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Full RBAC Permission Matrix ({permissions.length} Capabilities × {roles.length} Roles)
              </h4>
              <p className="text-[11px] text-slate-500">
                Inspect which operational capabilities are granted across every user role in the institution.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200">
                  <th className="py-3 px-4 text-slate-800 font-bold w-1/3 min-w-[260px] sticky left-0 bg-slate-100/90 backdrop-blur-xs z-10">
                    Module Permission &amp; Scope
                  </th>
                  {roles.map(r => (
                    <th key={r.code} className="py-3 px-3 text-slate-800 font-bold text-center min-w-[110px]">
                      <div className="flex flex-col items-center">
                        <span 
                          className="w-2.5 h-2.5 rounded-full mb-1" 
                          style={{ backgroundColor: r.color || '#2563EB' }} 
                        />
                        <span className="truncate max-w-[100px]" title={r.name}>{r.name}</span>
                        <span className="text-[9px] font-mono text-slate-400">{r.code}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map(cat => {
                  const catPerms = permissions.filter(p => p.category === cat);
                  if (catPerms.length === 0) return null;

                  return (
                    <React.Fragment key={cat}>
                      {/* Category Header Row */}
                      <tr className="bg-slate-50/80 font-bold text-slate-800 text-[11px]">
                        <td colSpan={roles.length + 1} className="py-2.5 px-4 flex items-center space-x-2">
                          {getCategoryIcon(cat)}
                          <span className="tracking-wide uppercase text-slate-700">{cat}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({catPerms.length} permissions)
                          </span>
                        </td>
                      </tr>

                      {/* Permission Rows */}
                      {catPerms.map(perm => (
                        <tr key={perm.code} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-4 sticky left-0 bg-white hover:bg-slate-50/60 transition-colors z-10 border-r border-slate-100">
                            <div className="font-semibold text-slate-900">{perm.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{perm.code}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{perm.description}</div>
                          </td>

                          {roles.map(r => {
                            const isGranted = r.permissions.includes('*') || r.permissions.includes(perm.code);

                            return (
                              <td key={r.code} className="py-2.5 px-3 text-center align-middle">
                                {isGranted ? (
                                  <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                                    <Check className="w-3.5 h-3.5 font-bold" />
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400">
                                    <X className="w-3 h-3" />
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT ROLE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl text-slate-900 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2.5">
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
                  style={{ backgroundColor: formData.color || '#4F46E5' }}
                >
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingRole ? `Configure Role: ${editingRole.name}` : 'Create New Custom Role'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Customize institutional permissions, module privileges, and security boundaries.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveRole} className="space-y-4 text-xs">
              {/* Basic Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold">Role Display Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dean of Students, Chief Accountant"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold">System Role Code</label>
                  <input
                    type="text"
                    disabled={!!editingRole?.isSystemRole}
                    placeholder="e.g. DEAN_STUDENTS"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono text-xs disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold">Role Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-semibold cursor-pointer"
                  >
                    <option value="Academic">Academic &amp; Faculty</option>
                    <option value="Financial">Financial &amp; Billing</option>
                    <option value="Administrative">Administrative &amp; Registry</option>
                    <option value="Operations">Operations &amp; Logistics</option>
                    <option value="System">System &amp; Administration</option>
                    <option value="Custom">Custom Role</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold">Badge Color Accent</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={e => setFormData({ ...formData, color: e.target.value })}
                      className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={e => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold">Role Description</label>
                <textarea
                  rows={2}
                  placeholder="Outline the responsibilities and scope of this role..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Quick Preset Selector */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-600 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Copy Preset Permissions:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_SYSTEM_ROLES.slice(0, 5).map(r => (
                    <button
                      key={r.code}
                      type="button"
                      onClick={() => handleApplyPreset(r.code)}
                      className="px-2 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      {r.name.split('/')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Permissions Checkbox Matrix */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <h4 className="font-bold text-slate-900">
                      Granular Module Permissions ({formData.permissions.length} Selected)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Check the explicit privileges granted to any user assigned this role.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="max-h-[320px] overflow-y-auto space-y-4 pr-1">
                  {categories.map(cat => {
                    const catPerms = permissions.filter(p => p.category === cat);
                    if (catPerms.length === 0) return null;

                    const allInCatSelected = catPerms.every(p => formData.permissions.includes(p.code));
                    const someInCatSelected = catPerms.some(p => formData.permissions.includes(p.code));

                    return (
                      <div key={cat} className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                          <div className="flex items-center space-x-2 font-bold text-slate-800 text-[11px]">
                            {getCategoryIcon(cat)}
                            <span>{cat}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleCategory(cat)}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer flex items-center space-x-1"
                          >
                            {allInCatSelected ? (
                              <>
                                <CheckSquare className="w-3 h-3" />
                                <span>Deselect Category</span>
                              </>
                            ) : (
                              <>
                                <Square className="w-3 h-3" />
                                <span>Select All in Category</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {catPerms.map(perm => {
                            const isChecked = formData.permissions.includes(perm.code);

                            return (
                              <label
                                key={perm.code}
                                className={`flex items-start space-x-2.5 p-2 rounded-xl border transition-all cursor-pointer ${
                                  isChecked
                                    ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(perm.code)}
                                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <div className="space-y-0.5">
                                  <div className="font-bold text-[11px] leading-tight">
                                    {perm.name}
                                  </div>
                                  <div className="text-[10px] text-slate-500 leading-normal line-clamp-1">
                                    {perm.description}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  {modalSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                  <span>{modalSaving ? 'Saving Role...' : 'Save Role Permissions'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE ROLE CONFIRMATION MODAL */}
      {roleToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-900">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Custom Role?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to delete role <strong className="text-slate-900">"{roleToDelete.name}"</strong>?
              Make sure no active users are currently assigned this role before deleting.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRoleToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteRole}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-xl font-bold text-xs shadow-md shadow-red-500/20 flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isDeleting ? 'Deleting...' : 'Delete Role'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
