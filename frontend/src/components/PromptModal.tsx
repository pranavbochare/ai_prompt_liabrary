import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { Category, Prompt, PromptDraft } from '../types/prompt';
import { CATEGORIES } from '../types/prompt';

interface PromptModalProps {
  open: boolean;
  initial?: Prompt | null;
  onClose: () => void;
  onSave: (draft: PromptDraft) => Promise<void>;
}

interface FormErrors {
  title?: string;
  content?: string;
}

const EMPTY_FORM = {
  title: '',
  content: '',
  description: '',
  category: 'Others' as Category,
  tagsInput: '',
  isFavorite: false,
  isPinned: false,
};

export function PromptModal({ open, initial, onClose, onSave }: PromptModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        title: initial.title,
        content: initial.content,
        description: initial.description,
        category: initial.category,
        tagsInput: initial.tags.join(', '),
        isFavorite: initial.isFavorite,
        isPinned: initial.isPinned,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
    window.setTimeout(() => titleRef.current?.focus(), 30);
  }, [open, initial]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.title.trim()) next.title = 'Title is required.';
    else if (form.title.length > 120) next.title = 'Keep the title under 120 characters.';
    if (!form.content.trim()) next.content = 'Prompt content cannot be empty.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    const tags = form.tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      await onSave({
        title: form.title.trim(),
        content: form.content.trim(),
        description: form.description.trim(),
        category: form.category,
        tags,
        isFavorite: form.isFavorite,
        isPinned: form.isPinned,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(20,20,15,0.45)' }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-modal-title"
    >
      <div className="catalog-card w-full max-w-xl max-h-[90vh] overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 id="prompt-modal-title" className="font-[family-name:var(--font-display)] text-xl font-semibold">
            {initial ? 'Edit prompt' : 'New prompt'}
          </h2>
          <button onClick={onClose} aria-label="Close" className="opacity-60 hover:opacity-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="title" className="text-xs font-medium block mb-1">
              Title <span style={{ color: 'var(--accent-danger)' }}>*</span>
            </label>
            <input
              id="title"
              ref={titleRef}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              maxLength={120}
              className="w-full px-3 py-2 text-sm rounded-sm border outline-none"
              style={{ borderColor: errors.title ? 'var(--accent-danger)' : 'var(--border)', background: 'var(--surface)' }}
              aria-invalid={!!errors.title}
            />
            {errors.title && <p className="text-xs mt-1" style={{ color: 'var(--accent-danger)' }}>{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="content" className="text-xs font-medium block mb-1">
              Prompt <span style={{ color: 'var(--accent-danger)' }}>*</span>
            </label>
            <textarea
              id="content"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={5}
              className="w-full px-3 py-2 text-sm rounded-sm border outline-none font-[family-name:var(--font-mono)] resize-y"
              style={{ borderColor: errors.content ? 'var(--accent-danger)' : 'var(--border)', background: 'var(--surface)' }}
              aria-invalid={!!errors.content}
            />
            {errors.content && <p className="text-xs mt-1" style={{ color: 'var(--accent-danger)' }}>{errors.content}</p>}
          </div>

          <div>
            <label htmlFor="description" className="text-xs font-medium block mb-1">
              Description
            </label>
            <input
              id="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              maxLength={300}
              placeholder="A one-line reminder of what this prompt is for"
              className="w-full px-3 py-2 text-sm rounded-sm border outline-none"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="category" className="text-xs font-medium block mb-1">
                Category
              </label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
                className="w-full px-3 py-2 text-sm rounded-sm border outline-none"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tags" className="text-xs font-medium block mb-1">
                Tags (comma separated)
              </label>
              <input
                id="tags"
                value={form.tagsInput}
                onChange={(e) => setForm((f) => ({ ...f, tagsInput: e.target.value }))}
                placeholder="react, hooks"
                className="w-full px-3 py-2 text-sm rounded-sm border outline-none"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isFavorite}
                onChange={(e) => setForm((f) => ({ ...f, isFavorite: e.target.checked }))}
              />
              Mark as favorite
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isPinned}
                onChange={(e) => setForm((f) => ({ ...f, isPinned: e.target.checked }))}
              />
              Pin to top
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-sm rounded-sm border"
              style={{ borderColor: 'var(--border-strong)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-3.5 py-2 text-sm rounded-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: 'var(--accent-teal)' }}
            >
              {isSaving ? 'Saving...' : initial ? 'Save changes' : 'Create prompt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
