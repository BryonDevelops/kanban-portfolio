-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  status TEXT NOT NULL CHECK (status IN ('planning', 'in-progress', 'completed', 'on-hold')),
  technologies TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  tasks JSONB DEFAULT '[]'::jsonb, -- Store tasks as JSON array, can be empty
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  status TEXT NOT NULL, -- Column ID represents the status
  "order" INTEGER NOT NULL DEFAULT 0,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  column_id TEXT NOT NULL, -- Which column the task belongs to
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_order ON tasks("order");

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (adjust as needed for your auth setup)
-- These are basic policies - you may want to customize based on your authentication requirements

-- Projects policies
CREATE POLICY "Users can view all projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (true);

-- Tasks policies
CREATE POLICY "Users can view all tasks" ON tasks
  FOR SELECT USING (true);

CREATE POLICY "Users can insert tasks" ON tasks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update tasks" ON tasks
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete tasks" ON tasks
  FOR DELETE USING (true);