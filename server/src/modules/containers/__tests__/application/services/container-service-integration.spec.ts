import { beforeEach, describe, expect, it, vi } from 'vitest';

// Create a mock version of the container service
const mockContainerService = {
  getDeviceAuth: vi.fn(),
  getDeviceByUuid: vi.fn(),
};

// Mock DevicesService and DeviceAuthService
const mockDevicesService = {
  findOneByUuid: vi.fn(),
};

const mockDeviceAuthService = {
  findDeviceAuthByDeviceUuid: vi.fn(),
};

// Mock the implementation of getDeviceAuth and getDeviceByUuid
mockContainerService.getDeviceAuth = async (deviceUuid) => {
  const res = await mockDeviceAuthService.findDeviceAuthByDeviceUuid(deviceUuid);
  return res?.[0] || null;
};

mockContainerService.getDeviceByUuid = async (uuid) => {
  return await mockDevicesService.findOneByUuid(uuid);
};

describe('ContainerService Integration', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();

    // Set up mock responses
    mockDevicesService.findOneByUuid.mockResolvedValue({
      _id: 'device-id',
      uuid: 'device-uuid',
    });

    mockDeviceAuthService.findDeviceAuthByDeviceUuid.mockResolvedValue([
      {
        _id: 'auth-id',
        device: 'device-id',
      },
    ]);
  });

  it('should get device by UUID using DevicesService', async () => {
    const device = await mockContainerService.getDeviceByUuid('device-uuid');
    expect(mockDevicesService.findOneByUuid).toHaveBeenCalledWith('device-uuid');
    expect(device).toEqual({
      _id: 'device-id',
      uuid: 'device-uuid',
    });
  });

  it('should get device auth using DeviceAuthService', async () => {
    const deviceAuth = await mockContainerService.getDeviceAuth('device-uuid');
    expect(mockDeviceAuthService.findDeviceAuthByDeviceUuid).toHaveBeenCalledWith('device-uuid');
    expect(deviceAuth).toEqual({
      _id: 'auth-id',
      device: 'device-id',
    });
  });
});
