import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext({
  showToast: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {}
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const success = useCallback((msg, duration) => showToast(msg, 'success', duration), [showToast]);
  const error = useCallback((msg, duration) => showToast(msg, 'error', duration), [showToast]);
  const info = useCallback((msg, duration) => showToast(msg, 'info', duration), [showToast]);
  const warning = useCallback((msg, duration) => showToast(msg, 'warning', duration), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => {
          const typeConfig = {
            success: {
              icon: CheckCircle2,
              border: 'border-emerald-500/50',
              bg: 'bg-slate-900/95 text-emerald-300',
              iconColor: 'text-emerald-400',
              glow: 'shadow-emerald-500/20'
            },
            error: {
              icon: XCircle,
              border: 'border-rose-500/50',
              bg: 'bg-slate-900/95 text-rose-300',
              iconColor: 'text-rose-400',
              glow: 'shadow-rose-500/20'
            },
            warning: {
              icon: AlertTriangle,
              border: 'border-amber-500/50',
              bg: 'bg-slate-900/95 text-amber-300',
              iconColor: 'text-amber-400',
              glow: 'shadow-amber-500/20'
            },
            info: {
              icon: Info,
              border: 'border-cyan-500/50',
              bg: 'bg-slate-900/95 text-cyan-300',
              iconColor: 'text-cyan-400',
              glow: 'shadow-cyan-500/20'
            }
          }[toast.type] || {
            icon: Info,
            border: 'border-slate-700',
            bg: 'bg-slate-900/95 text-slate-200',
            iconColor: 'text-cyan-400',
            glow: 'shadow-slate-800'
          };

          const IconComponent = typeConfig.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start space-x-3 p-3.5 rounded-xl border ${typeConfig.border} ${typeConfig.bg} shadow-lg ${typeConfig.glow} backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
            >
              <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${typeConfig.iconColor}`} />
              <div className="flex-1 text-xs font-mono font-medium leading-relaxed">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
