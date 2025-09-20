# E2E Database Tests

## Purpose
End-to-end tests that use real database connections to validate:
- Actual Supabase integration
- Database schema compliance
- Real network latency and error scenarios
- Production-like data flows

## Architecture Position
```
┌─────────────────────────────────────────────────┐
│                 TEST LAYERS                     │
├─────────────────────────────────────────────────┤
│ tests/unit/          → Domain & Application     │
│ tests/integration/   → Infrastructure (mocked)  │
│ tests/e2e/          → Infrastructure (real DB)  │ ← THIS LAYER
│ tests/acceptance/   → Full system (optional)    │
└─────────────────────────────────────────────────┘
```

## When to Use
- Pre-deployment validation
- Database migration testing
- Performance testing
- Real error scenario validation

## Setup Requirements
- Test database instance
- Database seeding/cleanup
- Environment isolation
- Longer test timeouts