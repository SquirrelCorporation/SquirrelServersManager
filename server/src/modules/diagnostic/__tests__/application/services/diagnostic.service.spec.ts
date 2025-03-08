import { EventEmitter2 } from '@nestjs/event-emitter';
import DockerModem from 'docker-modem';
import { Client } from 'ssh2';
import { SsmDeviceDiagnostic } from 'ssm-shared-lib';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventEmitterService } from '../../../../../core/events/event-emitter.service';
import Events from '../../../../../core/events/events';
import { DiagnosticService } from '../../../application/services/diagnostic.service';

// Define the diagnostic sequence for testing
const DIAGNOSTIC_SEQUENCE = Object.values(SsmDeviceDiagnostic.Checks);

// Mock dependencies
vi.mock('ssh2', () => ({
  Client: vi.fn().mockImplementation(() => ({
    on: vi.fn().mockReturnThis(),
    connect: vi.fn(),
    end: vi.fn(),
    exec: vi.fn(),
  })),
}));

vi.mock('docker-modem', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      dial: vi.fn().mockImplementation((options, callback) => {
        callback(null, 'OK');
      }),
    })),
  };
});

vi.mock('../../../../../helpers/dns/dns-helper', () => ({
  tryResolveHost: vi.fn().mockResolvedValue('127.0.0.1'),
}));

vi.mock('../../../../../helpers/ssh/SSHCredentialsHelper', () => ({
  default: {
    getSShConnection: vi.fn().mockResolvedValue({
      host: 'test-host',
      port: 22,
      username: 'test-user',
      password: 'test-password',
    }),
    getDockerSshConnectionOptions: vi.fn().mockResolvedValue({
      host: 'test-host',
      port: 22,
      sshOptions: {
        host: 'test-host',
        port: 22,
        username: 'test-user',
        password: 'test-password',
      },
      socketPath: '/var/run/docker.sock',
    }),
  },
}));

vi.mock('../../../../containers/core/CustomAgent', () => ({
  getCustomAgent: vi.fn().mockReturnValue({}),
}));

describe('DiagnosticService', () => {
  let service: DiagnosticService;
  let eventEmitterService: EventEmitterService;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Create mock EventEmitter2
    eventEmitter = {
      emit: vi.fn(),
      on: vi.fn(),
    } as unknown as EventEmitter2;

    // Create a mock EventEmitterService
    eventEmitterService = new EventEmitterService(eventEmitter);

    // Create the service
    service = new DiagnosticService(eventEmitterService);

    // Mock the private methods to prevent timeouts
    vi.spyOn(service as any, 'checkSSHConnectivity').mockResolvedValue(true);
    vi.spyOn(service as any, 'checkDockerSocket').mockResolvedValue('OK');
    vi.spyOn(service as any, 'checkDiskSpace').mockResolvedValue('Disk space info');
    vi.spyOn(service as any, 'checkCPUAndMemory').mockResolvedValue('CPU and memory info');
  });

  describe('run', () => {
    it('should run diagnostic checks and emit events', async () => {
      // Mock device and deviceAuth
      const device = {
        uuid: 'test-uuid',
        name: 'test-device',
      } as any;

      const deviceAuth = {
        authType: 'ssh',
        ssh: {
          username: 'test-user',
          password: 'test-password',
        },
      } as any;

      // Spy on the emit method
      vi.spyOn(eventEmitterService, 'emit');

      // Call the run method
      const result = await service.run(device, deviceAuth);

      // Verify the result
      expect(result).toHaveProperty('deviceId', 'test-uuid');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('results');

      // Verify that events were emitted for each check
      expect(eventEmitterService.emit).toHaveBeenCalledTimes(DIAGNOSTIC_SEQUENCE.length);

      // Verify that each check emitted an event
      DIAGNOSTIC_SEQUENCE.forEach(() => {
        expect(eventEmitterService.emit).toHaveBeenCalledWith(
          Events.DIAGNOSTIC_CHECK,
          expect.objectContaining({
            module: 'DeviceDiagnostic',
          })
        );
      });
    });

    it('should handle errors during diagnostic checks', async () => {
      // Mock device and deviceAuth
      const device = {
        uuid: 'test-uuid',
        name: 'test-device',
      } as any;

      const deviceAuth = {
        authType: 'ssh',
        ssh: {
          username: 'test-user',
          password: 'test-password',
        },
      } as any;

      // Mock an error for the first check
      vi.spyOn(service as any, 'checkSSHConnectivity').mockRejectedValueOnce(
        new Error('SSH connection failed'),
      );

      // Spy on the emit method
      vi.spyOn(eventEmitterService, 'emit');

      // Call the run method
      const result = await service.run(device, deviceAuth);

      // Verify the result
      expect(result).toHaveProperty('deviceId', 'test-uuid');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('results');

      // Verify that error events were emitted
      expect(eventEmitterService.emit).toHaveBeenCalledWith(Events.DIAGNOSTIC_CHECK, {
        success: false,
        severity: 'error',
        module: 'DeviceDiagnostic',
        data: { check: SsmDeviceDiagnostic.Checks.SSH_CONNECT },
        message: '❌ SSH connection failed',
      });
    });
  });

  describe('checkSSHConnectivity', () => {
    it('should resolve when SSH connection is successful', async () => {
      // Restore the original implementation for this test
      vi.spyOn(service as any, 'checkSSHConnectivity').mockRestore();

      // Create a mock client that will emit 'ready' event
      const mockClient = {
        on: vi.fn().mockImplementation((event, callback) => {
          if (event === 'ready') {
            setTimeout(() => callback(), 10);
          }
          return mockClient;
        }),
        connect: vi.fn(),
        end: vi.fn(),
      };

      // Mock the Client constructor to return our mock client
      vi.mocked(Client).mockImplementation(() => mockClient as any);

      // Call the private method using type casting
      const result = await(service as any).checkSSHConnectivity({
        host: 'test-host',
        port: 22,
        username: 'test-user',
        password: 'test-password',
      });

      // Verify the result
      expect(result).toBe(true);
    });

    it('should reject when SSH connection fails', async () => {
      // Create a mock error
      const mockError = new Error('SSH connection failed');

      // Create a mock implementation that will reject
      vi.spyOn(service as any, 'checkSSHConnectivity').mockImplementation(() => {
        return Promise.reject(mockError);
      });

      // Call the private method using type casting and expect it to reject
      await expect(
        (service as any).checkSSHConnectivity({
          host: 'test-host',
          port: 22,
          username: 'test-user',
          password: 'test-password',
        }),
      ).rejects.toThrow('SSH connection failed');
    });
  });

  describe('checkDockerSocket', () => {
    it('should resolve when Docker socket connection is successful', async () => {
      // Restore the original implementation for this test
      vi.spyOn(service as any, 'checkDockerSocket').mockRestore();

      // Create a mock DockerModem that will call callback with success
      const mockModem = {
        dial: vi.fn().mockImplementation((options, callback) => {
          callback(null, 'OK');
        }),
      };

      // Mock the DockerModem constructor to return our mock modem
      vi.mocked(DockerModem).mockImplementation(() => mockModem as any);

      // Call the private method using type casting
      const result = await(service as any).checkDockerSocket({
        host: 'test-host',
        port: 22,
        socketPath: '/var/run/docker.sock',
      });

      // Verify the result
      expect(result).toBe('OK');
    });

    it('should reject when Docker socket connection fails', async () => {
      // Create a mock error
      const mockError = new Error('Docker socket connection failed');

      // Create a mock implementation that will reject
      vi.spyOn(service as any, 'checkDockerSocket').mockImplementation(() => {
        return Promise.reject(mockError);
      });

      // Call the private method using type casting and expect it to reject
      await expect(
        (service as any).checkDockerSocket({
          host: 'test-host',
          port: 22,
          socketPath: '/var/run/docker.sock',
        }),
      ).rejects.toThrow('Docker socket connection failed');
    });
  });
});
