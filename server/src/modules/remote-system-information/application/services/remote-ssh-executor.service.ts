import { Client, ConnectConfig } from 'ssh2';
import { SsmStatus } from 'ssm-shared-lib';
import Component from '@modules/remote-system-information/application/services/components/core/base-component';
import { IDeviceAuthRepository } from '@modules/devices';
import { IDeviceRepository } from '@modules/devices';
import SSHCredentialsHelper from '../../../../helpers/ssh/SSHCredentialsHelper';
import { RemoteExecOptions } from '../../domain/types/remote-executor.types';
import { tryResolveHost } from '../../../../helpers/dns/dns-helper';
import { generateSudoCommand } from '../../domain/helpers/sudo';

/**
 * Class representing an SSH executor for a specific device
 */
export abstract class SSHExecutor extends Component {
  private sshClient: Client | null = null;
  private connectionConfig!: ConnectConfig;
  private keepAliveInterval: NodeJS.Timeout | undefined;
  private reconnectDelay = 5000; // Delay before retrying connection in case of failure
  private isExecuting: boolean = false;
  private reconnectPromise: Promise<void> | null = null;
  private commandQueue: {
    command: string;
    options: RemoteExecOptions | undefined;
    resolve: (result: string) => void;
    reject: ({ err, result }: { err: Error; result?: string }) => void;
  }[] = []; // Queue to store pending commands

  constructor(
    protected readonly deviceRepository: IDeviceRepository,
    protected readonly deviceAuthRepository: IDeviceAuthRepository,
  ) {
    super();
  }

  /**
   * Initialize the SSH connection to a device
   */
  async init(): Promise<void> {
    const device = await this.deviceRepository.findOneByUuid(this.configuration.deviceUuid);
    if (!device) {
      throw new Error('Device not found');
    }

    const deviceAuth = await this.deviceAuthRepository.findOneByDevice(device);
    if (!deviceAuth) {
      throw new Error('DeviceAuth not found');
    }

    this.connectionConfig = await SSHCredentialsHelper.getSShConnection(device, deviceAuth);
    this.logger.info('Initializing SSH Executor...');

    try {
      await this.connect(); // Establish initial connection
    } catch (error: any) {
      this.logger.error('Failed to initialize SSH connection', error.stack);
      throw error;
    }
  }

  /**
   * Establish an SSH connection
   */
  private connect(retryAttempt = 0): Promise<void> {
    return new Promise((resolve, reject) => {
      const conn = new Client();
      this.sshClient = conn;
      conn
        .on('ready', async () => {
          this.logger.info('SSH Connection established');
          retryAttempt = 0;
          this.startKeepAlive();
          resolve(); // Connection successful
        })
        .on('error', (err) => {
          this.logger.error(`SSH Connection error: ${err?.message}`);
          void this.reconnect(retryAttempt); // Attempt reconnection on error
          reject(err);
        })
        .on('end', () => {
          this.logger.warn('SSH Connection ended');
        })
        .on('close', () => {
          this.logger.warn('SSH Connection closed');
        });

      // Connect using the provided configuration
      (async () => {
        try {
          conn.connect({
            ...this.connectionConfig,
            host: await tryResolveHost(this.connectionConfig.host as string),
          });
        } catch (error: any) {
          this.logger.error(`Connection setup failed: ${error.message}`);
          reject(error); // Propagate the error to the Promise
        }
      })();
    });
  }

  /**
   * Test an SSH connection
   */
  public static async testConnection(config: ConnectConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const conn = new Client();
      conn
        .on('ready', () => {
          conn.exec('echo', (err, stream) => {
            if (err) {
              conn.end(); // Close the connection after the test fails
              reject(err);
            }
            stream.on('exit', (code: number, signal: any) => {
              if (code === 0) {
                conn.end(); // Close the connection after the test succeeds
                resolve();
              } else {
                conn.end(); // Close the connection after the test fails
                reject(new Error(`Connection failed with code ${code}, signal: ${signal}`));
              }
            });
          });
        })
        .on('error', (err) => {
          reject(err); // Return the error if connection fails
        });

      (async () => {
        conn.connect({
          ...config,
          host: await tryResolveHost(config.host as string),
        });
      })();
    });
  }

  /**
   * Attempt to reconnect to the SSH server
   */
  private async reconnect(retryAttempt = 0): Promise<void> {
    // If already reconnecting, return the existing promise
    if (this.reconnectPromise) {
      return this.reconnectPromise;
    }

    this.logger.info(`Reconnecting in ${this.reconnectDelay / 1000} seconds...`);

    // Create and store the reconnection promise
    this.reconnectPromise = new Promise<void>((resolve, reject) => {
      setTimeout(async () => {
        try {
          await this.connect(retryAttempt + 1);
          this.reconnectPromise = null;
          resolve();
        } catch (err) {
          this.logger.error(`Reconnection attempt failed (${retryAttempt}/3)`);
          // Only reject if we've hit max retries, otherwise try again
          if (retryAttempt >= 3) {
            this.reconnectPromise = null;
            reject(err);
          } else {
            try {
              await this.reconnect(retryAttempt + 1);
              resolve();
            } catch (error) {
              reject(error);
            }
          }
        }
      }, this.reconnectDelay);
    });

    return this.reconnectPromise;
  }

  /**
   * Execute a command on the remote device
   */
  private runCommand(command: string, options?: RemoteExecOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      process.nextTick(async () => {
        try {
          // If we're not connected, wait for reconnection
          if (!this.sshClient) {
            await this.reconnect();
            if (!this.sshClient) {
              return reject(new Error('SSH Client not connected'));
            }
          }

          const maxBuffer = options?.maxBuffer ?? Infinity;
          const encoding: BufferEncoding = options?.encoding ?? 'utf8';

          // Get the sudo command and prepend it to the actual command if needed
          let finalCommand = command;
          if (options?.elevatePrivilege) {
            try {
              const sudoCmd = await generateSudoCommand(
                this.configuration.deviceUuid,
                this.deviceAuthRepository,
              );
              finalCommand = sudoCmd.replace('%command%', command);
            } catch (error) {
              this.logger.error('Failed to generate sudo command:', error);
              return reject(new Error('Failed to generate sudo command'));
            }
          }

          this.logger.debug(`Running command: ${finalCommand}`);

          let result = '';
          let errorOutput = '';
          let resultSize = 0;
          let exitCode: number | null = null; // Exit code from the process
          let exitSignal: any = null; // Exit signal
          let isResolved = false; // To ensure no double resolve/reject

          try {
            this.sshClient.exec(finalCommand, (err, stream) => {
              if (err) {
                return reject({ err, result: '' });
              }

              const resolveOrReject = () => {
                if (isResolved) {
                  return;
                } // Prevent double resolution/rejection
                isResolved = true;

                if (exitCode === 0) {
                  this.logger.debug(`Command executed successfully: ${finalCommand}`);
                  resolve(result.trim());
                } else {
                  const error = new Error(
                    `Command "${finalCommand}" failed with code ${exitCode}, signal: ${exitSignal}, stderr: "${errorOutput.trim()}"`,
                  );
                  this.logger.debug(error.message);
                  reject({ err: error, result: result.trim() });
                }
              };

              stream
                .on('data', (data: any) => {
                  result += data.toString(encoding);
                  resultSize += Buffer.byteLength(data, encoding);

                  // Check if output exceeds max buffer
                  if (resultSize > maxBuffer) {
                    this.logger.error(
                      `Command output exceeded maxBuffer size of ${maxBuffer} bytes`,
                    );
                    stream.removeAllListeners();
                    if (!isResolved) {
                      isResolved = true;
                      return reject({
                        err: new Error(
                          `Command output exceeded maxBuffer size of ${maxBuffer} bytes`,
                        ),
                        result,
                      });
                    }
                  }
                })
                .on('exit', (code: number, signal: any) => {
                  exitCode = code;
                  exitSignal = signal;
                  this.logger.debug(
                    `Command "${finalCommand}" exited with code ${code} and signal ${signal}. Awaiting close event to finalize...`,
                  );
                })
                .on('close', () => {
                  this.logger.debug(`Command "${finalCommand}" stream closed. Finalizing...`);

                  if (exitCode === null) {
                    // If `exit` signal was not received before `close`
                    if (!isResolved) {
                      isResolved = true;
                      this.logger.warn(
                        `Command "${finalCommand}" closed without receiving an exit event. Assuming output is complete...`,
                      );
                      reject({
                        err: new Error(
                          'Stream closed without exit signal. Possible premature closure.',
                        ),
                        result: result.trim(),
                      });
                    }
                  } else {
                    // Resolve/reject based on exit code, now that close has occurred
                    resolveOrReject();
                  }
                })
                .on('error', (err) => {
                  // Immediate rejection if an error occurs
                  this.logger.error(`Error occurred during execution: ${err.message}`);
                  if (!isResolved) {
                    isResolved = true;
                    reject(err);
                  }
                })
                .stderr.on('data', (data: any) => {
                  errorOutput += data.toString(encoding);
                });
            });
          } catch (error: any) {
            this.logger.error(`Error occurred during execution: ${error.message}`);
            await this.reconnect();
          }
        } catch (error: any) {
          this.logger.error(`Error occurred during execution: ${error.message}`);
          reject(error);
        }
      });
    });
  }

  /**
   * Process the command queue
   */
  private async processQueue(): Promise<void> {
    // If already executing a command or the queue is empty, do nothing
    if (this.isExecuting || this.commandQueue.length === 0) {
      return;
    }

    // Mark execution as in progress
    this.isExecuting = true;

    // Get the next command from the queue
    const { command, options, resolve, reject } = this.commandQueue.shift()!;

    try {
      // Execute the command
      const result = await this.runCommand(command, options);
      resolve(result); // Resolve the promise if successful
    } catch (error: any) {
      // Reject if there is an error and also include the result if available
      if (reject && error && typeof error === 'object' && 'err' in error && 'result' in error) {
        reject({ err: error.err as Error, result: error.result as string }); // Pass both error and partial result
      } else {
        reject({ err: error.err, result: '' }); // Reject with the error directly if malformed
      }
    } finally {
      // Mark execution as complete and process the next command
      this.isExecuting = false;
      void this.processQueue();
    }
  }

  /**
   * Execute a command asynchronously
   */
  public execAsync = (command: string, options?: RemoteExecOptions): Promise<string> => {
    return new Promise((resolve, reject) => {
      const _reject = ({ err, result }: { err: Error; result?: string }) => {
        if (result) {
          resolve(result);
        } else {
          reject(err);
        }
      };
      // Push the command into the queue
      this.commandQueue.push({ command, options, resolve, reject: _reject });
      void this.processQueue(); // Process the queue if not currently executing
    });
  };

  /**
   * Execute a command with callback
   */
  public execWithCallback = (
    command: string,
    callback: (err: Error | null, result: string) => void,
    options?: RemoteExecOptions,
  ): void => {
    // Push the command into the queue
    this.commandQueue.push({
      command,
      options,
      resolve: (result: string) => callback(null, result), // Call the callback on success
      reject: (error: { err: Error; result?: string }) => {
        // On failure, pass both error and the stdout
        callback(error.err, error.result || '');
      },
    });

    void this.processQueue(); // Process the queue if not already running
  };

  /**
   * Keep the connection alive with periodic heartbeat commands
   */
  private startKeepAlive(): void {
    this.keepAliveInterval = setInterval(async () => {
      if (this.sshClient) {
        try {
          await this.execAsync('echo "keepalive"');
          this.logger.debug('Heartbeat sent');

          // Update device status if needed
          const device = await this.deviceRepository.findOneByUuid(this.configuration.deviceUuid);
          if (device && device.status !== SsmStatus.DeviceStatus.ONLINE) {
            device.status = SsmStatus.DeviceStatus.ONLINE;
            await this.deviceRepository.update(device);
          }
        } catch (err) {
          this.logger.error(err, 'Heartbeat failed');
          void this.reconnect(); // Attempt reconnection on failure
        }
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  /**
   * Close the SSH connection and clean up
   */
  public close(): void {
    this.logger.info('Shutting down SSH Executor...');
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
    }
    if (this.sshClient) {
      this.sshClient.end();
      this.sshClient = null;
    }
    this.logger.info('SSH Executor shut down');
  }
}
