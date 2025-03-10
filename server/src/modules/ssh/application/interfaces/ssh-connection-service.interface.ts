import { Client } from 'ssh2';

export interface ISshConnectionService {
  createConnection(deviceUuid: string): Promise<{ ssh: Client; host: string }>;
}