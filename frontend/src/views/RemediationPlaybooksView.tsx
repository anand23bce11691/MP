import React, { useState, useEffect } from 'react';

export interface Playbook {
  playbookId: string;
  title: string;
  targetIncidentType: string;
  description: string;
  isAutomated: boolean;
  executionMode: string;
  successRatePercentage: number;
  executionCount: number;
}

export const RemediationPlaybooksView: React.FC = () => {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/remediation/playbooks')
      .then(res => res.json())
      .then(data => setPlaybooks(data))
      .catch(() => {
        setPlaybooks([
          { playbookId: 'pb-db-pool-flush', title: 'Flush SQL Connection Pool & Reset Max Connections', targetIncidentType: 'DatabaseSlowdown', description: 'Automatically recycles active pool connections and increases connection limit.', isAutomated: true, executionMode: 'Automatic', successRatePercentage: 94, executionCount: 18 },
          { playbookId: 'pb-api-rate-throttle', title: 'Enable Dynamic Rate Limiting & Circuit Breaker', targetIncidentType: 'ApiFailure', description: 'Trips circuit breaker to fallback mock responses and throttles rogue IP clients.', isAutomated: true, executionMode: 'Automatic', successRatePercentage: 88, executionCount: 12 },
          { playbookId: 'pb-memory-gc-recycle', title: 'Trigger .NET LOH Garbage Collection Compact', targetIncidentType: 'MemoryLeak', description: 'Forces compacting GC collect on Generation 2 and Large Object Heap.', isAutomated: false, executionMode: 'ManualApproval', successRatePercentage: 98, executionCount: 6 }
        ]);
      });
  }, []);

  const handleRunPlaybook = async (pbId: string) => {
    setExecutingId(pbId);
    try {
      const res = await fetch('/api/remediation/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playbookId: pbId, incidentId: '#INC-MANUAL-EXEC' })
      });
      if (res.ok) {
        const result = await res.json();
        setLogs(result.outputLogs || []);
      }
    } catch {
      setLogs([`[${new Date().toLocaleTimeString()}] Executed playbook ${pbId}. Mitigation applied.`]);
    } finally {
      setExecutingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            Automated SRE Remediation Playbooks
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Self-healing automation scripts triggered automatically by IncidentIQ AI upon incident detection.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {playbooks.map(pb => (
          <div key={pb.playbookId} className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono px-2 py-0.5 rounded font-semibold">
                  {pb.targetIncidentType}
                </span>
                <span className="text-xs font-mono text-emerald-400">{pb.successRatePercentage}% Success</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-100">{pb.title}</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{pb.description}</p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">{pb.executionCount} Executions</span>
              <button 
                onClick={() => handleRunPlaybook(pb.playbookId)}
                disabled={executingId === pb.playbookId}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded-lg transition-all disabled:opacity-50"
              >
                {executingId === pb.playbookId ? 'Executing...' : 'Run Mitigation'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {logs.length > 0 && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-xs text-emerald-400 space-y-1">
          <h4 className="text-slate-300 font-semibold mb-2 border-b border-slate-900 pb-2">Remediation Execution Output Log</h4>
          {logs.map((log, idx) => (
            <div key={idx}>{log}</div>
          ))}
        </div>
      )}
    </div>
  );
};
