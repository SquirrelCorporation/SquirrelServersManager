import { Playbooks } from 'ssm-shared-lib';
import PlaybooksRepositoryRepo from '../../../data/database/repository/PlaybooksRepositoryRepo';
import logger from '../../../logger';
import { NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import LocalRepositoryComponent from '../../../modules/playbooks-repository/local-repository/LocalRepositoryComponent';
import PlaybooksRepositoryEngine from '../../../modules/playbooks-repository/PlaybooksRepositoryEngine';
import LocalRepositoryUseCases from '../../../services/LocalRepositoryUseCases';
import PlaybooksRepositoryUseCases from '../../../services/PlaybooksRepositoryUseCases';

export const getLocalRepositories = async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /local/`);
  const repositories = await PlaybooksRepositoryRepo.findAllWithType(
    Playbooks.PlaybooksRepositoryType.LOCAL,
  );
  return new SuccessResponse('Got playbooks local repositories', repositories).send(res);
};

export const updateLocalRepository = async (req, res) => {
  const { uuid } = req.params;
  logger.info(`[CONTROLLER] - POST - /local/:uuid`);
  const {
    name,
    directoryExclusionList,
  }: {
    name: string;
    directoryExclusionList?: string[];
  } = req.body;
  await LocalRepositoryUseCases.updateLocalRepository(uuid, name, directoryExclusionList);
  return new SuccessResponse('Updated playbooks local repository').send(res);
};

export const deleteLocalRepository = async (req, res) => {
  logger.info(`[CONTROLLER] - DELETE - /local/:uuid`);
  const { uuid } = req.params;
  const repository = await PlaybooksRepositoryRepo.findByUuid(uuid);
  if (!repository) {
    throw new NotFoundError();
  }
  await PlaybooksRepositoryUseCases.deleteRepository(repository);
  return new SuccessResponse('Deleted playbooks local repository').send(res);
};

export const addLocalRepository = async (req, res) => {
  logger.info(`[CONTROLLER] - PUT - /local/`);
  const {
    name,
    directoryExclusionList,
  }: {
    name: string;
    directoryExclusionList?: string[];
  } = req.body;
  await LocalRepositoryUseCases.addLocalRepository(name, directoryExclusionList);
  return new SuccessResponse('Added playbooks local repository').send(res);
};

export const syncToDatabaseLocalRepository = async (req, res) => {
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
};
