import { vi } from 'vitest';

// Mock ApiError middleware
vi.mock('../../../../../middlewares/api/ApiError', () => {
  return {
    NotFoundError: class NotFoundError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
      }
    },
    InternalError: class InternalError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'InternalError';
      }
    },
  };
});

// Mock DiagnosticService
vi.mock('../../../application/services/diagnostic.service', () => {
  return {
    DiagnosticService: vi.fn().mockImplementation(() => {
      return {
        run: vi.fn().mockImplementation(async (device, deviceAuth) => {
          return {
            success: true,
            message: 'Diagnostic checks initiated',
          };
        }),
      };
    }),
  };
});

// Mock IDiagnosticRepository
vi.mock('../../../domain/repositories/diagnostic-repository.interface', () => {
  return {
    IDiagnosticRepository: class {
      getDeviceById = vi.fn();
      getDeviceAuthByDevice = vi.fn();
      saveDiagnosticReport = vi.fn();
    },
  };
});

// Mock DiagnosticMapper
vi.mock('../../../presentation/mappers/diagnostic.mapper', () => {
  return {
    DiagnosticMapper: vi.fn().mockImplementation(() => {
      return {
        toDto: vi.fn((entity) => entity),
        toEntity: vi.fn((dto) => dto),
      };
    }),
  };
});

// Mock DiagnosticController
vi.mock('../../../presentation/controllers/diagnostic.controller', () => {
  return {
    DiagnosticController: vi.fn().mockImplementation(() => {
      return {
        runDiagnostic: vi.fn().mockImplementation(async ({ uuid }) => {
          if (uuid === 'test-uuid') {
            return {
              success: true,
              message: 'Diagnostic checks initiated',
            };
          }
          throw new Error('Device not found');
        }),
      };
    }),
  };
});
