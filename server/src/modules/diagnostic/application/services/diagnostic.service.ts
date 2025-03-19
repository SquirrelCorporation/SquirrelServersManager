import { Injectable, Logger } from '@nestjs/common';
import DockerModem from 'docker-modem';
import Dockerode from 'dockerode';
import { Client, ConnectConfig } from 'ssh2';
import { SsmDeviceDiagnostic } from 'ssm-shared-lib';
import { getCustomAgent } from 'src/helpers/ssh/custom-agent';
import { EventEmitterService } from '../../../../core/events/event-emitter.service';
import Events from '../../../../core/events/events';
import { IDevice, IDeviceAuth } from '../../../devices';
import { tryResolveHost } from '../../../../helpers/dns/dns-helper';
import SSHCredentialsHelper from '../../../../helpers/ssh/SSHCredentialsHelper';
import PinoLogger from '../../../../logger';
import { DiagnosticCheckType, DiagnosticReport, DiagnosticResult } from '../../domain/entities/diagnostic.entity';
import { IDiagnosticService } from '../interfaces/diagnostic-service.interface';

const DIAGNOSTIC_SEQUENCE = Object.values(SsmDeviceDiagnostic.Checks);
const DISK_INFO_CMD = 'df -h';
const CPU_MEM_INFO_CMD = `top -bn1 | grep "Cpu(s)" && free -m`;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class DiagnosticService implements IDiagnosticService {
  private readonly logger = new Logger(DiagnosticService.name);
  private childLogger = PinoLogger.child(
    { module: 'DeviceDiagnostic' },
    { msgPrefix: '[DEVICE_DIAGNOSTIC] - ' },
  );
  constructor(private eventEmitterService: EventEmitterService) {}

  private checkSSHConnectivity = (options: ConnectConfig) => {
    return new Promise((resolve, reject) => {
      const conn = new Client();
      conn
        .on('ready', () => {
          this.logger.log(`checkSSHConnectivity - SSH connection established to ${options.host}`);
          resolve(true);
          conn.end();
        })
        .on('error', (err) => {
          this.logger.error(
            `checkSSHConnectivity - SSH connection error to ${options.host}: ${err.message}`,
          );
          reject(err);
        });
      (async () => {
        const connectConfig = { ...options, host: await tryResolveHost(options.host as string) };
        conn.connect(connectConfig);
      })();
    });
  };

  private checkDockerSocket = (options: any) => {
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
      conn
        .on('ready', () => {
          conn.exec(`${DISK_INFO_CMD} ${path}`, (err, stream) => {
            if (err) {
              this.logger.error(
                `checkDiskSpace - Error executing command on ${options.host}: ${err.message}`,
              );
              conn.end();
              reject(err);
              return;
            }
            let data = '';
            stream
              .on('close', () => {
                conn.end();
                resolve(data);
              })
              .on('data', (chunk) => {
                data += chunk;
              })
              .stderr.on('data', (chunk) => {
                this.logger.error(
                  `checkDiskSpace - Error in command output on ${options.host}: ${chunk}`,
                );
                reject(new Error(`Error: ${chunk}`));
              });
          });
        })
        .on('error', (err) => {
          this.logger.error(
            `checkDiskSpace - SSH connection error to ${options.host}: ${err.message}`,
          );
          reject(err);
        });
      (async () => {
        const connectConfig = { ...options, host: await tryResolveHost(options.host as string) };
        conn.connect(connectConfig);
      })();
    });
  };

  private checkCPUAndMemory = (options: ConnectConfig) => {
    return new Promise((resolve, reject) => {
      const conn = new Client();
      conn
        .on('ready', () => {
          conn.exec(CPU_MEM_INFO_CMD, (err, stream) => {
            if (err) {
              this.logger.error(
                `checkCPUAndMemory - Error executing command on ${options.host}: ${err.message}`,
              );
              conn.end();
              reject(err);
              return;
            }
            let data = '';
            stream
              .on('close', () => {
                conn.end();
                resolve(data);
              })
              .on('data', (chunk) => {
                data += chunk;
              })
              .stderr.on('data', (chunk) => {
                this.logger.error(
                  `checkCPUAndMemory - Error in command output on ${options.host}: ${chunk}`,
                );
                reject(new Error(`Error: ${chunk}`));
              });
          });
        })
        .on('error', (err) => {
          this.logger.error(
            `checkCPUAndMemory - SSH connection error to ${options.host}: ${err.message}`,
          );
          reject(err);
        });
      (async () => {
        const connectConfig = { ...options, host: await tryResolveHost(options.host as string) };
        conn.connect(connectConfig);
      })();
    });
  };

  public async run(device: IDevice, deviceAuth: IDeviceAuth): Promise<DiagnosticReport> {
    this.logger.log(`Starting diagnostic for device ${device.ip} (${device.uuid})`);

    const sshOptionsAnsible = await SSHCredentialsHelper.getSShConnection(device, deviceAuth);
    const sshOptionsDocker = await SSHCredentialsHelper.getDockerSshConnectionOptions(
      device,
      deviceAuth,
    );

    const report: DiagnosticReport = {
      deviceId: device.uuid,
      timestamp: new Date(),
      results: {} as Record<DiagnosticCheckType, DiagnosticResult>
    };

    for (const check of DIAGNOSTIC_SEQUENCE) {
      this.logger.log(`Running diagnostic check: ${check}`);

      try {
        let data;

        switch (check) {
          case SsmDeviceDiagnostic.Checks.SSH_CONNECT: {
            await this.checkSSHConnectivity(sshOptionsAnsible as ConnectConfig);
            const sshResult: DiagnosticResult = {
              success: true,
              severity: 'success',
              message: `✅ Ssh connect check passed on ${sshOptionsAnsible.host}:${sshOptionsAnsible.port}`,
              data: { check }
            };
            report.results[check] = sshResult;
            this.eventEmitterService.emit(Events.DIAGNOSTIC_CHECK, {
              ...sshResult,
              module: 'DeviceDiagnostic',
            });
            break;
          }
          case SsmDeviceDiagnostic.Checks.SSH_DOCKER_CONNECT: {
            await this.checkSSHConnectivity(sshOptionsDocker.sshOptions as ConnectConfig);
            const sshDockerResult: DiagnosticResult = {
              success: true,
              severity: 'success',
              message: `✅ Ssh Docker connect check passed on ${sshOptionsDocker.host}:${sshOptionsDocker.port}`,
              data: { check }
            };
            report.results[check] = sshDockerResult;
            this.eventEmitterService.emit(Events.DIAGNOSTIC_CHECK, {
              ...sshDockerResult,
              module: 'DeviceDiagnostic',
            });
            break;
          }
          case SsmDeviceDiagnostic.Checks.DOCKER_SOCKET: {
            await this.checkDockerSocket(sshOptionsDocker);
            const dockerSocketResult: DiagnosticResult = {
              success: true,
              severity: 'success',
              message: `✅ Docker Socket check passed on ${sshOptionsDocker.host}:${sshOptionsDocker.port} - ${sshOptionsDocker.socketPath || '/var/run/docker.sock'}`,
              data: { check }
            };
            report.results[check] = dockerSocketResult;
            this.eventEmitterService.emit(Events.DIAGNOSTIC_CHECK, {
              ...dockerSocketResult,
              module: 'DeviceDiagnostic',
            });
            break;
          }
          case SsmDeviceDiagnostic.Checks.DISK_SPACE: {
            data = await this.checkDiskSpace(sshOptionsAnsible as ConnectConfig, '/var/lib/docker');
            const diskSpaceResult: DiagnosticResult = {
              success: true,
              severity: 'success',
              message: `✅ Disk Space check passed on ${sshOptionsAnsible.host}:${sshOptionsAnsible.port} - ${DISK_INFO_CMD} /var/lib/docker => ${data}`,
              data: { check, diskSpaceInfo: data }
            };
            report.results[check] = diskSpaceResult;
            this.eventEmitterService.emit(Events.DIAGNOSTIC_CHECK, {
              ...diskSpaceResult,
              module: 'DeviceDiagnostic',
            });
            break;
          }
          case SsmDeviceDiagnostic.Checks.CPU_MEMORY_INFO: {
            data = await this.checkCPUAndMemory(sshOptionsAnsible as ConnectConfig);
            const cpuMemResult: DiagnosticResult = {
              success: true,
              severity: 'success',
              message: `✅ CPU & Memory check passed on ${sshOptionsAnsible.host}:${sshOptionsAnsible.port} - ${CPU_MEM_INFO_CMD} => ${data}`,
              data: { check, cpuMemInfo: data }
            };
            report.results[check] = cpuMemResult;
            this.eventEmitterService.emit(Events.DIAGNOSTIC_CHECK, {
              ...cpuMemResult,
              module: 'DeviceDiagnostic',
            });
            break;
          }
        }

        // Add a small delay between checks to avoid overwhelming the target system
        await sleep(500);
      } catch (error: any) {
        const errorResult: DiagnosticResult = {
          success: false,
          severity: 'error',
          message: `❌ ${error.message}`,
          data: { check }
        };
        report.results[check] = errorResult;
        this.eventEmitterService.emit(Events.DIAGNOSTIC_CHECK, {
          ...errorResult,
          module: 'DeviceDiagnostic',
        });
      }
    }

    return report;
  }
}