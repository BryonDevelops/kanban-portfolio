// jest.config.cjs for service layer tests
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node', // Node environment for service layer tests
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  rootDir: '../../../',
  testMatch: [
    '<rootDir>/tests/services/__tests__/**/*.(test|spec).(ts|tsx)',
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
  setupFilesAfterEnv: ['<rootDir>/tests/services/setup/jest.services.setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    '<rootDir>/services/**/*.{ts,tsx}',
    '!<rootDir>/services/**/*.d.ts',
    '!<rootDir>/node_modules/**',
    '!<rootDir>/.next/**',
    '!<rootDir>/tests/**',
  ],
  // Increase timeout for service layer operations
  testTimeout: 10000,
  // Clear mocks between tests
  clearMocks: true,
  // Remove deprecated globals section - using transform config above
};