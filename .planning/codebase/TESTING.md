# Testing Patterns

**Analysis Date:** 2026-05-11

## Current State: No Tests Exist

This project has **no testing infrastructure, no test files, no test configuration, and no test scripts**. The project is at an early stage with only 4 source files and 1 CSS file. Testing has not been set up yet.

## Recommended Framework

Based on the project stack (Next.js 16, React 19, TypeScript, TailwindCSS), the recommended testing setup:

### Test Runner: Vitest

Vitest is the preferred choice for this project because:
- Native ESM and TypeScript support without extra configuration
- Fast, Vite-powered test runner
- Excellent integration with Next.js via `@vitest/browser` or server-side testing
- Compatible with the existing `tsconfig.json` path aliases

### Component Testing: React Testing Library

For testing React components:
- `@testing-library/react` -- render and interact with components
- `@testing-library/jest-dom` -- custom DOM matchers (`toBeInTheDocument`, etc.)
- `@testing-library/user-event` -- realistic user interaction simulation

### Setup Commands

```bash
# Install testing dependencies
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react

# Optional: for E2E testing
pnpm add -D @playwright/test
```

## Test Configuration (To Be Created)

### vitest.config.ts

Create at project root:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "src/**/*.spec.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### Test Setup File

Create `src/__tests__/setup.ts`:

```typescript
import "@testing-library/jest-dom/vitest";
```

### package.json Scripts (To Be Added)

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Test File Organization

### Location Pattern: Co-located test files

Place test files next to the source files they test:

```
src/
├── app/
│   ├── page.tsx
│   ├── page.test.tsx           # Tests for Home page
│   └── layout.tsx
├── components/
│   └── layout/
│       ├── Navbar.tsx
│       ├── Navbar.test.tsx      # Tests for Navbar
│       ├── ThemeProvider.tsx
│       └── ThemeProvider.test.tsx
├── lib/
│   ├── utils.ts
│   └── utils.test.ts           # Tests for utility functions
└── __tests__/
    └── setup.ts                # Global test setup
```

### Naming Convention

- Test files: `[filename].test.tsx` for components, `[filename].test.ts` for utilities
- Alternative: `[filename].spec.tsx` / `[filename].spec.ts` (both are acceptable)

## Test Structure

### Suite Organization

Follow the AAA (Arrange-Act-Assert) pattern with `describe`/`it` blocks:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navbar } from "./Navbar";

// Mock next/navigation for usePathname
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// Mock next-themes for useTheme
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

describe("Navbar", () => {
  it("renders the WooBooster brand name", () => {
    render(<Navbar />);
    expect(screen.getByText(/Booster/)).toBeInTheDocument();
  });

  it("renders all navigation links", () => {
    render(<Navbar />);
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Pricing")).toBeInTheDocument();
  });
});
```

### Server Component Testing

For server components (no `"use client"`), test with async rendering:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home page", () => {
  it("renders the heading", async () => {
    const component = await Home({});
    render(component);
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });
});
```

## Mocking

### Framework: Vitest built-in (`vi`)

### Mocking External Modules

Mock Next.js and third-party hooks that depend on browser/router context:

```typescript
// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

// Mock framer-motion to avoid animation complexity in tests
vi.mock("framer-motion", () => ({
  motion: new Proxy({}, {
    get: (_, tag) => {
      // eslint-disable-next-line @next/next/no-html-link-for-pages
      return ({ children, ...props }: any) =>
            require("react").createElement(String(tag), props, children);
    },
  }),
  AnimatePresence: ({ children }: any) => children,
}));
```

### What to Mock
- `next/navigation` -- router hooks (`usePathname`, `useRouter`)
- `next-themes` -- theme hooks (`useTheme`)
- `framer-motion` -- animation components (render as plain elements)
- `next/image` -- simplify image rendering in tests
- `window` APIs -- `scrollY`, `matchMedia`, etc.

### What NOT to Mock
- The component under test itself
- React hooks (`useState`, `useEffect`) -- let them run naturally
- CSS classes and styling -- not relevant for logic tests
- Utility functions like `cn()` -- test the real behavior

## Fixtures and Factories

No test data fixtures exist yet. As the project grows:

### Location
- `src/__tests__/fixtures/` -- shared test data
- `src/__tests__/mocks/` -- shared mock implementations

### Pattern for Test Data

```typescript
// src/__tests__/fixtures/navigation.ts
export const mockNavLinks = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
];

// src/__tests__/mocks/nextNavigation.ts
export const mockUsePathname = (path: string = "/") =>
  vi.fn(() => path);
```

## Coverage

**Requirements:** None enforced yet. Recommended target: 70% for new code.

**View Coverage (after setup):**
```bash
pnpm test:coverage
```

**Configuration (to add to vitest.config.ts):**
```typescript
test: {
  coverage: {
    provider: "v8",
    reporter: ["text", "html", "lcov"],
    include: ["src/**/*.{ts,tsx}"],
    exclude: ["src/**/*.test.{ts,tsx}", "src/__tests__/**"],
  },
}
```

## Test Types

### Unit Tests
- **Scope:** Individual functions, utility helpers, hooks
- **Approach:** Test pure logic in isolation
- **Priority:** High -- start with `cn()` utility and any future helpers
- **Location:** Co-located next to source files

### Component Tests
- **Scope:** Individual React components
- **Approach:** Render with React Testing Library, test behavior and accessibility
- **Priority:** High -- test Navbar, ThemeProvider, and all new components
- **Location:** Co-located next to component files

### Integration Tests
- **Scope:** Page-level rendering with multiple components
- **Approach:** Render full pages, test component interactions
- **Priority:** Medium -- test layout with Navbar + content + Footer

### E2E Tests
- **Framework:** Not used yet. Consider Playwright when critical user flows exist.
- **Priority:** Low -- defer until pages are feature-complete

## Common Patterns

### Async Testing

```typescript
import { waitFor, findByText } from "@testing-library/react";

it("handles async data loading", async () => {
  render(<Component />);
  await waitFor(() => {
    expect(screen.getByText("Loaded")).toBeInTheDocument();
  });
  // Or use findBy (combines waitFor + getBy)
  expect(await screen.findByText("Loaded")).toBeInTheDocument();
});
```

### Error Testing

```typescript
it("renders error state when data fetch fails", async () => {
  vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));
  render(<Component />);
  expect(await screen.findByText(/error/i)).toBeInTheDocument();
});
```

### User Interaction Testing

```typescript
it("toggles mobile menu on button click", async () => {
  const user = userEvent.setup();
  render(<Navbar />);
  const menuButton = screen.getByRole("button", { name: /menu/i });
  await user.click(menuButton);
  expect(screen.getByText("Get WooBooster")).toBeInTheDocument();
});
```

### Testing Theme Toggle

```typescript
it("calls setTheme when theme toggle is clicked", async () => {
  const mockSetTheme = vi.fn();
  vi.mocked(useTheme).mockReturnValue({ theme: "light", setTheme: mockSetTheme });
  const user = userEvent.setup();
  render(<Navbar />);
  await user.click(screen.getByRole("button", { name: /moon/i }));
  expect(mockSetTheme).toHaveBeenCalledWith("dark");
});
```

## Priority Test Cases to Implement First

1. **`src/lib/utils.ts`** -- Test the `cn()` utility function (when created)
2. **`src/components/layout/Navbar.tsx`** -- Test rendering, navigation links, theme toggle, mobile menu
3. **`src/components/layout/ThemeProvider.tsx`** -- Test that it wraps children correctly
4. **`src/app/page.tsx`** -- Test that the home page renders expected content
5. **`src/app/layout.tsx`** -- Test font loading, metadata, and layout structure

---

*Testing analysis: 2026-05-11*
