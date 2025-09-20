-- Tags table schema
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

-- Create indexes for tags
CREATE INDEX
IF NOT EXISTS idx_tags_name ON tags
(name);
CREATE INDEX
IF NOT EXISTS idx_tags_created_at ON tags
(created_at);

-- Create trigger for tags updated_at
CREATE TRIGGER update_tags_updated_at
  BEFORE
UPDATE ON tags
  FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

-- Enable RLS for tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

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