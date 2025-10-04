# Infrastructure Layer

The infrastructure layer implements concrete integrations for the domain contracts. It is responsible for talking to Supabase, external APIs, and any other IO heavy dependency while keeping the rest of the application decoupled.

## Directory overview
- `database/` – Supabase client factory, repository implementations, and SQL migrations.
  - `supabaseClient.ts` provides a cached Supabase client built from environment variables.
  - `repositories/` contains the Supabase-backed implementations for board, task, tag, microblog, category, feature flag, and admin data.
  - `migrations/` holds raw SQL used to provision and evolve the database schema.
- `external-apis/openapi.ts` – placeholder for future third-party integrations and shared API typings.

## Supabase repositories
Each repository implements one of the domain layer contracts:

| Repository | Implements | Purpose |
| --- | --- | --- |
| `SupabaseBoardRepository` | `IBoardRepository` | Fetches and mutates projects, columns, and tasks tied to the kanban UI. |
| `SupabaseTaskRepository` | `ITaskRepository` | Task-specific create/update/delete operations and status transitions. |
| `SupabaseTagRepository` | `ITagRepository` | Manages tag dictionaries and relationships. |
| `SupabaseFeatureFlagRepository` | `IFeatureFlagRepository` | Persists feature flags surfaced in the admin console. |
| `SupabaseMicroblogRepository` | `IMicroblogRepository` | Stores blog posts, read-time metadata, and publishing workflows. |
| `SupabaseCategoryRepository` | `ICategoryRepository` | Maintains microblog categories and tag relationships. |

All repositories share the same error-handling pattern: fail fast when the Supabase client is unavailable, propagate Supabase errors verbatim, and leave user friendly messaging to higher layers.

## External APIs
`external-apis/openapi.ts` houses API client scaffolding and OpenAPI helpers. As new services are introduced (for example GitHub or Vercel deployments) they should land in this directory so the dependency direction stays consistent.

## Configuration
Set these environment variables to let the infrastructure layer connect to Supabase:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required for migrations and privileged actions)
- `TEST_SUPABASE_*` when running the E2E suite

`getSupabase()` caches the instantiated client to avoid recreating it on every request in both Node and browser contexts.

## Migrations
SQL migrations that define the canonical schema live under `database/migrations`. They can be applied with the bundled Supabase CLI (`npm run db:migrate`) or manually through the Supabase dashboard. See `database/README.md` for details on the tables and helper functions.

## Testing
Infrastructure-specific tests live in `tests/integration` and use mocked Supabase responses, while fully integrated scenarios run in `tests/e2e` against a real Supabase project. Use `npm run test:integration` and `npm run test:e2e` respectively.
