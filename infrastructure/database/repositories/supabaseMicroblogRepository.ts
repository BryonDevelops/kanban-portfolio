// infrastructure/database/repositories/supabaseMicroblogRepository.ts

import { IMicroblogRepository } from '../../../domain/microblog/repositories/microblogRepository';
import { Post, PostCreate, PostUpdate } from '../../../domain/microblog/entities/post';
import { getSupabase } from '../supabaseClient';

type DatabasePostUpdate = {
  title?: string;
  content?: string;
  tags?: string[];
  status?: string;
  read_time?: number;
  updated_at?: string;
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

    return data || [];
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

    return data;
  }

  async createPost(postData: PostCreate): Promise<Post> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    // Calculate read time (roughly 200 words per minute)
    const wordCount = postData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    const post = {
      ...postData,
      read_time: readTime,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('posts')
      .insert(post)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create post: ${error.message}`);
    }

    return data;
  }

  async updatePost(id: string, updates: PostUpdate): Promise<Post> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    // Calculate read time if content is being updated
    const updateData: DatabasePostUpdate = { ...updates };
    if (updates.content) {
      const wordCount = updates.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
      updateData.read_time = Math.max(1, Math.ceil(wordCount / 200));
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

    return data;
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
    const newFeaturedStatus = !currentPost.featured;

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

    return data;
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

    return data || [];
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

    return data || [];
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

    return data || [];
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

    return data || [];
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

    return data || [];
  }
}