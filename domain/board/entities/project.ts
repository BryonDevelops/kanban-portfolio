import { Task } from './task';

export type ProjectStatus = 'idea' | 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'archived';

export type Project = {
  id: string;
  title: string;
  description?: string;
  url?: string;
  image?: string; // Project image/cover image
  status: ProjectStatus;
  technologies: string[];
  tags: string[];
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type?: string; // file type like 'pdf', 'doc', 'image', etc.
    size?: number; // file size in bytes
  }>;
  notes?: string; // Internal notes and observations
  architecture?: string; // Technical architecture and design notes
  start_date?: Date;
  end_date?: Date;
  updated_at?: Date;
  tasks: Task[];
  created_at?: Date;
}
