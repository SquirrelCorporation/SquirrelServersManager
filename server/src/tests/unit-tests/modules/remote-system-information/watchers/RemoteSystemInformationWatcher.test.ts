import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CronJob from 'node-cron';
import RemoteSystemInformationWatcher from '../../../../../modules/remote-system-information/watchers/RemoteSystemInformationWatcher';

describe('RemoteSystemInformationWatcher', () => {
  let watcher: RemoteSystemInformationWatcher;
  let cronScheduleStub: ReturnType<typeof vi.fn>;
  let loggerStub: {
    info: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    debug: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Create stubs
    cronScheduleStub = vi.spyOn(CronJob, 'schedule').mockReturnValue({
      start: vi.fn(),
      stop: vi.fn(),
    } as any);

    loggerStub = {
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    };

    // Create watcher instance
    watcher = new RemoteSystemInformationWatcher();
    (watcher as any).logger = loggerStub;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('setupWatcher', () => {
    it('should setup watcher with correct cron schedule', async () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      const config = { watch: true, cron: '*/5 * * * *' };
      const name = 'TestWatcher';

      (watcher as any).setupWatcher(name, handler, config);

      expect(cronScheduleStub).toHaveBeenCalledWith(config.cron, expect.any(Function));
      expect(loggerStub.info).toHaveBeenCalledWith(`Watching ${name}...`);

      // Verify initial run
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should handle watcher errors gracefully', async () => {
      const error = new Error('Watcher error');
      const handler = vi.fn().mockRejectedValue(error);
      const config = { watch: true, cron: '*/5 * * * *' };
      const name = 'TestWatcher';

      (watcher as any).setupWatcher(name, handler, config);

      // Wait for error handler to be called
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(loggerStub.error).toHaveBeenCalledWith(error, `Error in initial ${name} watch`);
    });

    it('should not setup watcher when watch is false', () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      const config = { watch: false, cron: '*/5 * * * *' };
      const name = 'TestWatcher';

      (watcher as any).setupWatcher(name, handler, config);

      expect(cronScheduleStub).not.toHaveBeenCalled();
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('deregisterComponent', () => {
    it('should stop and remove watchers for a component', () => {
      const stopStub = vi.fn();
      const watcher1 = {
        cron: { stop: stopStub },
        handler: vi.fn(),
        config: { watch: true, cron: '*/5 * * * *' },
      };
      const watcher2 = {
        cron: { stop: stopStub },
        handler: vi.fn(),
        config: { watch: true, cron: '*/10 * * * *' },
      };

      (watcher as any).watchers = {
        CPU_usage: watcher1,
        Memory_usage: watcher2,
      };

      watcher.deregisterComponent();

      expect(stopStub).toHaveBeenCalledTimes(2);
      expect((watcher as any).watchers).not.toHaveProperty('CPU_usage');
    });

    it('should handle non-existent component gracefully', () => {
      (watcher as any).watchers = {};
      watcher.deregisterComponent();
      expect(loggerStub.error).not.toHaveBeenCalled();
    });
  });
});
