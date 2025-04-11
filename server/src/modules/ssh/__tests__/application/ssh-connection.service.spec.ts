import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../test-setup';
import { SshConnectionService } from '@modules/ssh/application/services/ssh-connection.service';

describe('SshConnectionService', () => {
  let service: SshConnectionService;
  let mockDeviceRepository: any;
  let mockDeviceAuthRepository: any;

  beforeEach(async () => {
    mockDeviceRepository = {
      findOneByUuid: vi.fn().mockResolvedValue({
        ip: '127.0.0.1',
        hostname: 'test-host',
      }),
    };

    mockDeviceAuthRepository = {
      findOneByDevice: vi.fn().mockResolvedValue({
        username: 'test-user',
        password: 'test-password',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SshConnectionService,
        {
          provide: 'DeviceRepository',
          useValue: mockDeviceRepository,
        },
        {
          provide: 'DeviceAuthRepository',
          useValue: mockDeviceAuthRepository,
        },
      ],
    }).compile();

    service = module.get<SshConnectionService>(SshConnectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests as needed
});