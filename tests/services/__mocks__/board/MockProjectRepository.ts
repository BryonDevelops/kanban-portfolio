import { IBoardRepository } from '../../../../domain/board/repositories/boardRepository.interface';
import { Project } from '../../../../domain/board/entities/project';
import { Task } from '../../../../domain/board/entities/task';

export class MockProjectRepository implements IBoardRepository {
  private projects: Project[] = [];
  private tasks: Record<string, Task[]> = {};

  // Mock data for testing
  constructor(initialProjects: Project[] = []) {
    this.projects = [...initialProjects];
  }

  // Project operations
  async fetchProjects(): Promise<Project[]> {
    return [...this.projects];
  }

  async addProject(project: Project): Promise<void> {
    this.projects.push({ ...project });
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    const index = this.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      this.projects[index] = { ...this.projects[index], ...updates };
    }
  }

  async deleteProject(id: string): Promise<void> {
    this.projects = this.projects.filter(p => p.id !== id);
  }

  async fetchProjectById(projectId: string): Promise<Project | null> {
    return this.projects.find(p => p.id === projectId) || null;
  }

  async saveProject(project: Project): Promise<void> {
    const index = this.projects.findIndex(p => p.id === project.id);
    if (index !== -1) {
      this.projects[index] = { ...project };
    } else {
      this.projects.push({ ...project });
    }
  }

  // Task operations
  async fetchTasks(): Promise<Record<string, Task[]>> {
    return { ...this.tasks };
  }

  async fetchTasksForProject(projectId: string): Promise<Task[]> {
    return this.tasks[projectId] || [];
  }

  async addTask(task: Task, projectId: string): Promise<void> {
    if (!this.tasks[projectId]) {
      this.tasks[projectId] = [];
    }
    this.tasks[projectId].push({ ...task });
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    for (const projectId in this.tasks) {
      const taskIndex = this.tasks[projectId].findIndex(t => t.id === id);
      if (taskIndex !== -1) {
        this.tasks[projectId][taskIndex] = { ...this.tasks[projectId][taskIndex], ...updates };
        break;
      }
    }
  }

  async deleteTask(id: string): Promise<void> {
    for (const projectId in this.tasks) {
      this.tasks[projectId] = this.tasks[projectId].filter(t => t.id !== id);
    }
  }

  // Board-specific operations
  async moveTask(taskId: string, fromProjectId: string, toProjectId: string): Promise<void> {
    const fromTasks = this.tasks[fromProjectId] || [];
    const taskIndex = fromTasks.findIndex(t => t.id === taskId);

    if (taskIndex !== -1) {
      const [task] = fromTasks.splice(taskIndex, 1);

      if (!this.tasks[toProjectId]) {
        this.tasks[toProjectId] = [];
      }
      this.tasks[toProjectId].push(task);
    }
  }

  async reorderTasks(projectId: string, taskIds: string[]): Promise<void> {
    const projectTasks = this.tasks[projectId] || [];
    const reorderedTasks: Task[] = [];

    // Reorder tasks based on the provided IDs
    taskIds.forEach(taskId => {
      const task = projectTasks.find(t => t.id === taskId);
      if (task) {
        reorderedTasks.push(task);
      }
    });

    this.tasks[projectId] = reorderedTasks;
  }

  // Utility methods
  async saveTasks(tasks: Record<string, Task[]>): Promise<void> {
    this.tasks = { ...tasks };
  }

  async existsByTitle(title: string): Promise<boolean> {
    return this.projects.some(p => p.title === title);
  }

  // Helper methods for testing
  getProjects(): Project[] {
    return [...this.projects];
  }

  getTasks(): Record<string, Task[]> {
    return { ...this.tasks };
  }

  clear(): void {
    this.projects = [];
    this.tasks = {};
  }

  addMockProject(project: Project): void {
    this.projects.push({ ...project });
  }

  addMockTask(task: Task, projectId: string): void {
    if (!this.tasks[projectId]) {
      this.tasks[projectId] = [];
    }
    this.tasks[projectId].push({ ...task });
  }

  // Helper method to set mock data for testing
  setMockData(projects: Project[], tasks: Record<string, Task[]>): void {
    this.projects = [...projects];
    this.tasks = { ...tasks };
  }
}