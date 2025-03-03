import { Socket } from 'socket.io';
import { SsmEvents } from 'ssm-shared-lib';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SftpChmodDto,
  SftpDeleteDto,
  SftpDownloadDto,
  SftpListDirectoryDto,
  SftpMkdirDto,
  SftpRenameDto,
  SftpSessionDto,
} from '../dto/sftp-session.dto';
import { SftpService } from '../services/sftp.service';
import { SftpGateway } from '../sftp.gateway';

describe('SftpGateway', () => {
  let gateway: SftpGateway;

  const mockSocket = {
    id: 'test-client-id',
  } as Socket;

  const mockSessionDto: SftpSessionDto = {
    deviceUuid: 'test-device-uuid',
  };

  const mockListDirectoryDto: SftpListDirectoryDto = {
    path: '/home/user',
  };

  const mockMkdirDto: SftpMkdirDto = {
    path: '/home/user/newdir',
  };

  const mockRenameDto: SftpRenameDto = {
    oldPath: '/home/user/oldfile.txt',
    newPath: '/home/user/newfile.txt',
  };

  const mockChmodDto: SftpChmodDto = {
    path: '/home/user/file.txt',
    mode: 0o755,
  };

  const mockDeleteDto: SftpDeleteDto = {
    path: '/home/user/file.txt',
    isDir: false,
  };

  const mockDownloadDto: SftpDownloadDto = {
    path: '/home/user/file.txt',
  };

  const mockSftpService = {
    createSession: vi.fn(),
    listDirectory: vi.fn(),
    mkdir: vi.fn(),
    rename: vi.fn(),
    chmod: vi.fn(),
    delete: vi.fn(),
    download: vi.fn(),
    closeClientSessions: vi.fn(),
  };

  beforeEach(async () => {
    gateway = new SftpGateway(mockSftpService as unknown as SftpService);

    // Mock the logger to avoid console output during tests
    gateway['logger'] = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    } as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('afterInit', () => {
    it('should log initialization message', () => {
      const logSpy = vi.spyOn(gateway['logger'], 'log');
      gateway.afterInit({} as any);
      expect(logSpy).toHaveBeenCalledWith('SFTP WebSocket Gateway initialized');
    });
  });

  describe('handleConnection', () => {
    it('should log client connection', () => {
      const logSpy = vi.spyOn(gateway['logger'], 'log');
      gateway.handleConnection(mockSocket);
      expect(logSpy).toHaveBeenCalledWith(`Client connected: ${mockSocket.id}`);
    });
  });

  describe('handleDisconnect', () => {
    it('should log client disconnection and close sessions', () => {
      const logSpy = vi.spyOn(gateway['logger'], 'log');
      gateway.handleDisconnect(mockSocket);
      expect(logSpy).toHaveBeenCalledWith(`Client disconnected: ${mockSocket.id}`);
      expect(mockSftpService.closeClientSessions).toHaveBeenCalledWith(mockSocket.id);
    });
  });

  describe('handleStartSession', () => {
    it('should start a new SFTP session and return success', async () => {
      mockSftpService.createSession.mockResolvedValue('test-session-id');

      const result = await gateway.handleStartSession(mockSocket, mockSessionDto);

      expect(mockSftpService.createSession).toHaveBeenCalledWith(mockSocket, mockSessionDto);
      expect(result).toEqual({
        event: SsmEvents.SFTP.STATUS,
        data: { status: 'OK' },
      });
    });

    it('should handle errors when starting a session', async () => {
      const errorMessage = 'Connection failed';
      mockSftpService.createSession.mockRejectedValue(new Error(errorMessage));

      const result = await gateway.handleStartSession(mockSocket, mockSessionDto);

      expect(result).toEqual({
        event: SsmEvents.SFTP.STATUS,
        data: { status: 'ERROR', message: errorMessage },
      });
    });
  });

  describe('handleListDirectory', () => {
    it('should list directory contents', async () => {
      await gateway.handleListDirectory(mockSocket, mockListDirectoryDto);
      expect(mockSftpService.listDirectory).toHaveBeenCalledWith(
        mockSocket.id,
        mockListDirectoryDto.path,
      );
    });
  });

  describe('handleMkdir', () => {
    it('should create a directory and return success', async () => {
      mockSftpService.mkdir.mockImplementation((clientId, options, callback) => {
        callback({ status: 'OK' });
      });

      const result = await gateway.handleMkdir(mockSocket, mockMkdirDto);

      expect(mockSftpService.mkdir).toHaveBeenCalledWith(
        mockSocket.id,
        mockMkdirDto,
        expect.any(Function),
      );
      expect(result).toEqual({
        event: SsmEvents.SFTP.STATUS,
        data: { status: 'OK' },
      });
    });
  });

  describe('handleRename', () => {
    it('should rename a file and return success', async () => {
      mockSftpService.rename.mockImplementation((clientId, options, callback) => {
        callback({ status: 'OK' });
      });

      const result = await gateway.handleRename(mockSocket, mockRenameDto);

      expect(mockSftpService.rename).toHaveBeenCalledWith(
        mockSocket.id,
        mockRenameDto,
        expect.any(Function),
      );
      expect(result).toEqual({
        event: SsmEvents.SFTP.STATUS,
        data: { status: 'OK' },
      });
    });
  });

  describe('handleChmod', () => {
    it('should change file permissions and return success', async () => {
      mockSftpService.chmod.mockImplementation((clientId, options, callback) => {
        callback({ status: 'OK' });
      });

      const result = await gateway.handleChmod(mockSocket, mockChmodDto);

      expect(mockSftpService.chmod).toHaveBeenCalledWith(
        mockSocket.id,
        mockChmodDto,
        expect.any(Function),
      );
      expect(result).toEqual({
        event: SsmEvents.SFTP.STATUS,
        data: { status: 'OK' },
      });
    });
  });

  describe('handleDelete', () => {
    it('should delete a file and return success', async () => {
      mockSftpService.delete.mockImplementation((clientId, options, callback) => {
        callback({ status: 'OK' });
      });

      const result = await gateway.handleDelete(mockSocket, mockDeleteDto);

      expect(mockSftpService.delete).toHaveBeenCalledWith(
        mockSocket.id,
        mockDeleteDto,
        expect.any(Function),
      );
      expect(result).toEqual({
        event: SsmEvents.SFTP.STATUS,
        data: { status: 'OK' },
      });
    });
  });

  describe('handleDownload', () => {
    it('should download a file', async () => {
      await gateway.handleDownload(mockSocket, mockDownloadDto);
      expect(mockSftpService.download).toHaveBeenCalledWith(mockSocket.id, mockDownloadDto.path);
    });
  });
});
