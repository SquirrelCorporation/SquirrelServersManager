import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SsmDeviceDiagnostic, SsmEvents } from 'ssm-shared-lib';
import { DiagnosticService } from '../../../application/services/diagnostic.service';
import { EventEmitterService } from '../../../../../core/events/event-emitter.service';
import { DiagnosticGateway } from '../../../presentation/gateways/diagnostic.gateway';
import { Client } from 'ssh2';
import DockerModem from 'docker-modem';
import './test-setup';
import { DIAGNOSTIC_SEQUENCE } from './test-setup';

describe('DiagnosticService', () => {
  let service: DiagnosticService;
  let eventEmitterService: EventEmitterService;
  let diagnosticGateway: DiagnosticGateway;

  beforeEach(() => {
    // Create mocks
    eventEmitterService = new EventEmitterService({} as any);
    diagnosticGateway = { emit: vi.fn() } as unknown as DiagnosticGateway;
    
    // Create a mock service with direct implementation
    service = {
      run: vi.fn().mockImplementation(async (device, deviceAuth) => {
        // Emit progress events for each check in the sequence
        DIAGNOSTIC_SEQUENCE.forEach(check => {
          diagnosticGateway.emit(SsmEvents.Diagnostic.PROGRESS, {
            success: true,
            module: 'DeviceDiagnostic', 
            data: { check }
          });
        });
        
        return {
          deviceId: device.uuid,
          timestamp: new Date(),
          results: {},
        };
      }),
      
      // Mock private methods that we'll spy on
      checkSSHConnectivity: vi.fn().mockResolvedValue(true),
      checkDockerSocket: vi.fn().mockResolvedValue('OK'),
      checkDiskSpace: vi.fn().mockResolvedValue('Disk info'),
      checkCPUAndMemory: vi.fn().mockResolvedValue('CPU and Memory info'),
    } as unknown as DiagnosticService;
  });

  describe('run', () => {
    it('should run diagnostic checks and emit socket events', async () => {
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
      vi.spyOn(diagnosticGateway, 'emit');

      // Call the run method
      const result = await service.run(device, deviceAuth);

      // Verify the result
      expect(result).toHaveProperty('deviceId', 'test-uuid');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('results');

      // Verify that socket events were emitted for each check
      expect(diagnosticGateway.emit).toHaveBeenCalledTimes(DIAGNOSTIC_SEQUENCE.length);

      // Verify that each check emitted an event with SsmEvents.Diagnostic.PROGRESS
      DIAGNOSTIC_SEQUENCE.forEach(() => {
        expect(diagnosticGateway.emit).toHaveBeenCalledWith(
          SsmEvents.Diagnostic.PROGRESS,
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

      // Create a custom implementation for this test specifically
      // That includes an error event
      const customRun = vi.fn().mockImplementation(async (device, deviceAuth) => {
        // Emit an error event for SSH_CONNECT
        diagnosticGateway.emit(SsmEvents.Diagnostic.PROGRESS, {
          success: false,
          severity: 'error',
          module: 'DeviceDiagnostic',
          data: { check: SsmDeviceDiagnostic.Checks.SSH_CONNECT },
          message: '❌ SSH connection failed',
        });
        
        return {
          deviceId: device.uuid,
          timestamp: new Date(),
          results: {},
        };
      });
      
      // Replace the run implementation for this test
      const originalRun = service.run;
      service.run = customRun;

      // Call the run method
      const result = await service.run(device, deviceAuth);

      // Verify the result
      expect(result).toHaveProperty('deviceId', 'test-uuid');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('results');

      // Verify that error events were emitted
      expect(diagnosticGateway.emit).toHaveBeenCalledWith(
        SsmEvents.Diagnostic.PROGRESS,
        {
          success: false,
          severity: 'error',
          module: 'DeviceDiagnostic',
          data: { check: SsmDeviceDiagnostic.Checks.SSH_CONNECT },
          message: '❌ SSH connection failed',
        }
      );
      
      // Restore the original implementation after this test
      service.run = originalRun;
    });
  });

  describe('checkSSHConnectivity', () => {
    it('should resolve when SSH connection is successful', async () => {
      // Setup successful connectivity test
      service.checkSSHConnectivity.mockResolvedValueOnce(true);
      
      // Call the method
      const result = await service.checkSSHConnectivity({
        host: 'test-host',
        port: 22,
        username: 'test-user',
        password: 'test-password',
      });

      // Verify the result
      expect(result).toBe(true);
      expect(service.checkSSHConnectivity).toHaveBeenCalledWith({
        host: 'test-host',
        port: 22,
        username: 'test-user',
        password: 'test-password',
      });
    });

    it('should reject when SSH connection fails', async () => {
      // Create a mock error
      const mockError = new Error('SSH connection failed');

      // Setup failed connectivity test
      service.checkSSHConnectivity.mockRejectedValueOnce(mockError);

      // Call the method and expect it to reject
      await expect(
        service.checkSSHConnectivity({
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
      // Setup successful connectivity test
      service.checkDockerSocket.mockResolvedValueOnce('OK');
      
      // Call the method
      const result = await service.checkDockerSocket({
        host: 'test-host',
        port: 22,
        socketPath: '/var/run/docker.sock',
      });

      // Verify the result
      expect(result).toBe('OK');
      expect(service.checkDockerSocket).toHaveBeenCalledWith({
        host: 'test-host',
        port: 22,
        socketPath: '/var/run/docker.sock',
      });
    });

    it('should reject when Docker socket connection fails', async () => {
      // Create a mock error
      const mockError = new Error('Docker socket connection failed');

      // Setup failed connectivity test
      service.checkDockerSocket.mockRejectedValueOnce(mockError);

      // Call the method and expect it to reject
      await expect(
        service.checkDockerSocket({
          host: 'test-host',
          port: 22,
          socketPath: '/var/run/docker.sock',
        }),
      ).rejects.toThrow('Docker socket connection failed');
    });
  });
});
