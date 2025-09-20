# Services Layer Architecture Requirements

## Overview

The **Services Layer** orchestrates business operations, coordinates between domain entities, and provides a clean API for the presentation layer. This layer contains application services that implement use cases and coordinate domain objects.

## 📁 Directory Structure

```
services/
├── board/                    # Board-related services
│   ├── boardService.ts      # Main board service
│   ├── projectService.ts    # Project operations
│   ├── taskService.ts       # Task operations
│   └── index.ts             # Service exports
├── shared/                  # Shared services
│   ├── validationService.ts # Cross-cutting validation
│   └── index.ts             # Shared exports
└── types/                   # Service-specific types
```

## 🎯 Responsibilities

### **Application Services** (`services/*/`)
- **Purpose**: Orchestrate business operations and use cases
- **Scope**: Coordinate domain objects, handle transactions, manage workflows
- **Examples**: BoardService, ProjectService, TaskService
- **Responsibilities**: Business operation coordination, error handling, transaction management

### **Service Coordination**
- **Purpose**: Manage complex multi-entity operations
- **Scope**: Cross-service coordination, workflow management
- **Examples**: Project creation with initial tasks, board state management
- **Responsibilities**: Service orchestration, data consistency

## 🔄 Layer Interactions

### **Services Layer Boundaries**

#### **What Services Layer CAN Do:**
- ✅ Coordinate domain entities and business logic
- ✅ Manage transactions and data consistency
- ✅ Handle application-specific workflows
- ✅ Implement use cases and business operations
- ✅ Use domain services and repositories
- ✅ Handle errors and logging

#### **What Services Layer CANNOT Do:**
- ❌ Handle HTTP requests/responses
- ❌ Manage UI state or rendering
- ❌ Access external APIs directly (use infrastructure)
- ❌ Perform database operations directly
- ❌ Handle user authentication/authorization

### **Dependencies Flow**
```
Presentation Layer (UI)
    ↓
Services Layer (Orchestration)
    ↓
Domain Layer (Business Logic)
    ↓
Infrastructure Layer (Data Access)
```

## 📋 Service Design Patterns

### **Application Service Pattern**
```typescript
// services/board/boardService.ts
export class BoardService {
  constructor(
    private repository: IBoardRepository,
    private taskService: TaskService,
    private projectService: ProjectService
  ) {}

  async createProjectWithTasks(
    projectData: ProjectCreate,
    initialTasks: TaskCreate[]
  ): Promise<Project> {
    // Transaction-like operation
    const project = await this.projectService.createProject(projectData);

    // Create initial tasks
    for (const taskData of initialTasks) {
      await this.taskService.createTask({
        ...taskData,
        projectId: project.id
      });
    }

    return project;
  }

  async moveProject(projectId: string, newStatus: ProjectStatus): Promise<Project> {
    // Business logic coordination
    const project = await this.projectService.getProjectById(projectId);

    if (!project.canTransitionTo(newStatus)) {
      throw new ServiceError('Invalid status transition');
    }

    return await this.projectService.updateProject(projectId, { status: newStatus });
  }
}
```

### **Domain Service Usage**
```typescript
// services/board/projectService.ts
export class ProjectService {
  constructor(private repository: IBoardRepository) {}

  async createProject(projectData: ProjectCreate): Promise<Project> {
    // Validate input
    const validatedData = ProjectCreateSchema.parse(projectData);

    // Check business rules
    const titleExists = await this.repository.existsByTitle(validatedData.title);
    if (titleExists) {
      throw new ServiceError(`Project with title "${validatedData.title}" already exists`);
    }

    // Create domain entity
    const project = new Project({
      id: nanoid(),
      ...validatedData,
      tasks: [],
      created_at: new Date(),
      updated_at: new Date()
    });

    // Persist
    await this.repository.addProject(project);
    return project;
  }
}
```

## 🎯 Service Categories

### **Entity Services**
- **Purpose**: CRUD operations for specific entities
- **Examples**: ProjectService, TaskService
- **Responsibilities**: Entity lifecycle management, validation, persistence

### **Application Services**
- **Purpose**: Complex business operations spanning multiple entities
- **Examples**: BoardService, WorkflowService
- **Responsibilities**: Use case implementation, coordination, orchestration

### **Cross-Cutting Services**
- **Purpose**: Shared functionality across services
- **Examples**: ValidationService, AuditService
- **Responsibilities**: Common concerns, utilities, shared logic

## 🚫 Error Handling

### **Service Error Types**
```typescript
// services/shared/errors.ts
export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export class ValidationError extends ServiceError {
  constructor(field: string, message: string) {
    super(`Validation failed for ${field}: ${message}`, 'VALIDATION_ERROR', 400);
  }
}

export class NotFoundError extends ServiceError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND', 404);
  }
}
```

### **Error Handling Patterns**
```typescript
// services/board/projectService.ts
export class ProjectService {
  async getProjectById(id: string): Promise<Project> {
    try {
      const project = await this.repository.fetchProjectById(id);
      if (!project) {
        throw new NotFoundError('Project', id);
      }
      return project;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError('Failed to fetch project', 'INTERNAL_ERROR', 500);
    }
  }
}
```

## 🔄 Transaction Management

### **Transactional Operations**
```typescript
// services/board/boardService.ts
export class BoardService {
  async createProjectWithTasks(
    projectData: ProjectCreate,
    taskData: TaskCreate[]
  ): Promise<Project> {
    // Note: In a real implementation, this would use database transactions
    try {
      const project = await this.projectService.createProject(projectData);

      // If task creation fails, we should rollback project creation
      const tasks = [];
      for (const task of taskData) {
        try {
          const createdTask = await this.taskService.createTask({
            ...task,
            projectId: project.id
          });
          tasks.push(createdTask);
        } catch (error) {
          // Rollback: delete created tasks
          for (const createdTask of tasks) {
            await this.taskService.deleteTask(createdTask.id);
          }
          // Rollback: delete project
          await this.projectService.deleteProject(project.id);
          throw error;
        }
      }

      return project;
    } catch (error) {
      throw new ServiceError('Failed to create project with tasks', 'TRANSACTION_FAILED', 500);
    }
  }
}
```

## 🧪 Testing Strategy

### **Test Location**: `tests/services/`
- **Config**: `tests/services/config/jest.services.config.js`
- **Setup**: `tests/services/setup/jest.services.setup.js`

### **Test Types**
- **Unit Tests**: Individual service methods with mocked repositories
- **Integration Tests**: Service coordination and workflows
- **Error Handling Tests**: Error scenarios and edge cases

### **Testing Patterns**
```typescript
// boardService.test.ts
describe('BoardService', () => {
  let mockRepository: MockBoardRepository;
  let projectService: ProjectService;
  let taskService: TaskService;
  let boardService: BoardService;

  beforeEach(() => {
    mockRepository = new MockBoardRepository();
    projectService = new ProjectService(mockRepository);
    taskService = new TaskService(mockRepository);
    boardService = new BoardService(mockRepository, taskService, projectService);
  });

  describe('createProjectWithTasks', () => {
    it('should create project and tasks successfully', async () => {
      const projectData = { title: 'Test Project' };
      const taskData = [{ title: 'Task 1' }, { title: 'Task 2' }];

      const result = await boardService.createProjectWithTasks(projectData, taskData);

      expect(result.title).toBe('Test Project');
      expect(mockRepository.getProjects()).toHaveLength(1);
      expect(mockRepository.getTasks()[result.id]).toHaveLength(2);
    });

    it('should rollback on task creation failure', async () => {
      // Mock task service to fail
      jest.spyOn(taskService, 'createTask').mockRejectedValue(new Error('Task failed'));

      const projectData = { title: 'Test Project' };
      const taskData = [{ title: 'Task 1' }];

      await expect(boardService.createProjectWithTasks(projectData, taskData))
        .rejects.toThrow('Task failed');

      // Verify rollback
      expect(mockRepository.getProjects()).toHaveLength(0);
    });
  });
});
```

## 🚫 Critical Restrictions

### **No Infrastructure Dependencies**
- **NO** direct database access
- **NO** external API calls
- **NO** file system operations
- **NO** HTTP client usage

### **No Presentation Dependencies**
- **NO** React components or hooks
- **NO** UI state management
- **NO** rendering logic
- **NO** user interface concerns

### **Pure Business Logic**
- **Business rules** should be in domain layer
- **Services** coordinate, don't implement business logic
- **Validation** should use domain schemas
- **Error handling** should be service-appropriate

## 📝 Development Guidelines

### **Service Development**
1. **Define Interface**: Clear public API for the service
2. **Dependency Injection**: Accept dependencies in constructor
3. **Error Handling**: Comprehensive error handling and logging
4. **Transaction Safety**: Ensure data consistency
5. **Test Coverage**: Comprehensive unit and integration tests

### **Service Organization**
1. **Single Responsibility**: Each service has one clear purpose
2. **Interface Segregation**: Small, focused interfaces
3. **Dependency Inversion**: Depend on abstractions, not concretions
4. **Error Propagation**: Meaningful error messages and codes

This services layer architecture ensures clean orchestration of business operations while maintaining separation of concerns.</content>
<parameter name="filePath">e:\_dev\sources\kanban-portfolio\services\SERVICES_LAYER_REQUIREMENTS.md