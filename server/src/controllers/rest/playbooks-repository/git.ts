import { API, Repositories } from 'ssm-shared-lib';
import PlaybooksRepositoryRepo from '../../../data/database/repository/PlaybooksRepositoryRepo';
import { NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import { DEFAULT_VAULT_ID, vaultEncrypt } from '../../../modules/ansible-vault/ansible-vault';
import GitPlaybooksRepositoryComponent from '../../../modules/repository/git-playbooks-repository/GitPlaybooksRepositoryComponent';
import PlaybooksRepositoryEngine from '../../../modules/repository/PlaybooksRepositoryEngine';
import GitRepositoryUseCases from '../../../services/GitPlaybooksRepositoryUseCases';
import PlaybooksRepositoryUseCases from '../../../services/PlaybooksRepositoryUseCases';

export const addGitRepository = async (req, res) => {
  const {
    name,
    accessToken,
    branch,
    email,
    userName,
    remoteUrl,
    directoryExclusionList,
    gitService,
    vaults,
    ignoreSSLErrors,
  }: API.GitPlaybooksRepository = req.body;
  await GitRepositoryUseCases.addGitRepository(
    name,
    await vaultEncrypt(accessToken as string, DEFAULT_VAULT_ID),
    branch,
    email,
    userName,
    remoteUrl,
    gitService,
    directoryExclusionList,
    vaults,
    ignoreSSLErrors,
  );
  new SuccessResponse('Added playbooks git repository').send(res);
};

export const getGitRepositories = async (req, res) => {
  const repositories = await PlaybooksRepositoryRepo.findAllWithType(
    Repositories.RepositoryType.GIT,
  );
  const encryptedRepositories = repositories?.map((repo) => ({
    ...repo,
    accessToken: 'REDACTED',
  }));
  new SuccessResponse('Got playbooks git repositories', encryptedRepositories).send(res);
};

export const updateGitRepository = async (req, res) => {
  const { uuid } = req.params;
  const {
    name,
    accessToken,
    branch,
    email,
    userName,
    remoteUrl,
    directoryExclusionList,
    gitService,
    vaults,
    ignoreSSLErrors,
  }: API.GitPlaybooksRepository = req.body;

  await GitRepositoryUseCases.updateGitRepository(
    uuid,
    name,
    await vaultEncrypt(accessToken as string, DEFAULT_VAULT_ID),
    branch,
    email,
    userName,
    remoteUrl,
    gitService,
    directoryExclusionList,
    vaults,
    ignoreSSLErrors,
  );
  new SuccessResponse('Updated playbooks git repository').send(res);
};

export const deleteGitRepository = async (req, res) => {
  const { uuid } = req.params;

  const repository = await PlaybooksRepositoryRepo.findByUuid(uuid);
  if (!repository) {
    throw new NotFoundError();
  }
  await PlaybooksRepositoryUseCases.deleteRepository(repository);
  new SuccessResponse('Deleted playbooks-repository repository').send(res);
};

export const forcePullRepository = async (req, res) => {
  const { uuid } = req.params;

  const repository = PlaybooksRepositoryEngine.getState().playbooksRepository[
    uuid
  ] as GitPlaybooksRepositoryComponent;
  if (!repository) {
    throw new NotFoundError();
  }
  await repository.forcePull();
  await repository.syncToDatabase();
  new SuccessResponse('Forced pull playbooks git repository').send(res);
};

export const forceCloneRepository = async (req, res) => {
  const { uuid } = req.params;
  const repository = PlaybooksRepositoryEngine.getState().playbooksRepository[
    uuid
  ] as GitPlaybooksRepositoryComponent;
  if (!repository) {
    throw new NotFoundError();
  }

  await repository.clone();
  await repository.syncToDatabase();
  new SuccessResponse('Forced cloned playbooks git repository').send(res);
};

export const commitAndSyncRepository = async (req, res) => {
  const { uuid } = req.params;
  const repository = PlaybooksRepositoryEngine.getState().playbooksRepository[
    uuid
  ] as GitPlaybooksRepositoryComponent;
  if (!repository) {
    throw new NotFoundError();
  }

  await repository.commitAndSync();
  new SuccessResponse('Commit And Synced playbooks git repository').send(res);
};

export const syncToDatabaseRepository = async (req, res) => {
  const { uuid } = req.params;
  const repository = PlaybooksRepositoryEngine.getState().playbooksRepository[
    uuid
  ] as GitPlaybooksRepositoryComponent;
  if (!repository) {
    throw new NotFoundError();
  }

  await repository.syncToDatabase();
  new SuccessResponse('Synced to database playbooks git repository').send(res);
};

export const forceRegister = async (req, res) => {
  const { uuid } = req.params;
  const repository = await PlaybooksRepositoryRepo.findByUuid(uuid);
  if (!repository) {
    throw new NotFoundError();
  }

  await PlaybooksRepositoryEngine.registerRepository(repository);
  new SuccessResponse('Synced to database playbooks git repository').send(res);
};
