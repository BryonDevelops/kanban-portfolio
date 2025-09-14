// jest.config.js
export default {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          jsx: 'react-jsx',
        },
      },
    ],
  },
  moduleNameMapper: {
    // Next.js static imports
    '^@/(.*)$': '<rootDir>/$1',
    // Mock react-dnd for ESM compatibility
    '^react-dnd$': '<rootDir>/__mocks__/react-dnd.js',
    '^react-dnd-html5-backend$': '<rootDir>/__mocks__/react-dnd-html5-backend.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
