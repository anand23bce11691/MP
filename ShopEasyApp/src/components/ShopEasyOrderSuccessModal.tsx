import React from 'react';
import { useShopEasy } from '../context/ShopEasyContext';
import { CheckCircle2, ShieldCheck, ArrowRight, Activity, ShoppingBag } from 'lucide-react';

export const ShopEasyOrderSuccessModal: React.FC = () => {
  const { completedOrder, setCompletedOrder } = useShopEasy();

  if (!completedOrder) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-6 animate-in zoom-in-95 duration-150 text-center">
        
        <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Virtual Order Confirmed!</h2>
          <p className="text-xs text-slate-500 font-medium">
            Thank you, <strong className="text-slate-900">{completedOrder.customerName}</strong>! Your purchase was successfully placed.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3 text-left">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-400 font-medium">Order Reference ID:</span>
            <span className="font-mono font-bold text-slate-900">#ORD-{completedOrder.orderId}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-400 font-medium">Trace Telemetry ID:</span>
            <span className="font-mono text-blue-600 font-bold">{completedOrder.telemetryTraceId}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-400 font-medium">Purchased Items:</span>
            <span className="font-bold text-slate-900">{completedOrder.items.length} Product(s)</span>
          </div>
          <div className="flex justify-between font-black text-sm text-slate-900 pt-1">
            <span>Total Paid (Rupees):</span>
            <span className="font-mono text-emerald-600 text-base">₹{completedOrder.totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-left text-xs space-y-1 text-blue-900">
          <div className="flex items-center gap-1.5 font-bold text-blue-700">
            <Activity className="w-4 h-4 text-blue-600 animate-pulse" /> Telemetry Ingested into IncidentIQ
          </div>
          <p className="text-[11px] text-blue-800 leading-relaxed">
            Order payload with trace ID <code className="font-mono font-bold">{completedOrder.telemetryTraceId}</code> was posted to <code className="font-mono font-bold">http://localhost:5000/api/telemetry/ingest</code> for monitoring!
          </p>
        </div>

        <button
          onClick={() => setCompletedOrder(null)}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};
