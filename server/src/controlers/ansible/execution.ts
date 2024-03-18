import express from 'express';
import { API } from 'ssm-shared-lib';
import Authentication from '../../middlewares/Authentication';
import logger from '../../logger';
import AnsibleLogsRepo from '../../database/repository/AnsibleLogsRepo';
import AnsibleTaskStatusRepo from '../../database/repository/AnsibleTaskStatusRepo';
import PlaybookRepo from '../../database/repository/PlaybookRepo';
import PlaybookUseCases from '../../use-cases/PlaybookUseCases';

const router = express.Router();

router.post(`/exec/playbook/:playbook`, Authentication.isAuthenticated, async (req, res) => {
  logger.info(`[CONTROLLER] - POST - /ansible/exec/playbook`);
  if (!req.params.playbook) {
    res.status(400).send({
      success: false,
      message: 'Playbook is undefined',
    });
    return;
  }
  try {
    logger.info(`[CONTROLLER]- POST - /ansible/exec/playbook - '${req.params.playbook}'`);
    const playbook = await PlaybookRepo.findOne(req.params.playbook);
    if (!playbook) {
      res.status(404).send({
        success: false,
      });
      return;
    }
    const execId = await PlaybookUseCases.executePlaybook(
      playbook,
      req.user,
      req.body.target,
      req.body.extraVars as API.ExtraVars,
    );
    res.send({
      success: true,
      data: { execId: execId },
    });
  } catch (error: any) {
    logger.error(error);
    res.status(500).send({
      success: false,
      message: error.message,
    });
    return;
  }
});

router.get(`/exec/:id/logs`, Authentication.isAuthenticated, async (req, res) => {
  logger.info(`[CONTROLLER]- GET - /ansible/exec/${req.params.id}/logs`);
  if (!req.params.id) {
    res.status(400).send({
      success: false,
    });
    return;
  }
  const execLogs = await AnsibleLogsRepo.findAllByIdent(req.params.id);
  logger.info(execLogs);
  res.send({
    success: true,
    data: {
      execId: req.params.id,
      execLogs: execLogs,
    },
  });
});

router.get(`/exec/:id/status`, Authentication.isAuthenticated, async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /ansible/exec/:${req.params.id}/status`);
  if (!req.params.id) {
    res.status(400).send({
      success: false,
    });
    return;
  }
  const taskStatuses = await AnsibleTaskStatusRepo.findAllByIdent(req.params.id);
  logger.info(taskStatuses);
  res.send({
    success: true,
    data: {
      execId: req.params.id,
      execStatuses: taskStatuses,
    },
  });
});

export default router;
