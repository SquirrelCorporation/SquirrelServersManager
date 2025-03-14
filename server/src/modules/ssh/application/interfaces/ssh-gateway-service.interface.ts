import { Socket } from 'socket.io';

export const SSH_GATEWAY_SERVICE = 'SSH_GATEWAY_SERVICE';

export interface SshSessionDto {
  deviceUuid: string;
}

export interface ScreenResizeDto {
  cols: number;
  rows: number;
  sessionId: string;
}

export interface ISshGatewayService {
  /**
   * Handle new client connection
   * @param client Socket client
   */
  handleConnection(client: Socket): void;

  /**
   * Handle client disconnection
   * @param client Socket client
   */
  handleDisconnect(client: Socket): void;

  /**
   * Start a new SSH session
   * @param client Socket client
   * @param payload Session configuration
   * @returns Session details or error message
   */
  startSession(
    client: Socket, 
    payload: SshSessionDto
  ): Promise<{ sessionId: string; success: boolean } | { success: false; message: string }>;

  /**
   * Send data to an SSH session
   * @param client Socket client
   * @param data Data to send
   */
  sendData(client: Socket, data: string): void;

  /**
   * Resize the terminal
   * @param client Socket client
   * @param data Screen size details
   */
  resizeTerminal(client: Socket, data: ScreenResizeDto): void;
}