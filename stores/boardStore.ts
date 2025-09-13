// board store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { Task } from '../domain/task';
import { BoardService } from '../services/boardService';

type Columns = Record<string, Task[]>;

type BoardState = {
  columns: Columns;
  addTask: (columnId: string, title: string, description?: string) => void;
  moveTask: (fromCol: string, toCol: string, fromIndex: number, toIndex: number) => void;
  setColumns: (cols: Columns) => void;
};

const defaultColumns: Columns = {
  ideas: [],
  'in-progress': [],
  completed: [],
};

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      columns: defaultColumns,
      addTask: (columnId: string, title: string, description?: string) => {
        const newTask: Task = { id: nanoid(), title, description };
        set((s: BoardState) => ({
          columns: BoardService.addTaskToColumns(s.columns, columnId, newTask),
        }));
      },
      moveTask: (fromCol: string, toCol: string, fromIndex: number, toIndex: number) => {
        set((s: BoardState) => ({
          columns: BoardService.moveTaskInColumns(s.columns, fromCol, toCol, fromIndex, toIndex),
        }));
      },
      setColumns: (cols: Columns) => set(() => ({ columns: cols })),
    }),
    { name: 'kanban-board-v1' } // localStorage key
  )
);
