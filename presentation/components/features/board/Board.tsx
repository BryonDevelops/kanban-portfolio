"use client";

import React, { useEffect, useState } from 'react';
import Column from './Column';
import Card from './Card';
import { Plus, Settings, Filter, Search } from 'lucide-react';
import { Trash2, MoreHorizontal } from 'lucide-react';
import { useBoardStore } from '../../../stores/board/boardStore';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Project } from '../../../../domain/board/schemas/project.schema';
import EditProjectForm from '../../forms/EditProjectForm';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, rectIntersection } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useIsAdmin } from '../../shared/ProtectedRoute';

const columnOrder = ['ideas', 'in-progress', 'completed'];

// localStorage utilities for non-admin board operations
const BOARD_LOCAL_STORAGE_KEY = 'kanban-board-local-state'

const saveBoardStateToLocalStorage = (columns: Record<string, Project[]>) => {
  try {
    localStorage.setItem(BOARD_LOCAL_STORAGE_KEY, JSON.stringify({
      columns,
      savedAt: new Date().toISOString()
    }))
  } catch (error) {
    console.error('Failed to save board state to localStorage:', error)
  }
}

const loadBoardStateFromLocalStorage = (): Record<string, Project[]> | null => {
  try {
    const data = JSON.parse(localStorage.getItem(BOARD_LOCAL_STORAGE_KEY) || '{}')
    return data.columns || null
  } catch (error) {
    console.error('Failed to load board state from localStorage:', error)
    return null
  }
}

export default function Board() {
  const isAdmin = useIsAdmin()
  const columns = useBoardStore((s) => s.columns);
  const isLoading = useBoardStore((s) => s.isLoading);
  const error = useBoardStore((s) => s.error);
  const setColumns = useBoardStore((s) => s.setColumns);
  const addProject = useBoardStore((s) => s.addProject);
  const deleteProject = useBoardStore((s) => s.deleteProject);
  const updateProject = useBoardStore((s) => s.updateProject);
  const loadProjects = useBoardStore((s) => s.loadProjects);
  const [quickAdd, setQuickAdd] = useState<{ colId: string | null; title: string; description: string }>({ colId: null, title: "", description: "" });
  const [open, setOpen] = useState(false);
  const [editModal, setEditModal] = useState<{ isOpen: boolean; project: Project | null }>({ isOpen: false, project: null });
  const [columnFilters, setColumnFilters] = useState<Record<string, {
    searchTerm: string;
    hasTechnologies: boolean;
    hasTags: boolean;
    hasDescription: boolean;
    showCompleted: boolean;
  }>>({
    ideas: { searchTerm: '', hasTechnologies: false, hasTags: false, hasDescription: false, showCompleted: true },
    'in-progress': { searchTerm: '', hasTechnologies: false, hasTags: false, hasDescription: false, showCompleted: true },
    completed: { searchTerm: '', hasTechnologies: false, hasTags: false, hasDescription: false, showCompleted: true }
  });
  const [filterDropdowns, setFilterDropdowns] = useState<Record<string, boolean>>({
    ideas: false,
    'in-progress': false,
    completed: false
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reduce activation distance
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;

    // Find the active project
    let draggedProject: Project | null = null;
    Object.values(columns).forEach(projects => {
      const project = projects.find(p => p.id === activeId);
      if (project) {
        draggedProject = project;
      }
    });

    setActiveId(activeId);
    setActiveProject(draggedProject);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setActiveProject(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the source column and project
    let sourceColumn = '';
    let sourceIndex = -1;
    let draggedProject: Project | undefined;

    Object.entries(columns).forEach(([columnId, projects]) => {
      const index = projects.findIndex(p => p.id === activeId);
      if (index !== -1) {
        sourceColumn = columnId;
        sourceIndex = index;
        draggedProject = projects[index];
      }
    });

    if (!draggedProject) return;

    // Check if dropping on a column (not a card)
    const isDroppingOnColumn = columnOrder.includes(overId);

    if (isDroppingOnColumn) {
      // Moving to a different column
      const targetColumn = overId;
      if (sourceColumn === targetColumn) return;

      // Map column to status
      const statusMap: Record<string, 'planning' | 'in-progress' | 'completed'> = {
        'ideas': 'planning',
        'in-progress': 'in-progress',
        'completed': 'completed'
      };

      const newStatus = statusMap[targetColumn];
      if (!newStatus) return;

      // Update project status - check admin permissions
      if (isAdmin) {
        updateProject(draggedProject.id, { status: newStatus });
      } else {
        // For non-admin users, update locally and save to localStorage
        const newColumns = { ...columns };
        // Remove from source column
        Object.keys(newColumns).forEach((colId: string) => {
          newColumns[colId] = newColumns[colId].filter((p: Project) => p.id !== draggedProject!.id);
        });
        // Add to target column
        if (!newColumns[targetColumn]) newColumns[targetColumn] = [];
        newColumns[targetColumn].push({ ...draggedProject!, status: newStatus, updated_at: new Date() });
        // Save to localStorage and update state
        saveBoardStateToLocalStorage(newColumns);
        setColumns(newColumns);
        // Show toast for local save
        import("@/presentation/utils/toast").then(({ info }) => {
          info("Project moved locally!", "Changes saved in your browser. Only admins can save to the database.");
        });
      }
    } else {
      // Reordering within the same column or moving between columns
      let targetColumn = sourceColumn;
      let targetIndex = sourceIndex;

      // Find target column and index
      Object.entries(columns).forEach(([columnId, projects]) => {
        const index = projects.findIndex(p => p.id === overId);
        if (index !== -1) {
          targetColumn = columnId;
          targetIndex = index;
        }
      });

      if (sourceColumn === targetColumn) {
        // Reordering within the same column
        if (sourceIndex === targetIndex) return;

        const newProjects = [...columns[sourceColumn]];
        const [removed] = newProjects.splice(sourceIndex, 1);
        newProjects.splice(targetIndex, 0, removed);

        setColumns({
          ...columns,
          [sourceColumn]: newProjects
        });
      } else {
        // Moving between different columns
        const statusMap: Record<string, 'planning' | 'in-progress' | 'completed'> = {
          'ideas': 'planning',
          'in-progress': 'in-progress',
          'completed': 'completed'
        };

        const newStatus = statusMap[targetColumn];
        if (!newStatus) return;

        // Update project status - check admin permissions
        if (isAdmin) {
          updateProject(draggedProject.id, { status: newStatus });
        } else {
          // For non-admin users, update locally and save to localStorage
          const newColumns = { ...columns };
          // Remove from source column
          Object.keys(newColumns).forEach((colId: string) => {
            newColumns[colId] = newColumns[colId].filter((p: Project) => p.id !== draggedProject!.id);
          });
          // Add to target column
          if (!newColumns[targetColumn]) newColumns[targetColumn] = [];
          newColumns[targetColumn].push({ ...draggedProject!, status: newStatus, updated_at: new Date() });
          // Save to localStorage and update state
          saveBoardStateToLocalStorage(newColumns);
          setColumns(newColumns);
          // Show toast for local save
          import("@/presentation/utils/toast").then(({ info }) => {
            info("Project moved locally!", "Changes saved in your browser. Only admins can save to the database.");
          });
        }
      }
    }
  };
  const handleAddProject = (columnId: string) => {
    setQuickAdd({ colId: columnId, title: '', description: '' });
    setOpen(true);
  };

  const handleDeleteProject = (projectId: string) => {
    if (isAdmin) {
      deleteProject(projectId);
    } else {
      // For non-admin users, delete locally and save to localStorage
      const newColumns = { ...columns };
      Object.keys(newColumns).forEach((colId: string) => {
        newColumns[colId] = newColumns[colId].filter((p: Project) => p.id !== projectId);
      });
      // Save to localStorage and update state
      saveBoardStateToLocalStorage(newColumns);
      setColumns(newColumns);
      // Show toast for local save
      import("@/presentation/utils/toast").then(({ info }) => {
        info("Project deleted locally!", "Changes saved in your browser. Only admins can save to the database.");
      });
    }
  };

  const handleUpdateProject = (project: Project) => {
    updateProject(project.id, project);
  };

  const handleOpenEditModal = (project: Project) => {
    setEditModal({ isOpen: true, project });
  };

  const handleCloseEditModal = () => {
    setEditModal({ isOpen: false, project: null });
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Always load projects from database on component mount
    loadProjects().catch((error) => {
      console.error('Failed to load projects from service layer:', error);
      // If there's an error loading from database, keep existing state
    });

    // For non-admin users, also load any local changes from localStorage
    if (!isAdmin) {
      const localState = loadBoardStateFromLocalStorage();
      if (localState) {
        setColumns(localState);
      }
    }
  }, [loadProjects, setColumns, isAdmin]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-x-hidden">
      {isLoading && (
        <div className="fixed top-6 right-4 sm:right-6 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-card text-card-foreground px-4 sm:px-6 py-3 rounded-xl shadow-xl border border-border backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 border-2 border-ring border-t-ring rounded-full animate-spin" />
              <span className="font-medium text-sm sm:text-base">Loading projects...</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-6 right-4 sm:right-6 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-card text-card-foreground px-4 sm:px-6 py-3 rounded-xl shadow-xl border border-border backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-destructive/20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-destructive" />
              </div>
              <span className="font-medium text-sm sm:text-base">Error: {error}</span>
            </div>
          </div>
        </div>
      )}

      {columnOrder.map((colId) => (
        <div key={colId} className="flex-1 min-w-0 flex flex-col rounded-2xl border border-border bg-card backdrop-blur-xl shadow-2xl min-h-full overflow-hidden group hover:shadow-3xl transition-all duration-500">
          {/* Column glow effect */}
          <div className="absolute -inset-0.5 bg-ring/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

          <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-h-0">
            {/* Enhanced Column Header */}
            <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 px-6 sm:px-8 py-4 sm:py-6 bg-card/95 backdrop-blur-xl border-b border-border flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 pl-4 sm:pl-6">
                  <div className={`h-3 w-3 rounded-full ${
                    colId === 'ideas' ? 'bg-blue-400 shadow-lg shadow-blue-400/50' :
                    colId === 'in-progress' ? 'bg-amber-400 shadow-lg shadow-amber-400/50' :
                    'bg-emerald-400 shadow-lg shadow-emerald-400/50'
                  }`} />
                  <h3 className="font-bold text-base sm:text-lg capitalize text-card-foreground">{colId.replace('-', ' ')}</h3>
                  <button
                    type="button"
                    aria-label="Column settings"
                    title="Column settings"
                    className="inline-flex size-7 sm:size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 hover:scale-110"
                  >
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Filter Button */}
                  <div className="relative">
                    <button
                      type="button"
                      aria-label="Filter projects"
                      title="Filter projects"
                      onClick={() => setFilterDropdowns(prev => ({ ...prev, [colId]: !prev[colId] }))}
                      className={`inline-flex size-7 sm:size-8 items-center justify-center rounded-lg transition-all duration-200 hover:scale-110 ${
                        Object.values(columnFilters[colId]).some(Boolean)
                          ? 'text-primary bg-primary/20 hover:bg-primary/30'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>

                    {/* Filter Dropdown */}
                    {filterDropdowns[colId] && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-popover backdrop-blur-xl border border-border rounded-xl shadow-2xl z-50 p-4">
                        <div className="space-y-4">
                          {/* Search */}
                          <div>
                            <label className="block text-sm font-medium text-popover-foreground mb-2">Search</label>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <input
                                type="text"
                                placeholder="Search projects..."
                                value={columnFilters[colId].searchTerm}
                                onChange={(e) => setColumnFilters(prev => ({
                                  ...prev,
                                  [colId]: { ...prev[colId], searchTerm: e.target.value }
                                }))}
                                className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-popover-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200"
                              />
                            </div>
                          </div>

                          {/* Filter Options */}
                          <div>
                            <label className="block text-sm font-medium text-popover-foreground mb-2">Filter by</label>
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 text-sm text-popover-foreground hover:text-popover-foreground cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={columnFilters[colId].hasTechnologies}
                                  onChange={(e) => setColumnFilters(prev => ({
                                    ...prev,
                                    [colId]: { ...prev[colId], hasTechnologies: e.target.checked }
                                  }))}
                                  className="rounded border-border bg-input text-primary focus:ring-ring"
                                />
                                Has technologies
                              </label>
                              <label className="flex items-center gap-2 text-sm text-popover-foreground hover:text-popover-foreground cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={columnFilters[colId].hasTags}
                                  onChange={(e) => setColumnFilters(prev => ({
                                    ...prev,
                                    [colId]: { ...prev[colId], hasTags: e.target.checked }
                                  }))}
                                  className="rounded border-border bg-input text-primary focus:ring-ring"
                                />
                                Has tags
                              </label>
                              <label className="flex items-center gap-2 text-sm text-popover-foreground hover:text-popover-foreground cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={columnFilters[colId].hasDescription}
                                  onChange={(e) => setColumnFilters(prev => ({
                                    ...prev,
                                    [colId]: { ...prev[colId], hasDescription: e.target.checked }
                                  }))}
                                  className="rounded border-border bg-input text-primary focus:ring-ring"
                                />
                                Has description
                              </label>
                            </div>
                          </div>

                          {/* Clear Filters */}
                          <button
                            onClick={() => {
                              setColumnFilters(prev => ({
                                ...prev,
                                [colId]: { searchTerm: '', hasTechnologies: false, hasTags: false, hasDescription: false, showCompleted: true }
                              }));
                              setFilterDropdowns(prev => ({ ...prev, [colId]: false }));
                            }}
                            className="w-full px-3 py-2 text-sm text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200"
                          >
                            Clear Filters
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <span className={`rounded-full border px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold border-border text-card-foreground bg-card shadow-lg`}>
                    {(columns[colId] ?? []).length}
                  </span>
                  <button
                    type="button"
                    aria-label="Add project"
                    title="Add project"
                    onClick={() => { setQuickAdd({ colId, title: '', description: '' }); setOpen(true); }}
                    className="inline-flex size-7 sm:size-8 items-center justify-center rounded-xl border border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Column Content */}
            <div className="pt-6 sm:pt-8 px-4 sm:px-6 pb-4 sm:pb-6 flex-1 space-y-4">
              <SortableContext items={(columns[colId] ?? []).map(p => p.id)} strategy={verticalListSortingStrategy}>
                <Column
                  columnId={colId}
                  projects={columns[colId] ?? []}
                  filters={columnFilters[colId]}
                  onAddProject={handleAddProject}
                  onDeleteProject={handleDeleteProject}
                  onOpenEditModal={handleOpenEditModal}
                />
              </SortableContext>
            </div>
          </div>
        </div>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card backdrop-blur-xl border border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-card-foreground">Add Project</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new task in &quot;{quickAdd.colId?.replace('-', ' ')}&quot;.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const t = quickAdd.title.trim();
              if (!t || !quickAdd.colId) return;

              if (isAdmin) {
                await addProject(quickAdd.colId, t, quickAdd.description.trim() || undefined);
              } else {
                // For non-admin users, add project locally and save to localStorage
                const newProject: Project = {
                  id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  title: t,
                  description: quickAdd.description.trim() || undefined,
                  status: quickAdd.colId === 'ideas' ? 'planning' : quickAdd.colId === 'in-progress' ? 'in-progress' : 'completed',
                  technologies: [],
                  tags: [],
                  tasks: [],
                  created_at: new Date(),
                  updated_at: new Date()
                };

                const newColumns = { ...columns };
                if (!newColumns[quickAdd.colId!]) newColumns[quickAdd.colId!] = [];
                newColumns[quickAdd.colId!].push(newProject);
                // Save to localStorage and update state
                saveBoardStateToLocalStorage(newColumns);
                setColumns(newColumns);

                // Show toast for local save
                import("@/presentation/utils/toast").then(({ info }) => {
                  info("Project added locally!", "Changes saved in your browser. Only admins can save to the database.");
                });
              }

              setOpen(false);
              setQuickAdd({ colId: null, title: '', description: '' });
            }}
          >
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Project title"
                value={quickAdd.title}
                onChange={(e) => setQuickAdd((p) => ({ ...p, title: e.target.value }))}
                autoFocus
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200"
              />
              <textarea
                placeholder="Description (optional)"
                value={quickAdd.description}
                onChange={(e) => setQuickAdd((p) => ({ ...p, description: e.target.value }))}
                rows={4}
                className="w-full resize-none rounded-xl border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200"
              />
            </div>
            <DialogFooter className="mt-6 gap-3">
              <button
                type="button"
                onClick={() => { setOpen(false); setQuickAdd({ colId: null, title: '', description: '' }); }}
                className="px-4 py-2 rounded-lg border border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Save Project
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Full-screen Edit Project Modal */}
      {editModal.isOpen && editModal.project && (
        <EditProjectForm
          project={editModal.project}
          isOpen={editModal.isOpen}
          onClose={handleCloseEditModal}
          onSave={handleUpdateProject}
          onDelete={handleDeleteProject}
        />
      )}
      </div>

      <DragOverlay>
        {activeId && activeProject ? (
          <Card
            project={activeProject}
            fromCol=""
            index={0}
            onDelete={() => {}}
            onOpenEditModal={() => {}}
            isDragOverlay={true}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}