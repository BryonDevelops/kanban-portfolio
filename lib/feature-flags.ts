// Feature flags configuration
// Control which features are enabled/disabled in the application

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

// Load feature flags from environment variables
export function loadFeatureFlags(): FeatureFlags {
  const flags = { ...defaultFeatureFlags };

  // Core features
  if (process.env.NEXT_PUBLIC_FEATURE_BOARD !== undefined) {
    flags.board = process.env.NEXT_PUBLIC_FEATURE_BOARD === 'true';
  }
  if (process.env.NEXT_PUBLIC_FEATURE_MICROBLOG !== undefined) {
    flags.microblog = process.env.NEXT_PUBLIC_FEATURE_MICROBLOG === 'true';
  }
  if (process.env.NEXT_PUBLIC_FEATURE_PROJECTS !== undefined) {
    flags.projects = process.env.NEXT_PUBLIC_FEATURE_PROJECTS === 'true';
  }
  if (process.env.NEXT_PUBLIC_FEATURE_ABOUT !== undefined) {
    flags.about = process.env.NEXT_PUBLIC_FEATURE_ABOUT === 'true';
  }
  if (process.env.NEXT_PUBLIC_FEATURE_CONTACT !== undefined) {
    flags.contact = process.env.NEXT_PUBLIC_FEATURE_CONTACT === 'true';
  }

  // Admin features
  if (process.env.NEXT_PUBLIC_FEATURE_ADMIN !== undefined) {
    flags.admin = process.env.NEXT_PUBLIC_FEATURE_ADMIN === 'true';
  }
  if (process.env.NEXT_PUBLIC_FEATURE_USER_MANAGEMENT !== undefined) {
    flags.userManagement = process.env.NEXT_PUBLIC_FEATURE_USER_MANAGEMENT === 'true';
  }
  if (process.env.NEXT_PUBLIC_FEATURE_SYSTEM_SETTINGS !== undefined) {
    flags.systemSettings = process.env.NEXT_PUBLIC_FEATURE_SYSTEM_SETTINGS === 'true';
  }

  // Advanced features
  if (process.env.NEXT_PUBLIC_FEATURE_ANALYTICS !== undefined) {
    flags.analytics = process.env.NEXT_PUBLIC_FEATURE_ANALYTICS === 'true';
  }
  if (process.env.NEXT_PUBLIC_FEATURE_PWA !== undefined) {
    flags.pwa = process.env.NEXT_PUBLIC_FEATURE_PWA === 'true';
  }
  if (process.env.NEXT_PUBLIC_FEATURE_OFFLINE !== undefined) {
    flags.offline = process.env.NEXT_PUBLIC_FEATURE_OFFLINE === 'true';
  }

  // Experimental features
  if (process.env.NEXT_PUBLIC_FEATURE_AI_ASSISTANT !== undefined) {
    flags.aiAssistant = process.env.NEXT_PUBLIC_FEATURE_AI_ASSISTANT === 'true';
  }
  if (process.env.NEXT_PUBLIC_FEATURE_ADVANCED_SEARCH !== undefined) {
    flags.advancedSearch = process.env.NEXT_PUBLIC_FEATURE_ADVANCED_SEARCH === 'true';
  }

  return flags;
}

// Singleton instance
let featureFlagsInstance: FeatureFlags | null = null;

// Get the current feature flags (lazy loaded)
export function getFeatureFlags(): FeatureFlags {
  if (!featureFlagsInstance) {
    featureFlagsInstance = loadFeatureFlags();
  }
  return featureFlagsInstance;
}

// Check if a specific feature is enabled
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return getFeatureFlags()[feature];
}

// Helper functions for common feature checks
export const features = {
  isBoardEnabled: () => isFeatureEnabled('board'),
  isMicroblogEnabled: () => isFeatureEnabled('microblog'),
  isProjectsEnabled: () => isFeatureEnabled('projects'),
  isAboutEnabled: () => isFeatureEnabled('about'),
  isContactEnabled: () => isFeatureEnabled('contact'),
  isAdminEnabled: () => isFeatureEnabled('admin'),
  isUserManagementEnabled: () => isFeatureEnabled('userManagement'),
  isSystemSettingsEnabled: () => isFeatureEnabled('systemSettings'),
  isAnalyticsEnabled: () => isFeatureEnabled('analytics'),
  isPWAEnabled: () => isFeatureEnabled('pwa'),
  isOfflineEnabled: () => isFeatureEnabled('offline'),
  isAIAssistantEnabled: () => isFeatureEnabled('aiAssistant'),
  isAdvancedSearchEnabled: () => isFeatureEnabled('advancedSearch'),
};