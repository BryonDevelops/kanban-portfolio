import { IFeatureFlagRepository } from '../../../domain/admin/repositories/featureFlagRepository.interface';
import { FeatureFlag, FeatureFlagCreate, FeatureFlagUpdate } from '../../../domain/admin/entities/featureFlag';
import { getSupabase } from '../supabaseClient';

interface DbFeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'core' | 'admin' | 'advanced' | 'experimental';
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

export class SupabaseFeatureFlagRepository implements IFeatureFlagRepository {
  private get client() {
    const client = getSupabase();
    if (!client) {
      throw new Error('Supabase client not configured. Please check your environment variables.');
    }
    return client;
  }

  async fetchFeatureFlags(): Promise<FeatureFlag[]> {
    const { data, error } = await this.client
      .from('feature_flags')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch feature flags: ${error.message}`);
    }

    return data.map(this.mapDbToDomain);
  }

  async fetchFeatureFlagById(id: string): Promise<FeatureFlag | null> {
    const { data, error } = await this.client
      .from('feature_flags')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch feature flag: ${error.message}`);
    }

    return this.mapDbToDomain(data);
  }

  async addFeatureFlag(flag: FeatureFlagCreate): Promise<FeatureFlag> {
    const dbFlag = this.mapDomainToDbCreate(flag);

    const { data, error } = await this.client
      .from('feature_flags')
      .insert(dbFlag)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add feature flag: ${error.message}`);
    }

    return this.mapDbToDomain(data);
  }

  async updateFeatureFlag(id: string, updates: FeatureFlagUpdate): Promise<FeatureFlag> {
    const dbUpdates = this.mapDomainToDbUpdate(updates);

    const { data, error } = await this.client
      .from('feature_flags')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update feature flag: ${error.message}`);
    }

    return this.mapDbToDomain(data);
  }

  async deleteFeatureFlag(id: string): Promise<void> {
    const { error } = await this.client
      .from('feature_flags')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete feature flag: ${error.message}`);
    }
  }

  async toggleFeatureFlag(id: string, enabled: boolean, updatedBy?: string): Promise<FeatureFlag> {
    const updates: Partial<DbFeatureFlag> = {
      enabled,
      updated_at: new Date().toISOString()
    };

    if (updatedBy) {
      updates.updated_by = updatedBy;
    }

    const { data, error } = await this.client
      .from('feature_flags')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to toggle feature flag: ${error.message}`);
    }

    return this.mapDbToDomain(data);
  }

  private mapDbToDomain(dbFlag: DbFeatureFlag): FeatureFlag {
    return {
      id: dbFlag.id,
      name: dbFlag.name,
      description: dbFlag.description,
      enabled: dbFlag.enabled,
      category: dbFlag.category,
      created_at: new Date(dbFlag.created_at),
      updated_at: new Date(dbFlag.updated_at),
      updated_by: dbFlag.updated_by
    };
  }

  private mapDomainToDbCreate(flag: FeatureFlagCreate): Omit<DbFeatureFlag, 'created_at' | 'updated_at'> {
    return {
      id: flag.id,
      name: flag.name,
      description: flag.description,
      enabled: flag.enabled ?? true,
      category: flag.category ?? 'core'
    };
  }

  private mapDomainToDbUpdate(updates: FeatureFlagUpdate): Partial<DbFeatureFlag> {
    const dbUpdates: Partial<DbFeatureFlag> = {
      updated_at: new Date().toISOString()
    };

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.enabled !== undefined) dbUpdates.enabled = updates.enabled;
    if (updates.category !== undefined) dbUpdates.category = updates.category;

    return dbUpdates;
  }
}