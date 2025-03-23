import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { SsmEvents } from 'ssm-shared-lib';
import {
  SftpChmodOptions,
  SftpDeleteOptions,
  SftpMkdirOptions,
  SftpRenameOptions,
  SftpStatusMessage,
} from '../../domain/entities/sftp.entity';
import { SftpSessionDto } from '../../presentation/dtos/sftp-session.dto';
import { ISftpService } from '../interfaces/sftp-service.interface';
import { ISftpRepository } from '../../domain/repositories/sftp-repository.interface';
import { SftpGateway } from '../../presentation/gateways/sftp.gateway';

@Injectable()
export class SftpService implements ISftpService {
  private readonly logger = new Logger(SftpService.name);

  constructor(
    @Inject('ISftpRepository')
    private readonly sftpRepository: ISftpRepository,
    @Inject(forwardRef(() => SftpGateway))
    private readonly sftpGateway: SftpGateway,
  ) {}

  /**
   * Creates a new SFTP session
   */
  async createSession(client: Socket, sessionDto: SftpSessionDto): Promise<string> {
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

  /**
   * Lists the contents of a directory
   */
  async listDirectory(clientId: string, directoryPath: string): Promise<void> {
    return this.sftpRepository.listDirectory(clientId, directoryPath);
  }

  /**
   * Creates a directory
   */
  async mkdir(
    clientId: string,
    options: SftpMkdirOptions,
    callback: (response: SftpStatusMessage) => void,
  ): Promise<void> {
    return this.sftpRepository.mkdir(clientId, options, callback);
  }

  /**
   * Renames a file or directory
   */
  async rename(
    clientId: string,
    options: SftpRenameOptions,
    callback: (response: SftpStatusMessage) => void,
  ): Promise<void> {
    return this.sftpRepository.rename(clientId, options, callback);
  }

  /**
   * Changes file permissions
   */
  async chmod(
    clientId: string,
    options: SftpChmodOptions,
    callback: (response: SftpStatusMessage) => void,
  ): Promise<void> {
    return this.sftpRepository.chmod(clientId, options, callback);
  }

  /**
   * Deletes a file or directory
   */
  async delete(
    clientId: string,
    options: SftpDeleteOptions,
    callback: (response: SftpStatusMessage) => void,
  ): Promise<void> {
    return this.sftpRepository.delete(clientId, options, callback);
  }

  /**
   * Downloads a file
   */
  async download(clientId: string, filePath: string): Promise<void> {
    return this.sftpRepository.download(clientId, filePath);
  }

  /**
   * Closes a specific session
   */
  closeSession(sessionId: string): void {
    this.sftpRepository.closeSession(sessionId);
  }

  /**
   * Closes all sessions for a client
   */
  closeClientSessions(clientId: string): void {
    this.sftpRepository.closeClientSessions(clientId);
  }
}
