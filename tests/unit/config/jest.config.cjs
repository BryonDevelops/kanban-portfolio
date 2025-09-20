// jest.config.cjs
module.exports = {
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  rootDir: '../../../',
  testMatch: ['<rootDir>/tests/unit/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)'],
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
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup/jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
