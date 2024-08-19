import { Socket } from 'socket.io';
import { PseudoTtyOptions } from 'ssh2';
import SSHTerminalInstance from './SSHTerminalInstance';

const sshSessions: { [deviceUuid: string]: SSHTerminalInstance } = {};

/**
 * Stops and removes an existing SSH session for a specific device UUID.
 *
 * @param deviceUuid - The UUID of the device whose session should be stopped and removed.
 */
function stopAndRemoveExistingSession(deviceUuid: string): void {
  if (sshSessions[deviceUuid]) {
    sshSessions[deviceUuid].stop();
    delete sshSessions[deviceUuid];
  }
}

export function registerSshSession(
  deviceUuid: string,
  socket: Socket,
  ttyOptions: PseudoTtyOptions,
): void {
  stopAndRemoveExistingSession(deviceUuid);
  const newSession = new SSHTerminalInstance(deviceUuid, socket, ttyOptions);
  sshSessions[deviceUuid] = newSession;
  newSession.start();
}
