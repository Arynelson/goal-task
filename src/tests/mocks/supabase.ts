import { vi } from 'vitest';

export const mockSupabaseFrom = vi.fn(() => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
}));

export const mockSupabase = {
  from: mockSupabaseFrom,
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
  },
};

// Mock do módulo supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));
