import { FeatureFlag, FeatureFlagCreate, FeatureFlagUpdate } from '../../../../domain/admin/entities/featureFlag';

describe('FeatureFlag Domain Entities', () => {
  describe('FeatureFlag interface', () => {
    it('should define required properties', () => {
      const flag: FeatureFlag = {
        id: 'test-flag',
        name: 'Test Flag',
        description: 'A test feature flag',
        enabled: true,
        category: 'core',
        created_at: new Date('2025-01-01'),
        updated_at: new Date('2025-01-01'),
        updated_by: 'user123'
      };

      expect(flag.id).toBe('test-flag');
      expect(flag.name).toBe('Test Flag');
      expect(flag.description).toBe('A test feature flag');
      expect(flag.enabled).toBe(true);
      expect(flag.category).toBe('core');
      expect(flag.created_at).toBeInstanceOf(Date);
      expect(flag.updated_at).toBeInstanceOf(Date);
      expect(flag.updated_by).toBe('user123');
    });

    it('should allow optional updated_by field', () => {
      const flag: FeatureFlag = {
        id: 'test-flag',
        name: 'Test Flag',
        description: 'A test feature flag',
        enabled: false,
        category: 'admin',
        created_at: new Date('2025-01-01'),
        updated_at: new Date('2025-01-01')
      };

      expect(flag.updated_by).toBeUndefined();
    });

    it('should support all category types', () => {
      const categories: Array<'core' | 'admin' | 'advanced' | 'experimental'> = [
        'core', 'admin', 'advanced', 'experimental'
      ];

      categories.forEach(category => {
        const flag: FeatureFlag = {
          id: `test-${category}`,
          name: `Test ${category}`,
          description: 'Test description',
          enabled: true,
          category,
          created_at: new Date(),
          updated_at: new Date()
        };

        expect(flag.category).toBe(category);
      });
    });
  });

  describe('FeatureFlagCreate interface', () => {
    it('should define required properties for creation', () => {
      const createData: FeatureFlagCreate = {
        id: 'new-flag',
        name: 'New Flag',
        description: 'A new feature flag'
      };

      expect(createData.id).toBe('new-flag');
      expect(createData.name).toBe('New Flag');
      expect(createData.description).toBe('A new feature flag');
      expect(createData.enabled).toBeUndefined();
      expect(createData.category).toBeUndefined();
    });

    it('should allow optional properties', () => {
      const createData: FeatureFlagCreate = {
        id: 'new-flag',
        name: 'New Flag',
        description: 'A new feature flag',
        enabled: false,
        category: 'experimental'
      };

      expect(createData.enabled).toBe(false);
      expect(createData.category).toBe('experimental');
    });
  });

  describe('FeatureFlagUpdate interface', () => {
    it('should allow partial updates', () => {
      const updateData: FeatureFlagUpdate = {
        name: 'Updated Name'
      };

      expect(updateData.name).toBe('Updated Name');
      expect(updateData.description).toBeUndefined();
      expect(updateData.enabled).toBeUndefined();
      expect(updateData.category).toBeUndefined();
    });

    it('should support all optional properties', () => {
      const updateData: FeatureFlagUpdate = {
        name: 'Updated Name',
        description: 'Updated description',
        enabled: true,
        category: 'advanced'
      };

      expect(updateData.name).toBe('Updated Name');
      expect(updateData.description).toBe('Updated description');
      expect(updateData.enabled).toBe(true);
      expect(updateData.category).toBe('advanced');
    });

    it('should allow empty updates', () => {
      const updateData: FeatureFlagUpdate = {};

      expect(updateData).toEqual({});
    });
  });

  describe('Type validation', () => {
    it('should enforce category type constraints', () => {
      // This test ensures TypeScript compilation would fail for invalid categories
      const validFlag: FeatureFlag = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        enabled: true,
        category: 'core', // Valid
        created_at: new Date(),
        updated_at: new Date()
      };

      expect(validFlag.category).toBe('core');

      // Note: TypeScript would prevent invalid categories at compile time
      // This runtime test ensures the types are correctly defined
    });

    it('should validate date types', () => {
      const flag: FeatureFlag = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        enabled: true,
        category: 'core',
        created_at: new Date('2025-01-01'),
        updated_at: new Date('2025-01-02')
      };

      expect(flag.created_at.getTime()).toBeLessThan(flag.updated_at.getTime());
    });
  });
});