import { MockBoardRepository } from '../../__mocks__/MockBoardRepository';
import { Project } from '../../../../domain/board/schemas/project.schema';
import { ProjectCreate } from '../../../../domain/board/schemas/project.schema';
import { ProjectService } from '../../../../services/board/projectService';

// Create a mock repository for testing
const mockRepo = new MockBoardRepository();


describe('ProjectService', () => {
  let service: ProjectService;
  let mockRepository: MockBoardRepository;

  beforeEach(() => {
    mockRepository = new MockBoardRepository();
    service = new ProjectService(mockRepository);
    jest.clearAllMocks();
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
