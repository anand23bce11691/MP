import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { RefreshCw, Radio, ShieldCheck, AlertCircle } from 'lucide-react';

export const TelemetryStrip: React.FC = () => {
  const { globalStatus, isRefreshing, refreshTelemetry } = useTelemetry();

  return (
    <div className="bg-slate-100 border-b border-slate-200 px-8 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-slate-700">
      {/* Left: Status Indicator */}
      <div className="flex items-center gap-3">
        {globalStatus === 'healthy' ? (
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>System status: Healthy · Monitored services within baseline</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-rose-700 font-semibold animate-pulse">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>System status: Attention Required · Anomaly detected on active telemetry stream</span>
          </div>
        )}
      </div>

      {/* Right: Live Pulse & Refresh Button */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
          <Radio className="w-3.5 h-3.5 text-blue-600 animate-radar" />
          <span>Telemetry streaming · Baseline window: 5 min · Model: IncidentIQ v1.4</span>
        </div>

        <button
          onClick={refreshTelemetry}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-all font-semibold shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Telemetry'}</span>
        </button>
      </div>
    </div>
  );
};
