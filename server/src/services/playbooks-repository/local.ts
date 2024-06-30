import { Playbooks } from 'ssm-shared-lib';
import { NotFoundError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import PlaybooksRepositoryRepo from '../../data/database/repository/PlaybooksRepositoryRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import GitRepositoryComponent from '../../integrations/git-repository/GitRepositoryComponent';
import LocalRepositoryComponent from '../../integrations/local-repository/LocalRepositoryComponent';
import PlaybooksRepositoryEngine from '../../integrations/playbooks-repository/PlaybooksRepositoryEngine';
import logger from '../../logger';
import LocalRepositoryUseCases from '../../use-cases/LocalRepositoryUseCases';
import PlaybooksRepositoryUseCases from '../../use-cases/PlaybooksRepositoryUseCases';

export const getLocalRepositories = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /local/`);
  const repositories = await PlaybooksRepositoryRepo.findAllWithType(
    Playbooks.PlaybooksRepositoryType.LOCAL,
  );
  return new SuccessResponse('Got playbooks local repositories', repositories).send(res);
});

export const updateLocalRepository = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  logger.info(`[CONTROLLER] - POST - /local/:uuid`);
  const {
    name,
  }: {
    name: string;
  } = req.body;
  await LocalRepositoryUseCases.updateLocalRepository(uuid, name);
  return new SuccessResponse('Updated playbooks local repository').send(res);
});

export const deleteLocalRepository = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - DELETE - /local/:uuid`);
  const { uuid } = req.params;
  const repository = await PlaybooksRepositoryRepo.findByUuid(uuid);
  if (!repository) {
    throw new NotFoundError();
  }
  await PlaybooksRepositoryUseCases.deleteRepository(repository);
  return new SuccessResponse('Deleted playbooks local repository').send(res);
});

export const addLocalRepository = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - PUT - /local/`);
  const {
    name,
  }: {
    name: string;
  } = req.body;
  await LocalRepositoryUseCases.addLocalRepository(name);
  return new SuccessResponse('Added playbooks local repository').send(res);
});

export const syncToDatabaseLocalRepository = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - POST - /local/:uuid/sync-to-database-repository`);
  const { uuid } = req.params;
  const repository = PlaybooksRepositoryEngine.getState().playbooksRepository[
    uuid
  ] as LocalRepositoryComponent;
  if (!repository) {
    throw new NotFoundError();
  }
  await repository.syncToDatabase();
  return new SuccessResponse('Synced to database playbooks local repository').send(res);
});
