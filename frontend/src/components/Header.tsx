import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { Bell, CheckCircle2, AlertTriangle, Gauge, X } from 'lucide-react';

export const Header: React.FC = () => {
  const { globalStatus, notifications, markAllNotificationsRead } = useTelemetry();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-8 py-4 flex items-center justify-between shadow-xs">
      {/* Title & Sub-label */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-blue-600 animate-pulse" />
            IncidentIQ
          </h1>
          
          {/* Operational Status Pill */}
          {globalStatus === 'healthy' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All systems operational
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Degraded Performance
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Autonomous AI Observability, Synthetic Stress Testing & Root-Cause Platform
        </p>
      </div>

      {/* Header Actions & Notifications */}
      <div className="flex items-center gap-3 relative">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors relative"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">Notifications ({notifications.length})</span>
                <div className="flex items-center gap-2">
                  <button onClick={markAllNotificationsRead} className="text-[11px] font-bold text-blue-600 hover:underline">
                    Mark all read
                  </button>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No notifications.</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`p-3 text-xs transition-colors ${n.read ? 'opacity-60' : 'bg-blue-50/50'}`}>
                      <div className="flex items-start gap-2">
                        {n.type === 'critical' ? (
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{n.title}</p>
                          <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* System Model Info Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
          <Gauge className="w-3.5 h-3.5 text-blue-600" />
          <span>IncidentIQ Engine v1.4</span>
        </div>
      </div>
    </header>
  );
};
