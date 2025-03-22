import { Client, SFTPWrapper } from 'ssh2';
import { API } from 'ssm-shared-lib';

export interface SftpSession {
  id: string;
  clientId: string;
  deviceUuid: string;
  ssh: Client;
  sftp?: SFTPWrapper;
  host?: string;
}

export interface SftpStatusMessage {
  status: 'OK' | 'ERROR' | 'DISCONNECT';
  message?: string;
}

export interface SftpDirectoryResponse {
  status: 'OK' | 'ERROR';
  path?: string;
  list?: API.SFTPContent[];
  message?: string;
}

export interface SftpDeleteOptions {
  path: string;
  isDir: boolean;
}

export interface SftpRenameOptions {
  oldPath: string;
  newPath: string;
}

export interface SftpChmodOptions {
  path: string;
  mode: number;
}

export interface SftpMkdirOptions {
  path: string;
}
