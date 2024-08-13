import * as util from 'node:util';
import pino from 'pino';
import { Socket } from 'socket.io';
import _logger from '../../logger';
import SSHConnectionInstance from './SSHConnectionInstance';

class SSHTerminalInstance {
  private sshConnectionInstance: SSHConnectionInstance;
  private socket: Socket;
  private logger: pino.Logger<never>;

  constructor(deviceUuid: string, socket: Socket) {
    this.sshConnectionInstance = new SSHConnectionInstance(deviceUuid);
    this.socket = socket;
    this.logger = _logger.child(
      {
        module: `SSHTerminalInstance`,
      },
      { msgPrefix: '[SSH_TERMINAL_INSTANCE] - ' },
    );
  }

  async start() {
    await this.sshConnectionInstance.connect();
  }

  private bind() {
    this.sshConnectionInstance.ssh.on('banner', (data) => {
      // need to convert to cr/lf for proper formatting
      this.socket.emit('ssh:data', data.replace(/\r?\n/g, '\r\n').toString());
    });

    this.sshConnectionInstance.ssh.on('ready', () => {
      this.socket.emit('status', 'SSH CONNECTION ESTABLISHED');
      const { term, cols, rows } = socket.request.session.ssh;
      this.sshConnectionInstance.ssh.shell({ term, cols, rows }, (err, stream) => {
        if (err) {
          this.logger.error(err);
          this.sshConnectionInstance.ssh.end();
          this.socket.disconnect(true);
          return;
        }
        this.socket.once('disconnect', (reason) => {
          this.logger.warn(`CLIENT SOCKET DISCONNECT: ${util.inspect(reason)}`);
          this.sshConnectionInstance.ssh.end();
          this.socket.request.session.destroy();
        });
        this.socket.on('error', (errMsg) => {
          this.logger.error(errMsg);
          this.sshConnectionInstance.ssh.end();
          this.socket.disconnect(true);
        });

        this.socket.on('resize', (data) => {
          stream.setWindow(data.rows, data.cols);
          this.logger.info(`SOCKET RESIZE: ${JSON.stringify([data.rows, data.cols])}`);
        });
        this.socket.on('data', (data) => {
          stream.write(data);
        });
        stream.on('data', (data) => {
          this.socket.emit('data', data.toString('utf-8'));
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

    this.sshConnectionInstance.ssh.on('end', (err) => {
      if (err) {
        this.logger.error(err);
      }
      this.logger.error('CONN END BY HOST');
      this.socket.disconnect(true);
    });

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
        finish([socket.request.session.userpassword]);
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
    this.logger.error(msg);
  }
}
