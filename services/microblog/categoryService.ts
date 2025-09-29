// services/microblog/categoryService.ts

import { ICategoryRepository } from '../../domain/microblog/repositories/categoryRepository';
import { Category, CategoryCreate, CategoryUpdate } from '../../domain/microblog/entities/category';

export class CategoryService {
  constructor(private repository: ICategoryRepository) {}

  async createCategory(categoryData: CategoryCreate): Promise<Category> {
    // Business logic validation
    if (!categoryData.name.trim()) {
      throw new Error('Category name is required');
    }

    if (!categoryData.slug.trim()) {
      throw new Error('Category slug is required');
    }

    // Check if slug is URL-friendly
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(categoryData.slug)) {
      throw new Error('Category slug must be URL-friendly (lowercase letters, numbers, and hyphens only)');
    }

    // Check if slug already exists
    const existingCategory = await this.repository.fetchCategoryBySlug(categoryData.slug);
    if (existingCategory) {
      throw new Error('Category slug already exists');
    }

    return await this.repository.createCategory(categoryData);
  }

  async getCategories(): Promise<Category[]> {
    return await this.repository.fetchCategories();
  }

  async getCategoryById(id: string): Promise<Category | null> {
    return await this.repository.fetchCategoryById(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return await this.repository.fetchCategoryBySlug(slug);
  }

  async updateCategory(id: string, updates: CategoryUpdate): Promise<Category> {
    // Business logic validation
    if (updates.name !== undefined && !updates.name.trim()) {
      throw new Error('Category name cannot be empty');
    }

    if (updates.slug !== undefined) {
      if (!updates.slug.trim()) {
        throw new Error('Category slug cannot be empty');
      }

      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(updates.slug)) {
        throw new Error('Category slug must be URL-friendly (lowercase letters, numbers, and hyphens only)');
      }

      // Check if new slug conflicts with existing categories (excluding current one)
      const existingCategory = await this.repository.fetchCategoryBySlug(updates.slug);
      if (existingCategory && existingCategory.id !== id) {
        throw new Error('Category slug already exists');
      }
    }

    return await this.repository.updateCategory(id, updates);
  }

  async deleteCategory(id: string): Promise<void> {
    return await this.repository.deleteCategory(id);
  }

  async getCategoriesByPostCount(limit?: number): Promise<Category[]> {
    return await this.repository.fetchCategoriesByPostCount(limit);
  }

  async searchCategories(query: string): Promise<Category[]> {
    if (!query.trim()) {
      return [];
    }

    return await this.repository.searchCategories(query.trim());
  }
}