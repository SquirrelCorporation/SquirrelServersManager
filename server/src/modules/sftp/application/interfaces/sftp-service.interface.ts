import { Socket } from 'socket.io';
import { SftpSessionDto } from '../../presentation/dtos/sftp-session.dto';
import {
  SftpChmodOptions,
  SftpDeleteOptions,
  SftpMkdirOptions,
  SftpRenameOptions,
  SftpStatusMessage,
} from '../../domain/entities/sftp.entity';

export interface ISftpService {
  createSession(client: Socket, sessionDto: SftpSessionDto): Promise<string>;
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
  closeSession(sessionId: string): void;
  closeClientSessions(clientId: string): void;
}