import * as util from 'node:util';
import { Logger } from 'pino';
import { Socket } from 'socket.io';
import { ClientChannel, PseudoTtyOptions } from 'ssh2';
import { SsmEvents } from 'ssm-shared-lib';
import _logger from '../../logger';
import SSHConnectionInstance from './SSHConnectionInstance';

export default class SSHTerminalInstance {
  private sshConnectionInstance: SSHConnectionInstance;
  private socket: Socket;
  private logger: Logger;
  private readonly ttyOptions: PseudoTtyOptions;

  constructor(deviceUuid: string, socket: Socket, ttyOptions: PseudoTtyOptions) {
    this.sshConnectionInstance = new SSHConnectionInstance(deviceUuid);
    this.socket = socket;
    this.logger = _logger.child(
      { module: 'SSHTerminalInstance', moduleId: deviceUuid },
      { msgPrefix: '[SSH_TERMINAL_INSTANCE] - ' },
    );
    this.ttyOptions = ttyOptions;
  }

  async start() {
    this.logger.info(`Starting SSHTerminalInstance...`);
    this.bind();
    this.logger.debug('Await connect...');
    await this.sshConnectionInstance.connect();
  }

  async stop() {
    try {
      this.sshConnectionInstance.ssh.end();
    } catch (error) {
      this.logger.error(error);
    }
  }

  private bind() {
    this.logger.debug('bind');
    this.sshConnectionInstance.ssh.on('banner', this.handleBanner.bind(this));
    this.sshConnectionInstance.ssh.on('ready', this.handleReady.bind(this));
    this.sshConnectionInstance.ssh.on('end', this.handleEnd.bind(this));
    this.sshConnectionInstance.ssh.on('close', this.handleClose.bind(this));
    this.sshConnectionInstance.ssh.on('error', this.handleConnectionError.bind(this));

    this.sshConnectionInstance.ssh.on(
      'keyboard-interactive',
      this.handleKeyboardInteractive.bind(this),
    );
  }

  private handleBanner(data: string) {
    this.socket.emit(SsmEvents.SSH.NEW_DATA, data.replace(/\r?\n/g, '\r\n'));
  }

  private handleReady() {
    this.logger.info('SSH connection established');
    this.socket.emit(SsmEvents.SSH.STATUS, { status: 'OK', message: 'SSH CONNECTION ESTABLISHED' });
    this.socket.emit(
      SsmEvents.SSH.NEW_DATA,
      `✅ Connected to device: ${this.sshConnectionInstance.deviceUuid} on ${this.sshConnectionInstance.host}!\r\n`,
    );

    this.sshConnectionInstance.ssh.shell(
      this.ttyOptions,
      (err: Error | undefined, stream: ClientChannel) => {
        if (err) {
          this.logger.error(err);
          this.sshConnectionInstance.ssh.end();
          this.socket.disconnect(true);
          return;
        }

        this.configureStream(stream);
      },
    );
  }

  private configureStream(stream: ClientChannel) {
    this.socket.once(SsmEvents.Common.DISCONNECT, this.handleSocketDisconnect.bind(this));
    this.socket.on(SsmEvents.Common.ERROR, this.handleSocketError.bind(this));
    this.socket.on(SsmEvents.SSH.SCREEN_RESIZE, this.handleResize.bind(this, stream));
    this.socket.on(SsmEvents.SSH.NEW_DATA, this.handleSocketData.bind(this, stream));

    stream.on('data', this.handleStreamData.bind(this));
    stream.on('close', this.handleStreamClose.bind(this));
    stream.stderr.on('data', (data: Buffer) => this.logger.error(`STDERR: ${data}`));
  }

  private handleSocketDisconnect(reason: any) {
    this.logger.warn(`Client socket disconnect: ${util.inspect(reason)}`);
    this.socket.emit(SsmEvents.SSH.STATUS, {
      status: 'DISCONNECT',
      message: 'SSH CONNECTION DISCONNECTED',
    });
    this.sshConnectionInstance.ssh.end();
  }

  private handleSocketError(err: Error) {
    this.logger.error(err);
    this.sshConnectionInstance.ssh.end();
    this.socket.disconnect(true);
  }

  private handleResize(stream: ClientChannel, data: { rows: number; cols: number }) {
    this.ttyOptions.rows = data.rows;
    this.ttyOptions.cols = data.cols;
    stream.setWindow(
      this.ttyOptions.rows,
      this.ttyOptions.cols,
      this.ttyOptions.height as number,
      this.ttyOptions.width as number,
    );
    this.logger.info(`Socket resize: ${JSON.stringify([data.rows, data.cols])}`);
  }

  private handleSocketData(stream: ClientChannel, data: string) {
    this.logger.debug(`Write on stream: ${data}`);
    stream.write(data);
  }

  private handleStreamData(data: Buffer) {
    this.logger.debug(`Received on stream: ${data.toString('utf-8')}`);
    this.socket.emit(SsmEvents.SSH.NEW_DATA, data.toString('utf-8'));
  }

  private handleStreamClose(code: number | null, signal: string | null) {
    this.logger.warn(`Stream closed: ${util.inspect([code, signal])}`);
    if (code !== 0 && code !== null) {
      this.logger.error('Stream closed', util.inspect({ message: [code, signal] }));
    }
    this.socket.disconnect(true);
    this.sshConnectionInstance.ssh.end();
  }

  private handleEnd() {
    this.logger.error('Connection ended by host');
    this.socket.disconnect(true);
  }

  private handleClose() {
    this.logger.error('Connection closed');
    this.socket.disconnect(true);
  }

  private handleKeyboardInteractive(
    _name: string,
    _instructions: string,
    _instructionsLang: string,
    _prompts: any,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    this.socket.emit(SsmEvents.SSH.STATUS, {
      status: 'DISCONNECT',
      message: msg,
    });
    this.logger.error(msg);
  }
}
