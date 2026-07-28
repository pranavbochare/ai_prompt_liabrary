import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import { v4 as uuid } from 'uuid';
import type { ConnectionMode, Prompt, PromptDraft } from '../types/prompt';
import { promptsApi, checkHealth } from '../api/promptsApi';
import { readStorage, writeStorage, STORAGE_KEYS } from '../utils/storage';
import { useToast } from './ToastContext';

interface State {
  prompts: Prompt[];
  mode: ConnectionMode;
  isLoading: boolean;
}

type Action =
  | { type: 'SET_MODE'; mode: ConnectionMode }
  | { type: 'SET_PROMPTS'; prompts: Prompt[] }
  | { type: 'ADD'; prompt: Prompt }
  | { type: 'UPDATE'; prompt: Prompt }
  | { type: 'DELETE'; id: string }
  | { type: 'REORDER'; prompts: Prompt[] }
  | { type: 'LOADING'; isLoading: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode };
    case 'SET_PROMPTS':
      return { ...state, prompts: action.prompts };
    case 'ADD':
      return { ...state, prompts: [action.prompt, ...state.prompts] };
    case 'UPDATE':
      return {
        ...state,
        prompts: state.prompts.map((p) => (p.id === action.prompt.id ? action.prompt : p)),
      };
    case 'DELETE':
      return { ...state, prompts: state.prompts.filter((p) => p.id !== action.id) };
    case 'REORDER':
      return { ...state, prompts: action.prompts };
    case 'LOADING':
      return { ...state, isLoading: action.isLoading };
    default:
      return state;
  }
}

interface PromptContextValue extends State {
  addPrompt: (draft: PromptDraft) => Promise<void>;
  updatePrompt: (id: string, draft: PromptDraft) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  duplicatePrompt: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  reorderPrompts: (prompts: Prompt[]) => Promise<void>;
  importPrompts: (incoming: Prompt[]) => Promise<void>;
}

const PromptContext = createContext<PromptContextValue | undefined>(undefined);

function nowIso() {
  return new Date().toISOString();
}

function makeLocalPrompt(draft: PromptDraft, order: number): Prompt {
  const timestamp = nowIso();
  return {
    ...draft,
    id: uuid(),
    createdAt: timestamp,
    updatedAt: timestamp,
    order,
  };
}

export function PromptProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    prompts: [],
    mode: 'checking',
    isLoading: true,
  });
  const { showToast } = useToast();
  const modeRef = useRef<ConnectionMode>('checking');
  modeRef.current = state.mode;

  // Bootstrap: try the backend first, fall back to localStorage transparently.
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const healthy = await checkHealth();
      if (cancelled) return;

      if (healthy) {
        try {
          const prompts = await promptsApi.getAll();
          if (cancelled) return;
          dispatch({ type: 'SET_PROMPTS', prompts });
          dispatch({ type: 'SET_MODE', mode: 'online' });
          writeStorage(STORAGE_KEYS.prompts, prompts);
        } catch {
          loadFromLocalStorage();
        }
      } else {
        loadFromLocalStorage();
      }
      dispatch({ type: 'LOADING', isLoading: false });
    }

    function loadFromLocalStorage() {
      const cached = readStorage<Prompt[]>(STORAGE_KEYS.prompts, []);
      dispatch({ type: 'SET_PROMPTS', prompts: cached });
      dispatch({ type: 'SET_MODE', mode: 'offline' });
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep localStorage in sync as a cache/backup, regardless of mode.
  useEffect(() => {
    if (!state.isLoading) writeStorage(STORAGE_KEYS.prompts, state.prompts);
  }, [state.prompts, state.isLoading]);

  const addPrompt = useCallback(
    async (draft: PromptDraft) => {
      if (modeRef.current === 'online') {
        try {
          const created = await promptsApi.create(draft);
          dispatch({ type: 'ADD', prompt: created });
          showToast('Prompt created');
          return;
        } catch {
          showToast('Server unavailable — saved locally instead', 'error');
        }
      }
      const created = makeLocalPrompt(draft, 0);
      dispatch({ type: 'ADD', prompt: created });
      showToast('Prompt created');
    },
    [showToast]
  );

  const updatePrompt = useCallback(
    async (id: string, draft: PromptDraft) => {
      const existing = state.prompts.find((p) => p.id === id);
      if (!existing) return;
      const optimistic: Prompt = { ...existing, ...draft, updatedAt: nowIso() };
      dispatch({ type: 'UPDATE', prompt: optimistic });

      if (modeRef.current === 'online') {
        try {
          const saved = await promptsApi.update(id, draft);
          dispatch({ type: 'UPDATE', prompt: saved });
        } catch {
          showToast('Server unavailable — changes kept locally', 'error');
        }
      }
      showToast('Prompt updated');
    },
    [state.prompts, showToast]
  );

  const deletePrompt = useCallback(
    async (id: string) => {
      dispatch({ type: 'DELETE', id });
      if (modeRef.current === 'online') {
        try {
          await promptsApi.remove(id);
        } catch {
          showToast('Server unavailable — deleted locally only', 'error');
        }
      }
      showToast('Prompt deleted');
    },
    [showToast]
  );

  const duplicatePrompt = useCallback(
    async (id: string) => {
      const source = state.prompts.find((p) => p.id === id);
      if (!source) return;
      const draft: PromptDraft = {
        title: `${source.title} (Copy)`,
        content: source.content,
        description: source.description,
        category: source.category,
        tags: [...source.tags],
        isFavorite: false,
        isPinned: false,
      };
      await addPrompt(draft);
    },
    [state.prompts, addPrompt]
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const existing = state.prompts.find((p) => p.id === id);
      if (!existing) return;
      const updated = { ...existing, isFavorite: !existing.isFavorite, updatedAt: nowIso() };
      dispatch({ type: 'UPDATE', prompt: updated });
      if (modeRef.current === 'online') {
        try {
          await promptsApi.patch(id, { isFavorite: updated.isFavorite });
        } catch {
          /* local state already updated; cache will hold it */
        }
      }
    },
    [state.prompts]
  );

  const togglePin = useCallback(
    async (id: string) => {
      const existing = state.prompts.find((p) => p.id === id);
      if (!existing) return;
      const updated = { ...existing, isPinned: !existing.isPinned, updatedAt: nowIso() };
      dispatch({ type: 'UPDATE', prompt: updated });
      if (modeRef.current === 'online') {
        try {
          await promptsApi.patch(id, { isPinned: updated.isPinned });
        } catch {
          /* local state already updated */
        }
      }
    },
    [state.prompts]
  );

  const reorderPrompts = useCallback(
    async (prompts: Prompt[]) => {
      const withOrder = prompts.map((p, index) => ({ ...p, order: index }));
      dispatch({ type: 'REORDER', prompts: withOrder });
      if (modeRef.current === 'online') {
        try {
          await promptsApi.reorder(withOrder.map((p) => p.id));
        } catch {
          /* local order already reflects the drag result */
        }
      }
    },
    []
  );

  const importPrompts = useCallback(
    async (incoming: Prompt[]) => {
      // Merge: keep existing prompts, append imported ones with fresh local ids
      // to avoid id collisions between two different libraries.
      const merged: Prompt[] = [
        ...incoming.map((p, index) => ({
          ...p,
          id: uuid(),
          order: state.prompts.length + index,
        })),
        ...state.prompts,
      ];
      dispatch({ type: 'SET_PROMPTS', prompts: merged });

      if (modeRef.current === 'online') {
        try {
          await Promise.all(
            incoming.map((p) =>
              promptsApi.create({
                title: p.title,
                content: p.content,
                description: p.description,
                category: p.category,
                tags: p.tags,
                isFavorite: p.isFavorite,
                isPinned: p.isPinned,
              })
            )
          );
          const refreshed = await promptsApi.getAll();
          dispatch({ type: 'SET_PROMPTS', prompts: refreshed });
        } catch {
          showToast('Server unavailable — import saved locally', 'error');
        }
      }
      showToast(`Imported ${incoming.length} prompt${incoming.length === 1 ? '' : 's'}`);
    },
    [state.prompts, showToast]
  );

  const value = useMemo(
    () => ({
      ...state,
      addPrompt,
      updatePrompt,
      deletePrompt,
      duplicatePrompt,
      toggleFavorite,
      togglePin,
      reorderPrompts,
      importPrompts,
    }),
    [
      state,
      addPrompt,
      updatePrompt,
      deletePrompt,
      duplicatePrompt,
      toggleFavorite,
      togglePin,
      reorderPrompts,
      importPrompts,
    ]
  );

  return <PromptContext.Provider value={value}>{children}</PromptContext.Provider>;
}

export function usePrompts() {
  const ctx = useContext(PromptContext);
  if (!ctx) throw new Error('usePrompts must be used within PromptProvider');
  return ctx;
}
