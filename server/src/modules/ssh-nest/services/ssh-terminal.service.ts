import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ClientChannel, PseudoTtyOptions } from 'ssh2';
import { SsmEvents } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';
import { SshSessionDto } from '../dto/ssh-session.dto';
import { SshSession } from '../interfaces/ssh.interfaces';
import { SshConnectionService } from './ssh-connection.service';

@Injectable()
export class SshTerminalService {
  private readonly logger = new Logger(SshTerminalService.name);
  private sessions: Map<string, SshSession> = new Map();
  private clientSessions: Map<string, Set<string>> = new Map();

  constructor(private readonly sshConnectionService: SshConnectionService) {}

  /**
   * Creates a new SSH terminal session
   */
  async createSession(client: Socket, sessionDto: SshSessionDto): Promise<string> {
    const { deviceUuid, rows, cols } = sessionDto;
    const sessionId = uuidv4();
    const clientId = client.id;

    try {
      // Create SSH connection
      const { ssh, host } = await this.sshConnectionService.createConnection(deviceUuid);

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
      this.clientSessions.get(clientId).add(sessionId);

      this.logger.log(`SSH session created: ${sessionId} for device: ${deviceUuid}`);

      // Send welcome message
      client.emit(
        SsmEvents.SSH.NEW_DATA,
        `✅ Connected to device: ${deviceUuid} on ${host}!\r\n---\r\n`,
      );

      return sessionId;
    } catch (error: any) {
      this.logger.error(`Failed to create SSH session: ${error.message}`);
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
      client.emit(SsmEvents.SSH.STATUS, {
        status: 'OK',
        message: 'SSH CONNECTION ESTABLISHED',
      });

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
   * Sends data to the SSH stream
   */
  sendData(clientId: string, data: string): void {
    const sessionIds = this.clientSessions.get(clientId);
    if (!sessionIds || sessionIds.size === 0) {
      this.logger.warn(`No active sessions found for client: ${clientId}`);
      return;
    }

    // For simplicity, we'll send to the first session
    // In a real implementation, you might want to track the active session
    const sessionId = Array.from(sessionIds)[0];
    const session = this.sessions.get(sessionId);

    if (!session || !session.stream) {
      this.logger.warn(`No active stream found for session: ${sessionId}`);
      return;
    }

    try {
      session.stream.write(data);
    } catch (error: any) {
      this.logger.error(`Error sending data to stream: ${error.message}`);
    }
  }

  /**
   * Resizes the terminal
   */
  resizeTerminal(clientId: string, dimensions: { rows: number; cols: number }): void {
    const sessionIds = this.clientSessions.get(clientId);
    if (!sessionIds || sessionIds.size === 0) {
      return;
    }

    // For simplicity, we'll resize the first session
    const sessionId = Array.from(sessionIds)[0];
    const session = this.sessions.get(sessionId);

    if (!session || !session.stream) {
      return;
    }

    try {
      const { rows, cols } = dimensions;
      session.ttyOptions.rows = rows;
      session.ttyOptions.cols = cols;

      session.stream.setWindow(
        rows,
        cols,
        session.ttyOptions.height as number,
        session.ttyOptions.width as number,
      );

      this.logger.debug(`Terminal resized: rows=${rows}, cols=${cols}`);
    } catch (error: any) {
      this.logger.error(`Error resizing terminal: ${error.message}`);
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
}
