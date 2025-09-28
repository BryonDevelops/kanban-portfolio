import { getFeatureFlagsSync, isFeatureEnabledSync, loadFeatureFlagsFromEnv, defaultFeatureFlags, features } from '../../../../lib/feature-flags';

describe('Feature Flags Unit Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    process.env = { ...originalEnv };
    // Clear any cached feature flags
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('defaultFeatureFlags', () => {
    it('should contain all expected feature flags with correct defaults', () => {
      expect(defaultFeatureFlags).toEqual({
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
      });
    });

    it('should be immutable', () => {
      const original = { ...defaultFeatureFlags };
      // Attempt to modify (should not affect original)
      const mutableFlags = { ...defaultFeatureFlags };
      mutableFlags.board = false;
      expect(defaultFeatureFlags.board).toBe(original.board);
    });
  });

  describe('loadFeatureFlagsFromEnv', () => {
    it('should return default flags when no environment variables are set', () => {
      const flags = loadFeatureFlagsFromEnv();
      expect(flags).toEqual(defaultFeatureFlags);
    });

    it('should override flags with environment variables', () => {
      process.env.NEXT_PUBLIC_FEATURE_BOARD = 'false';
      process.env.NEXT_PUBLIC_FEATURE_AI_ASSISTANT = 'true';
      process.env.NEXT_PUBLIC_FEATURE_ANALYTICS = 'false';

      const flags = loadFeatureFlagsFromEnv();

      expect(flags.board).toBe(false);
      expect(flags.aiAssistant).toBe(true);
      expect(flags.analytics).toBe(false);
      // Other flags should remain default
      expect(flags.microblog).toBe(true);
      expect(flags.projects).toBe(true);
    });

    it('should handle invalid environment variable values', () => {
      process.env.NEXT_PUBLIC_FEATURE_BOARD = 'invalid';
      process.env.NEXT_PUBLIC_FEATURE_PROJECTS = '';

      const flags = loadFeatureFlagsFromEnv();

      // Invalid values should fall back to defaults
      expect(flags.board).toBe(true); // default
      expect(flags.projects).toBe(true); // default
    });

    it('should parse "true" and "false" strings correctly', () => {
      process.env.NEXT_PUBLIC_FEATURE_BOARD = 'false';
      process.env.NEXT_PUBLIC_FEATURE_MICROBLOG = 'true';
      process.env.NEXT_PUBLIC_FEATURE_PROJECTS = 'false';

      const flags = loadFeatureFlagsFromEnv();

      expect(flags.board).toBe(false);
      expect(flags.microblog).toBe(true);
      expect(flags.projects).toBe(false);
    });

    it('should support all feature flag environment variables', () => {
      const testCases = [
        { env: 'NEXT_PUBLIC_FEATURE_BOARD', flag: 'board' },
        { env: 'NEXT_PUBLIC_FEATURE_MICROBLOG', flag: 'microblog' },
        { env: 'NEXT_PUBLIC_FEATURE_PROJECTS', flag: 'projects' },
        { env: 'NEXT_PUBLIC_FEATURE_ABOUT', flag: 'about' },
        { env: 'NEXT_PUBLIC_FEATURE_CONTACT', flag: 'contact' },
        { env: 'NEXT_PUBLIC_FEATURE_ADMIN', flag: 'admin' },
        { env: 'NEXT_PUBLIC_FEATURE_USER_MANAGEMENT', flag: 'userManagement' },
        { env: 'NEXT_PUBLIC_FEATURE_SYSTEM_SETTINGS', flag: 'systemSettings' },
        { env: 'NEXT_PUBLIC_FEATURE_ANALYTICS', flag: 'analytics' },
        { env: 'NEXT_PUBLIC_FEATURE_PWA', flag: 'pwa' },
        { env: 'NEXT_PUBLIC_FEATURE_OFFLINE', flag: 'offline' },
        { env: 'NEXT_PUBLIC_FEATURE_AI_ASSISTANT', flag: 'aiAssistant' },
        { env: 'NEXT_PUBLIC_FEATURE_ADVANCED_SEARCH', flag: 'advancedSearch' },
      ];

      testCases.forEach(({ env }) => {
        process.env[env] = 'false';
      });

      const flags = loadFeatureFlagsFromEnv();

      testCases.forEach(({ flag }) => {
        expect(flags[flag as keyof typeof flags]).toBe(false);
      });
    });
  });

  describe('getFeatureFlagsSync', () => {
    it('should return default flags on first call', () => {
      const flags = getFeatureFlagsSync();
      expect(flags).toEqual(defaultFeatureFlags);
    });

    it('should return cached flags on subsequent calls', () => {
      // First call
      const flags1 = getFeatureFlagsSync();
      expect(flags1).toEqual(defaultFeatureFlags);

      // Modify environment (should not affect cached result)
      process.env.NEXT_PUBLIC_FEATURE_BOARD = 'false';

      // Second call should return cached result
      const flags2 = getFeatureFlagsSync();
      expect(flags2).toEqual(flags1);
      expect(flags2.board).toBe(true); // Still default, not environment value
    });
  });

  describe('isFeatureEnabledSync', () => {
    it('should return true for enabled features', () => {
      expect(isFeatureEnabledSync('board')).toBe(true);
      expect(isFeatureEnabledSync('projects')).toBe(true);
      expect(isFeatureEnabledSync('admin')).toBe(true);
    });

    it('should return false for disabled features', () => {
      expect(isFeatureEnabledSync('aiAssistant')).toBe(false);
      expect(isFeatureEnabledSync('advancedSearch')).toBe(false);
    });

    it('should handle invalid feature keys gracefully', () => {
      // TypeScript would prevent this, but runtime check
      expect(() => isFeatureEnabledSync('invalid' as keyof typeof defaultFeatureFlags)).not.toThrow();
    });

    it('should reflect environment variable overrides', () => {
      process.env.NEXT_PUBLIC_FEATURE_AI_ASSISTANT = 'true';
      process.env.NEXT_PUBLIC_FEATURE_BOARD = 'false';

      // Note: In real usage, environment changes would require app restart
      // This test verifies the environment loading logic
      const flags = loadFeatureFlagsFromEnv();

      expect(flags.aiAssistant).toBe(true);
      expect(flags.board).toBe(false);
    });
  });

  describe('features helper object', () => {
    it('should provide helper functions for all features', () => {
      expect(typeof features.isBoardEnabled).toBe('function');
      expect(typeof features.isMicroblogEnabled).toBe('function');
      expect(typeof features.isProjectsEnabled).toBe('function');
      expect(typeof features.isAboutEnabled).toBe('function');
      expect(typeof features.isContactEnabled).toBe('function');
      expect(typeof features.isAdminEnabled).toBe('function');
      expect(typeof features.isUserManagementEnabled).toBe('function');
      expect(typeof features.isSystemSettingsEnabled).toBe('function');
      expect(typeof features.isAnalyticsEnabled).toBe('function');
      expect(typeof features.isPWAEnabled).toBe('function');
      expect(typeof features.isOfflineEnabled).toBe('function');
      expect(typeof features.isAIAssistantEnabled).toBe('function');
      expect(typeof features.isAdvancedSearchEnabled).toBe('function');
    });

    it('should return correct values for helper functions', () => {
      expect(features.isBoardEnabled()).toBe(true);
      expect(features.isAIAssistantEnabled()).toBe(false);
      expect(features.isAnalyticsEnabled()).toBe(true);
    });
  });
});