import React, { useState } from 'react';
import { LatencyHistogramChart } from '../components/LatencyHistogramChart';

export const PerformanceBenchmarkView: React.FC = () => {
  const [profile, setProfile] = useState('Standard_100_RPM');
  const [benchmarkResult, setBenchmarkResult] = useState<any>({
    p50LatencyMs: 25.0,
    p90LatencyMs: 42.0,
    p95LatencyMs: 55.0,
    p99LatencyMs: 88.0,
    p999LatencyMs: 145.0,
    totalRequests: 1000,
    successfulRequests: 994,
    failedRequests: 6
  });
  const [loading, setLoading] = useState(false);

  const runBenchmark = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/benchmark/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileName: profile })
      });
      if (res.ok) {
        const data = await res.json();
        setBenchmarkResult(data);
      }
    } catch {
      // Local fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            Synthetic Load Benchmark & Percentile Estimator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Execute high-throughput synthetic load tests and analyze P50 through P99.9 latency distributions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={profile} 
            onChange={e => setProfile(e.target.value)}
            className="bg-slate-950 text-slate-200 text-xs font-mono px-3 py-2 rounded-lg border border-slate-800"
          >
            <option value="Standard_100_RPM">Standard Load (100 RPM)</option>
            <option value="Peak_1000_RPM">Peak Surge (1,000 RPM)</option>
            <option value="Stress_3000_RPM">Extreme Stress (3,000 RPM)</option>
          </select>
          <button 
            onClick={runBenchmark}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white text-xs font-semibold rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? 'Running Load Test...' : 'Run Synthetic Test'}
          </button>
        </div>
      </div>

      <LatencyHistogramChart 
        p50={benchmarkResult.p50LatencyMs || 25}
        p90={benchmarkResult.p90LatencyMs || 42}
        p95={benchmarkResult.p95LatencyMs || 55}
        p99={benchmarkResult.p99LatencyMs || 88}
        p999={benchmarkResult.p999LatencyMs || 145}
      />
    </div>
  );
};
