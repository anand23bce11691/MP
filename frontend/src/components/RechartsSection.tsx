import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity, Cpu, Pause, Play, FastForward } from 'lucide-react';

export const RechartsSection: React.FC = () => {
  const {
    timeSeriesData,
    resourceData,
    timeRange,
    setTimeRange,
    streamingSpeed,
    setStreamingSpeed,
    isPaused,
    setIsPaused
  } = useTelemetry();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* 1. API & Database Latency Chart */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>API & SQL Execution Latency (ms)</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">Real-time probe response duration breakdown</p>
            </div>

            {/* Time Window Selectors */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
              {(['5m', '15m', '1h', '24h'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    timeRange === range
                      ? 'bg-white text-blue-600 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSql" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.75rem', fontSize: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="apiLatency" name="API Latency" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorApi)" />
                <Area type="monotone" dataKey="sqlLatency" name="SQL Latency" stroke="#e11d48" strokeWidth={2} fillOpacity={1} fill="url(#colorSql)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              <span>ShopEasy API (p95)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-600"></span>
              <span>SQL OrdersDb</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title={isPaused ? "Resume Live Stream" : "Pause Stream"}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setStreamingSpeed(streamingSpeed === 1000 ? 3000 : 1000)}
              className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Toggle Streaming Interval (1s vs 3s)"
            >
              <FastForward className={`w-3.5 h-3.5 ${streamingSpeed === 1000 ? 'text-blue-600' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. System Resource Consumption Chart */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <span>Core CPU & Memory Utilization (%)</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">Host system infrastructure usage metrics</p>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Baseline
            </span>
          </div>

          <div className="mt-6 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resourceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.75rem', fontSize: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="cpu" name="CPU Utilization %" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCpu)" />
                <Area type="monotone" dataKey="memory" name="Memory Usage %" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorMem)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
              <span>Host CPU %</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
              <span>RAM Memory %</span>
            </span>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">Sampling: 3000ms</span>
        </div>
      </div>

    </div>
  );
};
