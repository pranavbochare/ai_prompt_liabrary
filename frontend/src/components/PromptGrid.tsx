import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import type { Prompt } from '../types/prompt';
import { PromptCard } from './PromptCard';
import { EmptyState } from './EmptyState';

interface PromptGridProps {
  prompts: Prompt[];
  reorderable: boolean;
  onView: (prompt: Prompt) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
  onDuplicate: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onTogglePin: (id: string) => void;
  onReorder: (prompts: Prompt[]) => void;
  onCreateNew: () => void;
}

export function PromptGrid({
  prompts,
  reorderable,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  onTogglePin,
  onReorder,
  onCreateNew,
}: PromptGridProps) {
  if (prompts.length === 0) {
    return <EmptyState onCreateNew={onCreateNew} />;
  }

  function handleDragEnd(result: DropResult) {
    if (!result.destination || !reorderable) return;
    const reordered = Array.from(prompts);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    onReorder(reordered);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="prompt-grid">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            {prompts.map((prompt, index) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                index={index}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onToggleFavorite={onToggleFavorite}
                onTogglePin={onTogglePin}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
