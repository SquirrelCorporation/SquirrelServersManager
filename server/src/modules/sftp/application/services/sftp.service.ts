import * as path from 'path';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { SFTPWrapper } from 'ssh2';
import { API, SsmEvents } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';
import { Client } from 'ssh2';
import { SshConnectionService } from '@infrastructure/ssh/services/ssh-connection.service';
import { FileStreamService } from '../../infrastructure/services/file-stream.service';
import { SftpSessionDto } from '../../presentation/dtos/sftp-session.dto';
import {
  SftpChmodOptions,
  SftpDeleteOptions,
  SftpDirectoryResponse,
  SftpMkdirOptions,
  SftpRenameOptions,
  SftpSession,
  SftpStatusMessage,
} from '../../domain/entities/sftp.entity';
import { SftpRepository } from '../../infrastructure/repositories/sftp.repository';
import { ISftpService } from '../interfaces/sftp-service.interface';

@Injectable()
export class SftpService implements ISftpService {
  private readonly logger = new Logger(SftpService.name);
  private sessions: Map<string, SftpSession> = new Map();
  private clientSessions: Map<string, Set<string>> = new Map();

  constructor(
    private readonly sshConnectionService: SshConnectionService,
    private readonly fileStreamService: FileStreamService,
    private readonly sftpRepository: SftpRepository
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

      // Create session object
      const session: SftpSession = {
        id: sessionId,
        clientId,
        deviceUuid,
        client,
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
    const { ssh, client, deviceUuid } = session;

    ssh.on('ready', () => {
      client.emit(SsmEvents.SFTP.STATUS, {
        status: 'OK',
        message: 'SFTP CONNECTION ESTABLISHED',
      });
    });

    ssh.on('end', () => {
      this.logger.warn(`SSH connection ended for device: ${deviceUuid}`);
      client.emit(SsmEvents.SFTP.STATUS, {
        status: 'DISCONNECT',
        message: 'SFTP CONNECTION ENDED',
      });
      this.closeSession(session.id);
    });

    ssh.on('close', () => {
      this.logger.warn(`SSH connection closed for device: ${deviceUuid}`);
      client.emit(SsmEvents.SFTP.STATUS, {
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
      client.emit(SsmEvents.SFTP.STATUS, {
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
          session.client.emit(SsmEvents.SFTP.READ_DIR, {
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

        session.client.emit(SsmEvents.SFTP.READ_DIR, {
          status: 'OK',
          path: directoryPath,
          list: fileList,
        } as SftpDirectoryResponse);
      });
    } catch (error: any) {
      this.logger.error(`Error listing directory: ${error.message}`);
      session.client.emit(SsmEvents.SFTP.READ_DIR, {
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
      await this.getSftp(sessionId); // Just to validate the session
      const filename = path.basename(filePath);

      // Use the FileStreamService
      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      this.fileStreamService.sendFile(session.client, path.dirname(filePath), filename);
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
