import { InternalError, NotFoundError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import PlaybookRepo from '../../data/database/repository/PlaybookRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';
import Shell from '../../integrations/shell';
import PlaybooksRepositoryUseCases from '../../use-cases/PlaybooksRepositoryUseCases';
import PlaybookUseCases from '../../use-cases/PlaybookUseCases';

export const getPlaybooks = asyncHandler(async (req, res) => {
  try {
    const playbooks = await PlaybookRepo.findAllWithActiveRepositories();
    new SuccessResponse('Got Playbooks successfuly', playbooks).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const getPlaybook = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  logger.info(`[CONTROLLER] - GET - /playbooks/${uuid}`);
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
  logger.info(`[CONTROLLER][ANSIBLE] - PATCH - /playbooks/${uuid}`);
  const playbook = await PlaybookRepo.findOneByUuid(uuid);
  if (!playbook) {
    throw new NotFoundError(`Playbook ${uuid} not found`);
  }
  try {
    Shell.PlaybookFileManager.editPlaybook(playbook.path, req.body.content);
    new SuccessResponse('Edit playbook successful').send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const addExtraVarToPlaybook = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  logger.info(`[CONTROLLER] - POST - /${uuid}/extravars`);
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
  logger.info(`[CONTROLLER] - DELETE - /${uuid}/extravars/${varname}`);
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
  logger.info(`[CONTROLLER] - DELETE - /playbook/${uuid}`);
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
