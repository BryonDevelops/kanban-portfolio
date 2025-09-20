import { Project } from '../entities/project';
import { ProjectCreate, ProjectUpdate } from '../schemas/project.schemas';

export interface ProjectRepository {
  create(project: ProjectCreate): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findAll(): Promise<Project[]>;
  findByStatus(status: Project['status']): Promise<Project[]>;
  update(id: string, project: ProjectUpdate): Promise<Project>;
  delete(id: string): Promise<void>;
}