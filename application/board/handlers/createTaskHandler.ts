import { TaskRepository } from '../../../domain/board/repositories/taskRepository';
import { Task } from '../../../domain/task';
import { TaskCreateSchema } from '../../../domain/board/schemas/task.schemas';

export class CreateTaskHandler {
  constructor(private taskRepository: TaskRepository) {}

  async execute(data: unknown): Promise<{ success: boolean; task?: Task; error?: string }> {
    // Validate input data
    const result = TaskCreateSchema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        error: result.error.flatten().fieldErrors.toString()
      };
    }

    try {
      // Add ID and create task
      const taskWithId = { ...result.data, id: crypto.randomUUID() };
      const createdTask = await this.taskRepository.create(taskWithId as Task);

      return {
        success: true,
        task: createdTask
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: message
      };
    }
  }
}