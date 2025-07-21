import * as fs from 'fs';
import * as path from 'path';
import { SftpGateway } from '@modules/sftp/presentation/gateways/sftp.gateway';
import { Injectable, Logger } from '@nestjs/common';
import { SsmEvents } from 'ssm-shared-lib';

@Injectable()
export class FileStreamService {
  private readonly logger = new Logger(FileStreamService.name);

  /**
   * Sends a file to the client in chunks
   * @param socket The socket connection to the client
   * @param rootPath The root path where the file is located
   * @param filename The name of the file to send
   */
  sendFile(socket: SftpGateway, rootPath: string, filename: string): void {
    const filePath = path.join(rootPath, filename);

    if (!fs.existsSync(filePath)) {
      this.logger.warn(`File "${filePath}" not found on the server.`);
      socket.emit(SsmEvents.FileTransfer.NOT_FOUND, `File "${filePath}" not found on the server.`);
      return;
    }

    const fileStream = fs.createReadStream(filePath);

    // Emit metadata about the file before sending
    const fileStats = fs.statSync(filePath);
    socket.emit(SsmEvents.FileTransfer.METADATA, { filename, size: fileStats.size });

    // Send file in chunks
    fileStream.on('data', (chunk) => {
      socket.emit(SsmEvents.FileTransfer.CHUNK, chunk);
    });

    fileStream.on('end', () => {
      this.logger.debug(`File transfer complete: ${filename}`);
      socket.emit(SsmEvents.FileTransfer.COMPLETE, filename);
    });

    fileStream.on('error', (err) => {
      this.logger.error(`Error reading file: ${err.message}`);
      socket.emit(SsmEvents.FileTransfer.ERROR, 'Error reading file.');
    });
  }
}
