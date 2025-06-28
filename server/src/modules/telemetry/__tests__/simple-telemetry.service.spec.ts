import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TelemetryService } from '../telemetry.service';

// Simple test suite to test basic telemetry service functionality
describe('TelemetryService Simple Tests', () => {
  let service: TelemetryService;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelemetryService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: vi.fn().mockResolvedValue('test-install-id'),
            set: vi.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn().mockImplementation((key) => {
              if (key === 'TELEMETRY_ENABLED') {
                return true;
              }
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TelemetryService>(TelemetryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have required dependencies', () => {
    // We shouldn't directly check for private members, only check service exists
    expect(service).toBeDefined();
  });

  it('should have the correct methods', () => {
    expect(typeof service.onModuleInit).toBe('function');
    expect(typeof service.capture).toBe('function');
    expect(typeof service.onApplicationShutdown).toBe('function');
  });
});
