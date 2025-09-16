import { describe, it, expect } from 'vitest';

// Simple example test to verify testing setup works
describe('Testing Setup', () => {
  it('should run basic tests', () => {
    expect(2 + 2).toBe(4);
  });

  it('should handle string operations', () => {
    const greeting = 'Hello, ExpenseWise!';
    expect(greeting).toContain('ExpenseWise');
    expect(greeting.length).toBeGreaterThan(0);
  });

  it('should work with async operations', async () => {
    const asyncOperation = () => Promise.resolve('success');
    const result = await asyncOperation();
    expect(result).toBe('success');
  });

  it('should handle arrays and objects', () => {
    const users = [
      { id: 1, name: 'John', role: 'EMPLOYEE' },
      { id: 2, name: 'Jane', role: 'ADMIN' },
    ];

    expect(users).toHaveLength(2);
    expect(users[0]).toHaveProperty('id', 1);
    expect(users.find(u => u.role === 'ADMIN')).toBeDefined();
  });
});