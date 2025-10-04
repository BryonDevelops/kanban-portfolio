# Test Suite

Automated tests cover the application from pure domain logic to full-stack Supabase interactions. The suite follows a test pyramid: fast unit tests build confidence, integration tests validate adapters, and a thin E2E layer checks real infrastructure.

## Directory overview
```
tests/
|- unit/           # Component/unit tests (Jest + RTL)
|- domain/         # Pure domain/service contracts
|- services/       # Application service behaviour
|- presentation/   # UI-focused tests and Storybook stories
|- integration/    # Infrastructure adapters with mocked externals
|- e2e/            # End-to-end tests against real Supabase
|- config/         # Shared Jest/Vitest config (per folder)
```

## Tooling
- **Jest 30** with `--experimental-vm-modules` to support ESM.
- **React Testing Library** for component tests.
- **Vitest** config files exist for optional migration to Vitest; Jest remains the primary runner.
- **Supabase Test Env**: E2E tests connect to a dedicated Supabase project via `TEST_SUPABASE_*`.
- **Custom fixtures/builders** in `tests/e2e/fixtures` and `tests/unit/__mocks__`.

## Commands
| Command | Suite | Notes |
| --- | --- | --- |
| `npm run test:unit` | Unit & presentation tests | Uses `tests/unit/config/jest.unit.config.cjs`. |
| `npm run test:domain` | Domain-only tests | Focuses on pure business logic. |
| `npm run test:services` | Service layer tests | Verifies orchestration and validation. |
| `npm run test:integration` | Infrastructure adapters | Requires Supabase mocked responses. |
| `npm run test:presentation` | UI components | Uses React Testing Library. |
| `npm run test:e2e` | Real Supabase interactions | Requires `TEST_SUPABASE_*`. |
| `npm run test:watch_unit`, `test:watch_services`, `test:watch_e2e` | Watch modes for active development. |

Combine suites with shell scripts or use `npm run test:unit && npm run test:services` during CI locally.

## Environment setup
Set these variables before running integration or E2E suites:

```
TEST_SUPABASE_URL=https://your-test-project.supabase.co
TEST_SUPABASE_ANON_KEY=anon-key
TEST_SUPABASE_SERVICE_ROLE_KEY=service-role
```

The E2E setup file (`tests/e2e/setup/jest.e2e.setup.ts`) maps the `TEST_` prefixed values to the application runtime env vars so repositories use the correct database.

## Writing tests
- Co-locate mocks in the relevant `__mocks__` directory and prefer factory functions over raw literals.
- Leverage builders in `tests/e2e/fixtures` for complex Supabase payloads.
- Prefer unit/domain tests for pure logic; only reach for integration/E2E when verifying data contracts or migrations.
- Clean up created data in E2E tests to keep the test project reusable.

## Continuous integration
The GitHub Actions workflow (`.github/workflows/ci.yml`) runs linting, unit, services, and integration tests on every push. Configure the repository secrets `TEST_SUPABASE_URL` and `TEST_SUPABASE_ANON_KEY` if you enable the E2E job in CI.

For additional context see `tests/e2e/README.md` and `tests/e2e/FIXTURES.md`.
