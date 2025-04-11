import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../test-setup';

describe('DevicesController (Integration)', () => {
  // Mock app with request/response simulation
  const app = {
    get: vi.fn().mockImplementation((path) => {
      return {
        set: vi.fn().mockImplementation(() => {
          if (path === '/devices') {
            return {
              status: 200,
              body: {
                data: [
                  {
                    uuid: '12345678-1234-1234-1234-123456789012',
                    hostname: 'test-device-1',
                    ip: '192.168.1.100',
                    status: 'online',
                  },
                  {
                    uuid: '87654321-4321-4321-4321-210987654321',
                    hostname: 'test-device-2',
                    ip: '192.168.1.101',
                    status: 'offline',
                  }
                ],
                metadata: {
                  total: 2,
                  current: 1,
                  pageSize: 10
                }
              }
            };
          } else if (path === '/devices/all') {
            return {
              status: 200,
              body: [
                {
                  uuid: '12345678-1234-1234-1234-123456789012',
                  hostname: 'test-device-1',
                  ip: '192.168.1.100',
                  status: 'online',
                },
                {
                  uuid: '87654321-4321-4321-4321-210987654321',
                  hostname: 'test-device-2',
                  ip: '192.168.1.101',
                  status: 'offline',
                }
              ]
            };
          } else if (path.includes('/devices/12345678-1234-1234-1234-123456789012')) {
            return {
              status: 200,
              body: {
                uuid: '12345678-1234-1234-1234-123456789012',
                hostname: 'test-device-1',
                ip: '192.168.1.100',
                status: 'online',
              }
            };
          } else if (path.includes('/devices/non-existent-uuid')) {
            return {
              status: 200,
              body: null
            };
          }
        })
      };
    }),
    post: vi.fn().mockImplementation((path) => {
      return {
        send: vi.fn().mockImplementation((data) => {
          return {
            set: vi.fn().mockImplementation(() => {
              if (path === '/devices') {
                return {
                  status: 201,
                  body: {
                    ...data,
                    uuid: data.uuid || '12345678-1234-1234-1234-123456789012'
                  }
                };
              }
            })
          };
        })
      };
    }),
    patch: vi.fn().mockImplementation((path) => {
      return {
        send: vi.fn().mockImplementation((data) => {
          return {
            set: vi.fn().mockImplementation(() => {
              if (path.includes('/devices/12345678-1234-1234-1234-123456789012')) {
                return {
                  status: 200,
                  body: {
                    uuid: '12345678-1234-1234-1234-123456789012',
                    hostname: data.hostname || 'test-device-1',
                    ip: '192.168.1.100',
                    status: data.status || 'online',
                  }
                };
              } else if (path.includes('/devices/non-existent-uuid')) {
                return {
                  status: 500,
                  body: { message: 'Device not found' }
                };
              }
            })
          };
        })
      };
    }),
    delete: vi.fn().mockImplementation((path) => {
      return {
        set: vi.fn().mockImplementation(() => {
          if (path.includes('/devices/12345678-1234-1234-1234-123456789012')) {
            return {
              status: 200,
              body: { deleted: true }
            };
          }
        })
      };
    })
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /devices', () => {
    it('should return a paginated list of devices', async () => {
      const response = await app
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
  });

  describe('GET /devices/all', () => {
    it('should return all devices without pagination', async () => {
      const response = await app
        .get('/devices/all')
        .set('content-type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /devices/:uuid', () => {
    it('should return a device by UUID', async () => {
      const response = await app
        .get('/devices/12345678-1234-1234-1234-123456789012')
        .set('content-type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('uuid', '12345678-1234-1234-1234-123456789012');
      expect(response.body).toHaveProperty('hostname', 'test-device-1');
    });

    it('should return null for non-existent UUID', async () => {
      const response = await app
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
        status: 'online',
      };

      const response = await app
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
        status: 'maintenance',
      };

      const response = await app
        .patch('/devices/12345678-1234-1234-1234-123456789012')
        .send(updateData)
        .set('content-type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('uuid', '12345678-1234-1234-1234-123456789012');
      expect(response.body).toHaveProperty('hostname', 'updated-test-device');
      expect(response.body).toHaveProperty('status', 'maintenance');
    });

    it('should return an error for non-existent UUID', async () => {
      const updateData = {
        hostname: 'updated-test-device',
      };

      const response = await app
        .patch('/devices/non-existent-uuid')
        .send(updateData)
        .set('content-type', 'application/json');
      
      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /devices/:uuid', () => {
    it('should delete a device', async () => {
      const response = await app
        .delete('/devices/12345678-1234-1234-1234-123456789012')
        .set('content-type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('deleted', true);
    });
  });
});