import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';

type MicroblogServiceMethods = {
  getPosts: () => Promise<unknown[]>;
  getPostsByStatus: (status: string) => Promise<unknown[]>;
  getPostsByAuthor: (author: string) => Promise<unknown[]>;
  getPostsByTag: (tag: string) => Promise<unknown[]>;
  searchPosts: (query: string) => Promise<unknown[]>;
  createPost: (payload: unknown) => Promise<unknown>;
  getPostById: (id: string) => Promise<unknown | null>;
  updatePost: (id: string, updates: unknown) => Promise<unknown>;
  deletePost: (id: string) => Promise<void>;
};

const mockMicroblogService: jest.Mocked<MicroblogServiceMethods> = {
  getPosts: jest.fn(),
  getPostsByStatus: jest.fn(),
  getPostsByAuthor: jest.fn(),
  getPostsByTag: jest.fn(),
  searchPosts: jest.fn(),
  createPost: jest.fn(),
  getPostById: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
};

const getMicroblogServiceMock = jest.fn(() => mockMicroblogService);

type PostsRouteModule = typeof import('@/app/(api)/api/posts/route');
type PostByIdRouteModule = typeof import('@/app/(api)/api/posts/[id]/route');

type UnstableMockModule = (
  moduleName: string,
  factory: () => Record<string, unknown>
) => Promise<void>;

async function setupRouteModules(): Promise<{
  postsRoute: PostsRouteModule;
  postByIdRoute: PostByIdRouteModule;
}> {
  const { unstable_mockModule } = jest as unknown as {
    unstable_mockModule: UnstableMockModule;
  };

  await unstable_mockModule('@/lib/dependencyContainer', () => ({
    getMicroblogService: getMicroblogServiceMock,
  }));

  const postsRoute = await import('@/app/(api)/api/posts/route');
  const postByIdRoute = await import('@/app/(api)/api/posts/[id]/route');

  return { postsRoute, postByIdRoute };
}

function createRequest(
  url: string,
  init?: RequestInit
): NextRequest {
  const request = new Request(url, init);
  return request as unknown as NextRequest;
}

describe('Posts API route integration', () => {
  let postsRoute: PostsRouteModule;
  let postByIdRoute: PostByIdRouteModule;

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();

    for (const method of Object.values(mockMicroblogService)) {
      method.mockReset();
    }

    getMicroblogServiceMock.mockClear();

    ({ postsRoute, postByIdRoute } = await setupRouteModules());
  });

  describe('GET /api/posts', () => {
    it('returns all posts when no query params are provided', async () => {
      const mockPosts = [
        { id: 'post-1', title: 'Hello world' },
        { id: 'post-2', title: 'Another post' },
      ];
      mockMicroblogService.getPosts.mockResolvedValue(mockPosts);

      const request = createRequest('http://localhost/api/posts');
      const response = await postsRoute.GET(request);

      expect(response.status).toBe(200);
      expect(mockMicroblogService.getPosts).toHaveBeenCalledTimes(1);
      const payload = await response.json();
      expect(payload).toEqual(mockPosts);
    });

    it('filters by status when a valid status is provided', async () => {
      const mockPosts = [{ id: 'post-3', title: 'Published post' }];
      mockMicroblogService.getPostsByStatus.mockResolvedValue(mockPosts);

      const request = createRequest('http://localhost/api/posts?status=published');
      const response = await postsRoute.GET(request);

      expect(response.status).toBe(200);
      expect(mockMicroblogService.getPostsByStatus).toHaveBeenCalledWith('published');
      const payload = await response.json();
      expect(payload).toEqual(mockPosts);
    });

    it('returns 400 when an invalid status is provided', async () => {
      const request = createRequest('http://localhost/api/posts?status=invalid');
      const response = await postsRoute.GET(request);

      expect(response.status).toBe(400);
      expect(mockMicroblogService.getPostsByStatus).not.toHaveBeenCalled();
      const payload = await response.json();
      expect(payload).toEqual({ error: 'Invalid status parameter' });
    });

    it('delegates to search when a query parameter is present', async () => {
      const mockPosts = [{ id: 'post-4', title: 'Search match' }];
      mockMicroblogService.searchPosts.mockResolvedValue(mockPosts);

      const request = createRequest('http://localhost/api/posts?q=hello');
      const response = await postsRoute.GET(request);

      expect(response.status).toBe(200);
      expect(mockMicroblogService.searchPosts).toHaveBeenCalledWith('hello');
      const payload = await response.json();
      expect(payload).toEqual(mockPosts);
    });
  });

  describe('POST /api/posts', () => {
    const basePayload = {
      title: 'Integration test post',
      excerpt: 'This is a valid excerpt for integration testing.',
      content: 'This is a sufficiently long content body used for integration testing purposes.',
      author: 'Integration Tester',
      publishedAt: new Date().toISOString(),
      tags: [],
      categories: [],
    };

    it('creates a post when the payload is valid', async () => {
      const createdPost = { id: 'post-5', ...basePayload, status: 'draft', featured: false };
      mockMicroblogService.createPost.mockResolvedValue(createdPost);

      const request = createRequest('http://localhost/api/posts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(basePayload),
      });

      const response = await postsRoute.POST(request);

      expect(response.status).toBe(201);
      expect(mockMicroblogService.createPost).toHaveBeenCalledTimes(1);
      expect(mockMicroblogService.createPost.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          title: basePayload.title,
          status: 'draft',
          featured: false,
        })
      );

      const payload = await response.json();
      expect(payload).toEqual(createdPost);
    });

    it('returns 400 when the payload fails validation', async () => {
      const invalidPayload = { ...basePayload, excerpt: 'too short', content: 'short content' };

      const request = createRequest('http://localhost/api/posts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(invalidPayload),
      });

      const response = await postsRoute.POST(request);

      expect(response.status).toBe(400);
      expect(mockMicroblogService.createPost).not.toHaveBeenCalled();
      const payload = await response.json();
      expect(payload).toHaveProperty('error', 'Invalid request data');
    });

    it('returns 500 when the service throws an error', async () => {
      mockMicroblogService.createPost.mockRejectedValue(new Error('Database down'));

      const request = createRequest('http://localhost/api/posts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(basePayload),
      });

      const response = await postsRoute.POST(request);

      expect(response.status).toBe(500);
      const payload = await response.json();
      expect(payload).toEqual({ error: 'Failed to create post' });
    });
  });

  describe('Routes with ID parameter', () => {
    it('returns a post by id when it exists', async () => {
      const post = { id: 'post-6', title: 'Existing post' };
      mockMicroblogService.getPostById.mockResolvedValue(post);

      const request = createRequest('http://localhost/api/posts/post-6');
      const response = await postByIdRoute.GET(request, {
        params: Promise.resolve({ id: 'post-6' }),
      });

      expect(response.status).toBe(200);
      expect(mockMicroblogService.getPostById).toHaveBeenCalledWith('post-6');
      const payload = await response.json();
      expect(payload).toEqual(post);
    });

    it('returns 404 when a post is not found', async () => {
      mockMicroblogService.getPostById.mockResolvedValue(null);

      const request = createRequest('http://localhost/api/posts/missing');
      const response = await postByIdRoute.GET(request, {
        params: Promise.resolve({ id: 'missing' }),
      });

      expect(response.status).toBe(404);
      const payload = await response.json();
      expect(payload).toEqual({ error: 'Post not found' });
    });

    it('updates a post when the payload is valid', async () => {
      const updates = {
        title: 'Updated post title',
        content: 'This is a sufficiently long content body for update operations exceeding fifty characters.',
      };
      const updatedPost = { id: 'post-7', ...updates };
      mockMicroblogService.updatePost.mockResolvedValue(updatedPost);

      const request = createRequest('http://localhost/api/posts/post-7', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const response = await postByIdRoute.PUT(request, {
        params: Promise.resolve({ id: 'post-7' }),
      });

      expect(response.status).toBe(200);
      expect(mockMicroblogService.updatePost).toHaveBeenCalledWith(
        'post-7',
        expect.objectContaining({ title: updates.title })
      );
      const payload = await response.json();
      expect(payload).toEqual(updatedPost);
    });

    it('returns 400 when update validation fails', async () => {
      const updates = { title: '' };

      const request = createRequest('http://localhost/api/posts/post-8', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const response = await postByIdRoute.PUT(request, {
        params: Promise.resolve({ id: 'post-8' }),
      });

      expect(response.status).toBe(400);
      expect(mockMicroblogService.updatePost).not.toHaveBeenCalled();
      const payload = await response.json();
      expect(payload).toHaveProperty('error', 'Invalid request data');
    });

    it('deletes a post by id', async () => {
      mockMicroblogService.deletePost.mockResolvedValue(undefined);

      const request = createRequest('http://localhost/api/posts/post-9', {
        method: 'DELETE',
      });

      const response = await postByIdRoute.DELETE(request, {
        params: Promise.resolve({ id: 'post-9' }),
      });

      expect(response.status).toBe(200);
      expect(mockMicroblogService.deletePost).toHaveBeenCalledWith('post-9');
      const payload = await response.json();
      expect(payload).toEqual({ message: 'Post deleted successfully' });
    });
  });
});
