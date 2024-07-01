import { Playbooks, SettingsKeys } from 'ssm-shared-lib';
import { getFromCache } from '../../data/cache';
import initRedisValues from '../../data/cache/defaults';
import { PlaybookModel } from '../../data/database/model/Playbook';
import PlaybooksRepositoryRepo from '../../data/database/repository/PlaybooksRepositoryRepo';
import Crons from '../../integrations/crons';
import WatcherEngine from '../../integrations/docker/core/WatcherEngine';
import providerConf from '../../integrations/docker/registries/providers/provider.conf';
import PlaybooksRepositoryEngine from '../../integrations/playbooks-repository/PlaybooksRepositoryEngine';
import logger from '../../logger';
import ContainerRegistryUseCases from '../../use-cases/ContainerRegistryUseCases';
import DeviceAuthUseCases from '../../use-cases/DeviceAuthUseCases';
import { setAnsibleVersion } from '../system/version';

const corePlaybooksRepository = {
  name: 'ssm-core',
  uuid: '00000000-0000-0000-0000-000000000000',
  enabled: true,
  type: Playbooks.PlaybooksRepositoryType.LOCAL,
  directory: '/server/src/ansible/00000000-0000-0000-0000-000000000000',
  default: true,
};

const toolsPlaybooksRepository = {
  name: 'ssm-tools',
  uuid: '00000000-0000-0000-0000-000000000001',
  enabled: true,
  type: Playbooks.PlaybooksRepositoryType.LOCAL,
  directory: '/server/src/ansible/00000000-0000-0000-0000-000000000001',
  default: true,
};

async function init() {
  const version = await getFromCache(SettingsKeys.GeneralSettingsKeys.SCHEME_VERSION);
  logger.info(`[CONFIGURATION] - initialization`);
  logger.info(`[CONFIGURATION] - initialization - Scheme Version: ${version}`);

  await PlaybooksRepositoryRepo.updateOrCreate(corePlaybooksRepository);
  await PlaybooksRepositoryRepo.updateOrCreate(toolsPlaybooksRepository);
  await PlaybooksRepositoryEngine.init();
  void DeviceAuthUseCases.saveAllDeviceAuthSshKeys();
  void Crons.initScheduledJobs();
  void WatcherEngine.init();

  if (version !== SettingsKeys.DefaultValue.SCHEME_VERSION + 1) {
    await migrate();
    logger.warn(`[CONFIGURATION] - Scheme version differed, starting writing updates`);
    await initRedisValues();
    void setAnsibleVersion();
    await PlaybooksRepositoryEngine.syncAllRegistered();
    providerConf
      .filter(({ persist }) => persist)
      .map((e) => {
        ContainerRegistryUseCases.addIfNotExists(e);
      });
  }
}

async function migrate() {
  try {
    await PlaybookModel.syncIndexes();
  } catch (error: any) {
    logger.error(error);
  }
}

export default {
  init,
};
