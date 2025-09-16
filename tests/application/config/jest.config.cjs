// jest.config.js for application layer tests
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  rootDir: '../../../',
  testMatch: [
    '<rootDir>/tests/application/__tests__/**/*.(test|spec).(ts|tsx)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
        target: 'es2020',
        module: 'esnext',
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        types: ['jest', '@testing-library/jest-dom', 'node'],
      },
    }],
    '^.+\\.(js|jsx)$': ['babel-jest', {
      presets: [
        ["@babel/preset-env", { targets: { node: "current" } }],
        ["@babel/preset-react", { runtime: "automatic" }],
        "@babel/preset-typescript"
      ]
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^react-dnd$': '<rootDir>/tests/application/__mocks__/react-dnd.js',
    '^react-dnd-html5-backend$': '<rootDir>/tests/application/__mocks__/react-dnd-html5-backend.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-dnd|react-dnd-html5-backend|dnd-core|@react-dnd))',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/application/setup/jest.setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    '<rootDir>/application/**/*.{ts,tsx}',
    '!<rootDir>/application/**/*.d.ts',
    '!<rootDir>/node_modules/**',
    '!<rootDir>/.next/**',
    '!<rootDir>/tests/**',
  ],
  globals: {
    'ts-jest': {
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
  }
};