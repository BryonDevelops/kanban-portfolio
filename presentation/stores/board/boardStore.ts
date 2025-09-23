// board store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project } from '../../../domain/board/schemas/project.schema';
import { BoardService } from '../../../services/board/boardService';
import { SupabaseBoardRepository } from '../../../infrastructure/database/repositories/supaBaseBoardRepository';
import { TaskService } from '../../../services/board/taskService';
import { ProjectService } from '../../../services/board/projectService';


export type Columns = Record<string, Project[]>;

type BoardState = {
  columns: Columns;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  addProject: (columnId: string, title: string, description?: string) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  moveProject: (fromCol: string, toCol: string, fromIndex: number, toIndex: number) => void;
  reorderProjectsInColumn: (columnId: string, newOrder: Project[]) => void;
  setColumns: (cols: Columns) => void;
  loadProjects: (forceRefresh?: boolean) => Promise<void>;
};

// Initialize services
const boardRepository = new SupabaseBoardRepository();
const taskService = new TaskService(boardRepository);
const projectService = new ProjectService(boardRepository);
const boardService = new BoardService(boardRepository, taskService, projectService);

// Removed duplicate Columns type for Task[]; only using Project[]

const defaultColumns: Columns = {
  ideas: [],
  'in-progress': [],
  completed: [],
};


export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      columns: defaultColumns,
      isLoading: false,
      error: null,
      lastFetched: null,

      loadProjects: async (forceRefresh = false) => {
        const state = get();
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        const now = Date.now();

        // If we have cached data and it's still fresh (unless force refresh), use it
        if (!forceRefresh && state.columns && Object.keys(state.columns).length > 0 &&
            state.lastFetched && (now - state.lastFetched) < CACHE_DURATION) {
          return; // Use cached data
        }

        // Always show cached data first if available, then fetch in background
        const hasCachedData = state.columns && Object.keys(state.columns).some(key => state.columns[key].length > 0);

        if (!hasCachedData || forceRefresh) {
          set({ isLoading: true, error: null });
        }

        try {
          const projects = await boardService.getProjects();
          const activeProjects = projects.filter((p: Project) => p.status !== 'archived');
          const groupedProjects = {
            ideas: activeProjects.filter((p: Project) => p.status === 'planning' || p.status === 'on-hold'),
            'in-progress': activeProjects.filter((p: Project) => p.status === 'in-progress'),
            completed: activeProjects.filter((p: Project) => p.status === 'completed'),
          };

          set({
            columns: groupedProjects,
            isLoading: false,
            lastFetched: now,
            error: null
          });
        } catch (error) {
          // If we have cached data, keep using it even if fetch fails
          if (hasCachedData && !forceRefresh) {
            set({ isLoading: false });
          } else {
            set({
              error: error instanceof Error ? error.message : 'Failed to load projects',
              isLoading: false
            });
          }
        }
      },

      addProject: async (columnId: string, title: string, description?: string) => {
        set({ isLoading: true, error: null });
        try {
          const newProject = await boardService.createProject(title, description);
          set((state) => ({
            columns: BoardService.addProjectToColumns(state.columns, columnId, newProject),
            isLoading: false
          }));
          import("@/presentation/utils/toast").then(({ success }) => {
            success("Project created!", `"${title}" has been added to your board.`);
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add project',
            isLoading: false
          });
          import("@/presentation/utils/toast").then(({ error: errorToast }) => {
            errorToast("Failed to create project", error instanceof Error ? error.message : 'Please try again.');
          });
        }
      },

      updateProject: async (projectId: string, updates: Partial<Project>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedProject = await boardService.updateProject(projectId, updates);
          set((state) => {
            const newColumns = { ...state.columns };
            let found = false;
            Object.keys(newColumns).forEach((columnId) => {
              const projectIndex = newColumns[columnId].findIndex((project) => project.id === projectId);
              if (projectIndex !== -1) {
                newColumns[columnId][projectIndex] = updatedProject;
                found = true;
              }
            });
            if (found && updates.status) {
              const targetColumn =
                updates.status === 'planning' || updates.status === 'on-hold' ? 'ideas' :
                updates.status === 'in-progress' ? 'in-progress' :
                updates.status === 'completed' ? 'completed' : null;
              if (targetColumn) {
                Object.keys(newColumns).forEach((columnId) => {
                  newColumns[columnId] = newColumns[columnId].filter((project) => project.id !== projectId);
                });
                if (!newColumns[targetColumn]) newColumns[targetColumn] = [];
                newColumns[targetColumn].push(updatedProject);
              }
            }
            return {
              columns: newColumns,
              isLoading: false
            };
          });
          import("@/presentation/utils/toast").then(({ success }) => {
            success("Project updated!", "Your changes have been saved.");
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update project',
            isLoading: false
          });
          import("@/presentation/utils/toast").then(({ error: errorToast }) => {
            errorToast("Failed to update project", error instanceof Error ? error.message : 'Please try again.');
          });
        }
      },

      deleteProject: async (projectId: string) => {
        set({ isLoading: true, error: null });
        try {
          await boardService.updateProject(projectId, { status: 'archived' });
          set((state) => {
            const newColumns = { ...state.columns };
            Object.keys(newColumns).forEach((columnId) => {
              newColumns[columnId] = newColumns[columnId].filter((project) => project.id !== projectId);
            });
            return {
              columns: newColumns,
              isLoading: false
            };
          });
          import("@/presentation/utils/toast").then(({ success }) => {
            success("Project archived!", "The project has been moved to archive.");
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to archive project',
            isLoading: false
          });
          import("@/presentation/utils/toast").then(({ error: errorToast }) => {
            errorToast("Failed to archive project", error instanceof Error ? error.message : 'Please try again.');
          });
        }
      },

      moveProject: (fromCol: string, toCol: string, fromIndex: number, toIndex: number) => {
        set((state) => ({
          columns: BoardService.moveProjectInColumns(state.columns, fromCol, toCol, fromIndex, toIndex),
        }));
      },

      reorderProjectsInColumn: (columnId: string, newOrder: Project[]) => {
        set((state) => ({
          columns: {
            ...state.columns,
            [columnId]: newOrder
          }
        }));
      },

      setColumns: (cols: Columns) => set(() => ({ columns: cols })),
    }),
    {
      name: 'kanban-board-v2', // Updated version to clear old cache
      partialize: (state) => ({
        columns: state.columns,
        lastFetched: state.lastFetched
      })
    }
  )
);
