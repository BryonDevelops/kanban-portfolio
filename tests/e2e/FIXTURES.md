# E2E Test Fixtures Structure

## Complete File Structure

```
tests/e2e/
├── README.md                           # E2E testing overview
├── config/
│   └── jest.config.cjs                # E2E Jest configuration
├── setup/
│   └── jest.setup.ts                  # E2E test environment setup
├── fixtures/                          # 🎯 Test data fixtures
│   ├── README.md                      # Fixtures documentation
│   ├── index.ts                       # Main fixture exports
│   ├── projects/
│   │   ├── projectFixtures.ts         # Static project test data
│   │   └── projectBuilder.ts          # Dynamic project builder
│   ├── tasks/
│   │   ├── taskFixtures.ts            # Static task test data
│   │   └── taskBuilder.ts             # Dynamic task builder
│   ├── scenarios/
│   │   └── testScenarios.ts           # Complete workflow scenarios
│   └── builders/
│       └── index.ts                   # Builder re-exports
├── utils/
│   └── testUtils.ts                   # Database utilities & helpers
└── __tests__/
    └── repositories/
        └── supabaseBoardRepository.e2e.test.ts  # Actual E2E tests
```

## Usage Examples

### 1. Static Fixtures (Quick & Simple)
```typescript
import { projectFixtures, taskFixtures } from '../fixtures';

// Get predefined test data
const basicProject = projectFixtures.basic();
const complexProject = projectFixtures.extensive();
const planningProject = projectFixtures.planning();

const basicTask = taskFixtures.basic();
const bugTask = taskFixtures.bugFix();
```

### 2. Dynamic Builders (Flexible & Customizable)
```typescript
import { ProjectBuilder, TaskBuilder } from '../fixtures';

// Build custom test data
const customProject = new ProjectBuilder()
  .withTitle('My Custom Project')
  .withStatus('in-progress')
  .withTechnologies(['React', 'TypeScript'])
  .asComplex()
  .build();

const customTask = new TaskBuilder()
  .withTitle('Custom Task')
  .asBugFix()
  .withTestPrefix('crud-test')
  .build();

// Build multiple variations
const projects = new ProjectBuilder()
  .buildMany(5, (builder, index) => {
    builder.withTitle(`Project ${index + 1}`);
  });
```

### 3. Complete Scenarios (Full Workflows)
```typescript
import { TestScenarios } from '../fixtures';

const scenarios = new TestScenarios(repository);

// Run complete workflow scenarios
const { project, cleanup } = await scenarios.createBasicProject();
const { projects, cleanup: cleanupMulti } = await scenarios.createMultipleProjects(10);
const { metrics } = await scenarios.performanceTest(50);
```

### 4. Database Utilities (Helper Functions)
```typescript
import { DatabaseTestUtils } from '../utils/testUtils';

const dbUtils = new DatabaseTestUtils(repository);

// Clean up test data
await dbUtils.cleanupTestData('e2e-');

// Wait for operations
await dbUtils.waitForProject(projectId);
await dbUtils.waitForProjectDeletion(projectId);

// Measure performance
const { result, duration } = await dbUtils.measureOperation(() =>
  repository.fetchProjects()
);
```

## Fixture Types

### Static Fixtures
- **Purpose**: Predefined, consistent test data
- **When to use**: Standard test cases, regression testing
- **Benefits**: Fast, consistent, easy to use

### Dynamic Builders
- **Purpose**: Customizable test data creation
- **When to use**: Complex scenarios, parameterized tests
- **Benefits**: Flexible, composable, reusable

### Test Scenarios
- **Purpose**: Complete workflow testing
- **When to use**: Integration testing, end-to-end flows
- **Benefits**: Realistic workflows, automatic cleanup

## Best Practices

### 1. Naming Conventions
- Fixtures: `e2e-[type]-[timestamp]-[random]`
- Tests: Use descriptive prefixes for easy cleanup
- Files: `[entity]Fixtures.ts`, `[entity]Builder.ts`

### 2. Cleanup Strategy
```typescript
// Always use try/finally for cleanup
try {
  const testProject = projectFixtures.basic();
  await repository.addProject(testProject);
  // ... test logic
} finally {
  await repository.deleteProject(testProject.id);
}

// Or use scenarios with built-in cleanup
const { project, cleanup } = await scenarios.createBasicProject();
try {
  // ... test logic
} finally {
  await cleanup();
}
```

### 3. Data Isolation
- Each test gets unique IDs (timestamp + random)
- Tests don't depend on external data
- Cleanup removes only test-specific data

### 4. Performance Considerations
- Use batch operations for multiple items
- Implement retry logic for network issues
- Measure and assert performance thresholds

## Configuration

### Environment Variables (.env.e2e.local)
```env
TEST_SUPABASE_URL=https://your-test-project.supabase.co
TEST_SUPABASE_ANON_KEY=your-test-anon-key
TEST_SUPABASE_SERVICE_ROLE_KEY=your-test-service-role-key
```

### npm Scripts
```json
{
  "test:e2e": "jest --config tests/e2e/config/jest.config.cjs",
  "test:e2e:watch": "jest --config tests/e2e/config/jest.config.cjs --watch",
  "test:e2e:cleanup": "node scripts/cleanup-test-data.js"
}
```

This fixtures structure provides comprehensive support for all your E2E testing needs while maintaining clean separation and reusability! 🎉