import { SettingsKeys } from 'ssm-shared-lib';
import { getFromCache, setToCache } from '../../data/cache';
import initRedisValues from '../../data/cache/defaults';
import { PlaybookModel } from '../../data/database/model/Playbook';
import { copyAnsibleCfgFileIfDoesntExist } from '../../helpers/ansible/AnsibleConfigurationHelper';
import PinoLogger from '../../logger';
import AutomationEngine from '../../modules/automations/AutomationEngine';
import Crons from '../../modules/crons';
import WatcherEngine from '../../modules/docker/core/WatcherEngine';
import providerConf from '../../modules/docker/registries/providers/provider.conf';
import NotificationComponent from '../../modules/notifications/NotificationComponent';
import { createADefaultLocalUserRepository } from '../../modules/playbooks-repository/default-repositories';
import PlaybooksRepositoryEngine from '../../modules/playbooks-repository/PlaybooksRepositoryEngine';
import ContainerRegistryUseCases from '../../services/ContainerRegistryUseCases';
import DeviceAuthUseCases from '../../services/DeviceAuthUseCases';
import { setAnsibleVersions } from '../system/ansible-versions';

class Startup {
  private logger = PinoLogger.child({ module: 'Startup' }, { msgPrefix: '[STARTUP] - ' });
  private static readonly MODULE_STARTUP = '[STARTUP]';

  async init() {
    const schemeVersion = await this.initializeSchemeVersion();
    await this.initializeModules();
    if (true || this.isSchemeVersionDifferent(schemeVersion)) {
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
    await DeviceAuthUseCases.saveAllDeviceAuthSshKeys();
    await PlaybooksRepositoryEngine.init();
    void NotificationComponent.init();
    void Crons.initScheduledJobs();
    void WatcherEngine.init();
    void AutomationEngine.init();
  }

  private async updateScheme() {
    this.logger.warn(`Scheme version differed, starting writing updates`);
    await PlaybookModel.syncIndexes();
    await createADefaultLocalUserRepository();
    await initRedisValues();
    void setAnsibleVersions();
    await PlaybooksRepositoryEngine.syncAllRegistered();
    this.registerPersistedProviders();
    copyAnsibleCfgFileIfDoesntExist();
    await setToCache('_ssm_masterNodeUrl', (await getFromCache('ansible-master-node-url')) || '');
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
