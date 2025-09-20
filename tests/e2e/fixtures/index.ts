// Main exports for E2E test fixtures
// This provides a clean API for importing fixtures in tests

// Static fixtures
export { projectFixtures } from './projects/projectFixtures';
export { taskFixtures } from './tasks/taskFixtures';

// Dynamic builders
export { ProjectBuilder } from './projects/projectBuilder';
export { TaskBuilder } from './tasks/taskBuilder';

// Complete scenarios
export { TestScenarios } from './scenarios/testScenarios';

// Convenience exports
export * from './builders';

// Usage examples:
// import { projectFixtures, ProjectBuilder, TestScenarios } from '../fixtures';
//
// const basicProject = projectFixtures.basic();
// const customProject = new ProjectBuilder().withTitle('Custom').build();
// const scenarios = new TestScenarios(repository);