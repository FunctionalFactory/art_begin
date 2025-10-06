// Mock Supabase client for testing

export const mockSupabaseClient = {
  from: jest.fn(() => mockSupabaseClient),
  select: jest.fn(() => mockSupabaseClient),
  insert: jest.fn(() => mockSupabaseClient),
  update: jest.fn(() => mockSupabaseClient),
  delete: jest.fn(() => mockSupabaseClient),
  eq: jest.fn(() => mockSupabaseClient),
  neq: jest.fn(() => mockSupabaseClient),
  gt: jest.fn(() => mockSupabaseClient),
  gte: jest.fn(() => mockSupabaseClient),
  lt: jest.fn(() => mockSupabaseClient),
  lte: jest.fn(() => mockSupabaseClient),
  in: jest.fn(() => mockSupabaseClient),
  is: jest.fn(() => mockSupabaseClient),
  not: jest.fn(() => mockSupabaseClient),
  or: jest.fn(() => mockSupabaseClient),
  order: jest.fn(() => mockSupabaseClient),
  limit: jest.fn(() => mockSupabaseClient),
  range: jest.fn(() => mockSupabaseClient),
  single: jest.fn(() => Promise.resolve({ data: null, error: null })),
  maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
  textSearch: jest.fn(() => mockSupabaseClient),
  rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
  auth: {
    getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signUp: jest.fn(() => Promise.resolve({ data: null, error: null })),
    signInWithPassword: jest.fn(() => Promise.resolve({ data: null, error: null })),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
    admin: {
      getUserById: jest.fn(() => Promise.resolve({ data: null, error: null })),
    },
  },
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(() => Promise.resolve({ data: null, error: null })),
      download: jest.fn(() => Promise.resolve({ data: null, error: null })),
      getPublicUrl: jest.fn(() => ({ data: { publicUrl: '' } })),
    })),
  },
}

export const createClient = jest.fn(() => mockSupabaseClient)

// Mock the server client
jest.mock('@/utils/supabase/server', () => ({
  createClient: () => Promise.resolve(mockSupabaseClient),
}))

// Mock the client client
jest.mock('@/utils/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}))
