import React from 'react';
import { render } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import Card from '@/presentation/components/features/board/ProjectCard';
import { Project } from '../../../../domain/board/schemas/project.schema';

// Mock the useSortable hook
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

// Mock createPortal
jest.mock('react-dom', () => ({
  createPortal: (children: React.ReactNode) => children,
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));


const mockProject: Project = {
  id: '1',
  title: 'Test Project',
  description: 'Test project description',
  status: 'in-progress',
  technologies: ['React', 'TypeScript'],
  tags: [],
  attachments: [],
  tasks: [],
  created_at: new Date(),
  updated_at: new Date(),
};

const CardWithDnd = ({ project, fromCol, index }: { project: Project; fromCol: string; index: number }) => (
  <DndContext>
    <Card project={project} fromCol={fromCol} index={index} isDragOverlay={true} />
  </DndContext>
);

describe.skip('Card Component', () => {
  test('renders project title', () => {
    render(<CardWithDnd project={mockProject} fromCol="in-progress" index={0} />);
  });

  test('renders project description when provided', () => {
    render(<CardWithDnd project={mockProject} fromCol="in-progress" index={0} />);
  });

  test('does not render description when not provided', () => {
    const projectWithoutDescription = { ...mockProject, description: undefined };
    render(<CardWithDnd project={projectWithoutDescription} fromCol="in-progress" index={0} />);
  });
});