import { Project } from '../../../domain/board/entities/project';
import { Task } from '../../../domain/board/entities/task';
import { IBoardRepository } from '../../../domain/board/repositories/boardRepository.interface';

// Mock implementation of IBoardRepository for testing
export class MockBoardRepository implements IBoardRepository {
  private projects: Project[] = [];
  private tasks: Record<string, Task[]> = {};

  // Project operations
  async addProject(project: Project): Promise<void> {
    this.projects.push(project);
  }

  async fetchProjectById(id: string): Promise<Project | null> {
    return this.projects.find(p => p.id === id) || null;
  }

  async fetchProjects(): Promise<Project[]> {
    return [...this.projects];
  }

  async fetchProjectByStatus(status: string): Promise<Project[]> {
    return this.projects.filter(p => p.status === status);
  }

  async updateProject(id: string, project: Project): Promise<void> {
    const index = this.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      this.projects[index] = project;
    }
  }

  async deleteProject(id: string): Promise<void> {
    this.projects = this.projects.filter(p => p.id !== id);
  }

  async existsByTitle(title: string): Promise<boolean> {
    return this.projects.some(p => p.title === title);
  }

  async saveProject(project: Project): Promise<void> {
    const index = this.projects.findIndex(p => p.id === project.id);
    if (index !== -1) {
      this.projects[index] = project;
    } else {
      this.projects.push(project);
    }
  }

  // Task operations
  async fetchTasks(): Promise<Record<string, Task[]>> {
    return { ...this.tasks };
  }

  async fetchTasksForProject(projectId: string): Promise<Task[]> {
    return this.tasks[projectId] || [];
  }

  async addTask(task: Task): Promise<void> {
    const columnId = task.columnId as string;
    if (!this.tasks[columnId]) {
      this.tasks[columnId] = [];
    }
    this.tasks[columnId].push(task);
  }

  async updateTask(id: string, task: Task): Promise<void> {
    // Find and update task across all columns
    for (const columnId in this.tasks) {
      const taskIndex = this.tasks[columnId].findIndex(t => t.id === id);
      if (taskIndex !== -1) {
        this.tasks[columnId][taskIndex] = task;
        break;
      }
    }
  }

  async deleteTask(id: string): Promise<void> {
    // Remove task from all columns
    for (const columnId in this.tasks) {
      this.tasks[columnId] = this.tasks[columnId].filter(t => t.id !== id);
    }
  }

  async moveTask(taskId: string, fromColumn: string, toColumn: string): Promise<void> {
    const fromTasks = this.tasks[fromColumn] || [];
    const taskIndex = fromTasks.findIndex(t => t.id === taskId);

    if (taskIndex !== -1) {
      const [task] = fromTasks.splice(taskIndex, 1);
      task.status = toColumn;
      task.columnId = toColumn;

      if (!this.tasks[toColumn]) {
        this.tasks[toColumn] = [];
      }
      this.tasks[toColumn].push(task);
    }
  }

  async reorderTasks(columnId: string, taskIds: string[]): Promise<void> {
    const columnTasks = this.tasks[columnId] || [];
    const reorderedTasks = taskIds
      .map(id => columnTasks.find(t => t.id === id))
      .filter((task): task is Task => task !== undefined);

    this.tasks[columnId] = reorderedTasks;
  }

  async saveTasks(tasks: Record<string, Task[]>): Promise<void> {
    this.tasks = { ...tasks };
  }

  // Helper methods for testing
  setMockData(projects: Project[], tasks: Record<string, Task[]>): void {
    this.projects = [...projects];
    this.tasks = { ...tasks };
  }

  clearData(): void {
    this.projects = [];
    this.tasks = {};
  }

  getProjects(): Project[] {
    return [...this.projects];
  }

  getTasks(): Record<string, Task[]> {
    return { ...this.tasks };
  }
}