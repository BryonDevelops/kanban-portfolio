import { Project } from '../../domain/board/entities/project';
import { Task } from '../../domain/board/entities/task';
import type { ProjectStatus } from '../../domain/board/entities/project';
import { IBoardRepository } from '../../domain/board/repositories/boardRepository.interface';
import { ProjectCreate, ProjectUpdate, ProjectCreateSchema } from '../../domain/board/schemas/project.schema';
import { TaskCreate, TaskUpdate } from '@/domain/board/schemas/task.schemas';
import { nanoid } from 'nanoid';

export class ProjectService {
  async moveProject(projectId: string, toCol: string): Promise<Project> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    const existingProject = await this.repository.fetchProjectById(projectId);
    if (!existingProject) {
      throw new Error(`Project with ID "${projectId}" not found`);
    }

    // Map column IDs to project statuses
    const statusMap: Record<string, ProjectStatus> = {
      'idea': 'idea',
      'in-progress': 'in-progress',
      'completed': 'completed'
    };

    const newStatus = statusMap[toCol];
    if (!newStatus) {
      throw new Error(`Invalid column: ${toCol}`);
    }

    // Update project status
    const updatedProject: Project = {
      ...existingProject,
      status: newStatus,
      updated_at: new Date(),
    };

    await this.repository.updateProject(projectId, updatedProject);
    return updatedProject;
  }

  constructor(private repository: IBoardRepository) {}

  async createProject(projectData: ProjectCreate): Promise<Project> {
    // Validate the input data
    const validatedData = ProjectCreateSchema.parse(projectData);

    // Check for duplicate titles (optional business rule)
    const titleExists = await this.repository.existsByTitle(validatedData.title);
    if (titleExists) {
      throw new Error(`Project with title "${validatedData.title}" already exists`);
    }

    // Create project entity
    const project: Project = {
      id: nanoid(),
      title: validatedData.title,
      description: validatedData.description,
      url: validatedData.url,
      status: validatedData.status || 'idea',
      technologies: validatedData.technologies || [],
      tags: validatedData.tags || [],
      start_date: validatedData.start_date,
      end_date: validatedData.end_date,
      tasks: [],
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Persist to repository
    await this.repository.addProject(project);

    // Return the created project
    return project;
  }

  async createProjectSimple(title: string, description?: string): Promise<Project> {
    if (!title.trim()) {
      throw new Error('Project title is required');
    }

    const project: Project = {
      id: nanoid(),
      title: title.trim(),
      description: description?.trim(),
      tasks: [],
      created_at: new Date(),
      updated_at: new Date(),
      status: 'idea',
      technologies: [],
      tags: [],
    };

    await this.repository.addProject(project);
    return project;
  }

  async getProjectById(id: string): Promise<Project | null> {
    if (!id) {
      throw new Error('Project ID is required');
    }
    return await this.repository.fetchProjectById(id);
  }

  async getAllProjects(): Promise<Project[]> {
    return await this.repository.fetchProjects();
  }

  async getProjects(): Promise<Project[]> {
    return await this.repository.fetchProjects();
  }

  async getProjectsByStatus(status: ProjectStatus): Promise<Project[]> {
    const allProjects = await this.repository.fetchProjects();
    return allProjects.filter(project => project.status === status);
  }

  async updateProject(id: string, projectData: ProjectUpdate): Promise<Project> {
    if (!id) {
      throw new Error('Project ID is required');
    }

    // Get existing project
    const existingProject = await this.repository.fetchProjectById(id);
    if (!existingProject) {
      throw new Error(`Project with ID "${id}" not found`);
    }

    // Check for title uniqueness if title is being updated
    if (projectData.title && projectData.title !== existingProject.title) {
      const titleExists = await this.repository.existsByTitle(projectData.title);
      if (titleExists) {
        throw new Error(`Project with title "${projectData.title}" already exists`);
      }
    }

    // Create updated project
    const updatedProject: Project = {
      id: existingProject.id,
      title: projectData.title ?? existingProject.title,
      description: projectData.description ?? existingProject.description,
      url: projectData.url ?? existingProject.url,
      status: projectData.status ?? existingProject.status,
      technologies: projectData.technologies ?? existingProject.technologies,
      tags: projectData.tags ?? existingProject.tags,
      start_date: projectData.start_date ?? existingProject.start_date,
      end_date: projectData.end_date ?? existingProject.end_date,
      tasks: [],
      created_at: existingProject.created_at,
      updated_at: new Date(),
    };

    // Persist changes
    await this.repository.updateProject(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<void> {
    if (!id) {
      throw new Error('Project ID is required');
    }

    const existingProject = await this.repository.fetchProjectById(id);
    if (!existingProject) {
      throw new Error(`Project with ID "${id}" not found`);
    }

    await this.repository.deleteProject(id);
  }

  async archiveProject(id: string): Promise<Project> {
    return await this.moveProjectToStatus(id, 'completed');
  }

  async unarchiveProject(id: string): Promise<Project> {
    return await this.moveProjectToStatus(id, 'planning');
  }

  async moveProjectToStatus(id: string, status: ProjectStatus): Promise<Project> {
    if (!id) {
      throw new Error('Project ID is required');
    }

    const existingProject = await this.repository.fetchProjectById(id);
    if (!existingProject) {
      throw new Error(`Project with ID "${id}" not found`);
    }

    // Update project status
    const updatedProject: Project = {
      ...existingProject,
      status,
      updated_at: new Date(),
    };

    await this.repository.updateProject(id, updatedProject);
    return updatedProject;
  }

  // Convenience methods for common workflows
  async startProject(id: string): Promise<Project> {
    return await this.moveProjectToStatus(id, 'in-progress');
  }

  async completeProject(id: string): Promise<Project> {
    return await this.moveProjectToStatus(id, 'completed');
  }

  async pauseProject(id: string): Promise<Project> {
    return await this.moveProjectToStatus(id, 'on-hold');
  }

  async addTechnology(id: string, technology: string): Promise<Project> {
    if (!id || !technology) {
      throw new Error('Project ID and technology are required');
    }

    const existingProject = await this.repository.fetchProjectById(id);
    if (!existingProject) {
      throw new Error(`Project with ID "${id}" not found`);
    }

    const updatedProject: Project = {
      ...existingProject,
      technologies: [...existingProject.technologies, technology],
      updated_at: new Date(),
    };

    await this.repository.updateProject(id, updatedProject);
    return updatedProject;
  }

  async removeTechnology(id: string, technology: string): Promise<Project> {
    if (!id || !technology) {
      throw new Error('Project ID and technology are required');
    }

    const existingProject = await this.repository.fetchProjectById(id);
    if (!existingProject) {
      throw new Error(`Project with ID "${id}" not found`);
    }

    const updatedProject: Project = {
      ...existingProject,
      technologies: existingProject.technologies.filter(tech => tech !== technology),
      updated_at: new Date(),
    };

    await this.repository.updateProject(id, updatedProject);
    return updatedProject;
  }
}