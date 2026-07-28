import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import type { Prompt } from '../types/prompt';
import { CATEGORIES } from '../types/prompt';
import { usePrompts } from '../context/PromptContext';
import { useToast } from '../context/ToastContext';

function isValidPrompt(value: unknown): value is Prompt {
  if (typeof value !== 'object' || value === null) return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.title === 'string' &&
    typeof p.content === 'string' &&
    typeof p.category === 'string' &&
    (CATEGORIES as readonly string[]).includes(p.category) &&
    Array.isArray(p.tags)
  );
}

export function ImportExportButtons({ prompts }: { prompts: Prompt[] }) {
  const { importPrompts } = usePrompts();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const blob = new Blob([JSON.stringify(prompts, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-library-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Library exported');
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      const valid = list.filter(isValidPrompt);

      if (valid.length === 0) {
        showToast('That file has no valid prompts (need title, content, category, tags)', 'error');
        return;
      }
      if (valid.length < list.length) {
        showToast(`Skipped ${list.length - valid.length} invalid entr${list.length - valid.length === 1 ? 'y' : 'ies'}`, 'info');
      }
      await importPrompts(valid);
    } catch {
      showToast('Could not read that file — make sure it is valid JSON', 'error');
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExport}
        className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs rounded-sm border transition-colors hover:bg-[var(--surface-hover)]"
        style={{ borderColor: 'var(--border-strong)' }}
      >
        <Download size={13} /> Export
      </button>
      <button
        onClick={handleImportClick}
        className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs rounded-sm border transition-colors hover:bg-[var(--surface-hover)]"
        style={{ borderColor: 'var(--border-strong)' }}
      >
        <Upload size={13} /> Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
