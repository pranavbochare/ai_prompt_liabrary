import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(20,20,15,0.45)' }}
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="catalog-card w-full max-w-sm p-5">
        <div className="flex items-center gap-2.5 mb-2">
          <AlertTriangle size={19} style={{ color: 'var(--accent-danger)' }} />
          <h2 id="confirm-title" className="font-[family-name:var(--font-display)] text-lg font-semibold">
            {title}
          </h2>
        </div>
        <p className="text-sm mb-5" style={{ color: 'var(--ink-soft)' }}>
          {description}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3.5 py-2 text-sm rounded-sm border transition-colors"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--ink)' }}
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className="px-3.5 py-2 text-sm rounded-sm text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent-danger)' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
