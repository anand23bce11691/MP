import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { Terminal, Search, Copy, Check } from 'lucide-react';

export const LogsMetricsView: React.FC = () => {
  const { logs } = useTelemetry();
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLogs = logs.filter(log => {
    const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel;
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.traceId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const handleCopyTrace = (traceId: string) => {
    navigator.clipboard.writeText(traceId);
    setCopiedId(traceId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Logs Console Container */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        
        {/* Top Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-600" />
              <span>Real-Time System Log & Telemetry Stream</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Showing {filteredLogs.length} live log events captured from ASP.NET Core & SQL Server
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              {['ALL', 'INFO', 'WARN', 'ERROR'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    filterLevel === lvl
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search message, service, or traceId..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 w-64"
              />
            </div>
          </div>
        </div>

        {/* Log Lines Stream Box */}
        <div className="p-4 rounded-xl bg-slate-900 font-mono text-xs text-slate-200 space-y-2 h-[480px] overflow-y-auto shadow-inner leading-relaxed select-text">
          {filteredLogs.length === 0 ? (
            <div className="py-20 text-center text-slate-500">
              No matching log records found for query "{searchQuery}".
            </div>
          ) : (
            filteredLogs.map(log => (
              <div key={log.id} className="flex items-start gap-3 py-1 border-b border-slate-800/60 hover:bg-slate-800/40 px-2 rounded transition-colors group">
                <span className="text-slate-500 shrink-0 text-[11px]">{log.timestamp}</span>
                
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                  log.level === 'ERROR'
                    ? 'bg-rose-950 text-rose-400 border border-rose-800'
                    : log.level === 'WARN'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {log.level}
                </span>

                <span className="text-blue-400 font-semibold shrink-0 text-[11px]">{log.service}</span>

                <span className="text-slate-200 flex-1 truncate">{log.message}</span>

                <button
                  onClick={() => handleCopyTrace(log.traceId)}
                  className="text-slate-500 hover:text-slate-300 text-[10px] flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy TraceId"
                >
                  {copiedId === log.traceId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{log.traceId}</span>
                </button>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
};
