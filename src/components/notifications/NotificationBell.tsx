import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Check, Trash2, Mail, Phone, Building2, 
  ExternalLink, Sparkles, ShieldCheck, AlertCircle, 
  Layers, Clock, X, CheckCheck, RefreshCw, UserCheck
} from 'lucide-react';
import { PlatformNotification } from '../../types';

interface NotificationBellProps {
  tenantId?: string;
  theme?: 'platform' | 'tenant';
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ 
  tenantId = 'platform_super_admin',
  theme = 'platform' 
}) => {
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'DEMO' | 'SYSTEM'>('ALL');
  const [selectedNotification, setSelectedNotification] = useState<PlatformNotification | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-user-id': localStorage.getItem('erp_user_id') || ''
  });

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Polling every 10s for real-time alerts
    return () => clearInterval(interval);
  }, [tenantId]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: getHeaders()
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (selectedNotification?.id === id) setSelectedNotification(null);
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      const res = await fetch('/api/notifications/clear-all', {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setNotifications([]);
        setSelectedNotification(null);
      }
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'DEMO') return n.type === 'DEMO_REQUEST';
    if (activeFilter === 'SYSTEM') return n.type !== 'DEMO_REQUEST';
    return true;
  });

  const formatTimeAgo = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={popoverRef}>
      
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className={`p-2 rounded-xl transition-all relative cursor-pointer ${
          isOpen
            ? 'bg-blue-100 text-blue-700'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
        title={`${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`}
      >
        <Bell className="w-4.5 h-4.5" />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-amber-500 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col text-slate-800 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 text-xs">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-slate-300 hover:text-white font-medium hover:underline cursor-pointer flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200 text-xs">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer text-[11px] ${
                  activeFilter === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveFilter('DEMO')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer text-[11px] ${
                  activeFilter === 'DEMO'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Demo Requests ({notifications.filter(n => n.type === 'DEMO_REQUEST').length})
              </button>
              <button
                onClick={() => setActiveFilter('SYSTEM')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer text-[11px] ${
                  activeFilter === 'SYSTEM'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                System
              </button>
            </div>

            <button
              onClick={fetchNotifications}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 px-4">
                <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2 opacity-50" />
                <p className="text-xs font-semibold text-slate-600">No notifications found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  When prospects book demos or system events occur, alerts will appear here.
                </p>
              </div>
            ) : (
              filteredNotifications.map(notif => {
                const isDemo = notif.type === 'DEMO_REQUEST';
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.isRead) handleMarkAsRead(notif.id);
                      setSelectedNotification(notif);
                    }}
                    className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer relative group ${
                      !notif.isRead ? 'bg-amber-50/60' : 'bg-white'
                    }`}
                  >
                    {/* Unread indicator bar */}
                    {!notif.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isDemo 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isDemo ? <Sparkles className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </div>

                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h4 className="text-xs font-bold text-slate-900 leading-tight">
                              {notif.title}
                            </h4>
                          </div>

                          <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>

                          {/* Quick Metadata Badges */}
                          {isDemo && notif.metadata && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              {notif.metadata.email && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700 font-medium">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span className="truncate max-w-[140px]">{notif.metadata.email}</span>
                                </span>
                              )}
                              {notif.metadata.phone && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700 font-medium">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{notif.metadata.phone}</span>
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center space-x-2 mt-2 text-[10px] text-slate-400 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(notif.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex flex-col items-end space-y-1 shrink-0">
                        <button
                          onClick={(e) => handleDeleteNotification(notif.id, e)}
                          className="text-slate-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded cursor-pointer"
                          title="Delete notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center flex items-center justify-between px-3">
              <span className="text-[11px] text-slate-500 font-medium">
                {notifications.length} total notifications
              </span>
              <button
                onClick={handleClearAll}
                className="text-[11px] text-red-600 hover:text-red-800 font-semibold cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}

        </div>
      )}

      {/* ==================== DEMO LEAD / NOTIFICATION DETAIL MODAL ==================== */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedNotification.type === 'DEMO_REQUEST'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {selectedNotification.type.replace('_', ' ')}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedNotification.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedNotification(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Details */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px]">Message / Summary</span>
                <p className="text-slate-800 mt-1 text-xs leading-relaxed font-medium">
                  {selectedNotification.message}
                </p>
              </div>

              {selectedNotification.metadata && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  {selectedNotification.metadata.name && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Contact Name</span>
                      <p className="text-slate-900 font-bold">{selectedNotification.metadata.name}</p>
                    </div>
                  )}

                  {selectedNotification.metadata.organization && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Organization</span>
                      <p className="text-slate-900 font-bold">{selectedNotification.metadata.organization}</p>
                    </div>
                  )}

                  {selectedNotification.metadata.email && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Email Address</span>
                      <a 
                        href={`mailto:${selectedNotification.metadata.email}`} 
                        className="text-blue-600 hover:underline font-bold block truncate"
                      >
                        {selectedNotification.metadata.email}
                      </a>
                    </div>
                  )}

                  {selectedNotification.metadata.phone && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Phone</span>
                      <a 
                        href={`tel:${selectedNotification.metadata.phone}`} 
                        className="text-blue-600 hover:underline font-bold block"
                      >
                        {selectedNotification.metadata.phone}
                      </a>
                    </div>
                  )}

                  {selectedNotification.metadata.industry && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Industry</span>
                      <p className="text-slate-800 font-semibold">{selectedNotification.metadata.industry}</p>
                    </div>
                  )}

                  {selectedNotification.metadata.selectedPlan && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Selected Plan</span>
                      <p className="text-emerald-700 font-bold">{selectedNotification.metadata.selectedPlan}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedNotification.metadata?.interestedModules && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Requested Modules:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedNotification.metadata.interestedModules.map((m: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-[10px] uppercase">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              {selectedNotification.metadata?.email && (
                <a
                  href={`mailto:${selectedNotification.metadata.email}?subject=Davetech%20ERP%20Demonstration%20Scheduled&body=Hello%20${selectedNotification.metadata.name},%0A%0AThank%20you%20for%20requesting%20a%20demonstration%20of%20Davetech%20ERP.`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Follow-Up Email</span>
                </a>
              )}

              <button
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
