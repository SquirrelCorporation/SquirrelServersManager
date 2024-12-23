import { Repositories, SettingsKeys, SsmGit } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';
import { getFromCache, setToCache } from '../../data/cache';
import initRedisValues from '../../data/cache/defaults';
import { ContainerCustomStackModel } from '../../data/database/model/ContainerCustomStack';
import { ContainerCustomStacksRepositoryModel } from '../../data/database/model/ContainerCustomStackRepository';
import { ContainerVolumeModel } from '../../data/database/model/ContainerVolume';
import { DeviceModel } from '../../data/database/model/Device';
import { PlaybookModel } from '../../data/database/model/Playbook';
import { PlaybooksRepositoryModel } from '../../data/database/model/PlaybooksRepository';
import { copyAnsibleCfgFileIfDoesntExist } from '../../helpers/ansible/AnsibleConfigurationHelper';
import PinoLogger from '../../logger';
import AutomationEngine from '../../modules/automations/AutomationEngine';
import Crons from '../../modules/crons';
import WatcherEngine from '../../modules/containers/core/WatcherEngine';
import providerConf from '../../modules/containers/registries/providers/provider.conf';
import NotificationComponent from '../../modules/notifications/NotificationComponent';
import ContainerCustomStacksRepositoryEngine from '../../modules/repository/ContainerCustomStacksRepositoryEngine';
import { createADefaultLocalUserRepository } from '../../modules/repository/default-playbooks-repositories';
import PlaybooksRepositoryEngine from '../../modules/repository/PlaybooksRepositoryEngine';
import sshPrivateKeyFileManager from '../../modules/shell/managers/SshPrivateKeyFileManager';
import Telemetry from '../../modules/telemetry';
import UpdateChecker from '../../modules/update/UpdateChecker';
import ContainerRegistryUseCases from '../../services/ContainerRegistryUseCases';
import { setAnsibleVersions } from '../system/ansible-versions';

class Startup {
  private logger = PinoLogger.child({ module: 'Startup' }, { msgPrefix: '[STARTUP] - ' });

  async init() {
    this.logger.info(`Initializing...`);
    const schemeVersion = await this.initializeSchemeVersion();
    if (this.isSchemeVersionDifferent(schemeVersion)) {
      await this.updateScheme();
    }
    await this.initializeModules();
  }

  private async initializeSchemeVersion(): Promise<string | null> {
    const schemeVersion = await getFromCache(SettingsKeys.GeneralSettingsKeys.SCHEME_VERSION);
    this.logger.info(`initializeSchemeVersion - Saved scheme version: ${schemeVersion}`);
    return schemeVersion;
  }

  private async initializeModules() {
    //  await PlaybooksRepositoryEngine.init();
    // void PlaybooksRepositoryEngine.syncAllRegistered();
    void sshPrivateKeyFileManager.removeAllAnsibleTemporaryPrivateKeys();
    void NotificationComponent.init();
    void Crons.initScheduledJobs();
    void WatcherEngine.init();
    //void AutomationEngine.init();
    // void UpdateChecker.checkVersion();
    // void ContainerCustomStacksRepositoryEngine.init();
    void Telemetry.init();
  }

  private async updateScheme() {
    this.logger.warn('updateScheme - Scheme version differed, starting applying updates...');

    try {
      const installId = await getFromCache(SettingsKeys.GeneralSettingsKeys.INSTALL_ID);
      if (!installId) {
        await setToCache(SettingsKeys.GeneralSettingsKeys.INSTALL_ID, uuidv4());
      }
    } catch (error: any) {
      this.logger.error(`Error settings installId: ${error.message}`);
    }

    try {
      await PlaybookModel.syncIndexes();
      this.logger.info('PlaybookModel indexes synchronized successfully.');
    } catch (error: any) {
      this.logger.error(`Error synchronizing PlaybookModel indexes: ${error.message}`);
    }

    try {
      await DeviceModel.syncIndexes();
      this.logger.info('DeviceModel indexes synchronized successfully.');
    } catch (error: any) {
      this.logger.error(`Error synchronizing DeviceModel indexes: ${error.message}`);
    }

    try {
      await createADefaultLocalUserRepository();
      this.logger.info('Created default local user repository successfully.');
    } catch (error: any) {
      this.logger.error(`Error creating default local user repository: ${error.message}`);
    }

    try {
      await initRedisValues();
      this.logger.info('Initialized Redis values successfully.');
    } catch (error: any) {
      this.logger.error(`Error initializing Redis values: ${error.message}`);
    }

    try {
      void setAnsibleVersions(); // Setting versions asynchronously without waiting
      this.logger.info('Ansible versions set successfully.');
    } catch (error: any) {
      this.logger.error(`Error setting Ansible versions: ${error.message}`);
    }

    try {
      this.registerPersistedProviders();
      this.logger.info('Persisted providers registered successfully.');
    } catch (error: any) {
      this.logger.error(`Error registering persisted providers: ${error.message}`);
    }

    try {
      copyAnsibleCfgFileIfDoesntExist();
      this.logger.info("Ansible configuration file copied if it didn't exist.");
    } catch (error: any) {
      this.logger.error(`Error copying Ansible configuration file: ${error.message}`);
    }

    try {
      const masterNodeUrl = await getFromCache('_ssm_masterNodeUrl');
      if (!masterNodeUrl) {
        await setToCache(
          '_ssm_masterNodeUrl',
          (await getFromCache('ansible-master-node-url')) || '',
        );
        this.logger.info('Master Node URL set in cache successfully.');
      }
    } catch (error: any) {
      this.logger.error(`Error managing master node URL in cache: ${error.message}`);
    }

    try {
      await ContainerCustomStackModel.updateMany(
        { type: { $exists: false } },
        { $set: { type: Repositories.RepositoryType.LOCAL } },
      );
      this.logger.info('Container custom stack models updated successfully.');
    } catch (error: any) {
      this.logger.error(`Error updating container custom stack models: ${error.message}`);
    }

    try {
      const containerVolumes = await ContainerVolumeModel.find({ uuid: { $exists: false } });
      for (const volume of containerVolumes) {
        volume.uuid = uuidv4();
        await volume.save();
      }
      this.logger.info('Container volumes updated successfully.');
    } catch (error: any) {
      this.logger.error(`Error updating container volumes: ${error.message}`);
    }

    try {
      const containerCustomStackRepositories = await ContainerCustomStacksRepositoryModel.find({
        gitService: { $exists: false },
      });
      for (const repo of containerCustomStackRepositories) {
        repo.gitService = SsmGit.Services.Github;
        await repo.save();
      }
      this.logger.info('Container custom stack repositories updated successfully.');
    } catch (error: any) {
      this.logger.error(`Error updating container custom stack repositories: ${error.message}`);
    }

    try {
      const playbookGitRepositories = await PlaybooksRepositoryModel.find({
        gitService: { $exists: false },
        type: Repositories.RepositoryType.GIT,
      });
      for (const repo of playbookGitRepositories) {
        repo.gitService = SsmGit.Services.Github;
        await repo.save();
      }
      this.logger.info('Playbook Git repositories updated successfully.');
    } catch (error: any) {
      this.logger.error(`Error updating playbook Git repositories: ${error.message}`);
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
