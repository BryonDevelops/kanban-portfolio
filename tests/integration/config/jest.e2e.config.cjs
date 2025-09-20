// jest.config.cjs for integration layer tests
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node', // Node environment for integration tests
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  rootDir: '../../../',
  testMatch: [
    '<rootDir>/tests/integration/__tests__/**/*.(test|spec).(ts|tsx)',
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
  setupFilesAfterEnv: ['<rootDir>/tests/integration/setup/jest.setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    '<rootDir>/infrastructure/**/*.{ts,tsx}',
    '!<rootDir>/infrastructure/**/*.d.ts',
    '!<rootDir>/node_modules/**',
    '!<rootDir>/.next/**',
    '!<rootDir>/tests/**',
  ],
  // Increase timeout for database operations
  testTimeout: 10000,
  // Clear mocks between tests
  clearMocks: true,
};