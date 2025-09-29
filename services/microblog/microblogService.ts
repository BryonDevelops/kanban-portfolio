// services/microblog/microblogService.ts

import { IMicroblogRepository } from '../../domain/microblog/repositories/microblogRepository';
import { Post, PostCreate, PostUpdate, PostStatus } from '../../domain/microblog/entities/post';

export class MicroblogService {
  constructor(private repository: IMicroblogRepository) {}

  async createPost(postData: PostCreate): Promise<Post> {
    // Business logic validation
    if (!postData.title.trim()) {
      throw new Error('Post title is required');
    }

    if (!postData.content.trim()) {
      throw new Error('Post content is required');
    }

    if (!postData.author.trim()) {
      throw new Error('Post author is required');
    }

    // Set default status if not provided
    const postWithDefaults: PostCreate = {
      ...postData,
      status: postData.status || 'draft',
      tags: postData.tags || []
    };

    return await this.repository.createPost(postWithDefaults);
  }

  async getPosts(): Promise<Post[]> {
    return await this.repository.fetchPosts();
  }

  async getPostById(id: string): Promise<Post | null> {
    return await this.repository.fetchPostById(id);
  }

  async updatePost(id: string, updates: PostUpdate): Promise<Post> {
    // Business logic validation
    if (updates.title !== undefined && !updates.title.trim()) {
      throw new Error('Post title cannot be empty');
    }

    if (updates.content !== undefined && !updates.content.trim()) {
      throw new Error('Post content cannot be empty');
    }

    return await this.repository.updatePost(id, updates);
  }

  async deletePost(id: string): Promise<void> {
    return await this.repository.deletePost(id);
  }

  async publishPost(id: string): Promise<Post> {
    return await this.repository.publishPost(id);
  }

  async archivePost(id: string): Promise<Post> {
    return await this.repository.archivePost(id);
  }

  async unpublishPost(id: string): Promise<Post> {
    return await this.repository.unpublishPost(id);
  }

  async getPostsByStatus(status: PostStatus): Promise<Post[]> {
    return await this.repository.fetchPostsByStatus(status);
  }

  async getPostsByAuthor(author: string): Promise<Post[]> {
    return await this.repository.fetchPostsByAuthor(author);
  }

  async getPostsByTag(tag: string): Promise<Post[]> {
    return await this.repository.fetchPostsByTag(tag);
  }

  async searchPosts(query: string): Promise<Post[]> {
    if (!query.trim()) {
      return [];
    }

    return await this.repository.searchPosts(query.trim());
  }

  async getPublishedPosts(): Promise<Post[]> {
    return await this.repository.fetchPostsByStatus('published');
  }

  async getDraftPosts(): Promise<Post[]> {
    return await this.repository.fetchPostsByStatus('draft');
  }

  async toggleFeatured(id: string): Promise<Post> {
    return await this.repository.toggleFeatured(id);
  }

  async getFeaturedPosts(): Promise<Post[]> {
    return await this.repository.fetchFeaturedPosts();
  }
}