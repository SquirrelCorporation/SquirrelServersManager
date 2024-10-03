import { Playbooks } from 'ssm-shared-lib';
import PlaybooksRepositoryRepo from '../../../data/database/repository/PlaybooksRepositoryRepo';
import { NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import asyncHandler from '../../../middlewares/AsyncHandler';
import { DEFAULT_VAULT_ID, vaultEncrypt } from '../../../modules/ansible-vault/ansible-vault';
import GitRepositoryComponent from '../../../modules/playbooks-repository/git-repository/GitRepositoryComponent';
import PlaybooksRepositoryEngine from '../../../modules/playbooks-repository/PlaybooksRepositoryEngine';
import GitRepositoryUseCases from '../../../services/GitRepositoryUseCases';
import PlaybooksRepositoryUseCases from '../../../services/PlaybooksRepositoryUseCases';

export const addGitRepository = asyncHandler(async (req, res) => {
  const {
    name,
    accessToken,
    branch,
    email,
    userName,
    remoteUrl,
    directoryExclusionList,
  }: {
    name: string;
    accessToken: string;
    branch: string;
    email: string;
    userName: string;
    remoteUrl: string;
    directoryExclusionList?: string[];
  } = req.body;
  await GitRepositoryUseCases.addGitRepository(
    name,
    await vaultEncrypt(accessToken, DEFAULT_VAULT_ID),
    branch,
    email,
    userName,
    remoteUrl,
    directoryExclusionList,
  );
  return new SuccessResponse('Added playbooks git repository').send(res);
});

export const getGitRepositories = asyncHandler(async (req, res) => {
  const repositories = await PlaybooksRepositoryRepo.findAllWithType(
    Playbooks.PlaybooksRepositoryType.GIT,
  );
  const encryptedRepositories = repositories?.map((repo) => ({
    ...repo,
    accessToken: 'REDACTED',
  }));
  return new SuccessResponse('Got playbooks git repositories', encryptedRepositories).send(res);
});

export const updateGitRepository = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  const {
    name,
    accessToken,
    branch,
    email,
    gitUserName,
    remoteUrl,
    directoryExclusionList,
  }: {
    name: string;
    accessToken: string;
    branch: string;
    email: string;
    gitUserName: string;
    remoteUrl: string;
    directoryExclusionList?: string[];
  } = req.body;

  await GitRepositoryUseCases.updateGitRepository(
    uuid,
    name,
    await vaultEncrypt(accessToken, DEFAULT_VAULT_ID),
    branch,
    email,
    gitUserName,
    remoteUrl,
    directoryExclusionList,
  );
  return new SuccessResponse('Updated playbooks git repository').send(res);
});

export const deleteGitRepository = asyncHandler(async (req, res) => {
  const { uuid } = req.params;

  const repository = await PlaybooksRepositoryRepo.findByUuid(uuid);
  if (!repository) {
    throw new NotFoundError();
  }
  await PlaybooksRepositoryUseCases.deleteRepository(repository);
  return new SuccessResponse('Deleted playbooks-repository repository').send(res);
});

export const forcePullRepository = asyncHandler(async (req, res) => {
  const { uuid } = req.params;

  const repository = PlaybooksRepositoryEngine.getState().playbooksRepository[
    uuid
  ] as GitRepositoryComponent;
  if (!repository) {
    throw new NotFoundError();
  }
  await repository.forcePull();
  await repository.syncToDatabase();
  return new SuccessResponse('Forced pull playbooks git repository').send(res);
});

export const forceCloneRepository = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  const repository = PlaybooksRepositoryEngine.getState().playbooksRepository[
    uuid
  ] as GitRepositoryComponent;
  if (!repository) {
    throw new NotFoundError();
  }

  await repository.clone();
  await repository.syncToDatabase();
  return new SuccessResponse('Forced cloned playbooks git repository').send(res);
});

export const commitAndSyncRepository = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  const repository = PlaybooksRepositoryEngine.getState().playbooksRepository[
    uuid
  ] as GitRepositoryComponent;
  if (!repository) {
    throw new NotFoundError();
  }

  await repository.commitAndSync();
  return new SuccessResponse('Commit And Synced playbooks git repository').send(res);
});

export const syncToDatabaseRepository = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  const repository = PlaybooksRepositoryEngine.getState().playbooksRepository[
    uuid
  ] as GitRepositoryComponent;
  if (!repository) {
    throw new NotFoundError();
  }

  await repository.syncToDatabase();
  return new SuccessResponse('Synced to database playbooks git repository').send(res);
});

export const forceRegister = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  const repository = await PlaybooksRepositoryRepo.findByUuid(uuid);
  if (!repository) {
    throw new NotFoundError();
  }

  await PlaybooksRepositoryEngine.registerRepository(repository);
  return new SuccessResponse('Synced to database playbooks git repository').send(res);
});
