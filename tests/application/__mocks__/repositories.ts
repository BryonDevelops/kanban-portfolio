// Mock repository interfaces for application layer testing
export const createMockTaskRepository = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

export const createMockProjectRepository = () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByStatus: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});