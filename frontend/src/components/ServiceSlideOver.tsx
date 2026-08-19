import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { X, Server, RefreshCw, ExternalLink, Clock } from 'lucide-react';

export const ServiceSlideOver: React.FC = () => {
  const { selectedService, setSelectedService, restartService } = useTelemetry();

  if (!selectedService) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        
        <div>
          {/* SlideOver Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">{selectedService.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{selectedService.type}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedService(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Details Body */}
          <div className="p-6 space-y-6">
            
            {/* Status Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Health Status</span>
                <span className={`px-2.5 py-0.5 rounded font-extrabold text-[10px] uppercase ${
                  selectedService.status === 'healthy'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {selectedService.status}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Uptime Guarantee</span>
                <span className="font-bold text-slate-900 font-mono">{selectedService.uptime}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">P95 Latency Benchmark</span>
                <span className="font-bold text-slate-900 font-mono">{selectedService.latencyMs} ms</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Active Instances</span>
                <span className="font-bold text-slate-900 font-mono">{selectedService.instances}</span>
              </div>
            </div>

            {/* Endpoint */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Service Probe Endpoint</label>
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 font-mono text-xs text-slate-800 flex items-center justify-between truncate">
                <span className="truncate">{selectedService.endpoint}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            </div>

            {/* Recent Ping Probe Logs */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Recent Health Probe Telemetry</label>
              <div className="space-y-1.5">
                {selectedService.recentPings.map((ping, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {ping.time}
                    </span>
                    <span className="text-slate-900 font-bold">{ping.latency} ms</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold uppercase">
                      {ping.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer Action */}
        <div className="p-5 border-t border-slate-200 bg-slate-50">
          <button
            onClick={() => restartService(selectedService.id)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-colors shadow-md shadow-blue-600/20"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Restart Service Instance</span>
          </button>
        </div>

      </div>
    </div>
  );
};
