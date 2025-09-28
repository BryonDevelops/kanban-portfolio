import { IFeatureFlagRepository } from '../../domain/admin/repositories/featureFlagRepository.interface';
import { FeatureFlag, FeatureFlagCreate, FeatureFlagUpdate } from '../../domain/admin/entities/featureFlag';

export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export class FeatureFlagService {
  constructor(private repository: IFeatureFlagRepository) {}

  async getFeatureFlags(): Promise<FeatureFlag[]> {
    try {
      return await this.repository.fetchFeatureFlags();
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      throw new ServiceError('Failed to fetch feature flags', 'FETCH_ERROR', 500);
    }
  }

  async getFeatureFlagById(id: string): Promise<FeatureFlag | null> {
    try {
      return await this.repository.fetchFeatureFlagById(id);
    } catch (error) {
      console.error('Error fetching feature flag by ID:', error);
      throw new ServiceError('Failed to fetch feature flag', 'FETCH_ERROR', 500);
    }
  }

  async createFeatureFlag(flagData: FeatureFlagCreate): Promise<FeatureFlag> {
    try {
      // Validate input
      this.validateFeatureFlagCreate(flagData);

      // Check if flag with this ID already exists
      const existing = await this.repository.fetchFeatureFlagById(flagData.id);
      if (existing) {
        throw new ServiceError(`Feature flag with id "${flagData.id}" already exists`, 'DUPLICATE_ERROR', 409);
      }

      return await this.repository.addFeatureFlag(flagData);
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError('Failed to create feature flag', 'CREATE_ERROR', 500);
    }
  }

  async updateFeatureFlag(id: string, updates: FeatureFlagUpdate): Promise<FeatureFlag> {
    try {
      // Validate input
      this.validateFeatureFlagUpdate(updates);

      // Check if flag exists
      const existing = await this.repository.fetchFeatureFlagById(id);
      if (!existing) {
        throw new ServiceError(`Feature flag with id "${id}" not found`, 'NOT_FOUND', 404);
      }

      return await this.repository.updateFeatureFlag(id, updates);
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError('Failed to update feature flag', 'UPDATE_ERROR', 500);
    }
  }

  async deleteFeatureFlag(id: string): Promise<void> {
    try {
      // Check if flag exists
      const existing = await this.repository.fetchFeatureFlagById(id);
      if (!existing) {
        throw new ServiceError(`Feature flag with id "${id}" not found`, 'NOT_FOUND', 404);
      }

      await this.repository.deleteFeatureFlag(id);
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError('Failed to delete feature flag', 'DELETE_ERROR', 500);
    }
  }

  async toggleFeatureFlag(id: string, enabled: boolean, updatedBy?: string): Promise<FeatureFlag> {
    try {
      // Check if flag exists
      const existing = await this.repository.fetchFeatureFlagById(id);
      if (!existing) {
        throw new ServiceError(`Feature flag with id "${id}" not found`, 'NOT_FOUND', 404);
      }

      return await this.repository.toggleFeatureFlag(id, enabled, updatedBy);
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError('Failed to toggle feature flag', 'TOGGLE_ERROR', 500);
    }
  }

  async getFeatureFlagsByCategory(category: 'core' | 'admin' | 'advanced' | 'experimental'): Promise<FeatureFlag[]> {
    try {
      const flags = await this.repository.fetchFeatureFlags();
      return flags.filter(flag => flag.category === category);
    } catch (error) {
      console.error('Error fetching feature flags by category:', error);
      throw new ServiceError('Failed to fetch feature flags by category', 'FETCH_ERROR', 500);
    }
  }

  private validateFeatureFlagCreate(flag: FeatureFlagCreate): void {
    if (!flag.id || flag.id.trim().length === 0) {
      throw new ServiceError('Feature flag ID is required', 'VALIDATION_ERROR', 400);
    }

    if (!flag.name || flag.name.trim().length === 0) {
      throw new ServiceError('Feature flag name is required', 'VALIDATION_ERROR', 400);
    }

    if (flag.description && flag.description.length > 500) {
      throw new ServiceError('Feature flag description must be less than 500 characters', 'VALIDATION_ERROR', 400);
    }

    if (flag.category && !['core', 'admin', 'advanced', 'experimental'].includes(flag.category)) {
      throw new ServiceError('Invalid category. Must be one of: core, admin, advanced, experimental', 'VALIDATION_ERROR', 400);
    }
  }

  private validateFeatureFlagUpdate(updates: FeatureFlagUpdate): void {
    if (updates.name !== undefined && (!updates.name || updates.name.trim().length === 0)) {
      throw new ServiceError('Feature flag name cannot be empty', 'VALIDATION_ERROR', 400);
    }

    if (updates.description !== undefined && updates.description && updates.description.length > 500) {
      throw new ServiceError('Feature flag description must be less than 500 characters', 'VALIDATION_ERROR', 400);
    }

    if (updates.category !== undefined && !['core', 'admin', 'advanced', 'experimental'].includes(updates.category)) {
      throw new ServiceError('Invalid category. Must be one of: core, admin, advanced, experimental', 'VALIDATION_ERROR', 400);
    }
  }
}