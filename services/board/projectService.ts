import { Project } from '../../domain/project';
import { ProjectCreate, ProjectUpdate, ProjectCreateSchema } from '../../domain/schemas/project.schemas';

export interface ProjectRepository {
  create(project: ProjectCreate): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findAll(): Promise<Project[]>;
  findByStatus(status: Project['status']): Promise<Project[]>;
  update(id: string, project: ProjectUpdate): Promise<Project>;
  delete(id: string): Promise<void>;
}

export class ProjectService {
  constructor(private repository: ProjectRepository) {}

  async createProject(projectData: ProjectCreate): Promise<Project> {
    // TODO: Implement project creation logic
    throw new Error('Not implemented');
  }

  async getProjectById(id: string): Promise<Project | null> {
    // TODO: Implement get project by ID logic
    throw new Error('Not implemented');
  }

  async getAllProjects(): Promise<Project[]> {
    // TODO: Implement get all projects logic
    throw new Error('Not implemented');
  }

  async getProjectsByStatus(status: Project['status']): Promise<Project[]> {
    // TODO: Implement get projects by status logic
    throw new Error('Not implemented');
  }

  async updateProject(id: string, projectData: Omit<ProjectUpdate, 'id'>): Promise<Project> {
    // TODO: Implement project update logic
    throw new Error('Not implemented');
  }

  async deleteProject(id: string): Promise<void> {
    // TODO: Implement project deletion logic
    throw new Error('Not implemented');
  }

  async archiveProject(id: string): Promise<Project> {
    // TODO: Implement project archiving logic
    throw new Error('Not implemented');
  }

  async unarchiveProject(id: string): Promise<Project> {
    // TODO: Implement project unarchiving logic
    throw new Error('Not implemented');
  }

  async moveProjectToStatus(id: string, status: Project['status']): Promise<Project> {
    // TODO: Implement project status change logic
    throw new Error('Not implemented');
  }
}