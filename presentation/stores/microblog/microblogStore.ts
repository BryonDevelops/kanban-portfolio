// presentation/stores/microblog/microblogStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Post, PostCreate, PostUpdate, PostStatus } from '../../../domain/microblog/entities/post';
import { Category, CategoryCreate, CategoryUpdate } from '../../../domain/microblog/entities/category';
import { MicroblogService } from '../../../services/microblog/microblogService';
import { CategoryService } from '../../../services/microblog/categoryService';
import { SupabaseMicroblogRepository } from '../../../infrastructure/database/repositories/supabaseMicroblogRepository';
import { SupabaseCategoryRepository } from '../../../infrastructure/database/repositories/supabaseCategoryRepository';

// Initialize services
const microblogRepository = new SupabaseMicroblogRepository();
const categoryRepository = new SupabaseCategoryRepository();
const microblogService = new MicroblogService(microblogRepository);
const categoryService = new CategoryService(categoryRepository);

type MicroblogState = {
  posts: Post[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Post Actions
  createPost: (postData: PostCreate) => Promise<void>;
  updatePost: (id: string, updates: PostUpdate) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  publishPost: (id: string) => Promise<void>;
  archivePost: (id: string) => Promise<void>;
  unpublishPost: (id: string) => Promise<void>;
  toggleFeatured: (id: string) => Promise<void>;

  // Category Actions
  createCategory: (categoryData: CategoryCreate) => Promise<void>;
  updateCategory: (id: string, updates: CategoryUpdate) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Post Queries
  loadPosts: (forceRefresh?: boolean) => Promise<void>;
  loadPostById: (id: string) => Promise<Post | null>;
  loadPostsByStatus: (status: PostStatus) => Promise<void>;
  loadPostsByAuthor: (author: string) => Promise<void>;
  loadPostsByTag: (tag: string) => Promise<void>;
  searchPosts: (query: string) => Promise<void>;

  // Category Queries
  loadCategories: (forceRefresh?: boolean) => Promise<void>;
  loadCategoryById: (id: string) => Promise<Category | null>;
  loadCategoryBySlug: (slug: string) => Promise<Category | null>;
  searchCategories: (query: string) => Promise<void>;

  // Getters
  getPublishedPosts: () => Post[];
  getDraftPosts: () => Post[];
  getArchivedPosts: () => Post[];
  getFeaturedPosts: () => Post[];
  getCategoryById: (id: string) => Category | undefined;
  getCategoryBySlug: (slug: string) => Category | undefined;
};

export const useMicroblogStore = create<MicroblogState>()(
  persist(
    (set, get) => ({
      posts: [],
      categories: [],
      isLoading: false,
      error: null,
      lastFetched: null,

      loadPosts: async (forceRefresh = false) => {
        const state = get();
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        const now = Date.now();

        // If we have cached data and it's still fresh (unless force refresh), use it
        if (!forceRefresh && state.posts.length > 0 &&
            state.lastFetched && (now - state.lastFetched) < CACHE_DURATION) {
          return; // Use cached data
        }

        // Always show cached data first if available, then fetch in background
        const hasCachedData = state.posts.length > 0;

        if (!hasCachedData || forceRefresh) {
          set({ isLoading: true, error: null });
        }

        try {
          const posts = await microblogService.getPosts();
          set({
            posts,
            isLoading: false,
            lastFetched: now,
            error: null
          });
        } catch (error) {
          // If we have cached data, keep using it even if fetch fails
          if (hasCachedData && !forceRefresh) {
            set({ isLoading: false });
          } else {
            set({
              error: error instanceof Error ? error.message : 'Failed to load posts',
              isLoading: false
            });
          }
        }
      },

      loadPostById: async (id: string) => {
        try {
          const post = await microblogService.getPostById(id);
          if (post) {
            set((state) => ({
              posts: state.posts.map(p => p.id === id ? post : p)
            }));
          }
          return post;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load post'
          });
          return null;
        }
      },

      loadPostsByStatus: async (status: PostStatus) => {
        set({ isLoading: true, error: null });
        try {
          const posts = await microblogService.getPostsByStatus(status);
          set({
            posts,
            isLoading: false,
            lastFetched: Date.now()
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load posts',
            isLoading: false
          });
        }
      },

      loadPostsByAuthor: async (author: string) => {
        set({ isLoading: true, error: null });
        try {
          const posts = await microblogService.getPostsByAuthor(author);
          set({
            posts,
            isLoading: false,
            lastFetched: Date.now()
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load posts',
            isLoading: false
          });
        }
      },

      loadPostsByTag: async (tag: string) => {
        set({ isLoading: true, error: null });
        try {
          const posts = await microblogService.getPostsByTag(tag);
          set({
            posts,
            isLoading: false,
            lastFetched: Date.now()
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load posts',
            isLoading: false
          });
        }
      },

      searchPosts: async (query: string) => {
        set({ isLoading: true, error: null });
        try {
          const posts = await microblogService.searchPosts(query);
          set({
            posts,
            isLoading: false,
            lastFetched: Date.now()
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to search posts',
            isLoading: false
          });
        }
      },

      createPost: async (postData: PostCreate) => {
        set({ isLoading: true, error: null });
        try {
          const newPost = await microblogService.createPost(postData);
          set((state) => ({
            posts: [newPost, ...state.posts],
            isLoading: false
          }));
          import("@/presentation/utils/toast").then(({ success }) => {
            success("Post created!", `"${postData.title}" has been published.`);
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create post',
            isLoading: false
          });
          import("@/presentation/utils/toast").then(({ error: errorToast }) => {
            errorToast("Failed to create post", error instanceof Error ? error.message : 'Please try again.');
          });
        }
      },

      updatePost: async (id: string, updates: PostUpdate) => {
        set({ isLoading: true, error: null });
        try {
          const updatedPost = await microblogService.updatePost(id, updates);
          set((state) => ({
            posts: state.posts.map(post =>
              post.id === id ? updatedPost : post
            ),
            isLoading: false
          }));
          import("@/presentation/utils/toast").then(({ success }) => {
            success("Post updated!", "Your changes have been saved.");
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update post',
            isLoading: false
          });
          import("@/presentation/utils/toast").then(({ error: errorToast }) => {
            errorToast("Failed to update post", error instanceof Error ? error.message : 'Please try again.');
          });
        }
      },

      deletePost: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await microblogService.deletePost(id);
          set((state) => ({
            posts: state.posts.filter(post => post.id !== id),
            isLoading: false
          }));
          import("@/presentation/utils/toast").then(({ success }) => {
            success("Post deleted!", "The post has been permanently removed.");
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete post',
            isLoading: false
          });
          import("@/presentation/utils/toast").then(({ error: errorToast }) => {
            errorToast("Failed to delete post", error instanceof Error ? error.message : 'Please try again.');
          });
        }
      },

      publishPost: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const publishedPost = await microblogService.publishPost(id);
          set((state) => ({
            posts: state.posts.map(post =>
              post.id === id ? publishedPost : post
            ),
            isLoading: false
          }));
          import("@/presentation/utils/toast").then(({ success }) => {
            success("Post published!", "Your post is now live.");
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to publish post',
            isLoading: false
          });
          import("@/presentation/utils/toast").then(({ error: errorToast }) => {
            errorToast("Failed to publish post", error instanceof Error ? error.message : 'Please try again.');
          });
        }
      },

      archivePost: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const archivedPost = await microblogService.archivePost(id);
          set((state) => ({
            posts: state.posts.map(post =>
              post.id === id ? archivedPost : post
            ),
            isLoading: false
          }));
          import("@/presentation/utils/toast").then(({ success }) => {
            success("Post archived!", "The post has been moved to archive.");
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to archive post',
            isLoading: false
          });
          import("@/presentation/utils/toast").then(({ error: errorToast }) => {
            errorToast("Failed to archive post", error instanceof Error ? error.message : 'Please try again.');
          });
        }
      },

      unpublishPost: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const unpublishedPost = await microblogService.unpublishPost(id);
          set((state) => ({
            posts: state.posts.map(post =>
              post.id === id ? unpublishedPost : post
            ),
            isLoading: false
          }));
          import("@/presentation/utils/toast").then(({ success }) => {
            success("Post unpublished!", "The post has been moved back to drafts.");
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to unpublish post',
            isLoading: false
          });
          import("@/presentation/utils/toast").then(({ error: errorToast }) => {
            errorToast("Failed to unpublish post", error instanceof Error ? error.message : 'Please try again.');
          });
        }
      },

      toggleFeatured: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const updatedPost = await microblogService.toggleFeatured(id);
          set((state) => ({
            posts: state.posts.map(post =>
              post.id === id ? updatedPost : post
            ),
            isLoading: false
          }));
          const isNowFeatured = updatedPost.featured;
          import("@/presentation/utils/toast").then(({ success }) => {
            success(
              isNowFeatured ? "Post featured!" : "Post unfeatured!",
              isNowFeatured ? "This post is now featured." : "This post is no longer featured."
            );
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to toggle featured status',
            isLoading: false
          });
          import("@/presentation/utils/toast").then(({ error: errorToast }) => {
            errorToast("Failed to toggle featured status", error instanceof Error ? error.message : 'Please try again.');
          });
        }
      },

      // Category Actions
      createCategory: async (categoryData: CategoryCreate) => {
        set({ isLoading: true, error: null });
        try {
          const newCategory = await categoryService.createCategory(categoryData);
          set((state) => ({
            categories: [...state.categories, newCategory],
            isLoading: false
          }));
          import("@/presentation/utils/toast").then(({ success }) => {
            success("Category created!", `"${categoryData.name}" has been added.`);
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create category',
            isLoading: false
          });
          import("@/presentation/utils/toast").then(({ error: errorToast }) => {
            errorToast("Failed to create category", error instanceof Error ? error.message : 'Please try again.');
          });
        }
      },

      updateCategory: async (id: string, updates: CategoryUpdate) => {
        set({ isLoading: true, error: null });
        try {
          const updatedCategory = await categoryService.updateCategory(id, updates);
          set((state) => ({
            categories: state.categories.map(category =>
              category.id === id ? updatedCategory : category
            ),
            isLoading: false
          }));
          import("@/presentation/utils/toast").then(({ success }) => {
            success("Category updated!", "Your changes have been saved.");
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update category',
            isLoading: false
          });
          import("@/presentation/utils/toast").then(({ error: errorToast }) => {
            errorToast("Failed to update category", error instanceof Error ? error.message : 'Please try again.');
          });
        }
      },

      deleteCategory: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await categoryService.deleteCategory(id);
          set((state) => ({
            categories: state.categories.filter(category => category.id !== id),
            isLoading: false
          }));
          import("@/presentation/utils/toast").then(({ success }) => {
            success("Category deleted!", "The category has been permanently removed.");
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete category',
            isLoading: false
          });
          import("@/presentation/utils/toast").then(({ error: errorToast }) => {
            errorToast("Failed to delete category", error instanceof Error ? error.message : 'Please try again.');
          });
        }
      },

      // Category Queries
      loadCategories: async (forceRefresh = false) => {
        const state = get();
        const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for categories (less frequent updates)
        const now = Date.now();

        // If we have cached data and it's still fresh (unless force refresh), use it
        if (!forceRefresh && state.categories.length > 0 &&
            state.lastFetched && (now - state.lastFetched) < CACHE_DURATION) {
          return; // Use cached data
        }

        // Always show cached data first if available, then fetch in background
        const hasCachedData = state.categories.length > 0;

        if (!hasCachedData || forceRefresh) {
          set({ isLoading: true, error: null });
        }

        try {
          const categories = await categoryService.getCategories();
          set({
            categories,
            isLoading: false,
            lastFetched: now,
            error: null
          });
        } catch (error) {
          // If we have cached data, keep using it even if fetch fails
          if (hasCachedData && !forceRefresh) {
            set({ isLoading: false });
          } else {
            set({
              error: error instanceof Error ? error.message : 'Failed to load categories',
              isLoading: false
            });
          }
        }
      },

      loadCategoryById: async (id: string) => {
        try {
          const category = await categoryService.getCategoryById(id);
          if (category) {
            const currentState = get();
            set({
              categories: currentState.categories.map(c => c.id === id ? category : c)
            });
          }
          return category;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load category'
          });
          return null;
        }
      },

      loadCategoryBySlug: async (slug: string) => {
        try {
          const category = await categoryService.getCategoryBySlug(slug);
          if (category) {
            const currentState = get();
            set({
              categories: currentState.categories.map(c => c.slug === slug ? category : c)
            });
          }
          return category;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load category'
          });
          return null;
        }
      },

      searchCategories: async (query: string) => {
        set({ isLoading: true, error: null });
        try {
          const categories = await categoryService.searchCategories(query);
          set({
            categories,
            isLoading: false,
            lastFetched: Date.now()
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to search categories',
            isLoading: false
          });
        }
      },

      // Getters
      getPublishedPosts: () => {
        const state = get();
        return state.posts.filter(post => post.status === 'published');
      },

      getDraftPosts: () => {
        const state = get();
        return state.posts.filter(post => post.status === 'draft');
      },

      getArchivedPosts: () => {
        const state = get();
        return state.posts.filter(post => post.status === 'archived');
      },

      getFeaturedPosts: () => {
        const state = get();
        return state.posts.filter(post => post.featured === true && post.status === 'published');
      },

      getCategoryById: (id: string) => {
        const state = get();
        return state.categories.find(category => category.id === id);
      },

      getCategoryBySlug: (slug: string) => {
        const state = get();
        return state.categories.find(category => category.slug === slug);
      },
    }),
    {
      name: 'microblog-store-v1',
      partialize: (state) => ({
        posts: state.posts,
        categories: state.categories,
        lastFetched: state.lastFetched
      })
    }
  )
);