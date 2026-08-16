import React from 'react';
import { ShieldAlert, ArrowLeft, LayoutDashboard, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AccessDeniedGuardProps {
  reason?: string;
  moduleName?: string;
  onNavigateDashboard?: () => void;
}

export const AccessDeniedGuard: React.FC<AccessDeniedGuardProps> = ({
  reason,
  moduleName,
  onNavigateDashboard
}) => {
  const { tenant, user } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-red-50/50">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-sm text-slate-600">
            {reason || (moduleName
              ? `The '${moduleName}' module is not enabled for ${tenant?.name || 'your organization'}.`
              : 'You do not have permission to access this area.')}
          </p>
        </div>

        {tenant && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-left space-y-1 text-xs text-slate-600">
            <div className="flex items-center space-x-2 text-slate-800 font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{tenant?.name || 'Organization Workspace'}</span>
            </div>
            <p>
              Module Status:{' '}
              <span className="font-semibold text-red-600">Disabled / Not Subscribed</span>
            </p>
            <p className="text-slate-500 text-[11px]">
              Contact your Platform Administrator in Platform Management to enable this module.
            </p>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onNavigateDashboard ? onNavigateDashboard() : window.location.hash = '#/app/dashboard'}
            className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Return to Workspace Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
