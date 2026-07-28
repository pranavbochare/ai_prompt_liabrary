import { Draggable } from '@hello-pangea/dnd';
import {
  Star,
  Pin,
  Copy,
  Pencil,
  Trash2,
  Files,
  GripVertical,
  Check,
} from 'lucide-react';
import type { Prompt } from '../types/prompt';
import { CATEGORY_META } from '../utils/categoryMeta';
import { useClipboard } from '../hooks/useClipboard';

interface PromptCardProps {
  prompt: Prompt;
  index: number;
  onView: (prompt: Prompt) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
  onDuplicate: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onTogglePin: (id: string) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function PromptCard({
  prompt,
  index,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  onTogglePin,
}: PromptCardProps) {
  const { copy, copiedId } = useClipboard();
  const meta = CATEGORY_META[prompt.category];
  const isCopied = copiedId === prompt.id;

  return (
    <Draggable draggableId={prompt.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`catalog-card p-4 pl-6 flex flex-col gap-3 cursor-pointer ${prompt.isPinned ? 'is-pinned' : ''}`}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.85 : 1,
          }}
          onClick={() => onView(prompt)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-1.5 min-w-0">
              <button
                {...provided.dragHandleProps}
                onClick={(e) => e.stopPropagation()}
                aria-label="Drag to reorder"
                className="mt-0.5 shrink-0 opacity-30 hover:opacity-70 cursor-grab active:cursor-grabbing"
              >
                <GripVertical size={15} />
              </button>
              <h3 className="font-[family-name:var(--font-display)] font-semibold text-base leading-snug line-clamp-2">
                {prompt.title}
              </h3>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(prompt.id);
              }}
              aria-label={prompt.isFavorite ? 'Unfavorite' : 'Favorite'}
              className="shrink-0"
            >
              <Star
                size={17}
                fill={prompt.isFavorite ? 'var(--accent-brass)' : 'none'}
                color={prompt.isFavorite ? 'var(--accent-brass)' : 'var(--ink-soft)'}
              />
            </button>
          </div>

          {prompt.description && (
            <p className="text-sm line-clamp-2" style={{ color: 'var(--ink-soft)' }}>
              {prompt.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] tracking-wider uppercase px-2 py-0.5 font-[family-name:var(--font-mono)] text-white"
              style={{ background: meta.color }}
            >
              {meta.code}
            </span>
            {prompt.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-1.5 py-0.5 rounded-sm"
                style={{ background: 'var(--bg)', color: 'var(--ink-soft)' }}
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="text-[11px] font-[family-name:var(--font-mono)]" style={{ color: 'var(--ink-soft)' }}>
            Updated {formatDate(prompt.updatedAt)}
          </div>

          <div
            className="flex items-center justify-between pt-2 mt-auto"
            style={{ borderTop: '1px dashed var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1">
              <button
                onClick={() => copy(prompt.content, prompt.id)}
                aria-label="Copy prompt to clipboard"
                title="Copy to clipboard"
                className="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-[var(--surface-hover)]"
              >
                {isCopied ? <Check size={14} style={{ color: 'var(--accent-teal)' }} /> : <Copy size={14} />}
              </button>
              <button
                onClick={() => onTogglePin(prompt.id)}
                aria-label={prompt.isPinned ? 'Unpin' : 'Pin to top'}
                title={prompt.isPinned ? 'Unpin' : 'Pin to top'}
                className="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-[var(--surface-hover)]"
              >
                <Pin size={14} fill={prompt.isPinned ? 'var(--accent-brass)' : 'none'} />
              </button>
              <button
                onClick={() => onDuplicate(prompt.id)}
                aria-label="Duplicate prompt"
                title="Duplicate"
                className="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-[var(--surface-hover)]"
              >
                <Files size={14} />
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(prompt)}
                aria-label="Edit prompt"
                title="Edit"
                className="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-[var(--surface-hover)]"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onDelete(prompt)}
                aria-label="Delete prompt"
                title="Delete"
                className="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-[var(--surface-hover)]"
                style={{ color: 'var(--accent-danger)' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
