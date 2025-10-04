# E2E Test Fixtures

Reusable data builders and utility functions that keep the E2E suite readable and deterministic.

## Structure
```
fixtures/
|- projects/          # Project fixtures and builders
|- tasks/             # Task fixtures and builders
|- scenarios/         # Higher level workflows (seed project with tasks, etc.)
|- builders/          # Convenience exports for fluent builders
|- index.ts           # Aggregated exports used by tests
```

## Using fixtures
```ts
import { projectFixtures, ProjectBuilder, TestScenarios } from '../fixtures';

// Static data
const project = projectFixtures.basic();

// Fluent builder
const customProject = new ProjectBuilder()
  .withTitle('Portfolio refresh')
  .asCompleted()
  .build();

// Full scenario
await new TestScenarios(boardRepository).projectWithTasks();
```

`TaskBuilder` and `taskFixtures` follow the same pattern for kanban cards.

## Guidelines
- Prefer deterministic IDs (`withId`) when tests need to assert specific values or perform cleanup.
- Keep fixtures independent; they should not make network calls on their own.
- Add new presets sparingly and document their intent in code comments.
- Use scenarios for multi-step flows (for example, creating a project and associated tasks) to avoid duplication across tests.
