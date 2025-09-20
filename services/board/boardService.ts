import { IBoardRepository } from '../../domain/board/repositories/boardRepository.interface';
import { TaskService } from './taskService';
import { ProjectService } from './projectService';
import { Project, ProjectUpdate } from '../../domain/board/schemas/project.schema';

export class BoardService {
  static addProjectToColumns(columns: { [x: string]: Project[]; }, columnId: string, newProject: Project): { [x: string]: Project[]; } {
    if (!columns[columnId]) {
      throw new Error(`Column ${columnId} does not exist`);
    }

    return {
      ...columns,
      [columnId]: [...columns[columnId], newProject],
    };
  }

  static moveProjectInColumns(columns: { [x: string]: Project[]; }, fromCol: string, toCol: string, fromIndex: number, toIndex: number): { [x: string]: Project[]; } {
    if (!columns[fromCol] || !columns[toCol]) {
      throw new Error(`Column ${fromCol} or ${toCol} does not exist`);
    }

    const fromProjects = [...columns[fromCol]];
    const toProjects = [...columns[toCol]];

    if (fromIndex < 0 || fromIndex >= fromProjects.length) {
      throw new Error(`Invalid fromIndex ${fromIndex} for column ${fromCol}`);
    }

    // Remove project from source column
    const [movedProject] = fromProjects.splice(fromIndex, 1);

    // Insert project into destination column
    toProjects.splice(toIndex, 0, movedProject);

    return {
      ...columns,
      [fromCol]: fromProjects,
      [toCol]: toProjects,
    };
  }
  constructor(
    private repository: IBoardRepository,
    private taskService: TaskService,
    private projectService: ProjectService
  ) {}

  // Project operations - delegate to ProjectService (static methods above handle the store operations)
  async createProject(title: string, description?: string): Promise<Project> {
    return await this.projectService.createProjectSimple(title, description) as Project;
  }

  async getProjects(): Promise<Project[]> {
    return await this.projectService.getProjects() as Project[];
  }

  async updateProject(projectId: string, updates: ProjectUpdate): Promise<Project> {
    return await this.projectService.updateProject(projectId, updates) as Project;
  }

  async moveProject(projectId: string, toCol: string): Promise<Project> {
    return await this.projectService.moveProject(projectId, toCol) as Project;
  }

  async deleteProject(projectId: string): Promise<void> {
    return await this.projectService.deleteProject(projectId);
  }
}
