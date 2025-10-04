"use client";

import { useState } from 'react';
import { EditBlogPostForm } from './EditBlogPostForm';
import { ImprovedEditBlogPostForm } from './ImprovedEditBlogPostForm';
import { BlogPost } from '../BlogPostPortal';
import { Button } from '@/presentation/components/ui/button';
import { Edit3, Sparkles } from 'lucide-react';

const sampleBlogPost: BlogPost = {
  id: 'sample-1',
  title: 'Getting Started with Next.js and TypeScript',
  excerpt: 'Learn how to build modern web applications with Next.js 15 and TypeScript, including best practices for project setup, routing, and component architecture.',
  content: `# Getting Started with Next.js and TypeScript

Next.js has become one of the most popular React frameworks for building modern web applications. Combined with TypeScript, it provides excellent developer experience and type safety.

## Why Choose Next.js?

- **File-based routing** - Automatic routing based on file structure
- **Server-side rendering** - Better SEO and performance
- **API routes** - Full-stack capabilities
- **Built-in optimization** - Image optimization, code splitting, and more

## Project Setup

First, create a new Next.js project with TypeScript:

\`\`\`bash
npx create-next-app@latest my-app --typescript --tailwind --eslint --app
cd my-app
npm run dev
\`\`\`

## Component Architecture

Here's an example of a TypeScript component:

\`\`\`tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={\`btn btn-\${variant}\`}
    >
      {children}
    </button>
  );
}
\`\`\`

## Best Practices

1. **Use TypeScript interfaces** for props and data structures
2. **Implement proper error boundaries** for better UX
3. **Optimize images** with Next.js Image component
4. **Use server components** when possible for better performance

## Table Example

| Feature | Next.js | Vite | CRA |
|---------|---------|------|-----|
| SSR | ✅ | ❌ | ❌ |
| File Routing | ✅ | ❌ | ❌ |
| API Routes | ✅ | ❌ | ❌ |
| TypeScript | ✅ | ✅ | ✅ |

Happy coding! 🚀`,
  author: 'John Developer',
  publishedAt: '2025-01-04T10:00:00.000Z',
  tags: ['nextjs', 'typescript', 'react', 'web-development', 'tutorial'],
  readTime: 8,
  imageUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop',
  featured: true,
  categories: ['Development', 'JavaScript', 'Tutorial'],
};

export function EditFormComparison() {
  const [originalOpen, setOriginalOpen] = useState(false);
  const [improvedOpen, setImprovedOpen] = useState(false);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Blog Post Edit Form Comparison
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Compare the original edit form with the improved version
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Original Form */}
        <div className="space-y-4">
          <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Original Form
                </h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                The current implementation with complex layout and multiple sections.
              </p>
              <div className="space-y-2">
                <div className="text-xs text-slate-500 dark:text-slate-500">Features:</div>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Complex nested sections</li>
                  <li>• Inline title editing</li>
                  <li>• Mixed responsive patterns</li>
                  <li>• Basic error handling</li>
                </ul>
              </div>
              <Button
                onClick={() => setOriginalOpen(true)}
                className="w-full"
                variant="outline"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Open Original Form
              </Button>
            </div>
          </div>
        </div>

        {/* Improved Form */}
        <div className="space-y-4">
          <div className="p-6 border border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  Improved Form
                </h2>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Enhanced version with better UX, organization, and modern design patterns.
              </p>
              <div className="space-y-2">
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Improvements:</div>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Clean tabbed interface</li>
                  <li>• Better loading states</li>
                  <li>• Improved error handling</li>
                  <li>• Unsaved changes tracking</li>
                  <li>• Modern visual design</li>
                  <li>• Enhanced mobile experience</li>
                </ul>
              </div>
              <Button
                onClick={() => setImprovedOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Open Improved Form
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Blog Post Preview */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6 bg-white dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Sample Blog Post Data
        </h3>
        <div className="space-y-3 text-sm">
          <div><strong>Title:</strong> {sampleBlogPost.title}</div>
          <div><strong>Author:</strong> {sampleBlogPost.author}</div>
          <div><strong>Tags:</strong> {sampleBlogPost.tags.join(', ')}</div>
          <div><strong>Read Time:</strong> {sampleBlogPost.readTime} minutes</div>
          <div><strong>Excerpt:</strong> {sampleBlogPost.excerpt}</div>
        </div>
      </div>

      {/* Forms */}
      <EditBlogPostForm
        blogPost={sampleBlogPost}
        open={originalOpen}
        onOpenChange={setOriginalOpen}
        onBlogPostUpdated={() => console.log('Original form updated')}
        onBlogPostDeleted={() => console.log('Original form deleted')}
      />

      <ImprovedEditBlogPostForm
        blogPost={sampleBlogPost}
        open={improvedOpen}
        onOpenChange={setImprovedOpen}
        onBlogPostUpdated={() => console.log('Improved form updated')}
        onBlogPostDeleted={() => console.log('Improved form deleted')}
      />
    </div>
  );
}