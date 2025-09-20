-- Status table schema
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

-- Create indexes for status
CREATE INDEX
IF NOT EXISTS idx_status_name ON status
(name);
CREATE INDEX
IF NOT EXISTS idx_status_order ON status
("order");
CREATE INDEX
IF NOT EXISTS idx_status_created_at ON status
(created_at);

-- Create trigger for status updated_at
CREATE TRIGGER update_status_updated_at
  BEFORE
UPDATE ON status
  FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

-- Enable RLS for status
ALTER TABLE status ENABLE ROW LEVEL SECURITY;

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