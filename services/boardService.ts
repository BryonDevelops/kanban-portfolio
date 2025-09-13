import { Task } from '../domain/task';
import { useBoardStore } from '../stores/boardStore';

export class BoardService {
  addTask(columnId: string, title: string, description?: string) {
    useBoardStore.getState().addTask(columnId, title, description);
  }

  moveTask(fromCol: string, toCol: string, fromIndex: number, toIndex: number) {
    useBoardStore.getState().moveTask(fromCol, toCol, fromIndex, toIndex);
  }

  getColumns() {
    return useBoardStore.getState().columns;
  }

  static addTaskToColumns(columns: Record<string, Task[]>, columnId: string, task: Task): Record<string, Task[]> {
    return { ...columns, [columnId]: [...(columns[columnId] || []), task] };
  }

  static moveTaskInColumns(columns: Record<string, Task[]>, fromCol: string, toCol: string, fromIndex: number, toIndex: number): Record<string, Task[]> {
    const source = Array.from(columns[fromCol] ?? []);
    const [moved] = source.splice(fromIndex, 1);
    const dest = Array.from(columns[toCol] ?? []);
    dest.splice(toIndex, 0, moved);
    return { ...columns, [fromCol]: source, [toCol]: dest };
  }
}
