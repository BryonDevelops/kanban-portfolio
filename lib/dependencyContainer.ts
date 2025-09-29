import { FeatureFlagService } from '@/services/admin/featureFlagService'
import { SupabaseFeatureFlagRepository } from '@/infrastructure/database/repositories/supabaseFeatureFlagRepository'
import { MicroblogService } from '@/services/microblog/microblogService'
import { SupabaseMicroblogRepository } from '@/infrastructure/database/repositories/supabaseMicroblogRepository'
import { CategoryService } from '@/services/microblog/categoryService'
import { SupabaseCategoryRepository } from '@/infrastructure/database/repositories/supabaseCategoryRepository'

// Initialize repositories
const featureFlagRepository = new SupabaseFeatureFlagRepository()
const microblogRepository = new SupabaseMicroblogRepository()
const categoryRepository = new SupabaseCategoryRepository()

// Initialize services
const featureFlagService = new FeatureFlagService(featureFlagRepository)
const microblogService = new MicroblogService(microblogRepository)
const categoryService = new CategoryService(categoryRepository)

/**
 * Get the feature flag service instance
 */
export function getFeatureFlagService(): FeatureFlagService {
  return featureFlagService
}

/**
 * Get the microblog service instance
 */
export function getMicroblogService(): MicroblogService {
  return microblogService
}

/**
 * Get the category service instance
 */
export function getCategoryService(): CategoryService {
  return categoryService
}