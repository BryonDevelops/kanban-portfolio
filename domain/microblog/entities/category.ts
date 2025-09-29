// domain/microblog/entities/category.ts

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  postCount: number;
  createdAt: string;
  updatedAt?: string;
}

export type CategoryCreate = Omit<Category, 'id' | 'postCount' | 'createdAt' | 'updatedAt'>;

export type CategoryUpdate = Partial<Omit<Category, 'id' | 'createdAt'>>;