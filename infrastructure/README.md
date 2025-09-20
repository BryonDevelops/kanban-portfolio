# Infrastructure Layer

The Infrastructure layer contains all the external concerns and implementation details that support the business logic. This layer implements the interfaces defined in the domain layer and provides concrete implementations for data persistence, external APIs, authentication, and other technical concerns.

## 🏗️ Architecture Principles

This layer follows these key Clean Architecture principles:

- **Dependency Inversion**: Implements interfaces defined in the domain layer
- **Implementation Details**: Contains all framework-specific and technology-specific code
- **Isolation**: Changes here don't affect domain or application layers
- **Pluggability**: Different implementations can be swapped without affecting business logic

## 📁 Structure

```
infrastructure/
├── database/           # Data persistence implementations
│   ├── repositories/   # Domain repository implementations
│   └── migrations/     # Database schema changes
├── auth/              # Authentication providers (future)
├── external-apis/     # External service integrations
│   ├── github/        # GitHub API integration
│   └── vercel/        # Vercel deployment API
└── storage/           # File storage implementations
    └── local/         # Local file storage (future)
```

## 🗄️ Database Layer

### Supabase Implementation

**Technology Choice: Supabase**
- **Rationale**: Full-stack backend with PostgreSQL, real-time features, and built-in auth
- **Benefits**: Rapid development, type-safe client, real-time updates, hosted solution
- **Trade-offs**: Vendor lock-in vs. development speed

### Repository Implementation (`database/repositories/supaBaseBoardRepository.ts`)

Implements the `IBoardRepository` interface with Supabase as the persistence layer:

```typescript
export class SupabaseBoardRepository implements IBoardRepository {
  // Project operations - IMPLEMENTED
  async fetchProjects(): Promise<Project[]>
  async addProject(project: Project): Promise<void>
  async updateProject(id: string, updates: Partial<Project>): Promise<void>
  async deleteProject(id: string): Promise<void>

  // Task operations - TODO: Implementation pending
  fetchTasksForProject(projectId: string): Promise<Task[]>
  addTask(task: Task, projectId: string): Promise<void>
  updateTask(id: string, updates: Partial<Task>): Promise<void>
  deleteTask(id: string): Promise<void>

  // Board operations - TODO: Implementation pending
  moveTask(taskId: string, fromProjectId: string, toProjectId: string): Promise<void>
  reorderTasks(projectId: string, taskIds: string[]): Promise<void>
}
```

**Design Decisions:**

1. **Client Caching**: `getSupabase()` uses a singleton pattern to reuse the client instance
2. **Error Handling**: Supabase errors are propagated to the application layer for proper handling
3. **Type Safety**: Return types match domain entities exactly
4. **Null Safety**: Graceful handling when Supabase client is unavailable
5. **Ordering**: Projects fetched with explicit ordering for consistent UI presentation

### Database Client (`lib/supabaseClient.ts`)

Centralized Supabase client management:

```typescript
export function getSupabase(): SupabaseClient | null {
  // Singleton pattern with environment-based configuration
  // Returns null if environment variables are missing
}
```

**Configuration Strategy:**
- Environment variables for connection details
- Graceful degradation when not configured
- Caching for performance optimization
- Type-safe client creation

### Database Schema Design

**Projects Table Structure:**
```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  status TEXT CHECK (status IN ('planning', 'in-progress', 'completed', 'on-hold')),
  technologies TEXT[], -- PostgreSQL array type
  tags TEXT[],
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  order INTEGER DEFAULT 0 -- For UI ordering
);
```

**Tasks Table Structure (Future):**
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Design Decisions:**
- **String IDs**: Flexible, supports UUIDs or custom ID schemes
- **Array Types**: PostgreSQL native arrays for technologies and tags
- **Cascade Deletes**: Tasks automatically deleted when project is removed
- **Ordering**: Explicit order columns for UI drag-and-drop support
- **Timestamps**: Audit trail for data changes

## 🔌 External APIs

### GitHub Integration (`external-apis/github/`)

**Purpose**: Portfolio project data from GitHub repositories
**Features**:
- Repository metadata fetching
- Commit history analysis
- Technology stack detection
- README content extraction

**Design Pattern**: Adapter pattern to transform GitHub API responses into domain entities

### Vercel Integration (`external-apis/vercel/`)

**Purpose**: Deployment status and URL integration
**Features**:
- Deployment status monitoring
- Live URL extraction
- Build log access
- Performance metrics

## 🔐 Authentication Layer (`auth/`)

**Future Implementation**: Supabase Auth integration
**Planned Features**:
- User registration/login
- Session management
- Role-based access control
- OAuth providers (GitHub, Google)

## 💾 Storage Layer (`storage/`)

### Local Storage (`storage/local/`)
**Purpose**: Development and testing file storage
**Features**:
- Image uploads for project screenshots
- Document storage for project assets
- Temporary file management

**Production Alternative**: Supabase Storage or AWS S3 integration

## 🔄 Data Flow Patterns

### Repository Pattern Implementation
```
Domain Interface → Infrastructure Implementation → External Service
IBoardRepository → SupabaseBoardRepository → Supabase Client
```

### Error Handling Strategy
```typescript
// 1. Supabase errors are caught and thrown as-is
if (error) throw error;

// 2. Application layer catches and transforms errors
// 3. Presentation layer displays user-friendly messages
```

### Configuration Management
```
Environment Variables → Client Configuration → Service Instantiation
NEXT_PUBLIC_SUPABASE_URL → getSupabase() → Repository Operations
```

## 🧪 Testing Strategy

### Integration Tests
**Location**: `tests/integration/`
**Purpose**: Test infrastructure implementations with mocked external services
**Patterns**:
- Mock Supabase client responses
- Test error handling scenarios
- Verify data transformation
- Test repository interface compliance

### E2E Tests
**Location**: `tests/e2e/`
**Purpose**: Test against real external services
**Infrastructure**:
- Test database environment
- Real Supabase connections
- Comprehensive fixture system
- Performance benchmarking

**E2E Test Features**:
- Real database operations
- Data cleanup utilities
- Performance monitoring
- Schema validation
- Concurrent operation testing

## 🎯 Design Decisions

### Why Supabase Over Other Solutions?

**Alternatives Considered:**
- **Raw PostgreSQL**: More control, but requires infrastructure management
- **Firebase**: Good real-time features, but less SQL-friendly
- **PlanetScale**: Excellent scaling, but missing real-time features
- **Supabase**: Best balance of features, developer experience, and hosting

**Decision Factors:**
1. **PostgreSQL Base**: Strong consistency and SQL capabilities
2. **Real-time Support**: Built-in subscriptions for live updates
3. **Type Generation**: Automatic TypeScript types from schema
4. **Authentication**: Integrated auth with multiple providers
5. **Edge Functions**: Serverless compute for complex operations
6. **Self-hosting Option**: Reduces vendor lock-in risk

### Repository Granularity

**Single Repository vs. Multiple Repositories:**
- **Choice**: Single `IBoardRepository` for projects and tasks
- **Rationale**:
  - Strong coupling between projects and tasks in kanban domain
  - Atomic operations often span both entities
  - Simpler dependency injection
  - Reflects real-world board operations

### Error Handling Philosophy

**Transparent Error Propagation:**
- Infrastructure layer doesn't transform errors
- Raw errors provide debugging information
- Application layer handles error interpretation
- Presentation layer manages user experience

**Benefits:**
- Easier debugging and monitoring
- Flexible error handling strategies
- Clear separation of concerns
- Better error logging and analytics

## 🚀 Future Enhancements

### Performance Optimizations
- **Connection Pooling**: For high-traffic scenarios
- **Query Optimization**: Custom SQL for complex operations
- **Caching Layer**: Redis integration for frequently accessed data
- **Read Replicas**: Separate read/write operations

### Monitoring and Observability
- **Metrics Collection**: Database operation timing and success rates
- **Error Tracking**: Centralized error logging with context
- **Performance Monitoring**: Query performance and resource usage
- **Health Checks**: Service availability monitoring

### Security Enhancements
- **Row Level Security**: Database-level access control
- **API Rate Limiting**: Prevent abuse and ensure fair usage
- **Data Encryption**: Sensitive data protection
- **Audit Logging**: Complete operation history for compliance

### Multi-tenancy Support
- **Tenant Isolation**: Data separation for multiple users
- **Resource Quotas**: Per-tenant usage limits
- **Feature Flags**: Tenant-specific feature enablement
- **Backup Strategies**: Tenant-aware data backup and recovery

This infrastructure layer provides a robust foundation for the portfolio application while maintaining clean architecture principles and supporting future growth and scalability needs.