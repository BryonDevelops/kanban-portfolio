// domain/microblog/repositories/microblogRepository.ts

import { Post, PostCreate, PostUpdate } from '../entities/post';

export interface IMicroblogRepository {
  // Post CRUD operations
  fetchPosts(): Promise<Post[]>;
  fetchPostById(id: string): Promise<Post | null>;
  createPost(post: PostCreate): Promise<Post>;
  updatePost(id: string, updates: PostUpdate): Promise<Post>;
  deletePost(id: string): Promise<void>;

  // Post status operations
  publishPost(id: string): Promise<Post>;
  archivePost(id: string): Promise<Post>;
  unpublishPost(id: string): Promise<Post>;
  toggleFeatured(id: string): Promise<Post>;

  // Query operations
  fetchPostsByStatus(status: Post['status']): Promise<Post[]>;
  fetchPostsByAuthor(author: string): Promise<Post[]>;
  fetchPostsByTag(tag: string): Promise<Post[]>;
  searchPosts(query: string): Promise<Post[]>;
  fetchFeaturedPosts(): Promise<Post[]>;
}