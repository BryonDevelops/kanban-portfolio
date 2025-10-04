# Database Migrations

Versioned SQL files used to provision and evolve the Supabase/PostgreSQL schema.

## Files
- `001_initial_schema.sql` – base projects/tasks tables, indexes, timestamp triggers, row-level security.
- `002_add_order_to_projects.sql` – adds the sortable `order` column to projects and backfills existing rows.
- `003_add_tags_and_status_tables.sql` – introduces normalised `tags`, `status`, and `project_tags` tables plus supporting indexes.

## Running migrations

### Supabase CLI (recommended)
```bash
# From the repository root
npm run db:migrate          # runs supabase.exe db push
npm run db:reset            # resets schema (drops data)
```
Ensure `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set. The repo ships with `supabase.exe` for Windows users; macOS/Linux can install the CLI separately.

### Supabase dashboard
1. Open your project at https://app.supabase.com.
2. Navigate to **SQL Editor**.
3. Paste the contents of the desired migration file.
4. Execute the script and review the results.
5. Record the migration as applied in your own tracking system.

### Manual `psql`
```bash
psql $DATABASE_URL -f infrastructure/database/migrations/001_initial_schema.sql
```
`DATABASE_URL` should point at the target Postgres instance (for example, Supabase connection string).

## Best practices
- Apply migrations in order to keep triggers and indexes consistent.
- Keep application credentials different from migration credentials; use the service role for migrations only.
- After applying migrations, run `npm run test:integration` to make sure the repository contracts still align with the schema.
