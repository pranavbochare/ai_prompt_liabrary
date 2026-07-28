import { useMemo, useRef, useState } from 'react';
import type { Category, Prompt, SortOption } from './types/prompt';
import { usePrompts } from './context/PromptContext';
import { useDebounce } from './hooks/useDebounce';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { PromptGrid } from './components/PromptGrid';
import { PromptModal } from './components/PromptModal';
import { PromptDetailsModal } from './components/PromptDetailsModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ToastStack } from './components/ToastStack';

function sortPrompts(prompts: Prompt[], sort: SortOption): Prompt[] {
  const copy = [...prompts];
  switch (sort) {
    case 'newest':
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'oldest':
      return copy.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case 'az':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'za':
      return copy.sort((a, b) => b.title.localeCompare(a.title));
    default:
      return copy;
  }
}

function App() {
  const {
    prompts,
    mode,
    isLoading,
    addPrompt,
    updatePrompt,
    deletePrompt,
    duplicatePrompt,
    toggleFavorite,
    togglePin,
    reorderPrompts,
  } = usePrompts();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 250);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>('newest');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [editingPrompt, setEditingPrompt] = useState<Prompt | null | undefined>(undefined);
  const [viewingPrompt, setViewingPrompt] = useState<Prompt | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Prompt | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useKeyboardShortcuts({
    '/': (e) => {
      e.preventDefault();
      searchInputRef.current?.focus();
    },
    n: () => setEditingPrompt(null),
    escape: () => searchInputRef.current?.blur(),
  });

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    let result = prompts.filter((p) => {
      const matchesQuery = !q || p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesFavorite = !favoritesOnly || p.isFavorite;
      return matchesQuery && matchesCategory && matchesFavorite;
    });
    result = sortPrompts(result, sort);
    // Pinned prompts always float to the top, preserving the chosen sort within each group.
    result.sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
    return result;
  }, [prompts, debouncedQuery, activeCategory, favoritesOnly, sort]);

  const isCustomOrderView =
    !debouncedQuery && activeCategory === 'All' && !favoritesOnly && sort === 'newest';

  async function handleSave(draft: Parameters<typeof addPrompt>[0]) {
    if (editingPrompt) {
      await updatePrompt(editingPrompt.id, draft);
    } else {
      await addPrompt(draft);
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        prompts={prompts}
        activeCategory={activeCategory}
        favoritesOnly={favoritesOnly}
        onSelectCategory={(c) => {
          setActiveCategory(c);
          setSidebarOpen(false);
        }}
        onToggleFavoritesOnly={() => setFavoritesOnly((v) => !v)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar
          query={query}
          onQueryChange={setQuery}
          sort={sort}
          onSortChange={setSort}
          mode={mode}
          onCreateNew={() => setEditingPrompt(null)}
          onOpenSidebar={() => setSidebarOpen(true)}
          searchInputRef={searchInputRef}
        />

        <main className="flex-1 px-4 sm:px-6 py-6 max-w-[1400px] w-full mx-auto">
          <Dashboard prompts={prompts} />

          {isLoading ? (
            <p className="text-sm text-center py-16" style={{ color: 'var(--ink-soft)' }}>
              Opening the catalog...
            </p>
          ) : (
            <PromptGrid
              prompts={filtered}
              reorderable={isCustomOrderView}
              onView={setViewingPrompt}
              onEdit={(p) => setEditingPrompt(p)}
              onDelete={setDeleteTarget}
              onDuplicate={duplicatePrompt}
              onToggleFavorite={toggleFavorite}
              onTogglePin={togglePin}
              onReorder={reorderPrompts}
              onCreateNew={() => setEditingPrompt(null)}
            />
          )}
        </main>
      </div>

      <PromptModal
        open={editingPrompt !== undefined}
        initial={editingPrompt}
        onClose={() => setEditingPrompt(undefined)}
        onSave={handleSave}
      />

      <PromptDetailsModal
        prompt={viewingPrompt}
        onClose={() => setViewingPrompt(null)}
        onEdit={(p) => {
          setViewingPrompt(null);
          setEditingPrompt(p);
        }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this prompt?"
        description={`"${deleteTarget?.title}" will be permanently removed. This can't be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deletePrompt(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />

      <ToastStack />
    </div>
  );
}

export default App;
