import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserProfileModal } from '../profile/UserProfileModal';
import { PlatformSettings } from '../../types';
import { NotificationBell } from '../notifications/NotificationBell';
import {
  Shield, Building2, CreditCard, FileText, Settings, LogOut, LayoutDashboard, ChevronRight, User as UserIcon,
  Menu, X, KeyRound, Users, Sparkles, Edit2, Globe
} from 'lucide-react';

interface PlatformLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  children: React.ReactNode;
}

export const PlatformLayout: React.FC<PlatformLayoutProps> = ({
  currentTab,
  onSelectTab,
  children
}) => {
  const { user, logout } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    platformName: 'DAVETECH',
    tagline: 'Multi-Tenant Cloud Enterprise Management Console',
    logoUrl: '/davetech-logo.svg',
    primaryColor: '#1D53D9',
    secondaryColor: '#F49C10',
    supportEmail: 'admin@davetech.co.ke',
    companyName: 'Davetech Solutions',
    copyrightText: '© 2026 Davetech Solutions. All rights reserved.',
    allowSelfRegistration: false
  });

  const fetchPlatformSettings = async () => {
    try {
      const res = await fetch('/api/public/platform-settings');
      if (res.ok) {
        const data = await res.json();
        if (data && data.platformName) {
          setPlatformSettings(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch platform branding in layout:', err);
    }
  };

  useEffect(() => {
    fetchPlatformSettings();

    const handleSettingsUpdated = (e: any) => {
      if (e.detail) {
        setPlatformSettings(e.detail);
      } else {
        fetchPlatformSettings();
      }
    };

    window.addEventListener('platform-settings-updated', handleSettingsUpdated);
    return () => window.removeEventListener('platform-settings-updated', handleSettingsUpdated);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Platform Dashboard', icon: LayoutDashboard },
    { id: 'website-cms', label: 'Public Website CMS', icon: Globe },
    { id: 'tenants', label: 'Tenants & Subscriptions', icon: Building2 },
    { id: 'users', label: 'User Credentials & Accounts', icon: KeyRound },
    { id: 'plans', label: 'Subscription Plans', icon: CreditCard },
    { id: 'audit-logs', label: 'Global Audit Logs', icon: FileText },
    { id: 'settings', label: 'Platform Branding & Identity', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937] flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="h-16 bg-white border-b border-[#D8DCEB] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-[#777E8C] hover:text-[#1F2937] md:hidden rounded-lg hover:bg-slate-100 cursor-pointer"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo & Platform Name */}
          <button
            onClick={() => onSelectTab('settings')}
            className="flex items-center space-x-3 group text-left cursor-pointer p-1 rounded-xl hover:bg-slate-50 transition-colors"
            title="Click to edit Platform Name, Logo & Branding"
          >
            {platformSettings.logoUrl ? (
              <img
                src={platformSettings.logoUrl}
                alt={platformSettings.platformName}
                className="w-10 h-10 rounded-xl object-contain bg-white p-1 border border-[#D8DCEB] shrink-0 shadow-xs group-hover:border-[#1D53D9] transition-colors"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs shrink-0 group-hover:scale-105 transition-transform bg-[#1D53D9]"
              >
                <Shield className="w-5 h-5" />
              </div>
            )}

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-[#1D53D9] tracking-wide text-sm sm:text-base group-hover:text-blue-700 transition-colors">
                  {platformSettings.platformName || 'DAVETECH'}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block bg-[#EBE2F5] text-[#1D53D9] border border-[#D8DCEB]"
                >
                  Super Admin
                </span>
              </div>
              <p className="text-[11px] text-[#777E8C] truncate max-w-xs font-medium">
                {platformSettings.tagline || 'Multi-Tenant Management Console'}
              </p>
            </div>
          </button>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={() => { window.location.hash = '/public'; }}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-[#F8FAFC] hover:bg-slate-100 text-[#1D53D9] hover:text-blue-800 rounded-xl text-xs font-semibold border border-[#D8DCEB] transition-colors cursor-pointer"
            title="View Public Website"
          >
            <Globe className="w-3.5 h-3.5 text-[#1D53D9]" />
            <span>Public Website</span>
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-[#F8FAFC] hover:bg-slate-100 text-[#1D53D9] hover:text-blue-800 rounded-xl text-xs font-semibold border border-[#D8DCEB] transition-colors cursor-pointer"
            title="Edit Platform Identity & Logo"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#1D53D9]" />
            <span>Edit Platform Brand</span>
          </button>

          <NotificationBell tenantId="platform_super_admin" theme="platform" />

          <div className="h-4 w-px bg-[#D8DCEB]"></div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center space-x-2 p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-left"
              title="Edit Profile & Avatar"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#1D53D9]/40"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1D53D9] text-white font-bold text-xs flex items-center justify-center">
                  {user?.name?.charAt(0) || 'A'}
                </div>
              )}
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#1F2937]">{user?.name}</p>
                <p className="text-[10px] text-[#1D53D9] font-bold font-mono">SUPER_ADMIN</p>
              </div>
            </button>
            <button
              onClick={logout}
              className="p-2 text-[#777E8C] hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-20 md:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-20 w-64 bg-white border-r border-[#D8DCEB] p-4 flex flex-col justify-between shrink-0 transform transition-transform duration-200 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-bold text-[#777E8C] uppercase tracking-wider">
              Platform Controls
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1D53D9] text-white shadow-sm'
                      : 'text-[#777E8C] hover:text-[#1F2937] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#777E8C]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </button>
              );
            })}
          </div>

          <div className="p-3.5 bg-[#F8FAFC] border border-[#D8DCEB] rounded-2xl space-y-2 text-[11px] text-[#777E8C]">
            <div className="flex items-center space-x-2 text-[#1D53D9] font-bold">
              <Shield className="w-4 h-4" />
              <span>Isolation Engine Active</span>
            </div>
            <p className="text-[10px] leading-relaxed text-[#777E8C]">
              Operating as master platform authority. Multi-tenant database separation and module security policies are enforced.
            </p>
          </div>
        </aside>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 sm:p-8">
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
