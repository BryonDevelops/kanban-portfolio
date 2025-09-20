// Jest setup for E2E tests
// This file runs before each test file and sets up the test environment

import 'jest';

// Set test environment timeout for longer database operations
jest.setTimeout(30000);

// Setup test environment variables
if (!process.env.NODE_ENV) {
  Object.assign(process.env, { NODE_ENV: 'test' });
}

// Log that E2E test environment is ready
console.log('🚀 E2E Test Environment Ready');
console.log('📊 Test Mode: Real Database Connections');
console.log('⏱️  Timeout: 30 seconds per test');

// Global setup for database tests
beforeAll(() => {
  console.log('🔧 Setting up E2E test suite...');
});

afterAll(() => {
  console.log('🧹 E2E test suite completed');
});

// Handle uncaught errors gracefully in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Export for any additional test utilities
export {};