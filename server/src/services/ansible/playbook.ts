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
    new SuccessResponse('Get playbooks', listOfPlaybooksToSelect).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const getPlaybook = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /ansible/playbooks/${req.params.playbook}/content`);
  if (!req.params.playbook) {
    res.status(400).send({
      success: false,
      message: 'Playbook is undefined',
    });
    return;
  }
  logger.info(`[CONTROLLER][ANSIBLE] playbook content ${req.params.playbook}`);
  try {
    const content = await shell.readPlaybook(req.params.playbook);
    new SuccessResponse('Get Playbook', content).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const editPlaybook = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - PATCH - /ansible/playbooks/${req.params.playbook}`);
  if (!req.params.playbook) {
    res.status(400).send({
      success: false,
      message: 'Playbook is undefined',
    });
    return;
  }
  if (!req.body.content) {
    logger.error('[CONTROLLER] patch /playbooks/:playbook/ - malformed request');
    logger.error(req.body);
    res.status(400).send({
      success: false,
      message: 'Missing body',
    });
    return;
  }
  logger.info(`[CONTROLLER][ANSIBLE] patch playbook content ${req.params.playbook}`);
  const playbook = await PlaybookRepo.findOne(req.params.playbook);
  if (!playbook) {
    throw new NotFoundError('Playbook not found');
  }
  try {
    await shell.editPlaybook(playbook.name, req.body.content);
    new SuccessResponse('Edit playbook', {}).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const addPlaybook = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - PUT - /ansible/playbooks/${req.params.playbook}`);
  if (!req.params.playbook) {
    res.status(400).send({
      success: false,
      message: 'Playbook is undefined',
    });
    return;
  }
  if (req.params.playbook.startsWith('_')) {
    res.status(401).send({
      success: false,
      message: 'Cannot create a playbook that starts with _',
    });
    return;
  }
  logger.info(`[CONTROLLER][ANSIBLE] new playbook  ${req.params.playbook}`);
  try {
    await PlaybookUseCases.createCustomPlaybook(req.params.playbook);
    new SuccessResponse('Add playbook', {}).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const deletePlaybook = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - DELETE - /ansible/playbooks/${req.params.playbook}`);
  if (!req.params.playbook) {
    res.status(400).send({
      success: false,
      message: 'Playbook is undefined',
    });
    return;
  }
  if (req.params.playbook.startsWith('_')) {
    res.status(401).send({
      success: false,
      message: 'Cannot delete playbook with name that starts with _',
    });
    return;
  }
  logger.info(`[CONTROLLER][ANSIBLE] - DELETE - delete playbook  ${req.params.playbook}`);
  const playbook = await PlaybookRepo.findOne(req.params.playbook);
  if (!playbook) {
    throw new NotFoundError('Playbook not found');
  }
  try {
    await PlaybookUseCases.deleteCustomPlaybook(playbook);
    new SuccessResponse('Delete playbook', {}).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const addExtraVarToPlaybook = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - POST - /ansible/playbooks/${req.params.playbook}/extravars`);
  if (!req.params.playbook) {
    res.status(400).send({
      success: false,
      message: 'Playbook is undefined',
    });
    return;
  }
  if (!req.body.extraVar) {
    res.status(401).send({
      success: false,
      message: 'ExtraVar required',
    });
    return;
  }
  const playbook = await PlaybookRepo.findOne(req.params.playbook);
  if (!playbook) {
    throw new NotFoundError('Playbook not found');
  }
  try {
    await PlaybookUseCases.addExtraVarToPlaybook(playbook, req.body.extraVar);
    new SuccessResponse('Add extra var to playbook', {}).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const deleteExtraVarFromPlaybook = asyncHandler(async (req, res) => {
  logger.info(
    `[CONTROLLER] - DELETE - /ansible/playbooks/${req.params.playbook}/extravars/${req.params.varname}`,
  );
  if (!req.params.playbook || !req.params.varname) {
    res.status(400).send({
      success: false,
      message: 'Playbook or varname is undefined',
    });
    return;
  }
  const playbook = await PlaybookRepo.findOne(req.params.playbook + '.yml');
  if (!playbook) {
    throw new NotFoundError('Playbook not found');
  }
  try {
    await PlaybookUseCases.deleteExtraVarFromPlaybook(playbook, req.params.varname);
    new SuccessResponse('Delete extra var from playbook', {}).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});
