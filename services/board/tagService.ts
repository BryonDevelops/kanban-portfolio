import { Tag, TagCreate, TagUpdate } from '../../domain/board/entities/tag';
import { ITagRepository } from '../../domain/board/repositories/tagRepository.interface';
import { nanoid } from 'nanoid';

export class TagService {
  constructor(private repository: ITagRepository) {}

  async createTag(tagData: TagCreate): Promise<Tag> {
    if (!tagData.name?.trim()) {
      throw new Error('Tag name is required');
    }

    // Check for duplicate names
    const nameExists = await this.repository.existsByName(tagData.name.trim());
    if (nameExists) {
      throw new Error(`Tag with name "${tagData.name}" already exists`);
    }

    // Create tag entity
    const tag: Tag = {
      id: nanoid(),
      name: tagData.name.trim(),
      color: tagData.color || '#3B82F6', // Default blue color
      description: tagData.description?.trim(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Persist to repository
    await this.repository.addTag(tag);

    return tag;
  }

  async getTagById(id: string): Promise<Tag | null> {
    if (!id) {
      throw new Error('Tag ID is required');
    }
    return await this.repository.fetchTagById(id);
  }

  async getTagByName(name: string): Promise<Tag | null> {
    if (!name?.trim()) {
      throw new Error('Tag name is required');
    }
    return await this.repository.fetchTagByName(name.trim());
  }

  async getAllTags(): Promise<Tag[]> {
    return await this.repository.fetchTags();
  }

  async updateTag(id: string, tagData: TagUpdate): Promise<Tag> {
    if (!id) {
      throw new Error('Tag ID is required');
    }

    const existingTag = await this.repository.fetchTagById(id);
    if (!existingTag) {
      throw new Error(`Tag with ID "${id}" not found`);
    }

    // Check for name uniqueness if name is being updated
    if (tagData.name && tagData.name !== existingTag.name) {
      const nameExists = await this.repository.existsByName(tagData.name.trim());
      if (nameExists) {
        throw new Error(`Tag with name "${tagData.name}" already exists`);
      }
    }

    // Create updated tag
    const updatedTag: Tag = {
      id: existingTag.id,
      name: tagData.name ?? existingTag.name,
      color: tagData.color ?? existingTag.color,
      description: tagData.description ?? existingTag.description,
      created_at: existingTag.created_at,
      updated_at: new Date(),
    };

    // Persist changes
    await this.repository.updateTag(id, updatedTag);
    return updatedTag;
  }

  async deleteTag(id: string): Promise<void> {
    if (!id) {
      throw new Error('Tag ID is required');
    }

    const existingTag = await this.repository.fetchTagById(id);
    if (!existingTag) {
      throw new Error(`Tag with ID "${id}" not found`);
    }

    await this.repository.deleteTag(id);
  }

  async getTagsForProject(projectId: string): Promise<Tag[]> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    return await this.repository.fetchTagsForProject(projectId);
  }

  async addTagToProject(projectId: string, tagId: string): Promise<void> {
    if (!projectId || !tagId) {
      throw new Error('Project ID and Tag ID are required');
    }

    const tagExists = await this.repository.existsById(tagId);
    if (!tagExists) {
      throw new Error(`Tag with ID "${tagId}" not found`);
    }

    await this.repository.addTagToProject(projectId, tagId);
  }

  async removeTagFromProject(projectId: string, tagId: string): Promise<void> {
    if (!projectId || !tagId) {
      throw new Error('Project ID and Tag ID are required');
    }

    await this.repository.removeTagFromProject(projectId, tagId);
  }

  async setProjectTags(projectId: string, tagIds: string[]): Promise<void> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Validate all tag IDs exist
    for (const tagId of tagIds) {
      const tagExists = await this.repository.existsById(tagId);
      if (!tagExists) {
        throw new Error(`Tag with ID "${tagId}" not found`);
      }
    }

    await this.repository.setProjectTags(projectId, tagIds);
  }

  // Utility methods
  async createDefaultTags(): Promise<Tag[]> {
    const defaultTags = [
      { name: 'Frontend', color: '#3B82F6', description: 'Frontend development' },
      { name: 'Backend', color: '#10B981', description: 'Backend development' },
      { name: 'Full Stack', color: '#8B5CF6', description: 'Full stack development' },
      { name: 'Mobile', color: '#F59E0B', description: 'Mobile development' },
      { name: 'Web', color: '#EF4444', description: 'Web development' },
      { name: 'API', color: '#06B6D4', description: 'API development' },
      { name: 'Database', color: '#84CC16', description: 'Database related' },
      { name: 'DevOps', color: '#F97316', description: 'DevOps and infrastructure' },
    ];

    const createdTags: Tag[] = [];

    for (const tagData of defaultTags) {
      try {
        const tag = await this.createTag(tagData);
        createdTags.push(tag);
      } catch (error) {
        // Tag might already exist, skip
        console.warn(`Could not create default tag "${tagData.name}":`, error);
      }
    }

    return createdTags;
  }
}