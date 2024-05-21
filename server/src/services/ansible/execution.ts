import { API } from 'ssm-shared-lib';
import { InternalError, NotFoundError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import AnsibleLogsRepo from '../../data/database/repository/AnsibleLogsRepo';
import AnsibleTaskStatusRepo from '../../data/database/repository/AnsibleTaskStatusRepo';
import PlaybookRepo from '../../data/database/repository/PlaybookRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';
import PlaybookUseCases from '../../use-cases/PlaybookUseCases';

export const execPlaybook = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - POST - ansible/exec/playbook - '${req.params.playbook}'`);
  const playbook = await PlaybookRepo.findOne(
    req.params.playbook + (req.params.playbook.endsWith('.yml') ? '' : '.yml'),
  );
  if (!playbook) {
    throw new NotFoundError('Playbook not found');
  }
  try {
    const execId = await PlaybookUseCases.executePlaybook(
      playbook,
      // @ts-expect-error user will not be null
      req.user,
      req.body.target,
      req.body.extraVars as API.ExtraVars,
    );
    new SuccessResponse('Execution succeeded', { execId: execId } as API.ExecId).send(res);
  } catch (error: any) {
    logger.error(error);
    throw new InternalError(error.message);
  }
});

export const getLogs = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - GET - ansible/exec/${req.params.id}/logs`);
  const execLogs = await AnsibleLogsRepo.findAllByIdent(req.params.id);
  logger.debug(execLogs);
  new SuccessResponse('Execution logs', {
    execId: req.params.id,
    execLogs: execLogs,
  } as API.ExecLogs).send(res);
});

export const getStatus = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - GET - ansible/exec/:${req.params.id}/status`);
  if (!req.params.id) {
    res.status(400).send({
      success: false,
    });
    return;
  }
  const taskStatuses = await AnsibleTaskStatusRepo.findAllByIdent(req.params.id);
  logger.debug(taskStatuses);
  new SuccessResponse('Execution status', {
    execId: req.params.id,
    execStatuses: taskStatuses,
  } as API.ExecStatuses).send(res);
});
