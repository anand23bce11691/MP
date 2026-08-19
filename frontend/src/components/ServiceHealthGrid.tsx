import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import type { ServiceItem } from '../types';
import { Server, ArrowRight } from 'lucide-react';

export const ServiceHealthGrid: React.FC = () => {
  const { services, setSelectedService } = useTelemetry();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Server className="w-4 h-4 text-blue-600" />
          <span>Monitored Service Health</span>
        </h2>
        <span className="text-xs text-slate-500 font-medium">4 Core Microservices</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((service: ServiceItem) => {
          const isHealthy = service.status === 'healthy';
          const isDegraded = service.status === 'degraded';

          return (
            <div
              key={service.id}
              onClick={() => setSelectedService(service)}
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      isHealthy ? 'bg-emerald-500 animate-pulse' : isDegraded ? 'bg-amber-500' : 'bg-rose-500 animate-ping'
                    }`} />
                    <h3 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {service.name}
                    </h3>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    isHealthy
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isDegraded
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {service.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mt-2 font-medium">
                  {service.technology}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">P95 Latency</span>
                  <strong className={`font-mono text-sm font-extrabold ${
                    service.latencyMs > 500 ? 'text-rose-600' : service.latencyMs > 100 ? 'text-amber-600' : 'text-slate-900'
                  }`}>
                    {service.latencyMs}ms
                  </strong>
                </div>

                <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-600 font-bold text-[11px] transition-colors">
                  <span>Inspect</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
