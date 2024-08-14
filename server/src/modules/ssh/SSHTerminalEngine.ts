import { Socket } from 'socket.io';
import { PseudoTtyOptions } from 'ssh2';
import SSHTerminalInstance from './SSHTerminalInstance';

const state: SSHTerminalInstance[] | never = [];

export function registerSshSession(
  deviceUuid: string,
  socket: Socket,
  ttyOptions: PseudoTtyOptions,
) {
  if (state[deviceUuid]) {
    state[deviceUuid].stop();
    delete state[deviceUuid];
  }
  state[deviceUuid] = new SSHTerminalInstance(deviceUuid, socket, ttyOptions);
  state[deviceUuid].start();
}
