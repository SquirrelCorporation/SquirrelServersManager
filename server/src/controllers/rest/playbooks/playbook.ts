import PlaybookRepo from '../../../data/database/repository/PlaybookRepo';
import { InternalError, NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import asyncHandler from '../../../middlewares/AsyncHandler';
import Shell from '../../../modules/shell';
import PlaybooksRepositoryUseCases from '../../../services/PlaybooksRepositoryUseCases';
import PlaybookUseCases from '../../../services/PlaybookUseCases';

export const getPlaybooks = asyncHandler(async (req, res) => {
  try {
    const playbooks = await PlaybookRepo.findAllWithActiveRepositories();
    new SuccessResponse('Got Playbooks successfully', playbooks).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const getPlaybook = asyncHandler(async (req, res) => {
  const { uuid } = req.params;

  const playbook = await PlaybookRepo.findOneByUuid(uuid);
  if (!playbook) {
    throw new NotFoundError(`Playbook ${uuid} not found`);
  }
  try {
    const content = Shell.PlaybookFileManager.readPlaybook(playbook.path);
    new SuccessResponse('Get Playbook successful', content).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const editPlaybook = asyncHandler(async (req, res) => {
  const { uuid } = req.params;

  const playbook = await PlaybookRepo.findOneByUuid(uuid);
  if (!playbook) {
    throw new NotFoundError(`Playbook ${uuid} not found`);
  }
  try {
    Shell.PlaybookFileManager.editPlaybook(req.body.content, playbook.path);
    new SuccessResponse('Edit playbook successful').send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const addExtraVarToPlaybook = asyncHandler(async (req, res) => {
  const { uuid } = req.params;

  const playbook = await PlaybookRepo.findOneByUuid(uuid);
  if (!playbook) {
    throw new NotFoundError(`Playbook ${uuid} not found`);
  }
  try {
    await PlaybookUseCases.addExtraVarToPlaybook(playbook, req.body.extraVar);
    new SuccessResponse('Add extra var to playbook successful').send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const deleteExtraVarFromPlaybook = asyncHandler(async (req, res) => {
  const { uuid, varname } = req.params;

  const playbook = await PlaybookRepo.findOneByUuid(uuid);
  if (!playbook) {
    throw new NotFoundError(`Playbook ${uuid} not found`);
  }
  try {
    await PlaybookUseCases.deleteExtraVarFromPlaybook(playbook, varname);
    new SuccessResponse('Delete extra var from playbook successful').send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const deletePlaybook = asyncHandler(async (req, res) => {
  const { uuid } = req.params;

  const playbook = await PlaybookRepo.findOneByUuid(uuid);
  if (!playbook) {
    throw new NotFoundError(`Playbook ${uuid} not found`);
  }
  try {
    await PlaybooksRepositoryUseCases.deletePlaybooksInRepository(playbook);
    new SuccessResponse('Delete playbook successful').send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});
