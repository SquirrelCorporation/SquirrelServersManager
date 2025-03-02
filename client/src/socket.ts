import { Manager } from 'socket.io-client';

// Create a Socket.IO Manager with the correct path
const manager = new Manager({
  path: '/api/socket.io',
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket', 'polling'],
});

// Create sockets for each namespace
export const socket = manager.socket('/'); // Default namespace
export const sshSocket = manager.socket('/ssh'); // SSH namespace
export const sftpSocket = manager.socket('/sftp'); // SFTP namespace

// Add connection event listeners for debugging
socket.on('connect', () => {
  console.log('Default socket connected');
  console.log('Default socket ID:', socket.id);
  console.log('Default socket namespace:', socket.nsp);
});

sshSocket.on('connect', () => {
  console.log('SSH socket connected');
  console.log('SSH socket ID:', sshSocket.id);
  console.log('SSH socket namespace:', sshSocket.nsp);
});

sftpSocket.on('connect', () => {
  console.log('SFTP socket connected');
  console.log('SFTP socket ID:', sftpSocket.id);
  console.log('SFTP socket namespace:', sftpSocket.nsp);
});

// Add error event listeners for debugging
socket.on('connect_error', (error) => {
  console.error('Default socket connection error:', error);
});

sshSocket.on('connect_error', (error) => {
  console.error('SSH socket connection error:', error);
});

sftpSocket.on('connect_error', (error) => {
  console.error('SFTP socket connection error:', error);
});
