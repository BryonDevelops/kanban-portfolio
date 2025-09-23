import { Task, TaskStatus } from '../../domain/board/entities/task';
import { IBoardRepository } from '../../domain/board/repositories/boardRepository.interface';

export class TaskService {
  constructor(private repository: IBoardRepository) {}

  private static mapColumnIdToStatus(columnId: string): TaskStatus {
    switch (columnId) {
      case 'ideas':
        return 'todo';
      case 'in-progress':
        return 'in-progress';
      case 'completed':
        return 'done';
      default:
        return 'todo'; // fallback
    }
  }

  async addTask(columnId: string, title: string, description?: string): Promise<Task> {
    if (!title.trim()) {
      throw new Error('Task title is required');
    }

    const newTask: Task = {
      id: this.generateId(),
      title: title.trim(),
      description: description?.trim(),
      status: TaskService.mapColumnIdToStatus(columnId),
      columnId: columnId,
      created_at: new Date()
    };

    const currentTasks = await this.repository.fetchTasksForProject(columnId);
    const updatedTasks = TaskService.addTaskToColumns({ [columnId]: currentTasks }, columnId, newTask);

    await this.repository.saveTasks(updatedTasks);
    return newTask;
  }

  async moveTask(fromCol: string, toCol: string, fromIndex: number, toIndex: number): Promise<void> {
    const currentTasks = await this.repository.fetchTasksForProject(fromCol);
    const updatedTasks = TaskService.moveTaskInColumns({ [fromCol]: currentTasks }, fromCol, toCol, fromIndex, toIndex);

    await this.repository.saveTasks(updatedTasks);
  }

  async getTasks(): Promise<Record<string, Task[]>> {
    const tasks = await this.repository.fetchTasks();
    return tasks;
  }

  async getTasksByColumn(columnId: string): Promise<Task[]> {
    const tasks = await this.repository.fetchTasksForProject(columnId);
    const tasksByColumn: Record<string, Task[]> = { [columnId]: tasks };
    return tasksByColumn[columnId] || [];
  }

  async updateTask(taskId: string, columnId: string, updates: Partial<Omit<Task, 'id'>>): Promise<Task> {
    // Fetch all tasks as a record of columns
    const currentTasks: Record<string, Task[]> = await this.repository.fetchTasks();

    // Find the task across all columns
    let foundTask: Task | null = null;
    let foundColumn: string | null = null;

    for (const [colId, tasks] of Object.entries(currentTasks)) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        foundTask = task;
        foundColumn = colId;
        break;
      }
    }

    if (!foundTask || !foundColumn) {
      throw new Error(`Task with ID "${taskId}" not found`);
    }

    const updatedTask: Task = { ...foundTask, ...updates };

    // Update the task in its column
    const updatedTasks: Record<string, Task[]> = {
      ...currentTasks,
      [foundColumn]: currentTasks[foundColumn].map(task =>
        task.id === taskId ? updatedTask : task
      )
    };

    await this.repository.saveTasks(updatedTasks);
    return updatedTask;
  }

  async deleteTask(taskId: string, columnId: string): Promise<void> {
    const currentTasks = await this.repository.fetchTasksForProject(columnId);

    // Find and remove the task from its column
    const updatedTasks = Object.fromEntries(
      Object.entries(currentTasks).map(([columnId, tasks]) => [
        columnId,
        (tasks as unknown as Task[]).filter((task: Task) => task.id !== taskId)
      ])
    );

    await this.repository.saveTasks(updatedTasks);
  }

  async reorderColumn(columnId: string, taskIds: string[]): Promise<void> {
    const currentTasks = await this.repository.fetchTasksForProject(columnId);
    const tasksByColumn: Record<string, Task[]> = { [columnId]: currentTasks || [] };
    const columnTasks = tasksByColumn[columnId] || [];

    // Create a map for quick lookup
    const taskMap = new Map(columnTasks.map((task: Task) => [task.id, task]));

    // Reorder tasks based on provided IDs
    const reorderedTasks = taskIds
      .map(id => taskMap.get(id))
      .filter((task): task is Task => task !== undefined)
      .map((task, index) => ({ ...task, order: index }));

    const updatedTasks: Record<string, Task[]> = {
      [columnId]: reorderedTasks
    };

    await this.repository.saveTasks(updatedTasks);
  }

  // Utility methods for column operations
  static addTaskToColumns(columns: Record<string, Task[]>, columnId: string, task: Task): Record<string, Task[]> {
    const existingTasks = columns[columnId] || [];
    const updatedTask = { ...task, order: existingTasks.length };

    return {
      ...columns,
      [columnId]: [...existingTasks, updatedTask]
    };
  }

  static moveTaskInColumns(
    columns: Record<string, Task[]>,
    fromCol: string,
    toCol: string,
    fromIndex: number,
    toIndex: number
  ): Record<string, Task[]> {
    const source = Array.from(columns[fromCol] ?? []);
    const [moved] = source.splice(fromIndex, 1);

    // Update status if moving between columns
    if (fromCol !== toCol) {
      moved.status = TaskService.mapColumnIdToStatus(toCol);
    }

    const dest = fromCol === toCol ? source : Array.from(columns[toCol] ?? []);
    dest.splice(toIndex, 0, moved);

    // Update order for all affected tasks
    const updatedSource = source.map((task, index) => ({ ...task, order: index }));
    const updatedDest = dest.map((task, index) => ({ ...task, order: index }));

    return {
      ...columns,
      [fromCol]: updatedSource,
      [toCol]: updatedDest
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}