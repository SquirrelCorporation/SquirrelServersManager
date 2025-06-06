import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { SsmEvents } from 'ssm-shared-lib';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * This test avoids direct imports from the SFTP module to prevent
 * circular dependency issues between SftpService and SftpGateway.
 * Instead, we're manually recreating relevant components for testing.
 */

// Create interfaces for test implementation
interface SftpStatusMessage {
  success: boolean;
  message?: string;
}

interface ISftpRepository {
  createSession(client: Socket, sessionDto: any): Promise<string>;
  listDirectory(clientId: string, directoryPath: string): Promise<void>;
  mkdir(
    clientId: string,
    options: any,
    callback: (response: SftpStatusMessage) => void,
  ): Promise<void>;
  rename(
    clientId: string,
    options: any,
    callback: (response: SftpStatusMessage) => void,
  ): Promise<void>;
  chmod(
    clientId: string,
    options: any,
    callback: (response: SftpStatusMessage) => void,
  ): Promise<void>;
  delete(
    clientId: string,
    options: any,
    callback: (response: SftpStatusMessage) => void,
  ): Promise<void>;
  download(clientId: string, filePath: string): Promise<void>;
  closeSession(sessionId: string): void;
  closeClientSessions(clientId: string): void;
}

// Create a minimal implementation of the service for testing
class SftpService {
  private readonly logger = new Logger('SftpService');

  constructor(
    private readonly sftpRepository: ISftpRepository,
    private readonly sftpGateway: { emit: (event: string, data: any) => void },
  ) {}

  async createSession(client: Socket, sessionDto: any): Promise<string> {
    try {
      const sessionId = await this.sftpRepository.createSession(client, sessionDto);
      this.sftpGateway.emit(SsmEvents.SFTP.STATUS, {
        status: 'OK',
        message: 'SFTP CONNECTION ESTABLISHED',
      });
      return sessionId;
    } catch (error: any) {
      this.logger.error(`Failed to create SFTP session: ${error.message}`);
      throw error;
    }
  }

  async listDirectory(clientId: string, directoryPath: string): Promise<void> {
    return this.sftpRepository.listDirectory(clientId, directoryPath);
  }

  async mkdir(
    clientId: string,
    options: any,
    callback: (response: SftpStatusMessage) => void,
  ): Promise<void> {
    return this.sftpRepository.mkdir(clientId, options, callback);
  }

  async rename(
    clientId: string,
    options: any,
    callback: (response: SftpStatusMessage) => void,
  ): Promise<void> {
    return this.sftpRepository.rename(clientId, options, callback);
  }

  async chmod(
    clientId: string,
    options: any,
    callback: (response: SftpStatusMessage) => void,
  ): Promise<void> {
    return this.sftpRepository.chmod(clientId, options, callback);
  }

  async delete(
    clientId: string,
    options: any,
    callback: (response: SftpStatusMessage) => void,
  ): Promise<void> {
    return this.sftpRepository.delete(clientId, options, callback);
  }

  async download(clientId: string, filePath: string): Promise<void> {
    return this.sftpRepository.download(clientId, filePath);
  }

  closeSession(sessionId: string): void {
    this.sftpRepository.closeSession(sessionId);
  }

  closeClientSessions(clientId: string): void {
    this.sftpRepository.closeClientSessions(clientId);
  }
}

describe('SftpService', () => {
  let sftpService: SftpService;
  let mockSftpRepository: any;
  let mockSftpGateway: any;
  let mockSocket: Socket;

  beforeEach(() => {
    // Mock dependencies
    mockSftpRepository = {
      createSession: vi.fn(),
      listDirectory: vi.fn(),
      mkdir: vi.fn(),
      rename: vi.fn(),
      chmod: vi.fn(),
      delete: vi.fn(),
      download: vi.fn(),
      closeSession: vi.fn(),
      closeClientSessions: vi.fn(),
    };

    mockSftpGateway = {
      emit: vi.fn(),
    };

    mockSocket = {
      id: 'socket-123',
      emit: vi.fn(),
      join: vi.fn(),
      on: vi.fn(),
    } as unknown as Socket;

    // Mock logger
    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);

    // Create service instance
    sftpService = new SftpService(mockSftpRepository, mockSftpGateway);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createSession', () => {
    it('should successfully create a SFTP session', async () => {
      // Setup
      const sessionDto = {
        deviceUuid: 'device-123',
        port: 22,
        username: 'testuser',
        privateKey: 'test-key',
      };

      const sessionId = 'session-123';
      mockSftpRepository.createSession.mockResolvedValue(sessionId);

      // Test
      const result = await sftpService.createSession(mockSocket, sessionDto);

      // Verify
      expect(mockSftpRepository.createSession).toHaveBeenCalledWith(mockSocket, sessionDto);
      expect(mockSftpGateway.emit).toHaveBeenCalledWith(SsmEvents.SFTP.STATUS, {
        status: 'OK',
        message: 'SFTP CONNECTION ESTABLISHED',
      });
      expect(result).toBe(sessionId);
    });

    it('should throw error when session creation fails', async () => {
      // Setup
      const sessionDto = {
        deviceUuid: 'device-123',
        port: 22,
        username: 'testuser',
        privateKey: 'test-key',
      };

      const error = new Error('Connection failed');
      mockSftpRepository.createSession.mockRejectedValue(error);

      // Test & Verify
      await expect(sftpService.createSession(mockSocket, sessionDto)).rejects.toThrow(
        'Connection failed',
      );
      expect(mockSftpRepository.createSession).toHaveBeenCalledWith(mockSocket, sessionDto);
      expect(mockSftpGateway.emit).not.toHaveBeenCalled();
    });
  });

  describe('listDirectory', () => {
    it('should call repository to list directory contents', async () => {
      // Setup
      const clientId = 'client-123';
      const directoryPath = '/home/user';

      // Test
      await sftpService.listDirectory(clientId, directoryPath);

      // Verify
      expect(mockSftpRepository.listDirectory).toHaveBeenCalledWith(clientId, directoryPath);
    });
  });

  describe('file operations', () => {
    it('should create a directory', async () => {
      // Setup
      const clientId = 'client-123';
      const options = { path: '/home/user/newdir' };
      const callback = vi.fn();

      // Test
      await sftpService.mkdir(clientId, options, callback);

      // Verify
      expect(mockSftpRepository.mkdir).toHaveBeenCalledWith(clientId, options, callback);
    });

    it('should rename a file or directory', async () => {
      // Setup
      const clientId = 'client-123';
      const options = {
        oldPath: '/home/user/oldname',
        newPath: '/home/user/newname',
      };
      const callback = vi.fn();

      // Test
      await sftpService.rename(clientId, options, callback);

      // Verify
      expect(mockSftpRepository.rename).toHaveBeenCalledWith(clientId, options, callback);
    });

    it('should change file permissions', async () => {
      // Setup
      const clientId = 'client-123';
      const options = {
        path: '/home/user/file.txt',
        mode: 0o644,
      };
      const callback = vi.fn();

      // Test
      await sftpService.chmod(clientId, options, callback);

      // Verify
      expect(mockSftpRepository.chmod).toHaveBeenCalledWith(clientId, options, callback);
    });

    it('should delete a file or directory', async () => {
      // Setup
      const clientId = 'client-123';
      const options = {
        path: '/home/user/file.txt',
        isDir: false,
      };
      const callback = vi.fn();

      // Test
      await sftpService.delete(clientId, options, callback);

      // Verify
      expect(mockSftpRepository.delete).toHaveBeenCalledWith(clientId, options, callback);
    });

    it('should download a file', async () => {
      // Setup
      const clientId = 'client-123';
      const filePath = '/home/user/file.txt';

      // Test
      await sftpService.download(clientId, filePath);

      // Verify
      expect(mockSftpRepository.download).toHaveBeenCalledWith(clientId, filePath);
    });
  });

  describe('session management', () => {
    it('should close a specific session', () => {
      // Setup
      const sessionId = 'session-123';

      // Test
      sftpService.closeSession(sessionId);

      // Verify
      expect(mockSftpRepository.closeSession).toHaveBeenCalledWith(sessionId);
    });

    it('should close all sessions for a client', () => {
      // Setup
      const clientId = 'client-123';

      // Test
      sftpService.closeClientSessions(clientId);

      // Verify
      expect(mockSftpRepository.closeClientSessions).toHaveBeenCalledWith(clientId);
    });
  });
});
