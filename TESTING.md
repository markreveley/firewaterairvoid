# Testing Guide

This project uses [Vitest](https://vitest.dev/) for unit and component testing.

## Running Tests

```bash
# Run tests in watch mode (reruns on file changes)
npm test

# Run tests once and exit
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are colocated with their source files using the `.test.ts` or `.test.tsx` extension:

```
src/
├── utils/
│   ├── itemTypes.ts
│   ├── itemTypes.test.ts  # ← Tests for itemTypes.ts
│   ├── time.ts
│   └── time.test.ts       # ← Tests for time.ts
├── components/
│   ├── ParentItemSelector.tsx
│   └── ParentItemSelector.test.tsx  # ← Tests for component
└── test/
    ├── setup.ts          # Test setup and global mocks
    └── utils.tsx         # Testing utilities and custom render
```

## What's Tested

### ✅ Utility Functions (19 tests)
- **itemTypes.ts** - Type checking functions (`supportsUrl`, `supportsStatus`, `supportsDeadline`)
- **time.ts** - Time generation utilities
- **tagFilters.ts** - Tag filtering logic for different item types

### ✅ Components (7 tests)
- **ParentItemSelector** - Parent item selection component
  - Rendering with/without selection
  - Title truncation
  - Clear functionality
  - Current item exclusion
  - Custom className application

## Writing New Tests

### Testing a Utility Function

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myFunction';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### Testing a Component

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle clicks', () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalled();
  });
});
```

## Mocks and Setup

Global mocks are configured in `src/test/setup.ts`:

- **ResizeObserver** - Mocked for components using resize observers
- **scrollIntoView** - Mocked for Command/Combobox components
- **Automatic cleanup** - Components are automatically unmounted after each test

## Test Coverage

Current test coverage:

| Category | Files | Tests | Status |
|----------|-------|-------|--------|
| Utils    | 3     | 19    | ✅ 100% |
| Components | 1   | 7     | ✅ 100% |
| **Total** | **4** | **26** | **✅ All passing** |

## Future Test Coverage

Consider adding tests for:

- [  ] **Custom Hooks** (`useItems`, `useTags`)
- [  ] **Integration Tests** (Full CRUD flows)
- [  ] **Form Validation** (ItemDetail form)
- [  ] **Tag Management** (TagFilter, TagsManagement components)

## CI/CD Integration

To run tests in CI:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:run
```

## Debugging Tests

### Run a single test file:
```bash
npm test src/utils/itemTypes.test.ts
```

### Run tests matching a pattern:
```bash
npm test -- --grep="ParentItemSelector"
```

### Debug in VS Code:
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test"],
  "console": "integratedTerminal"
}
```
