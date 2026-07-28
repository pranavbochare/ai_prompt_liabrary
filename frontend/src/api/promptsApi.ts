import type { Prompt, PromptDraft } from '../types/prompt';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.message || `Request failed (${res.status})`, res.status);
  }

  // DELETE responses may have no body content worth parsing beyond a message
  return res.json();
}

/** Pings the backend health endpoint. Resolves false instead of throwing when unreachable. */
export async function checkHealth(timeoutMs = 3000): Promise<boolean> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    await fetch(`${API_URL}/health`, { signal: controller.signal });
    return true;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}

export const promptsApi = {
  getAll: () => request<Prompt[]>('/prompts'),
  create: (draft: PromptDraft) =>
    request<Prompt>('/prompts', { method: 'POST', body: JSON.stringify(draft) }),
  update: (id: string, patch: Partial<Prompt>) =>
    request<Prompt>(`/prompts/${id}`, { method: 'PUT', body: JSON.stringify(patch) }),
  patch: (id: string, patch: Partial<Prompt>) =>
    request<Prompt>(`/prompts/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  remove: (id: string) => request<{ message: string; id: string }>(`/prompts/${id}`, { method: 'DELETE' }),
  reorder: (orderedIds: string[]) =>
    request<{ message: string }>('/prompts/reorder/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ orderedIds }),
    }),
};

export { ApiError };
