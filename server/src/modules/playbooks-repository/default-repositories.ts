import { Playbooks } from 'ssm-shared-lib';
import PlaybooksRepositoryRepo from '../../data/database/repository/PlaybooksRepositoryRepo';
import UserRepo from '../../data/database/repository/UserRepo';
import PinoLogger from '../../logger';
import Shell from '../shell';

const logger = PinoLogger.child(
  { module: 'PlaybooksRepositoryEngine' },
  { msgPrefix: '[PLAYBOOK_REPOSITORY_ENGINE] - ' },
);

const corePlaybooksRepository = {
  name: 'ssm-core',
  uuid: '00000000-0000-0000-0000-000000000000',
  enabled: true,
  type: Playbooks.PlaybooksRepositoryType.LOCAL,
  directory: '/opt/squirrelserversmanager/server/src/ansible/00000000-0000-0000-0000-000000000000',
  default: true,
};

const toolsPlaybooksRepository = {
  name: 'ssm-tools',
  uuid: '00000000-0000-0000-0000-000000000001',
  enabled: true,
  type: Playbooks.PlaybooksRepositoryType.LOCAL,
  directory: '/opt/squirrelserversmanager/server/src/ansible/00000000-0000-0000-0000-000000000001',
  default: true,
};

export async function saveSSMDefaultPlaybooksRepositories() {
  await PlaybooksRepositoryRepo.updateOrCreate(corePlaybooksRepository);
  await PlaybooksRepositoryRepo.updateOrCreate(toolsPlaybooksRepository);
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
    } catch (error: any) {
      logger.error(error);
    }
  }
}
