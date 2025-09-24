"use client";

import React, { useEffect, useState } from 'react';
import Column from './Column';
import Card from './Card';
import { Plus, Settings, Filter, Search } from 'lucide-react';
import { useBoardStore } from '../../../stores/board/boardStore';
import { Project } from '../../../../domain/board/schemas/project.schema';
import EditProjectForm from '../../forms/EditProjectForm';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { useIsAdmin } from '../../shared/ProtectedRoute';
import { useUser } from '@clerk/nextjs';

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
  const { user, isLoaded } = useUser()
  const isLoggedIn = isLoaded && !!user
  const canSaveToDatabase = isLoggedIn && isAdmin
  const columns = useBoardStore((s) => s.columns);
  const isLoading = useBoardStore((s) => s.isLoading);
  const error = useBoardStore((s) => s.error);
  const setColumns = useBoardStore((s) => s.setColumns);
  const deleteProject = useBoardStore((s) => s.deleteProject);
  const updateProject = useBoardStore((s) => s.updateProject);
  const loadProjects = useBoardStore((s) => s.loadProjects);
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
        distance: 5, // Reduced for more responsive activation
        delay: 0, // Removed delay for instant response
        tolerance: 3, // Reduced tolerance for more precise control
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

      // Update project status - check permissions
      if (canSaveToDatabase) {
        updateProject(draggedProject.id, { status: newStatus });
      } else {
        // For users without database save permissions, update locally and save to localStorage
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

        // Update project status - check permissions
        if (canSaveToDatabase) {
          updateProject(draggedProject.id, { status: newStatus });
        } else {
          // For users without database save permissions, update locally and save to localStorage
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
  const handleDeleteProject = (projectId: string) => {
    if (canSaveToDatabase) {
      deleteProject(projectId);
    } else {
      // For users without database save permissions, delete locally and save to localStorage
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

  const handleMoveToColumn = (projectId: string, targetColumn: string) => {
    // Find the project and its current column
    let sourceColumn = '';
    let draggedProject: Project | undefined;

    Object.entries(columns).forEach(([columnId, projects]) => {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        sourceColumn = columnId;
        draggedProject = project;
      }
    });

    if (!draggedProject || sourceColumn === targetColumn) return;

    // Map column to status
    const statusMap: Record<string, 'planning' | 'in-progress' | 'completed'> = {
      'ideas': 'planning',
      'in-progress': 'in-progress',
      'completed': 'completed'
    };

    const newStatus = statusMap[targetColumn];
    if (!newStatus) return;

    // Update project status - check permissions
    if (canSaveToDatabase) {
      updateProject(draggedProject.id, { status: newStatus });
    } else {
      // For users without database save permissions, update locally and save to localStorage
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

    // Only load projects from database if user is logged in
    if (isLoggedIn) {
      loadProjects().catch((error) => {
        console.error('Failed to load projects from service layer:', error);
        // If there's an error loading from database, keep existing state
      });
    }

    // For users without database save permissions, load any local changes from localStorage
    if (!canSaveToDatabase) {
      const localState = loadBoardStateFromLocalStorage();
      if (localState) {
        setColumns(localState);
      }
    }
  }, [loadProjects, setColumns, isLoggedIn, canSaveToDatabase]);

  return (
    <div className="relative h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={(event) => {
          // Add visual feedback during drag
          const { over } = event;
          if (over && over.id !== 'dragged-item') {
            // Could add additional visual feedback here if needed
          }
        }}
      >
      <div className="h-full flex flex-col lg:flex-row gap-4 md:gap-5 lg:gap-6 overflow-x-hidden">
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
            <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 md:-mx-8 -mt-4 sm:-mt-6 md:-mt-8 px-6 sm:px-8 md:px-10 py-4 sm:py-6 md:py-8 bg-card/95 backdrop-blur-xl border-b border-border flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3 pl-4 sm:pl-6 md:pl-8">
                  <div className={`h-3 w-3 md:h-4 md:w-4 rounded-full ${
                    colId === 'ideas' ? 'bg-blue-400 shadow-lg shadow-blue-400/50' :
                    colId === 'in-progress' ? 'bg-amber-400 shadow-lg shadow-amber-400/50' :
                    'bg-emerald-400 shadow-lg shadow-emerald-400/50'
                  }`} />
                  <h3 className="font-bold text-base sm:text-lg md:text-xl capitalize text-card-foreground">{colId.replace('-', ' ')}</h3>
                  <button
                    type="button"
                    aria-label="Column settings"
                    title="Column settings"
                    className="inline-flex size-8 sm:size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 hover:scale-110"
                  >
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>

                <div className="flex items-center gap-1 sm:gap-3">
                  {/* Filter Button */}
                  <div className="relative">
                    <button
                      type="button"
                      aria-label="Filter projects"
                      title="Filter projects"
                      onClick={() => setFilterDropdowns(prev => ({ ...prev, [colId]: !prev[colId] }))}
                      className={`inline-flex size-8 sm:size-8 items-center justify-center rounded-lg transition-all duration-200 hover:scale-110 ${
                        Object.values(columnFilters[colId]).some(Boolean)
                          ? 'text-primary bg-primary/20 hover:bg-primary/30'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>

                    {/* Filter Dropdown */}
                    {filterDropdowns[colId] && (
                      <div className="absolute right-0 top-full mt-2 w-56 sm:w-64 md:w-72 bg-popover backdrop-blur-xl border border-border rounded-xl shadow-2xl z-50 p-3 sm:p-4 md:p-5">
                        <div className="space-y-3 sm:space-y-4 md:space-y-5">
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
                                className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-popover-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200 text-sm"
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
                    onClick={() => {}}
                    className="inline-flex size-8 sm:size-8 items-center justify-center rounded-xl border border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Column Content */}
            <div className="pt-6 sm:pt-8 md:pt-10 px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 flex-1 space-y-4 md:space-y-6">
              <Column
                columnId={colId}
                projects={columns[colId] ?? []}
                filters={columnFilters[colId]}
                onDeleteProject={handleDeleteProject}
                onOpenEditModal={handleOpenEditModal}
                onMoveToColumn={handleMoveToColumn}
              />
            </div>
          </div>
        </div>
      ))}

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
          <div className="shadow-2xl ring-2 ring-primary/50 bg-card/95 backdrop-blur-sm transform-none">
            <Card
              project={activeProject}
              fromCol=""
              index={0}
              onDelete={() => {}}
              onOpenEditModal={() => {}}
              onMoveToColumn={() => {}}
              isDragOverlay={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
    </div>
  );
}