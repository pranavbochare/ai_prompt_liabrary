export const CATEGORIES = [
  'Coding',
  'Marketing',
  'Content Writing',
  'Email',
  'Resume',
  'SQL',
  'Design',
  'Social Media',
  'Productivity',
  'Others',
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Prompt {
  id: string;
  title: string;
  content: string;
  description: string;
  category: Category;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  order: number;
}

export type PromptDraft = Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'order'>;

export type SortOption = 'newest' | 'oldest' | 'az' | 'za';

export type ConnectionMode = 'checking' | 'online' | 'offline';
