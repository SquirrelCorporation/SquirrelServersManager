import * as util from 'node:util';
import pino from 'pino';
import { Socket } from 'socket.io';
import { PseudoTtyOptions } from 'ssh2';
import _logger from '../../logger';
import SSHConnectionInstance from './SSHConnectionInstance';

export default class SSHTerminalInstance {
  private sshConnectionInstance: SSHConnectionInstance;
  private socket: Socket;
  private logger: pino.Logger<never>;
  private readonly ttyOptions: PseudoTtyOptions;

  constructor(deviceUuid: string, socket: Socket, ttyOptions: PseudoTtyOptions) {
    this.sshConnectionInstance = new SSHConnectionInstance(deviceUuid);
    this.socket = socket;
    this.logger = _logger.child(
      {
        module: `SSHTerminalInstance`,
      },
      { msgPrefix: '[SSH_TERMINAL_INSTANCE] - ' },
    );
    this.ttyOptions = ttyOptions;
  }

  async start() {
    this.logger.info('Starting SSHTerminalInstance');
    this.bind();
    this.logger.info('await connect');
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
    this.logger.info('bind');

    this.sshConnectionInstance.ssh.on('banner', (data) => {
      // need to convert to cr/lf for proper formatting
      this.socket.emit('ssh:data', data.replace(/\r?\n/g, '\r\n').toString());
    });

    this.sshConnectionInstance.ssh.on('ready', () => {
      this.logger.info('SSH CONNECTION ESTABLISHED');
      this.socket.emit('ssh:status', { status: 'OK', message: 'SSH CONNECTION ESTABLISHED' });
      const { term, cols, rows } = this.ttyOptions;
      this.sshConnectionInstance.ssh.shell({ term, cols, rows }, (err, stream) => {
        if (err) {
          this.logger.error(err);
          this.sshConnectionInstance.ssh.end();
          this.socket.disconnect(true);
          return;
        }
        this.socket.once('disconnect', (reason) => {
          this.logger.warn(`CLIENT SOCKET DISCONNECT: ${util.inspect(reason)}`);
          this.socket.emit('ssh:status', {
            status: 'DISCONNECT',
            message: 'SSH CONNECTION DISCONNECTED',
          });
          this.sshConnectionInstance.ssh.end();
        });
        this.socket.on('error', (errMsg) => {
          this.logger.error(errMsg);
          this.sshConnectionInstance.ssh.end();
          this.socket.disconnect(true);
        });

        this.socket.on('ssh:resize', (data) => {
          this.ttyOptions.rows = data.rows;
          this.ttyOptions.cols = data.cols;
          stream.setWindow(
            this.ttyOptions.rows as number,
            this.ttyOptions.cols as number,
            this.ttyOptions.height as number,
            this.ttyOptions.width as number,
          );
          this.logger.info(`SOCKET RESIZE: ${JSON.stringify([data.rows, data.cols])}`);
        });
        this.socket.on('ssh:data', (data) => {
          this.logger.info(`write on stream: ${data}`);
          stream.write(data);
        });
        stream.on('data', (data) => {
          this.logger.info(`received on stream: ${data.toString('utf-8')}`);
          this.socket.emit('ssh:data', data.toString('utf-8'));
        });
        stream.on('close', (code, signal) => {
          this.logger.warn(`STREAM CLOSE: ${util.inspect([code, signal])}`);
          if (code !== 0 && typeof code !== 'undefined') {
            this.logger.error('STREAM CLOSE', util.inspect({ message: [code, signal] }));
          }
          this.socket.disconnect(true);
          this.sshConnectionInstance.ssh.end();
        });
        stream.stderr.on('data', (data) => {
          this.logger.error(`STDERR: ${data}`);
        });
      });
    });

    // @ts-expect-error TODO: to investigate
    this.sshConnectionInstance.ssh.on('end', (err) => {
      if (err) {
        this.logger.error(err);
      }
      this.logger.error('CONN END BY HOST');
      this.socket.disconnect(true);
    });
    // @ts-expect-error TODO: to investigate
    this.sshConnectionInstance.ssh.on('close', (err) => {
      if (err) {
        this.logger.error(err);
      }
      this.logger.error('CONN CLOSE');
      this.socket.disconnect(true);
    });
    this.sshConnectionInstance.ssh.on('error', (err) => this.handleConnectionError(err));

    this.sshConnectionInstance.ssh.on(
      'keyboard-interactive',
      (_name, _instructions, _instructionsLang, _prompts, finish) => {
        this.logger.info('CONN keyboard-interactive');
        // TODO: to handle
        //finish([socket.request.session.userpassword]);
      },
    );
  }

  handleConnectionError(err: any) {
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
    this.socket.emit('ssh:status', {
      status: 'DISCONNECT',
      message: msg,
    });
    this.logger.error(msg);
  }
}
