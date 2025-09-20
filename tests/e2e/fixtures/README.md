# E2E Test Fixtures

## Purpose
Fixtures provide consistent, reusable test data for E2E database tests.

## Structure
```
fixtures/
├── projects/           # Project entity fixtures
├── tasks/             # Task entity fixtures
├── scenarios/         # Complete test scenarios
├── builders/          # Test data builders
└── index.ts          # Main exports
```

## Usage Patterns

### Simple Fixtures
```typescript
import { projectFixtures } from './fixtures';
const testProject = projectFixtures.basic();
```

### Builders (Dynamic)
```typescript
import { ProjectBuilder } from './fixtures';
const testProject = new ProjectBuilder()
  .withTitle('Custom Title')
  .withStatus('in-progress')
  .build();
```

### Scenarios (Complete Workflows)
```typescript
import { scenarios } from './fixtures';
await scenarios.createProjectWithTasks();
```

## Guidelines
- All fixtures should use deterministic IDs for cleanup
- Include both valid and edge-case data
- Keep fixtures isolated and independent
- Use builders for dynamic test data