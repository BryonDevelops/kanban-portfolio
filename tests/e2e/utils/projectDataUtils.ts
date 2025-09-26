// Project data utilities for flexible project creation
import { Project, ProjectCreate } from '../../../domain/board/schemas/project.schema';
import { Tag } from 'storybook/internal/types';

// Simple project data interface for easy test creation
export interface ProjectData {
  title: string;
  description?: string;
  status?: 'idea' | 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'archived';
  technologies?: string[];
  tags?: Tag[];
  url?: string;
  start_date?: Date;
  end_date?: Date;
  tasks?: TaskData[];
}

// Simple task data interface
export interface TaskData {
  title: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'done';
}

// Convert ProjectData to full Project schema
export function projectDataToProject(data: ProjectData): Project {
  const now = new Date();

  return {
    id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: data.title,
    description: data.description || '',
    status: data.status || 'planning',
    technologies: data.technologies || [],
    tags: data.tags || [],
    attachments: [], // Required attachments array
    url: data.url,
    start_date: data.start_date,
    end_date: data.end_date,
    created_at: now,
    updated_at: now,
    tasks: (data.tasks || []).map(taskDataToTask),
  };
}

// Convert ProjectData to Entity Project (for repository compatibility)
export function projectDataToEntityProject(data: ProjectData): Project {
  const now = new Date();

  return {
    id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: data.title,
    description: data.description || '',
    status: data.status || 'planning',
    technologies: data.technologies || [],
    tags: data.tags || [],
    attachments: [], // Required attachments array
    url: data.url,
    start_date: data.start_date,
    end_date: data.end_date,
    created_at: now,
    updated_at: now,
    tasks: (data.tasks || []).map(taskDataToEntityTask),
  };
}

// Convert ProjectData to ProjectCreate schema (for service layer)
export function projectDataToProjectCreate(data: ProjectData): ProjectCreate {
  return {
    title: data.title,
    description: data.description || '',
    status: data.status || 'planning',
    technologies: data.technologies || [],
    tags: data.tags || [],
    attachments: [], // Required attachments array
    url: data.url,
    start_date: data.start_date,
    end_date: data.end_date,
    tasks: (data.tasks || []).map(taskDataToTask),
  };
}

// Convert TaskData to task schema
function taskDataToTask(data: TaskData) {
  const now = new Date();

  return {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: data.title,
    description: data.description || '',
    status: data.status || 'todo',
    created_at: now,
    updated_at: now,
  };
}

// Convert TaskData to entity Task
function taskDataToEntityTask(data: TaskData) {
  const now = new Date();

  return {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: data.title,
    description: data.description || '',
    status: data.status || 'todo',
    order: 0,
    created_at: now,
    updated_at: now,
    columnId: 'ideas',
    filter: () => {
      throw new Error('Function not implemented.');
    },
  };
}

// Quick project creation helpers
export const createProject = {
  // Simple project with just title
  basic: (title: string, options?: Partial<ProjectData>): Project => {
    return projectDataToProject({
      title,
      status: 'planning',
      technologies: [],
      tags: [],
      ...options,
    });
  },

  // Project with tasks
  withTasks: (title: string, tasks: TaskData[], options?: Partial<ProjectData>): Project => {
    return projectDataToProject({
      title,
      tasks,
      status: 'planning',
      technologies: [],
      tags: [],
      ...options,
    });
  },

  // Project for service layer (ProjectCreate)
  forService: (title: string, options?: Partial<ProjectData>): ProjectCreate => {
    return projectDataToProjectCreate({
      title,
      status: 'planning',
      technologies: [],
      tags: [],
      ...options,
    });
  },

  // Create project from fixture data
  fromFixture: (fixture: Project): Project => {
    // Convert fixture to ProjectData format and back to ensure consistency
    const projectData: ProjectData = {
      title: fixture.title,
      description: fixture.description,
      status: fixture.status,
      technologies: fixture.technologies,
      tags: fixture.tags,
      url: fixture.url,
      start_date: fixture.start_date,
      end_date: fixture.end_date,
      tasks: fixture.tasks?.map(task => ({
        title: task.title,
        description: task.description,
        status: task.status,
      })),
    };

    return projectDataToProject(projectData);
  },

  // Create multiple projects from fixtures
  fromFixtures: (fixtures: Project[]): Project[] => {
    return fixtures.map(fixture => createProject.fromFixture(fixture));
  },
};