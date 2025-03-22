import * as path from 'path';
import { SshConnectionService } from '@infrastructure/ssh/services/ssh-connection.service';
import { SftpGateway } from '@modules/sftp';
import { FileSystemService } from '@modules/shell';
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Client, SFTPWrapper } from 'ssh2';
import { API, SsmEvents } from 'ssm-shared-lib';
import { v4 as uuidv4, v4 } from 'uuid';
import {
  SftpChmodOptions,
  SftpDeleteOptions,
  SftpDirectoryResponse,
  SftpMkdirOptions,
  SftpRenameOptions,
  SftpSession,
  SftpStatusMessage,
} from '../../domain/entities/sftp.entity';
import { FileStreamService } from '../../infrastructure/services/file-stream.service';
import { SftpSessionDto } from '../../presentation/dtos/sftp-session.dto';
import { ISftpService } from '../interfaces/sftp-service.interface';

@Injectable()
export class SftpService implements ISftpService {
  private readonly logger = new Logger(SftpService.name);
  private sessions: Map<string, SftpSession> = new Map();
  private clientSessions: Map<string, Set<string>> = new Map();

  constructor(
    private readonly sshConnectionService: SshConnectionService,
    private readonly fileStreamService: FileStreamService,
    @Inject(forwardRef(() => SftpGateway))
    private readonly sftpGateway: SftpGateway,
    private readonly fileSystemService: FileSystemService,
  ) {}

  /**
   * Creates a new SFTP session
   */
  async createSession(client: Socket, sessionDto: SftpSessionDto): Promise<string> {
    const { deviceUuid } = sessionDto;
    const sessionId = uuidv4();
    const clientId = client.id;

    try {
      // Create SSH connection
      const ssh = new Client();
      const { host } = await this.sshConnectionService.createConnection(ssh, deviceUuid);
      this.sftpGateway.emit(SsmEvents.SFTP.STATUS, {
        status: 'OK',
        message: 'SFTP CONNECTION ESTABLISHED',
      });
      // Create session object
      const session: SftpSession = {
        id: sessionId,
        clientId,
        deviceUuid,
        ssh,
        host,
      };

      // Set up event listeners
      this.setupSshEventListeners(session);

      // Store session
      this.sessions.set(sessionId, session);

      // Track sessions by client
      if (!this.clientSessions.has(clientId)) {
        this.clientSessions.set(clientId, new Set());
      }
      this.clientSessions.get(clientId)?.add(sessionId);

      this.logger.log(`SFTP session created: ${sessionId} for device: ${deviceUuid}`);
      await this.getSftp(sessionId);
      return sessionId;
    } catch (error: any) {
      this.logger.error(`Failed to create SFTP session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sets up event listeners for the SSH connection
   */
  private setupSshEventListeners(session: SftpSession): void {
    const { ssh, deviceUuid } = session;

    ssh.on('end', () => {
      this.logger.warn(`SSH connection ended for device: ${deviceUuid}`);
      this.sftpGateway.emit(SsmEvents.SFTP.STATUS, {
        status: 'DISCONNECT',
        message: 'SFTP CONNECTION ENDED',
      });
      this.closeSession(session.id);
    });

    ssh.on('close', () => {
      this.logger.warn(`SSH connection closed for device: ${deviceUuid}`);
      this.sftpGateway.emit(SsmEvents.SFTP.STATUS, {
        status: 'DISCONNECT',
        message: 'SFTP CONNECTION CLOSED',
      });
      this.closeSession(session.id);
    });

    ssh.on('error', (err: any) => {
      let message = err.message;

      if (err?.level === 'client-authentication') {
        message = `Authentication failure`;
      } else if (err?.code === 'ENOTFOUND') {
        message = `Host not found: ${err.hostname}`;
      } else if (err?.level === 'client-timeout') {
        message = `Connection Timeout`;
      }

      this.logger.error(`SSH error: ${message}`);
      this.sftpGateway.emit(SsmEvents.SFTP.STATUS, {
        status: 'DISCONNECT',
        message,
      });
      this.closeSession(session.id);
    });
  }

  /**
   * Gets or initializes an SFTP wrapper for a session
   */
  private async getSftp(sessionId: string): Promise<SFTPWrapper> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.sftp) {
      return session.sftp;
    }

    return new Promise<SFTPWrapper>((resolve, reject) => {
      session.ssh.sftp((err, sftp) => {
        if (err) {
          this.logger.error(`SFTP initialization failed: ${err.message}`);
          reject(err);
          return;
        }

        session.sftp = sftp;
        this.logger.debug(`SFTP initialized for session: ${sessionId}`);
        resolve(sftp);
      });
    });
  }

  /**
   * Lists the contents of a directory
   */
  async listDirectory(clientId: string, directoryPath: string): Promise<void> {
    const sessionId = this.getSessionIdForClient(clientId);
    if (!sessionId) {
      return;
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    try {
      const sftp = await this.getSftp(sessionId);

      sftp.readdir(directoryPath, (err, list) => {
        if (err) {
          this.logger.error(`Error reading directory: ${err.message}`);
          this.sftpGateway.emit(SsmEvents.SFTP.READ_DIR, {
            status: 'ERROR',
            message: err.message,
          } as SftpDirectoryResponse);
          return;
        }

        const fileList = list.map(
          (file) =>
            ({
              filename: file.filename,
              longname: file.longname,
              isFile: file.attrs.isFile(),
              isDir: file.attrs.isDirectory(),
              isBlockDevice: file.attrs.isBlockDevice(),
              isFIFO: file.attrs.isFIFO(),
              isSocket: file.attrs.isSocket(),
              isSymbolicLink: file.attrs.isSymbolicLink(),
              isCharacterDevice: file.attrs.isCharacterDevice(),
              size: file.attrs.size,
              mode: file.attrs.mode,
              gid: file.attrs.gid,
              uid: file.attrs.uid,
            }) as API.SFTPContent,
        );

        this.sftpGateway.emit(SsmEvents.SFTP.READ_DIR, {
          status: 'OK',
          path: directoryPath,
          list: fileList,
        } as SftpDirectoryResponse);
      });
    } catch (error: any) {
      this.logger.error(`Error listing directory: ${error.message}`);
      this.sftpGateway.emit(SsmEvents.SFTP.READ_DIR, {
        status: 'ERROR',
        message: error.message,
      } as SftpDirectoryResponse);
    }
  }

  /**
   * Creates a directory
   */
  async mkdir(
    clientId: string,
    options: SftpMkdirOptions,
    callback: (response: SftpStatusMessage) => void,
  ): Promise<void> {
    const sessionId = this.getSessionIdForClient(clientId);
    if (!sessionId) {
      callback({ status: 'ERROR', message: 'No active session' });
      return;
    }

    try {
      const sftp = await this.getSftp(sessionId);

      sftp.mkdir(options.path, (err) => {
        if (err) {
          this.logger.error(`Error creating directory: ${err.message}`);
          callback({ status: 'ERROR', message: err.message });
          return;
        }

        this.logger.debug(`Directory created: ${options.path}`);
        callback({ status: 'OK' });
      });
    } catch (error: any) {
      this.logger.error(`Error creating directory: ${error.message}`);
      callback({ status: 'ERROR', message: error.message });
    }
  }

  /**
   * Renames a file or directory
   */
  async rename(
    clientId: string,
    options: SftpRenameOptions,
    callback: (response: SftpStatusMessage) => void,
  ): Promise<void> {
    const sessionId = this.getSessionIdForClient(clientId);
    if (!sessionId) {
      callback({ status: 'ERROR', message: 'No active session' });
      return;
    }

    try {
      const sftp = await this.getSftp(sessionId);

      sftp.rename(options.oldPath, options.newPath, (err) => {
        if (err) {
          this.logger.error(`Error renaming: ${err.message}`);
          callback({ status: 'ERROR', message: err.message });
          return;
        }

        this.logger.debug(`Renamed: ${options.oldPath} to ${options.newPath}`);
        callback({ status: 'OK' });
      });
    } catch (error: any) {
      this.logger.error(`Error renaming: ${error.message}`);
      callback({ status: 'ERROR', message: error.message });
    }
  }

  /**
   * Changes file permissions
   */
  async chmod(
    clientId: string,
    options: SftpChmodOptions,
    callback: (response: SftpStatusMessage) => void,
  ): Promise<void> {
    const sessionId = this.getSessionIdForClient(clientId);
    if (!sessionId) {
      callback({ status: 'ERROR', message: 'No active session' });
      return;
    }

    try {
      const sftp = await this.getSftp(sessionId);

      sftp.chmod(options.path, options.mode, (err) => {
        if (err) {
          this.logger.error(`Error changing permissions: ${err.message}`);
          callback({ status: 'ERROR', message: err.message });
          return;
        }

        this.logger.debug(`Changed permissions: ${options.path} to ${options.mode.toString(8)}`);
        callback({ status: 'OK' });
      });
    } catch (error: any) {
      this.logger.error(`Error changing permissions: ${error.message}`);
      callback({ status: 'ERROR', message: error.message });
    }
  }

  /**
   * Deletes a file or directory
   */
  async delete(
    clientId: string,
    options: SftpDeleteOptions,
    callback: (response: SftpStatusMessage) => void,
  ): Promise<void> {
    const sessionId = this.getSessionIdForClient(clientId);
    if (!sessionId) {
      callback({ status: 'ERROR', message: 'No active session' });
      return;
    }

    try {
      const sftp = await this.getSftp(sessionId);

      if (options.isDir) {
        sftp.rmdir(options.path, (err) => {
          if (err) {
            this.logger.error(`Error deleting directory: ${err.message}`);
            callback({ status: 'ERROR', message: err.message });
            return;
          }

          this.logger.debug(`Directory deleted: ${options.path}`);
          callback({ status: 'OK' });
        });
      } else {
        sftp.unlink(options.path, (err) => {
          if (err) {
            this.logger.error(`Error deleting file: ${err.message}`);
            callback({ status: 'ERROR', message: err.message });
            return;
          }

          this.logger.debug(`File deleted: ${options.path}`);
          callback({ status: 'OK' });
        });
      }
    } catch (error: any) {
      this.logger.error(`Error deleting: ${error.message}`);
      callback({ status: 'ERROR', message: error.message });
    }
  }

  /**
   * Downloads a file
   */
  async download(clientId: string, filePath: string): Promise<void> {
    const sessionId = this.getSessionIdForClient(clientId);
    if (!sessionId) {
      throw new Error('No active session found for client');
    }

    try {
      // Get the SFTP wrapper but don't use it directly since we're using the fileStreamService
      const sftp = await this.getSftp(sessionId); // Just to validate the session
      const localRootPath = `/tmp/${v4()}`;
      this.fileSystemService.createDirectory(localRootPath);
      const remotePath = filePath;
      const localPath = path.join(localRootPath, path.basename(remotePath));

      // Use the FileStreamService
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Check if the remote path is a directory or a file
      sftp.stat(remotePath, (err, stats) => {
        if (err) {
          this.logger.error(`Error getting file stats: ${err.message}`);
          this.sftpGateway.emit(SsmEvents.FileTransfer.ERROR, {
            status: 'ERROR',
            message: err.message,
          });
        } else {
          if (stats.isDirectory()) {
            const remoteTempDir = `/tmp/${v4()}`; // A unique
            const tarPath = `${remoteTempDir}/${path.basename(remotePath)}.tar.gz`;
            // Create a tarball from the remote directory
            const tarCommand = `mkdir -p "${remoteTempDir}" && tar -czvf "${tarPath}" "${remotePath}"`;
            this.logger.log(`Creating tarball: ${tarCommand}`);
            session.ssh.exec(tarCommand, (err, stream) => {
              if (err) {
                this.logger.error(`Error creating tarball: ${err.message}`);
                this.sftpGateway.emit(SsmEvents.FileTransfer.ERROR, {
                  status: 'ERROR',
                  message: err.message,
                });
              } else {
                stream
                  .on('close', (code, signal) => {
                    if (code !== 0) {
                      this.logger.error(`Tarball creation failed with code ${code}`);
                      this.sftpGateway.emit(SsmEvents.FileTransfer.ERROR, {
                        status: 'ERROR',
                        message: `Tarball creation failed with code ${code}`,
                      });
                      return;
                    }
                    this.logger.log(`Tarball created at ${tarPath}`);
                    sftp.fastGet(tarPath, `${localPath}.tar.gz`, (err) => {
                      if (err) {
                        this.logger.error(err);
                        this.logger.error(`Error downloading file: ${err.message}`);
                        this.sftpGateway.emit(SsmEvents.FileTransfer.ERROR, {
                          status: 'ERROR',
                          message: err.message,
                        });
                      } else {
                        this.logger.log(`File downloaded from ${tarPath} to ${localPath}`);
                        this.fileStreamService.sendFile(
                          this.sftpGateway,
                          localRootPath,
                          tarPath.split('/').pop() as string,
                        );
                      }
                    });
                  })
                  .on('data', (data) => {
                    this.logger.log(`Tarball creation progress...`);
                  });
              }
            });
          } else {
            sftp.fastGet(filePath, localPath, (err) => {
              if (err) {
                this.logger.error(`Error downloading file: ${err.message}`);
                this.sftpGateway.emit(SsmEvents.FileTransfer.ERROR, {
                  status: 'ERROR',
                  message: err.message,
                });
              } else {
                this.logger.log(`File downloaded from ${filePath} to ${localPath}`);
                this.fileStreamService.sendFile(
                  this.sftpGateway,
                  localRootPath,
                  filePath.split('/').pop() as string,
                );
              }
            });
          }
        }
      });
    } catch (error: any) {
      this.logger.error(`Error downloading file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Gets the session ID for a client
   */
  private getSessionIdForClient(clientId: string): string | null {
    const sessionIds = this.clientSessions.get(clientId);
    if (!sessionIds || sessionIds.size === 0) {
      return null;
    }

    // For simplicity, we'll use the first session
    return Array.from(sessionIds)[0];
  }

  /**
   * Closes a specific session
   */
  closeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    try {
      // Close SFTP
      if (session.sftp) {
        session.sftp.end();
      }

      // Close SSH connection
      this.sshConnectionService.closeConnection(session.ssh);

      // Remove session from tracking
      this.sessions.delete(sessionId);

      // Remove from client sessions
      const clientSessions = this.clientSessions.get(session.clientId);
      if (clientSessions) {
        clientSessions.delete(sessionId);
        if (clientSessions.size === 0) {
          this.clientSessions.delete(session.clientId);
        }
      }

      this.logger.log(`SFTP session closed: ${sessionId}`);
    } catch (error: any) {
      this.logger.error(`Error closing session: ${error.message}`);
    }
  }

  /**
   * Closes all sessions for a client
   */
  closeClientSessions(clientId: string): void {
    const sessionIds = this.clientSessions.get(clientId);
    if (!sessionIds) {
      return;
    }

    // Create a copy of the set to avoid modification during iteration
    const sessionsToClose = Array.from(sessionIds);

    for (const sessionId of sessionsToClose) {
      this.closeSession(sessionId);
    }

    this.clientSessions.delete(clientId);
    this.logger.log(`All sessions closed for client: ${clientId}`);
  }
}
