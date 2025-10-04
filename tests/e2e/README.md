# E2E Tests

End-to-end tests exercise the application against a real Supabase project to verify schema compatibility, data access rules, and higher level workflows (kanban board management, admin feature flags).

## Structure
```
tests/e2e/
|- __tests__/         # Test suites (board, admin, etc.)
|- config/            # jest.e2e.config.cjs and cypress.config.js
|- fixtures/          # Static fixtures, builders, and scenarios
|- setup/             # Global setup/teardown for Jest
|- utils/             # Helper functions (Supabase clients, cleanup, assertions)
|- FIXTURES.md        # Additional fixture documentation
```

## Requirements
- A dedicated Supabase project for testing (never reuse production data).
- Environment variables (set locally or in CI):

```
TEST_SUPABASE_URL=https://your-test-project.supabase.co
TEST_SUPABASE_ANON_KEY=anon-key
TEST_SUPABASE_SERVICE_ROLE_KEY=service-role # required for cleanup helpers
```

`tests/e2e/setup/jest.e2e.setup.ts` maps these to `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` so the regular repositories work without code changes.

## Running the suite
```bash
npm run test:e2e
```

- Tests run serially (`maxWorkers: 1`) to avoid contention on shared Supabase tables.
- The setup file seeds baseline data when needed and exposes helpers for teardown.
- Use `npm run test:watch_e2e` during local development to rerun affected tests.

## Writing E2E tests
1. Build test data with `tests/e2e/fixtures` (see `ProjectBuilder`, `TaskBuilder`, and `TestScenarios`).
2. Wrap Supabase mutations in try/finally blocks to guarantee cleanup.
3. Use the utilities in `tests/e2e/utils` for polling and timeout-safe assertions.
4. Keep tests idempotent so they can run on CI repeatedly.

## Optional Cypress runner
A Cypress config (`config/cypress.config.js`) exists for interactive browser tests. Launch it with `npm run cypress` once you have a hosted environment to target.

Refer to `tests/e2e/FIXTURES.md` for detailed fixture semantics and data contracts.
