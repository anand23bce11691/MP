import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import type { ViewRoute } from '../types';
import {
  ShieldAlert,
  LayoutDashboard,
  ShoppingBag,
  Activity,
  AlertTriangle,
  Server,
  Terminal,
  FlaskConical,
  FileText,
  LogOut,
  Settings,
  UserCheck
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeRoute, setActiveRoute, incidents, services, setIsLogoutModalOpen, showToast, cart } = useTelemetry();

  const openIncidentsCount = incidents.filter(i => i.status !== 'Resolved').length;
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems: { id: ViewRoute; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    { id: 'dashboard', label: 'Command Center', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'shopeasy', label: 'ShopEasy App', icon: <ShoppingBag className="w-4 h-4" />, badge: totalCartCount > 0 ? totalCartCount : undefined },
    { id: 'live-monitoring', label: 'Live Monitoring', icon: <Activity className="w-4 h-4" /> },
    { id: 'incidents', label: 'Incidents', icon: <AlertTriangle className="w-4 h-4" />, badge: openIncidentsCount > 0 ? openIncidentsCount : undefined },
    { id: 'services', label: 'System Services', icon: <Server className="w-4 h-4" />, badge: services.length },
    { id: 'logs', label: 'Logs & Metrics', icon: <Terminal className="w-4 h-4" /> },
    { id: 'simulations', label: 'Chaos Laboratory', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-40 select-none shadow-sm">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-200">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-lg tracking-tight text-slate-900">Incident<span className="text-blue-600">IQ</span></span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 tracking-wider">AI OBSERVABILITY HUB</p>
        </div>
      </div>

      {/* Nav Menu Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase">Navigation</div>
        {navItems.map(item => {
          const isActive = activeRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveRoute(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  item.id === 'incidents' && openIncidentsCount > 0
                    ? 'bg-rose-100 text-rose-600 border border-rose-200 animate-pulse'
                    : item.id === 'shopeasy'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile & Session */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
              SA
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">S. Anderson</p>
              <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                <UserCheck className="w-2.5 h-2.5 text-emerald-500" /> Sys Admin
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => showToast('Settings configured for System Administrator (S. Anderson)')}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
