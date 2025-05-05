import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CronRepositoryMapper } from '../../../infrastructure/mappers/cron-repository.mapper';
import { ICron } from '../../../domain/entities/cron.entity';

describe('CronRepositoryMapper', () => {
  let mapper: CronRepositoryMapper;

  beforeEach(() => {
    mapper = new CronRepositoryMapper();
  });

  describe('toDomain', () => {
    it('should map persistence model to domain entity', () => {
      // Arrange
      const now = new Date();
      const persistenceModel = {
        _id: '123',
        name: 'test-cron',
        disabled: false,
        lastExecution: now,
        expression: '* * * * *',
        createdAt: now,
        updatedAt: now,
        extraField: 'should be ignored'
      };

      // Act
      const result = mapper.toDomain(persistenceModel);

      // Assert
      expect(result).toEqual({
        _id: '123',
        name: 'test-cron',
        disabled: false,
        lastExecution: now,
        expression: '* * * * *',
        createdAt: now,
        updatedAt: now
      });
      // Verify the extra field is not included
      expect(result).not.toHaveProperty('extraField');
    });

    it('should handle _id as ObjectId and convert to string', () => {
      // Arrange
      const persistenceModel = {
        _id: { toString: () => '123' },
        name: 'test-cron',
        expression: '* * * * *'
      };

      // Act
      const result = mapper.toDomain(persistenceModel);

      // Assert
      expect(result?._id).toBe('123');
    });

    it('should return null for null input', () => {
      // Act
      const result = mapper.toDomain(null);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for undefined input', () => {
      // Act
      const result = mapper.toDomain(undefined);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('toDomainList', () => {
    it('should map an array of persistence models to domain entities', () => {
      // Arrange
      const now = new Date();
      const persistenceModels = [
        {
          _id: '1',
          name: 'cron1',
          expression: '* * * * *',
          createdAt: now
        },
        {
          _id: '2',
          name: 'cron2',
          expression: '0 0 * * *',
          disabled: true
        }
      ];

      // Act
      const result = mapper.toDomainList(persistenceModels);

      // Assert
      expect(result).toEqual([
        {
          _id: '1',
          name: 'cron1',
          expression: '* * * * *',
          createdAt: now
        },
        {
          _id: '2',
          name: 'cron2',
          expression: '0 0 * * *',
          disabled: true
        }
      ]);
    });

    it('should filter out null results', () => {
      // Arrange
      const persistenceModels = [
        {
          _id: '1',
          name: 'cron1',
          expression: '* * * * *'
        },
        null, // This should be filtered out
        {
          _id: '2',
          name: 'cron2',
          expression: '0 0 * * *'
        }
      ];

      // Use vi instead of jest for mocking
      const toDomainSpy = vi.spyOn(mapper, 'toDomain');
      toDomainSpy.mockImplementation((model) => {
        if (model === null) return null;
        return {
          _id: model._id,
          name: model.name,
          expression: model.expression
        };
      });

      // Act
      const result = mapper.toDomainList(persistenceModels as any);

      // Assert
      expect(result).toHaveLength(2);
      expect(result?.[0]?._id).toBe('1');
      expect(result?.[1]?._id).toBe('2');
    });

    it('should return null for null input', () => {
      // Act
      const result = mapper.toDomainList(null as any);

      // Assert
      expect(result).toBeNull();
    });

    it('should return an empty array if all items are filtered out', () => {
      // Arrange
      // Use vi instead of jest for mocking
      const toDomainSpy = vi.spyOn(mapper, 'toDomain');
      toDomainSpy.mockReturnValue(null);

      // Act
      const result = mapper.toDomainList([{}, {}, {}]);

      // Assert
      expect(result).toEqual([]);
    });
  });
});