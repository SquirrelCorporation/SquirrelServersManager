import { ClientChannel } from 'ssh2';

export interface ISshTerminalService {
  createSession(clientId: string, deviceUuid: string, cols: number, rows: number): Promise<string>;
  getStream(sessionId: string): Promise<ClientChannel>;
  resizeTerminal(sessionId: string, cols: number, rows: number): void;
  sendData(sessionId: string, data: string): void;
  getSessionIdForClient(clientId: string): string | null;
  closeSession(sessionId: string): void;
  closeClientSessions(clientId: string): void;
}