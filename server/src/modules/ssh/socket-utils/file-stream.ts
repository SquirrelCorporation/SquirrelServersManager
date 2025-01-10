import fs from 'fs';
import path from 'path';
import { SsmEvents } from 'ssm-shared-lib';
import { SSMSocket } from '../../../middlewares/Socket';

export const sendFile = (socket: SSMSocket, rootPath: string, filename: string) => {
  const filePath = path.join(rootPath, filename);
  if (!fs.existsSync(filePath)) {
    // Handle file not found
    socket.emit(SsmEvents.FileTransfer.NOT_FOUND, `File "${filePath}" not found on the server.`);
    return;
  }

  const fileStream = fs.createReadStream(filePath); // Create a read stream for the file

  // Emit metadata about the file before sending (e.g., filename, size)
  const fileStats = fs.statSync(filePath);
  socket.emit(SsmEvents.FileTransfer.METADATA, { filename, size: fileStats.size });

  // Send file in chunks
  fileStream.on('data', (chunk) => {
    socket.emit(SsmEvents.FileTransfer.CHUNK, chunk); // Send each chunk to the client
  });

  fileStream.on('end', () => {
    socket.emit(SsmEvents.FileTransfer.COMPLETE, filename); // Notify client of completion
  });

  fileStream.on('error', (err) => {
    socket.emit(SsmEvents.FileTransfer.ERROR, 'Error reading file.');
  });
};
