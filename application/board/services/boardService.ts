// Board Application Service - Business logic orchestration
// Follows: Components → Stores → Application Services → Domain
import { Task } from '../../../domain/task';
import { nanoid } from 'nanoid';

export type Columns = Record<string, Task[]>;

export class BoardService {
  private columns: Columns = {
    ideas: [],
    'in-progress': [],
    completed: [],
  };

  // Application service methods that work with domain entities
  async addTask(columnId: string, title: string, description?: string): Promise<void> {
    // Create domain entity
    const newTask: Task = {
      id: nanoid(),
      title,
      description
    };

    // Business logic: Add task to column
    this.columns = this.addTaskToColumns(this.columns, columnId, newTask);
  }

  async moveTask(fromCol: string, toCol: string, fromIndex: number, toIndex: number): Promise<void> {
    // Business logic: Move task between columns
    this.columns = this.moveTaskInColumns(this.columns, fromCol, toCol, fromIndex, toIndex);
  }

  getColumns(): Columns {
    return { ...this.columns };
  }

  setColumns(columns: Columns): void {
    this.columns = { ...columns };
  }

  // Domain logic helpers (could be moved to domain services)
  private addTaskToColumns(columns: Columns, columnId: string, task: Task): Columns {
    return {
      ...columns,
      [columnId]: [...(columns[columnId] || []), task]
    };
  }

  private moveTaskInColumns(columns: Columns, fromCol: string, toCol: string, fromIndex: number, toIndex: number): Columns {
    const source = Array.from(columns[fromCol] ?? []);
    const [moved] = source.splice(fromIndex, 1);
    const dest = Array.from(columns[toCol] ?? []);
    dest.splice(toIndex, 0, moved);
    return {
      ...columns,
      [fromCol]: source,
      [toCol]: dest
    };
  }
}