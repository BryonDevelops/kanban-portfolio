-- Posts table schema for microblog
CREATE TABLE
IF NOT EXISTS posts
(
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  read_time INTEGER NOT NULL DEFAULT 1,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for posts
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(featured);

-- Create trigger for posts updated_at
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Users can view all published posts" ON posts
  FOR SELECT USING (status = 'published' OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Insert some sample posts for testing
INSERT INTO posts (id, title, excerpt, content, author, published_at, tags, read_time, status, featured)
VALUES
  ('post-1', 'Getting Started with Clean Architecture', 'Learn how to structure your applications using Clean Architecture principles for better maintainability and testability.', 'Clean Architecture is a software design philosophy that separates concerns into distinct layers. This approach makes your code more maintainable, testable, and adaptable to change.

The core idea is to organize your code so that business logic is independent of frameworks, databases, and external interfaces. This separation allows you to change any layer without affecting others.

Key benefits include:
- Easier testing
- Framework independence
- Database independence
- UI independence

In this post, we''ll explore how to implement Clean Architecture in a real-world application.', 'John Doe', '2025-01-15T10:00:00Z', ARRAY['architecture', 'clean-code', 'software-design'], 5, 'published', TRUE),
  ('post-2', 'Building Modern UIs with React and TypeScript', 'Discover how to create type-safe, maintainable user interfaces using React and TypeScript.', 'React and TypeScript together provide a powerful combination for building modern web applications. TypeScript adds static typing to JavaScript, catching errors at compile time and improving code quality.

In this comprehensive guide, we''ll cover:
- Setting up a React + TypeScript project
- Component patterns and best practices
- State management strategies
- Testing approaches
- Performance optimization techniques

By the end of this post, you''ll have a solid foundation for building robust React applications with TypeScript.', 'Jane Smith', '2025-01-20T14:30:00Z', ARRAY['react', 'typescript', 'frontend', 'ui'], 8, 'published', FALSE),
  ('post-3', 'Database Design Principles', 'Essential principles for designing scalable and maintainable database schemas.', 'Good database design is crucial for application performance and maintainability. Following established principles ensures your data layer can grow with your application needs.

Key principles we''ll discuss:
- Normalization vs denormalization
- Indexing strategies
- Relationship modeling
- Data integrity constraints
- Performance considerations

This post will help you make informed decisions about your database architecture.', 'Mike Johnson', '2025-01-25T09:15:00Z', ARRAY['database', 'design', 'sql', 'performance'], 6, 'draft', FALSE)
ON CONFLICT (id) DO NOTHING;