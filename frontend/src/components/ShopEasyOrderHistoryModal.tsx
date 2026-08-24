import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import {
  X,
  Package,
  Calendar,
  CheckCircle2,
  ShoppingBag
} from 'lucide-react';

export const ShopEasyOrderHistoryModal: React.FC = () => {
  const {
    orderHistory,
    isOrderHistoryOpen,
    setIsOrderHistoryOpen
  } = useTelemetry();

  if (!isOrderHistoryOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">ShopEasy Order History</h2>
              <p className="text-xs text-slate-500 font-medium">{orderHistory.length} recorded orders</p>
            </div>
          </div>
          <button
            onClick={() => setIsOrderHistoryOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {orderHistory.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <p className="font-bold text-slate-900 text-sm">No orders placed yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Place orders from the ShopEasy storefront to test live telemetry collection, database transaction commits, and order history tracking!
              </p>
            </div>
          ) : (
            orderHistory.map(order => (
              <div
                key={order.orderId}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-900 font-mono text-sm">#{order.orderId}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {order.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {order.status}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold uppercase">
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-slate-900 truncate">{item.name}</h5>
                        <p className="text-slate-500 font-mono text-[11px]">
                          ₹{item.price.toLocaleString('en-IN')} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Totals & Trace */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span>TraceId:</span>
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {order.telemetryTraceId}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">Total:</span>
                    <strong className="text-base font-black text-slate-900 font-mono">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
