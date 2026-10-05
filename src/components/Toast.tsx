import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] pointer-events-auto animate-in slide-in-from-bottom-2 fade-in duration-200">
      <div
        className={`flex items-center justify-between gap-2.5 px-4 py-3 rounded-2xl shadow-lg border text-xs sm:text-sm font-semibold ${
          toast.type === 'success'
            ? 'bg-emerald-900 text-white border-emerald-700'
            : toast.type === 'warning'
            ? 'bg-amber-900 text-white border-amber-700'
            : 'bg-slate-900 text-white border-slate-700'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="truncate">{toast.message}</span>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-300 hover:text-white p-0.5 rounded-md"
          aria-label="Cerrar notificación"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
