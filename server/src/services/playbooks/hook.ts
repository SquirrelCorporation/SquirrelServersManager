import { NotFoundError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import AnsibleLog from '../../data/database/model/AnsibleLogs';
import AnsibleLogsRepo from '../../data/database/repository/AnsibleLogsRepo';
import AnsibleTaskRepo from '../../data/database/repository/AnsibleTaskRepo';
import AnsibleTaskStatusRepo from '../../data/database/repository/AnsibleTaskStatusRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';

export const addTaskStatus = asyncHandler(async (req, res) => {
  logger.info('[CONTROLLER] - POST - /playbooks/hook/task/status');
  if (!req.body.runner_ident || !req.body.status) {
    logger.error('[CONTROLLER] playbooks/hook/task/status - malformed request');
    logger.error(req.body);
    res.status(400).send({
      success: false,
    });
    return;
  }
  const ident = req.body.runner_ident;
  const status = req.body.status;
  const ansibleTask = await AnsibleTaskRepo.updateStatus(ident, status);
  if (ansibleTask) {
    await AnsibleTaskStatusRepo.create({
      ident: ident,
      status: status,
    });
    new SuccessResponse('Added task status').send(res);
  } else {
    logger.error(`[CONTROLLER] ansible/hook/status - Task ident not found ${ident}`);
    throw new NotFoundError('Task not found');
  }
});

export const addTaskEvent = asyncHandler(async (req, res) => {
  logger.info('[CONTROLLER] - POST - playbooks/hook/task/event');
  if (!req.body.runner_ident) {
    logger.error('[CONTROLLER] playbooks/hook/tasks/events - malformed request');
    logger.error(req.body);
    res.status(400).send({
      success: false,
    });
    return;
  }
  const removeEmptyLines = (str: string) =>
    str
      .split(/\r?\n/)
      .filter((line) => line.trim() !== '')
      .join('\n');
  const ansibleLog: AnsibleLog = {
    ident: req.body.runner_ident,
    logRunnerId: req.body.uuid,
    stdout: req.body.stdout ? removeEmptyLines(req.body.stdout) : undefined,
    content: JSON.stringify(req.body),
  };
  await AnsibleLogsRepo.create(ansibleLog);
  new SuccessResponse('Added task event').send(res);
});
