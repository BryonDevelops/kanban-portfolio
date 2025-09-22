"use client";
import React, { useEffect, useState } from 'react';
import Column from './Column';
import { Plus, Settings, Filter, Search } from 'lucide-react';
import { useBoardStore } from '../../../stores/board/boardStore';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Project } from '../../../../domain/board/schemas/project.schema';
import EditProjectForm from '../../forms/EditProjectForm';

const columnOrder = ['ideas', 'in-progress', 'completed'];

export default function Board() {
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
  const handleAddProject = (columnId: string) => {
    setQuickAdd({ colId: columnId, title: '', description: '' });
    setOpen(true);
  };

  const handleDeleteProject = (projectId: string) => {
    deleteProject(projectId);
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

    // const loadDemoData = () => {
    //   const demo = {
    //     ideas: [
    //       {
    //         id: 'demo-1',
    //         title: 'Redesign landing page',
    //         description: 'Hero, pricing, footer',
    //         status: 'planning',
    //         technologies: ['React', 'Tailwind'],
    //         tags: ['frontend'],
    //         tasks: [],
    //         created_at: new Date(),
    //         updated_at: new Date()
    //       },
    //       {
    //         id: 'demo-2',
    //         title: 'Add blog',
    //         description: 'MDX + RSS',
    //         status: 'planning',
    //         technologies: ['Next.js', 'MDX'],
    //         tags: ['content'],
    //         tasks: [],
    //         created_at: new Date(),
    //         updated_at: new Date()
    //       },
    //     ],
    //     'in-progress': [
    //       {
    //         id: 'demo-3',
    //         title: 'Implement dark mode',
    //         description: 'Theme switch + system',
    //         status: 'in-progress',
    //         technologies: ['React', 'CSS'],
    //         tags: ['ui'],
    //         tasks: [],
    //         created_at: new Date(),
    //         updated_at: new Date()
    //       },
    //     ],
    //     completed: [
    //       {
    //         id: 'demo-4',
    //         title: 'Set up CI/CD',
    //         description: 'Vercel + GitHub Actions',
    //         status: 'completed',
    //         technologies: ['GitHub Actions'],
    //         tags: ['devops'],
    //         tasks: [],
    //         created_at: new Date(),
    //         updated_at: new Date()
    //       },
    //     ],
    //   } as typeof columns;
    //   setColumns(demo);
    // };
  }, [loadProjects, setColumns]);

  const badgeClasses = () => {
    return 'border-white/30 text-white/80 bg-white/10 shadow-lg shadow-white/10';
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-x-hidden">
      {isLoading && (
        <div className="fixed top-6 right-4 sm:right-6 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-white/10 text-white px-4 sm:px-6 py-3 rounded-xl shadow-xl border border-white/20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="font-medium text-sm sm:text-base">Loading projects...</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-6 right-4 sm:right-6 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-white/10 text-white px-4 sm:px-6 py-3 rounded-xl shadow-xl border border-white/20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
              <span className="font-medium text-sm sm:text-base">Error: {error}</span>
            </div>
          </div>
        </div>
      )}

      {columnOrder.map((colId) => (
        <div key={colId} className="flex-1 min-w-0 flex flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.04] backdrop-blur-xl shadow-2xl min-h-full overflow-hidden group hover:shadow-3xl transition-all duration-500">
          {/* Column glow effect */}
          <div className="absolute -inset-0.5 bg-white/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

          <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-h-0">
            {/* Enhanced Column Header */}
            <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 px-6 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-white/[0.1] to-white/[0.05] backdrop-blur-xl border-b border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 pl-4 sm:pl-6">
                  <div className={`h-3 w-3 rounded-full ${
                    colId === 'ideas' ? 'bg-blue-400 shadow-lg shadow-blue-400/50' :
                    colId === 'in-progress' ? 'bg-amber-400 shadow-lg shadow-amber-400/50' :
                    'bg-emerald-400 shadow-lg shadow-emerald-400/50'
                  }`} />
                  <h3 className="font-bold text-base sm:text-lg capitalize text-white">{colId.replace('-', ' ')}</h3>
                  <button
                    type="button"
                    aria-label="Column settings"
                    title="Column settings"
                    className="inline-flex size-7 sm:size-8 items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-110"
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
                          ? 'text-blue-400 bg-blue-500/20 hover:bg-blue-500/30'
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>

                    {/* Filter Dropdown */}
                    {filterDropdowns[colId] && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 p-4">
                        <div className="space-y-4">
                          {/* Search */}
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Search</label>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                              <input
                                type="text"
                                placeholder="Search projects..."
                                value={columnFilters[colId].searchTerm}
                                onChange={(e) => setColumnFilters(prev => ({
                                  ...prev,
                                  [colId]: { ...prev[colId], searchTerm: e.target.value }
                                }))}
                                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                              />
                            </div>
                          </div>

                          {/* Filter Options */}
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Filter by</label>
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 text-sm text-white/70 hover:text-white cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={columnFilters[colId].hasTechnologies}
                                  onChange={(e) => setColumnFilters(prev => ({
                                    ...prev,
                                    [colId]: { ...prev[colId], hasTechnologies: e.target.checked }
                                  }))}
                                  className="rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50"
                                />
                                Has technologies
                              </label>
                              <label className="flex items-center gap-2 text-sm text-white/70 hover:text-white cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={columnFilters[colId].hasTags}
                                  onChange={(e) => setColumnFilters(prev => ({
                                    ...prev,
                                    [colId]: { ...prev[colId], hasTags: e.target.checked }
                                  }))}
                                  className="rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50"
                                />
                                Has tags
                              </label>
                              <label className="flex items-center gap-2 text-sm text-white/70 hover:text-white cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={columnFilters[colId].hasDescription}
                                  onChange={(e) => setColumnFilters(prev => ({
                                    ...prev,
                                    [colId]: { ...prev[colId], hasDescription: e.target.checked }
                                  }))}
                                  className="rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50"
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
                            className="w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                          >
                            Clear Filters
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <span className={`rounded-full border px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold ${badgeClasses()}`}>
                    {(columns[colId] ?? []).length}
                  </span>
                  <button
                    type="button"
                    aria-label="Add project"
                    title="Add project"
                    onClick={() => { setQuickAdd({ colId, title: '', description: '' }); setOpen(true); }}
                    className="inline-flex size-7 sm:size-8 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white/80 hover:bg-white/15 hover:text-white hover:border-white/30 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Column Content */}
            <div className="pt-6 sm:pt-8 px-4 sm:px-6 pb-4 sm:pb-6 flex-1 space-y-4">
              <Column
                columnId={colId}
                projects={columns[colId] ?? []}
                filters={columnFilters[colId]}
                onAddProject={handleAddProject}
                onDeleteProject={handleDeleteProject}
                onOpenEditModal={handleOpenEditModal}
              />
            </div>
          </div>
        </div>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Add Project</DialogTitle>
            <DialogDescription className="text-slate-400">
              Create a new task in &quot;{quickAdd.colId?.replace('-', ' ')}&quot;.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const t = quickAdd.title.trim();
              if (!t || !quickAdd.colId) return;
              await addProject(quickAdd.colId, t, quickAdd.description.trim() || undefined);
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
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              />
              <textarea
                placeholder="Description (optional)"
                value={quickAdd.description}
                onChange={(e) => setQuickAdd((p) => ({ ...p, description: e.target.value }))}
                rows={4}
                className="w-full resize-none rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              />
            </div>
            <DialogFooter className="mt-6 gap-3">
              <button
                type="button"
                onClick={() => { setOpen(false); setQuickAdd({ colId: null, title: '', description: '' }); }}
                className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
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
  );
}