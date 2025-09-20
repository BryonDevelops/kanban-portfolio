import { ProjectService, ProjectRepository } from '../../../services/board/projectService';
import { Project } from '../../../domain/project';
import { ProjectCreate, ProjectUpdate } from '../../../domain/schemas/project.schemas';
// Removed import of 'mock' from 'node:test' as it's not used and may conflict with Jest

// Create a mock repository for testing
const mockRepo: ProjectRepository = {
    create: jest.fn().mockResolvedValue({
    id: '123',
    title: 'New Project',
    status: 'idea',
    description: '',
    technologies: []
  } as Project),
  findById: jest.fn().mockResolvedValue(null),
  findAll: jest.fn().mockResolvedValue([]),
  findByStatus: jest.fn().mockResolvedValue([]),
  update: jest.fn().mockResolvedValue({} as Project),
  delete: jest.fn().mockResolvedValue(undefined),
};


describe('ProjectService', () => {
  let service: ProjectService;

  beforeEach(() => {
    service = new ProjectService(mockRepo);
    jest.clearAllMocks();
  });

  it('should instantiate successfully', () => {
    expect(service).toBeDefined();
    expect(service.createProject).toBeDefined();
    expect(service.getProjectById).toBeDefined();
  });

  it.skip('should create a project', async () => {
    const projectData: ProjectCreate = { title: 'New Project' };
    const result = await service.createProject(projectData);

    expect(mockRepo.create).toHaveBeenCalledWith(projectData);
    expect(result).toBeDefined();
    expect(result.title).toBe('New Project');
  });
});
