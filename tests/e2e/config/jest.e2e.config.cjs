// jest.config.cjs for E2E database tests
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  rootDir: '../../../',
  testMatch: [
    '<rootDir>/tests/e2e/__tests__/**/*.(test|spec).(ts|tsx)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        target: 'es2020',
        module: 'esnext',
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        types: ['jest', 'node'],
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup/jest.e2e.setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    '<rootDir>/infrastructure/**/*.{ts,tsx}',
    '!<rootDir>/infrastructure/**/*.d.ts',
    '!<rootDir>/node_modules/**',
    '!<rootDir>/.next/**',
    '!<rootDir>/tests/**',
  ],
  // Longer timeout for real database operations
  testTimeout: 30000,
  // Don't clear mocks - we want real implementations
  clearMocks: false,
  // Run tests serially to avoid database conflicts
  maxWorkers: 1,
};