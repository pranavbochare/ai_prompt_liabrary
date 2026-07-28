import { LibraryBig, Star, LayoutList } from 'lucide-react';
import type { Category, Prompt } from '../types/prompt';
import { CATEGORIES } from '../types/prompt';
import { CATEGORY_META } from '../utils/categoryMeta';
import { ImportExportButtons } from './ImportExportButtons';

interface SidebarProps {
  prompts: Prompt[];
  activeCategory: Category | 'All';
  favoritesOnly: boolean;
  onSelectCategory: (category: Category | 'All') => void;
  onToggleFavoritesOnly: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  prompts,
  activeCategory,
  favoritesOnly,
  onSelectCategory,
  onToggleFavoritesOnly,
  isOpen,
  onClose,
}: SidebarProps) {
  const countFor = (category: Category | 'All') =>
    category === 'All' ? prompts.length : prompts.filter((p) => p.category === category).length;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'rgba(20,20,15,0.4)' }}
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 z-40 lg:z-auto h-screen w-64 shrink-0 flex flex-col border-r transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
      >
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <LibraryBig size={20} style={{ color: 'var(--accent-brass)' }} />
            <h1 className="font-[family-name:var(--font-display)] text-lg font-semibold leading-none">
              The Prompt Library
            </h1>
          </div>
          <p className="text-xs mt-1.5 pl-7" style={{ color: 'var(--ink-soft)' }}>
            A catalog of every prompt worth reusing.
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          <button
            onClick={() => onSelectCategory('All')}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-sm transition-colors"
            style={{
              background: activeCategory === 'All' ? 'var(--surface)' : 'transparent',
              color: activeCategory === 'All' ? 'var(--ink)' : 'var(--ink-soft)',
              fontWeight: activeCategory === 'All' ? 600 : 400,
            }}
          >
            <span className="flex items-center gap-2">
              <LayoutList size={14} /> All prompts
            </span>
            <span className="text-xs font-[family-name:var(--font-mono)]">{countFor('All')}</span>
          </button>

          <button
            onClick={onToggleFavoritesOnly}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-sm transition-colors"
            style={{
              background: favoritesOnly ? 'var(--surface)' : 'transparent',
              color: favoritesOnly ? 'var(--ink)' : 'var(--ink-soft)',
              fontWeight: favoritesOnly ? 600 : 400,
            }}
          >
            <span className="flex items-center gap-2">
              <Star size={14} fill={favoritesOnly ? 'var(--accent-brass)' : 'none'} /> Favorites only
            </span>
            <span className="text-xs font-[family-name:var(--font-mono)]">
              {prompts.filter((p) => p.isFavorite).length}
            </span>
          </button>

          <div className="pt-3 pb-1 px-3">
            <p className="text-[11px] uppercase tracking-wider font-[family-name:var(--font-mono)]" style={{ color: 'var(--ink-soft)' }}>
              Catalog drawers
            </p>
          </div>

          {CATEGORIES.map((category) => {
            const meta = CATEGORY_META[category];
            const active = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => onSelectCategory(category)}
                className="tab-chip w-full flex items-center justify-between gap-2 pl-3 pr-4 py-2 text-sm transition-colors"
                style={{
                  background: active ? 'var(--surface)' : 'transparent',
                  color: active ? 'var(--ink)' : 'var(--ink-soft)',
                  fontWeight: active ? 600 : 400,
                }}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: meta.color }}
                  />
                  {category}
                </span>
                <span className="text-xs font-[family-name:var(--font-mono)]">{countFor(category)}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <ImportExportButtons prompts={prompts} />
        </div>
      </aside>
    </>
  );
}
