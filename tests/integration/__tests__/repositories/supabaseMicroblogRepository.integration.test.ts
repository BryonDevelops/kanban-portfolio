import { jest } from '@jest/globals';
import { createMockSupabaseClient } from '../../__mocks__/supabase.integration';
import type { PostCreate } from '@/domain/microblog/entities/post';
type SupabaseMicroblogRepositoryCtor = typeof import('@/infrastructure/database/repositories/supabaseMicroblogRepository')['SupabaseMicroblogRepository'];

type UnstableMockModule = (
  moduleName: string,
  factory: () => Record<string, unknown>
) => Promise<void>;

describe('SupabaseMicroblogRepository', () => {
  let SupabaseMicroblogRepository: SupabaseMicroblogRepositoryCtor;
  let repository: InstanceType<SupabaseMicroblogRepositoryCtor>;

  const mockGetSupabase = jest.fn();
  const mockNanoid = jest.fn(() => 'generated-microblog-id');

  const importRepository = async () => {
    const { unstable_mockModule } = jest as unknown as {
      unstable_mockModule: UnstableMockModule;
    };

    await unstable_mockModule('@/infrastructure/database/supabaseClient', () => ({
      getSupabase: mockGetSupabase,
    }));

    await unstable_mockModule('nanoid', () => ({
      nanoid: mockNanoid,
    }));

    return import('@/infrastructure/database/repositories/supabaseMicroblogRepository');
  };

  beforeEach(async () => {
    jest.resetModules();
    mockGetSupabase.mockReset();
    mockNanoid.mockReset();
    mockNanoid.mockReturnValue('generated-microblog-id');

  const repositoryModule = await importRepository();
  SupabaseMicroblogRepository = repositoryModule.SupabaseMicroblogRepository;
  repository = new SupabaseMicroblogRepository();
  });

  it('creates a post with a generated id', async () => {
    const mockSupabase = createMockSupabaseClient();
    mockGetSupabase.mockReturnValue(mockSupabase as never);

    const payload: PostCreate = {
      title: 'Test Microblog Post',
      excerpt: 'This is a sufficiently long excerpt for integration testing.',
      content: 'This content body contains more than fifty characters to satisfy validation.',
      author: 'Integration Tester',
      publishedAt: '2025-10-02T12:00:00.000Z',
      tags: [],
      status: 'draft',
      featured: false,
      categories: [],
    };

    const insertedRow = {
      id: 'generated-microblog-id',
      title: payload.title,
      excerpt: payload.excerpt,
      content: payload.content,
      author: payload.author,
      published_at: payload.publishedAt,
      tags: payload.tags,
      read_time: 1,
      image_url: null,
      status: 'draft',
      featured: false,
      created_at: '2025-10-02T12:00:00.000Z',
      updated_at: '2025-10-02T12:00:00.000Z',
    };

    mockSupabase.single.mockImplementationOnce(async () => ({
      data: insertedRow,
      error: null,
    }));

    const result = await repository.createPost(payload);

    expect(mockNanoid).toHaveBeenCalledTimes(1);
    expect(mockSupabase.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'generated-microblog-id',
        title: payload.title,
      })
    );

    expect(result).toEqual({
      id: insertedRow.id,
      title: insertedRow.title,
      excerpt: insertedRow.excerpt,
      content: insertedRow.content,
      author: insertedRow.author,
      publishedAt: insertedRow.published_at,
      tags: insertedRow.tags,
      readTime: insertedRow.read_time,
      imageUrl: undefined,
      status: 'draft',
      featured: false,
      categories: [],
      createdAt: insertedRow.created_at,
      updatedAt: insertedRow.updated_at,
    });
  });

  it('throws when Supabase returns an error', async () => {
    const mockSupabase = createMockSupabaseClient();
    mockGetSupabase.mockReturnValue(mockSupabase as never);

    mockSupabase.single.mockImplementationOnce(async () => ({
      data: null,
      error: { message: 'RLS violation' },
    }));

    const payload: PostCreate = {
      title: 'Another Microblog Post',
      excerpt: 'This excerpt is long enough to pass validation for the test.',
      content: 'This content body also exceeds the fifty character minimum required.',
      author: 'Integration Tester',
      publishedAt: '2025-10-02T12:30:00.000Z',
      tags: [],
      status: 'draft',
      featured: false,
      categories: [],
    };

    await expect(repository.createPost(payload)).rejects.toThrow('Failed to create post: RLS violation');
  });
});
