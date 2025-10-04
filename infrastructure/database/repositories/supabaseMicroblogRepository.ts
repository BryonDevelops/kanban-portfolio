// infrastructure/database/repositories/supabaseMicroblogRepository.ts

import { nanoid } from 'nanoid';
import { IMicroblogRepository } from '../../../domain/microblog/repositories/microblogRepository';
import { Post, PostCreate, PostUpdate, PostStatus } from '../../../domain/microblog/entities/post';
import { getSupabase } from '../supabaseClient';

type DatabasePostUpdate = {
  title?: string;
  content?: string;
  excerpt?: string;
  author?: string;
  published_at?: string;
  tags?: string[];
  status?: string;
  read_time?: number;
  image_url?: string | null;
  featured?: boolean;
  updated_at?: string;
};

type DatabasePostRow = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  published_at: string;
  tags: string[] | null;
  read_time: number | null;
  image_url: string | null;
  status: string | null;
  featured: boolean | null;
  created_at: string;
  updated_at: string | null;
};

export class SupabaseMicroblogRepository implements IMicroblogRepository {
  async fetchPosts(): Promise<Post[]> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }

    return (data || []).map(row => this.mapDatabaseToDomain(row as DatabasePostRow));
  }

  async fetchPostById(id: string): Promise<Post | null> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Post not found
      }
      throw new Error(`Failed to fetch post: ${error.message}`);
    }

    return data ? this.mapDatabaseToDomain(data as DatabasePostRow) : null;
  }

  async createPost(postData: PostCreate): Promise<Post> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    // Calculate read time (roughly 200 words per minute)
    const wordCount = postData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    const now = new Date().toISOString();
    const id = nanoid();
    const post = {
      id,
      title: postData.title,
      excerpt: postData.excerpt,
      content: postData.content,
      author: postData.author,
      published_at: postData.publishedAt,
      tags: postData.tags ?? [],
      read_time: readTime,
      image_url: postData.imageUrl ?? null,
      status: postData.status ?? 'draft',
      featured: postData.featured ?? false,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('posts')
      .insert(post)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create post: ${error.message}`);
    }

    return this.mapDatabaseToDomain(data as DatabasePostRow);
  }

  async updatePost(id: string, updates: PostUpdate): Promise<Post> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    // Calculate read time if content is being updated
    const updateData: DatabasePostUpdate = {};

    if (updates.title !== undefined) {
      updateData.title = updates.title;
    }
    if (updates.excerpt !== undefined) {
      updateData.excerpt = updates.excerpt;
    }
    if (updates.content !== undefined) {
      updateData.content = updates.content;
      const wordCount = updates.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
      updateData.read_time = Math.max(1, Math.ceil(wordCount / 200));
    }
    if (updates.author !== undefined) {
      updateData.author = updates.author;
    }
    if (updates.publishedAt !== undefined) {
      updateData.published_at = updates.publishedAt;
    }
    if (updates.tags !== undefined) {
      updateData.tags = updates.tags;
    }
    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }
    if (updates.imageUrl !== undefined) {
      updateData.image_url = updates.imageUrl ?? null;
    }
    if (updates.featured !== undefined) {
      updateData.featured = updates.featured;
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update post: ${error.message}`);
    }

    return this.mapDatabaseToDomain(data as DatabasePostRow);
  }

  async deletePost(id: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete post: ${error.message}`);
    }
  }

  async publishPost(id: string): Promise<Post> {
    return this.updatePost(id, { status: 'published' });
  }

  async archivePost(id: string): Promise<Post> {
    return this.updatePost(id, { status: 'archived' });
  }

  async unpublishPost(id: string): Promise<Post> {
    return this.updatePost(id, { status: 'draft' });
  }

  async toggleFeatured(id: string): Promise<Post> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    // First get the current featured status
    const { data: currentPost, error: fetchError } = await supabase
      .from('posts')
      .select('featured')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch post: ${fetchError.message}`);
    }

    // Toggle the featured status
    const newFeaturedStatus = !Boolean(currentPost.featured);

    const { data, error } = await supabase
      .from('posts')
      .update({
        featured: newFeaturedStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to toggle featured status: ${error.message}`);
    }

    return this.mapDatabaseToDomain(data as DatabasePostRow);
  }

  async fetchPostsByStatus(status: Post['status']): Promise<Post[]> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch posts by status: ${error.message}`);
    }

    return (data || []).map(row => this.mapDatabaseToDomain(row as DatabasePostRow));
  }

  async fetchPostsByAuthor(author: string): Promise<Post[]> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('author', author)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch posts by author: ${error.message}`);
    }

    return (data || []).map(row => this.mapDatabaseToDomain(row as DatabasePostRow));
  }

  async fetchPostsByTag(tag: string): Promise<Post[]> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .contains('tags', [tag])
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch posts by tag: ${error.message}`);
    }

    return (data || []).map(row => this.mapDatabaseToDomain(row as DatabasePostRow));
  }

  async fetchFeaturedPosts(): Promise<Post[]> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('featured', true)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch featured posts: ${error.message}`);
    }

    return (data || []).map(row => this.mapDatabaseToDomain(row as DatabasePostRow));
  }

  async searchPosts(query: string): Promise<Post[]> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to search posts: ${error.message}`);
    }

    return (data || []).map(row => this.mapDatabaseToDomain(row as DatabasePostRow));
  }

  private mapDatabaseToDomain = (record: DatabasePostRow): Post => ({
    id: record.id,
    title: record.title,
    excerpt: record.excerpt,
    content: record.content,
    author: record.author,
    publishedAt: record.published_at,
    tags: record.tags ?? [],
    readTime: record.read_time ?? 1,
    imageUrl: record.image_url ?? undefined,
    status: (record.status as PostStatus | null) ?? 'draft',
    featured: Boolean(record.featured),
    categories: [],
    createdAt: record.created_at,
    updatedAt: record.updated_at ?? record.created_at,
  });
}