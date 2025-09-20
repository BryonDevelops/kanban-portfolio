// Database utilities for E2E testing
import { SupabaseBoardRepository } from '../../../infrastructure/database/repositories/supaBaseBoardRepository';

export class DatabaseTestUtils {
  private repository: SupabaseBoardRepository;

  constructor(repository: SupabaseBoardRepository) {
    this.repository = repository;
  }

  // Clean up test data by prefix
  async cleanupTestData(prefix: string = 'e2e-'): Promise<void> {
    try {
      const projects = await this.repository.fetchProjects();
      const testProjects = projects.filter(p => p.id.startsWith(prefix));

      for (const project of testProjects) {
        try {
          await this.repository.deleteProject(project.id);
        } catch (error) {
          console.warn(`Failed to cleanup project ${project.id}:`, error);
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup test data:', error);
    }
  }

  // Verify database connection
  async verifyConnection(): Promise<boolean> {
    try {
      await this.repository.fetchProjects();
      return true;
    } catch {
      return false;
    }
  }

  // Wait for operation to complete (useful for eventual consistency)
  async waitForOperation<T>(
    operation: () => Promise<T>,
    predicate: (result: T) => boolean,
    maxAttempts: number = 10,
    delayMs: number = 100
  ): Promise<T> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = await operation();
      if (predicate(result)) {
        return result;
      }
      await this.delay(delayMs);
    }
    throw new Error(`Operation did not complete after ${maxAttempts} attempts`);
  }

  // Wait for project to exist
  async waitForProject(projectId: string, maxAttempts: number = 10): Promise<void> {
    await this.waitForOperation(
      () => this.repository.fetchProjects(),
      (projects) => projects.some(p => p.id === projectId),
      maxAttempts
    );
  }

  // Wait for project to be deleted
  async waitForProjectDeletion(projectId: string, maxAttempts: number = 10): Promise<void> {
    await this.waitForOperation(
      () => this.repository.fetchProjects(),
      (projects) => !projects.some(p => p.id === projectId),
      maxAttempts
    );
  }

  // Measure operation performance
  async measureOperation<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = Date.now();
    const result = await operation();
    const duration = Date.now() - start;
    return { result, duration };
  }

  // Retry operation with exponential backoff
  async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 100
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          const delay = baseDelayMs * Math.pow(2, attempt);
          await this.delay(delay);
        }
      }
    }

    throw lastError!;
  }

  // Delay utility
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Performance measurement utilities
export class PerformanceTestUtils {
  static measureTime<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    return new Promise(async (resolve) => {
      const start = performance.now();
      const result = await operation();
      const duration = performance.now() - start;
      resolve({ result, duration });
    });
  }

  static async measureConcurrentOperations<T>(
    operations: (() => Promise<T>)[],
    concurrencyLimit: number = 5
  ): Promise<{ results: T[]; totalDuration: number; averageDuration: number }> {
    const start = performance.now();

    const results: T[] = [];
    for (let i = 0; i < operations.length; i += concurrencyLimit) {
      const batch = operations.slice(i, i + concurrencyLimit);
      const batchResults = await Promise.all(batch.map(op => op()));
      results.push(...batchResults);
    }

    const totalDuration = performance.now() - start;
    const averageDuration = totalDuration / operations.length;

    return { results, totalDuration, averageDuration };
  }
}

// Test data validation utilities
import { Project } from '../../../domain/board/entities/project';
import { Task } from '../../../domain/board/entities/task';

export class ValidationUtils {
  static validateProject(project: unknown): asserts project is Project {
    if (!project || typeof project !== 'object') {
      throw new Error('Project must be an object');
    }
    const proj = project as Record<string, unknown>;
    if (typeof proj.id !== 'string' || !proj.id) {
      throw new Error('Project must have a valid id');
    }
    if (typeof proj.title !== 'string') {
      throw new Error('Project must have a title');
    }
    if (!['planning', 'in-progress', 'completed', 'on-hold'].includes(proj.status as string)) {
      throw new Error('Project must have a valid status');
    }
  }

  static validateTask(task: unknown): asserts task is Task {
    if (!task || typeof task !== 'object') {
      throw new Error('Task must be an object');
    }
    const t = task as Record<string, unknown>;
    if (typeof t.id !== 'string' || !t.id) {
      throw new Error('Task must have a valid id');
    }
    if (typeof t.title !== 'string') {
      throw new Error('Task must have a title');
    }
  }
}