import { Task } from '../../../domain/board/entities/task';
import { IBoardRepository } from '../../../domain/board/repositories/boardRepository.interface';
import { Project } from '@/domain/board/entities/project';
import { getSupabase } from '../supabaseClient';

// Type for project data from database (with tasks as JSONB)
type DatabaseProject = Omit<Project, 'tasks'> & {
  tasks: Task[] | null; // JSONB can be Task array or null
};

export class SupabaseBoardRepository implements IBoardRepository {

  private get client() {
    const client = getSupabase();
    if (!client) {
      throw new Error('Supabase client not configured. Please check your environment variables.');
    }
    return client;
  }

  // PROJECTS
  async fetchProjects(): Promise<Project[]> {
    const { data, error } = await this.client
      .from('projects')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    // Ensure tasks is always an array and properly typed
    return (data as DatabaseProject[]).map(project => ({
      ...project,
      tasks: Array.isArray(project.tasks) ? project.tasks : [],
    }));
  }

  async addProject(project: Project): Promise<void> {
    // Prepare project data for database insertion
    const projectData = {
      id: project.id,
      title: project.title,
      description: project.description,
      url: project.url,
      status: project.status,
      technologies: project.technologies,
      tags: project.tags,
      tasks: project.tasks || [], // Store tasks as JSONB array
      start_date: project.start_date,
      end_date: project.end_date,
      created_at: project.created_at,
      updated_at: project.updated_at,
    };

    const { error } = await this.client.from('projects').insert([projectData]);

    if (error) {
      throw new Error(`Failed to add project: ${error.message}`);
    }
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    // Create update data including all fields that can be updated
    const updateData: Partial<DatabaseProject> = {};

    // Only include fields that are being updated
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.url !== undefined) updateData.url = updates.url;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.technologies !== undefined) updateData.technologies = updates.technologies;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.tasks !== undefined) updateData.tasks = updates.tasks;
    if (updates.start_date !== undefined) updateData.start_date = updates.start_date;
    if (updates.end_date !== undefined) updateData.end_date = updates.end_date;
    if (updates.created_at !== undefined) updateData.created_at = updates.created_at;
    if (updates.updated_at !== undefined) updateData.updated_at = updates.updated_at;

    const { error } = await this.client.from('projects').update(updateData).eq('id', id);

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  async deleteProject(id: string): Promise<void> {
    const { error } = await this.client.from('projects').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  async fetchTasksForProject(projectId: string): Promise<Task[]> {
    const { data, error } = await this.client
      .from('tasks')
      .select('*')
      .eq('projectId', projectId)
      .order('order', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch tasks for project: ${error.message}`);
    }

    return data as Task[];
  }

  async saveProject(project: Project): Promise<void> {
    await this.addProject(project);
  }

  async fetchProjectById(projectId: string): Promise<Project | null> {
    const { data, error } = await this.client
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to fetch project: ${error.message}`);
    }

    // Ensure tasks is always an array
    const project = data as DatabaseProject;
    return {
      ...project,
      tasks: Array.isArray(project.tasks) ? project.tasks : [],
    };
  }


// TASKS
  async addTask(task: Task, projectId: string): Promise<void> {
    const { error } = await this.client.from('tasks').insert([{ ...task, projectId }]);
    if (error) {
      throw new Error(`Failed to add task: ${error.message}`);
    }
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    const { error } = await this.client.from('tasks').update(updates).eq('id', id);
    if (error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }
  }

  async deleteTask(id: string): Promise<void> {
    const { error } = await this.client.from('tasks').delete().eq('id', id);
    if (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  async getTasks(): Promise<Record<string, Task[]>> {
    const { data, error } = await this.client
      .from('tasks')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }

    // Group tasks by columnId
    const tasksByColumn: Record<string, Task[]> = {};
    const tasks = data as Task[];
    tasks.forEach((task) => {
      if (!tasksByColumn[task.columnId as string]) {
        tasksByColumn[task.columnId as string] = [];
      }
      tasksByColumn[task.columnId as string].push(task);
    });

    return tasksByColumn;
  }

  async moveTask(taskId: string, fromColumnId: string, toColumnId: string): Promise<void> {
    const { error } = await this.client
      .from('tasks')
      .update({ columnId: toColumnId })
      .eq('id', taskId)
      .eq('columnId', fromColumnId);

    if (error) {
      throw new Error(`Failed to move task: ${error.message}`);
    }
  }

  async reorderTasks(columnId: string, taskOrder: string[]): Promise<void> {
    const updates = taskOrder.map((taskId, index) => ({
      id: taskId,
      order: index,
    }));

    const { error } = await this.client.from('tasks').upsert(updates, {
      onConflict: 'id',
    });

    if (error) {
      throw new Error(`Failed to reorder tasks: ${error.message}`);
    }
  }



  fetchTasks(): Record<string, Task[]> | PromiseLike<Record<string, Task[]>> {
    throw new Error('Method not implemented.');
  }
  async saveTasks(tasks: Record<string, Task[]>): Promise<void> {
    // Flatten tasks and prepare for batch insert/update
    const allTasks: Task[] = [];
    Object.entries(tasks).forEach(([columnId, columnTasks]) => {
      columnTasks.forEach(task => {
        allTasks.push({
          ...task,
          columnId,
        });
      });
    });

    if (allTasks.length === 0) {
      return;
    }

    const { error } = await this.client.from('tasks').upsert(allTasks, {
      onConflict: 'id',
    });

    if (error) {
      throw new Error(`Failed to save tasks: ${error.message}`);
    }
  }

  async existsByTitle(title: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('projects')
      .select('id')
      .eq('title', title)
      .limit(1);

    if (error) {
      throw new Error(`Failed to check title existence: ${error.message}`);
    }

    return data && data.length > 0;
  }
}
