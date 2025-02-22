import ContainerCustomStackRepository from '../../data/database/model/ContainerCustomStackRepository';
import ContainerCustomStackRepositoryRepo from '../../data/database/repository/ContainerCustomStackRepositoryRepo';
import PinoLogger from '../../logger';
import { DEFAULT_VAULT_ID, vaultDecrypt } from '../ansible-vault/ansible-vault';
import ContainerCustomStacksRepositoryComponent from './ContainerCustomStacksRepositoryComponent';

const logger = PinoLogger.child(
  { module: 'ContainerCustomStacksRepositoryEngine' },
  { msgPrefix: '[CONTAINER_CUSTOM_STACKS_REPOSITORY_ENGINE] - ' },
);

type stateType = {
  stackRepository: ContainerCustomStacksRepositoryComponent[];
};

const state: stateType = {
  stackRepository: [],
};

/**
 * Return all registered repositories
 * @returns {*}
 */
export function getState(): stateType {
  return state;
}

async function registerGitRepository(
  containerCustomStackRepository: ContainerCustomStackRepository,
) {
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
  } = containerCustomStackRepository;
  if (!accessToken) {
    throw new Error('accessToken is required');
  }
  const decryptedAccessToken = await vaultDecrypt(accessToken, DEFAULT_VAULT_ID);
  if (!decryptedAccessToken) {
    throw new Error('Error decrypting access token');
  }
  return new ContainerCustomStacksRepositoryComponent(
    uuid,
    name,
    branch,
    email,
    userName,
    decryptedAccessToken,
    remoteUrl,
    gitService,
    ignoreSSLErrors,
  );
}

async function registerRepository(containerCustomStackRepository: ContainerCustomStackRepository) {
  logger.info(
    `Registering: ${containerCustomStackRepository.name}/${containerCustomStackRepository.uuid}`,
  );
  state.stackRepository[containerCustomStackRepository.uuid] = await registerGitRepository(
    containerCustomStackRepository,
  );
  return state.stackRepository[
    containerCustomStackRepository.uuid
  ] as ContainerCustomStacksRepositoryComponent;
}

async function registerRepositories() {
  const repos = await ContainerCustomStackRepositoryRepo.findAllActive();
  logger.info(`Found ${repos?.length} active repositories in database.`);
  const repositoriesToRegister: any = [];
  repos?.map((repo) => {
    repositoriesToRegister.push(registerRepository(repo));
  });
  await Promise.all(repositoriesToRegister);
}

async function deregisterRepository(uuid: string) {
  const repository = getState().stackRepository[uuid];
  if (!repository) {
    throw new Error('Repository not found');
  }
  delete state.stackRepository[uuid];
}

async function clone(uuid: string) {
  const gitRepository = getState().stackRepository[uuid];
  if (!gitRepository) {
    throw new Error("Repository not registered / doesn't exist");
  }
  await gitRepository.clone();
}

async function init() {
  try {
    await registerRepositories();
  } catch (error) {
    logger.fatal('Error during initialization, your system may not be stable');
    logger.fatal(error);
  }
}

async function syncAllRegistered() {
  logger.warn(`syncAllRegistered, ${getState().stackRepository.length} registered`);
  await Promise.all(
    Object.values(getState().stackRepository).map((component) => {
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
