import { Playbooks } from 'ssm-shared-lib';
import { NotFoundError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import PlaybooksRepositoryRepo from '../../data/database/repository/PlaybooksRepositoryRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import { DEFAULT_VAULT_ID, vaultEncrypt } from '../../integrations/ansible-vault/vault';
import GitRepositoryComponent from '../../integrations/git-repository/GitRepositoryComponent';
import PlaybooksRepositoryEngine from '../../integrations/playbooks-repository/PlaybooksRepositoryEngine';
import logger from '../../logger';
import GitRepositoryUseCases from '../../use-cases/GitRepositoryUseCases';
import PlaybooksRepositoryUseCases from '../../use-cases/PlaybooksRepositoryUseCases';

export const addGitRepository = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - PUT - /git/`);
  const {
    name,
    accessToken,
    branch,
    email,
    userName,
    remoteUrl,
  }: {
    name: string;
    accessToken: string;
    branch: string;
    email: string;
    userName: string;
    remoteUrl: string;
  } = req.body;
  await GitRepositoryUseCases.addGitRepository(
    name,
    await vaultEncrypt(accessToken, DEFAULT_VAULT_ID),
    branch,
    email,
    userName,
    remoteUrl,
  );
  return new SuccessResponse('Added playbooks git repository').send(res);
});

export const getGitRepositories = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /git/`);
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
  logger.info(`[CONTROLLER] - POST - /git/`);
  const { uuid } = req.params;
  const {
    name,
    accessToken,
    branch,
    email,
    gitUserName,
    remoteUrl,
  }: {
    name: string;
    accessToken: string;
    branch: string;
    email: string;
    gitUserName: string;
    remoteUrl: string;
  } = req.body;
  await GitRepositoryUseCases.updateGitRepository(
    uuid,
    name,
    await vaultEncrypt(accessToken, DEFAULT_VAULT_ID),
    branch,
    email,
    gitUserName,
    remoteUrl,
  );
  return new SuccessResponse('Updated playbooks git repository').send(res);
});

export const deleteGitRepository = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - DELETE - /git/:uuid`);
  const { uuid } = req.params;
  const repository = await PlaybooksRepositoryRepo.findByUuid(uuid);
  if (!repository) {
    throw new NotFoundError();
  }
  await PlaybooksRepositoryUseCases.deleteRepository(repository);
  return new SuccessResponse('Deleted playbooks-repository repository').send(res);
});

export const forcePullRepository = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - POST - /git/:uuid/force-pull-repository`);
  const { uuid } = req.params;
  const repository = PlaybooksRepositoryEngine.getState().playbooksRepository[
    uuid
  ] as GitRepositoryComponent;
  if (!repository) {
    throw new NotFoundError();
  }
  await repository.forcePull();
  return new SuccessResponse('Forced pull playbooks git repository').send(res);
});

export const forceCloneRepository = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - POST - /git/:uuid/force-clone-repository`);
  const { uuid } = req.params;
  const repository = PlaybooksRepositoryEngine.getState().playbooksRepository[
    uuid
  ] as GitRepositoryComponent;
  if (!repository) {
    throw new NotFoundError();
  }
  await repository.clone();
  return new SuccessResponse('Forced cloned playbooks git repository').send(res);
});

export const commitAndSyncRepository = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - POST - /git/:uuid/commit-and-sync-repository`);
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
  logger.info(`[CONTROLLER] - POST - /git/:uuid/sync-to-database-repository`);
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
  logger.info(`[CONTROLLER] - POST - /git/:uuid/force-register`);
  const { uuid } = req.params;
  const repository = await PlaybooksRepositoryRepo.findByUuid(uuid);
  if (!repository) {
    throw new NotFoundError();
  }
  await PlaybooksRepositoryEngine.registerRepository(repository);
  return new SuccessResponse('Synced to database playbooks git repository').send(res);
});
