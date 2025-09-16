import { SupabaseTaskRepository } from '../infrastructure/database/supabaseTaskRepository';
import { TaskRepository } from '../domain/board/repositories/taskRepository';
import { CreateTaskHandler } from '../application/board/handlers/createTaskHandler';
import { GetTasksHandler } from '../application/board/handlers/getTasksHandler';

// Repository instances
const taskRepository: TaskRepository = new SupabaseTaskRepository();

// Handler factories
export const createTaskHandler = () => new CreateTaskHandler(taskRepository);
export const getTasksHandler = () => new GetTasksHandler(taskRepository);

// For testing - allows dependency injection
export const createHandlersWithDependencies = (
  customTaskRepository: TaskRepository
) => ({
  createTaskHandler: () => new CreateTaskHandler(customTaskRepository),
  getTasksHandler: () => new GetTasksHandler(customTaskRepository),
});