import { SSHCredentialsAdapter } from '@infrastructure/adapters/ssh/ssh-credentials.adapter';
import { tryResolveHost } from '@infrastructure/common/dns/dns.util';
import { IDeviceAuthService, IDevicesService } from '@modules/devices';
import Component from '@modules/remote-system-information/application/services/components/core/base-component';
import { DEVICE_WENT_ONLINE_EVENT } from '@modules/statistics';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Client, ConnectConfig } from 'ssh2';
import { SsmStatus } from 'ssm-shared-lib';
import { generateSudoCommand } from '../../domain/helpers/sudo';
import { DebugCallback, RemoteExecOptions } from '../../domain/types/remote-executor.types';

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
  public debugCallback?: DebugCallback;
  constructor(
    protected readonly devicesService: IDevicesService,
    protected readonly deviceAuthService: IDeviceAuthService,
    protected readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  /**
   * Initialize the SSH connection to a device
   */
  async init(): Promise<void> {
    const device = await this.devicesService.findOneByUuid(this.configuration.deviceUuid);
    if (!device) {
      throw new Error('Device not found');
    }

    const deviceAuth = await this.deviceAuthService.findDeviceAuthByDevice(device);
    if (!deviceAuth) {
      throw new Error('DeviceAuth not found');
    }

    const sshHelper = new SSHCredentialsAdapter();
    this.connectionConfig = await sshHelper.getSShConnection(device, deviceAuth);
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

      const connectTimeout = setTimeout(() => {
        this.logger.error('SSH Connection attempt timed out.');
        conn.end(); // Attempt to clean up the connection object
        reject(new Error('SSH Connection attempt timed out.'));
      }, this.connectionConfig.readyTimeout || 30000); // Use configured timeout or default to 30s

      // Explicitly cast to Client to help TS resolve overloads
      (conn as Client)
        .on('ready', async () => {
          clearTimeout(connectTimeout); // Clear the timeout timer on successful connection
          this.logger.info('SSH Connection established');
          retryAttempt = 0;
          this.startKeepAlive();
          resolve(); // Connection successful
        })
        .on('error', (err) => {
          clearTimeout(connectTimeout); // Clear timeout on error as well
          this.logger.error(`SSH Connection error: ${err?.message}`);
          // Ensure cleanup happens before potentially triggering reconnect
          if (this.sshClient === conn) {
            this.sshClient = null; // Prevent further operations on this failed client
          }
          conn.end(); // Explicitly end the connection on error
          void this.reconnect(retryAttempt); // Attempt reconnection on error
          reject(err);
        })
        .on('end', () => {
          clearTimeout(connectTimeout);
          this.logger.warn('SSH Connection ended');
          if (this.sshClient === conn) {
            this.sshClient = null;
          }
        })
        .on('close', () => {
          clearTimeout(connectTimeout);
          this.logger.warn(`SSH Connection closed`);
          if (this.sshClient === conn) {
            this.sshClient = null;
          }
          // Optional: Trigger reconnect on close if it wasn't due to an explicit 'end' call
          // if (!conn.writable) { // Check if closure was unexpected
          //   void this.reconnect(retryAttempt);
          // }
        });

      // Connect using the provided configuration
      (async () => {
        try {
          const host = await tryResolveHost(this.connectionConfig.host as string);
          this.logger.debug(
            `Attempting SSH connection to ${host}:${this.connectionConfig.port || 22}...`,
          );
          (conn as Client).connect({
            ...this.connectionConfig,
            host,
          });
        } catch (error: any) {
          clearTimeout(connectTimeout); // Clear timeout on immediate connect error
          this.logger.error(`Initial SSH connection setup failed: ${error.message}`, error.stack);
          // Ensure cleanup
          if (this.sshClient === conn) {
            this.sshClient = null;
          }
          try {
            conn.end();
          } catch {
            /* Ignore errors during cleanup */
          }
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
            // Existing retry logic from user's file:
            this.reconnectPromise = null; // Clear current promise before retrying
            this.reconnect(retryAttempt + 1)
              .then(resolve)
              .catch(reject);
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
          // Initial check: If sshClient is null, attempt to reconnect.
          if (!this.sshClient) {
            this.logger.warn(
              `SSH client is null before command "${command}". Attempting initial reconnect.`,
            );
            await this.reconnect(); // This has its own retry logic.
            if (!this.sshClient) {
              const errMsg = `SSH client is still null after initial reconnect for command "${command}". Failing.`;
              this.logger.error(errMsg);
              if (this.debugCallback) {
                this.debugCallback(command, errMsg, false);
              }
              return reject(new Error(errMsg)); // processQueue will handle this Error object.
            }
            this.logger.info(`SSH client reconnected. Proceeding with command "${command}".`);
          }

          const maxBuffer = options?.maxBuffer ?? Infinity;
          const encoding: BufferEncoding = options?.encoding ?? 'utf8';
          let finalCommand = command;

          if (options?.elevatePrivilege) {
            try {
              const sudoCmd = await generateSudoCommand(
                this.configuration.deviceUuid,
                this.deviceAuthService,
              );
              finalCommand = sudoCmd.replace('%command%', command);
            } catch (error) {
              const typedError = error instanceof Error ? error : new Error(String(error));
              this.logger.error(
                `Failed to generate sudo command for "${command}": ${typedError.message}`,
                typedError.stack,
              );
              if (this.debugCallback) {
                this.debugCallback(command, `Sudo generation error: ${typedError.message}`, false);
              }
              return reject(new Error(`Failed to generate sudo command: ${typedError.message}`));
            }
          }

          if (this.debugCallback) {
            this.debugCallback(finalCommand, 'Preparing to execute', true);
          }
          this.logger.debug(`Preparing to run command: "${finalCommand}"`);

          let attempts = 0;
          const maxAttempts = 2; // Original attempt + 1 retry

          const executeOrRetry = () => {
            // These variables are scoped per attempt to ensure clean state for retries.
            let result = '';
            let errorOutput = '';
            let resultSize = 0;
            let exitCode: number | null = null;
            let exitSignal: any = null;
            let isResolved = false;

            // Check client status before each execution attempt inside executeOrRetry.
            if (!this.sshClient) {
              const errMsg = `SSH client became null before exec attempt ${attempts + 1} for "${finalCommand}".`;
              this.logger.error(errMsg);
              if (this.debugCallback) {
                this.debugCallback(finalCommand, errMsg, false);
              }
              // Reject with an Error object; processQueue will normalize it.
              if (!isResolved) {
                // Ensure reject is only called once
                isResolved = true;
                reject(new Error(errMsg));
              }
              return;
            }

            this.logger.debug(
              `Executing command (attempt ${attempts + 1}/${maxAttempts}): "${finalCommand}"`,
            );

            this.sshClient.exec(finalCommand, async (err, stream) => {
              if (isResolved && err) {
                this.logger.warn(
                  `Ignoring exec error for "${finalCommand}" as command was already handled: ${err.message}`,
                );
                return;
              }
              if (isResolved) {
                return;
              } // Already handled (resolved or rejected)

              if (err) {
                // err here is from sshClient.exec callback, typically Error type
                this.logger.warn(
                  `SSH exec callback error for "${finalCommand}" (attempt ${attempts + 1}/${maxAttempts}): ${err.message}`,
                );
                attempts++;
                const isRetryableSshError =
                  err.message.includes('Unable to exec') ||
                  err.message.includes('Not connected') ||
                  err.message.includes('Channel open failed') ||
                  err.message.includes('No response from server');

                if (isRetryableSshError && attempts < maxAttempts) {
                  this.logger.info(
                    `Attempting reconnect and retry for "${finalCommand}" (next attempt: ${attempts + 1}).`,
                  );
                  if (this.sshClient) {
                    try {
                      this.sshClient.end();
                    } catch (e: any) {
                      this.logger.warn(
                        `Error ending old client during retry prep for "${finalCommand}": ${e.message}`,
                      );
                    }
                  }
                  this.sshClient = null; // Nullify to force reconnect to establish a new client

                  try {
                    await this.reconnect(); // Attempt to re-establish the connection
                    if (this.sshClient) {
                      this.logger.info(
                        `Reconnect successful. Retrying exec for "${finalCommand}".`,
                      );
                      executeOrRetry(); // Perform the retry
                    } else {
                      const reconFailMsg = `Reconnect failed after exec error. Cannot retry command "${finalCommand}".`;
                      this.logger.error(reconFailMsg);
                      if (this.debugCallback) {
                        this.debugCallback(finalCommand, reconFailMsg, false);
                      }
                      if (!isResolved) {
                        isResolved = true;
                        reject({ err: new Error(reconFailMsg), result: '' });
                      }
                    }
                  } catch (reconnectError: any) {
                    const typedReconnectError =
                      reconnectError instanceof Error
                        ? reconnectError
                        : new Error(String(reconnectError));
                    const reconErrMsg = `Exception during reconnect attempt for "${finalCommand}": ${typedReconnectError.message}`;
                    this.logger.error(reconErrMsg, typedReconnectError.stack);
                    if (this.debugCallback) {
                      this.debugCallback(finalCommand, reconErrMsg, false);
                    }
                    if (!isResolved) {
                      isResolved = true;
                      reject({ err: typedReconnectError, result: '' });
                    }
                  }
                } else {
                  const finalErrMsg = `SSH exec failed permanently for "${finalCommand}" after ${attempts} attempt(s): ${err.message}`;
                  this.logger.error(finalErrMsg);
                  if (this.debugCallback) {
                    this.debugCallback(finalCommand, finalErrMsg, false);
                  }
                  if (!isResolved) {
                    isResolved = true;
                    // Explicitly create payload for reject to help linter/parser
                    const rejectionPayload = { err: err, result: result };
                    reject(rejectionPayload);
                  }
                }
                return;
              }

              // If exec call itself was successful (no immediate err), set up stream handlers:
              const resolveOrReject = () => {
                if (isResolved) {
                  return;
                }
                isResolved = true;
                if (exitCode === 0) {
                  this.logger.debug(
                    `Command "${finalCommand}" completed successfully (exit code 0).`,
                  );
                  if (this.debugCallback) {
                    this.debugCallback(finalCommand, result.trim(), true);
                  }
                  resolve(result.trim());
                } else {
                  const errorMsg = `Command "${finalCommand}" failed. Exit code: ${exitCode}, signal: ${exitSignal}, stderr: "${errorOutput.trim()}"`;
                  const cmdError = new Error(errorMsg);
                  this.logger.debug(errorMsg);
                  if (this.debugCallback) {
                    this.debugCallback(finalCommand, errorOutput.trim() || result.trim(), false);
                  }
                  reject({ err: cmdError, result: result.trim() });
                }
              };

              stream
                .on('data', (data: Buffer) => {
                  if (isResolved) {
                    return;
                  }
                  result += data.toString(encoding);
                  resultSize += data.length;
                  if (resultSize > maxBuffer) {
                    const bufferErrMsg = `Command output for "${finalCommand}" exceeded maxBuffer size of ${maxBuffer} bytes.`;
                    this.logger.error(bufferErrMsg);
                    stream.removeAllListeners();
                    if (!isResolved) {
                      isResolved = true;
                      reject({ err: new Error(bufferErrMsg), result });
                    }
                  }
                })
                .on('exit', (code: number | null, signalName: string | null) => {
                  if (isResolved) {
                    return;
                  }
                  exitCode = code;
                  exitSignal = signalName;
                  this.logger.debug(
                    `Command "${finalCommand}" stream: exit event (code: ${code}, signal: ${signalName}). Awaiting 'close'.`,
                  );
                })
                .on('close', () => {
                  if (isResolved) {
                    return;
                  }
                  this.logger.debug(`Command "${finalCommand}" stream: close event. Finalizing.`);
                  resolveOrReject();
                })
                .on('error', (streamErr: Error) => {
                  // streamErr is Error type
                  if (isResolved) {
                    return;
                  }
                  isResolved = true;
                  const streamErrMsg = `Stream error during command "${finalCommand}": ${streamErr.message}`;
                  this.logger.error(streamErrMsg, streamErr.stack);
                  if (this.debugCallback) {
                    this.debugCallback(finalCommand, streamErrMsg, false);
                  }
                  reject({ err: streamErr, result });
                })
                .stderr.on('data', (data: Buffer) => {
                  if (isResolved) {
                    return;
                  }
                  errorOutput += data.toString(encoding);
                });
            });
          };

          executeOrRetry(); // Initial invocation of the execution logic
        } catch (outerError: any) {
          // Catches errors from initial client checks, sudo generation, or other synchronous setup issues.
          const typedOuterError =
            outerError instanceof Error ? outerError : new Error(String(outerError));
          const outerErrMsg = `Critical error in runCommand setup for "${command}": ${typedOuterError.message}`;
          this.logger.error(outerErrMsg, typedOuterError.stack);
          if (this.debugCallback) {
            this.debugCallback(command, outerErrMsg, false);
          }
          reject(typedOuterError); // processQueue will handle this Error object.
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
      // Execute the command with debug callback if provided
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
      // Push the command into the queue with debug callback if provided
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
          const device = await this.devicesService.findOneByUuid(this.configuration.deviceUuid);
          if (device && device.status !== SsmStatus.DeviceStatus.ONLINE) {
            device.status = SsmStatus.DeviceStatus.ONLINE;
            this.eventEmitter.emit(DEVICE_WENT_ONLINE_EVENT, device.uuid);
            await this.devicesService.update(device);
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
