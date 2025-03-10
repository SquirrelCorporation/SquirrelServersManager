import { Socket } from 'socket.io';
import { SFTPWrapper } from 'ssh2';
import {
  SftpChmodOptions,
  SftpDeleteOptions,
  SftpMkdirOptions,
  SftpRenameOptions,
  SftpStatusMessage,
} from '../entities/sftp.entity';

export interface ISftpRepository {
  createSession(client: Socket, deviceUuid: string): Promise<string>;
  getSftp(sessionId: string): Promise<SFTPWrapper>;
  listDirectory(clientId: string, directoryPath: string): Promise<void>;
  mkdir(
    clientId: string,
    options: SftpMkdirOptions,
    callback: (response: SftpStatusMessage) => void,
  ): Promise<void>;
  rename(
    clientId: string,
    options: SftpRenameOptions,
    callback: (response: SftpStatusMessage) => void,
  ): Promise<void>;
  chmod(
    clientId: string,
    options: SftpChmodOptions,
    callback: (response: SftpStatusMessage) => void,
  ): Promise<void>;
  delete(
    clientId: string,
    options: SftpDeleteOptions,
    callback: (response: SftpStatusMessage) => void,
  ): Promise<void>;
  download(clientId: string, filePath: string): Promise<void>;
  getSessionIdForClient(clientId: string): string | null;
  closeSession(sessionId: string): void;
  closeClientSessions(clientId: string): void;
}