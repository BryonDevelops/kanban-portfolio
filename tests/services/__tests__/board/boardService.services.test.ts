import { BoardService } from "../../../../services/board/boardService";
import { TaskService } from "../../../../services/board/taskService";
import { ProjectService } from "../../../../services/board/projectService";
import { MockBoardRepository } from "../../__mocks__/board/MockBoardRepository";
import { Project } from "../../../../domain/board/entities/project";


describe('BoardService', () => {
  let boardService: BoardService;
  let mockRepository: MockBoardRepository;
  let taskService: TaskService;
  let projectService: ProjectService;

  beforeEach(() => {
    mockRepository = new MockBoardRepository();
    taskService = new TaskService(mockRepository);
    projectService = new ProjectService(mockRepository);
    boardService = new BoardService(mockRepository, taskService, projectService);
  });

  test('should move a project between columns', async () => {
    const fromCol = 'column1';
    const toCol = 'column2';
    const project: Project = {
        id: 'project1',
        title: 'Project 1',
        description: 'Description for Project 1',
        tasks: [],
        created_at: new Date(),
        updated_at: new Date(),
        status: 'in-progress',
        technologies: [],
        tags: []
    };

    mockRepository.addProject.mockResolvedValue(project);
    mockRepository.fetchProjects.mockResolvedValue([project]);

    // Set up initial state
    mockRepository.saveProject(project);

    await taskService.moveTask(fromCol, toCol, 0, 0);

    const projectsByColumn = await mockRepository.fetchProjects();

    expect(projectsByColumn[fromCol]).not.toEqual(expect.arrayContaining([project]));
    expect(projectsByColumn[toCol]).toEqual(expect.arrayContaining([{ ...project, columnId: toCol }]));
  });

  test('should create a new project', async () => {
    const title = 'New Project';
    const description = 'Project Description';

    const mockProject = {
      id: 'new-project-id',
      title,
      description,
      tasks: [],
      created_at: new Date(),
      updated_at: new Date(),
      status: 'planning' as const,
      technologies: [],
      tags: []
    };

    mockRepository.addProject.mockResolvedValue(mockProject);
    mockRepository.fetchProjects.mockResolvedValue([mockProject]);

    const project = await boardService.createProject(title, description);

    expect(project.title).toBe(title);
    expect(project.description).toBe(description);
  });

  test('should update an existing project', async () => {
    const project: Project = {
        id: 'project1',
        title: 'Old Title',
        tasks: [],
        created_at: new Date(),
        updated_at: new Date(),
        status: "in-progress",
        technologies: [],
        tags: [],
        description: '',
    };

    const updatedProject = { ...project, title: 'Updated Title' };

    mockRepository.fetchProjectById.mockResolvedValue(project);
    mockRepository.updateProject.mockResolvedValue(updatedProject);

    const updates = { title: 'Updated Title' };
    const result = await boardService.updateProject(project.id, updates);

    expect(result.title).toBe(updates.title);
  });

  test('should delete a project', async () => {
    const project: Project = {
        id: 'project1',
        title: 'Project to Delete',
        tasks: [],
        created_at: new Date(),
        updated_at: new Date(),
        status: "planning",
        technologies: [],
        tags: []
    };

    mockRepository.fetchProjectById.mockResolvedValue(project);
    mockRepository.deleteProject.mockResolvedValue(undefined);

    await boardService.deleteProject(project.id);

    expect(mockRepository.deleteProject).toHaveBeenCalledWith(project.id);
  });
});