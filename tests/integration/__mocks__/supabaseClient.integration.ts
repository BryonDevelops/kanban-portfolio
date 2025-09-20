// Mock for lib/supabaseClient module
import { createMockSupabaseClient } from './supabase.integration';

const mockSupabaseClient = createMockSupabaseClient();

export const getSupabase = jest.fn().mockReturnValue(mockSupabaseClient);

// Export the mock client for direct access in tests
export { mockSupabaseClient };