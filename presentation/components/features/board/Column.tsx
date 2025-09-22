"use client";
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useDrop } from 'react-dnd';
import { Plus } from 'lucide-react';
import Card from './Card';
import { Project } from '../../../../domain/board/schemas/project.schema';
import { useBoardStore } from '../../../stores/board/boardStore';

interface ColumnProps {
  projects: Project[];
  columnId: string;
  filters?: {
    searchTerm: string;
    hasTechnologies: boolean;
    hasTags: boolean;
    hasDescription: boolean;
    showCompleted: boolean;
  };
  onAddProject?: (columnId: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onOpenEditModal?: (project: Project) => void;
}

const Column: React.FC<ColumnProps> = ({ projects, columnId, filters, onAddProject, onDeleteProject, onOpenEditModal }) => {
  const updateProject = useBoardStore((s) => s.updateProject);
  const reorderProjectsInColumn = useBoardStore((s) => s.reorderProjectsInColumn);

  // Local state for optimistic updates during drag
  const [localProjects, setLocalProjects] = useState(projects);

  // Sync with props when they change
  useEffect(() => {
    setLocalProjects(projects);
  }, [projects]);

  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    const draggedProject = localProjects[dragIndex];
    const newProjects = [...localProjects];
    newProjects.splice(dragIndex, 1);
    newProjects.splice(hoverIndex, 0, draggedProject);
    setLocalProjects(newProjects);

    // Update the store immediately for responsive UI
    reorderProjectsInColumn(columnId, newProjects);
  }, [localProjects, columnId, reorderProjectsInColumn]);

  interface DragItem {
    id: string;
    fromCol: string;
    fromIndex: number;
  }

  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: 'CARD',
    drop: (item, monitor) => {
      const didDrop = monitor.didDrop();
      if (didDrop) return;

      if (item.fromCol === columnId) {
        // Reordering within the same column
        const hoverIndex = projects.findIndex(p => p.id === item.id);
        if (hoverIndex === -1) return;

        // For now, we'll just log the reordering - in a real app you'd update the order
        console.log(`Reordering card from index ${item.fromIndex} to ${hoverIndex} in column ${columnId}`);
        return;
      }

      // Moving between different columns
      const statusMap: Record<string, 'planning' | 'in-progress' | 'completed'> = {
        'ideas': 'planning',
        'in-progress': 'in-progress',
        'completed': 'completed'
      };

      const newStatus = statusMap[columnId];
      if (!newStatus) {
        console.error(`Invalid column: ${columnId}`);
        return;
      }

      // Update project status using the store
      updateProject(item.id, { status: newStatus }).catch(console.error);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (ref.current) {
      drop(ref);
    }
  }, [drop]);

  // Filter projects based on current filters
  const filteredProjects = localProjects.filter(project => {
    if (!filters) return true;

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesTitle = project.title.toLowerCase().includes(searchLower);
      const matchesDescription = project.description?.toLowerCase().includes(searchLower);
      const matchesTechnologies = project.technologies?.some(tech => tech.toLowerCase().includes(searchLower));
      const matchesTags = project.tags?.some(tag => tag.toLowerCase().includes(searchLower));

      if (!matchesTitle && !matchesDescription && !matchesTechnologies && !matchesTags) {
        return false;
      }
    }

    // Filter by content type
    if (filters.hasTechnologies && (!project.technologies || project.technologies.length === 0)) {
      return false;
    }
    if (filters.hasTags && (!project.tags || project.tags.length === 0)) {
      return false;
    }
    if (filters.hasDescription && (!project.description || project.description.trim() === '')) {
      return false;
    }

    // Filter by completion status
    if (!filters.showCompleted && project.status === 'completed') {
      return false;
    }

    return true;
  });

  return (
    <div
      ref={ref}
      className="
        relative flex flex-col gap-4 rounded-xl border border-white/10
        bg-gradient-to-b from-white/[0.06] to-white/[0.02]
        backdrop-blur-sm shadow-lg
        p-3 sm:p-4 min-h-[200px]
        transition-all duration-300 ease-out
        ${isOver
          ? 'ring-2 ring-white/50 shadow-2xl shadow-white/20 bg-white/10 scale-[1.02]'
          : 'hover:shadow-xl hover:shadow-white/5 hover:bg-white/8'
        }
      "
    >
      {/* Subtle inner glow effect when hovering */}
      <div className={`
        absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300
        ${isOver ? 'opacity-100' : 'group-hover:opacity-50'}
        bg-white/5
      `} />

      {/* Content container */}
      <div className="relative z-10 flex flex-col gap-4">
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <div className="h-6 w-6 rounded-full border-2 border-white/20 border-dashed" />
            </div>
            <p className="text-sm text-white/60 font-medium">
              {localProjects.length === 0 ? 'No projects yet' : 'No projects match filters'}
            </p>
            <p className="text-xs text-white/40 mt-1">
              {localProjects.length === 0 ? 'Drop projects here or add new ones' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          filteredProjects.map((project, i) => (
            <Card
              key={project.id}
              project={project}
              fromCol={columnId}
              index={i}
              onDelete={onDeleteProject}
              onOpenEditModal={onOpenEditModal}
              onMoveCard={moveCard}
            />
          ))
        )}
      </div>

      {/* Clean Footer */}
      <div className="relative z-10 mt-auto pt-4 border-t border-white/10">
        <button
          onClick={() => onAddProject?.(columnId)}
          className="
            w-full flex items-center justify-center gap-2
            px-4 py-3 rounded-lg
            bg-white/5 hover:bg-white/10
            transition-all duration-200 ease-out
            group
          "
        >
          <Plus className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
          <span className="text-sm font-medium">Add Project</span>
        </button>
      </div>
    </div>
  );
};

export default Column;
