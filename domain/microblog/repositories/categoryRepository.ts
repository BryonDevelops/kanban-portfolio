// domain/microblog/repositories/categoryRepository.ts

import { Category, CategoryCreate, CategoryUpdate } from '../entities/category';

export interface ICategoryRepository {
  // CRUD operations
  fetchCategories(): Promise<Category[]>;
  fetchCategoryById(id: string): Promise<Category | null>;
  fetchCategoryBySlug(slug: string): Promise<Category | null>;
  createCategory(categoryData: CategoryCreate): Promise<Category>;
  updateCategory(id: string, updates: CategoryUpdate): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Query operations
  fetchCategoriesByPostCount(limit?: number): Promise<Category[]>;
  searchCategories(query: string): Promise<Category[]>;
}