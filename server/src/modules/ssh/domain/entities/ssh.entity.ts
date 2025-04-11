import { Client, ClientChannel, PseudoTtyOptions } from 'ssh2';

export interface SshSession {
  id: string;
  clientId: string;
  deviceUuid: string;
  ssh: Client;
  stream?: ClientChannel;
  ttyOptions: PseudoTtyOptions;
}

export interface SshConnectionOptions {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string | Buffer;
}

export interface SshStatusMessage {
  status: 'OK' | 'ERROR' | 'DISCONNECT';
  message?: string;
}
