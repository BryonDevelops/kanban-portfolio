import { Task } from '../../../../domain/board/entities/task';
import { Project } from '../../../../domain/board/entities/project'; // Ensure Project is a class, not just a type

export class MockBoardService {
  addTask = jest.fn(
    async (
      columnId: string,
      title: string,
      description?: string
    ): Promise<Task> => {
      return {
        id: 'mock-task-id',
        title: title || 'Default Task Title',
        description: description || 'Default Task Description',
        status: columnId,
        order: 0,
        columnId,
        created_at: new Date(),
        filter: jest.fn(),
      };
    }
  );

  moveTaskInColumns = jest.fn(
    async (
      fromCol: string,
      toCol: string,
      fromIndex: number,
      toIndex: number
    ): Promise<void> => {
      const tasks = await this.getTasks();

      // Simulate removing the task from the source column
      const [movedTask] = tasks[fromCol].splice(fromIndex, 1);

      // Update the task's columnId to the destination column
      movedTask.columnId = toCol;

      // Simulate adding the task to the destination column
      const destinationTasks = await this.getTasks();
      destinationTasks[toCol].splice(toIndex, 0, movedTask);
    }
  );

  getTasks = jest.fn(async (): Promise<Record<string, Task[]>> => {
    return {
      column1: [
        {
            id: 'task1',
            title: 'Task 1',
            description: 'Description 1',
            status: 'todo',
            order: 0,
            filter: jest.fn(),
            created_at: new Date(),
            columnId: undefined
        },
        {
            id: 'task2',
            title: 'Task 2',
            description: 'Description 2',
            status: 'todo',
            order: 1,
            columnId: 'column1',
            filter: jest.fn(),
            created_at: new Date(),
        },
      ],
      column2: [
        {
            id: 'task3',
            title: 'Task 3',
            description: 'Description 3',
            status: 'in-progress',
            order: 0,
            columnId: 'column2',
            filter: jest.fn(),
            created_at: new Date(),
        },
      ],
    };
  });

  getTasksByColumn = jest.fn(
    async (): Promise<Task[]> => {
      return [];
    }
  );

  updateTask = jest.fn(
    async (
      taskId: string,
      updates: Partial<Omit<Task, 'id' | 'created_at'>>
    ): Promise<Task> => {
      return {
        id: taskId,
        title: updates.title || 'Updated Task Title',
        description: updates.description || 'Updated Task Description',
        status: updates.status || 'Updated Task Status',
        order: 0,
        columnId: updates.columnId || 'Updated Column Id',
        created_at: new Date(),
        filter: jest.fn(),
      };
    }
  );

  deleteTask = jest.fn(
    async (): Promise<void> => {
      return;
    }
  );

  createProject = jest.fn(
    async (title: string, description?: string): Promise<Project> => {
      return {
          title: title || 'Default Project Title',
          description: description || 'Default Project Description',
          tasks: [],
          created_at: new Date(),
          updated_at: new Date(),
          status: 'planning',
          technologies: [],
          tags: [],
      } as unknown as Project;
    }
  );

  getProjects = jest.fn(async (): Promise<Project[]> => {
    return [];
  });

  updateProject = jest.fn(
    async (
      projectId: string,
      updates: Partial<Omit<Project, 'id'>>
    ): Promise<Project> => {
      return {
        id: projectId,
        title: updates.title || 'Updated Project Title',
        description: updates.description || 'Updated Project Description',
        tasks: [],
        created_at: new Date(),
        updated_at: new Date(),
        status: 'planning',
        technologies: [],
        tags: [],
      } as Project;
    }
  );

  deleteProject = jest.fn(
    async (projectId: string): Promise<void> => {
      if (projectId === 'mock-project-id') {
        return;
      }
      throw new Error(`Project with ID "${projectId}" not found`);
    }
  );
}

function async(): ((this: unknown, ...args: unknown[]) => unknown) | undefined {
    throw new Error('Function not implemented.');
}
