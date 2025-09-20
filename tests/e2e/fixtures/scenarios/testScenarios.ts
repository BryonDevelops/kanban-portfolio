// Complete test scenarios for E2E testing
import { SupabaseBoardRepository } from '../../../../infrastructure/database/repositories/supaBaseBoardRepository';
import { Project } from '../../../../domain/board/entities/project';
import { ProjectBuilder } from '../projects/projectBuilder';

export class TestScenarios {
  private repository: SupabaseBoardRepository;

  constructor(repository: SupabaseBoardRepository) {
    this.repository = repository;
  }

  // Basic project creation scenario
  async createBasicProject(): Promise<{ project: Project; cleanup: () => Promise<void> }> {
    const project = new ProjectBuilder()
      .withTestPrefix('basic-scenario')
      .build();

    await this.repository.addProject(project);

    const cleanup = async () => {
      try {
        await this.repository.deleteProject(project.id);
      } catch {
        // Ignore cleanup errors
      }
    };

    return { project, cleanup };
  }

  // Project workflow scenario (create -> update -> complete)
  async projectWorkflow(): Promise<{
    project: Project;
    updates: Partial<Project>[];
    cleanup: () => Promise<void>
  }> {
    const project = new ProjectBuilder()
      .withTestPrefix('workflow')
      .asPlanning()
      .build();

    await this.repository.addProject(project);

    const updates = [
      { status: 'in-progress' as const, description: 'Started working on project' },
      { status: 'completed' as const, description: 'Project completed successfully' },
    ];

    // Apply updates in sequence
    for (const update of updates) {
      await this.repository.updateProject(project.id, update);
    }

    const cleanup = async () => {
      try {
        await this.repository.deleteProject(project.id);
      } catch {
        // Ignore cleanup errors
      }
    };

    return { project, updates, cleanup };
  }

  // Multiple projects scenario
  async createMultipleProjects(count: number = 3): Promise<{
    projects: Project[];
    cleanup: () => Promise<void>;
  }> {
    const projects = new ProjectBuilder()
      .withTestPrefix('multi')
      .buildMany(count, (builder, index) => {
        builder
          .withTitle(`Multi Project ${index + 1}`)
          .withStatus(index % 2 === 0 ? 'planning' : 'in-progress');
      });

    // Create all projects
    for (const project of projects) {
      await this.repository.addProject(project);
    }

    const cleanup = async () => {
      for (const project of projects) {
        try {
          await this.repository.deleteProject(project.id);
        } catch {
          // Ignore cleanup errors
        }
      }
    };

    return { projects, cleanup };
  }

  // Performance test scenario
  async performanceTest(projectCount: number = 10): Promise<{
    projects: Project[];
    metrics: {
      createTime: number;
      readTime: number;
      updateTime: number;
      deleteTime: number;
    };
    cleanup: () => Promise<void>;
  }> {
    const projects = new ProjectBuilder()
      .withTestPrefix('perf')
      .buildMany(projectCount);

    const metrics = {
      createTime: 0,
      readTime: 0,
      updateTime: 0,
      deleteTime: 0,
    };

    // Measure create time
    const createStart = Date.now();
    for (const project of projects) {
      await this.repository.addProject(project);
    }
    metrics.createTime = Date.now() - createStart;

    // Measure read time
    const readStart = Date.now();
    await this.repository.fetchProjects();
    metrics.readTime = Date.now() - readStart;

    // Measure update time
    const updateStart = Date.now();
    for (const project of projects) {
      await this.repository.updateProject(project.id, { description: 'Updated by performance test' });
    }
    metrics.updateTime = Date.now() - updateStart;

    // Measure delete time
    const deleteStart = Date.now();
    for (const project of projects) {
      await this.repository.deleteProject(project.id);
    }
    metrics.deleteTime = Date.now() - deleteStart;

    const cleanup = async () => {
      // Already cleaned up in the test
    };

    return { projects, metrics, cleanup };
  }

  // Error handling scenario
  async errorHandlingScenario(): Promise<{
    validProject: Project;
    cleanup: () => Promise<void>;
  }> {
    const validProject = new ProjectBuilder()
      .withTestPrefix('error-test')
      .build();

    await this.repository.addProject(validProject);

    // Test various error conditions
    try {
      // Test duplicate ID (should error)
      await this.repository.addProject(validProject);
    } catch {
      // Expected error
    }

    try {
      // Test update non-existent project (should error)
      await this.repository.updateProject('non-existent-id', { title: 'Updated' });
    } catch {
      // Expected error
    }

    try {
      // Test delete non-existent project (should error)
      await this.repository.deleteProject('non-existent-id');
    } catch {
      // Expected error
    }

    const cleanup = async () => {
      try {
        await this.repository.deleteProject(validProject.id);
      } catch {
        // Ignore cleanup errors
      }
    };

    return { validProject, cleanup };
  }

  // Data integrity scenario
  async dataIntegrityTest(): Promise<{
    project: Project;
    retrieved: Project;
    cleanup: () => Promise<void>;
  }> {
    const project = new ProjectBuilder()
      .withTestPrefix('integrity')
      .withTitle('Data Integrity Test Project')
      .withDescription('Testing data integrity and field preservation')
      .withTechnologies(['React', 'TypeScript', 'Supabase', 'Jest'])
      .asInProgress()
      .build();

    await this.repository.addProject(project);

    const allProjects = await this.repository.fetchProjects();
    const retrieved = allProjects.find(p => p.id === project.id);

    if (!retrieved) {
      throw new Error('Project not found after creation');
    }

    const cleanup = async () => {
      try {
        await this.repository.deleteProject(project.id);
      } catch {
        // Ignore cleanup errors
      }
    };

    return { project, retrieved, cleanup };
  }
}