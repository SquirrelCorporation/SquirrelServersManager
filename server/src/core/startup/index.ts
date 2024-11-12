import { Repositories, SettingsKeys, SsmAnsible } from 'ssm-shared-lib';
import { getFromCache, setToCache } from '../../data/cache';
import initRedisValues from '../../data/cache/defaults';
import { ContainerCustomStackModel } from '../../data/database/model/ContainerCustomStack';
import { DeviceModel } from '../../data/database/model/Device';
import { PlaybookModel } from '../../data/database/model/Playbook';
import UserRepo from '../../data/database/repository/UserRepo';
import { copyAnsibleCfgFileIfDoesntExist } from '../../helpers/ansible/AnsibleConfigurationHelper';
import PinoLogger from '../../logger';
import AutomationEngine from '../../modules/automations/AutomationEngine';
import Crons from '../../modules/crons';
import WatcherEngine from '../../modules/docker/core/WatcherEngine';
import providerConf from '../../modules/docker/registries/providers/provider.conf';
import NotificationComponent from '../../modules/notifications/NotificationComponent';
import ContainerCustomStacksRepositoryEngine from '../../modules/repository/ContainerCustomStacksRepositoryEngine';
import { createADefaultLocalUserRepository } from '../../modules/repository/default-playbooks-repositories';
import PlaybooksRepositoryEngine from '../../modules/repository/PlaybooksRepositoryEngine';
import sshPrivateKeyFileManager from '../../modules/shell/managers/SshPrivateKeyFileManager';
import UpdateChecker from '../../modules/update/UpdateChecker';
import ContainerRegistryUseCases from '../../services/ContainerRegistryUseCases';
import { setAnsibleVersions } from '../system/ansible-versions';

class Startup {
  private logger = PinoLogger.child({ module: 'Startup' }, { msgPrefix: '[STARTUP] - ' });
  private static readonly MODULE_STARTUP = '[STARTUP]';

  async init() {
    const schemeVersion = await this.initializeSchemeVersion();
    await this.initializeModules();
    if (this.isSchemeVersionDifferent(schemeVersion)) {
      await this.updateScheme();
    }
  }

  private async initializeSchemeVersion(): Promise<string | null> {
    const schemeVersion = await getFromCache(SettingsKeys.GeneralSettingsKeys.SCHEME_VERSION);
    this.logger.info(`initialization`);
    this.logger.info(`${Startup.MODULE_STARTUP} - Scheme Version: ${schemeVersion}`);
    return schemeVersion;
  }

  private async initializeModules() {
    await PlaybooksRepositoryEngine.init();
    void sshPrivateKeyFileManager.removeAllAnsibleTemporaryPrivateKeys();
    void NotificationComponent.init();
    void Crons.initScheduledJobs();
    void WatcherEngine.init();
    void AutomationEngine.init();
    void UpdateChecker.checkVersion();
    void ContainerCustomStacksRepositoryEngine.init();
  }

  private async updateScheme() {
    this.logger.warn(`Scheme version differed, starting writing updates`);
    await PlaybookModel.syncIndexes();
    await DeviceModel.syncIndexes();
    await createADefaultLocalUserRepository();
    await initRedisValues();
    void setAnsibleVersions();
    await PlaybooksRepositoryEngine.syncAllRegistered();
    this.registerPersistedProviders();
    copyAnsibleCfgFileIfDoesntExist();
    await setToCache('_ssm_masterNodeUrl', (await getFromCache('ansible-master-node-url')) || '');
    await ContainerCustomStackModel.updateMany(
      { type: { $exists: false } },
      { $set: { type: Repositories.RepositoryType.LOCAL } },
    );
  }

  private isSchemeVersionDifferent(schemeVersion: string | null): boolean {
    return schemeVersion !== SettingsKeys.DefaultValue.SCHEME_VERSION;
  }

  private registerPersistedProviders() {
    providerConf
      .filter(({ persist }) => persist)
      .forEach((config) => {
        void ContainerRegistryUseCases.addIfNotExists(config);
      });
  }
}

export default new Startup();
