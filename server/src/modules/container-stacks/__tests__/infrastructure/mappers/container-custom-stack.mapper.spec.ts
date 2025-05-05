import { beforeEach, describe, expect, it } from 'vitest';
import { ContainerCustomStackMapper } from '../../../infrastructure/mappers/container-custom-stack.mapper';
import { ContainerCustomStack } from '../../../domain/entities/container-custom-stack.entity';

describe('ContainerCustomStackMapper', () => {
  let mapper: ContainerCustomStackMapper;

  beforeEach(() => {
    mapper = new ContainerCustomStackMapper();
  });

  describe('toDomain', () => {
    it('should map persistence model to domain entity', () => {
      const persistenceModel = {
        _id: 'mongo-id',
        uuid: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Stack',
        description: 'A test stack',
        path: '/test/path',
        yaml: 'version: "3"\nservices:\n  test:\n    image: test',
        icon: 'test-icon',
        iconColor: '#ffffff',
        iconBackgroundColor: '#000000',
        lockJson: false,
        type: 'custom',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        toObject: () => ({
          _id: 'mongo-id',
          uuid: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Test Stack',
          description: 'A test stack',
          path: '/test/path',
          yaml: 'version: "3"\nservices:\n  test:\n    image: test',
          icon: 'test-icon',
          iconColor: '#ffffff',
          iconBackgroundColor: '#000000',
          lockJson: false,
          type: 'custom',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-02'),
        }),
      };

      const result = mapper.toDomain(persistenceModel);

      expect(result).toBeDefined();
      expect(result.uuid).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.name).toBe('Test Stack');
      expect(result.description).toBe('A test stack');
      expect(result.path).toBe('/test/path');
      expect(result.yaml).toBe('version: "3"\nservices:\n  test:\n    image: test');
      expect(result.icon).toBe('test-icon');
      expect(result.iconColor).toBe('#ffffff');
      expect(result.iconBackgroundColor).toBe('#000000');
      expect(result.lockJson).toBe(false);
      expect(result.type).toBe('custom');
      expect(result.createdAt).toEqual(new Date('2023-01-01'));
      expect(result.updatedAt).toEqual(new Date('2023-01-02'));
    });

    it('should handle null or undefined persistence model', () => {
      expect(mapper.toDomain(null)).toBeNull();
      expect(mapper.toDomain(undefined)).toBeNull();
    });
  });

  describe('toPersistence', () => {
    it('should map domain entity to persistence model', () => {
      const domainEntity: ContainerCustomStack = {
        uuid: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Stack',
        description: 'A test stack',
        path: '/test/path',
        yaml: 'version: "3"\nservices:\n  test:\n    image: test',
        icon: 'test-icon',
        iconColor: '#ffffff',
        iconBackgroundColor: '#000000',
        lockJson: false,
        type: 'custom',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      const result = mapper.toPersistence(domainEntity);

      expect(result).toBeDefined();
      expect(result.uuid).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.name).toBe('Test Stack');
      expect(result.description).toBe('A test stack');
      expect(result.path).toBe('/test/path');
      expect(result.yaml).toBe('version: "3"\nservices:\n  test:\n    image: test');
      expect(result.icon).toBe('test-icon');
      expect(result.iconColor).toBe('#ffffff');
      expect(result.iconBackgroundColor).toBe('#000000');
      expect(result.lockJson).toBe(false);
      expect(result.type).toBe('custom');
      expect(result.createdAt).toEqual(new Date('2023-01-01'));
      expect(result.updatedAt).toEqual(new Date('2023-01-02'));
    });

    it('should handle minimal domain entity', () => {
      const domainEntity: ContainerCustomStack = {
        uuid: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Stack',
      };

      const result = mapper.toPersistence(domainEntity);

      expect(result).toBeDefined();
      expect(result.uuid).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.name).toBe('Test Stack');
      expect(result.description).toBeUndefined();
      expect(result.path).toBeUndefined();
    });
  });
});