import { io, ManagerOptions, SocketOptions } from 'socket.io-client';

// Create a singleton manager for all socket connections
// This ensures proper multiplexing and prevents duplicate connections
const socketOptions: Partial<ManagerOptions & SocketOptions> = {
  path: '/api/socket.io/',
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket'],
  // Add explicit multiplexing options for Socket.IO
  forceNew: false, // Don't force new manager for namespaces
  multiplex: true, // Enable multiplexing (default, but explicit for clarity)
};

// Create a single instance to share across the application
const sshSocketManager = io('/ssh', socketOptions);
const sftpSocketManager = io('/sftp', socketOptions);
const containerSocketManager = io('/containers', socketOptions);
const notificationSocketManager = io('/notifications', socketOptions);
const diagnosticSocketManager = io('/diagnostic', socketOptions);
const containerLiveLogsSocketManager = io(
  '/containers-live-logs',
  socketOptions,
);

// Export the socket instances
export const sshSocket = sshSocketManager;
export const sftpSocket = sftpSocketManager;
export const containerSocket = containerSocketManager;
export const notificationSocket = notificationSocketManager;
export const diagnosticSocket = diagnosticSocketManager;
export const containerLiveLogsSocket = containerLiveLogsSocketManager;

sshSocket.on('connect', () => {
  console.log('SSH socket connected:', {
    id: sshSocket.id,
    connected: sshSocket.connected,
    namespace: sshSocket.nsp,
  });
});

sftpSocket.on('connect', () => {
  console.log('SFTP socket connected:', {
    id: sftpSocket.id,
    connected: sftpSocket.connected,
    namespace: sftpSocket.nsp,
  });
});

sshSocket.on('connect_error', (error) => {
  console.error('SSH socket connection error:', error);
});

sftpSocket.on('connect_error', (error) => {
  console.error('SFTP socket connection error:', error);
});

// Add disconnection monitoring
sshSocket.on('disconnect', (reason) => {
  console.log('SSH socket disconnected:', reason);
});

// Add message success tracking for SSH
let lastSshMessageTime = 0;
const originalEmit = sshSocket.emit;
sshSocket.emit = function (...args: any[]) {
  const eventName = args[0];
  console.log(`Emitting event: ${eventName}`);
  lastSshMessageTime = Date.now();

  // Add a wrapper to track server responses on emitWithAck
  if (args[0] === 'ssh:startSession') {
    console.log('Starting SSH session...');
  }

  return originalEmit.apply(this, args);
} as any;
