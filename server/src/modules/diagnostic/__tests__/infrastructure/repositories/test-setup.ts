import { vi } from 'vitest';

// Mock Test from @nestjs/testing
vi.mock('@nestjs/testing', () => {
  return {
    Test: {
      createTestingModule: vi.fn().mockImplementation((config) => {
        return {
          compile: async () => {
            return {
              get: vi.fn().mockImplementation((type) => {
                if (type === 'DiagnosticRepository') {
                  return {
                    getDeviceById: vi.fn().mockImplementation(async (uuid) => {
                      return { uuid };
                    }),
                    getDeviceAuthByDevice: vi.fn().mockImplementation(async (device) => {
                      return { id: 'auth-id', device };
                    }),
                    saveDiagnosticReport: vi.fn().mockResolvedValue(undefined),
                  };
                }
                return {};
              }),
            };
          },
        };
      }),
    },
  };
});

// Mock modules/devices repositories
vi.mock('@modules/devices', () => {
  return {
    DeviceRepository: class {
      findByUuid = vi.fn().mockImplementation(async (uuid) => {
        return { uuid };
      });
    },
    DeviceAuthRepository: class {
      findByDevice = vi.fn().mockImplementation(async (device) => {
        return { id: 'auth-id', device };
      });
    },
  };
});

// Mock diagnostic repository implementation
vi.mock('../../../infrastructure/repositories/diagnostic.repository', () => {
  return {
    DiagnosticRepository: vi.fn().mockImplementation(() => {
      return {
        getDeviceById: vi.fn().mockImplementation(async (uuid) => {
          return { uuid };
        }),
        getDeviceAuthByDevice: vi.fn().mockImplementation(async (device) => {
          return { id: 'auth-id', device };
        }),
        saveDiagnosticReport: vi.fn().mockResolvedValue(undefined),
      };
    }),
  };
});