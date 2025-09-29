// domain/microblog/entities/post.ts

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  tags: string[];
  readTime: number;
  imageUrl?: string;
  status: PostStatus;
  featured: boolean;
  categories: string[]; // Array of category IDs
  updatedAt?: string;
  createdAt: string;
}

export type PostStatus = 'draft' | 'published' | 'archived';

export type PostCreate = Omit<Post, 'id' | 'readTime' | 'createdAt' | 'updatedAt'>;

export type PostUpdate = Partial<Omit<Post, 'id' | 'createdAt'>> & {
  imageUrl?: string | null;
};