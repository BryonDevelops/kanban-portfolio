import { Project, ProjectStatus } from '../../../domain/board/entities/project';
import { ProjectCreate, ProjectUpdate } from '../../../domain/board/schemas/project.schema';

export class MockProjectService {
  // Mock data storage
  private projects: Project[] = [];

  // Jest mock functions for all ProjectService methods
  moveProject = jest.fn();
  createProject = jest.fn();
  createProjectSimple = jest.fn();
  getProjectById = jest.fn();
  getAllProjects = jest.fn();
  getProjects = jest.fn();
  getProjectsByStatus = jest.fn();
  updateProject = jest.fn();
  deleteProject = jest.fn();
  archiveProject = jest.fn();
  unarchiveProject = jest.fn();
  moveProjectToStatus = jest.fn();
  startProject = jest.fn();
  completeProject = jest.fn();
  pauseProject = jest.fn();
  addTechnology = jest.fn();
  removeTechnology = jest.fn();

  constructor() {
    this.setupDefaultMockBehavior();
  }

  private setupDefaultMockBehavior() {
    // Default implementations that can be overridden in tests
    this.createProject.mockImplementation(async (projectData: ProjectCreate): Promise<Project> => {
      const project: Project = {
        id: 'mock-project-id',
        title: projectData.title,
        description: projectData.description,
        url: projectData.url,
        status: projectData.status || 'planning',
        technologies: projectData.technologies || [],
        tags: projectData.tags || [],
        start_date: projectData.start_date,
        end_date: projectData.end_date,
        tasks: [],
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.projects.push(project);
      return project;
    });

    this.getProjectById.mockImplementation(async (id: string): Promise<Project | null> => {
      return this.projects.find(p => p.id === id) || null;
    });

    this.getAllProjects.mockImplementation(async (): Promise<Project[]> => {
      return [...this.projects];
    });
  }

  // Helper methods for testing
  reset() {
    this.projects = [];
    jest.clearAllMocks();
    this.setupDefaultMockBehavior();
  }

  setProjects(projects: Project[]) {
    this.projects = [...projects];
  }

  getStoredProjects(): Project[] {
    return [...this.projects];
  }
}
