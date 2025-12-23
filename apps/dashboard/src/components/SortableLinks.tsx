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
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${link.isActive
          ? 'bg-brand-dark border-brand-border shadow-md'
          : 'bg-brand-dark/40 border-transparent opacity-60 hover:opacity-100'
        } ${isDragging ? 'shadow-2xl ring-2 ring-brand-green/30 scale-[1.02] bg-brand-gray' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 text-brand-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        aria-label={`Drag to reorder ${link.title}`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>

      {link.icon && <span className="text-2xl flex-shrink-0 grayscale opacity-80">{link.icon}</span>}

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate font-serif">{link.title}</p>
        <p className="text-sm text-brand-muted truncate font-mono text-xs">{link.url}</p>
      </div>

      <div className="hidden sm:flex items-center gap-2 text-xs text-brand-muted font-medium bg-brand-gray/50 px-3 py-1.5 rounded-full border border-brand-border/30">
        <span className="font-mono">{link.clickCount} clicks</span>
      </div>

      <div className="flex items-center gap-2 border-l border-brand-border/30 pl-4 ml-2">
        <button
          onClick={() => onToggleActive(link.id, link.isActive)}
          className={`p-2 rounded-full transition-all ${link.isActive
              ? 'bg-brand-green/10 text-brand-green hover:bg-brand-green/20'
              : 'bg-brand-gray text-brand-muted hover:bg-brand-gray/80 hover:text-white'
            }`}
          aria-label={link.isActive ? `Disable ${link.title}` : `Enable ${link.title}`}
          aria-pressed={link.isActive}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            {link.isActive ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            )}
          </svg>
        </button>

        <button
          onClick={() => onDelete(link.id)}
          className="p-2 rounded-full bg-red-500/5 text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-colors"
          aria-label={`Delete ${link.title}`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
      } catch (error) {
        toast.error('Failed to reorder links');
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
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