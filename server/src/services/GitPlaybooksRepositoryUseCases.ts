import { Repositories } from 'ssm-shared-lib';
import { v4 as uuidv4 } from 'uuid';
import PlaybooksRepositoryRepo from '../data/database/repository/PlaybooksRepositoryRepo';
import PlaybooksRepositoryEngine from '../modules/repository/PlaybooksRepositoryEngine';

async function addGitRepository(
  name: string,
  accessToken: string,
  branch: string,
  email: string,
  userName: string,
  remoteUrl: string,
  directoryExclusionList?: string[],
) {
  const uuid = uuidv4();
  const gitRepository = await PlaybooksRepositoryEngine.registerRepository({
    uuid,
    type: Repositories.RepositoryType.GIT,
    name,
    branch,
    email,
    userName,
    accessToken,
    remoteUrl,
    enabled: true,
    directoryExclusionList,
  });
  await PlaybooksRepositoryRepo.create({
    uuid,
    type: Repositories.RepositoryType.GIT,
    name,
    remoteUrl,
    accessToken,
    branch,
    email,
    userName,
    directory: gitRepository.getDirectory(),
    enabled: true,
    directoryExclusionList,
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
  directoryExclusionList?: string[],
) {
  await PlaybooksRepositoryEngine.deregisterRepository(uuid);
  const gitRepository = await PlaybooksRepositoryEngine.registerRepository({
    uuid,
    type: Repositories.RepositoryType.GIT,
    name,
    branch,
    email,
    userName,
    accessToken,
    remoteUrl,
    enabled: true,
    directoryExclusionList,
  });
  await PlaybooksRepositoryRepo.update({
    uuid,
    type: Repositories.RepositoryType.GIT,
    name,
    remoteUrl,
    accessToken,
    branch,
    email,
    userName,
    directory: gitRepository.getDirectory(),
    enabled: true,
    directoryExclusionList,
  });
}

async function putRepositoryOnError(repositoryUuid: string, error: any) {
  const repository = await PlaybooksRepositoryRepo.findByUuid(repositoryUuid);
  if (!repository) {
    throw new Error(`Repository with Uuid: ${repositoryUuid} not found`);
  }
  repository.onError = true;
  repository.onErrorMessage = `${error.message}`;
  await PlaybooksRepositoryRepo.update(repository);
}

async function resetRepositoryError(repositoryUuid: string) {
  const repository = await PlaybooksRepositoryRepo.findByUuid(repositoryUuid);
  if (!repository) {
    throw new Error(`Repository with Uuid: ${repositoryUuid} not found`);
  }
  repository.onError = false;
  repository.onErrorMessage = undefined;
  await PlaybooksRepositoryRepo.update(repository);
}

export default {
  addGitRepository,
  updateGitRepository,
  putRepositoryOnError,
  resetRepositoryError,
};
