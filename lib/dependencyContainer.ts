import { FeatureFlagService } from '@/services/admin/featureFlagService'
import { SupabaseFeatureFlagRepository } from '@/infrastructure/database/repositories/supabaseFeatureFlagRepository'

// Initialize repository
const featureFlagRepository = new SupabaseFeatureFlagRepository()

// Initialize service
const featureFlagService = new FeatureFlagService(featureFlagRepository)

/**
 * Get the feature flag service instance
 */
export function getFeatureFlagService(): FeatureFlagService {
  return featureFlagService
}