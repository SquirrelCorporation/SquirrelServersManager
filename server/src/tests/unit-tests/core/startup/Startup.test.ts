import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Repositories, SettingsKeys } from 'ssm-shared-lib';
import { ContainerCustomStackModel } from '../../../../data/database/model/ContainerCustomStack';
import Startup from '../../../../core/startup/';
import { getFromCache, setToCache } from '../../../../data/cache';
import { ContainerCustomStacksRepositoryModel } from '../../../../data/database/model/ContainerCustomStackRepository';
import { ContainerVolumeModel } from '../../../../data/database/model/ContainerVolume';
import { DeviceModel } from '../../../../data/database/model/Device';
import { PlaybookModel } from '../../../../data/database/model/Playbook';
import { PlaybooksRepositoryModel } from '../../../../data/database/model/PlaybooksRepository';
import AutomationEngine from '../../../../modules/automations/AutomationEngine';
import WatcherEngine from '../../../../modules/containers/core/WatcherEngine';
import NotificationComponent from '../../../../modules/notifications/NotificationComponent';
import ContainerCustomStacksRepositoryEngine from '../../../../modules/repository/ContainerCustomStacksRepositoryEngine';
import PlaybooksRepositoryEngine from '../../../../modules/repository/PlaybooksRepositoryEngine';
import sshPrivateKeyFileManager from '../../../../modules/shell/managers/SshPrivateKeyFileManager';
import Telemetry from '../../../../modules/telemetry';
import UpdateChecker from '../../../../modules/update/UpdateChecker';
import Crons from '../../../../modules/crons';

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
vi.mock('../../../../data/database/repository/DeviceRepo', () => ({
  default: { findAll: async () => [], findWithFilter: async () => [] },
}));
vi.mock('../../../../helpers/ansible/AnsibleConfigurationHelper', () => ({
  copyAnsibleCfgFileIfDoesntExist: vi.fn(),
}));

vi.mock('../../../../modules/crons', () => ({ default: { initScheduledJobs: vi.fn() } }));
vi.mock('../../../../modules/containers/core/WatcherEngine', () => ({
  default: { init: vi.fn() },
}));
vi.mock('../../../../modules/automations/AutomationEngine', () => ({ default: { init: vi.fn() } }));
vi.mock('../../../../modules/update/UpdateChecker', () => ({ default: { checkVersion: vi.fn() } }));
vi.mock('../../../../modules/telemetry', () => ({ default: { init: vi.fn() } }));
vi.mock('../../../../modules/notifications/NotificationComponent', () => ({
  default: { init: vi.fn() },
}));
vi.mock('../../../../modules/repository/ContainerCustomStacksRepositoryEngine', () => ({
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

  it('should initialize modules correctly on init', async () => {
    await startup.init();

    // Check modules initialization
    expect(getFromCache).toBeCalledWith(SettingsKeys.GeneralSettingsKeys.SCHEME_VERSION);
    expect(PlaybooksRepositoryEngine.init).toHaveBeenCalled();
    expect(PlaybooksRepositoryEngine.syncAllRegistered).toHaveBeenCalled();
    expect(Crons.initScheduledJobs).toHaveBeenCalled();
    expect(WatcherEngine.init).toHaveBeenCalled();
    expect(AutomationEngine.init).toHaveBeenCalled();
    expect(UpdateChecker.checkVersion).toHaveBeenCalled();
    expect(ContainerCustomStacksRepositoryEngine.init).toHaveBeenCalled();
    expect(Telemetry.init).toHaveBeenCalled();
    expect(NotificationComponent.init).toHaveBeenCalled();
    expect(sshPrivateKeyFileManager.removeAllAnsibleTemporaryPrivateKeys).toHaveBeenCalled();
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

    expect(getFromCache).toHaveBeenCalledWith(SettingsKeys.GeneralSettingsKeys.SCHEME_VERSION);
    expect(ContainerCustomStackModel.updateMany).not.toHaveBeenCalled();
  });

  it('should handle database updates during scheme update', async () => {
    vi.mocked(getFromCache).mockResolvedValue('old-version');

    await startup.init();

    // Ensure the necessary database updates were attempted
    expect(PlaybookModel.syncIndexes).toHaveBeenCalled();
    expect(DeviceModel.syncIndexes).toHaveBeenCalled();
    expect(ContainerCustomStackModel.updateMany).toHaveBeenCalledWith(
      { type: { $exists: false } },
      { $set: { type: Repositories.RepositoryType.LOCAL } },
    );
    expect(ContainerVolumeModel.find).toHaveBeenCalled();
    expect(ContainerCustomStacksRepositoryModel.find).toHaveBeenCalled();
    expect(PlaybooksRepositoryModel.find).toHaveBeenCalled();
  });

  it('should call Redis cache initialization when updating scheme', async () => {
    vi.mocked(getFromCache).mockResolvedValueOnce('old-version');
    await startup.init();

    // Ensure Redis initialization is attempted
    expect(setToCache).toHaveBeenCalledWith(
      SettingsKeys.GeneralSettingsKeys.INSTALL_ID,
      expect.any(String),
    );
  });

  it('should log and handle errors gracefully', async () => {
    const errorMessage = 'Test error';
    vi.spyOn(startup['logger'], 'error').mockImplementation(() => {});
    vi.spyOn(DeviceModel, 'syncIndexes').mockRejectedValue(new Error(errorMessage));

    await expect(startup.init()).resolves.not.toThrow();

    expect(startup['logger'].error).toHaveBeenCalledWith(
      `Error synchronizing DeviceModel indexes: ${errorMessage}`,
    );
  });
});
