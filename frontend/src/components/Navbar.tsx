import { Search, Plus, Menu, Wifi, WifiOff, Loader2 } from 'lucide-react';
import type { ConnectionMode, SortOption } from '../types/prompt';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  query: string;
  onQueryChange: (q: string) => void;
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  mode: ConnectionMode;
  onCreateNew: () => void;
  onOpenSidebar: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  az: 'Title A → Z',
  za: 'Title Z → A',
};

export function Navbar({
  query,
  onQueryChange,
  sort,
  onSortChange,
  mode,
  onCreateNew,
  onOpenSidebar,
  searchInputRef,
}: NavbarProps) {
  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-3 px-4 sm:px-6 py-3 border-b backdrop-blur"
      style={{ background: 'color-mix(in srgb, var(--bg) 92%, transparent)', borderColor: 'var(--border)' }}
    >
      <button
        onClick={onOpenSidebar}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-sm border shrink-0"
        style={{ borderColor: 'var(--border)' }}
        aria-label="Open categories menu"
      >
        <Menu size={16} />
      </button>

      <div className="relative flex-1 max-w-md">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--ink-soft)' }}
        />
        <input
          ref={searchInputRef}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search title or content"
          className="w-full pl-9 pr-3 py-2 text-sm rounded-sm border outline-none"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
        />
      </div>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="hidden sm:block px-2.5 py-2 text-sm rounded-sm border outline-none"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
        aria-label="Sort prompts"
      >
        {Object.entries(SORT_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <div
        className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-[family-name:var(--font-mono)]"
        style={{ background: 'var(--surface)', color: 'var(--ink-soft)' }}
        title={
          mode === 'online'
            ? 'Connected to the backend API and database'
            : mode === 'offline'
              ? 'Backend unreachable — working from LocalStorage'
              : 'Checking connection...'
        }
      >
        {mode === 'checking' && <Loader2 size={13} className="animate-spin" />}
        {mode === 'online' && <Wifi size={13} style={{ color: 'var(--accent-teal)' }} />}
        {mode === 'offline' && <WifiOff size={13} style={{ color: 'var(--accent-danger)' }} />}
        {mode === 'checking' ? 'Connecting' : mode === 'online' ? 'Synced' : 'Local mode'}
      </div>

      <ThemeToggle />

      <button
        onClick={onCreateNew}
        className="flex items-center gap-1.5 px-3.5 py-2 text-sm rounded-sm text-white shrink-0 transition-opacity hover:opacity-90"
        style={{ background: 'var(--accent-teal)' }}
      >
        <Plus size={15} />
        <span className="hidden sm:inline">New prompt</span>
      </button>
    </header>
  );
}
