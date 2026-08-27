import React, { useState, useEffect } from 'react';
import { TracingWaterfallGraph, type SpanData } from '../components/TracingWaterfallGraph';
import { TopologyDagMap, type DagNode, type DagEdge } from '../components/TopologyDagMap';

export const DistributedTracingView: React.FC = () => {
  const [spans, setSpans] = useState<SpanData[]>([]);
  const [nodes, setNodes] = useState<DagNode[]>([]);
  const [edges, setEdges] = useState<DagEdge[]>([]);
  const [totalDuration, setTotalDuration] = useState(142.5);
  const [traceId, setTraceId] = useState('tr-shopeasy-102');
  const [loading, setLoading] = useState(true);

  const fetchTraceData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tracing/dag?traceId=${traceId}`);
      if (res.ok) {
        const data = await res.json();
        setSpans(data.spans || []);
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        setTotalDuration(data.totalDurationMs || 142.5);
      }
    } catch {
      // Fallback local data
      setSpans([
        {
          spanId: 'sp-1', parentSpanId: '', traceId: 'tr-shopeasy-102',
          serviceName: 'ShopEasy Gateway Proxy', operationName: 'POST /api/shopeasy/orders',
          startTime: new Date().toISOString(), durationMs: 142.5, statusCode: 200, isError: false
        },
        {
          spanId: 'sp-2', parentSpanId: 'sp-1', traceId: 'tr-shopeasy-102',
          serviceName: 'ShopEasy Core API (Port 5001)', operationName: 'CreateOrderTransaction',
          startTime: new Date().toISOString(), durationMs: 120.0, statusCode: 200, isError: false
        },
        {
          spanId: 'sp-3', parentSpanId: 'sp-2', traceId: 'tr-shopeasy-102',
          serviceName: 'MSSQL Database Cluster (127.0.0.1:1433)', operationName: 'INSERT INTO Orders',
          startTime: new Date().toISOString(), durationMs: 45.0, statusCode: 200, isError: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTraceData();
  }, [traceId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            Distributed Tracing & APM Waterfall Inspector
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end request propagation, microservice latency breakdown, and DAG dependency graph.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="text" 
            value={traceId} 
            onChange={(e) => setTraceId(e.target.value)}
            placeholder="Trace ID (e.g. tr-shopeasy-102)"
            className="bg-slate-950 text-slate-200 text-xs font-mono px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 w-48"
          />
          <button 
            onClick={fetchTraceData}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-medium rounded-lg hover:brightness-110 transition-all"
          >
            Fetch Trace
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800 font-mono text-sm">
          Loading distributed trace waterfall graph...
        </div>
      ) : (
        <>
          <TopologyDagMap nodes={nodes} edges={edges} />
          <TracingWaterfallGraph spans={spans} totalDurationMs={totalDuration} />
        </>
      )}
    </div>
  );
};
