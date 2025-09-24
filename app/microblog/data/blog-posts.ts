import { BlogPost } from '../../../presentation/components/features/blog/BlogPostPortal'

export const recentPosts: BlogPost[] = [
  {
    id: '3',
    title: "Mastering Tailwind CSS Grid Layouts",
    excerpt: "Advanced techniques for creating responsive grid layouts with Tailwind CSS utility classes.",
    content: `# Mastering Tailwind CSS Grid Layouts

Tailwind CSS provides powerful grid utilities that make creating responsive layouts a breeze.

## Grid Fundamentals

### Basic Grid Setup
\`\`\`html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
\`\`\`

### Advanced Grid Techniques

- Grid template areas for complex layouts
- Auto-fit and auto-fill for responsive grids
- Grid spanning and positioning

## Best Practices

1. Use semantic class names
2. Combine with Flexbox when appropriate
3. Test across different screen sizes
4. Consider performance implications

Grid layouts have never been easier with Tailwind CSS!`,
    author: 'Bryon Bauer',
    publishedAt: '2024-09-15',
    tags: ["Tailwind CSS", "CSS", "Frontend"],
    readTime: 4
  },
  {
    id: '4',
    title: "Optimizing React Performance",
    excerpt: "Essential techniques for improving React application performance and user experience.",
    content: `# Optimizing React Performance

Performance is crucial for modern web applications. Here are essential techniques to optimize your React apps.

## Core Optimization Techniques

### 1. Memoization
Use React.memo, useMemo, and useCallback to prevent unnecessary re-renders.

### 2. Code Splitting
Implement dynamic imports and route-based code splitting.

### 3. Virtual Scrolling
For large lists, implement virtual scrolling to render only visible items.

## Advanced Techniques

### Bundle Analysis
Use tools like Webpack Bundle Analyzer to identify large dependencies.

### Image Optimization
Implement lazy loading and proper image formats.

## Monitoring Performance

Regularly monitor your app's performance using tools like Lighthouse and Web Vitals.

Performance optimization is an ongoing process that pays dividends in user satisfaction!`,
    author: 'Bryon Bauer',
    publishedAt: '2024-09-12',
    tags: ["React", "Performance", "JavaScript"],
    readTime: 6
  },
  {
    id: '5',
    title: "Building Accessible Web Components",
    excerpt: "Best practices for creating inclusive web components that work for everyone.",
    content: `# Building Accessible Web Components

Accessibility is not just a nice-to-have—it's essential for creating inclusive web experiences.

## Core Accessibility Principles

### 1. Semantic HTML
Use proper semantic elements and ARIA attributes when necessary.

### 2. Keyboard Navigation
Ensure all interactive elements are keyboard accessible.

### 3. Screen Reader Support
Provide meaningful content for screen readers.

## Practical Implementation

### Focus Management
Implement proper focus indicators and focus trapping in modals.

### Color Contrast
Ensure sufficient color contrast ratios for text readability.

### Alternative Text
Provide descriptive alt text for images and icons.

## Testing Accessibility

Use automated tools like axe-core and manual testing with screen readers.

Building accessible components ensures your applications work for everyone!`,
    author: 'Bryon Bauer',
    publishedAt: '2024-09-10',
    tags: ["Accessibility", "Web Standards", "UX"],
    readTime: 5
  },
  {
    id: '6',
    title: "The Rise of Edge Computing",
    excerpt: "Understanding how edge computing is changing the way we build and deploy applications.",
    content: `# The Rise of Edge Computing

Edge computing is revolutionizing how we think about application deployment and data processing.

## What is Edge Computing?

Edge computing brings computation and data storage closer to the location where it's needed, reducing latency and improving performance.

## Benefits

### Reduced Latency
By processing data closer to users, applications can respond faster.

### Bandwidth Optimization
Reduce data transfer to central servers by processing locally.

### Improved Reliability
Distributed architecture provides better fault tolerance.

## Implementation Strategies

### CDN Integration
Use Content Delivery Networks for static asset delivery.

### Serverless Functions
Deploy serverless functions at the edge for dynamic content.

### Edge Databases
Consider edge databases for geographically distributed data.

## Future Implications

Edge computing will continue to evolve, enabling new types of applications and user experiences.

The edge is where the future of computing happens!`,
    author: 'Bryon Bauer',
    publishedAt: '2024-09-08',
    tags: ["Edge Computing", "Cloud", "Architecture"],
    readTime: 8
  }
]