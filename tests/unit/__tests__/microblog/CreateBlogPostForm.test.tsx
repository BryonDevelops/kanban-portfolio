import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

type FetchMock = jest.MockedFunction<typeof fetch>;

let CreateBlogPostForm: typeof import('@/presentation/components/features/microblog/forms/CreateBlogPostForm').CreateBlogPostForm;

beforeAll(async () => {
  type UnstableMockModule = (
    moduleName: string,
    factory: () => Record<string, unknown>
  ) => Promise<void>;

  const { unstable_mockModule: unstableMockModule } = jest as unknown as {
    unstable_mockModule: UnstableMockModule;
  };

  await unstableMockModule('@/presentation/components/shared/ProtectedRoute', () => ({
    useIsAdmin: jest.fn(() => true),
  }));

  await unstableMockModule('@clerk/nextjs', () => ({
    useUser: jest.fn(() => ({
      isLoaded: true,
      user: {
        fullName: 'Admin User',
        username: 'admin-user',
        publicMetadata: { role: 'admin' },
      },
    })),
  }));

  await unstableMockModule('@/presentation/hooks/use-mobile', () => ({
    useIsMobile: jest.fn(() => false),
  }));

  await unstableMockModule('@/presentation/components/shared/image-upload-dropdown', () => ({
    ImageUploadDropdown: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
      <input
        data-testid="image-url-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    ),
  }));

  await unstableMockModule('@/presentation/components/features/microblog/forms/CategorySelector', () => ({
    CategorySelector: ({ onCategoriesChange }: { onCategoriesChange: (values: string[]) => void }) => (
      <button
        type="button"
        data-testid="category-selector"
        onClick={() => onCategoriesChange(['category-1'])}
      >
        Select Categories
      </button>
    ),
  }));

  await unstableMockModule('@/presentation/components/features/microblog/forms/StreamlinedBlogEditor', () => ({
    StreamlinedBlogEditor: ({
      title,
      onTitleChange,
      content,
      onChange,
      excerpt,
      onExcerptChange,
      imageUrl,
      onImageUrlChange,
    }: {
      title: string;
      onTitleChange: (value: string) => void;
      content: string;
      onChange: (value: string) => void;
      excerpt: string;
      onExcerptChange: (value: string) => void;
      imageUrl: string;
      onImageUrlChange: (value: string) => void;
    }) => (
      <div data-testid="mock-streamlined-editor">
        <input
          data-testid="mock-title-input"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
        />
        <textarea
          data-testid="mock-content-input"
          value={content}
          onChange={(event) => onChange(event.target.value)}
        />
        <textarea
          data-testid="mock-excerpt-input"
          value={excerpt}
          onChange={(event) => onExcerptChange(event.target.value)}
        />
        <input
          data-testid="mock-image-input"
          value={imageUrl}
          onChange={(event) => onImageUrlChange(event.target.value)}
        />
      </div>
    ),
  }));

  ({ CreateBlogPostForm } = await import('@/presentation/components/features/microblog/forms/CreateBlogPostForm'));
});

describe('CreateBlogPostForm', () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    fetchMock = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      void input;
      void init;
      return new Response(JSON.stringify({ id: 'post-123' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as FetchMock;

    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('submits to /api/posts with sanitized payload', async () => {
    const user = userEvent.setup();

    render(<CreateBlogPostForm open onOpenChange={jest.fn()} />);

    const titleInput = screen.getByTestId('mock-title-input');
    const contentInput = screen.getByTestId('mock-content-input');
    const excerptInput = screen.getByTestId('mock-excerpt-input');
    const imageUrlInput = screen.getByTestId('mock-image-input');

    await user.type(titleInput, 'Test Microblog Post');
    await user.type(contentInput, 'This is the content body of the microblog post.');
    await user.type(excerptInput, 'This is a short excerpt.');

    // Ensure accidental whitespace or empty value is removed before submission
    fireEvent.change(imageUrlInput, { target: { value: '   ' } });

    const submitButton = screen.getByRole('button', { name: /create post/i });
    expect(submitButton).toBeEnabled();

    await user.click(submitButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/posts');
    expect(options?.method).toBe('POST');
    expect(options?.headers).toMatchObject({ 'Content-Type': 'application/json' });

    const payload = JSON.parse((options?.body as string) ?? '{}');

    expect(payload).toMatchObject({
      title: 'Test Microblog Post',
      excerpt: 'This is a short excerpt.',
      content: 'This is the content body of the microblog post.',
      author: 'Admin User',
      tags: [],
      featured: false,
    });

    expect(typeof payload.publishedAt).toBe('string');
    expect(typeof payload.readTime).toBe('number');
    expect(payload.categories).toEqual([]);
    expect(payload.imageUrl).toBeUndefined();
  });
});
