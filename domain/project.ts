export type Project = {
  id: string;
  title: string;
  description?: string;
  url?: string;
  status?: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  technologies?: string[];
  startDate?: Date;
  endDate?: Date;
};