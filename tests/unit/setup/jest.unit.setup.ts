import '@testing-library/jest-dom'
import { jest as jestGlobal } from '@jest/globals'

// Ensure `jest` is available as a global in ESM test environment
let jest: typeof jestGlobal
globalThis.jest = jestGlobal

// Mock window.matchMedia for components using use-mobile hook
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jestGlobal.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jestGlobal.fn(), // deprecated
    removeListener: jestGlobal.fn(), // deprecated
    addEventListener: jestGlobal.fn(),
    removeEventListener: jestGlobal.fn(),
    dispatchEvent: jestGlobal.fn(),
  })),
});

// Mock window.innerWidth for use-mobile hook
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});
