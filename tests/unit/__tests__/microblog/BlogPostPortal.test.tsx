import { render, screen } from '@testing-library/react'
import { BlogPostPortal, type BlogPost } from '@/presentation/components/features/microblog/BlogPostPortal'

describe('BlogPostPortal markdown rendering', () => {
  const basePost: BlogPost = {
    id: 'post-1',
    title: 'Sample Post',
    excerpt: 'A quick look at markdown rendering.',
    content: '# Hello World\n\nThis is a **markdown** paragraph.\n\n```ts\nconsole.log("hi");\n```',
    author: 'Test Author',
    publishedAt: '2025-10-02T12:00:00.000Z',
    tags: ['markdown', 'test'],
    readTime: 2,
    featured: false,
    categories: [],
  }

  it('converts markdown content into formatted HTML', async () => {
    render(
      <BlogPostPortal
        post={basePost}
        open={true}
        onOpenChange={() => {}}
      />
    )

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Hello World' })
    ).toBeInTheDocument()

    expect(screen.getByText('markdown', { selector: 'strong' })).toBeInTheDocument()
    expect(screen.getByText('console.log("hi");')).toBeInTheDocument()
  })
})
