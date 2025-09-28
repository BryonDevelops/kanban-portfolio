import { create } from 'zustand';
import { FeatureFlag } from '../../../domain/admin/entities/featureFlag';
import { FeatureFlagService } from '../../../services/admin/featureFlagService';
import { SupabaseFeatureFlagRepository } from '../../../infrastructure/database/repositories/supabaseFeatureFlagRepository';
import { getSupabase } from '../../../infrastructure/database/supabaseClient';

// Initialize services
const supabaseClient = getSupabase();
if (!supabaseClient) {
  throw new Error('Supabase client not available');
}
const featureFlagRepository = new SupabaseFeatureFlagRepository();
const featureFlagService = new FeatureFlagService(featureFlagRepository);

type AdminFeatureFlagState = {
  flags: FeatureFlag[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  loadFeatureFlags: (forceRefresh?: boolean) => Promise<void>;
  toggleFeatureFlag: (id: string, enabled: boolean, updatedBy?: string) => Promise<void>;
  updateFeatureFlag: (id: string, updates: Partial<FeatureFlag>) => Promise<void>;
  createFeatureFlag: (flag: Omit<FeatureFlag, 'created_at' | 'updated_at'>) => Promise<void>;
  deleteFeatureFlag: (id: string) => Promise<void>;
  refreshFeatureFlags: () => Promise<void>;
};

export const useAdminFeatureFlagStore = create<AdminFeatureFlagState>((set, get) => ({
  flags: [],
  isLoading: false,
  error: null,
  lastFetched: null,

  loadFeatureFlags: async (forceRefresh = false) => {
    const state = get();
    const CACHE_DURATION = 30 * 1000; // 30 seconds for admin data
    const now = Date.now();

    // If we have cached data and it's still fresh (unless force refresh), use it
    if (!forceRefresh && state.flags.length > 0 && state.lastFetched && (now - state.lastFetched) < CACHE_DURATION) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const flags = await featureFlagService.getFeatureFlags();
      set({
        flags,
        isLoading: false,
        lastFetched: now,
        error: null
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load feature flags',
        isLoading: false
      });
    }
  },

  toggleFeatureFlag: async (id: string, enabled: boolean, updatedBy?: string) => {
    set({ isLoading: true, error: null });

    try {
      const updatedFlag = await featureFlagService.toggleFeatureFlag(id, enabled, updatedBy);

      set((state) => ({
        flags: state.flags.map(flag =>
          flag.id === id ? updatedFlag : flag
        ),
        isLoading: false
      }));

      // Show success message
      import("@/presentation/utils/toast").then(({ success }) => {
        success(
          "Feature flag updated!",
          `"${updatedFlag.name}" has been ${enabled ? 'enabled' : 'disabled'}.`
        );
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to toggle feature flag',
        isLoading: false
      });

      import("@/presentation/utils/toast").then(({ error: errorToast }) => {
        errorToast("Failed to update feature flag", error instanceof Error ? error.message : 'Please try again.');
      });
    }
  },

  updateFeatureFlag: async (id: string, updates: Partial<FeatureFlag>) => {
    set({ isLoading: true, error: null });

    try {
      const updatedFlag = await featureFlagService.updateFeatureFlag(id, {
        name: updates.name,
        description: updates.description,
        enabled: updates.enabled,
        category: updates.category
      });

      set((state) => ({
        flags: state.flags.map(flag =>
          flag.id === id ? updatedFlag : flag
        ),
        isLoading: false
      }));

      import("@/presentation/utils/toast").then(({ success }) => {
        success("Feature flag updated!", "Your changes have been saved.");
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update feature flag',
        isLoading: false
      });

      import("@/presentation/utils/toast").then(({ error: errorToast }) => {
        errorToast("Failed to update feature flag", error instanceof Error ? error.message : 'Please try again.');
      });
    }
  },

  createFeatureFlag: async (flagData: Omit<FeatureFlag, 'created_at' | 'updated_at'>) => {
    set({ isLoading: true, error: null });

    try {
      const newFlag = await featureFlagService.createFeatureFlag({
        id: flagData.id,
        name: flagData.name,
        description: flagData.description,
        enabled: flagData.enabled,
        category: flagData.category
      });

      set((state) => ({
        flags: [...state.flags, newFlag],
        isLoading: false
      }));

      import("@/presentation/utils/toast").then(({ success }) => {
        success("Feature flag created!", `"${newFlag.name}" has been added.`);
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create feature flag',
        isLoading: false
      });

      import("@/presentation/utils/toast").then(({ error: errorToast }) => {
        errorToast("Failed to create feature flag", error instanceof Error ? error.message : 'Please try again.');
      });
    }
  },

  deleteFeatureFlag: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      await featureFlagService.deleteFeatureFlag(id);

      set((state) => ({
        flags: state.flags.filter(flag => flag.id !== id),
        isLoading: false
      }));

      import("@/presentation/utils/toast").then(({ success }) => {
        success("Feature flag deleted!", "The feature flag has been removed.");
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete feature flag',
        isLoading: false
      });

      import("@/presentation/utils/toast").then(({ error: errorToast }) => {
        errorToast("Failed to delete feature flag", error instanceof Error ? error.message : 'Please try again.');
      });
    }
  },

  refreshFeatureFlags: async () => {
    await get().loadFeatureFlags(true);
  }
}));