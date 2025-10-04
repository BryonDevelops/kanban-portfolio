import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
    const user = userEvent.setup()

    render(
      <BlogPostPortal
        post={basePost}
        trigger={<button type="button">Open Post</button>}
      />
    )

    await user.click(screen.getByRole('button', { name: /open post/i }))

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Hello World' })
    ).toBeInTheDocument()

    expect(screen.getByText('markdown', { selector: 'strong' })).toBeInTheDocument()
    expect(screen.getByText('console.log("hi");')).toBeInTheDocument()
  })
})
