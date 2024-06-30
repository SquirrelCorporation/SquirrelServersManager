import { InternalError, NotFoundError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import PlaybooksRepositoryRepo from '../../data/database/repository/PlaybooksRepositoryRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';
import PlaybooksRepositoryUseCases from '../../use-cases/PlaybooksRepositoryUseCases';

export const getPlaybooksRepositories = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /playbook-repositories`);
  try {
    const listOfPlaybooksToSelect = await PlaybooksRepositoryUseCases.getAllPlaybooksRepositories();
    new SuccessResponse('Get playbooks successful', listOfPlaybooksToSelect).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const addDirectoryToPlaybookRepository = asyncHandler(async (req, res) => {
  const { uuid, directoryName } = req.params;
  const { fullPath } = req.body;
  logger.info(`[CONTROLLER] - PUT - /playbook-repositories/${uuid}/directory/${directoryName}`);
  const playbookRepository = await PlaybooksRepositoryRepo.findByUuid(uuid);
  if (!playbookRepository) {
    throw new NotFoundError(`PlaybookRepository ${uuid} not found`);
  }
  try {
    await PlaybooksRepositoryUseCases.createDirectoryInPlaybookRepository(
      playbookRepository,
      fullPath,
    );
    new SuccessResponse('Created directory successfully').send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const addPlaybookToRepository = asyncHandler(async (req, res) => {
  const { uuid, playbookName } = req.params;
  const { fullPath } = req.body;
  logger.info(`[CONTROLLER] - PUT - /playbook-repositories/${uuid}/playbook/${playbookName}`);
  const playbookRepository = await PlaybooksRepositoryRepo.findByUuid(uuid);
  if (!playbookRepository) {
    throw new NotFoundError(`PlaybookRepository ${uuid} not found`);
  }
  try {
    const createdPlaybook = await PlaybooksRepositoryUseCases.createPlaybookInRepository(
      playbookRepository,
      fullPath,
      playbookName,
    );
    new SuccessResponse('Add playbook successful', createdPlaybook).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const deleteAnyFromRepository = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  const { fullPath } = req.body;
  logger.info(`[CONTROLLER] - DELETE - /playbook-repositories/${uuid}/playbook/`);
  const playbookRepository = await PlaybooksRepositoryRepo.findByUuid(uuid);
  if (!playbookRepository) {
    throw new NotFoundError(`PlaybookRepository ${uuid} not found`);
  }
  try {
    await PlaybooksRepositoryUseCases.deleteAnyInPlaybooksRepository(playbookRepository, fullPath);
    new SuccessResponse('Deletion successful').send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});
