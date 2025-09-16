import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

// Simple test component
const TestComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error('Test error');
  return <div>Working correctly</div>;
};

describe('ErrorBoundary', () => {
  const originalError = console.error;
  beforeEach(() => { console.error = vi.fn(); });
  afterEach(() => { console.error = originalError; });

  it('shows children when no error', () => {
    render(
      <ErrorBoundary>
        <TestComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Working correctly')).toBeInTheDocument();
  });

  it('shows error UI when error occurs', () => {
    render(
      <ErrorBoundary>
        <TestComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('¡Algo salió mal!')).toBeInTheDocument();
  });
});