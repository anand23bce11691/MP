import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import {
  CheckCircle2,
  X,
  Activity,
  ArrowRight
} from 'lucide-react';

export const ShopEasyOrderSuccessModal: React.FC = () => {
  const {
    isOrderSuccessModalOpen,
    setIsOrderSuccessModalOpen,
    latestPlacedOrder,
    setActiveRoute
  } = useTelemetry();

  if (!isOrderSuccessModalOpen || !latestPlacedOrder) return null;

  const handleClose = () => {
    setIsOrderSuccessModalOpen(false);
  };

  const handleGoToTelemetry = () => {
    setIsOrderSuccessModalOpen(false);
    setActiveRoute('live-monitoring');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Banner */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-center relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-full bg-white text-emerald-600 mx-auto flex items-center justify-center shadow-lg mb-3 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider">
            Virtual Transaction Confirmed
          </span>
          <h2 className="text-2xl font-black tracking-tight mt-2">Order #{latestPlacedOrder.orderId}</h2>
          <p className="text-xs text-emerald-100 mt-1">
            Telemetry event successfully ingested by IncidentIQ SRE Engine
          </p>
        </div>

        {/* Order Details Body */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* Order Summary Strip */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Customer:</span>
              <span className="font-bold text-slate-900">{latestPlacedOrder.customerName} ({latestPlacedOrder.customerEmail})</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Total Paid:</span>
              <span className="font-black text-sm text-blue-600 font-mono">₹{latestPlacedOrder.totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Payment Method:</span>
              <span className="font-bold text-slate-900 uppercase font-mono">{latestPlacedOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Telemetry Trace ID:</span>
              <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                {latestPlacedOrder.telemetryTraceId}
              </span>
            </div>
          </div>

          {/* Items Preview */}
          <div className="space-y-2">
            <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] block">
              Purchased Items ({latestPlacedOrder.items.length})
            </span>
            <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto pr-1">
              {latestPlacedOrder.items.map(item => (
                <div key={item.productId} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={item.image} alt={item.name} className="w-9 h-9 object-cover rounded-lg border border-slate-200" />
                    <div>
                      <h5 className="font-bold text-slate-900 truncate max-w-[220px]">{item.name}</h5>
                      <span className="text-slate-400 font-mono text-[11px]">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-slate-900 font-mono">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Telemetry Action */}
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-blue-900">
              <Activity className="w-4 h-4 text-blue-600" />
              <div>
                <strong className="block font-bold">Inspect Live Telemetry</strong>
                <span className="text-[11px] text-blue-700">View this transaction's SQL query duration & API latency</span>
              </div>
            </div>
            <button
              onClick={handleGoToTelemetry}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-colors shrink-0"
            >
              <span>View Metrics</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors"
          >
            Continue Shopping
          </button>
        </div>

      </div>
    </div>
  );
};
