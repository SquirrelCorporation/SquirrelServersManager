import PlaybooksRepositoryRepo from '../../../data/database/repository/PlaybooksRepositoryRepo';
import { InternalError, NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import PlaybooksRepositoryUseCases from '../../../services/PlaybooksRepositoryUseCases';

export const getPlaybooksRepositories = async (req, res) => {
  try {
    const listOfPlaybooksToSelect = await PlaybooksRepositoryUseCases.getAllPlaybooksRepositories();
    new SuccessResponse('Get playbooks successful', listOfPlaybooksToSelect).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
};

export const addDirectoryToPlaybookRepository = async (req, res) => {
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
};

export const addPlaybookToRepository = async (req, res) => {
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
};

export const deleteAnyFromRepository = async (req, res) => {
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
};

export const getPlaybookCustomVaults = async (req, res) => {
  const { uuid } = req.params;

  const playbookRepository = await PlaybooksRepositoryRepo.findByUuid(uuid);
  if (!playbookRepository) {
    throw new NotFoundError(`PlaybookRepository ${uuid} not found`);
  }
  try {
    new SuccessResponse('Got playbook custom vaults successfully', playbookRepository.vaults).send(
      res,
    );
  } catch (error: any) {
    throw new InternalError(error.message);
  }
};

export const postPlaybookCustomVaults = async (req, res) => {
  const { uuid } = req.params;
  const { vaultId, password } = req.body;

  const playbookRepository = await PlaybooksRepositoryRepo.findByUuid(uuid);
  if (!playbookRepository) {
    throw new NotFoundError(`PlaybookRepository ${uuid} not found`);
  }
  playbookRepository.vaults = [...(playbookRepository.vaults ?? []), { vaultId, password }];
  await PlaybooksRepositoryRepo.update(playbookRepository);
  try {
    new SuccessResponse('Post playbook custom vault successfully').send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
};
