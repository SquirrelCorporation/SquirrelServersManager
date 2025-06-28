import { vi } from 'vitest';
import { SsmDeviceDiagnostic } from 'ssm-shared-lib';

// Define the diagnostic sequence for testing (must be before mocks)
export const DIAGNOSTIC_SEQUENCE = Object.values(SsmDeviceDiagnostic.Checks);

// Mock dependencies
vi.mock('ssh2', () => ({
  Client: vi.fn().mockImplementation(() => ({
    on: vi.fn().mockReturnThis(),
    connect: vi.fn(),
    end: vi.fn(),
    exec: vi.fn(),
  })),
}));

vi.mock('docker-modem', () => ({
  default: vi.fn().mockImplementation(() => ({
    dial: vi.fn().mockImplementation((options, callback) => {
      callback(null, 'OK');
    }),
  })),
}));

vi.mock('dockerode', () => ({
  default: vi.fn().mockImplementation(() => ({
    ping: vi.fn().mockImplementation((cb) => cb(null)),
    info: vi.fn().mockImplementation((cb) => cb(null, {})),
  })),
}));

// Mock custom agent adapter
vi.mock('@infrastructure/adapters/ssh/custom-agent.adapter', () => ({
  getCustomAgent: vi.fn().mockReturnValue({}),
}));

// Mock DNS helper
vi.mock('@infrastructure/common/dns/dns-helper', () => ({
  tryResolveHost: vi.fn().mockResolvedValue('test-host'),
}));

// Mock SSHCredentialsHelper
vi.mock('@modules/ssh/utils/ssh-credentials-helper', () => ({
  default: {
    getSShConnection: vi.fn().mockResolvedValue({
      host: 'test-host',
      port: 22,
    }),
    getDockerSshConnectionOptions: vi.fn().mockResolvedValue({
      host: 'test-host',
      port: 2376,
      sshOptions: {
        host: 'test-host',
        port: 22,
      },
    }),
  },
}));

// Mock event emitter
vi.mock('@nestjs/event-emitter', () => ({
  EventEmitter2: vi.fn().mockImplementation(() => ({
    emit: vi.fn(),
    on: vi.fn(),
  })),
}));

// Mock EventEmitterService
vi.mock('../../../../../core/events/event-emitter.service', () => ({
  EventEmitterService: vi.fn().mockImplementation(() => ({
    emit: vi.fn(),
    on: vi.fn(),
  })),
}));

// Mock DiagnosticGateway
vi.mock('../../../presentation/gateways/diagnostic.gateway', () => ({
  DiagnosticGateway: vi.fn().mockImplementation(() => ({
    emit: vi.fn(),
  })),
}));

// Mock the Events class
vi.mock('../../../../../core/events/events', () => ({
  default: {
    Diagnostic: {
      PROGRESS: 'diagnostic.progress',
    },
  },
}));

// Mock ssm-shared-lib
vi.mock('ssm-shared-lib', () => ({
  SsmDeviceDiagnostic: {
    Checks: {
      SSH_CONNECT: 'SSH_CONNECT',
      DOCKER_SOCKET: 'DOCKER_SOCKET',
      DISK_SPACE: 'DISK_SPACE',
      CPU_MEMORY: 'CPU_MEMORY',
    },
  },
  SsmEvents: {
    Diagnostic: {
      PROGRESS: 'diagnostic.progress',
    },
  },
}));

// Mock the DiagnosticService
vi.mock('../../../application/services/diagnostic.service', () => {
  // Store the original implementation to be able to restore it
  const originalImplementation = vi.fn().mockImplementation(() => {
    return {
      run: vi.fn().mockImplementation(async (device, deviceAuth) => {
        return {
          deviceId: device.uuid,
          timestamp: new Date(),
          results: {},
        };
      }),

      // Private methods that we'll mock but should be available on the instance
      checkSSHConnectivity: vi.fn().mockImplementation(() => Promise.resolve(true)),
      checkDockerSocket: vi.fn().mockImplementation(() => Promise.resolve('OK')),
      checkDiskSpace: vi.fn().mockImplementation(() => Promise.resolve('Disk info')),
      checkCPUAndMemory: vi.fn().mockImplementation(() => Promise.resolve('CPU and Memory info')),
    };
  });

  return {
    DiagnosticService: originalImplementation,
  };
});
