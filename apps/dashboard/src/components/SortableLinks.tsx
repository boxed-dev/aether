'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useReorderLinks } from '@/hooks/useLinks';
import type { Link } from '@/lib/api';
import toast from 'react-hot-toast';

interface SortableLinkItemProps {
  link: Link;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

function SortableLinkItem({ link, onDelete, onToggleActive }: SortableLinkItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${link.isActive
        ? 'bg-brand-dark border-brand-border'
        : 'bg-brand-dark/50 border-brand-border/50 opacity-60 hover:opacity-100'
        } ${isDragging ? 'shadow-lg ring-1 ring-brand-accent/30' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1.5 text-brand-muted hover:text-brand-text rounded transition-colors"
        aria-label={`Drag to reorder ${link.title}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>

      {link.icon && <span className="text-lg shrink-0">{link.icon}</span>}

      <div className="flex-1 min-w-0">
        <p className="font-medium text-brand-text text-sm truncate">{link.title}</p>
        <p className="text-xs text-brand-muted truncate">{link.url}</p>
      </div>

      <div className="hidden sm:flex items-center text-xs text-brand-muted bg-brand-gray px-2 py-1 rounded">
        {link.clickCount} clicks
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onToggleActive(link.id, link.isActive)}
          className={`p-1.5 rounded transition-colors ${link.isActive
            ? 'bg-brand-success/10 text-brand-success hover:bg-brand-success/20'
            : 'bg-brand-gray text-brand-muted hover:text-brand-text'
            }`}
          aria-label={link.isActive ? `Disable ${link.title}` : `Enable ${link.title}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {link.isActive ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            )}
          </svg>
        </button>

        <button
          onClick={() => onDelete(link.id)}
          className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
          aria-label={`Delete ${link.title}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

interface SortableLinksProps {
  profileId: string;
  links: Link[];
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

export function SortableLinks({ profileId, links, onDelete, onToggleActive }: SortableLinksProps) {
  const reorderLinks = useReorderLinks();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((l) => l.id === active.id);
      const newIndex = links.findIndex((l) => l.id === over.id);
      const newOrder = arrayMove(links, oldIndex, newIndex);

      try {
        await reorderLinks.mutateAsync({
          profileId,
          linkIds: newOrder.map((l) => l.id),
        });
        toast.success('Links reordered');
      } catch {
        toast.error('Failed to reorder links');
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {links.map((link) => (
            <SortableLinkItem
              key={link.id}
              link={link}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
