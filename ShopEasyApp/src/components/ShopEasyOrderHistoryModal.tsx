import React from 'react';
import { useShopEasy } from '../context/ShopEasyContext';
import { X, ShoppingBag, Calendar, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

export const ShopEasyOrderHistoryModal: React.FC = () => {
  const { orders, isOrderHistoryOpen, setIsOrderHistoryOpen } = useShopEasy();

  if (!isOrderHistoryOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg leading-none">ShopEasy Order History</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">{orders.length} Virtual orders recorded & monitored</p>
            </div>
          </div>
          <button
            onClick={() => setIsOrderHistoryOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-4 pr-1">
          {orders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700 text-xs">No Order History Found</p>
              <p className="text-[11px] text-slate-400">Place an order in the storefront catalog to view your order history here.</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.orderId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5 text-xs">
                  <div>
                    <span className="font-mono font-black text-slate-900">#ORD-{order.orderId}</span>
                    <span className="text-[10px] text-slate-400 font-medium ml-2">{order.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[10px] flex items-center gap-1 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                    </span>
                    <span className="font-mono text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Trace: {order.telemetryTraceId}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.map(item => (
                    <div key={item.product.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img src={item.product.image} alt={item.product.name} className="w-8 h-8 object-cover rounded-lg border border-slate-200" />
                        <span className="font-bold text-slate-800">{item.product.name} × {item.quantity}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-slate-900">
                  <span className="text-slate-500 font-medium">Customer: {order.customerName}</span>
                  <span className="text-blue-600 font-mono text-sm font-black">Total: ₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
