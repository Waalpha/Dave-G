import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Check, Plus, Edit2, Trash2, Copy, Users, Globe, Shield, 
  Sparkles, CheckCircle2, AlertCircle, RefreshCw, Layers, Server, 
  HelpCircle, ChevronRight, X, ArrowUpRight, DollarSign, Database
} from 'lucide-react';
import { SaaSSubscriptionPlan, Tenant, ModuleId } from '../../types';
import { ALL_ERP_MODULES } from '../../data/modulesCatalog';

export const PlatformPlans: React.FC = () => {
  const [plans, setPlans] = useState<SaaSSubscriptionPlan[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit / Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SaaSSubscriptionPlan | null>(null);
  const [modalSaving, setModalSaving] = useState(false);

  // Tenant Plan Assignment Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedPlanForTenants, setSelectedPlanForTenants] = useState<SaaSSubscriptionPlan | null>(null);
  const [assigningTenantId, setAssigningTenantId] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [planToDelete, setPlanToDelete] = useState<SaaSSubscriptionPlan | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form State for Create/Edit
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    price: 15000,
    currency: 'KES',
    billingPeriod: 'monthly' as 'monthly' | 'annually' | 'quarterly',
    description: '',
    tagline: '',
    maxUsers: 10,
    isUnlimitedUsers: false,
    maxStorageGb: 10,
    moduleLimit: 3,
    isUnlimitedModules: false,
    includedModules: [] as ModuleId[],
    allowCustomDomain: false,
    allowPublicWebsite: true,
    prioritySupport: false,
    slaUptime: '99.9%',
    isPopular: false,
    isActive: true,
    features: [] as string[],
    newFeatureInput: '',
    order: 1
  });

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-user-id': localStorage.getItem('erp_user_id') || ''
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [plansRes, tenantsRes] = await Promise.all([
        fetch('/api/platform/plans', { headers: getHeaders() }),
        fetch('/api/platform/tenants', { headers: getHeaders() })
      ]);

      if (plansRes.ok) {
        const data = await plansRes.json();
        setPlans(data.plans || []);
      } else {
        const err = await plansRes.json();
        setError(err.error || 'Failed to fetch subscription plans');
      }

      if (tenantsRes.ok) {
        const tData = await tenantsRes.json();
        if (Array.isArray(tData)) {
          setTenants(tData);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching plan data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      code: '',
      price: 15000,
      currency: 'KES',
      billingPeriod: 'monthly',
      description: '',
      tagline: '',
      maxUsers: 10,
      isUnlimitedUsers: false,
      maxStorageGb: 10,
      moduleLimit: 3,
      isUnlimitedModules: false,
      includedModules: ['accounting', 'hr', 'inventory'],
      allowCustomDomain: false,
      allowPublicWebsite: true,
      prioritySupport: false,
      slaUptime: '99.5%',
      isPopular: false,
      isActive: true,
      features: [
        'Standard Double-Entry General Ledger',
        'Automated M-Pesa STK Push Integration',
        'Standard Cloud Tenant Isolation',
        'Email Support & System Updates'
      ],
      newFeatureInput: '',
      order: plans.length + 1
    });
    setIsModalOpen(true);
  };

  const openEditModal = (plan: SaaSSubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      code: plan.code,
      price: plan.price,
      currency: plan.currency || 'KES',
      billingPeriod: plan.billingPeriod || 'monthly',
      description: plan.description || '',
      tagline: plan.tagline || '',
      maxUsers: plan.maxUsers === -1 ? 50 : plan.maxUsers,
      isUnlimitedUsers: plan.maxUsers === -1,
      maxStorageGb: plan.maxStorageGb || 10,
      moduleLimit: plan.moduleLimit === -1 ? 8 : (plan.moduleLimit || 3),
      isUnlimitedModules: plan.moduleLimit === -1,
      includedModules: plan.includedModules || [],
      allowCustomDomain: plan.allowCustomDomain,
      allowPublicWebsite: plan.allowPublicWebsite,
      prioritySupport: plan.prioritySupport,
      slaUptime: plan.slaUptime || '99.9%',
      isPopular: !!plan.isPopular,
      isActive: plan.isActive,
      features: [...(plan.features || [])],
      newFeatureInput: '',
      order: plan.order || 1
    });
    setIsModalOpen(true);
  };

  const handleDuplicatePlan = (plan: SaaSSubscriptionPlan) => {
    setEditingPlan(null);
    setFormData({
      name: `${plan.name} (Copy)`,
      code: `${plan.code}_copy`,
      price: plan.price,
      currency: plan.currency || 'KES',
      billingPeriod: plan.billingPeriod || 'monthly',
      description: plan.description || '',
      tagline: plan.tagline || '',
      maxUsers: plan.maxUsers === -1 ? 50 : plan.maxUsers,
      isUnlimitedUsers: plan.maxUsers === -1,
      maxStorageGb: plan.maxStorageGb || 10,
      moduleLimit: plan.moduleLimit === -1 ? 8 : (plan.moduleLimit || 3),
      isUnlimitedModules: plan.moduleLimit === -1,
      includedModules: [...(plan.includedModules || [])],
      allowCustomDomain: plan.allowCustomDomain,
      allowPublicWebsite: plan.allowPublicWebsite,
      prioritySupport: plan.prioritySupport,
      slaUptime: plan.slaUptime || '99.9%',
      isPopular: false,
      isActive: true,
      features: [...(plan.features || [])],
      newFeatureInput: '',
      order: plans.length + 1
    });
    setIsModalOpen(true);
  };

  const handleAddFeature = () => {
    if (!formData.newFeatureInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, prev.newFeatureInput.trim()],
      newFeatureInput: ''
    }));
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleToggleModule = (moduleId: ModuleId) => {
    setFormData(prev => {
      const exists = prev.includedModules.includes(moduleId);
      return {
        ...prev,
        includedModules: exists 
          ? prev.includedModules.filter(m => m !== moduleId)
          : [...prev.includedModules, moduleId]
      };
    });
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Plan Name is required');
      return;
    }

    setModalSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        code: (formData.code || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')).trim(),
        price: Number(formData.price) || 0,
        currency: formData.currency,
        billingPeriod: formData.billingPeriod,
        description: formData.description.trim(),
        tagline: formData.tagline.trim(),
        maxUsers: formData.isUnlimitedUsers ? -1 : Number(formData.maxUsers),
        maxStorageGb: Number(formData.maxStorageGb) || 10,
        moduleLimit: formData.isUnlimitedModules ? -1 : Number(formData.moduleLimit),
        includedModules: formData.includedModules,
        allowCustomDomain: formData.allowCustomDomain,
        allowPublicWebsite: formData.allowPublicWebsite,
        prioritySupport: formData.prioritySupport,
        slaUptime: formData.slaUptime,
        isPopular: formData.isPopular,
        isActive: formData.isActive,
        features: formData.features,
        order: Number(formData.order) || 1
      };

      const url = editingPlan 
        ? `/api/platform/plans/${editingPlan.id}`
        : '/api/platform/plans';
      
      const method = editingPlan ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save subscription plan');
      }

      setIsModalOpen(false);
      showSuccess(editingPlan ? `Plan "${payload.name}" updated successfully!` : `Plan "${payload.name}" created successfully!`);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error saving plan');
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/platform/plans/${planToDelete.id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete plan');
      }

      setPlanToDelete(null);
      showSuccess(data.message || `Plan "${planToDelete.name}" deleted successfully.`);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error deleting plan');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAssignTenantPlan = async (tenantId: string, newPlanId: string) => {
    setAssigningTenantId(tenantId);
    try {
      const res = await fetch(`/api/platform/tenants/${tenantId}/plan`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ planId: newPlanId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to assign plan');
      }

      showSuccess(`Tenant successfully switched to "${data.plan?.name || newPlanId}"!`);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to reassign plan');
    } finally {
      setAssigningTenantId(null);
    }
  };

  // Helper to count active subscribers per plan
  const getSubscribersCount = (planId: string, planCode: string) => {
    return tenants.filter(t => t.planId === planId || t.planId === planCode).length;
  };

  const activePlans = plans.filter(p => p.isActive);
  const totalSubscribers = tenants.length;
  const popularPlan = plans.find(p => p.isPopular);

  return (
    <div className="space-y-6 text-slate-800">
      {/* Toast Notification */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center space-x-2 text-xs font-semibold shadow-xs animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl flex items-center space-x-2 text-xs font-semibold shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">SaaS Subscription Plans &amp; Pricing Tiers</h1>
            <p className="text-xs text-slate-500 font-medium">
              Create, edit, and configure plan pricing, user seat limits, storage quotas, module allowances, and tenant allocations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (plans.length > 0) {
                setSelectedPlanForTenants(plans[0]);
                setIsAssignModalOpen(true);
              }
            }}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-all cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-slate-600" />
            <span>Tenant Allocations</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Plan</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Configured Plans</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{plans.length}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">{activePlans.length} Active / {plans.length - activePlans.length} Draft</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Subscribed Tenants</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{totalSubscribers}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Assigned across all tiers</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Featured Tier</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-sm font-black text-slate-900 truncate mt-1">{popularPlan?.name || 'None Set'}</p>
          <p className="text-[10px] text-amber-600 font-bold mt-1">
            {popularPlan ? `${popularPlan.currency} ${popularPlan.price.toLocaleString()} / ${popularPlan.billingPeriod}` : 'Mark a plan as popular'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pricing Range</span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-lg font-black text-purple-700 mt-1">
            {plans.length > 0
              ? `${plans[0].currency} ${Math.min(...plans.map(p => p.price)).toLocaleString()} - ${Math.max(...plans.map(p => p.price)).toLocaleString()}`
              : 'N/A'
            }
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Standard monthly rates</p>
        </div>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
          <p className="font-bold text-sm text-slate-700">Loading Subscription Plans...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3">
          <CreditCard className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No Subscription Plans Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Get started by creating your first SaaS subscription tier with custom pricing, bundled modules, and user limits.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Plan</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, idx) => {
            const subscribersCount = getSubscribersCount(plan.id, plan.code);
            const isEnterprise = plan.maxUsers === -1 && plan.moduleLimit === -1;

            return (
              <div 
                key={plan.id}
                className={`bg-white border rounded-2xl flex flex-col justify-between shadow-xs relative overflow-hidden transition-all hover:shadow-md ${
                  plan.isPopular 
                    ? 'border-blue-500 ring-2 ring-blue-500/20' 
                    : 'border-slate-200'
                }`}
              >
                {/* Accent Top Bar */}
                <div className={`h-1.5 w-full ${
                  plan.isPopular 
                    ? 'bg-blue-600' 
                    : idx === 0 
                    ? 'bg-emerald-500' 
                    : idx === 1 
                    ? 'bg-amber-500' 
                    : 'bg-purple-600'
                }`} />

                <div className="p-6 space-y-4 flex-1">
                  {/* Badge Row */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {plan.code}
                      </span>
                      {plan.isPopular && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-[10px] font-bold">
                          <Sparkles className="w-3 h-3 text-blue-600" />
                          <span>Most Popular</span>
                        </span>
                      )}
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      plan.isActive 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {plan.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  {/* Plan Name & Tagline */}
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{plan.name}</h3>
                    {plan.tagline && (
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{plan.tagline}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="pt-1">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-xs text-slate-500 font-bold">{plan.currency}</span>
                      <span className="text-3xl font-black text-slate-900 tracking-tight">
                        {plan.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        /{plan.billingPeriod === 'monthly' ? 'month' : plan.billingPeriod === 'annually' ? 'year' : 'quarter'}
                      </span>
                    </div>
                    {plan.description && (
                      <p className="text-xs text-slate-600 font-medium leading-relaxed mt-2 line-clamp-2">
                        {plan.description}
                      </p>
                    )}
                  </div>

                  {/* Limits Spec Strip */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 font-bold block text-[9px] uppercase">User Capacity</span>
                      <span className="font-bold text-slate-800">
                        {plan.maxUsers === -1 ? 'Unlimited Users' : `Up to ${plan.maxUsers} Users`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[9px] uppercase">Module Access</span>
                      <span className="font-bold text-slate-800">
                        {plan.moduleLimit === -1 ? 'All 15 Modules' : `Up to ${plan.moduleLimit} Modules`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[9px] uppercase">Custom Domain</span>
                      <span className={`font-bold ${plan.allowCustomDomain ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {plan.allowCustomDomain ? 'Supported' : 'Subdomain Only'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[9px] uppercase">SLA & Support</span>
                      <span className="font-bold text-slate-800">
                        {plan.prioritySupport ? `${plan.slaUptime || '99.9%'} Priority` : 'Standard Ticket'}
                      </span>
                    </div>
                  </div>

                  {/* Bundled Modules (if specified) */}
                  {plan.includedModules && plan.includedModules.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Pre-Bundled Modules ({plan.includedModules.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {plan.includedModules.map(mId => {
                          const mod = ALL_ERP_MODULES.find(m => m.id === mId);
                          return (
                            <span key={mId} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-[10px] font-semibold">
                              {mod?.name || mId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Feature Checklist */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Included Features</span>
                    <div className="space-y-1.5">
                      {plan.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start space-x-2 text-xs text-slate-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="font-medium text-[11px] leading-tight">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="bg-slate-50 border-t border-slate-100 p-4 flex flex-col gap-2">
                  {/* Subscriber summary */}
                  <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                    <div className="flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{subscribersCount} Active Tenant{subscribersCount === 1 ? '' : 's'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlanForTenants(plan);
                        setIsAssignModalOpen(true);
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      View / Assign
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(plan)}
                      className="flex-1 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Edit Plan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicatePlan(plan)}
                      title="Duplicate / Clone Plan"
                      className="p-2 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlanToDelete(plan)}
                      title="Delete Plan"
                      className="p-2 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== CREATE / EDIT PLAN MODAL ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create New SaaS Subscription Plan'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Configure pricing, module bundles, user seat quotas, and enterprise feature flags.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-5 text-xs">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Plan Display Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Growth & Professional"
                    value={formData.name}
                    onChange={e => {
                      const name = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        name,
                        code: !editingPlan ? name.toLowerCase().replace(/[^a-z0-9]/g, '_') : prev.code
                      }));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Plan Code Identifier <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. professional"
                    value={formData.code}
                    onChange={e => setFormData(prev => ({ ...prev, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Short Tagline / Target Audience</label>
                  <input
                    type="text"
                    placeholder="e.g. Perfect for established colleges, tier-2 SACCOs & supermarket chains"
                    value={formData.tagline}
                    onChange={e => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Detailed Description</label>
                  <textarea
                    rows={2}
                    placeholder="Provide a comprehensive summary of what this tier offers..."
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* Pricing & Billing */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Pricing &amp; Billing Cycle</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Price Rate</label>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={formData.price}
                      onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-black text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={e => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold cursor-pointer"
                    >
                      <option value="KES">KES (Kenyan Shilling - KSh)</option>
                      <option value="USD">USD (US Dollar - $)</option>
                      <option value="EUR">EUR (Euro - €)</option>
                      <option value="GBP">GBP (British Pound - £)</option>
                      <option value="TZS">TZS (Tanzanian Shilling)</option>
                      <option value="UGX">UGX (Ugandan Shilling)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Billing Interval</label>
                    <select
                      value={formData.billingPeriod}
                      onChange={e => setFormData(prev => ({ ...prev, billingPeriod: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold cursor-pointer"
                    >
                      <option value="monthly">Monthly Recurring (/mo)</option>
                      <option value="quarterly">Quarterly (/quarter)</option>
                      <option value="annually">Annual Billing (/year)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Resource Quotas & Entitlements */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Capacity Limits &amp; Entitlements</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-600 font-bold">User Account Seats</label>
                      <label className="inline-flex items-center space-x-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isUnlimitedUsers}
                          onChange={e => setFormData(prev => ({ ...prev, isUnlimitedUsers: e.target.checked }))}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-[10px] font-bold text-blue-700">Unlimited</span>
                      </label>
                    </div>
                    <input
                      type="number"
                      disabled={formData.isUnlimitedUsers}
                      min={1}
                      value={formData.maxUsers}
                      onChange={e => setFormData(prev => ({ ...prev, maxUsers: Number(e.target.value) }))}
                      className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold ${
                        formData.isUnlimitedUsers ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-600 font-bold">Max Modules Allowed</label>
                      <label className="inline-flex items-center space-x-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isUnlimitedModules}
                          onChange={e => setFormData(prev => ({ ...prev, isUnlimitedModules: e.target.checked }))}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-[10px] font-bold text-blue-700">All Modules</span>
                      </label>
                    </div>
                    <input
                      type="number"
                      disabled={formData.isUnlimitedModules}
                      min={1}
                      max={15}
                      value={formData.moduleLimit}
                      onChange={e => setFormData(prev => ({ ...prev, moduleLimit: Number(e.target.value) }))}
                      className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold ${
                        formData.isUnlimitedModules ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Storage Quota (GB)</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.maxStorageGb}
                      onChange={e => setFormData(prev => ({ ...prev, maxStorageGb: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>

                {/* Pre-bundled Module Checkboxes */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <label className="block text-slate-700 font-bold">
                    Pre-Bundled Modules (Auto-provisioned when tenant is assigned to this tier):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ALL_ERP_MODULES.map(mod => {
                      const isSelected = formData.includedModules.includes(mod.id);
                      return (
                        <button
                          key={mod.id}
                          type="button"
                          onClick={() => handleToggleModule(mod.id)}
                          className={`flex items-center space-x-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 ${
                            isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-slate-50'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="truncate text-[11px]">{mod.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Toggles & Badges */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center space-x-2.5 p-2 bg-white border border-slate-200 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowCustomDomain}
                    onChange={e => setFormData(prev => ({ ...prev, allowCustomDomain: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Custom Branded Domain Support</span>
                    <span className="text-[10px] text-slate-500 font-medium">Allow tenant to attach portal.company.com</span>
                  </div>
                </label>

                <label className="flex items-center space-x-2.5 p-2 bg-white border border-slate-200 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowPublicWebsite}
                    onChange={e => setFormData(prev => ({ ...prev, allowPublicWebsite: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Public SEO Website CMS</span>
                    <span className="text-[10px] text-slate-500 font-medium">Allows tenant to publish public landing page</span>
                  </div>
                </label>

                <label className="flex items-center space-x-2.5 p-2 bg-white border border-slate-200 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.prioritySupport}
                    onChange={e => setFormData(prev => ({ ...prev, prioritySupport: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Dedicated Priority SLA &amp; Support</span>
                    <span className="text-[10px] text-slate-500 font-medium">24/7 hotline and dedicated engineer</span>
                  </div>
                </label>

                <label className="flex items-center space-x-2.5 p-2 bg-white border border-slate-200 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={e => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">"Most Popular" Highlight Badge</span>
                    <span className="text-[10px] text-slate-500 font-medium">Highlights plan card with glow border</span>
                  </div>
                </label>

                <label className="flex items-center space-x-2.5 p-2 bg-white border border-slate-200 rounded-xl cursor-pointer sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Plan Active Status</span>
                    <span className="text-[10px] text-slate-500 font-medium">Active plans are available for new tenant subscriptions</span>
                  </div>
                </label>
              </div>

              {/* Dynamic Feature Bullets */}
              <div className="space-y-2">
                <label className="block text-slate-700 font-bold">
                  Marketing Feature Bullet Points ({formData.features.length})
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Automated M-Pesa STK Push Gateway Integration"
                    value={formData.newFeatureInput}
                    onChange={e => setFormData(prev => ({ ...prev, newFeatureInput: e.target.value }))}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer"
                  >
                    Add Feature
                  </button>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pt-1">
                  {formData.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-medium text-slate-800">{feat}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="inline-flex items-center space-x-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  {modalSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Plan...</span>
                    </>
                  ) : (
                    <span>{editingPlan ? 'Update Plan' : 'Create Plan'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== TENANT ALLOCATION DRAWER / MODAL ==================== */}
      {isAssignModalOpen && selectedPlanForTenants && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Tenant Subscription Plan Allocations
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    View active subscribers or switch customer organizations between pricing tiers.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Filter Tabs by Plan */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
              <button
                type="button"
                onClick={() => setSelectedPlanForTenants(null as any)}
                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0 ${
                  selectedPlanForTenants === null
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Tenants ({tenants.length})
              </button>
              {plans.map(p => {
                const count = getSubscribersCount(p.id, p.code);
                const isSelected = selectedPlanForTenants?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlanForTenants(p)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0 flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{p.name}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tenants Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Organization</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Current Plan</th>
                    <th className="p-3">Modules Enabled</th>
                    <th className="p-3 text-right">Switch Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenants.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                        No customer organizations provisioned yet.
                      </td>
                    </tr>
                  ) : (
                    tenants
                      .filter(t => !selectedPlanForTenants || t.planId === selectedPlanForTenants.id || t.planId === selectedPlanForTenants.code)
                      .map(t => {
                        const currentPlan = plans.find(p => p.id === t.planId || p.code === t.planId);
                        const isSwitching = assigningTenantId === t.id;

                        return (
                          <tr key={t.id} className="hover:bg-slate-50/70">
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{t.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">Slug: {t.slug}</div>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold text-[10px]">
                                {t.type}
                              </span>
                            </td>
                            <td className="p-3">
                              {currentPlan ? (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  <span>{currentPlan.name}</span>
                                </span>
                              ) : (
                                <span className="text-slate-400 font-mono text-[10px]">
                                  {t.planId || 'Default'}
                                </span>
                              )}
                            </td>
                            <td className="p-3 font-medium text-slate-600">
                              {t.enabledModules?.length || 0} Modules Active
                            </td>
                            <td className="p-3 text-right">
                              <select
                                disabled={isSwitching}
                                value={currentPlan?.id || t.planId}
                                onChange={e => handleAssignTenantPlan(t.id, e.target.value)}
                                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 cursor-pointer shadow-2xs hover:border-blue-500"
                              >
                                {plans.map(p => (
                                  <option key={p.id} value={p.id}>
                                    Assign {p.name} ({p.currency} {p.price.toLocaleString()})
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DELETE PLAN CONFIRMATION MODAL ==================== */}
      {planToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Subscription Plan</h3>
                <p className="text-xs text-slate-500">Are you sure you want to delete this plan?</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 space-y-1">
              <p className="font-bold">Plan: {planToDelete.name} ({planToDelete.code})</p>
              <p className="text-[11px]">
                {getSubscribersCount(planToDelete.id, planToDelete.code) > 0
                  ? `⚠️ Warning: ${getSubscribersCount(planToDelete.id, planToDelete.code)} active tenant(s) are subscribed to this plan. You must reassign them first.`
                  : 'This action will remove the plan from future signups and billing configurations.'}
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setPlanToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading || getSubscribersCount(planToDelete.id, planToDelete.code) > 0}
                onClick={handleDeletePlan}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold cursor-pointer text-xs"
              >
                {deleteLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
