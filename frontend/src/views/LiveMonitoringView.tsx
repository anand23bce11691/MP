import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { Radio } from 'lucide-react';

export const LiveMonitoringView: React.FC = () => {
  const { services, timeSeriesData } = useTelemetry();

  const currentApiLat = timeSeriesData[timeSeriesData.length - 1]?.apiLatency || 42;
  const currentSqlLat = timeSeriesData[timeSeriesData.length - 1]?.sqlLatency || 8;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
            <h2 className="text-xl font-black text-slate-900">Live Process & Traffic Telemetry Monitor</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Real-time streaming probes capturing ASP.NET Core process threads, HTTP endpoint request duration, and SQL Server queries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
            Current API P95: <strong className="text-blue-600 font-extrabold">{currentApiLat}ms</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
            SQL Query P95: <strong className="text-rose-600 font-extrabold">{currentSqlLat}ms</strong>
          </div>
        </div>
      </div>

      {/* Monitored Processes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map(s => (
          <div key={s.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-slate-900">{s.name}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                s.status === 'healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {s.status}
              </span>
            </div>

            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between text-slate-500">
                <span>Instances:</span>
                <span className="font-bold text-slate-900">{s.instances} node(s)</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Response Time:</span>
                <span className="font-bold text-blue-600">{s.latencyMs} ms</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Uptime:</span>
                <span className="font-bold text-slate-900">{s.uptime}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full ${s.status === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min(100, Math.max(10, 100 - s.latencyMs / 20))}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
