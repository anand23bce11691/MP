import React, { useState } from 'react';
import { useShopEasy } from '../context/ShopEasyContext';
import { X, ShoppingBag, Trash2, CreditCard, ShieldCheck, Lock, Tag, ArrowRight } from 'lucide-react';

export const ShopEasyCartDrawer: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateCartQuantity, placeOrder, isProcessingOrder } = useShopEasy();
  const [customerName, setCustomerName] = useState('Anand Singh');
  const [customerEmail, setCustomerEmail] = useState('anand.singh@example.com');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | 'cod'>('card');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const totalAmount = Math.max(0, subtotal - discountAmount);

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    if (promoCode.trim().toUpperCase() === 'WELCOME10') {
      setDiscountPercent(10);
    } else if (promoCode.trim().toUpperCase() === 'FESTIVE20') {
      setDiscountPercent(20);
    } else {
      setPromoError('Invalid promo code. Try WELCOME10 or FESTIVE20.');
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    await placeOrder(customerName, customerEmail);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div>
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
                <ShoppingBag className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-base leading-none">ShopEasy Cart</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">{cart.length} unique items in cart</p>
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
          <div className="p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700 text-sm">Your ShopEasy cart is empty</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Browse our catalog and add items to place virtual orders in ₹ Rupees and feed live telemetry into IncidentIQ!
                </p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <img src={item.product.image} alt={item.product.name} className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs leading-snug">{item.product.name}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">₹{item.product.price.toLocaleString('en-IN')}</p>
                      
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="text-xs font-mono font-bold px-1">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="font-black text-sm text-slate-900 font-mono">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
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
            
            {/* Promo Code Form */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Tag className="w-3.5 h-3.5 text-blue-600" /> Apply Discount Coupon
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME10"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono uppercase text-slate-900 focus:outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={applyPromo}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoError && <p className="text-[10px] text-rose-500 font-semibold">{promoError}</p>}
              {discountPercent > 0 && <p className="text-[10px] text-emerald-600 font-bold">✓ {discountPercent}% Discount Code Applied!</p>}
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Subtotal</span>
                <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount ({discountPercent}%)</span>
                  <span className="font-mono">-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Express Delivery</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between font-black text-slate-900 text-sm">
                <span>Total Amount</span>
                <span className="text-blue-600 font-mono">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Customer & Payment Details */}
            <div className="space-y-2 text-xs">
              <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block">Checkout Details</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
              <input
                type="email"
                required
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
              
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2 rounded-lg border text-[11px] font-bold text-center transition-all ${
                    paymentMethod === 'card' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  💳 Credit/Debit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2 rounded-lg border text-[11px] font-bold text-center transition-all ${
                    paymentMethod === 'upi' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  ⚡ Instant UPI / GPay
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
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isProcessingOrder}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              {isProcessingOrder ? (
                <span>Processing Order & Feeding Telemetry...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Place Virtual Order (₹{totalAmount.toLocaleString('en-IN')})</span>
                </>
              )}
            </button>
            
            <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Live Telemetry Feed to IncidentIQ (Port 5000)
            </p>
          </form>
        )}

      </div>
    </div>
  );
};
