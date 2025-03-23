import { Socket } from 'socket.io';
import {
  SftpChmodOptions,
  SftpDeleteOptions,
  SftpMkdirOptions,
  SftpRenameOptions,
  SftpStatusMessage,
} from '../entities/sftp.entity';
import { SftpSessionDto } from '../../presentation/dtos/sftp-session.dto';

/**
 * Interface for SFTP repository operations
 */
export interface ISftpRepository {
  /**
   * Creates a new SFTP session
   */
  createSession(client: Socket, sessionDto: SftpSessionDto): Promise<string>;

  /**
   * Lists the contents of a directory
   */
  listDirectory(clientId: string, directoryPath: string): Promise<void>;

  /**
   * Creates a directory
   */
  mkdir(
    clientId: string,
    options: SftpMkdirOptions,
    callback: (response: SftpStatusMessage) => void,
  ): Promise<void>;

  /**
   * Renames a file or directory
   */
  rename(
    clientId: string,
    options: SftpRenameOptions,
    callback: (response: SftpStatusMessage) => void,
  ): Promise<void>;

  /**
   * Changes file permissions
   */
  chmod(
    clientId: string,
    options: SftpChmodOptions,
    callback: (response: SftpStatusMessage) => void,
  ): Promise<void>;

  /**
   * Deletes a file or directory
   */
  delete(
    clientId: string,
    options: SftpDeleteOptions,
    callback: (response: SftpStatusMessage) => void,
  ): Promise<void>;

  /**
   * Downloads a file
   */
  download(clientId: string, filePath: string): Promise<void>;

  /**
   * Closes a specific session
   */
  closeSession(sessionId: string): void;

  /**
   * Closes all sessions for a client
   */
  closeClientSessions(clientId: string): void;
}
