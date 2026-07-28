import { LibraryBig, Plus } from 'lucide-react';

export function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center gap-3 py-20 border border-dashed rounded-sm"
      style={{ borderColor: 'var(--border)' }}
    >
      <LibraryBig size={30} style={{ color: 'var(--ink-soft)' }} />
      <div>
        <p className="font-[family-name:var(--font-display)] text-lg font-semibold">The shelf is empty</p>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
          Nothing matches yet. Add a prompt or clear your filters to see the rest of the library.
        </p>
      </div>
      <button
        onClick={onCreateNew}
        className="mt-2 flex items-center gap-1.5 px-4 py-2 text-sm rounded-sm text-white transition-opacity hover:opacity-90"
        style={{ background: 'var(--accent-teal)' }}
      >
        <Plus size={15} /> New prompt
      </button>
    </div>
  );
}
