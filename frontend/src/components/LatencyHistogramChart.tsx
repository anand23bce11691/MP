import React from 'react';

interface LatencyHistogramChartProps {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  p999: number;
}

export const LatencyHistogramChart: React.FC<LatencyHistogramChartProps> = ({
  p50,
  p90,
  p95,
  p99,
  p999
}) => {
  const percentiles = [
    { label: 'P50 (Median)', value: p50, color: 'bg-emerald-400' },
    { label: 'P90', value: p90, color: 'bg-cyan-400' },
    { label: 'P95', value: p95, color: 'bg-indigo-400' },
    { label: 'P99', value: p99, color: 'bg-amber-400' },
    { label: 'P99.9 (Max Tail)', value: p999, color: 'bg-rose-400' }
  ];

  const maxVal = Math.max(p999, 10);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
      <h4 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2">
        Synthetic Load Percentile Latency Distribution (P50 - P99.9)
      </h4>

      <div className="space-y-3 pt-1">
        {percentiles.map(p => {
          const widthPct = Math.max(5, (p.value / maxVal) * 100);

          return (
            <div key={p.label} className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">{p.label}</span>
                <span className="text-slate-200 font-bold">{p.value.toFixed(1)} ms</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${p.color}`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
