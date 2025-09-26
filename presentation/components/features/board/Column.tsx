"use client";
import React, { useEffect, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import ProjectCard from './ProjectCard';
import { Project } from '../../../../domain/board/schemas/project.schema';

interface ColumnProps {
  columnId: string;
  projects: Project[];
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
  onMoveToColumn?: (projectId: string, targetColumn: string) => void;
  insertionIndex?: number | null;
  isDragActive?: boolean;
}

const Column: React.FC<ColumnProps> = ({ columnId, projects, filters, onAddProject, onDeleteProject, onOpenEditModal, onMoveToColumn, insertionIndex, isDragActive }) => {

  // Local state for optimistic updates during drag
  const [localProjects, setLocalProjects] = useState(projects);

  // Sync with props when they change
  useEffect(() => {
    setLocalProjects(projects);
  }, [projects]);

  const { isOver, setNodeRef } = useDroppable({
    id: columnId,
    data: {
      type: 'column',
      columnId,
    },
  });

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
      ref={setNodeRef}
      className="
        relative flex flex-col gap-4 md:gap-6 rounded-xl
        bg-card
        backdrop-blur-sm shadow-lg
        p-3 sm:p-4 md:p-6 min-h-[200px]
        transition-all duration-300 ease-out
        ${isOver
          ? 'ring-2 ring-ring shadow-2xl bg-accent scale-[1.02]'
          : 'hover:shadow-xl hover:bg-accent/50'
        }
      "
    >
      {/* Subtle inner glow effect when hovering */}
      <div className={`
        absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300
        ${isOver ? 'opacity-100' : 'group-hover:opacity-50'}
        bg-pink-100/50 dark:bg-white/5
      `} />

      {/* Content container */}
      <div className="relative z-10 flex flex-col gap-4 md:gap-6">
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-pink-100/50 dark:bg-white/5 flex items-center justify-center mb-3">
              <div className="h-6 w-6 rounded-full border-2 border-pink-200/50 dark:border-white/20 border-dashed" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              {localProjects.length === 0 ? 'No projects yet' : 'No projects match filters'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {localProjects.length === 0 ? 'Drop projects here or add new ones' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <SortableContext items={filteredProjects.map(p => p.id)} strategy={verticalListSortingStrategy}>
            {filteredProjects.map((project, i) => (
              <React.Fragment key={project.id}>
                {/* Insertion indicator */}
                {isDragActive && insertionIndex === i && (
                  <div className="relative -my-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2">
                      <div className="h-1 bg-primary rounded-full shadow-lg animate-pulse" />
                      <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-6 bg-primary/10 rounded-lg border-2 border-dashed border-primary animate-pulse" />
                    </div>
                  </div>
                )}
                <ProjectCard
                  key={project.id}
                  project={project}
                  fromCol={columnId}
                  index={i}
                  onDelete={onDeleteProject}
                  onOpenEditModal={onOpenEditModal}
                  onMoveToColumn={onMoveToColumn}
                />
              </React.Fragment>
            ))}
            {/* Insertion indicator at the end */}
            {isDragActive && insertionIndex === filteredProjects.length && (
              <div className="relative -my-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
                <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2">
                  <div className="h-1 bg-primary rounded-full shadow-lg animate-pulse" />
                  <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-6 bg-primary/10 rounded-lg border-2 border-dashed border-primary animate-pulse" />
                </div>
              </div>
            )}
          </SortableContext>
        )}
      </div>

      {/* Clean Footer */}
      <div className="relative z-10 mt-auto pt-4 border-t border-pink-200/50 dark:border-white/10">
        <button
          onClick={() => onAddProject?.(columnId)}
          className="
            w-full flex items-center justify-center gap-2
            px-4 py-3 rounded-lg
            bg-secondary hover:bg-secondary/80
            transition-all duration-200 ease-out
            group
          "
        >
          <Plus className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 text-secondary-foreground" />
          <span className="text-sm font-medium text-secondary-foreground">Add Project</span>
        </button>
      </div>
    </div>
  );
};

export default Column;
