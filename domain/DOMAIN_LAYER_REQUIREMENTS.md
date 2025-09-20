# Domain Layer Architecture Requirements

## Overview

The **Domain Layer** contains the core business logic, entities, and rules that are independent of any external frameworks or technologies. This layer represents the "pure business" aspects of the application.

## 📁 Directory Structure

```
domain/
├── board/                    # Board domain logic
│   ├── entities/            # Domain entities
│   │   ├── project.ts       # Project entity
│   │   ├── task.ts          # Task entity
│   │   └── board.ts         # Board entity
│   ├── schemas/             # Validation schemas
│   │   ├── project.schema.ts
│   │   ├── task.schema.ts
│   │   └── board.schema.ts
│   ├── repositories/        # Repository interfaces
│   │   └── boardRepository.interface.ts
│   ├── services/            # Domain services
│   │   └── boardDomainService.ts
│   └── value-objects/       # Value objects
│       ├── status.ts        # Project/Task status
│       └── priority.ts      # Task priority
├── shared/                  # Shared domain concepts
│   ├── entities/           # Base entities
│   ├── value-objects/      # Common value objects
│   └── errors/             # Domain errors
└── types/                   # Domain-specific types
```

## 🎯 Responsibilities

### **Entities** (`domain/*/entities/`)
- **Purpose**: Represent core business concepts
- **Scope**: Data structures, business rules, entity relationships
- **Examples**: Project, Task, Board entities with their business logic
- **Responsibilities**: Entity validation, business rule enforcement

### **Schemas** (`domain/*/schemas/`)
- **Purpose**: Define data validation and structure
- **Scope**: Zod schemas for runtime validation
- **Examples**: ProjectCreateSchema, TaskUpdateSchema
- **Responsibilities**: Input validation, type safety

### **Repository Interfaces** (`domain/*/repositories/`)
- **Purpose**: Define data access contracts
- **Scope**: Interface definitions for data operations
- **Examples**: IBoardRepository, IProjectRepository
- **Responsibilities**: Data access abstraction

### **Domain Services** (`domain/*/services/`)
- **Purpose**: Complex business logic that spans multiple entities
- **Scope**: Business rules, calculations, domain logic
- **Examples**: BoardDomainService for board-specific business rules
- **Responsibilities**: Cross-entity business logic

### **Value Objects** (`domain/*/value-objects/`)
- **Purpose**: Immutable objects representing concepts
- **Scope**: Status, Priority, Email, etc.
- **Examples**: ProjectStatus, TaskPriority
- **Responsibilities**: Type safety, immutability

## 🔄 Layer Interactions

### **Domain Layer Boundaries**

#### **What Domain Layer CAN Do:**
- ✅ Define business entities and their relationships
- ✅ Implement business rules and validations
- ✅ Create value objects and domain primitives
- ✅ Define repository interfaces
- ✅ Implement domain services
- ✅ Use other domain layer components

#### **What Domain Layer CANNOT Do:**
- ❌ Access external APIs or databases
- ❌ Use framework-specific code (React, Express, etc.)
- ❌ Handle HTTP requests/responses
- ❌ Manage UI state or rendering
- ❌ Perform I/O operations

### **Dependencies Flow**
```
Domain Layer (Pure Business Logic)
    ↑
Services Layer (Orchestrates Domain)
    ↑
Infrastructure Layer (Implements Interfaces)
    ↑
Presentation Layer (Uses Services)
```

## 📋 Entity Design Principles

### **Entity Structure**
```typescript
// domain/board/entities/project.ts
export class Project {
  constructor(
    public readonly id: string,
    public title: string,
    public description?: string,
    public status: ProjectStatus,
    public technologies: string[],
    public tags: string[],
    public tasks: Task[],
    public readonly created_at: Date,
    public updated_at: Date
  ) {}

  // Business methods
  public canTransitionTo(newStatus: ProjectStatus): boolean {
    // Business rule implementation
  }

  public addTask(task: Task): void {
    // Business rule validation
  }

  public updateTitle(newTitle: string): void {
    if (!newTitle.trim()) {
      throw new DomainError('Title cannot be empty');
    }
    this.title = newTitle.trim();
    this.updated_at = new Date();
  }
}
```

### **Schema Validation**
```typescript
// domain/board/schemas/project.schema.ts
export const ProjectCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  status: z.enum(['planning', 'in-progress', 'completed', 'on-hold']),
  technologies: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([])
});

export type ProjectCreate = z.infer<typeof ProjectCreateSchema>;
```

### **Repository Interface**
```typescript
// domain/board/repositories/boardRepository.interface.ts
export interface IBoardRepository {
  // Project operations
  addProject(project: Project): Promise<void>;
  fetchProjectById(id: string): Promise<Project | null>;
  fetchProjects(): Promise<Project[]>;
  updateProject(id: string, project: Project): Promise<void>;
  deleteProject(id: string): Promise<void>;

  // Task operations
  addTask(task: Task): Promise<void>;
  fetchTasks(): Promise<Record<string, Task[]>>;
  updateTask(id: string, task: Task): Promise<void>;
  deleteTask(id: string): Promise<void>;
}
```

## 🎯 Business Rules Implementation

### **Entity Business Rules**
- **Projects**: Cannot have duplicate titles, status transitions must be valid
- **Tasks**: Must belong to a project, status transitions follow workflow
- **Board**: Manages project and task relationships

### **Validation Rules**
- **Required Fields**: Title for projects/tasks
- **Length Limits**: Reasonable limits on text fields
- **Status Transitions**: Valid state changes only
- **Relationships**: Proper entity relationships

### **Domain Services**
```typescript
// domain/board/services/boardDomainService.ts
export class BoardDomainService {
  public canMoveProject(project: Project, newStatus: ProjectStatus): boolean {
    // Complex business logic for project movement
  }

  public validateBoardState(projects: Project[], tasks: Task[]): ValidationResult {
    // Cross-entity validation
  }
}
```

## 🧪 Testing Strategy

### **Test Location**: `tests/domain/`
- **Config**: `tests/domain/config/jest.domain.config.js`
- **Setup**: `tests/domain/setup/jest.domain.setup.js`

### **Test Types**
- **Entity Tests**: Business logic, validation, methods
- **Schema Tests**: Validation rules, type safety
- **Domain Service Tests**: Complex business logic
- **Value Object Tests**: Immutability, equality

### **Testing Patterns**
```typescript
// project.test.ts
describe('Project Entity', () => {
  it('should not allow empty title', () => {
    expect(() => new Project('', 'desc', ProjectStatus.Planning))
      .toThrow(DomainError);
  });

  it('should allow valid status transition', () => {
    const project = new Project('id', 'title', 'desc', ProjectStatus.Planning);
    expect(project.canTransitionTo(ProjectStatus.InProgress)).toBe(true);
  });
});
```

## 🚫 Critical Restrictions

### **Framework Independence**
- **NO** React, Vue, or UI framework code
- **NO** Express, Fastify, or HTTP framework code
- **NO** Database-specific code (SQL, MongoDB queries)
- **NO** External API calls
- **NO** File system operations

### **Pure Functions**
- **Business logic** should be pure and testable
- **Side effects** should be abstracted behind interfaces
- **Dependencies** should be injected, not imported

### **No External Dependencies**
- **NO** npm packages except validation libraries (Zod)
- **NO** Node.js built-ins except basic types
- **NO** Framework-specific utilities

## 📝 Development Guidelines

### **Entity Development**
1. **Define Properties**: Identify required and optional properties
2. **Add Business Methods**: Implement business logic methods
3. **Create Validation**: Add input validation and business rules
4. **Write Tests**: Comprehensive unit tests for all logic

### **Schema Development**
1. **Define Structure**: Create Zod schemas for all inputs
2. **Add Validation**: Business rule validation
3. **Type Generation**: Generate TypeScript types
4. **Test Validation**: Comprehensive validation tests

### **Repository Interface Development**
1. **Define Operations**: CRUD operations needed
2. **Type Safety**: Strong typing for all operations
3. **Error Handling**: Define error scenarios
4. **Documentation**: Clear interface documentation

This domain layer architecture ensures business logic remains pure, testable, and independent of external concerns.</content>
<parameter name="filePath">e:\_dev\sources\kanban-portfolio\domain\DOMAIN_LAYER_REQUIREMENTS.md