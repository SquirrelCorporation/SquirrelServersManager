import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Client, ClientChannel, PseudoTtyOptions } from 'ssh2';
import { SsmEvents } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';
import { SshConnectionService } from '@infrastructure/ssh/services/ssh-connection.service';
import { SshSession } from '../../domain/entities/ssh.entity';
import { ISshTerminalService } from '../interfaces/ssh-terminal-service.interface';

@Injectable()
export class SshTerminalService implements ISshTerminalService {
  private readonly logger = new Logger(SshTerminalService.name);
  private sessions: Map<string, SshSession> = new Map();
  private clientSessions: Map<string, Set<string>> = new Map();

  constructor(private readonly sshConnectionService: SshConnectionService) {}

  /**
   * Creates a new SSH terminal session
   */
  async createSession(client: Socket, deviceUuid: string, cols: number, rows: number): Promise<string> {
    const sessionId = uuidv4();
    const clientId = client.id;

    try {
      const ssh = new Client();
          // Create session object
      const ttyOptions: PseudoTtyOptions = {
        rows,
        cols,
        height: 24,
        width: 80,
        term: 'xterm-256color',
      };

     const session: SshSession = {
        id: sessionId,
        clientId,
        deviceUuid,
        client,
        ssh,
        ttyOptions,
      };

            // Set up event listeners
      this.setupSshEventListeners(session);
      // Create SSH connection
      const { host } = await this.sshConnectionService.createConnection(ssh, deviceUuid);


      // Store session
      this.sessions.set(sessionId, session);

      // Associate session with client
      if (!this.clientSessions.has(clientId)) {
        this.clientSessions.set(clientId, new Set());
      }
      this.clientSessions.get(clientId)!.add(sessionId);

      this.logger.log(`SSH session created: ${sessionId} for device: ${deviceUuid}`);

      // Send welcome message
      client.emit(
        SsmEvents.SSH.NEW_DATA,
        `✅ Connected to device: ${deviceUuid} on ${host}!\r\n---\r\n`,
      );

      return sessionId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create SSH session: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Sets up event listeners for the SSH connection
   */
  private setupSshEventListeners(session: SshSession): void {
    const { ssh, client, ttyOptions, deviceUuid } = session;

    ssh.on('banner', (data: string) => {
      client.emit(SsmEvents.SSH.NEW_DATA, data.replace(/\r?\n/g, '\r\n'));
    });

    ssh.on('ready', () => {
      this.logger.log(`SSH connection ready for ${deviceUuid}`);
      client.emit(SsmEvents.SSH.STATUS, {
        status: 'OK',
        message: 'SSH CONNECTION ESTABLISHED',
      });

      this.logger.log(`Creating shell for ${deviceUuid}`);
      // Create shell
      ssh.shell(ttyOptions, (err: Error | undefined, stream: ClientChannel) => {
        if (err) {
          this.logger.error(`Failed to create shell: ${err.message}`);
          this.closeSession(session.id);
          return;
        }

        session.stream = stream;

        // Set up stream event handlers
        stream.on('data', (data: Buffer) => {
          client.emit(SsmEvents.SSH.NEW_DATA, data.toString('utf-8'));
        });

        stream.on('close', (code: number | null, signal: string | null) => {
          this.logger.warn(`Stream closed: code=${code}, signal=${signal}`);
          if (code !== 0 && code !== null) {
            this.logger.error(`Stream closed with error: code=${code}, signal=${signal}`);
          }
          this.closeSession(session.id);
        });

        stream.stderr.on('data', (data: Buffer) => {
          this.logger.error(`STDERR: ${data.toString()}`);
        });
      });
    });

    ssh.on('end', () => {
      this.logger.warn(`SSH connection ended for device: ${deviceUuid}`);
      client.emit(SsmEvents.SSH.STATUS, {
        status: 'DISCONNECT',
        message: 'SSH CONNECTION ENDED',
      });
      this.closeSession(session.id);
    });

    ssh.on('close', () => {
      this.logger.warn(`SSH connection closed for device: ${deviceUuid}`);
      client.emit(SsmEvents.SSH.STATUS, {
        status: 'DISCONNECT',
        message: 'SSH CONNECTION CLOSED',
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
      client.emit(SsmEvents.SSH.STATUS, {
        status: 'DISCONNECT',
        message,
      });
      this.closeSession(session.id);
    });
  }

  /**
   * Gets the session ID for a client
   */
  getSessionIdForClient(clientId: string): string | null {
    const sessionIds = this.clientSessions.get(clientId);
    if (!sessionIds || sessionIds.size === 0) {
      return null;
    }
    // Return the first session ID for simplicity
    return Array.from(sessionIds)[0];
  }

  /**
   * Sends data to the SSH stream
   */
  sendData(sessionId: string, data: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || !session.stream) {
      this.logger.warn(`No active stream found for session: ${sessionId}`);
      return;
    }

    try {
      session.stream.write(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error sending data: ${errorMessage}`);
    }
  }

  /**
   * Resizes the terminal
   */
  resizeTerminal(sessionId: string, cols: number, rows: number): void {
    const session = this.sessions.get(sessionId);
    if (!session || !session.stream) {
      return;
    }

    try {
      session.stream.setWindow(rows, cols, 0, 0);
      this.logger.debug(`Terminal resized: ${sessionId} to ${cols}x${rows}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error resizing terminal: ${errorMessage}`);
    }
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
      // Clean up stream
      if (session.stream) {
        session.stream.end();
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

      this.logger.log(`SSH session closed: ${sessionId}`);
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

  /**
   * Gets the SSH stream for a session
   */
  async getStream(sessionId: string): Promise<ClientChannel> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (!session.stream) {
      throw new Error(`No active stream for session: ${sessionId}`);
    }

    return session.stream;
  }
}
