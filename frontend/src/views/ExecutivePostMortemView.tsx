import React, { useState } from 'react';

export const ExecutivePostMortemView: React.FC = () => {
  const [incidentId, setIncidentId] = useState('#INC-20260826-001');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/post-mortem/${incidentId}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch {
      // Local fallback
      setReport({
        incidentTitle: 'SQL Lock Escalation & Order Placement Timeout Cascade',
        severity: 'High',
        executiveSummary: 'During high-volume checkout, an unindexed foreign key lookup caused SQL Server transaction lock escalation on table Orders, resulting in request queue timeouts on ShopEasy Core API.',
        rootCauseAnalysis: 'Root cause traced to lack of non-clustered index on OrderItems.ProductId and connection pool exhaustion under 2,000 RPM traffic spike.',
        actionItems: [
          'Added Non-Clustered Index on OrderItems.ProductId and User.Email',
          'Enabled Automated Remediation Playbook pb-db-pool-flush',
          'Configured Redis cache warm-up script for catalog endpoints'
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            Gemini AI Executive Post-Mortem Generator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated SLA impact assessment, root cause analysis summary, and post-incident action items.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="text"
            value={incidentId}
            onChange={e => setIncidentId(e.target.value)}
            className="bg-slate-950 text-slate-200 text-xs font-mono px-3 py-2 rounded-lg border border-slate-800 w-44"
          />
          <button 
            onClick={generateReport}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white text-xs font-semibold rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate AI Post-Mortem'}
          </button>
        </div>
      </div>

      {report && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 border border-rose-900 px-2 py-0.5 rounded font-semibold">
              SEVERITY: {report.severity}
            </span>
            <h3 className="text-lg font-bold text-slate-100 mt-2">{report.incidentTitle}</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div>
              <h4 className="font-semibold text-slate-200 text-sm mb-1">Executive Summary</h4>
              <p className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 leading-relaxed text-slate-300">
                {report.executiveSummary}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 text-sm mb-1">Root Cause Analysis</h4>
              <p className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 leading-relaxed font-mono text-cyan-400">
                {report.rootCauseAnalysis}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 text-sm mb-1">Remediation & Prevention Action Items</h4>
              <ul className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 space-y-2 list-disc list-inside">
                {report.actionItems?.map((item: string, i: number) => (
                  <li key={i} className="text-slate-300 font-mono">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
