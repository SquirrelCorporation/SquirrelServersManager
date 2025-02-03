import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { RemoteOS } from '../../../../../modules/remote-system-information/system-information/RemoteOS';
import {
  RemoteExecutorType,
  RemoteExecutorTypeWithCallback,
} from '../../../../../modules/remote-system-information/system-information/types';

// Create a concrete implementation of RemoteOS for testing
class TestRemoteOS extends RemoteOS {
  constructor(execAsync: RemoteExecutorType, execWithCallback: RemoteExecutorTypeWithCallback) {
    super(execAsync, execWithCallback);
  }
}

describe('RemoteOS', () => {
  let mockExecAsync: Mock<RemoteExecutorType>;
  let mockExecWithCallback: Mock<RemoteExecutorTypeWithCallback>;
  let remoteOS: TestRemoteOS;

  beforeEach(() => {
    vi.resetAllMocks();
    // Reset mocks before each test
    mockExecAsync = vi.fn();
    mockExecWithCallback = vi.fn();
    remoteOS = new TestRemoteOS(mockExecAsync, mockExecWithCallback);
  });

  describe('OS Detection', () => {
    it('should detect Linux OS', async () => {
      mockExecAsync
        .mockResolvedValue('default')
        .mockResolvedValueOnce('Linux')
        .mockResolvedValueOnce('Linux');
      await remoteOS.init();
      expect(remoteOS.platform).toBe('linux');
    });

    it('should detect macOS', async () => {
      mockExecAsync
        .mockResolvedValue('default')
        .mockResolvedValueOnce('Darwin')
        .mockResolvedValueOnce('Darwin');
      await remoteOS.init();
      expect(remoteOS.platform).toBe('darwin');
    });
  });

  describe('System Information', () => {
    it('should get system memory information', async () => {
      // Mock Linux memory info
      mockExecAsync.mockResolvedValueOnce('Linux'); // for OS detection
      mockExecAsync.mockResolvedValueOnce('linux'); // for platform
      mockExecAsync.mockResolvedValueOnce('linux'); // for platform
      mockExecAsync.mockResolvedValueOnce('[]'); // for cpus
      mockExecAsync.mockResolvedValueOnce('[]'); // for cpus
      mockExecAsync.mockResolvedValueOnce('16384000');

      await remoteOS.init();
      const totalMem = await remoteOS['totalmem']();
      expect(totalMem).toBeGreaterThan(0);
    });

    it('should get CPU information', async () => {
      // Mock Linux CPU info
      const cpuInfoMock = `
processor       : 0
model name      : Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz
cpu MHz         : 2600.000

processor       : 1
model name      : Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz
cpu MHz         : 2600.000
`;
      mockExecAsync.mockResolvedValueOnce('Linux'); // for OS detection
      mockExecAsync.mockResolvedValueOnce('linux'); // for platform
      mockExecAsync.mockResolvedValueOnce('linux'); // for platform
      mockExecAsync.mockResolvedValueOnce(cpuInfoMock);
      mockExecAsync.mockResolvedValueOnce('cpu0 2000 1000 3000 40000 0 0');
      mockExecAsync.mockResolvedValueOnce('2600000');
      mockExecAsync.mockResolvedValueOnce(cpuInfoMock);
      mockExecAsync.mockResolvedValueOnce('cpu0 2000 1000 3000 40000 0 0');
      mockExecAsync.mockResolvedValueOnce('2600000');
      await remoteOS.init();
      const cpus = await remoteOS['cpus']();

      expect(cpus.length).toBeGreaterThan(0);
      expect(cpus[0]).toHaveProperty('model');
      expect(cpus[0]).toHaveProperty('speed');
      expect(cpus[0]).toHaveProperty('times');
    });

    it('should get network interfaces', async () => {
      // Mock Linux network interfaces
      const networkMock = JSON.stringify([
        {
          ifname: 'eth0',
          addr_info: [
            {
              local: '192.168.1.100',
              prefixlen: 24,
            },
          ],
          address: '00:11:22:33:44:55',
          link_index: 1,
        },
      ]);

      mockExecAsync.mockResolvedValueOnce('Linux');
      mockExecAsync.mockResolvedValueOnce('linux');
      mockExecAsync.mockResolvedValueOnce('linux');
      mockExecAsync.mockResolvedValueOnce('[]'); // for cpus
      mockExecAsync.mockResolvedValueOnce('[]'); // for cpus
      mockExecAsync.mockResolvedValueOnce(networkMock);

      await remoteOS.init();
      const interfaces = await remoteOS['osNetworkInterfaces']();

      expect(interfaces).toHaveProperty('eth0');
      expect(interfaces.eth0?.[0]).toHaveProperty('address', '192.168.1.100');
      expect(interfaces.eth0?.[0]).toHaveProperty('family', 'IPv4');
      expect(interfaces.eth0?.[0]).toHaveProperty('mac', '00:11:22:33:44:55');
    });
  });

  describe('File System Operations', () => {
    it('should check if file exists', async () => {
      mockExecAsync.mockResolvedValueOnce('Linux');
      mockExecAsync.mockResolvedValueOnce('linux');
      mockExecAsync.mockResolvedValueOnce('linux');
      mockExecAsync.mockResolvedValueOnce('[]');
      mockExecAsync.mockResolvedValueOnce('[]');
      mockExecAsync.mockResolvedValueOnce('true');

      await remoteOS.init();
      const exists = await remoteOS['fileExists']('/path/to/file');
      expect(exists).toBe(true);
    });

    it('should read file content', async () => {
      const fileContent = 'test content';
      mockExecAsync.mockResolvedValueOnce('Linux');
      mockExecAsync.mockResolvedValueOnce('linux');
      mockExecAsync.mockResolvedValueOnce('linux');
      mockExecAsync.mockResolvedValueOnce('[]');
      mockExecAsync.mockResolvedValueOnce('[]');
      mockExecAsync.mockResolvedValueOnce(fileContent);

      await remoteOS.init();
      const content = await remoteOS['readFileAsync']('/path/to/file');
      expect(content).toBe(fileContent);
    });

    it('should list directories', async () => {
      const dirs = '/path/dir1\n/path/dir2';
      mockExecAsync.mockResolvedValueOnce('Linux');
      mockExecAsync.mockResolvedValueOnce('linux');
      mockExecAsync.mockResolvedValueOnce('linux');
      mockExecAsync.mockResolvedValueOnce('[]');
      mockExecAsync.mockResolvedValueOnce('[]');
      mockExecAsync.mockResolvedValueOnce(dirs);

      await remoteOS.init();
      const directories = await remoteOS['getDirectories']('/path');
      expect(directories).toEqual(['/path/dir1', '/path/dir2']);
    });
  });

  describe('System Metrics', () => {
    it('should get system uptime', async () => {
      mockExecAsync.mockResolvedValueOnce('Linux');
      mockExecAsync.mockResolvedValueOnce('linux');
      mockExecAsync.mockResolvedValueOnce('linux');
      mockExecAsync.mockResolvedValueOnce('[]');
      mockExecAsync.mockResolvedValueOnce('[]');
      mockExecAsync.mockResolvedValueOnce('12345.67 89012.34');

      await remoteOS.init();
      const uptime = await remoteOS['uptime']();
      expect(uptime).toBe(12345);
    });

    it('should get load averages', async () => {
      mockExecAsync.mockResolvedValueOnce('Linux');
      mockExecAsync.mockResolvedValueOnce('linux');
      mockExecAsync.mockResolvedValueOnce('linux');
      mockExecAsync.mockResolvedValueOnce('[]');
      mockExecAsync.mockResolvedValueOnce('[]');
      mockExecAsync.mockResolvedValueOnce('0.8 1.2 0.9');

      await remoteOS.init();
      const loadavg = await remoteOS['loadavg']();
      expect(loadavg).toHaveLength(3);
      expect(loadavg).toEqual([0.8, 1.2, 0.9]);
    });
  });

  describe('Platform Specific Features', () => {
    it('should detect Raspberry Pi', async () => {
      const cpuInfo = [
        'Hardware        : BCM2835',
        'Model          : Raspberry Pi 4 Model B Rev 1.2',
      ].join('\n');

      mockExecAsync.mockResolvedValueOnce('Linux');
      mockExecAsync.mockResolvedValueOnce('linux');
      mockExecAsync.mockResolvedValueOnce('linux');
      mockExecAsync.mockResolvedValueOnce('[]');
      mockExecAsync.mockResolvedValueOnce('[]');
      mockExecAsync.mockResolvedValueOnce(cpuInfo);

      await remoteOS.init();
      const isRpi = await remoteOS['isRaspberry']();
      expect(isRpi).toBe(true);
    });

    it('should detect Xcode on macOS', async () => {
      mockExecAsync.mockResolvedValueOnce('Darwin');
      mockExecAsync.mockResolvedValueOnce('darwin');
      mockExecAsync.mockResolvedValueOnce('[]');
      mockExecAsync.mockResolvedValueOnce('true');

      await remoteOS.init();
      const hasXcode = await remoteOS['darwinXcodeExists']();
      expect(hasXcode).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle file read errors gracefully', async () => {
      mockExecAsync.mockResolvedValueOnce('Linux');
      mockExecAsync.mockResolvedValueOnce('linux');
      mockExecAsync.mockResolvedValueOnce('[]');
      mockExecAsync.mockRejectedValueOnce(new Error('File not found'));

      await remoteOS.init();
      const exists = await remoteOS['fileExists']('/nonexistent/path');
      expect(exists).toBe(false);
    });

    it('should handle network interface errors', async () => {
      mockExecAsync.mockResolvedValueOnce('Linux');
      mockExecAsync.mockResolvedValueOnce('linux');
      mockExecAsync.mockResolvedValueOnce('[]');
      mockExecAsync.mockRejectedValueOnce(new Error('Network error'));

      await remoteOS.init();
      await expect(remoteOS['osNetworkInterfaces']()).rejects.toThrow();
    });
  });
});
