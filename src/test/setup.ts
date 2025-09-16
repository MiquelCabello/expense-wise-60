import '@testing-library/jest-dom';
import { beforeAll, vi } from 'vitest';

// Mock environment variables
beforeAll(() => {
  Object.defineProperty(import.meta, 'env', {
    value: {
      VITE_SUPABASE_URL: 'https://test-project.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'test-anon-key',
      VITE_SUPABASE_PROJECT_ID: 'test-project',
      MODE: 'test',
      DEV: false,
      PROD: false,
    },
    writable: true,
  });
});

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ 
        data: { session: null }, 
        error: null 
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test-url.com' } }),
        remove: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  },
}));

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
  };
});

// Mock Lucide React icons  
vi.mock('lucide-react', () => ({
  // Most commonly used icons in the app
  User: vi.fn(() => 'User'),
  Mail: vi.fn(() => 'Mail'),
  Lock: vi.fn(() => 'Lock'),
  Eye: vi.fn(() => 'Eye'),
  EyeOff: vi.fn(() => 'EyeOff'),
  Upload: vi.fn(() => 'Upload'),
  Camera: vi.fn(() => 'Camera'),
  FileImage: vi.fn(() => 'FileImage'),
  Loader2: vi.fn(() => 'Loader2'),
  CheckCircle: vi.fn(() => 'CheckCircle'),
  AlertTriangle: vi.fn(() => 'AlertTriangle'),
  X: vi.fn(() => 'X'),
  Sparkles: vi.fn(() => 'Sparkles'),
  Settings: vi.fn(() => 'Settings'),
  LogOut: vi.fn(() => 'LogOut'),
  Home: vi.fn(() => 'Home'),
  RefreshCw: vi.fn(() => 'RefreshCw'),
  CalendarIcon: vi.fn(() => 'CalendarIcon'),
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-object-url');
global.URL.revokeObjectURL = vi.fn();

// Mock crypto.subtle for file checksums
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
    },
    randomUUID: vi.fn().mockReturnValue('mocked-uuid'),
  },
});