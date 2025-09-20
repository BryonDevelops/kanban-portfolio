-- Migration: Add tags and status tables, update projects table
-- Migration number: 003

-- Create tags table
CREATE TABLE
IF NOT EXISTS tags
(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL, -- Hex color code like '#3B82F6'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW
(),
  updated_at TIMESTAMPTZ DEFAULT NOW
()
);

-- Create status table
CREATE TABLE
IF NOT EXISTS status
(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL, -- Hex color code like '#3B82F6'
  description TEXT,
  "order" INTEGER NOT NULL DEFAULT 0, -- For ordering status columns in kanban board
  created_at TIMESTAMPTZ DEFAULT NOW
(),
  updated_at TIMESTAMPTZ DEFAULT NOW
()
);

-- Create project_tags junction table for many-to-many relationship
CREATE TABLE
IF NOT EXISTS project_tags
(
  project_id TEXT REFERENCES projects
(id) ON
DELETE CASCADE,
  tag_id TEXT
REFERENCES tags
(id) ON
DELETE CASCADE,
  created_at TIMESTAMPTZ
DEFAULT NOW
(),
  PRIMARY KEY
(project_id, tag_id)
);

-- Add status_id column to projects table
ALTER TABLE projects ADD COLUMN
IF NOT EXISTS status_id TEXT REFERENCES status
(id);

-- Create indexes for better performance
CREATE INDEX
IF NOT EXISTS idx_tags_name ON tags
(name);
CREATE INDEX
IF NOT EXISTS idx_tags_created_at ON tags
(created_at);
CREATE INDEX
IF NOT EXISTS idx_status_name ON status
(name);
CREATE INDEX
IF NOT EXISTS idx_status_order ON status
("order");
CREATE INDEX
IF NOT EXISTS idx_status_created_at ON status
(created_at);
CREATE INDEX
IF NOT EXISTS idx_project_tags_project_id ON project_tags
(project_id);
CREATE INDEX
IF NOT EXISTS idx_project_tags_tag_id ON project_tags
(tag_id);
CREATE INDEX
IF NOT EXISTS idx_projects_status_id ON projects
(status_id);

-- Create triggers for updated_at
CREATE TRIGGER update_tags_updated_at
  BEFORE
UPDATE ON tags
  FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

CREATE TRIGGER update_status_updated_at
  BEFORE
UPDATE ON status
  FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

-- Enable RLS for new tables
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE status ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
-- Tags policies
CREATE POLICY "Users can view all tags" ON tags
  FOR
SELECT USING (true);

CREATE POLICY "Users can insert tags" ON tags
  FOR
INSERT WITH CHECK
    (true)
;

CREATE POLICY "Users can update tags" ON tags
  FOR
UPDATE USING (true);

CREATE POLICY "Users can delete tags" ON tags
  FOR
DELETE USING (true);

-- Status policies
CREATE POLICY "Users can view all status" ON status
  FOR
SELECT USING (true);

CREATE POLICY "Users can insert status" ON status
  FOR
INSERT WITH CHECK
    (true)
;

CREATE POLICY "Users can update status" ON status
  FOR
UPDATE USING (true);

CREATE POLICY "Users can delete status" ON status
  FOR
DELETE USING (true);

-- Project tags policies
CREATE POLICY "Users can view all project tags" ON project_tags
  FOR
SELECT USING (true);

CREATE POLICY "Users can insert project tags" ON project_tags
  FOR
INSERT WITH CHECK
    (true)
;

CREATE POLICY "Users can delete project tags" ON project_tags
  FOR
DELETE USING (true);

-- Insert default status values
INSERT INTO status
    (id, name, color, description, "order")
VALUES
    ('planning', 'Planning', '#6B7280', 'Project is in planning phase', 0),
    ('in-progress', 'In Progress', '#3B82F6', 'Project is currently being worked on', 1),
    ('completed', 'Completed', '#10B981', 'Project has been completed', 2),
    ('on-hold', 'On Hold', '#F59E0B', 'Project is temporarily paused', 3)
ON CONFLICT
(id) DO NOTHING;

-- Migrate existing project status data to use status_id
UPDATE projects
SET status_id = CASE
  WHEN status = 'planning' THEN 'planning'
  WHEN status = 'in-progress' THEN 'in-progress'
  WHEN status = 'completed' THEN 'completed'
  WHEN status = 'on-hold' THEN 'on-hold'
  ELSE 'planning' -- Default fallback
END;

-- Migrate existing project tags data
-- This is a complex migration that needs to handle the existing TEXT[] tags
-- We'll create tags for any existing tag names and link them to projects
DO $$
DECLARE
    project_record RECORD;
    tag_name TEXT;
    tag_id TEXT;
BEGIN
    -- Loop through all projects
    FOR project_record IN
    SELECT id, tags
    FROM projects
    WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
    LOOP
        -- Loop through each tag in the project's tags array
        FOREACH tag_name IN ARRAY project_record.tags
        LOOP
    -- Check if tag already exists, if not create it
    SELECT id
    INTO tag_id
    FROM tags
    WHERE name = tag_name;
    IF tag_id IS NULL THEN
                -- Generate a simple ID from the tag name (lowercase, replace spaces with hyphens)
                tag_id := lower
    (replace
    (tag_name, ' ', '-'));
    -- Insert new tag with default color
    INSERT INTO tags
        (id, name, color, description)
    VALUES
        (tag_id, tag_name, '#3B82F6', 'Migrated from project tags')
    ON CONFLICT
    (name) DO NOTHING;
    -- Get the ID again in case of conflict
    SELECT id
    INTO tag_id
    FROM tags
    WHERE name = tag_name;
END
IF;

            -- Link project to tag if not already linked
            INSERT INTO project_tags
    (project_id, tag_id)
VALUES
    (project_record.id, tag_id)
ON CONFLICT
(project_id, tag_id) DO NOTHING;
END LOOP;
END LOOP;
END $$;

-- Make status_id NOT NULL after migration (optional - comment out if you want to allow null status)
-- ALTER TABLE projects ALTER COLUMN status_id SET NOT NULL;

-- Drop old status column after migration is complete
-- ALTER TABLE projects DROP COLUMN IF EXISTS status;

-- Drop old tags column after migration is complete
-- ALTER TABLE projects DROP COLUMN IF EXISTS tags;