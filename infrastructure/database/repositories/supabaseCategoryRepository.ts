// infrastructure/database/repositories/supabaseCategoryRepository.ts

import { ICategoryRepository } from '../../../domain/microblog/repositories/categoryRepository';
import { Category, CategoryCreate, CategoryUpdate } from '../../../domain/microblog/entities/category';
import { getSupabase } from '../supabaseClient';

export class SupabaseCategoryRepository implements ICategoryRepository {
  async fetchCategories(): Promise<Category[]> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    // Transform database records to domain entities
    return (data || []).map(this.mapDatabaseToDomain);
  }

  async fetchCategoryById(id: string): Promise<Category | null> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Category not found
      }
      throw new Error(`Failed to fetch category: ${error.message}`);
    }

    return this.mapDatabaseToDomain(data);
  }

  async fetchCategoryBySlug(slug: string): Promise<Category | null> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Category not found
      }
      throw new Error(`Failed to fetch category: ${error.message}`);
    }

    return this.mapDatabaseToDomain(data);
  }

  async createCategory(categoryData: CategoryCreate): Promise<Category> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const category = {
      ...categoryData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create category: ${error.message}`);
    }

    return this.mapDatabaseToDomain(data);
  }

  async updateCategory(id: string, updates: CategoryUpdate): Promise<Category> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update category: ${error.message}`);
    }

    return this.mapDatabaseToDomain(data);
  }

  async deleteCategory(id: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete category: ${error.message}`);
    }
  }

  async fetchCategoriesByPostCount(limit: number = 10): Promise<Category[]> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    // This would require a join with posts table to count posts per category
    // For now, return all categories (this could be enhanced later)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch categories by post count: ${error.message}`);
    }

    return (data || []).map(this.mapDatabaseToDomain);
  }

  async searchCategories(query: string): Promise<Category[]> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to search categories: ${error.message}`);
    }

    return (data || []).map(this.mapDatabaseToDomain);
  }

  private mapDatabaseToDomain(data: any): Category {
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      color: data.color,
      postCount: 0, // This would need to be calculated from posts table
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}