import '@testing-library/jest-dom'
import { jest as jestGlobal } from '@jest/globals'

// Ensure `jest` is available as a global in ESM test environment
let jest: typeof jestGlobal
globalThis.jest = jestGlobal
