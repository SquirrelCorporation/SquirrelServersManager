import { beforeEach, describe, expect, it } from 'vitest';
import { DeviceDownTimeEventRepositoryMapper } from '../../../infrastructure/mappers/device-downtime-event-repository.mapper';

describe('DeviceDownTimeEventRepositoryMapper', () => {
  let mapper: DeviceDownTimeEventRepositoryMapper;

  beforeEach(() => {
    mapper = new DeviceDownTimeEventRepositoryMapper();
  });

  describe('toDomain', () => {
    it('should map persistence model to domain entity', () => {
      const persistenceModel = {
        _id: 'event-123',
        deviceId: 'device-456',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        finishedAt: new Date('2023-01-01T01:00:00Z'),
        duration: 3600000, // 1 hour in milliseconds
        updatedAt: new Date('2023-01-01T01:00:00Z'),
      };

      const domainEntity = mapper.toDomain(persistenceModel);

      expect(domainEntity).toEqual({
        _id: 'event-123',
        deviceId: 'device-456',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        finishedAt: new Date('2023-01-01T01:00:00Z'),
        duration: 3600000,
        updatedAt: new Date('2023-01-01T01:00:00Z'),
      });
    });

    it('should handle null input', () => {
      const domainEntity = mapper.toDomain(null);
      expect(domainEntity).toBeNull();
    });

    it('should handle undefined input', () => {
      const domainEntity = mapper.toDomain(undefined);
      expect(domainEntity).toBeNull();
    });

    it('should convert string _id to string', () => {
      // Mock MongoDB ObjectId-like object with a toString method
      const objectId = {
        toString: () => 'event-123',
      };

      const persistenceModel = {
        _id: objectId,
        deviceId: 'device-456',
      };

      const domainEntity = mapper.toDomain(persistenceModel);

      expect(domainEntity?._id).toBe('event-123');
    });

    it('should handle missing optional fields', () => {
      const persistenceModel = {
        _id: 'event-123',
        deviceId: 'device-456',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        // No finishedAt, duration, or updatedAt
      };

      const domainEntity = mapper.toDomain(persistenceModel);

      expect(domainEntity).toEqual({
        _id: 'event-123',
        deviceId: 'device-456',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        finishedAt: undefined,
        duration: undefined,
        updatedAt: undefined,
      });
    });
  });

  describe('toDomainList', () => {
    it('should convert array of persistence models to domain entities', () => {
      const persistenceModels = [
        {
          _id: 'event-1',
          deviceId: 'device-1',
          createdAt: new Date('2023-01-01T00:00:00Z'),
        },
        {
          _id: 'event-2',
          deviceId: 'device-2',
          createdAt: new Date('2023-01-02T00:00:00Z'),
        },
      ];

      const domainEntities = mapper.toDomainList(persistenceModels);

      expect(domainEntities).toHaveLength(2);
      expect(domainEntities?.[0]._id).toBe('event-1');
      expect(domainEntities?.[1]._id).toBe('event-2');
    });

    it('should handle null input', () => {
      const domainEntities = mapper.toDomainList(null as any);
      expect(domainEntities).toBeNull();
    });

    it('should handle empty array', () => {
      const domainEntities = mapper.toDomainList([]);
      expect(domainEntities).toEqual([]);
    });

    it('should filter out null results', () => {
      const persistenceModels = [
        {
          _id: 'event-1',
          deviceId: 'device-1',
        },
        null,
        {
          _id: 'event-2',
          deviceId: 'device-2',
        },
      ];

      const domainEntities = mapper.toDomainList(persistenceModels as any);

      expect(domainEntities).toHaveLength(2);
      expect(domainEntities?.[0]._id).toBe('event-1');
      expect(domainEntities?.[1]._id).toBe('event-2');
    });
  });
});
