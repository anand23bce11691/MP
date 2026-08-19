import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { FlaskConical, Zap, AlertTriangle, ShieldAlert, Play, Radio } from 'lucide-react';

export const SimulationsView: React.FC = () => {
  const { triggerChaosSimulation, setActiveRoute } = useTelemetry();

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-widest">
              SRE CHAOS EXPERIMENTATION SANDBOX
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-2">IncidentIQ Chaos Laboratory</h2>
          <p className="text-xs text-amber-100 mt-1 max-w-xl">
            Inject real synthetic failure states into the ShopEasy E-Commerce backend to test IncidentIQ's automated incident detection, telemetry anomaly alerts, and AI root-cause diagnosis.
          </p>
        </div>

        <button
          onClick={() => setActiveRoute('shopeasy')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-rose-700 font-extrabold text-xs shadow-lg hover:bg-amber-50 transition-all"
        >
          <Radio className="w-4 h-4 text-rose-600" />
          <span>Test on ShopEasy App</span>
        </button>
      </div>

      {/* 4 Active Chaos Injection Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Chaos Experiment 1: Database Slowdown */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase">
                High Latency Anomaly
              </span>
              <FlaskConical className="w-5 h-5 text-amber-600" />
            </div>

            <h3 className="text-base font-extrabold text-slate-900 mt-2">Database Connection Lock & Slowdown</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Injects unindexed connection pool locks into OrdersDb. Increases SQL execution duration from 8ms to 1,450ms, causing ShopEasy checkout delays.
            </p>
          </div>

          <button
            onClick={() => triggerChaosSimulation('dbslowdown')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition-colors shadow-md shadow-amber-500/20"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Inject Database Lock Chaos</span>
          </button>
        </div>

        {/* Chaos Experiment 2: Traffic Spike */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase">
                Resource Exhaustion
              </span>
              <Zap className="w-5 h-5 text-rose-600" />
            </div>

            <h3 className="text-base font-extrabold text-slate-900 mt-2">Traffic Surge & Threadpool Saturation</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Simulates a 15x traffic surge (2,850 req/min), saturating the web worker thread pool and elevating host CPU utilization to 94%.
            </p>
          </div>

          <button
            onClick={() => triggerChaosSimulation('trafficspike')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs transition-colors shadow-md shadow-rose-500/20"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Inject Traffic Spike Chaos</span>
          </button>
        </div>

        {/* Chaos Experiment 3: External API Failure */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase">
                HTTP 500 Outage
              </span>
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>

            <h3 className="text-base font-extrabold text-slate-900 mt-2">External Payment Gateway Outage</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Causes external payment gateway REST API to respond with HTTP 500 Internal Error on 78% of order payment requests.
            </p>
          </div>

          <button
            onClick={() => triggerChaosSimulation('apifailure')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-colors shadow-md shadow-rose-600/20"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Inject Payment Gateway Outage</span>
          </button>
        </div>

        {/* Chaos Experiment 4: Cascading Infrastructure Outage */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase">
                Cascading Crisis
              </span>
              <ShieldAlert className="w-5 h-5 text-purple-600" />
            </div>

            <h3 className="text-base font-extrabold text-slate-900 mt-2">Cascading Infrastructure Failure</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Triggers compound failure across Database, Web API, and Payment Gateway simultaneously to test multi-incident response.
            </p>
          </div>

          <button
            onClick={() => triggerChaosSimulation('cascading')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs transition-colors shadow-md shadow-purple-600/20"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Inject Cascading Outage</span>
          </button>
        </div>

      </div>

    </div>
  );
};
