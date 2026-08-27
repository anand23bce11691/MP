import React from 'react';
import { ShieldCheck, Lock, CreditCard, Award } from 'lucide-react';

export const ShopEasySecurityBadge: React.FC = () => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-around gap-4 text-xs text-slate-600">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-emerald-600" />
        <div>
          <span className="font-bold text-slate-900 block">256-Bit SSL Encrypted</span>
          <span className="text-[10px] text-slate-500">Bank-grade checkout protection</span>
        </div>
      </div>

      <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
        <Lock className="w-5 h-5 text-indigo-600" />
        <div>
          <span className="font-bold text-slate-900 block">PCI-DSS Level 1</span>
          <span className="text-[10px] text-slate-500">Compliant card processing</span>
        </div>
      </div>

      <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
        <CreditCard className="w-5 h-5 text-blue-600" />
        <div>
          <span className="font-bold text-slate-900 block">Instant Rupee Refunds</span>
          <span className="text-[10px] text-slate-500">7-Day hassle free returns</span>
        </div>
      </div>

      <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
        <Award className="w-5 h-5 text-amber-500" />
        <div>
          <span className="font-bold text-slate-900 block">100% Authentic Brand</span>
          <span className="text-[10px] text-slate-500">Direct manufacturer warranty</span>
        </div>
      </div>
    </div>
  );
};
