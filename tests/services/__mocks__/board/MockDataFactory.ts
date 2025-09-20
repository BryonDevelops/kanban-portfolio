import { Project } from '../../../../domain/board/entities/project';
import { Task } from '../../../../domain/board/entities/task';

// Factory functions for creating mock data
export class MockDataFactory {
  static createMockProject(overrides: Partial<Project> = {}): Project {
    return {
      id: `project-${Date.now()}`,
      title: 'Mock Project',
      description: 'A mock project for testing',
      status: 'planning',
      technologies: ['React', 'TypeScript'],
      tags: ['frontend', 'test'],
      tasks: [],
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides
    };
  }

  static createMockTask(overrides: Partial<Task> = {}): Task {
    return {
      id: `task-${Date.now()}`,
      title: 'Mock Task',
      description: 'A mock task for testing',
      status: 'todo',
      order: 0,
      created_at: new Date(),
      updated_at: new Date(),
      filter: () => [],
      columnId: 'ideas',
      ...overrides
    };
  }

  static createMockProjects(count: number = 3): Project[] {
    const statuses: Project['status'][] = ['planning', 'in-progress', 'completed'];
    const projects: Project[] = [];

    for (let i = 0; i < count; i++) {
      projects.push(this.createMockProject({
        id: `project-${i + 1}`,
        title: `Project ${i + 1}`,
        status: statuses[i % statuses.length],
        technologies: i % 2 === 0 ? ['React', 'Node.js'] : ['Vue', 'Python'],
        tags: [`tag-${i + 1}`]
      }));
    }

    return projects;
  }

  static createMockTasksForProject(projectId: string, count: number = 2): Task[] {
    const tasks: Task[] = [];
    const statuses: Task['status'][] = ['todo', 'in-progress', 'done'];

    for (let i = 0; i < count; i++) {
      tasks.push(this.createMockTask({
        id: `task-${projectId}-${i + 1}`,
        title: `Task ${i + 1} for ${projectId}`,
        status: statuses[i % statuses.length],
        order: i,
        projectId
      }));
    }

    return tasks;
  }
}

// Predefined mock data for common testing scenarios
export const mockProjects = {
  empty: [],
  single: [MockDataFactory.createMockProject()],
  multiple: MockDataFactory.createMockProjects(5),
  byStatus: {
    planning: MockDataFactory.createMockProjects(2).map(p => ({ ...p, status: 'planning' as const })),
    inProgress: MockDataFactory.createMockProjects(2).map(p => ({ ...p, status: 'in-progress' as const })),
    completed: MockDataFactory.createMockProjects(2).map(p => ({ ...p, status: 'completed' as const }))
  }
};

export const mockTasks = {
  empty: {},
  singleProject: {
    'project-1': MockDataFactory.createMockTasksForProject('project-1', 3)
  },
  multipleProjects: {
    'project-1': MockDataFactory.createMockTasksForProject('project-1', 2),
    'project-2': MockDataFactory.createMockTasksForProject('project-2', 2),
    'project-3': MockDataFactory.createMockTasksForProject('project-3', 1)
  }
};