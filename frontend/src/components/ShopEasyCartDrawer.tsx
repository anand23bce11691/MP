import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { X, ShoppingBag, Trash2, CreditCard, ShieldCheck, Lock } from 'lucide-react';

export const ShopEasyCartDrawer: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, placeOrder, isProcessingOrder } = useTelemetry();
  const [customerName, setCustomerName] = useState('Anand Singh');
  const [customerEmail, setCustomerEmail] = useState('anand.singh@example.com');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');

  if (!isCartOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    await placeOrder(customerName, customerEmail);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div>
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">ShopEasy Cart</h2>
                <p className="text-xs text-slate-500 font-medium">{cart.length} unique items</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="font-medium text-sm">Your ShopEasy cart is currently empty.</p>
                <p className="text-xs text-slate-400">Browse our 15 featured products and add items to test live telemetry order processing!</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <img src={item.product.image} alt={item.product.name} className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs leading-tight">{item.product.name}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">₹{item.product.price.toLocaleString('en-IN')} × {item.quantity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm text-slate-900 font-mono">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Checkout Form & Order Submit */}
        {cart.length > 0 && (
          <form onSubmit={handleCheckout} className="p-5 border-t border-slate-200 bg-slate-50 space-y-4">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Subtotal</span>
                <span className="font-mono">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Express Delivery</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between font-extrabold text-slate-900 text-sm">
                <span>Total Amount</span>
                <span className="text-blue-600 font-mono">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Virtual Checkout Details</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Customer Full Name"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
              <input
                type="email"
                required
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                placeholder="Customer Email Address"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessingOrder}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs transition-colors shadow-lg shadow-blue-600/20"
            >
              {isProcessingOrder ? (
                <span>Processing Order & Ingesting Telemetry...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Place Virtual Order (₹{totalAmount.toLocaleString('en-IN')})</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> Monitored by IncidentIQ Telemetry SDK
            </p>
          </form>
        )}

      </div>
    </div>
  );
};
