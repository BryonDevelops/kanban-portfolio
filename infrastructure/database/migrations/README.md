# Database Migrations

This directory contains SQL migration files for setting up the Supabase database schema based on the application entities.

## Migration Files

### 001_initial_schema.sql

Creates the initial database schema with:

- `projects` table - stores project information including tasks as JSONB
- `tasks` table - stores individual task information (for advanced task management)
- Indexes for performance optimization
- Row Level Security (RLS) policies
- Triggers for automatic `updated_at` timestamp management

## How to Run Migrations

### Option 1: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `001_initial_schema.sql`
4. Click "Run" to execute the migration

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Initialize Supabase in your project (if not already done)
supabase init

# Link to your remote project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Option 3: Manual SQL Execution

You can also run the SQL directly against your database using any PostgreSQL client.

## Database Schema Overview

### Projects Table

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  status TEXT NOT NULL, -- 'planning', 'in-progress', 'completed', 'on-hold'
  technologies TEXT[] DEFAULT '{}', -- PostgreSQL array
  tags TEXT[] DEFAULT '{}', -- PostgreSQL array
  tasks JSONB DEFAULT '[]'::jsonb, -- Tasks stored as JSONB array (can be empty)
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tasks Table

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  status TEXT NOT NULL, -- Column ID represents the status
  "order" INTEGER NOT NULL DEFAULT 0, -- Position within column
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  column_id TEXT NOT NULL, -- Which column the task belongs to
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Features

- **Foreign Key Relationships**: Tasks are linked to projects
- **Cascading Deletes**: Deleting a project automatically deletes its tasks
- **Array Support**: Technologies and tags stored as PostgreSQL arrays
- **JSONB Tasks**: Tasks can be stored as JSONB in projects table for simplicity
- **Automatic Timestamps**: Created/updated timestamps with triggers
- **Row Level Security**: Basic RLS policies for data access control
- **Indexes**: Optimized for common query patterns

## Tasks Storage Strategy

The schema supports two approaches for task storage:

1. **Embedded Tasks**: Tasks can be stored directly in the `projects.tasks` JSONB column

   - Pros: Simple queries, atomic operations
   - Cons: Limited querying capabilities for individual tasks

2. **Separate Tasks Table**: Tasks can be stored in the dedicated `tasks` table
   - Pros: Advanced querying, better performance for complex operations
   - Cons: More complex queries for project-task relationships

You can use either approach or both depending on your needs. The repository is designed to handle both patterns.

## Notes

- The migration uses `IF NOT EXISTS` clauses to prevent errors if tables already exist
- RLS policies are set to allow all operations - you may want to customize these based on your authentication requirements
- The schema matches the TypeScript entity definitions in the codebase
