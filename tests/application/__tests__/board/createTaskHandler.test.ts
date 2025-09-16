import { CreateTaskHandler } from '../../../../application/board/handlers/createTaskHandler';
import { createMockTaskRepository } from '../../__mocks__/repositories';
import { Task } from '../../../../domain/task';

describe('CreateTaskHandler', () => {
  let handler: CreateTaskHandler;
  let mockRepository: ReturnType<typeof createMockTaskRepository>;

  beforeEach(() => {
    mockRepository = createMockTaskRepository();
    handler = new CreateTaskHandler(mockRepository);
  });

  describe('execute', () => {
    it('should create a task successfully with valid data', async () => {
      // Arrange
      const validTaskData = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'idea' as const,
        order: 1,
        columnId: 'ideas'
      };

      const expectedTask: Task = {
        ...validTaskData,
        id: expect.any(String),
      };

      mockRepository.create.mockResolvedValue(expectedTask);

      // Act
      const result = await handler.execute(validTaskData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.task).toEqual(expectedTask);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...validTaskData,
          id: expect.any(String)
        })
      );
    });

    it('should return error for invalid data', async () => {
      // Arrange
      const invalidTaskData = {
        title: '', // Invalid: empty title
        status: 'invalid-status' // Invalid status
      };

      // Act
      const result = await handler.execute(invalidTaskData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      // Arrange
      const validTaskData = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'idea' as const,
        order: 1,
        columnId: 'ideas'
      };

      mockRepository.create.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await handler.execute(validTaskData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });
});