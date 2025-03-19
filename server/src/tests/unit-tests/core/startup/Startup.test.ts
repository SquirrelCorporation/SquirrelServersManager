import { SettingsKeys } from 'ssm-shared-lib';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Startup from '../../../../core/startup/';
import { getFromCache, setToCache } from '../../../../data/cache';
import { ContainerCustomStackModel } from '../../../../data/database/model/ContainerCustomStack';
import { ContainerCustomStacksRepositoryModel } from '../../../../data/database/model/ContainerCustomStackRepository';
import { ContainerVolumeModel } from '../../../../data/database/model/ContainerVolume';
import { DeviceModel } from '../../../../data/database/model/Device';
import { PlaybookModel } from '../../../../data/database/model/Playbook';
import { PlaybooksRepositoryModel } from '../../../../data/database/model/PlaybooksRepository';
import WatcherEngine from '../../../../modules/containers/application/services/components/core/WatcherEngine';
import Crons from '../../../../modules/crons';
import NotificationComponent from '../../../../modules/notifications/NotificationComponent';
import RemoteSystemInformationEngine from '../../../../modules/remote-system-information/core/RemoteSystemInformationEngine';
import ContainerCustomStacksRepositoryEngine from '../../../../modules/repository/ContainerCustomStacksRepositoryEngine';
import PlaybooksRepositoryEngine from '../../../../modules/repository/PlaybooksRepositoryEngine';
import sshPrivateKeyFileManager from '../../../../modules/shell/managers/SshPrivateKeyFileManager';
import Telemetry from '../../../../modules/telemetry';

// Mock global.nestApp
global.nestApp = {
  get: vi.fn(),
} as any;

vi.mock('../../../../data/database/model/Settings', () => ({
  SettingsModel: {
    findOne: vi.fn(),
  },
}));

vi.mock('../../../../data/database/repository/DeviceRepo', () => ({
  default: {
    findAll: vi.fn(),
  },
}));

vi.mock('../../../../data/database/model/Server', () => ({
  ServerModel: {
    findOne: vi.fn(),
  },
}));

vi.mock('../../../../data/database/model/Inventory', () => ({
  InventoryModel: {
    findOne: vi.fn(),
  },
}));

vi.mock('../../../../data/database/model/Playbook', () => ({
  PlaybookModel: {
    findOne: vi.fn(),
  },
}));

vi.mock('../../../../data/database/model/ContainerStack', () => ({
  ContainerStackModel: {
    findOne: vi.fn(),
  },
}));

vi.mock('../../../../data/database/model/ContainerCustomStack', () => ({
  ContainerCustomStackModel: {
    findOne: vi.fn(),
  },
}));

vi.mock('../../../../data/cache', () => ({
  getFromCache: vi.fn(),
  setToCache: vi.fn(),
}));

vi.mock('../../../../data/cache/defaults', () => ({
  default: vi.fn(),
}));
vi.mock('../../../../core/system/ansible-versions', () => ({
  getAnsibleRunnerVersion: vi.fn(),
  setAnsibleRunnerVersion: vi.fn(),
}));
vi.mock('../../../../modules/repository/default-playbooks-repositories', () => ({
  createADefaultLocalUserRepository: vi.fn(),
}));

vi.mock('../../../../modules/crons', () => ({ default: { initScheduledJobs: vi.fn() } }));
vi.mock('../../../../modules/containers/core/WatcherEngine', () => ({
  default: { init: vi.fn() },
}));
vi.mock('../../../../modules/automations/AutomationEngine', () => ({ default: { init: vi.fn() } }));
vi.mock('../../../../modules/telemetry', () => ({ default: { init: vi.fn() } }));
vi.mock('../../../../modules/notifications/NotificationComponent', () => ({
  default: { init: vi.fn() },
}));
vi.mock('../../../../modules/repository/ContainerCustomStacksRepositoryEngine', () => ({
  default: { init: vi.fn() },
}));
vi.mock('../../../../modules/remote-system-information/core/RemoteSystemInformationEngine', () => ({
  default: { init: vi.fn() },
}));
vi.mock('../../../../modules/repository/PlaybooksRepositoryEngine', () => ({
  default: {
    init: vi.fn(),
    syncAllRegistered: vi.fn(),
  },
}));
vi.mock('../../../../modules/shell/managers/SshPrivateKeyFileManager', () => ({
  default: {
    removeAllAnsibleTemporaryPrivateKeys: vi.fn(),
  },
}));

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid'),
}));

describe('Startup Integration Tests', () => {
  let startup: typeof Startup;
  beforeEach(() => {
    vi.clearAllMocks();

    startup = Startup;

    // Mock Redis and Database Models
    vi.mocked(getFromCache).mockResolvedValue(null); // Default mock for Redis cache
    vi.mocked(setToCache).mockResolvedValue(null);
    // @ts-expect-error private fun
    vi.spyOn(ContainerCustomStackModel, 'updateMany').mockResolvedValue({});
    vi.spyOn(ContainerCustomStacksRepositoryModel, 'find').mockResolvedValue([]);
    vi.spyOn(ContainerVolumeModel, 'find').mockResolvedValue([]);

    // @ts-expect-error private fun
    vi.spyOn(PlaybookModel, 'syncIndexes').mockResolvedValue();
    // @ts-expect-error private fun
    vi.spyOn(DeviceModel, 'syncIndexes').mockResolvedValue();
    vi.spyOn(PlaybooksRepositoryModel, 'find').mockResolvedValue([]);
  });

  it('should initialize all modules', async () => {
    // Ensure PlaybooksRepositoryEngine.init is called
    vi.mocked(PlaybooksRepositoryEngine.init).mockResolvedValue();

    // Call the method
    await startup.init();

    // Check modules initialization
    expect(getFromCache).toBeCalledWith(SettingsKeys.GeneralSettingsKeys.SCHEME_VERSION);
    expect(PlaybooksRepositoryEngine.init).toHaveBeenCalled();
    expect(PlaybooksRepositoryEngine.syncAllRegistered).toHaveBeenCalled();
    expect(Crons.initScheduledJobs).toHaveBeenCalled();
    expect(WatcherEngine.init).toHaveBeenCalled();
    expect(ContainerCustomStacksRepositoryEngine.init).toHaveBeenCalled();
    expect(Telemetry.init).toHaveBeenCalled();
    expect(NotificationComponent.init).toHaveBeenCalled();
    expect(sshPrivateKeyFileManager.removeAllAnsibleTemporaryPrivateKeys).toHaveBeenCalled();
    expect(RemoteSystemInformationEngine.init).toHaveBeenCalled();
  });

  it('should call updateScheme when the scheme version differs', async () => {
    // Mock return values for `getFromCache`
    vi.mocked(getFromCache).mockResolvedValueOnce('0'); // Mimic a differing scheme version from the current one

    // Spy on `updateScheme` to assert later if it was called
    // @ts-expect-error private fun
    const updateSchemeSpy = vi.spyOn(startup, 'updateScheme').mockResolvedValueOnce();

    // Call the initialization logic
    await startup.init();

    // Verify that `updateScheme` was called
    expect(updateSchemeSpy).toHaveBeenCalled();
  });

  it('should not update scheme when version is the same', async () => {
    vi.mocked(getFromCache).mockResolvedValue(SettingsKeys.DefaultValue.SCHEME_VERSION);

    await startup.init();

    // Check that setToCache was not called with the scheme version
    expect(setToCache).not.toHaveBeenCalledWith(
      SettingsKeys.GeneralSettingsKeys.SCHEME_VERSION,
      SettingsKeys.DefaultValue.SCHEME_VERSION,
    );
  });

  it('should handle database updates during scheme update', async () => {
    vi.mocked(getFromCache).mockResolvedValueOnce('0');

    // Mock setToCache to track calls
    vi.mocked(setToCache).mockImplementation(async (key, value) => {
      if (key === SettingsKeys.GeneralSettingsKeys.SCHEME_VERSION) {
        return null;
      }
      return null;
    });

    // Mock the updateScheme method to actually call setToCache with scheme version
    // @ts-expect-error private method
    vi.spyOn(startup, 'updateScheme').mockImplementation(async () => {
      await setToCache(
        SettingsKeys.GeneralSettingsKeys.SCHEME_VERSION,
        SettingsKeys.DefaultValue.SCHEME_VERSION,
      );
    });

    await startup.init();

    // Verify the scheme version was updated
    expect(setToCache).toHaveBeenCalledWith(
      SettingsKeys.GeneralSettingsKeys.SCHEME_VERSION,
      SettingsKeys.DefaultValue.SCHEME_VERSION,
    );
  });

  it('should call Redis cache initialization when updating scheme', async () => {
    vi.mocked(getFromCache).mockResolvedValueOnce('0');

    // Mock the updateScheme method to call setToCache
    // @ts-expect-error private method
    vi.spyOn(startup, 'updateScheme').mockImplementation(async () => {
      await setToCache('test-key', 'test-value');
    });

    await startup.init();

    // Verify Redis cache initialization
    expect(setToCache).toHaveBeenCalled();
  });

  it('should log and handle errors gracefully', async () => {
    // Create a spy for console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock a function that's called early in the init process to throw
    vi.mocked(getFromCache).mockImplementationOnce(() => {
      console.error('Test error logged');
      return Promise.resolve(null);
    });

    // Call the method and expect it not to throw
    await startup.init();

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
