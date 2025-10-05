// jest.config.cjs
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  rootDir: '../../../',
  testMatch: [
    '<rootDir>/tests/unit/__tests__/**/*.(test|spec).(ts|tsx)',
  ],
  // types moved to globals below
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true }],
    '^.+\\.(js|jsx)$': ['babel-jest', { configFile: true }],
  },
  collectCoverageFrom: [
    'tests/unit/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!node_modules/**',
    '!.next/**',
    '!tests/**',
  ],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
        target: 'es2020',
        module: 'esnext',
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        types: ['jest', '@testing-library/jest-dom', 'node'],
      }
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^react-dnd$': '<rootDir>/tests/presentation/__mocks__/react-dnd.js',
    '^react-dnd-html5-backend$': '<rootDir>/tests/presentation/__mocks__/react-dnd-html5-backend.js',
    '\\.(css|scss|sass)$': '<rootDir>/tests/unit/__mocks__/styleMock.cjs',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-dnd|react-dnd-html5-backend|dnd-core|@react-dnd))',
  ],
  injectGlobals: true,
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup/jest.unit.setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
