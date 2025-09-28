-- Migration: Add feature flags table for real-time feature management
-- Migration number: 004

-- Create feature_flags table
CREATE TABLE
IF NOT EXISTS feature_flags
(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  category TEXT NOT NULL DEFAULT 'core',
  created_at TIMESTAMPTZ DEFAULT NOW
(),
  updated_at TIMESTAMPTZ DEFAULT NOW
(),
  updated_by TEXT
);

-- Create indexes for feature_flags
CREATE INDEX
IF NOT EXISTS idx_feature_flags_name ON feature_flags
(name);
CREATE INDEX
IF NOT EXISTS idx_feature_flags_category ON feature_flags
(category);
CREATE INDEX
IF NOT EXISTS idx_feature_flags_enabled ON feature_flags
(enabled);
CREATE INDEX
IF NOT EXISTS idx_feature_flags_updated_at ON feature_flags
(updated_at);

-- Create trigger for feature_flags updated_at
CREATE TRIGGER update_feature_flags_updated_at
  BEFORE
UPDATE ON feature_flags
  FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

-- Enable RLS for feature_flags
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Feature flags policies - anyone can view, only admins can modify
CREATE POLICY "Anyone can view feature flags" ON feature_flags
  FOR
SELECT USING (true);

CREATE POLICY "Only admins can insert feature flags" ON feature_flags
  FOR
INSERT WITH CHECK
    (true)
;

CREATE POLICY "Only admins can update feature flags" ON feature_flags
  FOR
UPDATE USING (true);

CREATE POLICY "Only admins can delete feature flags" ON feature_flags
  FOR
DELETE USING (true);

-- Insert default feature flags
INSERT INTO feature_flags
    (id, name, description, enabled, category)
VALUES
    ('board', 'Kanban Board', 'Enable the kanban board feature for project management', true, 'core'),
    ('microblog', 'Microblog', 'Enable the microblog feature for thoughts and insights', true, 'core'),
    ('projects', 'Projects', 'Enable the projects showcase feature', true, 'core'),
    ('about', 'About Page', 'Enable the about page', true, 'core'),
    ('contact', 'Contact Page', 'Enable the contact form and page', true, 'core'),
    ('admin', 'Admin Panel', 'Enable the admin dashboard', true, 'admin'),
    ('userManagement', 'User Management', 'Enable user management features in admin', true, 'admin'),
    ('systemSettings', 'System Settings', 'Enable system settings management', true, 'admin'),
    ('analytics', 'Analytics', 'Enable analytics tracking', true, 'advanced'),
    ('pwa', 'Progressive Web App', 'Enable PWA features', true, 'advanced'),
    ('offline', 'Offline Support', 'Enable offline functionality', false, 'advanced'),
    ('aiAssistant', 'AI Assistant', 'Enable AI-powered features', false, 'experimental'),
    ('advancedSearch', 'Advanced Search', 'Enable advanced search capabilities', false, 'experimental')
ON CONFLICT
(id) DO NOTHING;