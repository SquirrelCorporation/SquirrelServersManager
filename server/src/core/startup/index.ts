import { SettingsKeys } from 'ssm-shared-lib';
import { getFromCache } from '../../data/cache';
import initRedisValues from '../../data/cache/defaults';
import { PlaybookModel } from '../../data/database/model/Playbook';
import PinoLogger from '../../logger';
import AutomationEngine from '../../modules/automations/AutomationEngine';
import Crons from '../../modules/crons';
import WatcherEngine from '../../modules/docker/core/WatcherEngine';
import providerConf from '../../modules/docker/registries/providers/provider.conf';
import NotificationComponent from '../../modules/notifications/NotificationComponent';
import { createADefaultLocalUserRepository } from '../../modules/playbooks-repository/default-repositories';
import PlaybooksRepositoryEngine from '../../modules/playbooks-repository/PlaybooksRepositoryEngine';
import ContainerRegistryUseCases from '../../use-cases/ContainerRegistryUseCases';
import DeviceAuthUseCases from '../../use-cases/DeviceAuthUseCases';
import { setAnsibleVersions } from '../system/ansible-versions';

class Startup {
  private logger = PinoLogger.child({ module: 'Startup' }, { msgPrefix: '[STARTUP] - ' });

  async init() {
    const version = await getFromCache(SettingsKeys.GeneralSettingsKeys.SCHEME_VERSION);
    this.logger.info(`initialization`);
    this.logger.info(`initialization - Scheme Version: ${version}`);
    // Must be called first
    void DeviceAuthUseCases.saveAllDeviceAuthSshKeys();
    // Sync to prevent empty UI.
    await PlaybooksRepositoryEngine.init();
    // the rest
    void NotificationComponent.init();
    void Crons.initScheduledJobs();
    void WatcherEngine.init();
    void AutomationEngine.init();

    if (version !== SettingsKeys.DefaultValue.SCHEME_VERSION) {
      await this.migrate();
      await createADefaultLocalUserRepository();
      this.logger.warn(`Scheme version differed, starting writing updates`);
      await initRedisValues();
      void setAnsibleVersions();
      await PlaybooksRepositoryEngine.syncAllRegistered();
      providerConf
        .filter(({ persist }) => persist)
        .map((e) => {
          ContainerRegistryUseCases.addIfNotExists(e);
        });
    }
  }

  private async migrate() {
    try {
      await PlaybookModel.syncIndexes();
    } catch (error: any) {
      this.logger.error(error);
    }
  }
}

export default new Startup();
