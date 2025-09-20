# Testing Architecture

This document provides a comprehensive overview of the testing strategy, architecture, and tools used across all layers of the kanban portfolio application. The testing approach follows the test pyramid pattern with multiple testing levels and a sophisticated fixture system.

## 🏗️ Testing Philosophy

Our testing strategy is built on these core principles:

- **Test Pyramid**: More unit tests, fewer integration tests, minimal E2E tests
- **Fail Fast**: Catch issues early in development cycle
- **Test Isolation**: Each test is independent and can run in any order
- **Realistic Data**: Comprehensive fixture system for consistent test data
- **Clean Architecture**: Tests respect layer boundaries and dependencies

## 📊 Test Pyramid Structure

```
                    E2E Tests
                 (Real Database)
                /               \
           Integration Tests
          (Mocked Services)
         /                    \
    Unit Tests              Unit Tests
  (Domain Logic)        (Presentation)
```

## 📁 Testing Structure

```
tests/
├── config/                    # Jest configurations for different test types
│   ├── jest.unit.config.js   # Unit test configuration
│   ├── jest.integration.config.js # Integration test configuration
│   └── jest.e2e.config.cjs   # E2E test configuration
├── setup/                     # Test environment setup
│   ├── jest.setup.ts         # Global test setup
│   └── jest.e2e.setup.ts     # E2E specific setup
├── __mocks__/                 # Global mocks and utilities
│   ├── supabaseClient.ts     # Supabase client mock
│   └── nextNavigation.ts     # Next.js navigation mock
├── domain/                    # Domain layer tests
│   ├── entities/             # Entity validation tests
│   ├── services/             # Domain service tests
│   └── repositories/         # Repository interface tests
├── application/               # Application layer tests
│   ├── commands/             # Command handler tests
│   ├── queries/              # Query handler tests
│   └── workflows/            # Complete workflow tests
├── infrastructure/            # Infrastructure layer tests
│   └── repositories/         # Repository implementation tests
├── presentation/              # Presentation layer tests
│   ├── components/           # React component tests
│   ├── pages/               # Next.js page tests
│   └── stores/              # State management tests
├── integration/               # Integration tests (mocked external services)
│   ├── __mocks__/           # Integration-specific mocks
│   ├── setup/               # Integration test setup
│   └── __tests__/           # Integration test suites
├── e2e/                      # End-to-end tests (real services)
│   ├── config/              # E2E Jest configuration
│   ├── setup/               # E2E environment setup
│   ├── fixtures/            # Test data management system
│   ├── utils/               # E2E testing utilities
│   └── __tests__/           # E2E test suites
└── cypress/                  # Cypress E2E tests (future)
```

## 🔧 Test Configurations

### Unit Tests (`config/jest.unit.config.js`)
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],
  testMatch: [
    '<rootDir>/tests/domain/**/*.test.ts',
    '<rootDir>/tests/application/**/*.test.ts',
    '<rootDir>/tests/presentation/**/*.test.ts'
  ],
  clearMocks: true,
  resetMocks: true
};
```

**Features:**
- Fast execution (< 1 second per test)
- Isolated from external dependencies
- Automatic mock clearing between tests
- JSDOM for React component testing

### Integration Tests (`config/jest.integration.config.js`)
```javascript
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/integration/setup/jest.setup.ts'],
  testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
  testTimeout: 10000, // 10 seconds for database operations
  clearMocks: false   // Preserve mocks across tests
};
```

**Features:**
- Mocked external services (Supabase, APIs)
- Real business logic execution
- Database operation simulation
- Moderate execution time (1-5 seconds per test)

### E2E Tests (`config/jest.e2e.config.cjs`)
```javascript
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup/jest.e2e.setup.ts'],
  testMatch: ['<rootDir>/tests/e2e/__tests__/**/*.test.ts'],
  testTimeout: 30000, // 30 seconds for real database operations
  maxWorkers: 1,      // Serial execution to avoid conflicts
  clearMocks: false   // Real implementations, no mocking
};
```

**Features:**
- Real database connections
- Complete system integration
- Performance benchmarking
- Comprehensive fixture system

## 🎯 Layer-Specific Testing

### Domain Layer Testing
**Focus**: Business rules, entity validation, domain services

```typescript
// tests/domain/entities/project.test.ts
describe('Project Entity', () => {
  it('should enforce required fields', () => {
    expect(() => createProject({ title: '' })).toThrow('Title is required');
  });

  it('should validate status transitions', () => {
    const project = createProject({ status: 'planning' });
    expect(canTransitionTo(project, 'completed')).toBe(false);
    expect(canTransitionTo(project, 'in-progress')).toBe(true);
  });
});
```

**Test Patterns:**
- Pure function testing
- Business rule validation
- Domain event verification
- Edge case handling

### Application Layer Testing
**Focus**: Use case orchestration, command/query handling

```typescript
// tests/application/commands/createProject.test.ts
describe('CreateProjectHandler', () => {
  let handler: CreateProjectHandler;
  let mockRepository: MockBoardRepository;

  beforeEach(() => {
    mockRepository = new MockBoardRepository();
    handler = new CreateProjectHandler(mockRepository);
  });

  it('should create project with valid data', async () => {
    const command = new CreateProjectCommand('Test Project');

    await handler.execute(command);

    expect(mockRepository.addProject).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Test Project' })
    );
  });
});
```

**Test Patterns:**
- Mock repository injection
- Command/query validation
- Event emission testing
- Error handling scenarios

### Infrastructure Layer Testing
**Focus**: Repository implementations, external service integration

```typescript
// tests/infrastructure/repositories/supabaseBoardRepository.test.ts
describe('SupabaseBoardRepository', () => {
  let repository: SupabaseBoardRepository;
  let mockSupabase: MockSupabaseClient;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    repository = new SupabaseBoardRepository();
  });

  it('should fetch projects from database', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: [], error: null })
      })
    });

    const projects = await repository.fetchProjects();

    expect(projects).toEqual([]);
    expect(mockSupabase.from).toHaveBeenCalledWith('projects');
  });
});
```

**Test Patterns:**
- External service mocking
- Error handling verification
- Data transformation testing
- Interface contract compliance

### Presentation Layer Testing
**Focus**: Component behavior, user interactions, state management

```typescript
// tests/presentation/components/Board.test.tsx
describe('Board Component', () => {
  it('renders all columns', () => {
    render(<Board />);

    expect(screen.getByText('Ideas')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('opens task creation dialog', async () => {
    render(<Board />);

    await user.click(screen.getAllByLabelText('Add task')[0]);

    expect(screen.getByText('Add Task')).toBeInTheDocument();
  });
});
```

**Test Patterns:**
- User interaction simulation
- Component state testing
- Store integration testing
- Accessibility verification

## 🏗️ Comprehensive Fixture System

### Static Fixtures
**Purpose**: Predefined test data for consistent scenarios

```typescript
// tests/e2e/fixtures/projects/projectFixtures.ts
export const projectFixtures = {
  basic(): Project {
    return {
      id: 'test-project-basic',
      title: 'Basic Test Project',
      status: 'planning'
    };
  },

  extensive(): Project {
    return {
      id: 'test-project-extensive',
      title: 'Complex Project',
      status: 'in-progress',
      technologies: ['React', 'TypeScript', 'Supabase']
    };
  }
};
```

### Dynamic Builders
**Purpose**: Flexible test data creation with fluent interface

```typescript
// tests/e2e/fixtures/projects/projectBuilder.ts
export class ProjectBuilder {
  private project: Partial<Project> = {};

  withTitle(title: string): ProjectBuilder {
    this.project.title = title;
    return this;
  }

  withStatus(status: ProjectStatus): ProjectBuilder {
    this.project.status = status;
    return this;
  }

  asComplex(): ProjectBuilder {
    this.project.technologies = ['React', 'TypeScript', 'Next.js'];
    return this;
  }

  build(): Project {
    return {
      id: `test-${Date.now()}`,
      title: 'Default Project',
      ...this.project
    };
  }
}
```

### Test Scenarios
**Purpose**: Complete workflow testing with setup and cleanup

```typescript
// tests/e2e/fixtures/scenarios/testScenarios.ts
export class TestScenarios {
  constructor(private repository: IBoardRepository) {}

  async createBasicProject(): Promise<{ project: Project; cleanup: () => Promise<void> }> {
    const project = projectFixtures.basic();
    await this.repository.addProject(project);

    return {
      project,
      cleanup: async () => {
        await this.repository.deleteProject(project.id);
      }
    };
  }

  async performanceTest(projectCount: number): Promise<{ metrics: PerformanceMetrics }> {
    const startTime = Date.now();

    // Create multiple projects
    const projects = new ProjectBuilder().buildMany(projectCount);
    await Promise.all(projects.map(p => this.repository.addProject(p)));

    // Measure fetch performance
    const fetchStart = Date.now();
    await this.repository.fetchProjects();
    const fetchTime = Date.now() - fetchStart;

    return {
      metrics: {
        totalTime: Date.now() - startTime,
        fetchTime,
        projectCount
      }
    };
  }
}
```

## 🔧 Test Utilities

### Database Test Utils (`tests/e2e/utils/testUtils.ts`)
```typescript
export class DatabaseTestUtils {
  constructor(private repository: IBoardRepository) {}

  async cleanupTestData(prefix: string = 'test-'): Promise<void> {
    const projects = await this.repository.fetchProjects();
    const testProjects = projects.filter(p => p.id.startsWith(prefix));

    await Promise.all(
      testProjects.map(p => this.repository.deleteProject(p.id))
    );
  }

  async waitForProject(id: string, timeout: number = 5000): Promise<Project> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const projects = await this.repository.fetchProjects();
        const project = projects.find(p => p.id === id);
        if (project) return project;
      } catch (error) {
        // Continue waiting
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error(`Project ${id} not found within ${timeout}ms`);
  }
}
```

### Performance Test Utils
```typescript
export class PerformanceTestUtils {
  static async measureOperation<T>(
    operation: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const startTime = process.hrtime.bigint();
    const result = await operation();
    const endTime = process.hrtime.bigint();

    return {
      result,
      duration: Number(endTime - startTime) / 1_000_000 // Convert to milliseconds
    };
  }

  static async benchmarkConcurrency<T>(
    operation: () => Promise<T>,
    concurrency: number
  ): Promise<{ results: T[]; avgDuration: number; maxDuration: number }> {
    const operations = Array(concurrency).fill(null).map(() =>
      this.measureOperation(operation)
    );

    const measurements = await Promise.all(operations);
    const durations = measurements.map(m => m.duration);

    return {
      results: measurements.map(m => m.result),
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      maxDuration: Math.max(...durations)
    };
  }
}
```

## 🚀 Running Tests

### NPM Scripts
```json
{
  "scripts": {
    "test": "jest --config tests/config/jest.unit.config.js",
    "test:watch": "jest --config tests/config/jest.unit.config.js --watch",
    "test:integration": "jest --config tests/config/jest.integration.config.js",
    "test:e2e": "jest --config tests/e2e/config/jest.e2e.config.cjs",
    "test:all": "npm run test && npm run test:integration && npm run test:e2e",
    "test:coverage": "jest --config tests/config/jest.unit.config.js --coverage"
  }
}
```

### Continuous Integration
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    env:
      TEST_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
      TEST_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:e2e
```

## 📊 Test Metrics and Reporting

### Coverage Goals
- **Unit Tests**: 90%+ coverage for domain and application layers
- **Integration Tests**: 80%+ coverage for infrastructure layer
- **E2E Tests**: 70%+ coverage for critical user workflows

### Performance Benchmarks
- **Unit Tests**: < 1 second per test
- **Integration Tests**: < 5 seconds per test
- **E2E Tests**: < 30 seconds per test
- **Full Test Suite**: < 5 minutes total

### Quality Gates
- All tests must pass before merge
- Coverage thresholds must be maintained
- No new linting warnings
- Performance regressions detected and addressed

## 🔮 Future Enhancements

### Advanced Testing Tools
- **Visual Regression Testing**: Chromatic for component visual testing
- **Contract Testing**: Pact for API contract verification
- **Load Testing**: K6 for performance testing at scale
- **Security Testing**: OWASP ZAP for security vulnerability scanning

### Test Data Management
- **Database Seeding**: Automated test data generation
- **Fixture Versioning**: Support for fixture evolution
- **Data Privacy**: Anonymization for production data testing
- **Test Data APIs**: Dedicated endpoints for test data management

### Monitoring and Analytics
- **Test Metrics Dashboard**: Real-time test execution insights
- **Flaky Test Detection**: Automatic identification of unreliable tests
- **Performance Trending**: Historical test execution time tracking
- **Test Impact Analysis**: Understanding which tests cover which code

This comprehensive testing architecture ensures high code quality, reliable deployments, and maintainable test suites that grow with the application while maintaining fast feedback cycles for developers.