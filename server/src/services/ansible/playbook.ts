import { InternalError, NotFoundError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import PlaybookRepo from '../../data/database/repository/PlaybookRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';
import shell from '../../integrations/shell';
import PlaybookUseCases from '../../use-cases/PlaybookUseCases';

export const getPlaybooks = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /ansible/playbooks`);
  try {
    const listOfPlaybooksToSelect = await PlaybookUseCases.getAllPlaybooks();
    new SuccessResponse('Get playbooks successful', listOfPlaybooksToSelect).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const getPlaybook = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /ansible/playbooks/${req.params.playbook}`);
  try {
    const content = await shell.readPlaybook(req.params.playbook);
    new SuccessResponse('Get Playbook successful', content).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const editPlaybook = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER][ANSIBLE] - PATCH - /ansible/playbooks/${req.params.playbook}`);
  const playbook = await PlaybookRepo.findOne(req.params.playbook);
  if (!playbook) {
    throw new NotFoundError('Playbook not found');
  }
  try {
    await shell.editPlaybook(playbook.name, req.body.content);
    new SuccessResponse('Edit playbook successful').send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const addPlaybook = asyncHandler(async (req, res) => {
  const { playbook } = req.params;
  logger.info(`[CONTROLLER] - PUT - /ansible/playbooks/${playbook}`);
  try {
    await PlaybookUseCases.createCustomPlaybook(playbook);
    new SuccessResponse('Add playbook successful').send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const deletePlaybook = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - DELETE - /ansible/playbooks/${req.params.playbook}`);
  const playbook = await PlaybookRepo.findOne(req.params.playbook);
  if (!playbook) {
    throw new NotFoundError('Playbook not found');
  }
  try {
    await PlaybookUseCases.deleteCustomPlaybook(playbook);
    new SuccessResponse('Delete playbook successful').send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const addExtraVarToPlaybook = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - POST - /ansible/playbooks/${req.params.playbook}/extravars`);
  const playbook = await PlaybookRepo.findOne(req.params.playbook);
  if (!playbook) {
    throw new NotFoundError('Playbook not found ');
  }
  try {
    await PlaybookUseCases.addExtraVarToPlaybook(playbook, req.body.extraVar);
    new SuccessResponse('Add extra var to playbook successful').send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const deleteExtraVarFromPlaybook = asyncHandler(async (req, res) => {
  logger.info(
    `[CONTROLLER] - DELETE - /ansible/playbooks/${req.params.playbook}/extravars/${req.params.varname}`,
  );
  const playbook = await PlaybookRepo.findOne(req.params.playbook + '.yml');
  if (!playbook) {
    throw new NotFoundError('Playbook not found');
  }
  try {
    await PlaybookUseCases.deleteExtraVarFromPlaybook(playbook, req.params.varname);
    new SuccessResponse('Delete extra var from playbook successful').send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});
