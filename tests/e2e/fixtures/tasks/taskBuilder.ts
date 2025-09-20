// Task builder for dynamic E2E test data
// Using the task structure expected by the project schema
type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  created_at: Date;
  updated_at?: Date;
};

export class TaskBuilder {
  private task: Task;

  constructor() {
    // Start with sensible defaults
    this.task = {
      id: `e2e-task-builder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'Builder Task',
      description: 'Created with TaskBuilder',
      status: 'todo',
      created_at: new Date(),
    };
  }

  // Fluent interface methods
  withId(id: string): TaskBuilder {
    this.task.id = id;
    return this;
  }

  withTitle(title: string): TaskBuilder {
    this.task.title = title;
    return this;
  }

  withDescription(description: string): TaskBuilder {
    this.task.description = description;
    return this;
  }

  // Preset configurations
  asMinimal(): TaskBuilder {
    this.task.description = '';
    return this;
  }

  asComplex(): TaskBuilder {
    this.task.title = 'Complex Task with Detailed Requirements';
    this.task.description = 'This is a complex task with extensive requirements and detailed specifications that need to be implemented carefully.';
    return this;
  }

  asBugFix(): TaskBuilder {
    this.task.title = `Bug Fix: ${this.task.title}`;
    this.task.description = `🐛 ${this.task.description}`;
    return this;
  }

  asFeature(): TaskBuilder {
    this.task.title = `Feature: ${this.task.title}`;
    this.task.description = `✨ ${this.task.description}`;
    return this;
  }

  asDocumentation(): TaskBuilder {
    this.task.title = `Docs: ${this.task.title}`;
    this.task.description = `📝 ${this.task.description}`;
    return this;
  }

  asTesting(): TaskBuilder {
    this.task.title = `Test: ${this.task.title}`;
    this.task.description = `🧪 ${this.task.description}`;
    return this;
  }

  // Utility methods
  withUniqueId(): TaskBuilder {
    this.task.id = `e2e-task-unique-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return this;
  }

  withTestPrefix(prefix: string): TaskBuilder {
    this.task.id = `e2e-task-${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.task.title = `${prefix} - ${this.task.title}`;
    return this;
  }

  // Build the final task
  build(): Task {
    return { ...this.task };
  }

  // Build multiple tasks with variations
  buildMany(count: number, variations?: (builder: TaskBuilder, index: number) => void): Task[] {
    return Array.from({ length: count }, (_, index) => {
      const builder = new TaskBuilder()
        .withTitle(`${this.task.title} ${index + 1}`)
        .withDescription(`${this.task.description} (${index + 1})`);

      if (variations) {
        variations(builder, index);
      }

      return builder.build();
    });
  }
}