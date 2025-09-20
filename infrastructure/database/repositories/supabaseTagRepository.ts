import { Tag, TagUpdate } from '../../../domain/board/entities/tag';
import { ITagRepository } from '../../../domain/board/repositories/tagRepository.interface';
import { getSupabase } from '../supabaseClient';

export class SupabaseTagRepository implements ITagRepository {
  private get client() {
    const client = getSupabase();
    if (!client) {
      throw new Error('Supabase client not configured. Please check your environment variables.');
    }
    return client;
  }

  // Tag CRUD operations
  async fetchTags(): Promise<Tag[]> {
    const { data, error } = await this.client
      .from('tags')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch tags: ${error.message}`);
    }

    return data as Tag[];
  }

  async fetchTagById(id: string): Promise<Tag | null> {
    const { data, error } = await this.client
      .from('tags')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to fetch tag: ${error.message}`);
    }

    return data as Tag;
  }

  async fetchTagByName(name: string): Promise<Tag | null> {
    const { data, error } = await this.client
      .from('tags')
      .select('*')
      .eq('name', name)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to fetch tag by name: ${error.message}`);
    }

    return data as Tag;
  }

  async addTag(tag: Tag): Promise<void> {
    const { error } = await this.client.from('tags').insert([tag]);

    if (error) {
      throw new Error(`Failed to add tag: ${error.message}`);
    }
  }

  async updateTag(id: string, updates: TagUpdate): Promise<void> {
    const updateData: Partial<Tag> = {};

    // Only include fields that are being updated
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.description !== undefined) updateData.description = updates.description;
    updateData.updated_at = new Date(); // Always update the updated_at timestamp

    const { error } = await this.client.from('tags').update(updateData).eq('id', id);

    if (error) {
      throw new Error(`Failed to update tag: ${error.message}`);
    }
  }

  async deleteTag(id: string): Promise<void> {
    const { error } = await this.client.from('tags').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete tag: ${error.message}`);
    }
  }

  // Tag validation
  async existsByName(name: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('tags')
      .select('id')
      .eq('name', name)
      .limit(1);

    if (error) {
      throw new Error(`Failed to check tag name existence: ${error.message}`);
    }

    return data && data.length > 0;
  }

  async existsById(id: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('tags')
      .select('id')
      .eq('id', id)
      .limit(1);

    if (error) {
      throw new Error(`Failed to check tag ID existence: ${error.message}`);
    }

    return data && data.length > 0;
  }

  // Tag relationships with projects
  async fetchTagsForProject(projectId: string): Promise<Tag[]> {
    // First get the project to see its tags
    const { data: project, error: projectError } = await this.client
      .from('projects')
      .select('tags')
      .eq('id', projectId)
      .single();

    if (projectError) {
      throw new Error(`Failed to fetch project tags: ${projectError.message}`);
    }

    if (!project.tags || !Array.isArray(project.tags) || project.tags.length === 0) {
      return [];
    }

    // For now, assuming tags are stored as Tag objects in the project
    // In a more complex setup, this would be a many-to-many relationship table
    return project.tags as Tag[];
  }

  async addTagToProject(projectId: string, tagId: string): Promise<void> {
    // Get current project
    const { data: project, error: projectError } = await this.client
      .from('projects')
      .select('tags')
      .eq('id', projectId)
      .single();

    if (projectError) {
      throw new Error(`Failed to fetch project: ${projectError.message}`);
    }

    // Get the tag to add
    const tag = await this.fetchTagById(tagId);
    if (!tag) {
      throw new Error(`Tag with ID "${tagId}" not found`);
    }

    // Add tag to project's tags array
    const currentTags = Array.isArray(project.tags) ? project.tags : [];
    const updatedTags = [...currentTags, tag];

    const { error: updateError } = await this.client
      .from('projects')
      .update({ tags: updatedTags, updated_at: new Date() })
      .eq('id', projectId);

    if (updateError) {
      throw new Error(`Failed to add tag to project: ${updateError.message}`);
    }
  }

  async removeTagFromProject(projectId: string, tagId: string): Promise<void> {
    // Get current project
    const { data: project, error: projectError } = await this.client
      .from('projects')
      .select('tags')
      .eq('id', projectId)
      .single();

    if (projectError) {
      throw new Error(`Failed to fetch project: ${projectError.message}`);
    }

    // Remove tag from project's tags array
    const currentTags = Array.isArray(project.tags) ? project.tags : [];
    const updatedTags = currentTags.filter((tag: Tag) => tag.id !== tagId);

    const { error: updateError } = await this.client
      .from('projects')
      .update({ tags: updatedTags, updated_at: new Date() })
      .eq('id', projectId);

    if (updateError) {
      throw new Error(`Failed to remove tag from project: ${updateError.message}`);
    }
  }

  async setProjectTags(projectId: string, tagIds: string[]): Promise<void> {
    // Get all the tags
    const tags: Tag[] = [];
    for (const tagId of tagIds) {
      const tag = await this.fetchTagById(tagId);
      if (!tag) {
        throw new Error(`Tag with ID "${tagId}" not found`);
      }
      tags.push(tag);
    }

    // Update project's tags
    const { error } = await this.client
      .from('projects')
      .update({ tags: tags, updated_at: new Date() })
      .eq('id', projectId);

    if (error) {
      throw new Error(`Failed to set project tags: ${error.message}`);
    }
  }
}