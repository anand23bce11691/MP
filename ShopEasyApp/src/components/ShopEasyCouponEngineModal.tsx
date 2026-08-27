import React, { useState } from 'react';
import { X, Tag, Copy, Check, Sparkles } from 'lucide-react';
import { CouponCode } from '../types';

interface ShopEasyCouponEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCoupon: (code: string) => void;
}

export const ShopEasyCouponEngineModal: React.FC<ShopEasyCouponEngineModalProps> = ({
  isOpen,
  onClose,
  onApplyCoupon
}) => {
  const coupons: CouponCode[] = [
    { code: 'WELCOME10', discountPercentage: 10, description: 'Get 10% instant discount on your first order.', minAmount: 1000 },
    { code: 'FESTIVE20', discountPercentage: 20, description: 'Festive season special: 20% flat discount on orders over ₹10,000.', minAmount: 10000 },
    { code: 'FREESHIP', discountPercentage: 5, description: 'Extra 5% off + Guaranteed Free Express Delivery.', minAmount: 500 }
  ];

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Active Offers & Promo Coupons</h3>
              <p className="text-xs text-slate-500">Apply verified promo codes for extra savings</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {coupons.map(coupon => (
            <div key={coupon.code} className="bg-gradient-to-r from-amber-500/5 to-indigo-500/5 border border-dashed border-amber-500/40 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-lg">
                    {coupon.code}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Save {coupon.discountPercentage}%
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-normal">{coupon.description}</p>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => {
                    onApplyCoupon(coupon.code);
                    onClose();
                  }}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  Apply
                </button>
                <button
                  onClick={() => handleCopy(coupon.code)}
                  className="flex items-center justify-center gap-1 text-[10px] font-mono text-slate-500 hover:text-indigo-600"
                >
                  {copiedCode === coupon.code ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedCode === coupon.code ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
