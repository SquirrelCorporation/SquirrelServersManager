import { Socket } from 'socket.io';
import SFTPInstance from './SFTPInstance';

const sftpSessions: { [deviceUuid: string]: SFTPInstance } = {};

/**
 * Stops and removes an existing SFTP session for a specific device UUID.
 *
 * @param deviceUuid - The UUID of the device whose session should be stopped and removed.
 */
function stopAndRemoveExistingSession(deviceUuid: string): void {
  if (sftpSessions[deviceUuid]) {
    sftpSessions[deviceUuid].stop();
    delete sftpSessions[deviceUuid];
  }
}

export function registerSftpSession(deviceUuid: string, socket: Socket): void {
  stopAndRemoveExistingSession(deviceUuid);
  const newSession = new SFTPInstance(deviceUuid, socket);
  sftpSessions[deviceUuid] = newSession;
  void newSession.start();
}
