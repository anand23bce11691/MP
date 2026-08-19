import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import type { MetricItem } from '../types';
import { Cpu, HardDrive, Zap, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const MetricKpiStrip: React.FC = () => {
  const { metrics, setSelectedMetric } = useTelemetry();

  const getIcon = (id: string) => {
    switch (id) {
      case 'cpu': return <Cpu className="w-5 h-5 text-blue-600" />;
      case 'memory': return <HardDrive className="w-5 h-5 text-emerald-600" />;
      case 'requests': return <Zap className="w-5 h-5 text-indigo-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric: MetricItem) => {
        const isWarning = metric.status === 'warning';
        const isCritical = metric.status === 'critical';

        return (
          <div
            key={metric.id}
            onClick={() => setSelectedMetric(metric)}
            className={`p-5 rounded-2xl bg-white border shadow-xs hover:shadow-md transition-all cursor-pointer group ${
              isCritical
                ? 'border-rose-300 ring-2 ring-rose-500/20'
                : isWarning
                ? 'border-amber-300 ring-2 ring-amber-500/20'
                : 'border-slate-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">{metric.title}</span>
              <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-blue-50 transition-colors">
                {getIcon(metric.id)}
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <span className={`text-3xl font-black tracking-tight font-mono ${
                isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-slate-900'
              }`}>
                {metric.value}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Limit: {metric.threshold}</span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className={`font-semibold flex items-center gap-1 ${
                isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-slate-500'
              }`}>
                {metric.delta.includes('+') ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {metric.delta}
              </span>
              <span className="text-[10px] font-bold text-blue-600 group-hover:underline">Drilldown</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
