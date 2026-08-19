import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { LogOut } from 'lucide-react';

export const LogoutModal: React.FC = () => {
  const { isLogoutModalOpen, setIsLogoutModalOpen, showToast } = useTelemetry();

  if (!isLogoutModalOpen) return null;

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    showToast('Session ended cleanly for Sys Admin.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150 text-center">
        
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center border border-rose-200">
          <LogOut className="w-6 h-6" />
        </div>

        <div>
          <h3 className="font-extrabold text-slate-900 text-base">Sign Out of IncidentIQ?</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            You will terminate your active SRE Administrator telemetry monitoring session.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsLogoutModalOpen(false)}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmLogout}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-colors shadow-md shadow-rose-600/20"
          >
            Confirm Sign Out
          </button>
        </div>

      </div>
    </div>
  );
};
