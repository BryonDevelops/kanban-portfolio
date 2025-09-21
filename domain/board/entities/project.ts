import { Task } from './task';

export type ProjectStatus = 'idea' | 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'archived';

export type Project = {
  id: string;
  title: string;
  description?: string;
  url?: string;
  status: ProjectStatus;
  technologies: string[];
  tags: string[];
  start_date?: Date;
  end_date?: Date;
  updated_at?: Date;
  tasks: Task[];
  created_at?: Date;
}
