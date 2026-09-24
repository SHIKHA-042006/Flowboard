import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (message, tone = 'success') => {
      const id = crypto.randomUUID();
      setToasts((t) => [...t, { id, message, tone }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({ success: (m) => push(m, 'success'), error: (m) => push(m, 'error') }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex w-[min(92vw,26rem)] -translate-x-1/2 flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-2 rounded-xl2 px-4 py-3 text-sm shadow-lift ${
              t.tone === 'error' ? 'bg-danger text-white' : 'bg-ink text-white'
            }`}
          >
            {t.tone === 'error' ? (
              <AlertCircle size={18} className="mt-px shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="mt-px shrink-0" />
            )}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
