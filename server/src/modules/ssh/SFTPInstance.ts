import * as util from 'node:util';
import { Logger } from 'pino';
import { Socket } from 'socket.io';
import { API, SsmEvents } from 'ssm-shared-lib';
import { SFTPWrapper } from 'ssh2';
import { v4 } from 'uuid';
import _logger from '../../logger';
import { SSMSocket } from '../../middlewares/Socket';
import FileSystemManager from '../shell/managers/FileSystemManager';
import { sendFile } from './socket-utils/file-stream';
import SSHConnectionInstance from './SSHConnectionInstance';

type CallbackType = (response: { status: string; error?: string }) => void;

export default class SFTPInstance {
  private sshConnectionInstance: SSHConnectionInstance;
  private socket: SSMSocket;
  private logger: Logger;
  private sftp: SFTPWrapper | null = null; // Cached SFTP instance

  constructor(deviceUuid: string, socket: Socket) {
    this.sshConnectionInstance = new SSHConnectionInstance(deviceUuid);
    this.socket = socket;
    this.logger = _logger.child(
      { module: 'SFTPInstance', moduleId: deviceUuid },
      { msgPrefix: '[SFTP_INSTANCE] - ' },
    );
  }

  async start() {
    this.logger.info(`Starting SFTPInstance...`);
    this.bind();
    this.logger.debug('Awaiting SFTP connection...');
    await this.sshConnectionInstance.connect();
  }

  async stop() {
    try {
      if (this.sftp) {
        this.logger.info('Closing SFTP session...');
        this.sftp.end();
        this.sftp = null; // Clear cached SFTP instance
      }
      this.sshConnectionInstance.ssh.end();
    } catch (error: any) {
      this.logger.error(`Error during stop: ${error.message}`);
    }
  }

  private bind() {
    this.logger.debug('Binding SFTP events...');
    this.sshConnectionInstance.ssh.on('ready', this.handleReady.bind(this));
    this.sshConnectionInstance.ssh.on('end', this.handleEnd.bind(this));
    this.sshConnectionInstance.ssh.on('close', this.handleClose.bind(this));
    this.sshConnectionInstance.ssh.on('error', this.handleConnectionError.bind(this));
    this.sshConnectionInstance.ssh.on(
      'keyboard-interactive',
      this.handleKeyboardInteractive.bind(this),
    );
  }

  private handleReady() {
    this.logger.info('SSH connection established');
    this.socket.emit(SsmEvents.SFTP.STATUS, {
      status: 'OK',
      message: 'SFTP CONNECTION ESTABLISHED',
    });
    this.socket.on(SsmEvents.SFTP.MKDIR, this.mkdir.bind(this));
    this.socket.on(SsmEvents.SFTP.READ_DIR, this.list.bind(this));
    this.socket.on(SsmEvents.SFTP.RENAME, this.rename.bind(this));
    this.socket.on(SsmEvents.SFTP.DOWNLOAD, this.download.bind(this));
    this.socket.on(SsmEvents.SFTP.CHMOD, this.chmod.bind(this));
    this.socket.on(SsmEvents.SFTP.DELETE, this.delete.bind(this));
  }

  private async initializeSFTP() {
    if (this.sftp) {
      // Reuse existing SFTP session
      return this.sftp;
    }

    // Create a new SFTP session
    this.logger.info('Initializing new SFTP session...');
    return new Promise<SFTPWrapper>((resolve, reject) => {
      this.sshConnectionInstance.ssh.sftp((err, sftp) => {
        if (err) {
          this.logger.error(`SFTP initialization failed: ${err.message}`);
          this.socket.emit(SsmEvents.SFTP.STATUS, {
            status: 'ERROR',
            message: `Failed to initialize SFTP: ${err.message}`,
          });
          reject(err);
        } else {
          this.logger.info('SFTP session established');
          this.sftp = sftp; // Cache the SFTP instance for future reuse
          resolve(sftp);
        }
      });
    });
  }

  // Method to delete a file or directory
  public async delete(data: { path: string; isDir: boolean }, callback: CallbackType) {
    this.logger.info(`Delete request: ${JSON.stringify(data)}`);

    try {
      const sftp = await this.initializeSFTP();

      if (!data || !data.path || typeof data.isDir !== 'boolean') {
        callback({
          status: 'ERROR',
          error: 'Invalid delete request (path and isDir are required)',
        });
        return;
      }

      if (data.isDir) {
        // Remove directory
        sftp.rmdir(data.path, (err) => {
          if (err) {
            this.logger.error(`Error deleting directory: ${err.message}`);
            callback({ status: 'ERROR', error: `Failed to delete directory: ${err.message}` });
          } else {
            this.logger.info(`Directory deleted: ${data.path}`);
            callback({
              status: 'OK',
            });
          }
        });
      } else {
        // Remove file
        sftp.unlink(data.path, (err) => {
          if (err) {
            this.logger.error(`Error deleting file: ${err.message}`);
            callback({ status: 'ERROR', error: `Failed to delete file: ${err.message}` });
          } else {
            this.logger.info(`File deleted: ${data.path}`);
            callback({
              status: 'OK',
            });
          }
        });
      }
    } catch (error: any) {
      this.logger.error(`Error in delete function: ${error.message}`);
      callback({ status: 'ERROR', error: error.message });
    }
  }

  public async list(data: { path: string }) {
    this.logger.info(`List directory request: ${JSON.stringify(data)}`);

    try {
      const sftp = await this.initializeSFTP(); // Ensure SFTP is ready

      if (!data || !data.path) {
        this.socket.emit(SsmEvents.SFTP.READ_DIR, { status: 'ERROR', message: 'Invalid path' });
        return;
      }

      // Perform readdir operation
      sftp.readdir(data.path, (err, list) => {
        if (err) {
          this.logger.error(`Error reading directory: ${err.message}`);
          this.socket.emit(SsmEvents.SFTP.READ_DIR, { status: 'ERROR', message: err.message });
          return;
        }

        const fileList = list.map(
          (file) =>
            ({
              filename: file.filename,
              longname: file.longname,
              isFile: file.attrs.isFile(),
              isDir: file.attrs.isDirectory(),
              isBlockDevice: file.attrs.isBlockDevice(),
              isFIFO: file.attrs.isFIFO(),
              isSocket: file.attrs.isSocket(),
              isSymbolicLink: file.attrs.isSymbolicLink(),
              isCharacterDevice: file.attrs.isCharacterDevice(),
              size: file.attrs.size,
              mode: file.attrs.mode,
              gid: file.attrs.gid,
              uid: file.attrs.uid,
            }) as API.SFTPContent,
        );

        this.logger.info(`Directory content: ${JSON.stringify(fileList)}`);
        this.socket.emit(SsmEvents.SFTP.READ_DIR, {
          status: 'OK',
          path: data.path,
          list: fileList,
        });
      });
    } catch (error: any) {
      this.logger.error(`Error in list function: ${error.message}`);
      this.socket.emit(SsmEvents.SFTP.READ_DIR, { status: 'ERROR', message: error.message });
    }
  }

  // Method to chmod (change file/directory permissions)
  public async chmod(data: { path: string; mode: number }, callback: CallbackType) {
    this.logger.info(`CHMOD request: ${JSON.stringify(data)}`);

    try {
      const sftp = await this.initializeSFTP();

      if (!data || !data.path || typeof data.mode !== 'number') {
        callback({ status: 'ERROR', error: 'Missing path or mode (e.g., 0o755)' });
        return;
      }

      sftp.chmod(data.path, data.mode, (err) => {
        if (err) {
          this.logger.error(`Error changing permissions: ${err.message}`);
          callback({ status: 'ERROR', error: err.message });
        } else {
          this.logger.info(`Permissions changed for ${data.path} to ${data.mode.toString(8)}`);
          callback({ status: 'OK' });
        }
      });
    } catch (error: any) {
      this.logger.error(`Error in chmod function: ${error.message}`);
      callback({ status: 'ERROR', error: error.message });
    }
  }
  // Method to create a directory
  public async mkdir(data: { path: string }, callback: CallbackType) {
    // Log mkdir request
    this.logger.info(`Mkdir request: ${JSON.stringify(data)}`);

    try {
      // Initialize SFTP connection if not already
      const sftp = await this.initializeSFTP();

      // Validate input
      if (!data || !data.path) {
        const errorMessage = 'Invalid directory path';
        this.logger.error(errorMessage);
        callback({ status: 'ERROR', error: errorMessage });
        return;
      }

      // Invoke sftp.mkdir and handle the callback
      sftp.mkdir(data.path, (err) => {
        if (err) {
          this.logger.error(err);
          const errorLog = `Error creating directory at '${data.path}': ${err.message}`;
          this.logger.error(errorLog);
          // Execute the callback with ERROR status
          callback({ status: 'ERROR', error: err.message });
        } else {
          const successLog = `Directory successfully created at '${data.path}'`;
          this.logger.info(successLog);
          // Execute the callback with OK status
          callback({ status: 'OK' });
        }
      });
    } catch (error: any) {
      const unexpectedError = `Unexpected error in mkdir function: ${error.message}`;
      this.logger.error(unexpectedError);
      // Execute callback with ERROR status in case of unexpected errors
      callback({ status: 'ERROR', error: error.message });
    }
  }

  // Method to rename a file or directory
  public async rename(data: { oldPath: string; newPath: string }, callback: CallbackType) {
    this.logger.info(`Rename request: ${JSON.stringify(data)}`);

    try {
      const sftp = await this.initializeSFTP();

      if (!data || !data.oldPath || !data.newPath) {
        callback({ status: 'ERROR', error: 'Missing oldPath or newPath' });
        return;
      }

      sftp.rename(data.oldPath, data.newPath, (err) => {
        if (err) {
          this.logger.error(`Error renaming: ${err.message}`);
          callback({ status: 'ERROR', error: err.message });
        } else {
          this.logger.info(`Renamed ${data.oldPath} to ${data.newPath}`);
          callback({
            status: 'OK',
          });
        }
      });
    } catch (error: any) {
      this.logger.error(`Error in rename function: ${error.message}`);
      callback({ status: 'ERROR', error: error.message });
    }
  }

  // Method to download a file
  public async download(data: { path: string }) {
    this.logger.info(`Download request: ${JSON.stringify(data)}`);

    try {
      const sftp = await this.initializeSFTP();

      if (!data || !data.path) {
        this.socket.emit(SsmEvents.SFTP.DOWNLOAD, {
          status: 'ERROR',
          message: 'Missing remotePath',
        });
        return;
      }
      const localRootPath = `/tmp/${v4()}`;
      FileSystemManager.createDirectory(localRootPath);
      const localPath = `${localRootPath}/${data.path.split('/').pop()}`;
      sftp.fastGet(data.path, localPath, (err) => {
        if (err) {
          this.logger.error(`Error downloading file: ${err.message}`);
          this.socket.emit(SsmEvents.SFTP.DOWNLOAD, { status: 'ERROR', message: err.message });
        } else {
          this.logger.info(`File downloaded from ${data.path} to ${localPath}`);
          sendFile(this.socket, localRootPath, data.path.split('/').pop() as string);
        }
      });
    } catch (error: any) {
      this.logger.error(`Error in download function: ${error.message}`);
      this.socket.emit(SsmEvents.SFTP.DOWNLOAD, {
        status: 'ERROR',
        message: error.message,
      });
    }
  }

  private handleEnd() {
    this.logger.error('Connection ended by host');
    this.cleanup();
    this.socket.disconnect(true);
  }

  private handleClose() {
    this.logger.error('Connection closed');
    this.cleanup();
    this.socket.disconnect(true);
  }

  private cleanup() {
    try {
      if (this.sftp) {
        this.logger.info('Cleaning up SFTP session...');
        this.sftp.end();
        this.sftp = null; // Reset cached SFTP instance
      }
    } catch (error: any) {
      this.logger.error(`Error during cleanup: ${error.message}`);
    }
  }

  private handleKeyboardInteractive(
    _name: string,
    _instructions: string,
    _instructionsLang: string,
    _prompts: any,
    finish: (responses: string[]) => void,
  ) {
    this.logger.info('CONN keyboard-interactive');
    this.logger.info(`${_name} ${_instructions} ${_instructionsLang}`);
    this.logger.info(_prompts);
    // TODO: to handle
    // finish([socket.request.session.userpassword]);
  }

  private handleConnectionError(err: any) {
    let msg = util.inspect(err);
    if (err?.level === 'client-authentication') {
      msg = `Authentication failure from=${this.socket.handshake.address}`;
    }
    if (err?.code === 'ENOTFOUND') {
      msg = `Host not found: ${err.hostname}`;
    }
    if (err?.level === 'client-timeout') {
      msg = `Connection Timeout`;
    }
    this.socket.emit(SsmEvents.SFTP.STATUS, {
      status: 'DISCONNECT',
      message: msg,
    });
    this.logger.error(msg);
  }
}
