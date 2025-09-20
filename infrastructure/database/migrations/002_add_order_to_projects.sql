-- Add order column to projects table for kanban board ordering
ALTER TABLE projects ADD COLUMN
IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;

-- Create index for the order column
CREATE INDEX
IF NOT EXISTS idx_projects_order ON projects
("order");

-- Update existing projects to have sequential order values
-- This will set order based on creation time for existing projects
UPDATE projects SET "order" = sub.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) - 1 as row_num
    FROM projects
) sub
WHERE projects.id = sub.id;