import { MockBoardRepository } from '../../__mocks__/board/MockBoardRepository';
import { Project } from '../../../../domain/board/entities/project';
import { ProjectCreate } from '../../../../domain/board/schemas/project.schema';
import { ProjectService } from '../../../../services/board/projectService';
import { Task } from '../../../../domain/board/entities/task';


// Create a mock repository for testing
const mockRepo: MockBoardRepository = {
  addProject: jest.fn().mockResolvedValue({
    id: '123',
    title: 'New Project',
    status: 'idea',
    description: '',
    technologies: []
  } as unknown as Project),
  fetchProjectById: jest.fn().mockResolvedValue(null),
  fetchProjects: jest.fn().mockResolvedValue([]),
  fetchProjectByStatus: jest.fn().mockResolvedValue([]),
  updateProject: jest.fn().mockResolvedValue({} as Project),
  deleteProject: jest.fn().mockResolvedValue(undefined),
  existsByTitle: jest.fn().mockResolvedValue(undefined),
  fetchTasks: jest.fn().mockResolvedValue({} as Record<string, Task[]>),
  fetchTasksForProject: jest.fn().mockResolvedValue([] as Task[]),
  addTask: jest.fn().mockResolvedValue(undefined),
  updateTask: jest.fn().mockResolvedValue(undefined),
  deleteTask: jest.fn().mockResolvedValue(undefined),
  moveTask: jest.fn().mockResolvedValue(undefined),
  reorderTasks: jest.fn().mockResolvedValue(undefined),
  saveTasks: jest.fn().mockResolvedValue(undefined),
  saveProject: jest.fn().mockResolvedValue(undefined)
};


describe('ProjectService', () => {
  let service: ProjectService;
  let mockRepository: MockBoardRepository;

  beforeEach(() => {
    mockRepository = new MockBoardRepository();
    service = new ProjectService(mockRepository);
    jest.clearAllMocks();
  });

  it("should fetch projects from the repository", async () => {
    const projects: Project[] = [
      {
        id: '1',
        title: 'Project 1',
        status: 'in-progress',
        description: 'Description for Project 1',
        technologies: [],
        tags: [],
        tasks: []
      },
      {
        id: '2',
        title: 'Project 2',
        status: 'completed',
        description: 'Description for Project 2',
        technologies: [],
        tags: [],
        tasks: []
      }
    ];

    mockRepository.fetchProjects.mockResolvedValue(projects);

    const result = await service.getAllProjects();

    expect(result).toEqual(projects);
  });

  it('should instantiate successfully', () => {
    expect(service).toBeDefined();
    expect(service.createProject).toBeDefined();
    expect(service.getAllProjects).toBeDefined();
  });

  it.skip('should create a project', async () => {
    const projectData: ProjectCreate = {
      title: 'New Project',
      status: 'planning',
      technologies: [],
      tags: [],
      tasks: []
    };
    const result = await service.createProject(projectData);

    expect(mockRepo.addProject).toHaveBeenCalledWith(projectData);
    expect(result).toBeDefined();
    expect(result.title).toBe('New Project');
  });
});
