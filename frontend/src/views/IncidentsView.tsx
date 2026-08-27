import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { ActiveIncidentsSection } from '../components/ActiveIncidentsSection';
import { GeminiAiAdvisorCard } from '../components/GeminiAiAdvisorCard';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export const IncidentsView: React.FC = () => {
  const { incidents } = useTelemetry();

  const openIncidents = incidents.filter(i => i.status !== 'Resolved');
  const resolvedIncidents = incidents.filter(i => i.status === 'Resolved');

  return (
    <div className="space-y-6">
      
      {/* Header Stat Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Recorded</span>
            <span className="text-2xl font-black text-slate-900 font-mono">{incidents.length}</span>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-500 opacity-80" />
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Unresolved Alerts</span>
            <span className="text-2xl font-black text-rose-600 font-mono">{openIncidents.length}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            !
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Auto-Remediated</span>
            <span className="text-2xl font-black text-emerald-600 font-mono">{resolvedIncidents.length}</span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
      </div>

      {/* Google Gemini AI SRE Advisor */}
      <GeminiAiAdvisorCard />

      {/* Main Active & Historical Incidents List */}
      <ActiveIncidentsSection />

    </div>
  );
};
