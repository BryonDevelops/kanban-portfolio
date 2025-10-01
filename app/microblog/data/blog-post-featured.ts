import { BlogPost } from '../../../presentation/components/features/microblog/BlogPostPortal'

export const featuredPosts: BlogPost[] = [
  {
    id: '1',
    title: "Building Modern Web Apps with Next.js 14",
    excerpt: "Exploring the latest features in Next.js 14 including server components, app router, and improved performance optimizations.",
    content: `# Building Modern Web Apps with Next.js 14

Next.js 14 brings powerful new features that revolutionize how we build web applications. Let's dive into the key improvements and how they can enhance your development workflow.

## Server Components Revolution

Server Components allow you to render components on the server, reducing bundle sizes and improving performance. This means faster load times and better user experiences.

## App Router Enhancements

The App Router continues to evolve with better nested routing, improved loading states, and enhanced developer experience. File-based routing has never been more intuitive.

## Performance Optimizations

Next.js 14 includes automatic performance optimizations that work out of the box, including improved image optimization, better caching strategies, and smarter bundle splitting.

## Getting Started

\`\`\`bash
npx create-next-app@latest my-app --app
cd my-app
npm run dev
\`\`\`

The future of web development is here with Next.js 14!`,
    author: 'Bryon Bauer',
    publishedAt: '2024-09-20',
    tags: ["Next.js", "React", "Web Development"],
    readTime: 5,
    imageUrl: '/heroimg_dark.png',
    featured: true,
    categories: []
  },
  {
    id: '2',
    title: "The Future of TypeScript in 2025",
    excerpt: "A deep dive into upcoming TypeScript features and how they're shaping the future of JavaScript development.",
    content: `# The Future of TypeScript in 2025

TypeScript continues to evolve, bringing new features that make JavaScript development more robust and enjoyable.

## Advanced Type System Features

### Template Literal Types
TypeScript 5.0 introduces more sophisticated template literal types, allowing for better string manipulation at the type level.

### Module Resolution Improvements
Better support for modern module systems and improved resolution algorithms.

## Developer Experience Enhancements

### Better Error Messages
More descriptive error messages that help you understand and fix issues faster.

### Performance Improvements
Faster compilation times and better IDE responsiveness.

## Conclusion

TypeScript 2025 promises to be an exciting year with significant improvements to the type system and developer experience.`,
    author: 'Bryon Bauer',
    publishedAt: '2024-09-18',
    tags: ["TypeScript", "JavaScript", "Programming"],
    readTime: 7,
    featured: true,
    categories: []
  }
]