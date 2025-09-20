# Kanban Portfolio Test Architecture Requirements

## Test Layer Separation Structure

This project uses a **layered testing architecture** where each test layer has its own configuration, setup, and responsibilities. This ensures proper separation of concerns and targeted testing at each level.

### 📁 Test Directory Structure

```
tests/
├── config/                    # Shared Jest configurations
├── setup/                     # Shared test setup files
├── domain/                    # Domain layer tests
│   ├── config/               # Domain-specific Jest config
│   ├── setup/                # Domain test setup
│   └── __tests__/            # Domain entity/unit tests
├── e2e/                      # End-to-end tests
│   ├── config/               # E2E-specific Jest config
│   ├── setup/                # E2E test setup
│   └── __tests__/            # E2E test files
├── integration/              # Integration tests
│   ├── config/               # Integration-specific Jest config
│   ├── setup/                # Integration test setup
│   └── __tests__/            # Integration test files
├── presentation/             # Presentation/UI layer tests
│   ├── config/               # Presentation-specific Jest config
│   ├── setup/                # Presentation test setup
│   └── __tests__/            # Component/UI test files
├── services/                 # Service layer tests
│   ├── config/               # Service-specific Jest config
│   ├── setup/                # Service test setup
│   ├── __mocks__/            # Service layer mocks
│   └── __tests__/            # Service integration tests
├── unit/                     # Unit tests
│   ├── config/               # Unit-specific Jest config
│   ├── setup/                # Unit test setup
│   ├── __mocks__/            # Unit test mocks
│   └── __tests__/            # Pure unit test files
└── stories/                  # Storybook tests
    ├── config/               # Storybook-specific config
    └── __tests__/            # Storybook test files
```

### 🎯 Layer Responsibilities

#### **Domain Layer** (`tests/domain/`)
- **Purpose**: Test domain entities, business logic, schemas, and core business rules
- **Scope**: Pure business logic without external dependencies
- **Examples**: Entity validation, schema parsing, domain service logic
- **Config**: Minimal setup, no external mocks needed
- **Dependencies**: None (pure domain logic)

#### **Unit Layer** (`tests/unit/`)
- **Purpose**: Test individual functions, utilities, and isolated components
- **Scope**: Single units with mocked dependencies
- **Examples**: Utility functions, custom hooks, isolated components
- **Config**: Heavy mocking, fast execution
- **Dependencies**: Mocked external services

#### **Services Layer** (`tests/services/`)
- **Purpose**: Test service layer integration with repositories
- **Scope**: Service classes with mocked repositories
- **Examples**: ProjectService, TaskService, BoardService with mock repositories
- **Config**: Repository mocking, async operation testing
- **Dependencies**: Mocked repositories, real service logic

#### **Integration Layer** (`tests/integration/`)
- **Purpose**: Test component integration and data flow
- **Scope**: Multiple components working together
- **Examples**: Component interactions, state management integration
- **Config**: Partial mocking, real component rendering
- **Dependencies**: Real services with mocked external APIs

#### **Presentation Layer** (`tests/presentation/`)
- **Purpose**: Test UI components and user interactions
- **Scope**: React components, user interface logic
- **Examples**: Component rendering, user interactions, UI state
- **Config**: React Testing Library, full DOM rendering
- **Dependencies**: Real components, mocked services

#### **E2E Layer** (`tests/e2e/`)
- **Purpose**: Test complete user journeys and system integration
- **Scope**: Full application flow from user perspective
- **Examples**: User registration, project creation workflow
- **Config**: Playwright/Cypress, real browser environment
- **Dependencies**: Full application stack

### ⚙️ Configuration Requirements

#### **Each Layer MUST Have:**
1. **Dedicated Jest Config**: `config/jest.[layer].config.js`
2. **Layer-Specific Setup**: `setup/jest.[layer].setup.js`
3. **Environment Variables**: `.env.[layer]` for layer-specific config
4. **Mock Directory**: `__mocks__/` for layer-specific mocks
5. **Test Files**: `__tests__/` with layer-appropriate naming

#### **Jest Config Structure** (`config/jest.[layer].config.js`):
```javascript
export default {
  testEnvironment: '[appropriate environment]',
  rootDir: '../../../',  // Adjust based on layer depth
  testMatch: [`<rootDir>/tests/[layer]/__tests__/**/*.test.(ts|tsx|js|jsx)`],
  setupFilesAfterEnv: [`<rootDir>/tests/[layer]/setup/jest.[layer].setup.js`],
  // Layer-specific transforms, mocks, and configurations
};
```

#### **Setup File Structure** (`setup/jest.[layer].setup.js`):
```javascript
// Layer-specific test setup
import '[layer-specific libraries]';

// Global test utilities for this layer
global.[layer]TestUtils = { ... };

// Layer-specific mocks and configurations
```

### 📋 File Naming Conventions

#### **Test Files** (Layer-Specific Naming):
All test files **MUST** include the test layer name in their filename to clearly identify which layer they belong to:

- **Domain**: `*.domain.test.ts` (pure logic tests)
  - Example: `project.domain.test.ts`, `task.domain.test.ts`
- **Unit**: `*.unit.test.ts` (isolated unit tests)
  - Example: `utils.unit.test.ts`, `customHook.unit.test.ts`
- **Services**: `*.services.test.ts` (service integration tests)
  - Example: `boardService.services.test.ts`, `projectService.services.test.ts`
- **Integration**: `*.integration.test.ts` (multi-component tests)
  - Example: `boardWorkflow.integration.test.ts`, `projectCreation.integration.test.ts`
- **Presentation**: `*.presentation.test.tsx` (React component tests)
  - Example: `card.presentation.test.tsx`, `board.presentation.test.tsx`
- **E2E**: `*.e2e.test.ts` (end-to-end tests)
  - Example: `createProject.e2e.test.ts`, `userWorkflow.e2e.test.ts`

#### **Mock Files**:
- Domain: Minimal/no mocks needed
- Unit: `Mock[Dependency].ts`
- Services: `Mock[Repository].ts`
- Integration: `Mock[Service].ts`
- Presentation: `Mock[ExternalService].ts`
- E2E: Real services (no mocks)

### 🔧 Package.json Scripts

```json
{
  "scripts": {
    "test": "jest --config tests/config/jest.config.js",
    "test:domain": "jest --config tests/domain/config/jest.domain.config.js",
    "test:unit": "jest --config tests/unit/config/jest.unit.config.js",
    "test:services": "jest --config tests/services/config/jest.services.config.js",
    "test:integration": "jest --config tests/integration/config/jest.integration.config.js",
    "test:presentation": "jest --config tests/presentation/config/jest.presentation.config.js",
    "test:e2e": "jest --config tests/e2e/config/jest.e2e.config.js",
    "test:all": "npm run test:domain && npm run test:unit && npm run test:services && npm run test:integration && npm run test:presentation && npm run test:e2e"
  }
}
```

### 🎯 Key Principles

1. **Isolation**: Each layer tests only its own responsibilities
2. **Independence**: Layers can run independently with their own configs
3. **Progressive Complexity**: Tests become more complex as you move up layers
4. **Real Dependencies**: Lower layers use real implementations, higher layers use mocks
5. **Clear Boundaries**: No cross-layer dependencies in test execution

### 📝 Current Implementation Status

- ✅ **Domain**: Basic structure exists
- ✅ **Unit**: Basic structure exists
- ✅ **Services**: Mock repository created, integration tests in progress
- 🔄 **Integration**: Structure exists, needs configuration
- 🔄 **Presentation**: Structure exists, needs configuration
- 🔄 **E2E**: Structure exists, needs configuration

### 🚨 Critical Reminders

1. **NEVER** mix test layers - each test belongs to exactly one layer
2. **ALWAYS** use layer-specific configs and setups
3. **ALWAYS** create mocks in the appropriate `__mocks__` directory
4. **NEVER** run tests from different layers together unless explicitly designed for integration
5. **ALWAYS** maintain the directory structure and naming conventions

This architecture ensures maintainable, focused, and efficient testing across all layers of the application.</content>
<parameter name="filePath">e:\_dev\sources\kanban-portfolio\TEST_ARCHITECTURE_REQUIREMENTS.md