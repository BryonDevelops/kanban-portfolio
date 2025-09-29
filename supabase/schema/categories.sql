-- Categories table schema for microblog
CREATE TABLE
IF NOT EXISTS categories
(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#6B7280', -- Hex color code
  created_at TIMESTAMPTZ DEFAULT NOW
(),
  updated_at TIMESTAMPTZ DEFAULT NOW
()
);

-- Create indexes for categories
CREATE INDEX
IF NOT EXISTS idx_categories_name ON categories
(name);
CREATE INDEX
IF NOT EXISTS idx_categories_slug ON categories
(slug);
CREATE INDEX
IF NOT EXISTS idx_categories_created_at ON categories
(created_at);

-- Create trigger for categories updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE
UPDATE ON categories
  FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

-- Enable RLS for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Users can view all categories" ON categories
  FOR
SELECT USING (true);

CREATE POLICY "Users can insert categories" ON categories
  FOR
INSERT WITH CHECK (auth.uid() IS NOT NULL)
;

CREATE POLICY "Users can update categories" ON categories
  FOR
UPDATE USING (auth.uid()
IS NOT NULL);

CREATE POLICY "Users can delete categories" ON categories
  FOR
DELETE USING (auth.uid
() IS NOT NULL);

-- Insert default categories
INSERT INTO categories
    (id, name, slug, description, color)
VALUES
    ('cat-web-dev', 'Web Development', 'web-development', 'Frontend and backend web development topics', '#3B82F6'),
    ('cat-design', 'Design', 'design', 'UI/UX design and creative topics', '#EC4899'),
    ('cat-tech', 'Technology', 'technology', 'General technology and industry trends', '#10B981'),
    ('cat-tutorial', 'Tutorials', 'tutorials', 'Step-by-step guides and tutorials', '#F59E0B'),
    ('cat-personal', 'Personal', 'personal', 'Personal thoughts and experiences', '#8B5CF6')
ON CONFLICT
(id) DO NOTHING;