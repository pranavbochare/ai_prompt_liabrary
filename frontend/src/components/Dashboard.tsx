import { useMemo } from 'react';
import { LibraryBig, Star, LayoutGrid, Clock } from 'lucide-react';
import type { Prompt } from '../types/prompt';

export function Dashboard({ prompts }: { prompts: Prompt[] }) {
  const stats = useMemo(() => {
    const favorites = prompts.filter((p) => p.isFavorite).length;
    const categories = new Set(prompts.map((p) => p.category)).size;
    const recent = [...prompts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    return { total: prompts.length, favorites, categories, recent };
  }, [prompts]);

  const cards = [
    { label: 'Total prompts', value: stats.total, icon: LibraryBig, accent: 'var(--accent-teal)' },
    { label: 'Favorites', value: stats.favorites, icon: Star, accent: 'var(--accent-brass)' },
    { label: 'Categories used', value: stats.categories, icon: LayoutGrid, accent: 'var(--accent-danger)' },
    {
      label: 'Most recent',
      value: stats.recent ? stats.recent.title : '—',
      icon: Clock,
      accent: 'var(--ink-soft)',
      isText: true,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 mb-6">
      {cards.map((card) => (
        <div key={card.label} className="catalog-card p-4 flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0"
            style={{ background: 'var(--bg)', color: card.accent }}
          >
            <card.icon size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider font-[family-name:var(--font-mono)]" style={{ color: 'var(--ink-soft)' }}>
              {card.label}
            </p>
            <p
              className={`font-[family-name:var(--font-display)] font-semibold ${
                card.isText ? 'text-sm truncate' : 'text-2xl'
              }`}
              title={card.isText ? String(card.value) : undefined}
            >
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
