import React from 'react';
import { render, screen } from '@testing-library/react';
import Card from '../../../../presentation/components/features/board/ProjectCard';
import { Project } from '../../../../domain/board/entities/project';
import { DndProvider } from '../../__mocks__/react-dnd';
import { HTML5Backend } from '../../__mocks__/react-dnd-html5-backend';

const mockProject: Project = {
  id: '1',
  title: 'Test Project',
  description: 'Test project description',
  status: 'in-progress',
  technologies: ['React', 'TypeScript'],
  tags: [],
  tasks: [],
  created_at: new Date(),
  updated_at: new Date(),
};

const CardWithDnd = ({ project, fromCol, index }: { project: Project; fromCol: string; index: number }) => (
  <DndProvider>
    <Card project={project} fromCol={fromCol} index={index} />
  </DndProvider>
);

describe('Card Component', () => {
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