# Database Module

This folder centralises Supabase access and schema management for the Kanban Portfolio.

## Contents
- `supabaseClient.ts` – lazily instantiates and caches the Supabase JS client using `NEXT_PUBLIC_SUPABASE_*` keys. Returns `null` when credentials are missing so the rest of the app can fall back gracefully.
- `repositories/` – Supabase-backed implementations of the domain repository interfaces (`SupabaseBoardRepository`, `SupabaseTaskRepository`, `SupabaseTagRepository`, `SupabaseFeatureFlagRepository`, `SupabaseMicroblogRepository`, `SupabaseCategoryRepository`).
- `migrations/` – Versioned SQL files that describe the canonical PostgreSQL schema.

## Repository responsibilities
- **Board** (`supaBaseBoardRepository.ts`): reads and mutates projects, tasks, and drag-and-drop ordering.
- **Task** (`supabaseTaskRepository.ts`): task-centred operations used by the services layer.
- **Tag** (`supabaseTagRepository.ts`): CRUD for tag dictionaries and project-tag relationships.
- **Feature flags** (`supabaseFeatureFlagRepository.ts`): toggles for the admin console and client gating logic.
- **Microblog** (`supabaseMicroblogRepository.ts`): post lifecycle management with automatic read time calculation.
- **Categories** (`supabaseCategoryRepository.ts`): taxonomy helpers backing the microblog filters and selectors.

Each repository normalises data coming from Supabase to match the domain types and bubbles up errors so callers can decide how to render failures.

## Migration summary
- `001_initial_schema.sql` – creates the `projects` and `tasks` tables, timestamp triggers, indexes, and enables row-level security.
- `002_add_order_to_projects.sql` – adds and backfills the `order` column to control kanban column ordering.
- `003_add_tags_and_status_tables.sql` – normalises tags and status values into dedicated tables, introduces the `project_tags` junction table, and wires indexes.

Run migrations with the bundled CLI:

```bash
npm run db:migrate       # applies all migrations
npm run db:reset         # drops and recreates using Supabase CLI (destructive)
```

These commands expect `SUPABASE_SERVICE_ROLE_KEY` to be set. You can also execute the SQL files manually inside the Supabase dashboard if you prefer a guided workflow.

## Working locally
- When Supabase credentials are not defined the repositories throw informative errors; higher layers detect this and swap to mocked in-memory data so the app remains viewable.
- Tests in `tests/integration` mock Supabase responses, while `tests/e2e` exercises the real schema. Set `TEST_SUPABASE_*` to point at a disposable project before running E2E tests.
