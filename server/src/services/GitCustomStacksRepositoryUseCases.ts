import { v4 as uuidv4 } from 'uuid';
import { SsmGit } from 'ssm-shared-lib';
import ContainerCustomStackRepository from '../data/database/model/ContainerCustomStackRepository';
import ContainerCustomStackRepositoryRepo from '../data/database/repository/ContainerCustomStackRepositoryRepo';
import { InternalError } from '../middlewares/api/ApiError';
import ContainerCustomStacksRepositoryComponent from '../modules/repository/ContainerCustomStacksRepositoryComponent';
import ContainerCustomStacksRepositoryEngine from '../modules/repository/ContainerCustomStacksRepositoryEngine';
import Shell from '../modules/shell';

async function addGitRepository(
  name: string,
  accessToken: string,
  branch: string,
  email: string,
  userName: string,
  remoteUrl: string,
  gitService: SsmGit.Services,
  matchesList?: string[],
) {
  const uuid = uuidv4();
  const gitRepository = await ContainerCustomStacksRepositoryEngine.registerRepository({
    uuid,
    name,
    branch,
    email,
    userName,
    accessToken,
    remoteUrl,
    enabled: true,
    matchesList,
    gitService,
  });
  await ContainerCustomStackRepositoryRepo.create({
    uuid,
    name,
    remoteUrl,
    accessToken,
    branch,
    email,
    userName,
    enabled: true,
    matchesList,
    gitService,
  });
  void gitRepository.clone(true);
}

async function updateGitRepository(
  uuid: string,
  name: string,
  accessToken: string,
  branch: string,
  email: string,
  userName: string,
  remoteUrl: string,
  gitService: SsmGit.Services,
  matchesList?: string[],
) {
  await ContainerCustomStacksRepositoryEngine.deregisterRepository(uuid);
  await ContainerCustomStacksRepositoryEngine.registerRepository({
    uuid,
    name,
    branch,
    email,
    userName,
    accessToken,
    remoteUrl,
    enabled: true,
    matchesList,
    gitService,
  });
  await ContainerCustomStackRepositoryRepo.update({
    uuid,
    name,
    remoteUrl,
    accessToken,
    branch,
    email,
    userName,
    enabled: true,
    matchesList,
    gitService,
  });
}

async function deleteRepository(repository: ContainerCustomStackRepository): Promise<void> {
  const repositoryComponent = ContainerCustomStacksRepositoryEngine.getState().stackRepository[
    repository.uuid
  ] as ContainerCustomStacksRepositoryComponent;
  if (!repositoryComponent) {
    throw new InternalError(`Container Custom Stacks Repository doesnt seem registered`);
  }
  const directory = repositoryComponent.getDirectory();
  await ContainerCustomStacksRepositoryEngine.deregisterRepository(repository.uuid);
  await ContainerCustomStackRepositoryRepo.deleteByUuid(repository.uuid);
  Shell.FileSystemManager.deleteFiles(directory);
}

async function putRepositoryOnError(repositoryUuid: string, error: any) {
  const repository = await ContainerCustomStackRepositoryRepo.findOneByUuid(repositoryUuid);
  if (!repository) {
    throw new Error(`Repository with Uuid: ${repositoryUuid} not found`);
  }
  repository.onError = true;
  repository.onErrorMessage = `${error.message}`;
  await ContainerCustomStackRepositoryRepo.update(repository);
}

async function resetRepositoryError(repositoryUuid: string) {
  const repository = await ContainerCustomStackRepositoryRepo.findOneByUuid(repositoryUuid);
  if (!repository) {
    throw new Error(`Repository with Uuid: ${repositoryUuid} not found`);
  }
  repository.onError = false;
  repository.onErrorMessage = undefined;
  await ContainerCustomStackRepositoryRepo.update(repository);
}

export default {
  addGitRepository,
  updateGitRepository,
  deleteRepository,
  putRepositoryOnError,
  resetRepositoryError,
};
