import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

export function ToastStack() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[min(360px,calc(100vw-2rem))]">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.variant];
        return (
          <div
            key={toast.id}
            role="status"
            className="catalog-card flex items-start gap-2.5 px-3.5 py-3 text-sm shadow-lg animate-[toast-in_0.2s_ease]"
            style={{
              borderLeft: `3px solid ${
                toast.variant === 'error'
                  ? 'var(--accent-danger)'
                  : toast.variant === 'info'
                    ? 'var(--accent-teal)'
                    : 'var(--accent-brass)'
              }`,
            }}
          >
            <Icon
              size={17}
              className="mt-0.5 shrink-0"
              style={{
                color:
                  toast.variant === 'error'
                    ? 'var(--accent-danger)'
                    : toast.variant === 'info'
                      ? 'var(--accent-teal)'
                      : 'var(--accent-brass)',
              }}
            />
            <p className="flex-1 leading-snug" style={{ color: 'var(--ink)' }}>
              {toast.message}
            </p>
            <button
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="opacity-50 hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
