import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import type { IncidentItem } from '../types';
import { ShieldAlert, CheckCircle2, ChevronRight, Zap, Bot, ShieldCheck } from 'lucide-react';

export const ActiveIncidentsSection: React.FC = () => {
  const { incidents, acknowledgeIncident, runAutoRemediation } = useTelemetry();
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);

  const activeIncidents = incidents.filter(i => i.status !== 'Resolved');

  return (
    <div className="space-y-4">
      
      {/* Section Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>Active Incident Root Cause & Remediations</span>
        </h2>
        <span className="text-xs text-slate-500 font-medium">{activeIncidents.length} Unresolved Incidents</span>
      </div>

      {incidents.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">No Active Incidents Detected</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              All monitored microservices are running within normal operational baselines. You can launch Chaos Simulations from the Chaos Laboratory tab to test real-time incident detection!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.map(inc => {
            const isResolved = inc.status === 'Resolved';
            const isCritical = inc.severity === 'CRITICAL';

            return (
              <div
                key={inc.id}
                className={`p-5 rounded-2xl bg-white border shadow-xs transition-all ${
                  isResolved
                    ? 'border-emerald-200 opacity-80'
                    : isCritical
                    ? 'border-rose-300 ring-2 ring-rose-500/10'
                    : 'border-amber-300 ring-2 ring-amber-500/10'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  
                  {/* Left: Incident Details & RCA */}
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        isCritical ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inc.severity}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-500">{inc.incidentNumber}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500 font-medium">{inc.timestamp}</span>

                      {isResolved ? (
                        <span className="px-2.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Resolved
                        </span>
                      ) : inc.acknowledged ? (
                        <span className="px-2.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 font-bold">
                          Investigating
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-bold animate-pulse">
                          Open Alert
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                      {inc.title}
                    </h3>

                    {/* AI Root Cause Card */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 text-blue-700 font-extrabold text-[11px] uppercase tracking-wider">
                        <Bot className="w-4 h-4 text-blue-600" />
                        <span>AI Root-Cause Diagnosis ({inc.confidenceScore}% Confidence)</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium">
                        {inc.rootCauseSummary}
                      </p>
                      <p className="text-slate-500 font-mono text-[11px]">
                        <strong>Evidence:</strong> {inc.telemetryEvidence}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {!isResolved && (
                      <>
                        <button
                          onClick={() => runAutoRemediation(inc.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-colors shadow-md shadow-blue-600/20"
                        >
                          <Zap className="w-4 h-4 text-amber-300" />
                          <span>Run Auto-Remediation</span>
                        </button>

                        {!inc.acknowledged && (
                          <button
                            onClick={() => acknowledgeIncident(inc.id)}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors border border-slate-300"
                          >
                            Acknowledge Incident
                          </button>
                        )}
                      </>
                    )}

                    <button
                      onClick={() => setSelectedIncident(selectedIncident?.id === inc.id ? null : inc)}
                      className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 mt-1"
                    >
                      <span>{selectedIncident?.id === inc.id ? 'Hide Evidence Chain' : 'View Evidence Chain'}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedIncident?.id === inc.id ? 'rotate-90' : ''}`} />
                    </button>
                  </div>

                </div>

                {/* Evidence Chain Drawer */}
                {selectedIncident?.id === inc.id && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in slide-in-from-top-2 duration-150">
                    <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Observed Telemetry Evidence Chain</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {inc.evidenceChain.map(ev => (
                        <div key={ev.step} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>Step {ev.step}: {ev.metric}</span>
                            <span className="text-rose-600 font-mono">{ev.observed}</span>
                          </div>
                          <p className="text-slate-500 text-[11px]">{ev.description} (Baseline: {ev.baseline})</p>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900">
                      <strong>Suggested Remediation Plan:</strong> {inc.suggestedRemediation}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
