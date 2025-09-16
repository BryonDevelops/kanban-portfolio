// Board Store - Presentation layer state management
// Follows: Components → Stores → Application Services → Domain
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task } from '../../../domain/task';
// Import application services instead of calling domain directly
import { BoardService } from '../../../application/board/services/boardService';

export type Columns = Record<string, Task[]>;

export type BoardState = {
  columns: Columns;
  addTask: (columnId: string, title: string, description?: string) => Promise<void>;
  moveTask: (fromCol: string, toCol: string, fromIndex: number, toIndex: number) => Promise<void>;
  setColumns: (cols: Columns) => void;
  isLoading: boolean;
  error: string | null;
};

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

      // Store calls Application Service, not Domain directly
      addTask: async (columnId: string, title: string, description?: string) => {
        try {
          set({ isLoading: true, error: null });

          // Call application service instead of domain directly
          const boardService = new BoardService();
          await boardService.addTask(columnId, title, description);

          // Get updated state from application layer
          const updatedColumns = boardService.getColumns();
          set({ columns: updatedColumns, isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to add task'
          });
        }
      },

      moveTask: async (fromCol: string, toCol: string, fromIndex: number, toIndex: number) => {
        try {
          set({ isLoading: true, error: null });

          // Call application service
          const boardService = new BoardService();
          await boardService.moveTask(fromCol, toCol, fromIndex, toIndex);

          // Get updated state from application layer
          const updatedColumns = boardService.getColumns();
          set({ columns: updatedColumns, isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to move task'
          });
        }
      },

      setColumns: (cols: Columns) => set({ columns: cols, error: null }),
    }),
    {
      name: 'kanban-board-v1',
      // Only persist the data, not loading/error states
      partialize: (state) => ({ columns: state.columns })
    }
  )
);
