import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ALL_ERP_MODULES } from '../../data/modulesCatalog';
import { UserProfileModal } from '../profile/UserProfileModal';
import { NotificationBell } from '../notifications/NotificationBell';
import { OfflineStatusIndicator } from '../offline/OfflineStatusIndicator';
import { OfflineGraceBanner } from '../offline/OfflineGraceBanner';
import {
  GraduationCap, Activity, ShoppingBag, Store, Truck, HeartHandshake,
  Coins, Wine, Briefcase, Calculator, Users, Package, UserCheck,
  LayoutDashboard, FileBarChart, Settings, LogOut, ChevronRight,
  Building2, Search, ShieldCheck, ChevronDown, User as UserIcon,
  Menu, X, Globe, Tv, Award, FileCheck, Scale, ExternalLink, Sparkles
} from 'lucide-react';
import { ModuleId } from '../../types';

interface TenantLayoutProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  children: React.ReactNode;
}

// Map icon string names to Lucide icons
const ICON_MAP: Record<string, React.ElementType> = {
  GraduationCap,
  Activity,
  ShoppingBag,
  Store,
  Truck,
  HeartHandshake,
  Coins,
  Wine,
  Briefcase,
  Calculator,
  Users,
  Package,
  UserCheck,
  Tv,
  Award,
  FileCheck,
  Scale
};

export const TenantLayout: React.FC<TenantLayoutProps> = ({
  currentRoute,
  onNavigate,
  children
}) => {
  const { tenant, user, enabledModules, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Tenant branding properties
  const companyName = tenant?.branding?.companyName || tenant?.name || 'Workspace';
  const logoUrl = tenant?.branding?.logoUrl;
  const primaryColor = tenant?.branding?.primaryColor || '#1e3a8a';
  const currencySymbol = tenant?.branding?.currencySymbol || '$';
  const currency = tenant?.branding?.currency || 'USD';

  // DYNAMIC SIDEBAR FILTERING: Only show modules enabled for this tenant!
  const availableModules = ALL_ERP_MODULES.filter(m => (enabledModules || []).includes(m.id));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        {/* Left: Mobile Toggle & Tenant Branding */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 md:hidden rounded-lg hover:bg-slate-100 cursor-pointer"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {logoUrl ? (
            <img
              src={logoUrl}
              alt={companyName}
              className="w-10 h-10 rounded-lg object-cover border border-slate-200"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-xs"
              style={{ backgroundColor: primaryColor }}
            >
              {companyName.charAt(0)}
            </div>
          )}

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-slate-900 text-base leading-tight">
                {companyName}
              </h1>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase text-white shadow-2xs"
                style={{ backgroundColor: primaryColor }}
              >
                {tenant?.type || 'Enterprise'}
              </span>
            </div>
            {/* Friendly Display: NO raw technical Tenant IDs */}
            <div className="flex items-center space-x-2 text-[11px] text-slate-500">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span className="font-medium text-slate-700">Workspace Active</span>
              </span>
              <span>•</span>
              <span>Currency: {currency} ({currencySymbol})</span>
            </div>
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${companyName}...`}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Right: Notifications, Public Website Link, Offline Status & User Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Public Website Preview Link */}
          {tenant?.slug && (
            <a
              href={`/public/${tenant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 rounded-lg text-xs font-bold transition-all border border-slate-200/80 shadow-2xs cursor-pointer"
              title="Open your public website in a new tab"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Public Website</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}

          <OfflineStatusIndicator />
          <NotificationBell tenantId={tenant?.id} theme="tenant" />

          <div className="h-5 w-px bg-slate-200"></div>

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.name || 'User'}
                  className="w-8 h-8 rounded-full object-cover border border-slate-300 shadow-2xs"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full text-white font-medium text-xs flex items-center justify-center shadow-2xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="text-left hidden lg:block text-xs">
                <p className="font-semibold text-slate-800 leading-tight">{user?.name}</p>
                <p className="text-[10px] text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 text-xs">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="font-semibold text-slate-900">{user?.name}</p>
                  <p className="text-[11px] text-slate-500">{user?.email}</p>
                  <div className="mt-1 flex items-center space-x-1 text-[10px] text-slate-600">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{companyName}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center space-x-2 font-medium cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>My Profile &amp; Avatar</span>
                </button>

                {(user?.role === 'TENANT_ADMIN' || user?.role === 'SUPER_ADMIN') && (
                  <>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onNavigate('/app/settings?tab=website');
                      }}
                      className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer font-medium text-blue-700"
                    >
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      <span>Public Website &amp; CMS</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onNavigate('/app/settings?tab=users');
                      }}
                      className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>Team &amp; User Accounts</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        onNavigate('/app/settings?tab=branding');
                      }}
                      className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Organization Settings</span>
                    </button>
                  </>
                )}

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center space-x-2 font-medium cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <OfflineGraceBanner />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-20 md:hidden"
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-20 w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 transform transition-transform duration-200 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
            {/* Core Navigation */}
            <div>
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Main Workspace
              </div>
              <button
                onClick={() => {
                  onNavigate('/app/dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 mt-1 rounded-lg text-xs font-medium transition-all ${
                  currentRoute === '/app/dashboard'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard Overview</span>
                </div>
              </button>
            </div>

            {/* DYNAMIC ENABLED MODULES ONLY */}
            <div>
              <div className="px-3 py-1 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Active Business Modules
                </span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {availableModules.length} Enabled
                </span>
              </div>

              <div className="mt-1 space-y-0.5">
                {availableModules.map((mod) => {
                  const Icon = ICON_MAP[mod.icon] || Briefcase;
                  const isActive = currentRoute.startsWith(mod.defaultPath);
                  return (
                    <button
                      key={mod.id}
                      onClick={() => {
                        onNavigate(mod.defaultPath);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'text-white shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      style={{
                        backgroundColor: isActive ? primaryColor : undefined
                      }}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        <span className="truncate">{mod.name}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Common Tools */}
            <div>
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Management &amp; Tools
              </div>
              <div className="mt-1 space-y-0.5">
                <button
                  onClick={() => {
                    onNavigate('/app/reports');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    currentRoute === '/app/reports'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileBarChart className="w-4 h-4 text-slate-500" />
                  <span>Reports &amp; Analytics</span>
                </button>

                {(user?.role === 'TENANT_ADMIN' || user?.role === 'SUPER_ADMIN') && (
                  <>
                    <button
                      onClick={() => {
                        onNavigate('/app/settings?tab=website');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer group ${
                        currentRoute.includes('tab=website')
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Globe className={`w-4 h-4 ${currentRoute.includes('tab=website') ? 'text-white' : 'text-blue-600 group-hover:scale-110'} transition-transform`} />
                        <span className="font-bold">Public Website &amp; CMS</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${currentRoute.includes('tab=website') ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-800'}`}>
                        LIVE
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('/app/settings?tab=branding');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        currentRoute.startsWith('/app/settings') && (currentRoute.includes('tab=branding') || (!currentRoute.includes('tab=website') && !currentRoute.includes('tab=users')))
                          ? 'bg-slate-900 text-white font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>ERP Branding &amp; Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('/app/settings?tab=users');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        currentRoute.includes('tab=users')
                          ? 'bg-slate-900 text-white font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Users className="w-4 h-4 text-slate-500" />
                      <span>Team &amp; User Accounts</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer Branding Info */}
          <div className="p-3 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center space-x-2 text-[11px] text-slate-600 font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{companyName}</span>
            </div>
          </div>
        </aside>

        {/* Page Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-100">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};
