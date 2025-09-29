// domain/microblog/schemas/post.schema.ts

import { z } from 'zod';

// Base post schema
export const PostSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters').max(500, 'Excerpt must be less than 500 characters'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  author: z.string().min(1, 'Author is required'),
  publishedAt: z.string().datetime('Invalid published date'),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed'),
  readTime: z.number().int().positive('Read time must be positive'),
  imageUrl: z.string().url('Invalid image URL').optional(),
  status: z.enum(['draft', 'published', 'archived']),
  featured: z.boolean(),
  categories: z.array(z.string()).default([]), // Array of category IDs
  updatedAt: z.string().datetime('Invalid updated date').optional(),
  createdAt: z.string().datetime('Invalid created date'),
});

// Post creation schema (without generated fields)
export const PostCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters').max(500, 'Excerpt must be less than 500 characters'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  author: z.string().min(1, 'Author is required'),
  publishedAt: z.string().datetime('Invalid published date'),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed'),
  imageUrl: z.string().url('Invalid image URL').optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  featured: z.boolean().default(false),
  categories: z.array(z.string()).default([]), // Array of category IDs
});

// Post update schema (all fields optional)
export const PostUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters').max(500, 'Excerpt must be less than 500 characters').optional(),
  content: z.string().min(50, 'Content must be at least 50 characters').optional(),
  author: z.string().min(1, 'Author is required').optional(),
  publishedAt: z.string().datetime('Invalid published date').optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
  imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  featured: z.boolean().optional(),
  categories: z.array(z.string()).optional(), // Array of category IDs
}).partial();

// Type exports
export type Post = z.infer<typeof PostSchema>;
export type PostCreate = z.infer<typeof PostCreateSchema>;
export type PostUpdate = z.infer<typeof PostUpdateSchema>;