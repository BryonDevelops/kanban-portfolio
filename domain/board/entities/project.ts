import { User } from "@supabase/supabase-js";
import { Task } from "../../../domain/task";

export type Project = {
  id: string;
  title: string;
  tag?: string[];
  type?: 'personal' | 'work' | 'open-source' | 'learning' | 'other';
  description?: string;
  url?: string;
  status?: 'idea' | 'planning' | 'in-progress' | 'completed' | 'on-hold';
  technologies?: string[];
  startDate?: Date;
  endDate?: Date;
  tasks?: Task[];
  createdBy?: User;
  createdAt?: Date;
  updatedAt?: Date;
  archived?: boolean;
  updatedBy?: User;
};