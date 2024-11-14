import { Repositories, SettingsKeys } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';
import { getFromCache, setToCache } from '../../data/cache';
import initRedisValues from '../../data/cache/defaults';
import { ContainerCustomStackModel } from '../../data/database/model/ContainerCustomStack';
import { ContainerVolumeModel } from '../../data/database/model/ContainerVolume';
import { DeviceModel } from '../../data/database/model/Device';
import { PlaybookModel } from '../../data/database/model/Playbook';
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

  async init() {
    this.logger.info(`Initializing...`);
    const schemeVersion = await this.initializeSchemeVersion();
    await this.initializeModules();
    if (this.isSchemeVersionDifferent(schemeVersion)) {
      await this.updateScheme();
    }
  }

  private async initializeSchemeVersion(): Promise<string | null> {
    const schemeVersion = await getFromCache(SettingsKeys.GeneralSettingsKeys.SCHEME_VERSION);
    this.logger.info(`initializeSchemeVersion - Saved scheme version: ${schemeVersion}`);
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
    this.logger.warn(`updateScheme- Scheme version differed, starting applying updates...`);
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
    const containerVolumes = await ContainerVolumeModel.find({ uuid: { $exists: false } });
    for (const volume of containerVolumes) {
      volume.uuid = uuidv4();
      await volume.save();
    }
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
