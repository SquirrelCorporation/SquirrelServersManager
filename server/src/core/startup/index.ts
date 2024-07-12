import { Playbooks, SettingsKeys } from 'ssm-shared-lib';
import { getFromCache } from '../../data/cache';
import initRedisValues from '../../data/cache/defaults';
import { PlaybookModel } from '../../data/database/model/Playbook';
import PlaybooksRepositoryRepo from '../../data/database/repository/PlaybooksRepositoryRepo';
import UserRepo from '../../data/database/repository/UserRepo';
import PinoLogger from '../../logger';
import AutomationEngine from '../../modules/automations/AutomationEngine';
import Crons from '../../modules/crons';
import WatcherEngine from '../../modules/docker/core/WatcherEngine';
import providerConf from '../../modules/docker/registries/providers/provider.conf';
import PlaybooksRepositoryEngine from '../../modules/playbooks-repository/PlaybooksRepositoryEngine';
import Shell from '../../modules/shell';
import ContainerRegistryUseCases from '../../use-cases/ContainerRegistryUseCases';
import DeviceAuthUseCases from '../../use-cases/DeviceAuthUseCases';
import { setAnsibleVersion } from '../system/version';

const logger = PinoLogger.child({ module: 'Startup' }, { msgPrefix: '[STARTUP] - ' });

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
  logger.info(`initialization`);
  logger.info(`initialization - Scheme Version: ${version}`);

  await PlaybooksRepositoryRepo.updateOrCreate(corePlaybooksRepository);
  await PlaybooksRepositoryRepo.updateOrCreate(toolsPlaybooksRepository);
  await PlaybooksRepositoryEngine.init();
  void DeviceAuthUseCases.saveAllDeviceAuthSshKeys();
  void Crons.initScheduledJobs();
  void WatcherEngine.init();
  void AutomationEngine.init();

  if (version !== SettingsKeys.DefaultValue.SCHEME_VERSION) {
    await migrate();
    await createADefaultLocalUserRepository();
    logger.warn(`Scheme version differed, starting writing updates`);
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

export async function createADefaultLocalUserRepository() {
  const user = await UserRepo.findFirst();
  if (user) {
    const userPlaybooksRepository = {
      name: user?.email.trim().split('@')[0] || 'user-default',
      enabled: true,
      type: Playbooks.PlaybooksRepositoryType.LOCAL,
      directory: '/playbooks/00000000-0000-0000-0000-000000000002',
      uuid: '00000000-0000-0000-0000-000000000002',
    };
    await PlaybooksRepositoryRepo.updateOrCreate(userPlaybooksRepository);
    try {
      Shell.FileSystemManager.createDirectory(userPlaybooksRepository.directory);
    } catch (error: any) {}
  }
}

export default {
  init,
};
