import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Socket } from 'socket.io';
import { SftpService } from '../../application/services/sftp.service';
import { ISftpRepository } from '../../domain/repositories/sftp-repository.interface';

// Mock SftpGateway
vi.mock('../../presentation/gateways/sftp.gateway', () => ({
  SftpGateway: vi.fn().mockImplementation(() => ({
    emit: vi.fn(),
  })),
}));

// Mock ssm-shared-lib
vi.mock('ssm-shared-lib', () => ({
  SsmEvents: {
    SFTP: {
      STATUS: 'sftp:status',
    },
  },
  API: {
    SFTPContent: class {},
  },
}));

describe('SftpService', () => {
  let service: SftpService;
  let repository: ISftpRepository;
  let gateway: any;

  const mockSessionDto = {
    deviceUuid: 'test-device-uuid',
  };

  const mockClient = {
    id: 'test-client-id',
  } as Socket;

  const mockStatusCallback = vi.fn();

  beforeEach(async () => {
    const mockRepository = {
      createSession: vi.fn().mockResolvedValue('test-session-id'),
      listDirectory: vi.fn().mockResolvedValue(undefined),
      mkdir: vi.fn().mockImplementation((clientId, options, callback) => {
        callback({ status: 'OK' });
        return Promise.resolve();
      }),
      rename: vi.fn().mockImplementation((clientId, options, callback) => {
        callback({ status: 'OK' });
        return Promise.resolve();
      }),
      chmod: vi.fn().mockImplementation((clientId, options, callback) => {
        callback({ status: 'OK' });
        return Promise.resolve();
      }),
      delete: vi.fn().mockImplementation((clientId, options, callback) => {
        callback({ status: 'OK' });
        return Promise.resolve();
      }),
      download: vi.fn().mockResolvedValue(undefined),
      closeSession: vi.fn(),
      closeClientSessions: vi.fn(),
    };

    const mockGateway = {
      emit: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SftpService,
        {
          provide: 'ISftpRepository',
          useValue: mockRepository,
        },
        {
          provide: 'SftpGateway',
          useValue: mockGateway,
        },
      ],
    }).compile();

    service = module.get<SftpService>(SftpService);
    repository = module.get<ISftpRepository>('ISftpRepository');
    gateway = module.get('SftpGateway');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSession', () => {
    it('should create a new SFTP session and return the session ID', async () => {
      const result = await service.createSession(mockClient, mockSessionDto);
      expect(repository.createSession).toHaveBeenCalledWith(mockClient, mockSessionDto);
      expect(result).toBe('test-session-id');
    });

    it('should throw an error if session creation fails', async () => {
      const error = new Error('Connection failed');
      vi.spyOn(repository, 'createSession').mockRejectedValueOnce(error);

      await expect(service.createSession(mockClient, mockSessionDto)).rejects.toThrow(error);
    });
  });

  describe('listDirectory', () => {
    it('should call repository listDirectory with correct parameters', async () => {
      await service.listDirectory('test-client-id', '/home/user');
      expect(repository.listDirectory).toHaveBeenCalledWith('test-client-id', '/home/user');
    });
  });

  describe('mkdir', () => {
    it('should call repository mkdir with correct parameters', async () => {
      const options = { path: '/home/user/newdir' };
      await service.mkdir('test-client-id', options, mockStatusCallback);

      expect(repository.mkdir).toHaveBeenCalledWith(
        'test-client-id',
        options,
        expect.any(Function),
      );
      expect(mockStatusCallback).toHaveBeenCalledWith({ status: 'OK' });
    });
  });

  describe('rename', () => {
    it('should call repository rename with correct parameters', async () => {
      const options = {
        oldPath: '/home/user/oldfile.txt',
        newPath: '/home/user/newfile.txt',
      };

      await service.rename('test-client-id', options, mockStatusCallback);

      expect(repository.rename).toHaveBeenCalledWith(
        'test-client-id',
        options,
        expect.any(Function),
      );
      expect(mockStatusCallback).toHaveBeenCalledWith({ status: 'OK' });
    });
  });

  describe('chmod', () => {
    it('should call repository chmod with correct parameters', async () => {
      const options = {
        path: '/home/user/file.txt',
        mode: 0o755,
      };

      await service.chmod('test-client-id', options, mockStatusCallback);

      expect(repository.chmod).toHaveBeenCalledWith(
        'test-client-id',
        options,
        expect.any(Function),
      );
      expect(mockStatusCallback).toHaveBeenCalledWith({ status: 'OK' });
    });
  });

  describe('delete', () => {
    it('should call repository delete with correct parameters', async () => {
      const options = {
        path: '/home/user/file.txt',
        isDir: false,
      };

      await service.delete('test-client-id', options, mockStatusCallback);

      expect(repository.delete).toHaveBeenCalledWith(
        'test-client-id',
        options,
        expect.any(Function),
      );
      expect(mockStatusCallback).toHaveBeenCalledWith({ status: 'OK' });
    });
  });

  describe('download', () => {
    it('should call repository download with correct parameters', async () => {
      await service.download('test-client-id', '/home/user/file.txt');
      expect(repository.download).toHaveBeenCalledWith('test-client-id', '/home/user/file.txt');
    });
  });

  describe('closeSession', () => {
    it('should call repository closeSession with correct parameters', () => {
      service.closeSession('test-session-id');
      expect(repository.closeSession).toHaveBeenCalledWith('test-session-id');
    });
  });

  describe('closeClientSessions', () => {
    it('should call repository closeClientSessions with correct parameters', () => {
      service.closeClientSessions('test-client-id');
      expect(repository.closeClientSessions).toHaveBeenCalledWith('test-client-id');
    });
  });
});
