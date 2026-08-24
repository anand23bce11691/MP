import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import {
  X,
  ShoppingBag,
  Trash2,
  CreditCard,
  ShieldCheck,
  Lock,
  Tag,
  Building,
  Smartphone,
  Banknote,
  MapPin
} from 'lucide-react';

export const ShopEasyCartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    placeOrder,
    isProcessingOrder,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  } = useTelemetry();

  const [customerName, setCustomerName] = useState('Anand Singh');
  const [customerEmail, setCustomerEmail] = useState('anand.singh@example.com');
  const [shippingAddress, setShippingAddress] = useState('221B Baker Street, Tech City, Bengaluru 560100');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | 'cod'>('card');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [upiId, setUpiId] = useState('anand@okhdfcbank');
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ msg: string; isError: boolean } | null>(null);

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountAmount = appliedCoupon ? Math.round((subtotal * appliedCoupon.discountPercentage) / 100) : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableAmount * 0.18);
  const finalTotal = taxableAmount; // inclusive or discounted total

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback({ msg: res.message, isError: !res.success });
    if (res.success) setCouponInput('');
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    await placeOrder(customerName, customerEmail, shippingAddress, paymentMethod);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white border-l border-slate-200 h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div>
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-base">ShopEasy Shopping Cart</h2>
                <p className="text-xs text-slate-500 font-medium">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)} items in your cart
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="p-5 space-y-3">
            {cart.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-3">
                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-300 mx-auto flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <p className="font-bold text-slate-900 text-sm">Your ShopEasy cart is empty</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Browse our verified catalog and add gear to test real telemetry order ingestion!
                </p>
              </div>
            ) : (
              cart.map(item => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors gap-3"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-14 h-14 object-cover rounded-xl border border-slate-100 bg-slate-50 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {item.product.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs truncate mt-0.5">{item.product.name}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      ₹{item.product.price.toLocaleString('en-IN')} each
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50 text-xs">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 font-bold"
                      >
                        -
                      </button>
                      <span className="px-2 py-0.5 font-mono font-bold text-slate-900 bg-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-slate-900 font-mono">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Checkout Form & Order Submit */}
        {cart.length > 0 && (
          <form onSubmit={handleCheckout} className="p-5 border-t border-slate-200 bg-slate-50 space-y-4">
            
            {/* Promo Code Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                Promo Discount Code
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>'{appliedCoupon.code}' Active ({appliedCoupon.discountPercentage}% OFF)</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value)}
                      placeholder="Try 'SAVE10' or 'TECH20'"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs uppercase font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponFeedback && (
                <p className={`text-[11px] font-medium ${couponFeedback.isError ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {couponFeedback.msg}
                </p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-mono font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span className="font-mono font-bold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Express Delivery</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Estimated GST (18% included)</span>
                <span className="font-mono">₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between font-black text-slate-900 text-sm">
                <span>Total Payable</span>
                <span className="text-blue-600 font-mono text-base">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                Delivery & Customer Information
              </label>
              
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Full Name"
                  className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="Email Address"
                  className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
                  placeholder="Shipping Address"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                Payment Option
              </label>

              <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                    paymentMethod === 'card'
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                    paymentMethod === 'upi'
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-2 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                    paymentMethod === 'netbanking'
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>Banking</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-2 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                    paymentMethod === 'cod'
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>COD</span>
                </button>
              </div>

              {paymentMethod === 'card' && (
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="Enter UPI ID (e.g. mobile@upi)"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isProcessingOrder}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs transition-all shadow-lg shadow-blue-600/20 active:scale-98"
            >
              {isProcessingOrder ? (
                <span>Ingesting Telemetry & Committing Transaction...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Place Monitored Order (₹{finalTotal.toLocaleString('en-IN')})</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Encrypted Transaction · Monitored by IncidentIQ Telemetry SDK</span>
            </p>
          </form>
        )}

      </div>
    </div>
  );
};
