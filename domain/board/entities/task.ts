export type TaskStatus = 'todo' | 'in-progress' | 'done';

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  columnId: string;
  created_at: Date;
  updated_at?: Date;
};
