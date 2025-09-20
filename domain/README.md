# Domain Layer

The Domain layer is the heart of our Clean Architecture implementation. It contains the business rules, entities, and core logic that define what the application does, independent of any external concerns like databases, UI frameworks, or web APIs.

## 🏗️ Architecture Principles

This layer follows these key Clean Architecture principles:

- **Independence**: No dependencies on external frameworks, UI, or infrastructure
- **Business Rules**: Contains all enterprise business rules and application-specific business rules
- **Stability**: Changes to other layers don't affect the domain
- **Testability**: Pure business logic that's easy to unit test

## 📁 Structure

```
domain/
├── board/           # Board management domain
│   ├── entities/    # Core business entities
│   ├── repositories/# Repository interfaces (dependency inversion)
│   ├── services/    # Domain services for complex business logic
│   ├── events/      # Domain events for business occurrences
│   └── schemas/     # Validation schemas for business rules
└── user/            # User management domain (future)
```

## 🎯 Board Domain

The board domain represents a kanban-style project management system where projects contain tasks.

### Entities

#### Project Entity (`entities/project.ts`)
Represents a software development project with the following business rules:

```typescript
type Project = {
  id: string;                    // Unique identifier
  title: string;                 // Required project name
  description?: string;          // Optional project description
  url?: string;                  // Optional project URL
  status?: ProjectStatus;        // Project lifecycle status
  technologies?: string[];       // Tech stack used
  tags?: string[];              // Categorization tags
  start_date?: Date;            // Project start date
  end_date?: Date;              // Project completion date
  updated_at?: Date;            // Last modification timestamp
}

type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'on-hold';
```

**Business Rules:**
- Every project must have a unique ID and title
- Status follows a logical progression (planning → in-progress → completed)
- Projects can be put on hold at any stage
- Technologies array helps with filtering and portfolio presentation
- Timestamps track project lifecycle for reporting

#### Task Entity (`entities/task.ts`)
Represents work items within projects:

```typescript
type Task = {
  id: string;                    // Unique identifier
  title: string;                 // Required task description
  description?: string;          // Optional detailed description
  url?: string;                  // Optional related URL (PR, issue, etc.)
}
```

**Business Rules:**
- Tasks must belong to a project (enforced at repository level)
- Task IDs are unique across the entire system
- Simple structure allows flexibility in task management
- URLs can link to external resources (GitHub issues, pull requests, etc.)

### Repository Interfaces (`repositories/boardRepository.ts`)

The repository interface defines how the domain interacts with data persistence, following the Dependency Inversion Principle:

```typescript
interface IBoardRepository {
  // Project CRUD operations
  fetchProjects(): Promise<Project[]>;
  addProject(project: Project): Promise<void>;
  updateProject(id: string, updates: Partial<Project>): Promise<void>;
  deleteProject(id: string): Promise<void>;

  // Task CRUD operations
  fetchTasksForProject(projectId: string): Promise<Task[]>;
  addTask(task: Task, projectId: string): Promise<void>;
  updateTask(id: string, updates: Partial<Task>): Promise<void>;
  deleteTask(id: string): Promise<void>;

  // Board-specific operations
  moveTask(taskId: string, fromProjectId: string, toProjectId: string): Promise<void>;
  reorderTasks(projectId: string, taskIds: string[]): Promise<void>;
}
```

**Design Decisions:**

1. **Interface Segregation**: Single repository for board operations (projects + tasks) since they're tightly coupled
2. **Partial Updates**: `updateProject` and `updateTask` use `Partial<T>` for flexible updates
3. **Board Operations**: `moveTask` and `reorderTasks` handle kanban-specific workflows
4. **Async by Design**: All operations are async to support various persistence mechanisms
5. **No Implementation Details**: Interface doesn't specify database, API calls, or storage format

### Domain Services (`services/`)

Domain services handle complex business logic that doesn't naturally fit within a single entity:

- **Project Management**: Validation of project transitions, business rule enforcement
- **Task Orchestration**: Complex task operations across multiple projects
- **Board Logic**: Kanban board rules and constraints

### Domain Events (`events/`)

Events represent important business occurrences:

- `ProjectCreated`: Fired when a new project is added
- `ProjectStatusChanged`: Fired when project status transitions
- `TaskMoved`: Fired when tasks move between projects
- `ProjectCompleted`: Fired when a project reaches completion

**Event Design Pattern:**
- Events are immutable value objects
- They carry minimal necessary data
- Used for auditing, notifications, and triggering side effects
- Processed by application layer event handlers

### Schemas (`schemas/`)

Validation schemas ensure business rule compliance:

- **Project Validation**: Required fields, status transitions, data formats
- **Task Validation**: Required fields, relationship constraints
- **Business Rule Validation**: Complex multi-entity rules

## 🔄 Domain Workflows

### Project Lifecycle
```
Planning → In Progress → Completed
    ↓           ↓
  On Hold ←→ On Hold
```

### Task Management
1. Tasks are created within projects
2. Tasks can be moved between projects (kanban board workflow)
3. Task order can be changed within projects
4. Tasks maintain their identity across moves

## 🧪 Testing Strategy

The domain layer is tested with pure unit tests:

- **Entity Tests**: Validate business rules and invariants
- **Repository Interface Tests**: Verify contract compliance (using mocks)
- **Domain Service Tests**: Test complex business logic
- **Event Tests**: Verify event generation and data integrity

**Test Location**: `tests/domain/`

## 🎯 Design Decisions

### Why TypeScript Types Instead of Classes?
- **Simplicity**: Entities are pure data structures without behavior
- **Immutability**: Encourages functional programming patterns
- **Serialization**: Easy JSON serialization for API and database operations
- **Performance**: No class instantiation overhead

### Why Single Repository Interface?
- **Cohesion**: Projects and tasks are tightly coupled in the kanban domain
- **Atomic Operations**: Some operations need to affect both projects and tasks
- **Simplicity**: Reduces interface proliferation
- **Domain Modeling**: Reflects the real-world kanban board concept

### Why Minimal Entity Design?
- **Flexibility**: Simple entities allow various UI representations
- **Evolution**: Easy to extend without breaking existing code
- **Testing**: Simple structures are easier to test and mock
- **Clean Boundaries**: Clear separation between domain and presentation concerns

## 🔮 Future Considerations

### Planned Extensions
- **User Entity**: Multi-user support with ownership and permissions
- **Board Entity**: Multiple boards per user
- **Advanced Task Properties**: Priority, due dates, assignees, time tracking
- **Project Templates**: Reusable project structures
- **Workflow Automation**: Custom business rules and triggers

### Domain Events Expansion
- **Integration Events**: For external system notifications
- **Audit Events**: For compliance and tracking
- **Analytics Events**: For usage insights and reporting

This domain layer provides a solid foundation for a portfolio kanban application while maintaining clean architecture principles and allowing for future growth and complexity.