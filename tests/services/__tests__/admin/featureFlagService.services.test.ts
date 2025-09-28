import { FeatureFlagService, ServiceError } from '../../../../services/admin/featureFlagService';
import { IFeatureFlagRepository } from '../../../../domain/admin/repositories/featureFlagRepository.interface';
import { FeatureFlag, FeatureFlagCreate, FeatureFlagUpdate } from '../../../../domain/admin/entities/featureFlag';

describe('FeatureFlagService', () => {
  // Mock repository - created inside describe to ensure Jest is available
  const mockRepository: jest.Mocked<IFeatureFlagRepository> = {
    fetchFeatureFlags: jest.fn(),
    fetchFeatureFlagById: jest.fn(),
    addFeatureFlag: jest.fn(),
    updateFeatureFlag: jest.fn(),
    deleteFeatureFlag: jest.fn(),
    toggleFeatureFlag: jest.fn(),
  };

  let service: FeatureFlagService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FeatureFlagService(mockRepository);
  });

  describe('getFeatureFlags', () => {
    it('should return feature flags from repository', async () => {
      const mockFlags: FeatureFlag[] = [
        {
          id: 'test-flag-1',
          name: 'Test Flag 1',
          description: 'Description 1',
          enabled: true,
          category: 'core',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'test-flag-2',
          name: 'Test Flag 2',
          description: 'Description 2',
          enabled: false,
          category: 'admin',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockRepository.fetchFeatureFlags.mockResolvedValue(mockFlags);

      const result = await service.getFeatureFlags();

      expect(mockRepository.fetchFeatureFlags).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockFlags);
    });

    it('should throw ServiceError when repository fails', async () => {
      const error = new Error('Database connection failed');
      mockRepository.fetchFeatureFlags.mockRejectedValue(error);

      await expect(service.getFeatureFlags()).rejects.toThrow(ServiceError);
      await expect(service.getFeatureFlags()).rejects.toMatchObject({
        message: 'Failed to fetch feature flags',
        code: 'FETCH_ERROR',
        statusCode: 500,
      });
    });
  });

  describe('getFeatureFlagById', () => {
    it('should return feature flag when found', async () => {
      const mockFlag: FeatureFlag = {
        id: 'test-flag',
        name: 'Test Flag',
        description: 'Description',
        enabled: true,
        category: 'core',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRepository.fetchFeatureFlagById.mockResolvedValue(mockFlag);

      const result = await service.getFeatureFlagById('test-flag');

      expect(mockRepository.fetchFeatureFlagById).toHaveBeenCalledWith('test-flag');
      expect(result).toEqual(mockFlag);
    });

    it('should return null when flag not found', async () => {
      mockRepository.fetchFeatureFlagById.mockResolvedValue(null);

      const result = await service.getFeatureFlagById('non-existent');

      expect(mockRepository.fetchFeatureFlagById).toHaveBeenCalledWith('non-existent');
      expect(result).toBeNull();
    });

    it('should throw ServiceError when repository fails', async () => {
      const error = new Error('Database error');
      mockRepository.fetchFeatureFlagById.mockRejectedValue(error);

      await expect(service.getFeatureFlagById('test-flag')).rejects.toThrow(ServiceError);
      await expect(service.getFeatureFlagById('test-flag')).rejects.toMatchObject({
        message: 'Failed to fetch feature flag',
        code: 'FETCH_ERROR',
        statusCode: 500,
      });
    });
  });

  describe('createFeatureFlag', () => {
    const validCreateData: FeatureFlagCreate = {
      id: 'new-flag',
      name: 'New Flag',
      description: 'A new feature flag',
      enabled: true,
      category: 'core',
    };

    it('should create feature flag successfully', async () => {
      const mockCreatedFlag: FeatureFlag = {
        id: 'new-flag',
        name: 'New Flag',
        description: 'A new feature flag',
        enabled: true,
        category: 'core',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRepository.fetchFeatureFlagById.mockResolvedValue(null); // Not exists
      mockRepository.addFeatureFlag.mockResolvedValue(mockCreatedFlag);

      const result = await service.createFeatureFlag(validCreateData);

      expect(mockRepository.fetchFeatureFlagById).toHaveBeenCalledWith('new-flag');
      expect(mockRepository.addFeatureFlag).toHaveBeenCalledWith(validCreateData);
      expect(result).toEqual(mockCreatedFlag);
    });

    it('should throw error when flag with same ID already exists', async () => {
      const existingFlag: FeatureFlag = {
        id: 'new-flag',
        name: 'Existing Flag',
        description: 'Already exists',
        enabled: false,
        category: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRepository.fetchFeatureFlagById.mockResolvedValue(existingFlag);

      await expect(service.createFeatureFlag(validCreateData)).rejects.toThrow(ServiceError);
      await expect(service.createFeatureFlag(validCreateData)).rejects.toMatchObject({
        message: 'Feature flag with id "new-flag" already exists',
        code: 'DUPLICATE_ERROR',
        statusCode: 409,
      });
    });

    it('should validate required fields', async () => {
      const invalidData = {
        id: '',
        name: 'Test',
        description: 'Test',
      } as FeatureFlagCreate;

      await expect(service.createFeatureFlag(invalidData)).rejects.toThrow(ServiceError);
      await expect(service.createFeatureFlag(invalidData)).rejects.toMatchObject({
        message: 'Feature flag ID is required',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    });

    it('should validate name is not empty', async () => {
      const invalidData: FeatureFlagCreate = {
        id: 'test',
        name: '',
        description: 'Test',
      };

      await expect(service.createFeatureFlag(invalidData)).rejects.toThrow(ServiceError);
      await expect(service.createFeatureFlag(invalidData)).rejects.toMatchObject({
        message: 'Feature flag name is required',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    });

    it('should validate description length', async () => {
      const invalidData: FeatureFlagCreate = {
        id: 'test',
        name: 'Test',
        description: 'a'.repeat(501), // Too long
      };

      await expect(service.createFeatureFlag(invalidData)).rejects.toThrow(ServiceError);
      await expect(service.createFeatureFlag(invalidData)).rejects.toMatchObject({
        message: 'Feature flag description must be less than 500 characters',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    });

    it('should validate category values', async () => {
      const invalidData: FeatureFlagCreate = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        category: 'invalid' as 'core', // Invalid at runtime but valid type
      };

      await expect(service.createFeatureFlag(invalidData)).rejects.toThrow(ServiceError);
      await expect(service.createFeatureFlag(invalidData)).rejects.toMatchObject({
        message: 'Invalid category. Must be one of: core, admin, advanced, experimental',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    });
  });

  describe('updateFeatureFlag', () => {
    const updateData: FeatureFlagUpdate = {
      name: 'Updated Name',
      enabled: false,
    };

    it('should update feature flag successfully', async () => {
      const existingFlag: FeatureFlag = {
        id: 'test-flag',
        name: 'Old Name',
        description: 'Description',
        enabled: true,
        category: 'core',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const updatedFlag: FeatureFlag = {
        ...existingFlag,
        name: 'Updated Name',
        enabled: false,
        updated_at: new Date(),
      };

      mockRepository.fetchFeatureFlagById.mockResolvedValue(existingFlag);
      mockRepository.updateFeatureFlag.mockResolvedValue(updatedFlag);

      const result = await service.updateFeatureFlag('test-flag', updateData);

      expect(mockRepository.fetchFeatureFlagById).toHaveBeenCalledWith('test-flag');
      expect(mockRepository.updateFeatureFlag).toHaveBeenCalledWith('test-flag', updateData);
      expect(result).toEqual(updatedFlag);
    });

    it('should throw error when flag not found', async () => {
      mockRepository.fetchFeatureFlagById.mockResolvedValue(null);

      await expect(service.updateFeatureFlag('non-existent', updateData)).rejects.toThrow(ServiceError);
      await expect(service.updateFeatureFlag('non-existent', updateData)).rejects.toMatchObject({
        message: 'Feature flag with id "non-existent" not found',
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });

    it('should validate update data', async () => {
      const existingFlag: FeatureFlag = {
        id: 'test-flag',
        name: 'Test',
        description: 'Test',
        enabled: true,
        category: 'core',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const invalidUpdate: FeatureFlagUpdate = {
        name: '',
      };

      mockRepository.fetchFeatureFlagById.mockResolvedValue(existingFlag);

      await expect(service.updateFeatureFlag('test-flag', invalidUpdate)).rejects.toThrow(ServiceError);
      await expect(service.updateFeatureFlag('test-flag', invalidUpdate)).rejects.toMatchObject({
        message: 'Feature flag name cannot be empty',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    });
  });

  describe('deleteFeatureFlag', () => {
    it('should delete feature flag successfully', async () => {
      const existingFlag: FeatureFlag = {
        id: 'test-flag',
        name: 'Test Flag',
        description: 'Description',
        enabled: true,
        category: 'core',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRepository.fetchFeatureFlagById.mockResolvedValue(existingFlag);
      mockRepository.deleteFeatureFlag.mockResolvedValue(undefined);

      await expect(service.deleteFeatureFlag('test-flag')).resolves.toBeUndefined();

      expect(mockRepository.fetchFeatureFlagById).toHaveBeenCalledWith('test-flag');
      expect(mockRepository.deleteFeatureFlag).toHaveBeenCalledWith('test-flag');
    });

    it('should throw error when flag not found', async () => {
      mockRepository.fetchFeatureFlagById.mockResolvedValue(null);

      await expect(service.deleteFeatureFlag('non-existent')).rejects.toThrow(ServiceError);
      await expect(service.deleteFeatureFlag('non-existent')).rejects.toMatchObject({
        message: 'Feature flag with id "non-existent" not found',
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('toggleFeatureFlag', () => {
    it('should toggle feature flag successfully', async () => {
      const existingFlag: FeatureFlag = {
        id: 'test-flag',
        name: 'Test Flag',
        description: 'Description',
        enabled: true,
        category: 'core',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const toggledFlag: FeatureFlag = {
        ...existingFlag,
        enabled: false,
        updated_at: new Date(),
      };

      mockRepository.fetchFeatureFlagById.mockResolvedValue(existingFlag);
      mockRepository.toggleFeatureFlag.mockResolvedValue(toggledFlag);

      const result = await service.toggleFeatureFlag('test-flag', false, 'user123');

      expect(mockRepository.fetchFeatureFlagById).toHaveBeenCalledWith('test-flag');
      expect(mockRepository.toggleFeatureFlag).toHaveBeenCalledWith('test-flag', false, 'user123');
      expect(result).toEqual(toggledFlag);
    });

    it('should throw error when flag not found', async () => {
      mockRepository.fetchFeatureFlagById.mockResolvedValue(null);

      await expect(service.toggleFeatureFlag('non-existent', true)).rejects.toThrow(ServiceError);
      await expect(service.toggleFeatureFlag('non-existent', true)).rejects.toMatchObject({
        message: 'Feature flag with id "non-existent" not found',
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('getFeatureFlagsByCategory', () => {
    it('should filter flags by category', async () => {
      const mockFlags: FeatureFlag[] = [
        {
          id: 'core-flag',
          name: 'Core Flag',
          description: 'Core feature',
          enabled: true,
          category: 'core',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'admin-flag',
          name: 'Admin Flag',
          description: 'Admin feature',
          enabled: false,
          category: 'admin',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 'another-core-flag',
          name: 'Another Core Flag',
          description: 'Another core feature',
          enabled: true,
          category: 'core',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockRepository.fetchFeatureFlags.mockResolvedValue(mockFlags);

      const result = await service.getFeatureFlagsByCategory('core');

      expect(mockRepository.fetchFeatureFlags).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result.every(flag => flag.category === 'core')).toBe(true);
      expect(result.map(flag => flag.id)).toEqual(['core-flag', 'another-core-flag']);
    });

    it('should return empty array when no flags match category', async () => {
      const mockFlags: FeatureFlag[] = [
        {
          id: 'admin-flag',
          name: 'Admin Flag',
          description: 'Admin feature',
          enabled: false,
          category: 'admin',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockRepository.fetchFeatureFlags.mockResolvedValue(mockFlags);

      const result = await service.getFeatureFlagsByCategory('experimental');

      expect(result).toHaveLength(0);
    });
  });
});