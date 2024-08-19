import { InternalError, NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import PlaybooksRepositoryRepo from '../../../data/database/repository/PlaybooksRepositoryRepo';
import asyncHandler from '../../../middlewares/AsyncHandler';
import PlaybooksRepositoryUseCases from '../../../use-cases/PlaybooksRepositoryUseCases';

export const getPlaybooksRepositories = asyncHandler(async (req, res) => {
  try {
    const listOfPlaybooksToSelect = await PlaybooksRepositoryUseCases.getAllPlaybooksRepositories();
    new SuccessResponse('Get playbooks successful', listOfPlaybooksToSelect).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const addDirectoryToPlaybookRepository = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  const { fullPath } = req.body;

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
