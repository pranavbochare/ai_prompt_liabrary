import type { Category } from '../types/prompt';

interface CategoryMeta {
  code: string; // short catalog code, evokes a library shelf label
  color: string; // CSS var name for the accent used on tabs/badges
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  Coding: { code: 'COD', color: 'var(--cat-coding)' },
  Marketing: { code: 'MKT', color: 'var(--cat-marketing)' },
  'Content Writing': { code: 'CNT', color: 'var(--cat-content)' },
  Email: { code: 'EML', color: 'var(--cat-email)' },
  Resume: { code: 'RSM', color: 'var(--cat-resume)' },
  SQL: { code: 'SQL', color: 'var(--cat-sql)' },
  Design: { code: 'DSN', color: 'var(--cat-design)' },
  'Social Media': { code: 'SOC', color: 'var(--cat-social)' },
  Productivity: { code: 'PRD', color: 'var(--cat-productivity)' },
  Others: { code: 'OTH', color: 'var(--cat-others)' },
};
