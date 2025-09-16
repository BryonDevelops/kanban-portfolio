import { TaskRepository } from '../../../domain/board/repositories/taskRepository';
import { Task } from '../../../domain/task';

export class GetTasksHandler {
  constructor(private taskRepository: TaskRepository) {}

  async execute(): Promise<Task[]> {
    return await this.taskRepository.findAll();
  }
}