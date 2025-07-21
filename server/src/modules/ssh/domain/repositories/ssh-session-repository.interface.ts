import { SshSession } from '../../domain/entities/ssh.entity';

export const SSH_SESSION_REPOSITORY = 'SSH_SESSION_REPOSITORY';

export interface ISshSessionRepository {
  /**
   * Create a new SSH session
   * @param session SSH session details
   */
  createSession(session: SshSession): void;

  /**
   * Get an SSH session by ID
   * @param sessionId The session ID
   * @returns The SSH session or undefined if not found
   */
  getSession(sessionId: string): SshSession | undefined;

  /**
   * Remove an SSH session
   * @param sessionId The session ID to remove
   */
  removeSession(sessionId: string): void;

  /**
   * Get all session IDs for a specific client
   * @param clientId The client ID
   * @returns Array of session IDs
   */
  getSessionsForClient(clientId: string): string[];

  /**
   * Remove all sessions for a specific client
   * @param clientId The client ID
   */
  removeClientSessions(clientId: string): void;
}
