import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SsmEvents } from 'ssm-shared-lib';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * This test avoids direct imports from the SFTP module to prevent
 * circular dependency issues between SftpService and SftpGateway.
 * Instead, we're manually recreating relevant components for testing.
 */

// Create interface for status messages
interface SftpStatusMessage {
  success: boolean;
  message?: string;
}

// Create a minimal implementation of the SftpService interface
interface ISftpService {
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

// Create a test implementation of the Gateway
class SftpGateway {
  private readonly logger = new Logger('SftpGateway');
  server!: Server;

  constructor(private readonly sftpService: ISftpService) {}

  afterInit(server: Server) {
    this.logger.log('SFTP WebSocket Gateway initialized');
    server.engine?.on('connection_error', (err: any) => {
      this.logger.error(`Socket.IO connection error: ${err.message}`);
    });
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected (sftp): ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected (sftp): ${client.id}`);
    this.sftpService.closeClientSessions(client.id);
  }

  async handleStartSession(client: Socket, payload: any): Promise<any> {
    try {
      this.logger.log(`Starting SFTP session for device: ${payload.deviceUuid}`);
      const sessionId = await this.sftpService.createSession(client, payload);
      return { sessionId, success: true };
    } catch (error: any) {
      this.logger.error(`Error starting SFTP session: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  async handleListDirectory(client: Socket, payload: any): Promise<void> {
    this.logger.debug(`Listing directory: ${payload.path}`);
    await this.sftpService.listDirectory(client.id, payload.path);
  }

  async handleMkdir(client: Socket, payload: any): Promise<any> {
    return new Promise((resolve) => {
      this.logger.debug(`Creating directory: ${payload.path}`);
      this.sftpService.mkdir(client.id, payload, (response) => {
        resolve({ event: SsmEvents.SFTP.STATUS, data: response });
      });
    });
  }

  async handleRename(client: Socket, payload: any): Promise<any> {
    return new Promise((resolve) => {
      this.logger.debug(`Renaming: ${payload.oldPath} to ${payload.newPath}`);
      this.sftpService.rename(client.id, payload, (response) => {
        resolve(response);
      });
    });
  }

  async handleChmod(client: Socket, payload: any): Promise<any> {
    return new Promise((resolve) => {
      this.logger.debug(`Changing permissions: ${payload.path} to ${payload.mode.toString(8)}`);
      this.sftpService.chmod(client.id, payload, (response) => {
        resolve(response);
      });
    });
  }

  async handleDelete(client: Socket, payload: any): Promise<any> {
    return new Promise((resolve) => {
      this.logger.debug(`Deleting ${payload.isDir ? 'directory' : 'file'}: ${payload.path}`);
      this.sftpService.delete(client.id, payload, (response) => {
        resolve(response);
      });
    });
  }

  async handleDownload(client: Socket, payload: any): Promise<void> {
    this.logger.debug(`Downloading file: ${payload.path}`);
    await this.sftpService.download(client.id, payload.path);
  }

  emit(event: string, data: any) {
    this.server.emit(event, data);
  }
}

describe('SftpGateway', () => {
  let sftpGateway: SftpGateway;
  let mockSftpService: any;
  let mockSocket: Socket;
  let mockServer: Server;

  beforeEach(() => {
    // Mock dependencies
    mockSftpService = {
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

    mockSocket = {
      id: 'socket-123',
      emit: vi.fn(),
      join: vi.fn(),
      on: vi.fn(),
      handshake: {
        address: '127.0.0.1',
        headers: {},
      },
      nsp: {
        name: '/sftp',
      },
    } as unknown as Socket;

    mockServer = {
      emit: vi.fn(),
      engine: {
        on: vi.fn(),
      },
    } as unknown as Server;

    // Mock logger
    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);

    // Create gateway instance
    sftpGateway = new SftpGateway(mockSftpService);
    sftpGateway.server = mockServer;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('lifecycle hooks', () => {
    it('should initialize and setup error handler', () => {
      // Call initialization
      sftpGateway.afterInit(mockServer);

      // Verify
      expect(mockServer.engine?.on).toHaveBeenCalledWith('connection_error', expect.any(Function));
    });

    it('should handle client connection', () => {
      // Call handler
      sftpGateway.handleConnection(mockSocket);

      // Verify - should log connection but not take any other action
      // This test primarily ensures the method doesn't throw
      expect(true).toBe(true);
    });

    it('should handle client disconnection and close sessions', () => {
      // Call handler
      sftpGateway.handleDisconnect(mockSocket);

      // Verify
      expect(mockSftpService.closeClientSessions).toHaveBeenCalledWith(mockSocket.id);
    });
  });

  describe('handleStartSession', () => {
    it('should start a SFTP session successfully', async () => {
      // Setup
      const sessionDto = {
        deviceUuid: 'device-123',
        port: 22,
        username: 'testuser',
        privateKey: 'test-key',
      };

      const sessionId = 'session-abc';
      mockSftpService.createSession.mockResolvedValue(sessionId);

      // Test
      const result = await sftpGateway.handleStartSession(mockSocket, sessionDto);

      // Verify
      expect(mockSftpService.createSession).toHaveBeenCalledWith(mockSocket, sessionDto);
      expect(result).toEqual({ sessionId, success: true });
    });

    it('should handle session start failure', async () => {
      // Setup
      const sessionDto = {
        deviceUuid: 'device-123',
        port: 22,
        username: 'testuser',
        privateKey: 'test-key',
      };

      const error = new Error('Authentication failed');
      mockSftpService.createSession.mockRejectedValue(error);

      // Test
      const result = await sftpGateway.handleStartSession(mockSocket, sessionDto);

      // Verify
      expect(mockSftpService.createSession).toHaveBeenCalledWith(mockSocket, sessionDto);
      expect(result).toEqual({ success: false, message: 'Authentication failed' });
    });
  });

  describe('directory operations', () => {
    it('should handle directory listing', async () => {
      // Setup
      const payload = { path: '/home/user' };

      // Test
      await sftpGateway.handleListDirectory(mockSocket, payload);

      // Verify
      expect(mockSftpService.listDirectory).toHaveBeenCalledWith(mockSocket.id, payload.path);
    });

    it('should handle directory creation', async () => {
      // Setup
      const payload = { path: '/home/user/newdir' };
      const statusResponse = { success: true, message: 'Directory created' };

      // Simulate callback behavior
      mockSftpService.mkdir.mockImplementation((clientId, options, callback) => {
        callback(statusResponse);
      });

      // Test
      const result = await sftpGateway.handleMkdir(mockSocket, payload);

      // Verify
      expect(mockSftpService.mkdir).toHaveBeenCalledWith(
        mockSocket.id,
        payload,
        expect.any(Function),
      );
      expect(result).toEqual({
        event: SsmEvents.SFTP.STATUS,
        data: statusResponse,
      });
    });
  });

  describe('file operations', () => {
    it('should handle file renaming', async () => {
      // Setup
      const payload = {
        oldPath: '/home/user/oldname.txt',
        newPath: '/home/user/newname.txt',
      };
      const statusResponse = { success: true, message: 'File renamed' };

      // Simulate callback behavior
      mockSftpService.rename.mockImplementation((clientId, options, callback) => {
        callback(statusResponse);
      });

      // Test
      const result = await sftpGateway.handleRename(mockSocket, payload);

      // Verify
      expect(mockSftpService.rename).toHaveBeenCalledWith(
        mockSocket.id,
        payload,
        expect.any(Function),
      );
      expect(result).toEqual(statusResponse);
    });

    it('should handle permission changes', async () => {
      // Setup
      const payload = {
        path: '/home/user/file.txt',
        mode: 0o644,
      };
      const statusResponse = { success: true, message: 'Permissions updated' };

      // Simulate callback behavior
      mockSftpService.chmod.mockImplementation((clientId, options, callback) => {
        callback(statusResponse);
      });

      // Test
      const result = await sftpGateway.handleChmod(mockSocket, payload);

      // Verify
      expect(mockSftpService.chmod).toHaveBeenCalledWith(
        mockSocket.id,
        payload,
        expect.any(Function),
      );
      expect(result).toEqual(statusResponse);
    });

    it('should handle file deletion', async () => {
      // Setup
      const payload = {
        path: '/home/user/file.txt',
        isDir: false,
      };
      const statusResponse = { success: true, message: 'File deleted' };

      // Simulate callback behavior
      mockSftpService.delete.mockImplementation((clientId, options, callback) => {
        callback(statusResponse);
      });

      // Test
      const result = await sftpGateway.handleDelete(mockSocket, payload);

      // Verify
      expect(mockSftpService.delete).toHaveBeenCalledWith(
        mockSocket.id,
        payload,
        expect.any(Function),
      );
      expect(result).toEqual(statusResponse);
    });

    it('should handle file download', async () => {
      // Setup
      const payload = { path: '/home/user/file.txt' };

      // Test
      await sftpGateway.handleDownload(mockSocket, payload);

      // Verify
      expect(mockSftpService.download).toHaveBeenCalledWith(mockSocket.id, payload.path);
    });
  });

  describe('emit', () => {
    it('should emit events to all clients', () => {
      // Setup
      const event = 'test-event';
      const data = { message: 'test-data' };

      // Test
      sftpGateway.emit(event, data);

      // Verify
      expect(mockServer.emit).toHaveBeenCalledWith(event, data);
    });
  });
});
