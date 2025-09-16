import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { vi } from 'vitest';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';

// Mock AuthContext
interface MockAuthContextType {
  user: User | null;
  session: any | null;
  profile: Profile | null;
  loading: boolean;
  signIn: any;
  signUp: any;
  signOut: any;
  isAdmin: boolean;
  isApprover: boolean;
}

const createMockAuthContext = (overrides: Partial<MockAuthContextType> = {}): MockAuthContextType => ({
  user: null,
  session: null,
  profile: null,
  loading: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  isAdmin: false,
  isApprover: false,
  ...overrides,
});

// Create a test wrapper component
interface AllTheProvidersProps {
  children: React.ReactNode;
  authContext?: Partial<MockAuthContextType>;
}

const AllTheProviders = ({ children, authContext = {} }: AllTheProvidersProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const mockAuth = createMockAuthContext(authContext);

  // Mock the AuthContext
  const AuthContext = React.createContext(mockAuth);
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <AuthContext.Provider value={mockAuth}>
            {children}
            <Toaster />
          </AuthContext.Provider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Custom render function
const customRender = (
  ui: React.ReactElement,
  options: RenderOptions & { authContext?: Partial<MockAuthContextType> } = {}
) => {
  const { authContext, ...renderOptions } = options;
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders authContext={authContext}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Mock user profiles
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2023-01-01T00:00:00.000Z',
  last_sign_in_at: '2023-01-01T00:00:00.000Z',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  ...overrides,
});

export const createMockProfile = (overrides: Partial<Profile> = {}): Profile => ({
  id: 'test-profile-id',
  user_id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'EMPLOYEE',
  status: 'ACTIVE',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
  ...overrides,
});

// Export everything
export * from '@testing-library/react';  
export { default as userEvent } from '@testing-library/user-event';
export { customRender as render };
export { createMockAuthContext };