// jest.config.js
module.exports = {
<<<<<<<< HEAD:tests/unit/config/jest.config.js
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  rootDir: '../../',
  testMatch: ['<rootDir>/tests/unit/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)'],
========
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  rootDir: '../../',
  testMatch: [
    '<rootDir>/tests/__tests__/**/*.(test|spec).(ts|tsx)',
    '<rootDir>/tests/**/*.(test|spec).(ts|tsx)'
  ],
>>>>>>>> origin/master:tests/integration/config/jest.config.cjs
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
    '^react-dnd$': '<rootDir>/tests/unit/__mocks__/react-dnd.js',
    '^react-dnd-html5-backend$': '<rootDir>/tests/unit/__mocks__/react-dnd-html5-backend.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-dnd|react-dnd-html5-backend|dnd-core|@react-dnd))',
  ],
<<<<<<<< HEAD:tests/unit/config/jest.config.js
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup/jest.setup.js'],
========
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],
>>>>>>>> origin/master:tests/integration/config/jest.config.cjs
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    '<rootDir>/**/*.{ts,tsx}',
    '!<rootDir>/**/*.d.ts',
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
