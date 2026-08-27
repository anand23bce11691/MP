import React from 'react';

export interface DagNode {
  id: string;
  label: string;
  type: string;
  latencyMs: number;
  errorRatePercent: number;
  throughputRpm: number;
  status: string;
}

export interface DagEdge {
  sourceId: string;
  targetId: string;
  protocol: string;
  callCountPerMin: number;
  avgLatencyMs: number;
}

interface TopologyDagMapProps {
  nodes: DagNode[];
  edges: DagEdge[];
}

export const TopologyDagMap: React.FC<TopologyDagMapProps> = ({ nodes, edges }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Microservice Topology & Dependency Graph (DAG)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Real-time inter-service request routing and latency dependency graph</p>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-3 py-1 rounded-full">
          {nodes.length} Nodes • {edges.length} Dependencies
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {nodes.map(node => {
          const isWarning = node.status === 'Warning';
          const isCritical = node.status === 'Critical';

          return (
            <div 
              key={node.id} 
              className={`relative bg-slate-950/80 rounded-xl p-4 border transition-all duration-300 ${
                isCritical 
                  ? 'border-rose-500/80 shadow-[0_0_20px_rgba(244,63,94,0.25)]' 
                  : isWarning 
                  ? 'border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded ${
                  node.type === 'Database' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                  node.type === 'Cache' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                }`}>
                  {node.type}
                </span>
                <span className={`w-2 h-2 rounded-full ${
                  isCritical ? 'bg-rose-500 animate-ping' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
              </div>

              <h4 className="text-sm font-medium text-slate-100 line-clamp-1">{node.label}</h4>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-900 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Latency</span>
                  <span className="font-mono text-slate-200 font-medium">{node.latencyMs} ms</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Throughput</span>
                  <span className="font-mono text-slate-200 font-medium">{node.throughputRpm} RPM</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
        <span className="text-slate-500">Service Protocols:</span>
        {edges.map((edge, i) => (
          <span key={i} className="bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
            {edge.sourceId} → {edge.targetId} ({edge.protocol} - {edge.avgLatencyMs}ms)
          </span>
        ))}
      </div>
    </div>
  );
};
