import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../server';
import { SsmStatus } from 'ssm-shared-lib';

// Mock the devices service
vi.mock('../../../../modules/devices/application/services/devices.service', () => {
  return {
    DevicesService: vi.fn().mockImplementation(() => ({
      create: vi.fn().mockImplementation((device) => {
        return {
          ...device,
          uuid: device.uuid || '12345678-1234-1234-1234-123456789012',
        };
      }),
      findAll: vi.fn().mockResolvedValue([
        {
          uuid: '12345678-1234-1234-1234-123456789012',
          hostname: 'test-device-1',
          ip: '192.168.1.100',
          status: SsmStatus.DeviceStatus.Online,
          capabilities: {
            containers: {
              docker: { enabled: true },
              proxmox: { enabled: false },
            },
          },
          configuration: {
            containers: {
              docker: { watchContainers: true },
            },
          },
        },
        {
          uuid: '87654321-4321-4321-4321-210987654321',
          hostname: 'test-device-2',
          ip: '192.168.1.101',
          status: SsmStatus.DeviceStatus.Offline,
          capabilities: {
            containers: {
              docker: { enabled: false },
              proxmox: { enabled: true },
            },
          },
          configuration: {
            containers: {
              proxmox: { watchContainersCron: '0 * * * *' },
            },
          },
        },
      ]),
      findOneByUuid: vi.fn().mockImplementation((uuid) => {
        if (uuid === '12345678-1234-1234-1234-123456789012') {
          return {
            uuid: '12345678-1234-1234-1234-123456789012',
            hostname: 'test-device-1',
            ip: '192.168.1.100',
            status: SsmStatus.DeviceStatus.Online,
            capabilities: {
              containers: {
                docker: { enabled: true },
                proxmox: { enabled: false },
              },
            },
            configuration: {
              containers: {
                docker: { watchContainers: true },
              },
            },
          };
        }
        return null;
      }),
      update: vi.fn().mockImplementation((device) => {
        return device;
      }),
      deleteByUuid: vi.fn().mockResolvedValue({ deleted: true }),
      findWithFilter: vi.fn().mockResolvedValue([]),
    })),
  };
});

// Mock the mapper
vi.mock('../../../../modules/devices/presentation/mappers/device.mapper', () => {
  return {
    DeviceMapper: vi.fn().mockImplementation(() => ({
      toEntity: vi.fn().mockImplementation((dto) => dto),
      updateEntity: vi.fn().mockImplementation((entity, dto) => ({ ...entity, ...dto })),
    })),
  };
});

describe('DevicesController (Integration)', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env['MONGO_URI'] as string);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /devices', () => {
    it('should return a paginated list of devices', async () => {
      const response = await request(app)
        .get('/devices')
        .set('content-type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('metadata');
      expect(response.body.metadata).toHaveProperty('total');
      expect(response.body.metadata).toHaveProperty('current');
      expect(response.body.metadata).toHaveProperty('pageSize');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should apply pagination parameters', async () => {
      const response = await request(app)
        .get('/devices?current=1&pageSize=5')
        .set('content-type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body.metadata.current).toBe(1);
      expect(response.body.metadata.pageSize).toBe(5);
    });
  });

  describe('GET /devices/all', () => {
    it('should return all devices without pagination', async () => {
      const response = await request(app)
        .get('/devices/all')
        .set('content-type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /devices/:uuid', () => {
    it('should return a device by UUID', async () => {
      const response = await request(app)
        .get('/devices/12345678-1234-1234-1234-123456789012')
        .set('content-type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('uuid', '12345678-1234-1234-1234-123456789012');
      expect(response.body).toHaveProperty('hostname', 'test-device-1');
    });

    it('should return null for non-existent UUID', async () => {
      const response = await request(app)
        .get('/devices/non-existent-uuid')
        .set('content-type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });
  });

  describe('POST /devices', () => {
    it('should create a new device', async () => {
      const newDevice = {
        uuid: '98765432-5678-5678-5678-987654321098',
        hostname: 'new-test-device',
        ip: '192.168.1.102',
        status: SsmStatus.DeviceStatus.Online,
        capabilities: {
          containers: {
            docker: { enabled: true },
          },
        },
        configuration: {
          containers: {
            docker: { watchContainers: true },
          },
        },
      };

      const response = await request(app)
        .post('/devices')
        .send(newDevice)
        .set('content-type', 'application/json');
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('uuid', '98765432-5678-5678-5678-987654321098');
      expect(response.body).toHaveProperty('hostname', 'new-test-device');
    });
  });

  describe('PATCH /devices/:uuid', () => {
    it('should update an existing device', async () => {
      const updateData = {
        hostname: 'updated-test-device',
        status: SsmStatus.DeviceStatus.Maintenance,
      };

      const response = await request(app)
        .patch('/devices/12345678-1234-1234-1234-123456789012')
        .send(updateData)
        .set('content-type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('uuid', '12345678-1234-1234-1234-123456789012');
      expect(response.body).toHaveProperty('hostname', 'updated-test-device');
      expect(response.body).toHaveProperty('status', SsmStatus.DeviceStatus.Maintenance);
    });

    it('should return an error for non-existent UUID', async () => {
      const updateData = {
        hostname: 'updated-test-device',
      };

      const response = await request(app)
        .patch('/devices/non-existent-uuid')
        .send(updateData)
        .set('content-type', 'application/json');
      
      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /devices/:uuid', () => {
    it('should delete a device', async () => {
      const response = await request(app)
        .delete('/devices/12345678-1234-1234-1234-123456789012')
        .set('content-type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('deleted', true);
    });
  });
});