// Project builder for dynamic E2E test data
import { Project } from '../../../../domain/board/entities/project';

export class ProjectBuilder {
  private project: Project;

  constructor() {
    // Start with sensible defaults
    this.project = {
      id: `e2e-builder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'Builder Project',
      description: 'Created with ProjectBuilder',
      status: 'planning',
      technologies: ['React'],
      tags: [],
      tasks: [],
    };
  }

  // Fluent interface methods
  withId(id: string): ProjectBuilder {
    this.project.id = id;
    return this;
  }

  withTitle(title: string): ProjectBuilder {
    this.project.title = title;
    return this;
  }

  withDescription(description: string): ProjectBuilder {
    this.project.description = description;
    return this;
  }

  withStatus(status: Project['status']): ProjectBuilder {
    this.project.status = status;
    return this;
  }

  withTechnologies(technologies: string[]): ProjectBuilder {
    this.project.technologies = technologies;
    return this;
  }

  addTechnology(technology: string): ProjectBuilder {
    if (!this.project.technologies) {
      this.project.technologies = [];
    }
    this.project.technologies.push(technology);
    return this;
  }

  // Preset configurations
  asMinimal(): ProjectBuilder {
    this.project.description = '';
    this.project.technologies = [];
    return this;
  }

  asComplex(): ProjectBuilder {
    this.project.title = 'Complex Project with Many Details';
    this.project.description = 'This is a complex project with extensive documentation and multiple technologies.';
    this.project.technologies = ['React', 'TypeScript', 'Next.js', 'Supabase', 'Tailwind'];
    return this;
  }

  asPlanning(): ProjectBuilder {
    this.project.status = 'planning';
    return this;
  }

  asInProgress(): ProjectBuilder {
    this.project.status = 'in-progress';
    return this;
  }

  asCompleted(): ProjectBuilder {
    this.project.status = 'completed';
    return this;
  }

  asOnHold(): ProjectBuilder {
    this.project.status = 'on-hold';
    return this;
  }

  // Utility methods
  withUniqueId(): ProjectBuilder {
    this.project.id = `e2e-unique-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return this;
  }

  withTestPrefix(prefix: string): ProjectBuilder {
    this.project.id = `e2e-${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.project.title = `${prefix} - ${this.project.title}`;
    return this;
  }

  // Build the final project
  build(): Project {
    return { ...this.project };
  }

  // Build multiple projects with variations
  buildMany(count: number, variations?: (builder: ProjectBuilder, index: number) => void): Project[] {
    return Array.from({ length: count }, (_, index) => {
      const builder = new ProjectBuilder()
        .withTitle(`${this.project.title} ${index + 1}`)
        .withDescription(`${this.project.description} (${index + 1})`)
        .withStatus(this.project.status)
        .withTechnologies([...(this.project.technologies || [])]);

      if (variations) {
        variations(builder, index);
      }

      return builder.build();
    });
  }
}