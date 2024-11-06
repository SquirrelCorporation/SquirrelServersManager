import ContainerCustomStackRepositoryRepo from '../../../data/database/repository/ContainerCustomStackRepositoryRepo';
import { NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import { DEFAULT_VAULT_ID, vaultEncrypt } from '../../../modules/ansible-vault/ansible-vault';
import ContainerCustomStacksRepositoryComponent from '../../../modules/repository/ContainerCustomStacksRepositoryComponent';
import ContainerCustomStacksRepositoryEngine from '../../../modules/repository/ContainerCustomStacksRepositoryEngine';
import GitRepositoryUseCases from '../../../services/GitCustomStacksRepositoryUseCases';

export const addGitRepository = async (req, res) => {
  const {
    name,
    accessToken,
    branch,
    email,
    userName,
    remoteUrl,
    matchesList,
  }: {
    name: string;
    accessToken: string;
    branch: string;
    email: string;
    userName: string;
    remoteUrl: string;
    matchesList?: string[];
  } = req.body;
  await GitRepositoryUseCases.addGitRepository(
    name,
    await vaultEncrypt(accessToken, DEFAULT_VAULT_ID),
    branch,
    email,
    userName,
    remoteUrl,
    matchesList,
  );
  new SuccessResponse('Added container stacks git repository').send(res);
};

export const getGitRepositories = async (req, res) => {
  const repositories = await ContainerCustomStackRepositoryRepo.findAllActive();
  const encryptedRepositories = repositories?.map((repo) => ({
    ...repo,
    accessToken: 'REDACTED',
  }));
  new SuccessResponse('Got container stacks git repositories', encryptedRepositories).send(res);
};

export const updateGitRepository = async (req, res) => {
  const { uuid } = req.params;
  const {
    name,
    accessToken,
    branch,
    email,
    gitUserName,
    remoteUrl,
    matchesList,
  }: {
    name: string;
    accessToken: string;
    branch: string;
    email: string;
    gitUserName: string;
    remoteUrl: string;
    matchesList?: string[];
  } = req.body;
  await GitRepositoryUseCases.updateGitRepository(
    uuid,
    name,
    await vaultEncrypt(accessToken, DEFAULT_VAULT_ID),
    branch,
    email,
    gitUserName,
    remoteUrl,
    matchesList,
  );
  new SuccessResponse('Updated container stacks git repository').send(res);
};

export const deleteGitRepository = async (req, res) => {
  const { uuid } = req.params;

  const repository = await ContainerCustomStackRepositoryRepo.findOneByUuid(uuid);
  if (!repository) {
    throw new NotFoundError();
  }
  await GitRepositoryUseCases.deleteRepository(repository);
  new SuccessResponse('Deleted container stacks repository').send(res);
};

export const forcePullRepository = async (req, res) => {
  const { uuid } = req.params;

  const repository = ContainerCustomStacksRepositoryEngine.getState().stackRepository[
    uuid
  ] as ContainerCustomStacksRepositoryComponent;
  if (!repository) {
    throw new NotFoundError();
  }
  await repository.forcePull();
  await repository.syncToDatabase();
  new SuccessResponse('Forced pull stacks git repository').send(res);
};

export const forceCloneRepository = async (req, res) => {
  const { uuid } = req.params;
  const repository = ContainerCustomStacksRepositoryEngine.getState().stackRepository[
    uuid
  ] as ContainerCustomStacksRepositoryComponent;
  if (!repository) {
    throw new NotFoundError();
  }

  await repository.clone();
  await repository.syncToDatabase();
  new SuccessResponse('Forced cloned stacks git repository').send(res);
};

export const commitAndSyncRepository = async (req, res) => {
  const { uuid } = req.params;
  const repository = ContainerCustomStacksRepositoryEngine.getState().stackRepository[
    uuid
  ] as ContainerCustomStacksRepositoryComponent;
  if (!repository) {
    throw new NotFoundError();
  }

  await repository.commitAndSync();
  new SuccessResponse('Commit And Synced stacks git repository').send(res);
};

export const syncToDatabaseRepository = async (req, res) => {
  const { uuid } = req.params;
  const repository = ContainerCustomStacksRepositoryEngine.getState().stackRepository[
    uuid
  ] as ContainerCustomStacksRepositoryComponent;
  if (!repository) {
    throw new NotFoundError();
  }

  await repository.syncToDatabase();
  new SuccessResponse('Synced to database stacks git repository').send(res);
};

export const forceRegister = async (req, res) => {
  const { uuid } = req.params;
  const repository = await ContainerCustomStackRepositoryRepo.findOneByUuid(uuid);
  if (!repository) {
    throw new NotFoundError();
  }

  await ContainerCustomStacksRepositoryEngine.registerRepository(repository);
  new SuccessResponse('Synced to database stacks git repository').send(res);
};
