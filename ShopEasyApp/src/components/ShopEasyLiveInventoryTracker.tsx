import React, { useState, useEffect } from 'react';
import { Clock, Flame } from 'lucide-react';

export const ShopEasyLiveInventoryTracker: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(899); // 14 mins 59 secs

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
          <Flame className="w-4 h-4" />
        </span>
        <div>
          <span className="font-bold text-slate-900 block">High Demand Items Reserved</span>
          <span className="text-[10px] text-slate-500">Cart items held for active checkout session</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 font-mono font-bold text-rose-600 bg-white border border-rose-200 px-3 py-1.5 rounded-xl shadow-xs">
        <Clock className="w-3.5 h-3.5" />
        <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
      </div>
    </div>
  );
};
