import { jest } from '@jest/globals';

// Mock for Supabase client used in integration tests
export const createMockSupabaseClient = () => {
  const mockSupabase = {
    from: jest.fn(),
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    eq: jest.fn(),
    order: jest.fn(),
    single: jest.fn(),
    upsert: jest.fn(),
    match: jest.fn(),
    range: jest.fn(),
    limit: jest.fn(),
  };

  // Configure the chain - each method returns the mock itself
  mockSupabase.from.mockReturnValue(mockSupabase);
  mockSupabase.select.mockReturnValue(mockSupabase);
  mockSupabase.insert.mockReturnValue(mockSupabase);
  mockSupabase.update.mockReturnValue(mockSupabase);
  mockSupabase.delete.mockReturnValue(mockSupabase);
  mockSupabase.eq.mockReturnValue(mockSupabase);
  mockSupabase.order.mockReturnValue(mockSupabase);
  mockSupabase.single.mockReturnValue(mockSupabase);
  mockSupabase.upsert.mockReturnValue(mockSupabase);
  mockSupabase.match.mockReturnValue(mockSupabase);
  mockSupabase.range.mockReturnValue(mockSupabase);
  mockSupabase.limit.mockReturnValue(mockSupabase);

  return mockSupabase;
};

// Mock responses
export const createMockSuccessResponse = <T>(data: T) => ({
  data,
  error: null,
  status: 200,
  statusText: 'OK',
});

export const createMockErrorResponse = (error: Error) => ({
  data: null,
  error,
  status: 500,
  statusText: 'Internal Server Error',
});

// Common mock data
export const mockProject = {
  id: '1',
  title: 'Test Project',
  description: 'Test Description',
  status: 'planning' as const,
  technologies: ['React', 'TypeScript'],
};

export const mockTask = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
};