import React from 'react';
import { ServiceHealthGrid } from '../components/ServiceHealthGrid';
import { Server, ArrowRight, ArrowDown, Database, Cpu } from 'lucide-react';

export const ServicesTopologyView: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Topology Diagram Box */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Distributed Microservice Architecture Map</h2>
            <p className="text-xs text-slate-500 mt-0.5">Live probe mesh showing dependency interconnects</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            4 Connected Nodes
          </span>
        </div>

        {/* Node Connection Flow Visual */}
        <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-center justify-center gap-6">
          
          {/* ShopEasy Frontend Node */}
          <div className="p-4 rounded-xl bg-white border border-blue-200 shadow-sm text-center w-48 space-y-1">
            <Server className="w-6 h-6 text-blue-600 mx-auto" />
            <h4 className="font-extrabold text-xs text-slate-900">ShopEasy Storefront</h4>
            <span className="text-[10px] text-slate-500 block font-mono">React 18 + Vite SPA</span>
            <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold">HEALTHY</span>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-400 hidden md:block" />
          <ArrowDown className="w-5 h-5 text-slate-400 md:hidden" />

          {/* IncidentIQ ASP.NET Core Web API Node */}
          <div className="p-4 rounded-xl bg-white border border-blue-300 ring-2 ring-blue-500/10 shadow-sm text-center w-52 space-y-1">
            <Cpu className="w-6 h-6 text-indigo-600 mx-auto" />
            <h4 className="font-extrabold text-xs text-slate-900">Application Core API</h4>
            <span className="text-[10px] text-slate-500 block font-mono">ASP.NET Core 8 Web API</span>
            <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold">HEALTHY</span>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-400 hidden md:block" />
          <ArrowDown className="w-5 h-5 text-slate-400 md:hidden" />

          {/* SQL Server Database Node */}
          <div className="p-4 rounded-xl bg-white border border-rose-200 shadow-sm text-center w-48 space-y-1">
            <Database className="w-6 h-6 text-rose-600 mx-auto" />
            <h4 className="font-extrabold text-xs text-slate-900">SQL Server (OrdersDb)</h4>
            <span className="text-[10px] text-slate-500 block font-mono">Docker SQL Server 2022</span>
            <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold">HEALTHY</span>
          </div>

        </div>
      </div>

      {/* Microservices Detail List */}
      <ServiceHealthGrid />

    </div>
  );
};
