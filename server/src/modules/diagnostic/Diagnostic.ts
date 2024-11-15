import DockerModem from 'docker-modem';
import Dockerode from 'dockerode';
import { Client, ConnectConfig } from 'ssh2';
import { SsmDeviceDiagnostic } from 'ssm-shared-lib';
import EventManager from '../../core/events/EventManager';
import Events from '../../core/events/events';
import Device from '../../data/database/model/Device';
import DeviceAuth from '../../data/database/model/DeviceAuth';
import SSHCredentialsHelper from '../../helpers/ssh/SSHCredentialsHelper';
import PinoLogger from '../../logger';
import { getCustomAgent } from '../docker/core/CustomAgent';

const DIAGNOSTIC_SEQUENCE = Object.values(SsmDeviceDiagnostic.Checks);
const DISK_INFO_CMD = 'df -h';
const CPU_MEM_INFO_CMD = `top -bn1 | grep "Cpu(s)" && free -m`;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class Diagnostic extends EventManager {
  private childLogger = PinoLogger.child(
    { module: 'DeviceDiagnostic' },
    { msgPrefix: '[DEVICE_DIAGNOSTIC] - ' },
  );

  constructor() {
    super();
  }

  private checkSSHConnectivity = (options: ConnectConfig) => {
    return new Promise((resolve, reject) => {
      const conn = new Client();
      conn
        .on('ready', () => {
          this.childLogger.info(
            `checkSSHConnectivity - SSH connection established to ${options.host}`,
          );
          resolve(true);
          conn.end();
        })
        .on('error', (err) => {
          this.childLogger.error(
            `checkSSHConnectivity - SSH connection error to ${options.host}: ${err.message}`,
          );
          reject(err);
        })
        .connect(options);
    });
  };

  private checkDockerSocket = (
    options: Dockerode.DockerOptions & { modem?: any; _deviceUuid?: string },
  ) => {
    return new Promise((resolve, reject) => {
      const agent = getCustomAgent(this.childLogger, {
        ...options.sshOptions,
        timeout: 60000,
      });

      options.modem = new DockerModem({ agent });
      const dockerApi = new Dockerode({ ...options, timeout: 60000 });

      dockerApi.ping((err) => {
        if (err) {
          this.childLogger.error('checkDockerSocket - Docker API ping error:', err.message);
          reject(err);
        } else {
          this.childLogger.info('checkDockerSocket - Docker API ping successful');
          dockerApi.info((err, info) => {
            if (err) {
              this.childLogger.error('checkDockerSocket - Docker API info error:', err.message);
              reject(err);
            } else {
              this.childLogger.info('checkDockerSocket - Docker API info retrieved:', info);
              resolve(true);
            }
          });
        }
      });
    });
  };

  private checkDiskSpace = (options: ConnectConfig, path: string) => {
    return new Promise((resolve, reject) => {
      const conn = new Client();

      conn.on('ready', () => {
        this.childLogger.info(`checkDiskSpace - SSH connection established to ${options.host}`);

        conn.exec(`${DISK_INFO_CMD} ${path}`, (err, stream) => {
          if (err) {
            conn.end();
            return reject(err);
          }

          let data = '';

          stream
            .on('data', (chunk: any) => {
              data += chunk;
            })
            .on('close', () => {
              this.childLogger.info(`checkDiskSpace - Disk space info for ${path}: ${data}`);
              resolve(data);
              conn.end();
            })
            .stderr.on('data', (chunk) => {
              this.childLogger.error(`checkDiskSpace - Disk space stderr: ${chunk}`);
            });
        });
      });

      conn.on('error', (err) => {
        this.childLogger.error(`checkDiskSpace - SSH connection error: ${err.message}`);
        reject(err);
      });

      conn.on('end', () => {
        this.childLogger.info('checkDiskSpace - Connection ended');
      });

      conn.connect(options);
    });
  };

  private checkCPUAndMemory = (options: ConnectConfig) => {
    return new Promise((resolve, reject) => {
      const conn = new Client();

      conn.on('ready', () => {
        this.childLogger.info(`checkCPUAndMemory - SSH connection established to ${options.host}`);

        conn.exec(`${CPU_MEM_INFO_CMD}`, (err, stream) => {
          if (err) {
            reject(err);
          } else {
            let data = '';
            stream
              .on('data', (chunk: any) => {
                data += chunk;
              })
              .on('close', () => {
                this.childLogger.info('checkCPUAndMemory - CPU and Memory usage:', data);
                resolve(data);
                conn.end();
              })
              .stderr.on('data', (chunk) => {
                this.childLogger.error(`checkCPUAndMemory - CPU and Memory stderr: ${chunk}`);
              });
          }
        });
      });

      conn.on('error', (err) => {
        this.childLogger.error(`checkDiskSpace - SSH connection error: ${err.message}`);
        reject(err);
      });

      conn.on('end', () => {
        this.childLogger.info('checkDiskSpace - Connection ended');
      });

      conn.connect(options);
    });
  };

  public run = async (device: Device, deviceAuth: DeviceAuth) => {
    const defaultSshOptionsDocker = await SSHCredentialsHelper.getDockerSshConnectionOptions(
      device,
      deviceAuth,
    );
    const defaultSshOptionsAnsible = await SSHCredentialsHelper.getSShConnection(
      device,
      deviceAuth,
    );
    const sshOptionsDocker = { ...defaultSshOptionsDocker, timeout: 60000 };
    const sshOptionsAnsible = { ...defaultSshOptionsAnsible, timeout: 60000 };

    let data;
    for (const check of DIAGNOSTIC_SEQUENCE) {
      this.childLogger.info(`Running diagnostic check: ${check}...`);
      await sleep(2000);
      data = undefined;
      try {
        switch (check) {
          case SsmDeviceDiagnostic.Checks.SSH_CONNECT:
            await this.checkSSHConnectivity(sshOptionsAnsible as ConnectConfig);
            this.emit(Events.DIAGNOSTIC_CHECK, {
              success: true,
              severity: 'success',
              module: 'DeviceDiagnostic',
              data: { check },
              message: `✅ Ssh connect check passed on ${sshOptionsAnsible.host}:${sshOptionsAnsible.port}`,
            });
            break;
          case SsmDeviceDiagnostic.Checks.SSH_DOCKER_CONNECT:
            await this.checkSSHConnectivity(sshOptionsDocker.sshOptions as ConnectConfig);
            this.emit(Events.DIAGNOSTIC_CHECK, {
              success: true,
              severity: 'success',
              module: 'DeviceDiagnostic',
              data: { check },
              message: `✅ Ssh Docker connect check passed on ${sshOptionsDocker.host}:${sshOptionsDocker.port}`,
            });
            break;
          case SsmDeviceDiagnostic.Checks.DOCKER_SOCKET:
            await this.checkDockerSocket(sshOptionsDocker);
            this.emit(Events.DIAGNOSTIC_CHECK, {
              success: true,
              severity: 'success',
              module: 'DeviceDiagnostic',
              data: { check },
              message: `✅ Docker Socket check passed on ${sshOptionsDocker.host}:${sshOptionsDocker.port} - ${sshOptionsDocker.socketPath || '/var/run/docker.sock'}`,
            });
            break;
          case SsmDeviceDiagnostic.Checks.DISK_SPACE:
            data = await this.checkDiskSpace(sshOptionsAnsible as ConnectConfig, '/var/lib/docker');
            this.emit(Events.DIAGNOSTIC_CHECK, {
              success: true,
              severity: 'success',
              module: 'DeviceDiagnostic',
              data: { check, diskSpaceInfo: data },
              message: `✅ Disk Space check passed on ${sshOptionsAnsible.host}:${sshOptionsAnsible.port} - ${DISK_INFO_CMD} /var/lib/docker => ${data}`,
            });
            break;
          case SsmDeviceDiagnostic.Checks.CPU_MEMORY_INFO:
            data = await this.checkCPUAndMemory(sshOptionsAnsible as ConnectConfig);
            this.emit(Events.DIAGNOSTIC_CHECK, {
              success: true,
              severity: 'success',
              module: 'DeviceDiagnostic',
              data: { check, cpuMemInfo: data },
              message: `✅ CPU & Memory check passed on ${sshOptionsAnsible.host}:${sshOptionsAnsible.port} - ${DISK_INFO_CMD} => ${data}`,
            });
            break;
        }
      } catch (error: any) {
        this.emit(Events.DIAGNOSTIC_CHECK, {
          success: false,
          severity: 'error',
          module: 'DeviceDiagnostic',
          data: { check },
          message: `❌ ${error.message}`,
        });
      }
    }
  };
}

export default new Diagnostic();
