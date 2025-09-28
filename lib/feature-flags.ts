// Feature flags configuration
// Control which features are enabled/disabled in the application

import { getFeatureFlagService } from '@/lib/dependencyContainer'

export interface FeatureFlags {
  // Core features
  board: boolean;
  microblog: boolean;
  projects: boolean;
  about: boolean;
  contact: boolean;

  // Admin features
  admin: boolean;
  userManagement: boolean;
  systemSettings: boolean;

  // Advanced features
  analytics: boolean;
  pwa: boolean;
  offline: boolean;

  // Experimental features
  aiAssistant: boolean;
  advancedSearch: boolean;
}

// Default feature flags (all enabled)
export const defaultFeatureFlags: FeatureFlags = {
  // Core features
  board: true,
  microblog: true,
  projects: true,
  about: true,
  contact: true,

  // Admin features
  admin: true,
  userManagement: true,
  systemSettings: true,

  // Advanced features
  analytics: true,
  pwa: true,
  offline: true,

  // Experimental features
  aiAssistant: false,
  advancedSearch: false,
};

// Load feature flags from service, with environment variables as fallback
export async function loadFeatureFlags(): Promise<FeatureFlags> {
  const flags = { ...defaultFeatureFlags };

  try {
    const featureFlagService = getFeatureFlagService();

    const dbFlags = await featureFlagService.getFeatureFlags();

    if (dbFlags && dbFlags.length > 0) {
      // Map database flags to our interface
      dbFlags.forEach((flag: { id: string; enabled: boolean }) => {
        if (flag.id in flags) {
          flags[flag.id as keyof FeatureFlags] = flag.enabled;
        }
      });
      return flags;
    }
  } catch (error) {
    console.warn('Failed to load feature flags from service:', error);
  }

  // Fallback to environment variables
  return loadFeatureFlagsFromEnv();
}

// Load feature flags from environment variables (legacy method)
export function loadFeatureFlagsFromEnv(): FeatureFlags {
  const flags = { ...defaultFeatureFlags };

  // Helper function to safely parse boolean env vars
  const parseBooleanEnv = (envValue: string | undefined, defaultValue: boolean): boolean => {
    if (envValue === undefined) return defaultValue;
    if (envValue === 'true') return true;
    if (envValue === 'false') return false;
    // Invalid values fall back to default
    return defaultValue;
  };

  // Core features
  flags.board = parseBooleanEnv(process.env.NEXT_PUBLIC_FEATURE_BOARD, flags.board);
  flags.microblog = parseBooleanEnv(process.env.NEXT_PUBLIC_FEATURE_MICROBLOG, flags.microblog);
  flags.projects = parseBooleanEnv(process.env.NEXT_PUBLIC_FEATURE_PROJECTS, flags.projects);
  flags.about = parseBooleanEnv(process.env.NEXT_PUBLIC_FEATURE_ABOUT, flags.about);
  flags.contact = parseBooleanEnv(process.env.NEXT_PUBLIC_FEATURE_CONTACT, flags.contact);

  // Admin features
  flags.admin = parseBooleanEnv(process.env.NEXT_PUBLIC_FEATURE_ADMIN, flags.admin);
  flags.userManagement = parseBooleanEnv(process.env.NEXT_PUBLIC_FEATURE_USER_MANAGEMENT, flags.userManagement);
  flags.systemSettings = parseBooleanEnv(process.env.NEXT_PUBLIC_FEATURE_SYSTEM_SETTINGS, flags.systemSettings);

  // Advanced features
  flags.analytics = parseBooleanEnv(process.env.NEXT_PUBLIC_FEATURE_ANALYTICS, flags.analytics);
  flags.pwa = parseBooleanEnv(process.env.NEXT_PUBLIC_FEATURE_PWA, flags.pwa);
  flags.offline = parseBooleanEnv(process.env.NEXT_PUBLIC_FEATURE_OFFLINE, flags.offline);

  // Experimental features
  flags.aiAssistant = parseBooleanEnv(process.env.NEXT_PUBLIC_FEATURE_AI_ASSISTANT, flags.aiAssistant);
  flags.advancedSearch = parseBooleanEnv(process.env.NEXT_PUBLIC_FEATURE_ADVANCED_SEARCH, flags.advancedSearch);

  return flags;
}

// Singleton instance
let featureFlagsInstance: FeatureFlags | null = null;
let featureFlagsLoaded = false;

// Get the current feature flags (lazy loaded)
export async function getFeatureFlags(): Promise<FeatureFlags> {
  if (!featureFlagsLoaded) {
    featureFlagsInstance = await loadFeatureFlags();
    featureFlagsLoaded = true;
  }
  return featureFlagsInstance!;
}

// Synchronous version for client-side use (returns cached version)
export function getFeatureFlagsSync(): FeatureFlags {
  if (!featureFlagsInstance) {
    // If not loaded yet, return defaults + env vars
    featureFlagsInstance = loadFeatureFlagsFromEnv();
  }
  return featureFlagsInstance;
}

// Refresh feature flags (useful after admin updates)
export async function refreshFeatureFlags(): Promise<FeatureFlags> {
  featureFlagsLoaded = false;
  featureFlagsInstance = null;
  return await getFeatureFlags();
}

// Check if a specific feature is enabled
export async function isFeatureEnabled(feature: keyof FeatureFlags): Promise<boolean> {
  const flags = await getFeatureFlags();
  return flags[feature];
}

// Synchronous version for client-side use
export function isFeatureEnabledSync(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlagsSync();
  return flags[feature];
}

// Helper functions for common feature checks
export const features = {
  isBoardEnabled: () => isFeatureEnabledSync('board'),
  isMicroblogEnabled: () => isFeatureEnabledSync('microblog'),
  isProjectsEnabled: () => isFeatureEnabledSync('projects'),
  isAboutEnabled: () => isFeatureEnabledSync('about'),
  isContactEnabled: () => isFeatureEnabledSync('contact'),
  isAdminEnabled: () => isFeatureEnabledSync('admin'),
  isUserManagementEnabled: () => isFeatureEnabledSync('userManagement'),
  isSystemSettingsEnabled: () => isFeatureEnabledSync('systemSettings'),
  isAnalyticsEnabled: () => isFeatureEnabledSync('analytics'),
  isPWAEnabled: () => isFeatureEnabledSync('pwa'),
  isOfflineEnabled: () => isFeatureEnabledSync('offline'),
  isAIAssistantEnabled: () => isFeatureEnabledSync('aiAssistant'),
  isAdvancedSearchEnabled: () => isFeatureEnabledSync('advancedSearch'),
};