import { FeatureFlag, FeatureFlagCreate, FeatureFlagUpdate } from '../entities/featureFlag';

export interface IFeatureFlagRepository {
  // Feature flag operations
  fetchFeatureFlags(): Promise<FeatureFlag[]>;
  fetchFeatureFlagById(id: string): Promise<FeatureFlag | null>;
  addFeatureFlag(flag: FeatureFlagCreate): Promise<FeatureFlag>;
  updateFeatureFlag(id: string, updates: FeatureFlagUpdate): Promise<FeatureFlag>;
  deleteFeatureFlag(id: string): Promise<void>;
  toggleFeatureFlag(id: string, enabled: boolean, updatedBy?: string): Promise<FeatureFlag>;
}