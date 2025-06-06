import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeviceDownTimeEventRepository } from '../../../infrastructure/repositories/device-downtime-event.repository';
import { DeviceDownTimeEventRepositoryMapper } from '../../../infrastructure/mappers/device-downtime-event-repository.mapper';

// Mock logger
vi.mock('../../../../../logger', () => ({
  default: {
    child: () => ({
      info: vi.fn(),
      debug: vi.fn(),
      error: vi.fn(),
    }),
  },
}));

describe('DeviceDownTimeEventRepository', () => {
  let repository: DeviceDownTimeEventRepository;
  let mockModel: any;
  let mockMapper: DeviceDownTimeEventRepositoryMapper;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Mongoose model
    const mockExec = vi.fn();
    mockModel = {
      create: vi.fn(),
      findOne: vi.fn().mockReturnValue({
        lean: vi.fn().mockReturnThis(),
        exec: mockExec,
      }),
      updateOne: vi.fn().mockReturnValue({
        exec: vi.fn(),
      }),
      aggregate: vi.fn().mockReturnValue({
        exec: vi.fn(),
      }),
    };

    // Create actual mapper instance
    mockMapper = new DeviceDownTimeEventRepositoryMapper();

    // Create repository instance with mocked dependencies
    repository = new DeviceDownTimeEventRepository(mockModel, mockMapper);
  });

  describe('create', () => {
    it('should create a downtime event for a device', async () => {
      const deviceId = 'device-123';
      const mockCreatedEvent = {
        toObject: () => ({
          _id: 'event-123',
          deviceId,
          createdAt: new Date('2023-01-01T00:00:00Z'),
        }),
      };

      mockModel.create.mockResolvedValue(mockCreatedEvent);

      const result = await repository.create(deviceId);

      expect(mockModel.create).toHaveBeenCalledWith({ deviceId });
      expect(result).toEqual({
        _id: 'event-123',
        deviceId,
        createdAt: new Date('2023-01-01T00:00:00Z'),
      });
    });

    it('should handle errors when creating', async () => {
      const deviceId = 'device-123';
      const error = new Error('Database error');

      mockModel.create.mockRejectedValue(error);

      await expect(repository.create(deviceId)).rejects.toThrow(error);
    });
  });

  describe('closeDownTimeEvent', () => {
    it('should close an open downtime event', async () => {
      const deviceId = 'device-123';
      const mockDate = new Date('2023-01-01T01:00:00Z');
      const createdAt = new Date('2023-01-01T00:00:00Z');
      const duration = mockDate.getTime() - createdAt.getTime(); // 1 hour in milliseconds

      // Mock current date
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      // Mock finding an open event
      const mockEvent = {
        _id: 'event-123',
        deviceId,
        createdAt,
      };

      mockModel.findOne().lean().exec.mockResolvedValue(mockEvent);

      await repository.closeDownTimeEvent(deviceId);

      // Verify findOne was called with correct criteria
      expect(mockModel.findOne).toHaveBeenCalledWith({
        deviceId,
        finishedAt: { $exists: false },
      });

      // Verify updateOne was called with correct parameters
      expect(mockModel.updateOne).toHaveBeenCalledWith(
        { _id: mockEvent._id },
        {
          finishedAt: mockDate,
          duration,
        },
      );

      // Restore Date mock
      vi.restoreAllMocks();
    });

    it('should do nothing if no open event is found', async () => {
      const deviceId = 'device-123';

      mockModel.findOne().lean().exec.mockResolvedValue(null);

      await repository.closeDownTimeEvent(deviceId);

      // Verify updateOne was not called
      expect(mockModel.updateOne).not.toHaveBeenCalled();
    });
  });

  describe('sumTotalDownTimePerDeviceOnPeriod', () => {
    it('should aggregate sum of downtime per device', async () => {
      const from = new Date('2023-01-01T00:00:00Z');
      const to = new Date('2023-01-31T23:59:59Z');

      const mockAggregationResult = [
        { deviceId: 'device-1', duration: 3600000 }, // 1 hour
        { deviceId: 'device-2', duration: 7200000 }, // 2 hours
      ];

      mockModel.aggregate().exec.mockResolvedValue(mockAggregationResult);

      const result = await repository.sumTotalDownTimePerDeviceOnPeriod(from, to);

      // Verify aggregate was called with correct pipeline
      expect(mockModel.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            $match: {
              finishedAt: { $exists: true, $lte: to },
              createdAt: { $gte: from },
            },
          },
          expect.any(Object), // $group
          expect.any(Object), // $project
        ])
      );

      // Verify result matches expected output
      expect(result).toEqual(mockAggregationResult);
    });

    it('should return empty array if no downtime events found', async () => {
      const from = new Date('2023-01-01T00:00:00Z');
      const to = new Date('2023-01-31T23:59:59Z');

      mockModel.aggregate().exec.mockResolvedValue([]);

      const result = await repository.sumTotalDownTimePerDeviceOnPeriod(from, to);

      expect(result).toEqual([]);
    });
  });
});
