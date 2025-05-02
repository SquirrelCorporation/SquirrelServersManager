// import { Test, TestingModule } from '@nestjs/testing'; // No longer needed
// import { getModelToken } from '@nestjs/mongoose'; // No longer needed
// import { Model } from 'mongoose'; // Unused
import { DeviceRepository } from '@modules/devices/infrastructure/repositories/device.repository';
// import { DEVICE /*, DeviceDocument */ } from '@modules/devices/infrastructure/schemas/device.schema'; // Unused
// import { DeviceRepositoryMapper } from '@modules/devices/infrastructure/mappers/device-repository.mapper'; // Not needed for manual instantiation
import { IDevice } from '@modules/devices/domain/entities/device.entity';
// import { EventEmitter2 } from '@nestjs/event-emitter'; // Unused
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DateTime } from 'luxon'; // Import DateTime
import { SsmStatus } from 'ssm-shared-lib'; // Import SsmStatus
import { DEVICE_WENT_OFFLINE_EVENT } from '@modules/statistics'; // Import event constant

// Mock the Mongoose Model methods
const mockDeviceModel = {
  create: vi.fn(),
  findOne: vi.fn(),
  findOneAndUpdate: vi.fn(),
  find: vi.fn(),
  updateOne: vi.fn(),
  deleteOne: vi.fn(),
  lean: vi.fn().mockReturnThis(),
  exec: vi.fn(),
  sort: vi.fn().mockReturnThis(),
};

// Mock the Mapper object
const mockMapper = {
  toDomain: vi.fn((doc) => doc as any),
  toDomainList: vi.fn((docs) => docs as any),
};

// Mock EventEmitter
const mockEventEmitter = {
  emit: vi.fn(),
};

// Mock PinoLogger
vi.mock('@/logger', () => ({
  default: {
    child: vi.fn(() => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    })),
  },
}));

describe('DeviceRepository', () => {
  let repository: DeviceRepository;
  // No longer using TestModule

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    Object.values(mockDeviceModel).forEach((mockFn) => {
      if (typeof mockFn === 'function') {
        mockFn.mockReset();
        if (mockFn.mockReturnThis) {
          mockFn.mockReturnThis();
        }
      }
    });
    mockMapper.toDomain.mockReset().mockImplementation((doc) => doc as any);
    mockMapper.toDomainList.mockReset().mockImplementation((docs) => docs as any);
    mockEventEmitter.emit.mockClear();

    // Manually instantiate the repository with mocks
    repository = new DeviceRepository(
      mockDeviceModel as any,
      mockMapper as any,
      mockEventEmitter as any, // Cast EventEmitter mock to any
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a device and return the mapped domain entity', async () => {
      const partialDevice: Partial<IDevice> = { hostname: 'test-host', ip: '1.2.3.4' };
      const createdDoc = {
        ...partialDevice,
        _id: 'mongoId',
        uuid: 'gen-uuid',
        toObject: vi.fn().mockReturnThis(),
      };
      const expectedDomainDevice = { ...createdDoc } as IDevice;

      mockDeviceModel.create.mockResolvedValue(createdDoc as any);
      mockMapper.toDomain.mockReturnValue(expectedDomainDevice);

      const result = await repository.create(partialDevice);

      expect(mockDeviceModel.create).toHaveBeenCalledWith(partialDevice);
      expect(createdDoc.toObject).toHaveBeenCalled();
      expect(mockMapper.toDomain).toHaveBeenCalledWith(createdDoc);
      expect(result).toEqual(expectedDomainDevice);
    });

    it('should handle errors during creation', async () => {
      const partialDevice: Partial<IDevice> = { hostname: 'test-host', ip: '1.2.3.4' };
      const error = new Error('Database error');
      mockDeviceModel.create.mockRejectedValue(error);
      await expect(repository.create(partialDevice)).rejects.toThrow(error);
    });
  });

  // --- Test update method ---
  describe('update', () => {
    it('should update a device and return the mapped domain entity', async () => {
      const deviceToUpdate: IDevice = {
        _id: 'mongoId',
        uuid: 'test-uuid',
        hostname: 'updated-host',
        status: 'ONLINE' as any, // Example status
        // Add other required fields for IDevice
        capabilities: {} as any,
        configuration: {} as any,
        systemInformation: {} as any,
      };
      const updatedDoc = {
        ...deviceToUpdate,
        updatedAt: expect.any(Date), // Expect updatedAt to be set
      };

      // Mock findOneAndUpdate chain
      mockDeviceModel.findOneAndUpdate.mockReturnThis(); // For .lean()
      mockDeviceModel.lean.mockReturnThis(); // For .exec()
      mockDeviceModel.exec.mockResolvedValue(updatedDoc);
      mockMapper.toDomain.mockReturnValue(updatedDoc as any); // Mapper returns updated doc

      const result = await repository.update(deviceToUpdate);

      expect(mockDeviceModel.findOneAndUpdate).toHaveBeenCalledWith(
        { uuid: deviceToUpdate.uuid },
        expect.objectContaining({
          // Check that payload includes updatedAt
          ...deviceToUpdate,
          updatedAt: expect.any(Date),
        }),
        { new: true },
      );
      expect(mockDeviceModel.lean).toHaveBeenCalled();
      expect(mockDeviceModel.exec).toHaveBeenCalled();
      expect(mockMapper.toDomain).toHaveBeenCalledWith(updatedDoc);
      expect(result).toEqual(updatedDoc);
    });

    it('should return null if device to update is not found', async () => {
      const deviceToUpdate: IDevice = {
        _id: 'mongoId',
        uuid: 'not-found-uuid',
        hostname: 'updated-host',
        status: 'ONLINE' as any,
        capabilities: {} as any,
        configuration: {} as any,
        systemInformation: {} as any,
      };

      // Mock findOneAndUpdate chain to return null
      mockDeviceModel.findOneAndUpdate.mockReturnThis();
      mockDeviceModel.lean.mockReturnThis();
      mockDeviceModel.exec.mockResolvedValue(null);
      mockMapper.toDomain.mockReturnValue(null);

      const result = await repository.update(deviceToUpdate);

      expect(mockDeviceModel.findOneAndUpdate).toHaveBeenCalledWith(
        { uuid: deviceToUpdate.uuid },
        expect.objectContaining({ updatedAt: expect.any(Date) }),
        { new: true },
      );
      expect(mockMapper.toDomain).toHaveBeenCalledWith(null);
      expect(result).toBeNull();
    });

    it('should handle errors during update', async () => {
      const deviceToUpdate: IDevice = {
        _id: 'mongoId',
        uuid: 'error-uuid',
        hostname: 'updated-host',
        status: 'ONLINE' as any,
        capabilities: {} as any,
        configuration: {} as any,
        systemInformation: {} as any,
      };
      const error = new Error('Update error');
      mockDeviceModel.findOneAndUpdate.mockReturnThis();
      mockDeviceModel.lean.mockReturnThis();
      mockDeviceModel.exec.mockRejectedValue(error);

      await expect(repository.update(deviceToUpdate)).rejects.toThrow(error);
    });
  });

  // --- Test findOneByUuid method ---
  describe('findOneByUuid', () => {
    const uuid = 'test-uuid';
    const deviceDoc = {
      _id: 'mongoId',
      uuid: uuid,
      hostname: 'test-host',
      // Other fields...
    };

    it('should find a device by UUID and return the mapped entity', async () => {
      // Mock findOne chain
      mockDeviceModel.findOne.mockReturnThis(); // For .lean()
      mockDeviceModel.lean.mockReturnThis(); // For .exec()
      mockDeviceModel.exec.mockResolvedValue(deviceDoc);
      mockMapper.toDomain.mockReturnValue(deviceDoc as any);

      const result = await repository.findOneByUuid(uuid);

      expect(mockDeviceModel.findOne).toHaveBeenCalledWith({ uuid: uuid });
      expect(mockDeviceModel.lean).toHaveBeenCalled();
      expect(mockDeviceModel.exec).toHaveBeenCalled();
      expect(mockMapper.toDomain).toHaveBeenCalledWith(deviceDoc);
      expect(result).toEqual(deviceDoc);
    });

    it('should return null if device is not found by UUID', async () => {
      // Mock findOne chain to return null
      mockDeviceModel.findOne.mockReturnThis();
      mockDeviceModel.lean.mockReturnThis();
      mockDeviceModel.exec.mockResolvedValue(null);
      mockMapper.toDomain.mockReturnValue(null);

      const result = await repository.findOneByUuid('not-found-uuid');

      expect(mockDeviceModel.findOne).toHaveBeenCalledWith({ uuid: 'not-found-uuid' });
      expect(mockMapper.toDomain).toHaveBeenCalledWith(null);
      expect(result).toBeNull();
    });

    it('should handle errors during findOneByUuid', async () => {
      const error = new Error('Find error');
      mockDeviceModel.findOne.mockReturnThis();
      mockDeviceModel.lean.mockReturnThis();
      mockDeviceModel.exec.mockRejectedValue(error);

      await expect(repository.findOneByUuid(uuid)).rejects.toThrow(error);
    });
  });

  // --- Test findByUuids method ---
  describe('findByUuids', () => {
    const uuids = ['uuid-1', 'uuid-2'];
    const deviceDocs = [
      { _id: 'mongo1', uuid: 'uuid-1', hostname: 'host1' },
      { _id: 'mongo2', uuid: 'uuid-2', hostname: 'host2' },
    ];

    it('should find devices by UUIDs and return the mapped list', async () => {
      // Mock find chain
      mockDeviceModel.find.mockReturnThis(); // For .lean()
      mockDeviceModel.lean.mockReturnThis(); // For .exec()
      mockDeviceModel.exec.mockResolvedValue(deviceDocs);
      mockMapper.toDomainList.mockReturnValue(deviceDocs as any);

      const result = await repository.findByUuids(uuids);

      expect(mockDeviceModel.find).toHaveBeenCalledWith({ uuid: { $in: uuids } });
      expect(mockDeviceModel.lean).toHaveBeenCalled();
      expect(mockDeviceModel.exec).toHaveBeenCalled();
      expect(mockMapper.toDomainList).toHaveBeenCalledWith(deviceDocs);
      expect(result).toEqual(deviceDocs);
    });

    it('should return an empty list if no devices are found by UUIDs', async () => {
      // Mock find chain to return empty array
      mockDeviceModel.find.mockReturnThis();
      mockDeviceModel.lean.mockReturnThis();
      mockDeviceModel.exec.mockResolvedValue([]);
      mockMapper.toDomainList.mockReturnValue([]);

      const result = await repository.findByUuids(['not-found-1', 'not-found-2']);

      expect(mockDeviceModel.find).toHaveBeenCalledWith({
        uuid: { $in: ['not-found-1', 'not-found-2'] },
      });
      expect(mockMapper.toDomainList).toHaveBeenCalledWith([]);
      expect(result).toEqual([]);
    });

    it('should handle errors during findByUuids', async () => {
      const error = new Error('Find error');
      mockDeviceModel.find.mockReturnThis();
      mockDeviceModel.lean.mockReturnThis();
      mockDeviceModel.exec.mockRejectedValue(error);

      await expect(repository.findByUuids(uuids)).rejects.toThrow(error);
    });
  });

  // --- Test findOneByIp method ---
  describe('findOneByIp', () => {
    const ip = '1.2.3.4';
    const deviceDoc = {
      _id: 'mongoId',
      uuid: 'some-uuid',
      hostname: 'test-host',
      ip: ip,
      // Other fields...
    };

    it('should find a device by IP and return the mapped entity', async () => {
      mockDeviceModel.findOne.mockReturnThis();
      mockDeviceModel.lean.mockReturnThis();
      mockDeviceModel.exec.mockResolvedValue(deviceDoc);
      mockMapper.toDomain.mockReturnValue(deviceDoc as any);

      const result = await repository.findOneByIp(ip);

      expect(mockDeviceModel.findOne).toHaveBeenCalledWith({ ip: ip });
      expect(mockDeviceModel.lean).toHaveBeenCalled();
      expect(mockDeviceModel.exec).toHaveBeenCalled();
      expect(mockMapper.toDomain).toHaveBeenCalledWith(deviceDoc);
      expect(result).toEqual(deviceDoc);
    });

    it('should return null if device is not found by IP', async () => {
      mockDeviceModel.findOne.mockReturnThis();
      mockDeviceModel.lean.mockReturnThis();
      mockDeviceModel.exec.mockResolvedValue(null);
      mockMapper.toDomain.mockReturnValue(null);

      const result = await repository.findOneByIp('1.1.1.1');

      expect(mockDeviceModel.findOne).toHaveBeenCalledWith({ ip: '1.1.1.1' });
      expect(mockMapper.toDomain).toHaveBeenCalledWith(null);
      expect(result).toBeNull();
    });

    it('should handle errors during findOneByIp', async () => {
      const error = new Error('Find error');
      mockDeviceModel.findOne.mockReturnThis();
      mockDeviceModel.lean.mockReturnThis();
      mockDeviceModel.exec.mockRejectedValue(error);

      await expect(repository.findOneByIp(ip)).rejects.toThrow(error);
    });
  });

  // --- Test findAll method ---
  describe('findAll', () => {
    const deviceDocs = [
      { _id: 'mongo1', uuid: 'uuid-1', hostname: 'host1', disabled: false },
      { _id: 'mongo2', uuid: 'uuid-2', hostname: 'host2', disabled: false },
    ];

    it('should find all non-disabled devices and return the mapped list', async () => {
      // Mock find chain with sort
      mockDeviceModel.find.mockReturnThis(); // For .sort()
      mockDeviceModel.sort.mockReturnThis(); // For .lean()
      mockDeviceModel.lean.mockReturnThis(); // For .exec()
      mockDeviceModel.exec.mockResolvedValue(deviceDocs);
      mockMapper.toDomainList.mockReturnValue(deviceDocs as any);

      const result = await repository.findAll();

      expect(mockDeviceModel.find).toHaveBeenCalledWith({ disabled: false });
      expect(mockDeviceModel.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockDeviceModel.lean).toHaveBeenCalled();
      expect(mockDeviceModel.exec).toHaveBeenCalled();
      expect(mockMapper.toDomainList).toHaveBeenCalledWith(deviceDocs);
      expect(result).toEqual(deviceDocs);
    });

    it('should return an empty list if no non-disabled devices are found', async () => {
      mockDeviceModel.find.mockReturnThis();
      mockDeviceModel.sort.mockReturnThis();
      mockDeviceModel.lean.mockReturnThis();
      mockDeviceModel.exec.mockResolvedValue([]);
      mockMapper.toDomainList.mockReturnValue([]);

      const result = await repository.findAll();

      expect(mockDeviceModel.find).toHaveBeenCalledWith({ disabled: false });
      expect(mockMapper.toDomainList).toHaveBeenCalledWith([]);
      expect(result).toEqual([]);
    });

    it('should handle errors during findAll', async () => {
      const error = new Error('Find error');
      mockDeviceModel.find.mockReturnThis();
      mockDeviceModel.sort.mockReturnThis();
      mockDeviceModel.lean.mockReturnThis();
      mockDeviceModel.exec.mockRejectedValue(error);

      await expect(repository.findAll()).rejects.toThrow(error);
    });
  });

  // --- Test deleteByUuid method ---
  describe('deleteByUuid', () => {
    const uuid = 'test-uuid-to-delete';

    it('should call deleteOne with the correct UUID', async () => {
      // Mock deleteOne chain
      mockDeviceModel.deleteOne.mockReturnThis(); // For .exec()
      mockDeviceModel.exec.mockResolvedValue({ acknowledged: true, deletedCount: 1 }); // Simulate successful delete

      await repository.deleteByUuid(uuid);

      expect(mockDeviceModel.deleteOne).toHaveBeenCalledWith({ uuid: uuid });
      expect(mockDeviceModel.exec).toHaveBeenCalled();
    });

    it('should handle errors during deleteByUuid', async () => {
      const error = new Error('Delete error');
      mockDeviceModel.deleteOne.mockReturnThis();
      mockDeviceModel.exec.mockRejectedValue(error);

      await expect(repository.deleteByUuid(uuid)).rejects.toThrow(error);
    });
  });

  // --- Test findWithFilter method ---
  describe('findWithFilter', () => {
    const filter = { hostname: 'filtered-host', status: 'ONLINE' };
    const deviceDocs = [
      { _id: 'mongo1', uuid: 'uuid-1', hostname: 'filtered-host', status: 'ONLINE' },
    ];

    it('should find devices using the provided filter and return mapped list', async () => {
      // Mock find chain
      mockDeviceModel.find.mockReturnThis();
      mockDeviceModel.lean.mockReturnThis();
      mockDeviceModel.exec.mockResolvedValue(deviceDocs);
      mockMapper.toDomainList.mockReturnValue(deviceDocs as any);

      const result = await repository.findWithFilter(filter);

      expect(mockDeviceModel.find).toHaveBeenCalledWith(filter);
      expect(mockDeviceModel.lean).toHaveBeenCalled();
      expect(mockDeviceModel.exec).toHaveBeenCalled();
      expect(mockMapper.toDomainList).toHaveBeenCalledWith(deviceDocs);
      expect(result).toEqual(deviceDocs);
    });

    it('should return an empty list if no devices match the filter', async () => {
      const emptyFilter = { status: 'OFFLINE' };
      mockDeviceModel.find.mockReturnThis();
      mockDeviceModel.lean.mockReturnThis();
      mockDeviceModel.exec.mockResolvedValue([]);
      mockMapper.toDomainList.mockReturnValue([]);

      const result = await repository.findWithFilter(emptyFilter);

      expect(mockDeviceModel.find).toHaveBeenCalledWith(emptyFilter);
      expect(mockMapper.toDomainList).toHaveBeenCalledWith([]);
      expect(result).toEqual([]);
    });

    it('should handle errors during findWithFilter', async () => {
      const error = new Error('Filter error');
      mockDeviceModel.find.mockReturnThis();
      mockDeviceModel.lean.mockReturnThis();
      mockDeviceModel.exec.mockRejectedValue(error);

      await expect(repository.findWithFilter(filter)).rejects.toThrow(error);
    });
  });

  // --- Test setDeviceOfflineAfter method ---
  describe('setDeviceOfflineAfter', () => {
    const inactivityMinutes = 30;
    const now = DateTime.now();
    const mockOfflineDevices = [
      {
        _id: 'mongo1',
        uuid: 'uuid-offline-1',
        hostname: 'host-offline-1',
        updatedAt: now.minus({ minutes: 45 }).toJSDate(),
        status: SsmStatus.DeviceStatus.ONLINE,
      },
      {
        _id: 'mongo2',
        uuid: 'uuid-offline-2',
        hostname: 'host-offline-2',
        updatedAt: now.minus({ hours: 1 }).toJSDate(),
        status: SsmStatus.DeviceStatus.ONLINE,
      },
    ];
    // const mockOnlineDevice = { _id: 'mongo3', uuid: 'uuid-online', hostname: 'host-online', updatedAt: now.minus({ minutes: 10 }).toJSDate(), status: SsmStatus.DeviceStatus.ONLINE };
    // const mockAlreadyOfflineDevice = { _id: 'mongo4', uuid: 'uuid-already-offline', hostname: 'host-already-offline', updatedAt: now.minus({ minutes: 50 }).toJSDate(), status: SsmStatus.DeviceStatus.OFFLINE };

    beforeEach(() => {
      // Clear only the exec mock to avoid interfering with other tests' defaults
      mockDeviceModel.exec.mockClear();

      // Default mock for updateOne (needed for the chain)
      mockDeviceModel.updateOne.mockReturnThis();
      // Default mock for exec specifically for the updateOne calls
      mockDeviceModel.exec.mockResolvedValue({
        acknowledged: true,
        modifiedCount: 1,
        matchedCount: 1,
      });
    });

    it('should find inactive devices, emit events, and update their status to OFFLINE', async () => {
      // Explicitly mock exec for the find call in this test
      mockDeviceModel.find.mockReturnThis();
      mockDeviceModel.lean.mockReturnThis();
      mockDeviceModel.exec.mockResolvedValueOnce([...mockOfflineDevices]); // Mock find result

      // Ensure updateOne exec calls succeed after the find
      mockDeviceModel.exec.mockResolvedValue({
        acknowledged: true,
        modifiedCount: 1,
        matchedCount: 1,
      });

      await repository.setDeviceOfflineAfter(inactivityMinutes);

      // Verify find call
      expect(mockDeviceModel.find).toHaveBeenCalledWith({
        updatedAt: { $lt: expect.any(Date) },
        $and: [
          { status: { $ne: SsmStatus.DeviceStatus.OFFLINE } },
          { status: { $ne: SsmStatus.DeviceStatus.UNMANAGED } },
          { status: { $ne: SsmStatus.DeviceStatus.REGISTERING } },
        ],
      });

      // Verify emit and updateOne calls
      expect(mockEventEmitter.emit).toHaveBeenCalledTimes(mockOfflineDevices.length);
      expect(mockDeviceModel.updateOne).toHaveBeenCalledTimes(mockOfflineDevices.length);
      for (const device of mockOfflineDevices) {
        expect(mockEventEmitter.emit).toHaveBeenCalledWith(DEVICE_WENT_OFFLINE_EVENT, device.uuid);
        expect(mockDeviceModel.updateOne).toHaveBeenCalledWith(
          { uuid: device.uuid },
          { $set: { status: SsmStatus.DeviceStatus.OFFLINE } },
        );
      }
      // Verify exec was called for find + N updates
      expect(mockDeviceModel.exec).toHaveBeenCalledTimes(1 + mockOfflineDevices.length);
    });

    it('should do nothing if no devices are found to be inactive', async () => {
      // Explicitly mock exec for the find call
      mockDeviceModel.find.mockReturnThis();
      mockDeviceModel.lean.mockReturnThis();
      mockDeviceModel.exec.mockResolvedValueOnce([]);

      await repository.setDeviceOfflineAfter(inactivityMinutes);

      expect(mockDeviceModel.find).toHaveBeenCalled();
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
      expect(mockDeviceModel.updateOne).not.toHaveBeenCalled();
      expect(mockDeviceModel.exec).toHaveBeenCalledTimes(1); // Only called for find
    });

    it('should handle errors during the find operation', async () => {
      const findError = new Error('Find offline error');
      // Explicitly mock exec for the find call
      mockDeviceModel.find.mockReturnThis();
      mockDeviceModel.lean.mockReturnThis();
      mockDeviceModel.exec.mockRejectedValueOnce(findError);

      await expect(repository.setDeviceOfflineAfter(inactivityMinutes)).rejects.toThrow(findError);
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
      expect(mockDeviceModel.updateOne).not.toHaveBeenCalled();
      expect(mockDeviceModel.exec).toHaveBeenCalledTimes(1); // Only called for find
    });

    it('should handle errors during the updateOne operation and reject', async () => {
      const updateError = new Error('Update offline error');

      // Set up exec mock for this specific test case
      mockDeviceModel.find.mockReturnThis();
      mockDeviceModel.lean.mockReturnThis();
      mockDeviceModel.exec = vi
        .fn()
        .mockResolvedValueOnce([...mockOfflineDevices]) // 1. find returns devices
        .mockRejectedValueOnce(updateError); // 2. updateOne fails for device 1 (repo doesn't catch)
      // No need to mock the 3rd call as it won't be reached

      // Expect the main call to reject because the loop error isn't caught
      await expect(repository.setDeviceOfflineAfter(inactivityMinutes)).rejects.toThrow(
        updateError,
      );

      // Emit should still be called for the first device before the error
      expect(mockEventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        DEVICE_WENT_OFFLINE_EVENT,
        mockOfflineDevices[0].uuid,
      );

      // Update should have been attempted for the first device
      expect(mockDeviceModel.updateOne).toHaveBeenCalledTimes(1);
      expect(mockDeviceModel.updateOne).toHaveBeenCalledWith(
        { uuid: mockOfflineDevices[0].uuid },
        { $set: { status: SsmStatus.DeviceStatus.OFFLINE } },
      );

      // Verify exec was called for find + 1 update attempt
      expect(mockDeviceModel.exec).toHaveBeenCalledTimes(1 + 1);
    });
  });
});
