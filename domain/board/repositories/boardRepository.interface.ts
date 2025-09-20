import { Project } from '../entities/project';
import { Task } from '../entities/task';

export interface IBoardRepository {
  existsByTitle(title: string): unknown;
  fetchTasks(): Record<string, Task[]> | PromiseLike<Record<string, Task[]>>;
  // Project operations
  fetchProjects(): Promise<Project[]>;
  addProject(project: Project): Promise<void>;
  updateProject(id: string, updates: Partial<Project>): Promise<void>;
  deleteProject(id: string): Promise<void>;

  // Task operations
  fetchTasksForProject(projectId: string): Promise<Task[]>;
  addTask(task: Task, projectId: string): Promise<void>;
  updateTask(id: string, updates: Partial<Task>): Promise<void>;
  deleteTask(id: string): Promise<void>;

  // Board-specific operations
  moveTask(taskId: string, fromProjectId: string, toProjectId: string): Promise<void>;
  reorderTasks(projectId: string, taskIds: string[]): Promise<void>;

  // Added methods for task and project management
  saveTasks(tasks: Record<string, Task[]>): Promise<void>;
  saveProject(project: Project): Promise<void>;
  fetchProjectById(projectId: string): Promise<Project | null>;
}

