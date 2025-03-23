import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Socket } from 'socket.io';
import { Client, SFTPWrapper } from 'ssh2';
import { SsmEvents } from 'ssm-shared-lib';
import { SftpRepository } from '../../infrastructure/repositories/sftp.repository';
import { SshConnectionService } from '../../../../infrastructure/ssh/services/ssh-connection.service';
import { FileStreamService } from '../../infrastructure/services/file-stream.service';
import { SftpGateway } from '../../presentation/gateways/sftp.gateway';
import { FileSystemService } from '../../../shell/application/services/file-system.service';
import { SftpSessionDto } from '../../presentation/dtos/sftp-session.dto';
import {
  SftpChmodOptions,
  SftpDeleteOptions,
  SftpMkdirOptions,
  SftpRenameOptions,
  SftpStatusMessage,
} from '../../domain/entities/sftp.entity';

// Mock external dependencies
vi.mock('../../../../infrastructure/ssh/services/ssh-connection.service');
vi.mock('../../../shell/application/services/file-system.service');

describe('SftpRepository', () => {
  let repository: SftpRepository;
  let sshConnectionService: SshConnectionService;
  let fileStreamService: FileStreamService;
  let sftpGateway: SftpGateway;
  let fileSystemService: FileSystemService;

  const mockClient = {
    id: 'test-client-id',
  } as Socket;

  const mockSessionDto: SftpSessionDto = {
    deviceUuid: 'test-device-uuid',
  };

  const mockSsh = {
    sftp: vi.fn(),
    on: vi.fn(),
  } as unknown as Client;

  const mockSftp = {
    readdir: vi.fn(),
    mkdir: vi.fn(),
    rename: vi.fn(),
    chmod: vi.fn(),
    rmdir: vi.fn(),
    unlink: vi.fn(),
    stat: vi.fn(),
    fastGet: vi.fn(),
    end: vi.fn(),
  } as unknown as SFTPWrapper;

  const mockStatusCallback = vi.fn();

  beforeEach(async () => {
    // Reset mocks
    vi.resetAllMocks();

    // Setup SshConnectionService mock
    (SshConnectionService as any).mockImplementation(() => ({
      createConnection: vi.fn().mockResolvedValue({
        ssh: mockSsh,
        host: 'test-host',
      }),
      closeConnection: vi.fn(),
    }));

    // Setup FileSystemService mock
    (FileSystemService as any).mockImplementation(() => ({
      getTempDir: vi.fn().mockReturnValue('/tmp'),
      createDirectory: vi.fn(),
    }));

    // Setup module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SftpRepository,
        SshConnectionService,
        {
          provide: FileStreamService,
          useValue: {
            sendFile: vi.fn(),
          },
        },
        {
          provide: SftpGateway,
          useValue: {
            emit: vi.fn(),
          },
        },
        FileSystemService,
      ],
    }).compile();

    repository = module.get<SftpRepository>(SftpRepository);
    sshConnectionService = module.get<SshConnectionService>(SshConnectionService);
    fileStreamService = module.get<FileStreamService>(FileStreamService);
    sftpGateway = module.get<SftpGateway>(SftpGateway);
    fileSystemService = module.get<FileSystemService>(FileSystemService);

    // Setup SSH sftp method to return our mock SFTP
    mockSsh.sftp.mockImplementation((callback) => {
      callback(null, mockSftp);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createSession', () => {
    it('should create a session and return session ID', async () => {
      const sessionId = await repository.createSession(mockClient, mockSessionDto);

      expect(sshConnectionService.createConnection).toHaveBeenCalledWith(
        expect.any(Object),
        mockSessionDto.deviceUuid,
      );
      expect(sessionId).toBeTruthy();
      expect(mockSsh.on).toHaveBeenCalledTimes(3); // for 'end', 'close', 'error' events
    });

    it('should throw an error if connection fails', async () => {
      const error = new Error('Connection failed');
      (sshConnectionService.createConnection as any).mockRejectedValueOnce(error);

      await expect(repository.createSession(mockClient, mockSessionDto)).rejects.toThrow(error);
    });
  });

  describe('listDirectory', () => {
    it('should list directory contents and emit results', async () => {
      // Setup mock session
      await setupMockSession();

      // Setup mock directory contents
      const mockFiles = [
        {
          filename: 'file1.txt',
          longname: '-rw-r--r-- 1 user user 1234 Jan 1 2023 file1.txt',
          attrs: {
            mode: 33188,
            uid: 1000,
            gid: 1000,
            size: 1234,
            isFile: () => true,
            isDirectory: () => false,
            isBlockDevice: () => false,
            isCharacterDevice: () => false,
            isSymbolicLink: () => false,
            isFIFO: () => false,
            isSocket: () => false,
          },
        },
      ];

      mockSftp.readdir.mockImplementation((path, callback) => {
        callback(null, mockFiles);
      });

      // Call the method
      await repository.listDirectory('test-client-id', '/home/user');

      // Verify the results
      expect(mockSftp.readdir).toHaveBeenCalledWith('/home/user', expect.any(Function));
      expect(sftpGateway.emit).toHaveBeenCalledWith(
        SsmEvents.SFTP.READ_DIR,
        expect.objectContaining({
          status: 'OK',
          path: '/home/user',
          list: expect.any(Array),
        }),
      );
    });

    it('should handle errors when listing directory', async () => {
      // Setup mock session
      await setupMockSession();

      // Setup error
      const error = new Error('Permission denied');
      mockSftp.readdir.mockImplementation((path, callback) => {
        callback(error, null);
      });

      // Call the method
      await repository.listDirectory('test-client-id', '/home/user');

      // Verify error handling
      expect(sftpGateway.emit).toHaveBeenCalledWith(
        SsmEvents.SFTP.READ_DIR,
        expect.objectContaining({
          status: 'ERROR',
          message: error.message,
        }),
      );
    });
  });

  describe('mkdir', () => {
    it('should create a directory and call callback with success', async () => {
      // Setup mock session
      await setupMockSession();

      // Setup mkdir to succeed
      mockSftp.mkdir.mockImplementation((path, callback) => {
        callback(null);
      });

      const options: SftpMkdirOptions = { path: '/home/user/newdir' };

      // Call the method
      await repository.mkdir('test-client-id', options, mockStatusCallback);

      // Verify the results
      expect(mockSftp.mkdir).toHaveBeenCalledWith(options.path, expect.any(Function));
      expect(mockStatusCallback).toHaveBeenCalledWith({ status: 'OK' });
    });

    it('should handle errors when creating directory', async () => {
      // Setup mock session
      await setupMockSession();

      // Setup mkdir to fail
      const error = new Error('Permission denied');
      mockSftp.mkdir.mockImplementation((path, callback) => {
        callback(error);
      });

      const options: SftpMkdirOptions = { path: '/home/user/newdir' };

      // Call the method
      await repository.mkdir('test-client-id', options, mockStatusCallback);

      // Verify error handling
      expect(mockStatusCallback).toHaveBeenCalledWith({
        status: 'ERROR',
        message: error.message,
      });
    });
  });

  describe('rename', () => {
    it('should rename a file and call callback with success', async () => {
      // Setup mock session
      await setupMockSession();

      // Setup rename to succeed
      mockSftp.rename.mockImplementation((oldPath, newPath, callback) => {
        callback(null);
      });

      const options: SftpRenameOptions = {
        oldPath: '/home/user/oldfile.txt',
        newPath: '/home/user/newfile.txt',
      };

      // Call the method
      await repository.rename('test-client-id', options, mockStatusCallback);

      // Verify the results
      expect(mockSftp.rename).toHaveBeenCalledWith(
        options.oldPath,
        options.newPath,
        expect.any(Function),
      );
      expect(mockStatusCallback).toHaveBeenCalledWith({ status: 'OK' });
    });

    it('should handle errors when renaming', async () => {
      // Setup mock session
      await setupMockSession();

      // Setup rename to fail
      const error = new Error('Permission denied');
      mockSftp.rename.mockImplementation((oldPath, newPath, callback) => {
        callback(error);
      });

      const options: SftpRenameOptions = {
        oldPath: '/home/user/oldfile.txt',
        newPath: '/home/user/newfile.txt',
      };

      // Call the method
      await repository.rename('test-client-id', options, mockStatusCallback);

      // Verify error handling
      expect(mockStatusCallback).toHaveBeenCalledWith({
        status: 'ERROR',
        message: error.message,
      });
    });
  });

  describe('chmod', () => {
    it('should change file permissions and call callback with success', async () => {
      // Setup mock session
      await setupMockSession();

      // Setup chmod to succeed
      mockSftp.chmod.mockImplementation((path, mode, callback) => {
        callback(null);
      });

      const options: SftpChmodOptions = { path: '/home/user/file.txt', mode: 0o755 };

      // Call the method
      await repository.chmod('test-client-id', options, mockStatusCallback);

      // Verify the results
      expect(mockSftp.chmod).toHaveBeenCalledWith(options.path, options.mode, expect.any(Function));
      expect(mockStatusCallback).toHaveBeenCalledWith({ status: 'OK' });
    });

    it('should handle errors when changing permissions', async () => {
      // Setup mock session
      await setupMockSession();

      // Setup chmod to fail
      const error = new Error('Permission denied');
      mockSftp.chmod.mockImplementation((path, mode, callback) => {
        callback(error);
      });

      const options: SftpChmodOptions = { path: '/home/user/file.txt', mode: 0o755 };

      // Call the method
      await repository.chmod('test-client-id', options, mockStatusCallback);

      // Verify error handling
      expect(mockStatusCallback).toHaveBeenCalledWith({
        status: 'ERROR',
        message: error.message,
      });
    });
  });

  describe('delete', () => {
    it('should delete a file and call callback with success', async () => {
      // Setup mock session
      await setupMockSession();

      // Setup unlink to succeed
      mockSftp.unlink.mockImplementation((path, callback) => {
        callback(null);
      });

      const options: SftpDeleteOptions = { path: '/home/user/file.txt', isDir: false };

      // Call the method
      await repository.delete('test-client-id', options, mockStatusCallback);

      // Verify the results
      expect(mockSftp.unlink).toHaveBeenCalledWith(options.path, expect.any(Function));
      expect(mockStatusCallback).toHaveBeenCalledWith({ status: 'OK' });
    });

    it('should delete a directory and call callback with success', async () => {
      // Setup mock session
      await setupMockSession();

      // Setup rmdir to succeed
      mockSftp.rmdir.mockImplementation((path, callback) => {
        callback(null);
      });

      const options: SftpDeleteOptions = { path: '/home/user/dir', isDir: true };

      // Call the method
      await repository.delete('test-client-id', options, mockStatusCallback);

      // Verify the results
      expect(mockSftp.rmdir).toHaveBeenCalledWith(options.path, expect.any(Function));
      expect(mockStatusCallback).toHaveBeenCalledWith({ status: 'OK' });
    });

    it('should handle errors when deleting', async () => {
      // Setup mock session
      await setupMockSession();

      // Setup unlink to fail
      const error = new Error('Permission denied');
      mockSftp.unlink.mockImplementation((path, callback) => {
        callback(error);
      });

      const options: SftpDeleteOptions = { path: '/home/user/file.txt', isDir: false };

      // Call the method
      await repository.delete('test-client-id', options, mockStatusCallback);

      // Verify error handling
      expect(mockStatusCallback).toHaveBeenCalledWith({
        status: 'ERROR',
        message: error.message,
      });
    });
  });

  describe('download', () => {
    it('should download a file successfully', async () => {
      // Setup mock session
      await setupMockSession();

      // Mock file system
      fileSystemService.getTempDir.mockReturnValue('/tmp');

      // Setup stat to return file stats
      mockSftp.stat.mockImplementation((path, callback) => {
        callback(null, {
          isDirectory: () => false,
        });
      });

      // Setup fastGet to succeed
      mockSftp.fastGet.mockImplementation((remotePath, localPath, callback) => {
        callback(null);
      });

      // Call the method
      await repository.download('test-client-id', '/home/user/file.txt');

      // Verify the results
      expect(mockSftp.stat).toHaveBeenCalledWith('/home/user/file.txt', expect.any(Function));
      expect(mockSftp.fastGet).toHaveBeenCalledWith(
        '/home/user/file.txt',
        expect.stringContaining('/tmp'),
        expect.any(Function),
      );
      expect(fileStreamService.sendFile).toHaveBeenCalled();
    });

    it('should handle errors when file stats cannot be retrieved', async () => {
      // Setup mock session
      await setupMockSession();

      // Setup stat to fail
      const error = new Error('File not found');
      mockSftp.stat.mockImplementation((path, callback) => {
        callback(error, null);
      });

      // Call the method
      await repository.download('test-client-id', '/home/user/file.txt');

      // Verify error handling
      expect(sftpGateway.emit).toHaveBeenCalledWith(
        SsmEvents.FileTransfer.ERROR,
        expect.objectContaining({
          status: 'ERROR',
          message: error.message,
        }),
      );
    });

    it('should not allow downloading a directory', async () => {
      // Setup mock session
      await setupMockSession();

      // Setup stat to return directory stats
      mockSftp.stat.mockImplementation((path, callback) => {
        callback(null, {
          isDirectory: () => true,
        });
      });

      // Call the method
      await repository.download('test-client-id', '/home/user/dir');

      // Verify error handling
      expect(sftpGateway.emit).toHaveBeenCalledWith(
        SsmEvents.FileTransfer.ERROR,
        expect.objectContaining({
          status: 'ERROR',
          message: 'Cannot download a directory',
        }),
      );
      expect(mockSftp.fastGet).not.toHaveBeenCalled();
    });
  });

  describe('closeSession', () => {
    it('should close a session properly', async () => {
      // Setup mock session
      const sessionId = await setupMockSession();

      // Call the method
      repository.closeSession(sessionId);

      // Verify the results
      expect(mockSftp.end).toHaveBeenCalled();
      expect(sshConnectionService.closeConnection).toHaveBeenCalledWith(mockSsh);
    });
  });

  describe('closeClientSessions', () => {
    it('should close all sessions for a client', async () => {
      // Setup mock session
      await setupMockSession();

      // Call the method
      repository.closeClientSessions('test-client-id');

      // Verify the results
      expect(mockSftp.end).toHaveBeenCalled();
      expect(sshConnectionService.closeConnection).toHaveBeenCalledWith(mockSsh);
    });
  });

  // Helper function to set up a mock session for testing
  async function setupMockSession(): Promise<string> {
    const sessionId = await repository.createSession(mockClient, mockSessionDto);
    vi.clearAllMocks(); // Clear the creation mocks to focus on the test
    return sessionId;
  }
});
