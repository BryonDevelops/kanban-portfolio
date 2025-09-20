# Infrastructure Layer Architecture Requirements

## Overview

The **Infrastructure Layer** handles external concerns such as data persistence, external API communication, and framework-specific implementations. This layer contains concrete implementations of repository interfaces and external service integrations.

## 📁 Directory Structure

```
infrastructure/
├── database/                # Database implementations
│   ├── supabase/           # Supabase-specific implementations
│   │   ├── repositories/   # Repository implementations
│   │   │   ├── boardRepository.ts
│   │   │   ├── projectRepository.ts
│   │   │   └── taskRepository.ts
│   │   ├── client.ts       # Supabase client configuration
│   │   └── migrations/     # Database migrations
│   └── types/              # Database-specific types
├── external/               # External API integrations
│   ├── github/            # GitHub API integration
│   ├── slack/             # Slack integration
│   └── email/             # Email service integration
├── storage/                # File storage implementations
│   ├── local/             # Local file storage
│   └── cloud/             # Cloud storage (AWS S3, etc.)
├── config/                 # Configuration management
│   ├── environment.ts     # Environment variable handling
│   └── database.ts        # Database configuration
└── shared/                 # Shared infrastructure utilities
    ├── logging/           # Logging infrastructure
    ├── caching/           # Caching implementations
    └── monitoring/        # Monitoring and metrics
```

## 🎯 Responsibilities

### **Repository Implementations** (`infrastructure/*/repositories/`)
- **Purpose**: Concrete implementations of repository interfaces
- **Scope**: Database operations, data mapping, query execution
- **Examples**: SupabaseBoardRepository, MongoBoardRepository
- **Responsibilities**: Data persistence, query optimization, connection management

### **External Integrations** (`infrastructure/external/`)
- **Purpose**: Third-party service integrations
- **Scope**: API clients, webhooks, external service communication
- **Examples**: GitHub API client, Slack notifications
- **Responsibilities**: API authentication, rate limiting, error handling

### **Configuration Management** (`infrastructure/config/`)
- **Purpose**: Environment and configuration handling
- **Scope**: Environment variables, secrets, configuration validation
- **Examples**: Database URLs, API keys, feature flags
- **Responsibilities**: Configuration loading, validation, security

## 🔄 Layer Interactions

### **Infrastructure Layer Boundaries**

#### **What Infrastructure Layer CAN Do:**
- ✅ Implement repository interfaces from domain layer
- ✅ Handle database connections and queries
- ✅ Integrate with external APIs and services
- ✅ Manage file storage and retrieval
- ✅ Handle configuration and environment variables
- ✅ Implement caching and performance optimizations
- ✅ Provide logging and monitoring

#### **What Infrastructure Layer CANNOT Do:**
- ❌ Contain business logic (belongs in domain)
- ❌ Handle HTTP requests/responses (belongs in presentation)
- ❌ Manage UI state or rendering
- ❌ Implement application workflows (belongs in services)
- ❌ Define business entities or schemas

### **Dependencies Flow**
```
Presentation Layer (UI)
    ↓
Services Layer (Orchestration)
    ↓
Domain Layer (Business Logic)
    ↓
Infrastructure Layer (External Concerns)
```

## 📋 Repository Implementation Patterns

### **Repository Implementation**
```typescript
// infrastructure/database/supabase/repositories/boardRepository.ts
export class SupabaseBoardRepository implements IBoardRepository {
  constructor(private supabase: SupabaseClient) {}

  async addProject(project: Project): Promise<void> {
    const { error } = await this.supabase
      .from('projects')
      .insert(this.mapProjectToDb(project));

    if (error) {
      throw new InfrastructureError('Failed to add project', error);
    }
  }

  async fetchProjectById(id: string): Promise<Project | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new InfrastructureError('Failed to fetch project', error);
    }

    return this.mapDbToProject(data);
  }

  async fetchProjects(): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new InfrastructureError('Failed to fetch projects', error);
    }

    return data.map(this.mapDbToProject);
  }

  // ... other methods

  private mapProjectToDb(project: Project): DbProject {
    return {
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      technologies: project.technologies,
      tags: project.tags,
      created_at: project.created_at.toISOString(),
      updated_at: project.updated_at.toISOString()
    };
  }

  private mapDbToProject(dbProject: DbProject): Project {
    return new Project(
      dbProject.id,
      dbProject.title,
      dbProject.description,
      dbProject.status as ProjectStatus,
      dbProject.technologies || [],
      dbProject.tags || [],
      [], // Tasks loaded separately
      new Date(dbProject.created_at),
      new Date(dbProject.updated_at)
    );
  }
}
```

### **Data Mapping**
```typescript
// infrastructure/database/supabase/types/project.ts
export interface DbProject {
  id: string;
  title: string;
  description?: string;
  status: string;
  technologies: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface DbTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  order: number;
  project_id: string;
  created_at: string;
  updated_at?: string;
}
```

## 🔌 External API Integration

### **API Client Pattern**
```typescript
// infrastructure/external/github/githubClient.ts
export class GitHubClient {
  constructor(private token: string) {}

  async getUserRepos(username: string): Promise<GitHubRepo[]> {
    try {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!response.ok) {
        throw new ExternalApiError('GitHub API error', response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ExternalApiError) throw error;
      throw new InfrastructureError('Failed to fetch GitHub repos', error);
    }
  }

  async createIssue(repo: string, title: string, body: string): Promise<GitHubIssue> {
    // Implementation for creating GitHub issues
  }
}
```

### **Integration Service**
```typescript
// infrastructure/external/github/githubIntegration.ts
export class GitHubIntegration {
  constructor(private client: GitHubClient) {}

  async syncProjectRepos(projectId: string): Promise<void> {
    // Business logic for syncing project with GitHub repos
    const project = await this.projectService.getProjectById(projectId);
    const repos = await this.client.getUserRepos(project.githubUsername);

    // Update project with repo information
    await this.projectService.updateProject(projectId, {
      repositories: repos.map(repo => repo.name)
    });
  }
}
```

## ⚙️ Configuration Management

### **Environment Configuration**
```typescript
// infrastructure/config/environment.ts
export interface AppConfig {
  database: {
    url: string;
    key: string;
  };
  external: {
    github: {
      token: string;
    };
    slack: {
      webhook: string;
    };
  };
  features: {
    githubIntegration: boolean;
    slackNotifications: boolean;
  };
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): AppConfig {
    return {
      database: {
        url: this.getEnvVar('SUPABASE_URL'),
        key: this.getEnvVar('SUPABASE_ANON_KEY')
      },
      external: {
        github: {
          token: this.getEnvVar('GITHUB_TOKEN')
        },
        slack: {
          webhook: this.getEnvVar('SLACK_WEBHOOK')
        }
      },
      features: {
        githubIntegration: this.getEnvVar('ENABLE_GITHUB_INTEGRATION', 'false') === 'true',
        slackNotifications: this.getEnvVar('ENABLE_SLACK_NOTIFICATIONS', 'false') === 'true'
      }
    };
  }

  private getEnvVar(key: string, defaultValue?: string): string {
    const value = process.env[key];
    if (!value && !defaultValue) {
      throw new Error(`Environment variable ${key} is required`);
    }
    return value || defaultValue!;
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }
}
```

## 🚫 Error Handling

### **Infrastructure Error Types**
```typescript
// infrastructure/shared/errors.ts
export class InfrastructureError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
    public readonly code: string = 'INFRASTRUCTURE_ERROR'
  ) {
    super(message);
    this.name = 'InfrastructureError';
  }
}

export class DatabaseError extends InfrastructureError {
  constructor(message: string, public readonly originalError: any) {
    super(message, originalError, 'DATABASE_ERROR');
  }
}

export class ExternalApiError extends InfrastructureError {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly response?: any
  ) {
    super(message, undefined, 'EXTERNAL_API_ERROR');
  }
}

export class ConfigurationError extends InfrastructureError {
  constructor(message: string, public readonly configKey: string) {
    super(message, undefined, 'CONFIGURATION_ERROR');
  }
}
```

## 🔄 Connection Management

### **Database Connection**
```typescript
// infrastructure/database/supabase/client.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class SupabaseClientManager {
  private static instance: SupabaseClientManager;
  private client: SupabaseClient;

  private constructor() {
    const config = ConfigManager.getInstance().getConfig();
    this.client = createClient(config.database.url, config.database.key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  static getInstance(): SupabaseClientManager {
    if (!SupabaseClientManager.instance) {
      SupabaseClientManager.instance = new SupabaseClientManager();
    }
    return SupabaseClientManager.instance;
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.client.from('projects').select('count').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
}
```

## 🧪 Testing Strategy

### **Test Location**: `tests/integration/`
- **Config**: `tests/integration/config/jest.integration.config.js`
- **Setup**: `tests/integration/setup/jest.integration.setup.js`

### **Test Types**
- **Repository Tests**: Database operations with test database
- **Integration Tests**: External API integrations
- **Infrastructure Tests**: Configuration, connections, error handling

### **Testing Patterns**
```typescript
// boardRepository.integration.test.ts
describe('SupabaseBoardRepository', () => {
  let repository: SupabaseBoardRepository;
  let testClient: SupabaseClient;

  beforeEach(() => {
    // Use test database
    testClient = createClient(testDbUrl, testDbKey);
    repository = new SupabaseBoardRepository(testClient);
  });

  afterEach(async () => {
    // Clean up test data
    await testClient.from('projects').delete().neq('id', '');
    await testClient.from('tasks').delete().neq('id', '');
  });

  describe('addProject', () => {
    it('should add project to database', async () => {
      const project = new Project('id', 'Test Project', 'Description', ProjectStatus.Planning);

      await repository.addProject(project);

      const saved = await repository.fetchProjectById('id');
      expect(saved?.title).toBe('Test Project');
    });
  });
});
```

## 🚫 Critical Restrictions

### **No Business Logic**
- **NO** business rules or domain logic
- **NO** validation beyond data integrity
- **NO** business workflows or orchestration

### **No Presentation Concerns**
- **NO** UI components or rendering
- **NO** HTTP request/response handling
- **NO** user interface state management

### **External Dependencies Only**
- **Infrastructure** should only handle external concerns
- **Business logic** belongs in domain layer
- **Orchestration** belongs in services layer

## 📝 Development Guidelines

### **Repository Development**
1. **Implement Interface**: Fulfill domain repository contracts
2. **Error Handling**: Comprehensive error handling and logging
3. **Data Mapping**: Clean mapping between domain and infrastructure models
4. **Performance**: Optimize queries and connections
5. **Testing**: Integration tests with real databases

### **Integration Development**
1. **API Contracts**: Clear API client interfaces
2. **Error Handling**: Robust error handling for external services
3. **Rate Limiting**: Implement rate limiting and retry logic
4. **Monitoring**: Add logging and monitoring for integrations

### **Configuration Development**
1. **Security**: Secure handling of secrets and sensitive data
2. **Validation**: Validate configuration on startup
3. **Documentation**: Document all configuration options
4. **Environment**: Support multiple environments (dev, staging, prod)

This infrastructure layer architecture ensures clean separation of external concerns from business logic.</content>
<parameter name="filePath">e:\_dev\sources\kanban-portfolio\infrastructure\INFRASTRUCTURE_LAYER_REQUIREMENTS.md