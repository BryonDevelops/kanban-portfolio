import { getSupabase } from '../supabaseClient';
import { Task } from '../../../domain/board/entities/task';
import { TaskRepository } from '../../../domain/board/repositories/taskRepository';

export class SupabaseTaskRepository implements TaskRepository {
  async findAll(): Promise<Task[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return data as Task[];
  }

  async findById(id: string): Promise<Task | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data as Task;
  }

  async create(task: Task): Promise<Task> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase client not available');

    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  }

  async update(id: string, updates: Partial<Task>): Promise<Task> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase client not available');

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  }

  async delete(id: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase client not available');

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}