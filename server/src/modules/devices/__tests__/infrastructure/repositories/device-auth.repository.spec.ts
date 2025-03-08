import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SsmAnsible } from 'ssm-shared-lib';
import { DeviceAuthRepository } from '../../../infrastructure/repositories/device-auth.repository';
import { DEVICE_AUTH } from '../../../infrastructure/schemas/device-auth.schema';
import { IDevice } from '../../../domain/entities/device.entity';
import { IDeviceAuth } from '../../../domain/entities/device-auth.entity';

// This is to avoid loading the actual schema which causes errors
vi.mock('../../../infrastructure/schemas/device-auth.schema', () => ({
  DEVICE_AUTH: 'DeviceAuth'
}));

describe('DeviceAuthRepository', () => {
  let repository: DeviceAuthRepository;
  let deviceAuthModel: any;

  // Mock data
  const mockDevice: IDevice = {
    _id: '615f5f4e8f5bca001c8ae123',
    uuid: '12345678-1234-1234-1234-123456789012',
    status: 1,
    systemInformation: {},
    capabilities: {
      containers: {}
    },
    configuration: {
      containers: {}
    }
  } as IDevice;

  const mockDeviceAuth: IDeviceAuth = {
    _id: '615f5f4e8f5bca001c8ae456',
    device: mockDevice,
    authType: SsmAnsible.SSHType.SSH_PASSWORD,
    username: 'testuser',
    sshPwd: 'password123',
    host: 'localhost',
    port: '22'
  } as IDeviceAuth;

  const mockDeviceAuthDocument = {
    ...mockDeviceAuth,
    toObject: vi.fn().mockReturnValue(mockDeviceAuth)
  };

  const mockDeviceAuthPopulatedDocument = {
    ...mockDeviceAuth,
    device: {
      ...mockDevice,
      _id: mockDevice._id
    },
    toObject: vi.fn().mockReturnValue({
      ...mockDeviceAuth,
      device: mockDevice
    })
  };

  // Setup for the test module
  beforeEach(async () => {
    // Create mock functions for all mongoose model methods
    const mockModel = {
      findOneAndUpdate: vi.fn(),
      findOne: vi.fn(),
      find: vi.fn(),
      deleteOne: vi.fn(),
      updateOne: vi.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        DeviceAuthRepository,
        {
          provide: getModelToken(DEVICE_AUTH),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<DeviceAuthRepository>(DeviceAuthRepository);
    deviceAuthModel = module.get(getModelToken(DEVICE_AUTH));
  });

  // Test for each method
  describe('toDomainEntity', () => {
    it('should return null when doc is null', () => {
      const result = (repository as any).toDomainEntity(null);
      expect(result).toBeNull();
    });

    it('should use toObject if available', () => {
      const result = (repository as any).toDomainEntity(mockDeviceAuthDocument);
      expect(mockDeviceAuthDocument.toObject).toBeCalled();
      expect(result).toEqual(mockDeviceAuth);
    });

    it('should cast as unknown as IDeviceAuth if toObject not available', () => {
      const docWithoutToObject = { ...mockDeviceAuth };
      const result = (repository as any).toDomainEntity(docWithoutToObject);
      expect(result).toEqual(mockDeviceAuth);
    });
  });

  describe('toDomainEntities', () => {
    it('should transform an array of documents to domain entities', () => {
      const docs = [mockDeviceAuthDocument, mockDeviceAuthDocument];
      const result = (repository as any).toDomainEntities(docs);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockDeviceAuth);
    });

    it('should filter out null results', () => {
      const toDomainEntityMock = vi.spyOn(repository as any, 'toDomainEntity');
      toDomainEntityMock.mockReturnValueOnce(mockDeviceAuth);
      toDomainEntityMock.mockReturnValueOnce(null);

      const docs = [mockDeviceAuthDocument, mockDeviceAuthDocument];
      const result = (repository as any).toDomainEntities(docs);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockDeviceAuth);
    });
  });

  describe('updateOrCreateIfNotExist', () => {
    it('should update or create device auth and return transformed result', async () => {
      vi.spyOn(deviceAuthModel, 'findOneAndUpdate').mockResolvedValue(mockDeviceAuthDocument);

      const result = await repository.updateOrCreateIfNotExist(mockDeviceAuth);

      expect(deviceAuthModel.findOneAndUpdate).toBeCalledWith(
        { device: mockDeviceAuth.device },
        mockDeviceAuth,
        { upsert: true, new: true }
      );
      expect(result).toEqual(mockDeviceAuth);
    });

    it('should throw error if result is null', async () => {
      vi.spyOn(deviceAuthModel, 'findOneAndUpdate').mockResolvedValue(null);

      await expect(repository.updateOrCreateIfNotExist(mockDeviceAuth)).rejects.toThrow(
        'Failed to create or update device auth'
      );
    });
  });

  describe('update', () => {
    it('should update device auth and return transformed result', async () => {
      vi.spyOn(deviceAuthModel, 'findOneAndUpdate').mockResolvedValue(mockDeviceAuthDocument);

      const result = await repository.update(mockDeviceAuth);

      expect(deviceAuthModel.findOneAndUpdate).toBeCalledWith(
        { device: mockDeviceAuth.device },
        mockDeviceAuth,
        { new: true }
      );
      expect(result).toEqual(mockDeviceAuth);
    });

    it('should return undefined if result is null', async () => {
      vi.spyOn(deviceAuthModel, 'findOneAndUpdate').mockResolvedValue(null);

      const result = await repository.update(mockDeviceAuth);

      expect(result).toBeUndefined();
    });
  });

  describe('findOneByDevice', () => {
    it('should find device auth by device and return transformed result', async () => {
      const leanMock = { exec: vi.fn().mockResolvedValue(mockDeviceAuth) };
      const findOneMock = vi.spyOn(deviceAuthModel, 'findOne').mockReturnValue({ lean: () => leanMock });

      const result = await repository.findOneByDevice(mockDevice);

      expect(findOneMock).toBeCalledWith({ device: mockDevice });
      expect(result).toEqual(mockDeviceAuth);
    });

    it('should return null if no device auth found', async () => {
      const leanMock = { exec: vi.fn().mockResolvedValue(null) };
      vi.spyOn(deviceAuthModel, 'findOne').mockReturnValue({ lean: () => leanMock });

      const result = await repository.findOneByDevice(mockDevice);

      expect(result).toBeNull();
    });
  });

  describe('findOneByDeviceUuid', () => {
    it('should find device auth by uuid and return transformed result', async () => {
      const populatedResults = [mockDeviceAuthPopulatedDocument, { ...mockDeviceAuthPopulatedDocument, device: null }];
      const execMock = vi.fn().mockResolvedValue(populatedResults);
      const populateMock = vi.fn().mockReturnValue({ exec: execMock });
      vi.spyOn(deviceAuthModel, 'find').mockReturnValue({ populate: populateMock });

      const result = await repository.findOneByDeviceUuid(mockDevice.uuid);

      expect(deviceAuthModel.find).toBeCalled();
      expect(populateMock).toBeCalledWith({
        path: 'device',
        match: { uuid: { $eq: mockDevice.uuid } }
      });
      expect(result).toHaveLength(1);
      expect(result![0]).toEqual(mockDeviceAuth);
    });
  });

  describe('findManyByDevicesUuid', () => {
    it('should find device auths by uuids and return transformed results', async () => {
      const populatedResults = [mockDeviceAuthPopulatedDocument, { ...mockDeviceAuthPopulatedDocument, device: null }];
      const execMock = vi.fn().mockResolvedValue(populatedResults);
      const populateMock = vi.fn().mockReturnValue({ exec: execMock });
      vi.spyOn(deviceAuthModel, 'find').mockReturnValue({ populate: populateMock });

      const uuids = [mockDevice.uuid, 'another-uuid'];
      const result = await repository.findManyByDevicesUuid(uuids);

      expect(deviceAuthModel.find).toBeCalled();
      expect(populateMock).toBeCalledWith({
        path: 'device',
        match: { uuid: { $in: uuids } }
      });
      expect(result).toHaveLength(1);
      expect(result![0]).toEqual(mockDeviceAuth);
    });
  });

  describe('findAllPop', () => {
    it('should find all device auths with populated devices', async () => {
      const execMock = vi.fn().mockResolvedValue([mockDeviceAuthPopulatedDocument]);
      const populateMock = vi.fn().mockReturnValue({ exec: execMock });
      vi.spyOn(deviceAuthModel, 'find').mockReturnValue({ populate: populateMock });

      const result = await repository.findAllPop();

      expect(deviceAuthModel.find).toBeCalled();
      expect(populateMock).toBeCalledWith({ path: 'device' });
      expect(result).toHaveLength(1);
      expect(result![0]).toEqual(mockDeviceAuth);
    });
  });

  describe('findAllPopWithSshKey', () => {
    it('should find all device auths with ssh key and populated devices', async () => {
      const execMock = vi.fn().mockResolvedValue([mockDeviceAuthPopulatedDocument]);
      const populateMock = vi.fn().mockReturnValue({ exec: execMock });
      vi.spyOn(deviceAuthModel, 'find').mockReturnValue({ populate: populateMock });

      const result = await repository.findAllPopWithSshKey();

      expect(deviceAuthModel.find).toBeCalledWith({ sshKey: { $ne: null } });
      expect(populateMock).toBeCalledWith({ path: 'device' });
      expect(result).toHaveLength(1);
      expect(result![0]).toEqual(mockDeviceAuth);
    });
  });

  describe('deleteByDevice', () => {
    it('should delete device auth by device', async () => {
      const execMock = vi.fn();
      vi.spyOn(deviceAuthModel, 'deleteOne').mockReturnValue({ exec: execMock });

      await repository.deleteByDevice(mockDevice);

      expect(deviceAuthModel.deleteOne).toBeCalledWith({ device: mockDevice });
      expect(execMock).toBeCalled();
    });
  });

  describe('deleteCa, deleteCert, deleteKey', () => {
    it('should delete docker CA certificate', async () => {
      const execMock = vi.fn();
      vi.spyOn(deviceAuthModel, 'updateOne').mockReturnValue({ exec: execMock });

      await repository.deleteCa(mockDeviceAuth);

      expect(deviceAuthModel.updateOne).toBeCalledWith(
        { device: mockDeviceAuth.device },
        { $unset: { dockerCa: 1 } }
      );
      expect(execMock).toBeCalled();
    });

    it('should delete docker client certificate', async () => {
      const execMock = vi.fn();
      vi.spyOn(deviceAuthModel, 'updateOne').mockReturnValue({ exec: execMock });

      await repository.deleteCert(mockDeviceAuth);

      expect(deviceAuthModel.updateOne).toBeCalledWith(
        { device: mockDeviceAuth.device },
        { $unset: { dockerCert: 1 } }
      );
      expect(execMock).toBeCalled();
    });

    it('should delete docker client key', async () => {
      const execMock = vi.fn();
      vi.spyOn(deviceAuthModel, 'updateOne').mockReturnValue({ exec: execMock });

      await repository.deleteKey(mockDeviceAuth);

      expect(deviceAuthModel.updateOne).toBeCalledWith(
        { device: mockDeviceAuth.device },
        { $unset: { dockerKey: 1 } }
      );
      expect(execMock).toBeCalled();
    });
  });
});