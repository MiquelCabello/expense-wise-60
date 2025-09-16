# 🧪 Testing Guide - ExpenseWise

## 📋 **Testing Stack**

- **Test Runner**: Vitest (faster than Jest)
- **Testing Library**: @testing-library/react
- **Mocking**: Vitest mocks
- **Coverage**: Built-in Vitest coverage

---

## 🚀 **Running Tests**

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Type checking
npm run typecheck
```

---

## 📁 **Test Structure**

```
src/
├── test/
│   ├── setup.ts          # Global test setup
│   ├── test-utils.tsx    # Testing utilities & mocks
│   └── __tests__/        # General tests
├── components/
│   └── __tests__/        # Component tests
├── hooks/
│   └── __tests__/        # Hook tests  
└── pages/
    └── __tests__/        # Page tests
```

---

## ✅ **What's Tested**

### **Current Coverage**
- ✅ ErrorBoundary component
- ✅ Basic testing setup
- ✅ Mock configurations (Supabase, Router, Icons)

### **Next Steps**
- [ ] Authentication flows
- [ ] Form validations  
- [ ] File upload functionality
- [ ] API integrations
- [ ] User interactions

---

## 🛠️ **Writing Tests**

### **Component Tests**
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### **Hook Tests**
```typescript
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMyHook } from '../useMyHook';

describe('useMyHook', () => {
  it('returns expected values', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe('expected');
  });
});
```

### **Integration Tests**
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('User Flow', () => {
  it('completes expense creation', async () => {
    const user = userEvent.setup();
    render(<ExpenseForm />);
    
    await user.type(screen.getByLabelText('Amount'), '100');
    await user.click(screen.getByText('Save'));
    
    expect(screen.getByText('Expense saved')).toBeInTheDocument();
  });
});
```

---

## 🎯 **Testing Best Practices**

### **DO ✅**
- Test user behavior, not implementation
- Use semantic queries (`getByRole`, `getByLabelText`)
- Mock external dependencies (APIs, storage)
- Test error states and edge cases
- Keep tests simple and focused

### **DON'T ❌**
- Test implementation details
- Test library code
- Write tests that are too complex
- Mock everything (test real interactions when possible)
- Ignore accessibility in tests

---

## 🔧 **Mock Configurations**

### **Supabase Mocks**
```typescript
// Already configured in src/test/setup.ts
const mockSupabase = {
  auth: { /* auth methods */ },
  from: () => ({ /* database methods */ }),
  storage: { /* storage methods */ },
};
```

### **Router Mocks**
```typescript
// Navigation is mocked automatically
useNavigate() // Returns vi.fn()
useLocation() // Returns { pathname: '/' }
```

### **Icon Mocks**
```typescript
// All Lucide icons return simple strings
<Upload /> // Returns 'Upload'
```

---

## 📊 **Coverage Goals**

| Component Type | Target Coverage |
|---------------|----------------|
| Critical Components | 90%+ |
| UI Components | 80%+ |
| Utility Functions | 95%+ |
| Integration Points | 85%+ |
| **Overall Project** | **80%+** |

---

## 🐛 **Debugging Tests**

### **Common Issues**
```bash
# Module not found
# → Check import paths and aliases

# Component not rendering
# → Check if proper providers are wrapped

# Async issues
# → Use waitFor() for async operations

# Mock not working
# → Verify mock is called before import
```

### **Debug Commands**
```bash
# Run specific test file
npm run test ErrorBoundary.test.tsx

# Run tests with verbose output
npm run test -- --reporter=verbose

# Debug with node inspector
npm run test -- --inspect-brk
```

---

## 🎭 **Advanced Testing**

### **E2E Testing (Future)**
```bash
# Will add Playwright for E2E tests
npm install @playwright/test
```

### **Visual Testing (Future)**
```bash
# Will add Chromatic for visual regression
npm install chromatic
```

### **Performance Testing (Future)**
```bash
# Will add performance testing utilities
npm install @testing-library/jest-dom
```

---

## 📈 **Continuous Integration**

Tests will automatically run on:
- ✅ Every commit (pre-commit hook)
- ✅ Pull requests (GitHub Actions)  
- ✅ Before deployment (CI/CD pipeline)

---

**🎯 Goal: Achieve 80%+ test coverage by end of Phase 2**