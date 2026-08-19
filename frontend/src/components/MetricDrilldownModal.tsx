import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { X, Sliders, Save } from 'lucide-react';

export const MetricDrilldownModal: React.FC = () => {
  const { selectedMetric, setSelectedMetric, updateMetricThreshold } = useTelemetry();
  const [newThreshold, setNewThreshold] = useState('');

  if (!selectedMetric) return null;

  const handleSaveThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    if (newThreshold) {
      updateMetricThreshold(selectedMetric.id, newThreshold);
      setSelectedMetric(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">{selectedMetric.title} Drilldown</h3>
              <p className="text-xs text-slate-500 font-medium">Metric Threshold & Alert Trigger Settings</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedMetric(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSaveThreshold} className="p-6 space-y-5">
          
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Reading</span>
              <span className="text-2xl font-black text-slate-900 font-mono">{selectedMetric.value}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Threshold</span>
              <span className="text-2xl font-black text-blue-600 font-mono">{selectedMetric.threshold}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Configure New Alert Threshold</label>
            <input
              type="text"
              placeholder={`e.g. ${selectedMetric.threshold}`}
              value={newThreshold}
              onChange={e => setNewThreshold(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-600"
            />
            <p className="text-[11px] text-slate-500">
              When live telemetry exceeds this value, IncidentIQ triggers auto-classification and alerts.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setSelectedMetric(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-colors shadow-md shadow-blue-600/20"
            >
              <Save className="w-4 h-4" />
              <span>Save Threshold</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
