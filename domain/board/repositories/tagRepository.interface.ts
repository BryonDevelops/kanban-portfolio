import { Tag, TagCreate, TagUpdate } from '../entities/tag';

export interface ITagRepository {
  // Tag CRUD operations
  fetchTags(): Promise<Tag[]>;
  fetchTagById(id: string): Promise<Tag | null>;
  fetchTagByName(name: string): Promise<Tag | null>;
  addTag(tag: Tag): Promise<void>;
  updateTag(id: string, updates: TagUpdate): Promise<void>;
  deleteTag(id: string): Promise<void>;

  // Tag validation
  existsByName(name: string): Promise<boolean>;
  existsById(id: string): Promise<boolean>;

  // Tag relationships
  fetchTagsForProject(projectId: string): Promise<Tag[]>;
  addTagToProject(projectId: string, tagId: string): Promise<void>;
  removeTagFromProject(projectId: string, tagId: string): Promise<void>;
  setProjectTags(projectId: string, tagIds: string[]): Promise<void>;
}