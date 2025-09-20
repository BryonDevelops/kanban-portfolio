// Task fixtures for E2E testing
// Using the task structure expected by the project schema
type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  created_at: Date;
  updated_at?: Date;
};

// Base task template
const createBaseTask = (overrides: Partial<Task> = {}): Task => ({
  id: `e2e-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  title: 'E2E Test Task',
  description: 'Created by E2E test fixture',
  status: 'todo',
  created_at: new Date(),
  ...overrides,
});

// Predefined task fixtures
export const taskFixtures = {
  // Basic task for standard tests
  basic(): Task {
    return createBaseTask({
      title: 'Basic Test Task',
      description: 'A simple task for basic testing',
    });
  },

  // Task with minimal data
  minimal(): Task {
    return createBaseTask({
      title: 'Minimal Task',
      description: '',
    });
  },

  // Task with extensive data
  extensive(): Task {
    return createBaseTask({
      title: 'Extensive Test Task with Very Long Title That Tests Character Limits and Wrapping',
      description: 'This is a comprehensive task description that includes multiple sentences and detailed requirements. It tests how the system handles longer text content and provides a realistic example of task documentation that might be entered by users in real-world scenarios.',
    });
  },

  // Task with special characters
  withSpecialCharacters(): Task {
    return createBaseTask({
      title: 'Special Chars: åäö ñ éèê 中文 🚀 @#$%',
      description: 'Testing unicode & special characters: "quotes", <tags>, & symbols!',
    });
  },

  // Edge case scenarios
  emptyFields(): Task {
    return createBaseTask({
      title: '',
      description: '',
    });
  },

  // Performance testing - batch of tasks
  createBatch(count: number = 5): Task[] {
    return Array.from({ length: count }, (_, index) =>
      createBaseTask({
        title: `Batch Task ${index + 1}`,
        description: `Batch task #${index + 1} for performance testing`,
      })
    );
  },

  // For update testing
  forUpdate(): { original: Task; updates: Partial<Task> } {
    const original = createBaseTask({
      title: 'Original Task Title',
      description: 'Original description',
    });

    const updates = {
      title: 'Updated Task Title',
      description: 'Updated description with more details',
    };

    return { original, updates };
  },

  // Different types of tasks
  bugFix(): Task {
    return createBaseTask({
      title: 'Fix critical bug in user authentication',
      description: 'Users are unable to login with their credentials. Need to investigate and fix the authentication flow.',
    });
  },

  feature(): Task {
    return createBaseTask({
      title: 'Implement dark mode toggle',
      description: 'Add a toggle switch to allow users to switch between light and dark themes.',
    });
  },

  documentation(): Task {
    return createBaseTask({
      title: 'Update API documentation',
      description: 'The API documentation is outdated and needs to reflect the latest changes in the endpoints.',
    });
  },

  testing(): Task {
    return createBaseTask({
      title: 'Write unit tests for user service',
      description: 'Add comprehensive unit tests to improve code coverage for the user service module.',
    });
  },
};