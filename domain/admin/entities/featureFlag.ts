export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'core' | 'admin' | 'advanced' | 'experimental';
  created_at: Date;
  updated_at: Date;
  updated_by?: string;
}

export interface FeatureFlagCreate {
  id: string;
  name: string;
  description: string;
  enabled?: boolean;
  category?: 'core' | 'admin' | 'advanced' | 'experimental';
}

export interface FeatureFlagUpdate {
  name?: string;
  description?: string;
  enabled?: boolean;
  category?: 'core' | 'admin' | 'advanced' | 'experimental';
}