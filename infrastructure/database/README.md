# Database Schema and Migrations

This directory contains the database schema definitions and migration files for the Kanban Portfolio application.

## Schema Files

### `supabase/schema/tags.sql`

Defines the `tags` table structure with:

- `id` (TEXT PRIMARY KEY) - Unique identifier
- `name` (TEXT NOT NULL UNIQUE) - Tag name
- `color` (TEXT NOT NULL) - Hex color code (e.g., '#3B82F6')
- `description` (TEXT) - Optional description
- `created_at` and `updated_at` - Timestamps

### `supabase/schema/status.sql`

Defines the `status` table structure with:

- `id` (TEXT PRIMARY KEY) - Unique identifier
- `name` (TEXT NOT NULL UNIQUE) - Status name
- `color` (TEXT NOT NULL) - Hex color code
- `description` (TEXT) - Optional description
- `order` (INTEGER) - Display order for kanban columns
- `created_at` and `updated_at` - Timestamps

Includes default status values:

- Planning (#6B7280)
- In Progress (#3B82F6)
- Completed (#10B981)
- On Hold (#F59E0B)

## Migration Files

### `infrastructure/database/migrations/001_initial_schema.sql`

Initial database setup with projects and tasks tables.

### `infrastructure/database/migrations/002_add_order_to_projects.sql`

Adds ordering functionality to projects table.

### `infrastructure/database/migrations/003_add_tags_and_status_tables.sql`

Major migration that:

1. Creates `tags` and `status` tables
2. Creates `project_tags` junction table for many-to-many relationships
3. Adds `status_id` column to projects table
4. Migrates existing data from text arrays to proper relationships
5. Sets up indexes, triggers, and RLS policies

## Database Structure

```
projects (existing)
├── id, title, description, url, status_id (new), order, etc.
└── project_tags (junction table)
    └── tags (new table)
        ├── id, name, color, description, timestamps

status (new table)
├── id, name, color, description, order, timestamps
```

## Running Migrations

To apply migrations to your Supabase database:

```bash
# Using Supabase CLI
supabase db push

# Or run individual migration files in Supabase SQL editor
```

## Data Migration Notes

The migration handles existing data by:

1. Converting existing `status` text values to `status_id` references
2. Creating tags from existing `tags` text arrays
3. Establishing proper many-to-many relationships via `project_tags`

After migration, the old `status` and `tags` columns can be dropped (currently commented out in the migration file).
