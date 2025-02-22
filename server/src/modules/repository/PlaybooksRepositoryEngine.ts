import { Repositories } from 'ssm-shared-lib';
import PlaybooksRepository from '../../data/database/model/PlaybooksRepository';
import PlaybooksRepositoryRepo from '../../data/database/repository/PlaybooksRepositoryRepo';
import PinoLogger from '../../logger';
import { DEFAULT_VAULT_ID, vaultDecrypt } from '../ansible-vault/ansible-vault';
import { saveSSMDefaultPlaybooksRepositories } from './default-playbooks-repositories';
import GitPlaybooksRepositoryComponent from './git-playbooks-repository/GitPlaybooksRepositoryComponent';
import LocalPlaybooksRepositoryComponent from './local-playbooks-repository/LocalPlaybooksRepositoryComponent';
import { AbstractComponent } from './PlaybooksRepositoryComponent';

const logger = PinoLogger.child(
  { module: 'PlaybooksRepositoryEngine' },
  { msgPrefix: '[PLAYBOOK_REPOSITORY_ENGINE] - ' },
);

type stateType = {
  playbooksRepository: AbstractComponent[];
};

const state: stateType = {
  playbooksRepository: [],
};

/**
 * Return all registered repositories
 * @returns {*}
 */
export function getState(): stateType {
  return state;
}

async function registerGitRepository(playbookRepository: PlaybooksRepository) {
  const {
    uuid,
    name,
    branch,
    email,
    userName,
    accessToken,
    remoteUrl,
    gitService,
    ignoreSSLErrors,
  } = playbookRepository;
  if (!accessToken) {
    throw new Error('accessToken is required');
  }
  const decryptedAccessToken = await vaultDecrypt(accessToken, DEFAULT_VAULT_ID);
  if (!decryptedAccessToken) {
    throw new Error('Error decrypting access token');
  }
  return new GitPlaybooksRepositoryComponent(
    uuid,
    logger,
    name,
    // @ts-expect-error partial type to fix
    branch,
    email,
    userName,
    decryptedAccessToken,
    remoteUrl,
    gitService,
    ignoreSSLErrors,
  );
}

async function registerLocalRepository(playbookRepository: PlaybooksRepository) {
  if (!playbookRepository.directory) {
    throw new Error('playbookRepository.directory is required');
  }
  return new LocalPlaybooksRepositoryComponent(
    playbookRepository.uuid,
    logger,
    playbookRepository.name,
    playbookRepository.directory.replace(`/${playbookRepository.uuid}`, ''),
  );
}

async function registerRepository(playbookRepository: PlaybooksRepository) {
  logger.info(
    `[PLAYBOOKS_REPOSITORY_ENGINE] - Registering ${playbookRepository.name}/${playbookRepository.uuid}`,
  );

  switch (playbookRepository.type) {
    case Repositories.RepositoryType.GIT:
      state.playbooksRepository[playbookRepository.uuid] =
        await registerGitRepository(playbookRepository);
      break;
    case Repositories.RepositoryType.LOCAL:
      state.playbooksRepository[playbookRepository.uuid] =
        await registerLocalRepository(playbookRepository);
      break;
    default:
      throw new Error('Unknown playbook repository type');
  }
  return state.playbooksRepository[playbookRepository.uuid];
}

async function registerRepositories() {
  const repos = await PlaybooksRepositoryRepo.findAllActive();
  logger.info(`[PLAYBOOKS_REPOSITORY_ENGINE] Found ${repos?.length} active repositories`);
  const repositoriesToRegister: any = [];
  repos?.map((repo) => {
    repositoriesToRegister.push(registerRepository(repo));
  });
  await Promise.all(repositoriesToRegister);
}

async function deregisterRepository(uuid: string) {
  const repository = getState().playbooksRepository[uuid];
  if (!repository) {
    throw new Error('Repository not found');
  }
  delete state.playbooksRepository[uuid];
}

async function clone(uuid: string) {
  const gitRepository = getState().playbooksRepository[uuid];
  if (!gitRepository) {
    throw new Error("Repository not registered / doesn't exist");
  }
  await gitRepository.clone();
}

async function init() {
  await saveSSMDefaultPlaybooksRepositories();
  try {
    await registerRepositories();
  } catch (error) {
    logger.fatal(
      'Error during PlaybooksRepositoryEngine initialization, your system may not be stable',
    );
    logger.fatal(error);
  }
}

async function syncAllRegistered() {
  logger.warn(
    `[PLAYBOOKS_REPOSITORY_ENGINE] - syncAllRegistered, ${getState().playbooksRepository.length} registered`,
  );
  await Promise.all(
    Object.values(getState().playbooksRepository).map((component) => {
      return component.syncFromRepository();
    }),
  );
}

export default {
  registerRepositories,
  syncAllRegistered,
  registerRepository,
  clone,
  init,
  deregisterRepository,
  getState,
};
