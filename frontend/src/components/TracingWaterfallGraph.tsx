import React from 'react';

export interface SpanData {
  spanId: string;
  parentSpanId: string;
  traceId: string;
  serviceName: string;
  operationName: string;
  startTime: string;
  durationMs: number;
  statusCode: number;
  isError: boolean;
  errorMessage?: string;
  tags?: Record<string, string>;
}

interface TracingWaterfallGraphProps {
  spans: SpanData[];
  totalDurationMs: number;
}

export const TracingWaterfallGraph: React.FC<TracingWaterfallGraphProps> = ({ spans, totalDurationMs }) => {
  const maxDuration = Math.max(totalDurationMs, ...spans.map(s => s.durationMs));

  return (
    <div className="space-y-3 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          Distributed Trace Execution Timeline ({spans.length} Spans)
        </h4>
        <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2.5 py-1 rounded-md border border-slate-700">
          Total Duration: {totalDurationMs.toFixed(1)} ms
        </span>
      </div>

      <div className="space-y-2 pt-2">
        {spans.map((span, idx) => {
          const widthPercent = Math.max(3, (span.durationMs / maxDuration) * 100);
          const offsetPercent = idx * 8; // Offset waterfall step

          return (
            <div key={span.spanId} className="group relative bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    span.isError ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {span.statusCode}
                  </span>
                  <span className="font-medium text-slate-200">{span.serviceName}</span>
                  <span className="text-slate-500 font-mono">→ {span.operationName}</span>
                </div>
                <span className="font-mono text-slate-400">{span.durationMs.toFixed(1)} ms</span>
              </div>

              {/* Waterfall bar track */}
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden relative">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    span.isError 
                      ? 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]' 
                      : 'bg-gradient-to-r from-cyan-600 to-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                  }`}
                  style={{
                    width: `${widthPercent}%`,
                    marginLeft: `${Math.min(offsetPercent, 80)}%`
                  }}
                />
              </div>

              {span.errorMessage && (
                <p className="mt-2 text-[11px] font-mono text-rose-400/90 bg-rose-950/40 p-2 rounded border border-rose-900/50">
                  ⚠️ {span.errorMessage}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
