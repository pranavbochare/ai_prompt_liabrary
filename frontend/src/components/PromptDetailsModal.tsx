import { useEffect } from 'react';
import { X, Copy, Pencil, Check } from 'lucide-react';
import type { Prompt } from '../types/prompt';
import { CATEGORY_META } from '../utils/categoryMeta';
import { useClipboard } from '../hooks/useClipboard';

interface PromptDetailsModalProps {
  prompt: Prompt | null;
  onClose: () => void;
  onEdit: (prompt: Prompt) => void;
}

export function PromptDetailsModal({ prompt, onClose, onEdit }: PromptDetailsModalProps) {
  const { copy, copiedId } = useClipboard();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (prompt) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prompt, onClose]);

  if (!prompt) return null;
  const meta = CATEGORY_META[prompt.category];
  const isCopied = copiedId === prompt.id;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(20,20,15,0.45)' }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="details-title"
    >
      <div className="catalog-card w-full max-w-xl max-h-[90vh] overflow-y-auto p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span
              className="text-[10px] tracking-wider uppercase px-2 py-0.5 font-[family-name:var(--font-mono)] text-white inline-block mb-2"
              style={{ background: meta.color }}
            >
              {meta.code} · {prompt.category}
            </span>
            <h2 id="details-title" className="font-[family-name:var(--font-display)] text-xl font-semibold leading-snug">
              {prompt.title}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="opacity-60 hover:opacity-100 shrink-0">
            <X size={18} />
          </button>
        </div>

        {prompt.description && (
          <p className="text-sm mb-3" style={{ color: 'var(--ink-soft)' }}>
            {prompt.description}
          </p>
        )}

        <pre
          className="whitespace-pre-wrap text-sm font-[family-name:var(--font-mono)] p-3.5 rounded-sm border mb-3 max-h-72 overflow-y-auto"
          style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          {prompt.content}
        </pre>

        {prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {prompt.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-1.5 py-0.5 rounded-sm"
                style={{ background: 'var(--bg)', color: 'var(--ink-soft)' }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div
          className="flex items-center justify-between text-xs pt-3"
          style={{ borderTop: '1px dashed var(--border)', color: 'var(--ink-soft)' }}
        >
          <span className="font-[family-name:var(--font-mono)]">
            Created {new Date(prompt.createdAt).toLocaleDateString()} · Updated{' '}
            {new Date(prompt.updatedAt).toLocaleDateString()}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => copy(prompt.content, prompt.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border"
              style={{ borderColor: 'var(--border-strong)' }}
            >
              {isCopied ? <Check size={13} /> : <Copy size={13} />} {isCopied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={() => onEdit(prompt)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-white"
              style={{ background: 'var(--accent-teal)' }}
            >
              <Pencil size={13} /> Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
