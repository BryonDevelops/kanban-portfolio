// Project fixtures for E2E testing
import { Project } from '../../../../domain/board/schemas/project.schema';

// Base project template
const createBaseProject = (overrides: Partial<Project> = {}): Project => ({
  id: `e2e-project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  title: 'E2E Test Project',
  description: 'Created by E2E test fixture',
  status: 'planning',
  technologies: ['React', 'TypeScript'],
  tags: overrides.tags ?? [],
  tasks: [], // Required tasks array
  ...overrides,
});

// Predefined project fixtures
export const projectFixtures = {
  // Basic project for standard tests
  basic(): Project {
    return createBaseProject({
      title: 'Basic Test Project',
      description: 'A simple project for basic testing',
    });
  },

  // Project with minimal data
  minimal(): Project {
    return createBaseProject({
      title: 'Minimal Project',
      description: '',
      technologies: [],
    });
  },

  // Project with extensive data
  extensive(): Project {
    return createBaseProject({
      title: 'Extensive Test Project with Very Long Title That Tests Character Limits',
      description: 'This is a comprehensive project description that includes multiple sentences. It tests how the system handles longer text content and provides a realistic example of project documentation that might be entered by users.',
      status: 'in-progress',
      technologies: [
        'React',
        'TypeScript',
        'Next.js',
        'Supabase',
        'Tailwind CSS',
        'Jest',
        'Cypress',
        'Storybook',
        'ESLint',
        'Prettier'
      ],
    });
  },

  // Project with special characters
  withSpecialCharacters(): Project {
    return createBaseProject({
      title: 'Special Chars: åäö ñ éèê 中文 🚀 @#$%',
      description: 'Testing unicode & special characters: "quotes", <tags>, & symbols!',
      technologies: ['React Native', 'Node.js', 'MongoDB'],
    });
  },

  // Different status variations
  planning(): Project {
    return createBaseProject({
      title: 'Planning Phase Project',
      status: 'planning',
    });
  },

  inProgress(): Project {
    return createBaseProject({
      title: 'In Progress Project',
      status: 'in-progress',
    });
  },

  completed(): Project {
    return createBaseProject({
      title: 'Completed Project',
      status: 'completed',
    });
  },

  onHold(): Project {
    return createBaseProject({
      title: 'On Hold Project',
      status: 'on-hold',
    });
  },

  // Edge case scenarios
  emptyFields(): Project {
    return createBaseProject({
      title: '',
      description: '',
      technologies: [],
    });
  },

  // Performance testing - batch of projects
  createBatch(count: number = 5): Project[] {
    return Array.from({ length: count }, (_, index) =>
      createBaseProject({
        title: `Batch Project ${index + 1}`,
        description: `Batch project #${index + 1} for performance testing`,
        status: index % 2 === 0 ? 'planning' : 'in-progress',
      })
    );
  },

  // For update testing
  forUpdate(): { original: Project; updates: Partial<Project> } {
    const original = createBaseProject({
      title: 'Original Project Title',
      status: 'planning',
    });

    const updates = {
      title: 'Updated Project Title',
      status: 'in-progress' as const,
      description: 'Updated description',
    };

    return { original, updates };
  },
};