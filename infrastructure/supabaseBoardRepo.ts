import { supabase } from '../lib/supabaseClient';
import { Task } from '../domain/task';

export const SupabaseBoardRepo = {
  async fetchTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('order', { ascending: true });
    if (error) throw error;
    return data as Task[];
  },

  async addTask(task: Task): Promise<void> {
    const { error } = await supabase.from('tasks').insert([task]);
    if (error) throw error;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    const { error } = await supabase.from('tasks').update(updates).eq('id', id);
    if (error) throw error;
  },

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },
};
