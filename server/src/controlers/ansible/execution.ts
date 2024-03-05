import express from 'express';
import Authentication from '../../middlewares/Authentication';
import ansible from '../../shell/ansible';
import logger from '../../logger';
import AnsibleLogsRepo from '../../database/repository/AnsibleLogsRepo';
import AnsibleTaskStatusRepo from '../../database/repository/AnsibleTaskStatusRepo';

const router = express.Router();

router.post(`/exec/playbook`, Authentication.isAuthenticated, async (req, res) => {
  logger.info(`[CONTROLLER] - POST - /ansible/exec/playbook`);
  if (!req.body.playbook) {
    res.status(400).send({
      success: false,
    });
    return;
  }
  try {
    logger.info(`[CONTROLLER]- POST - /ansible/exec/playbook - '${req.body.playbook}'`);
    const execId = await ansible.executePlaybook(req.body.playbook, req.user, req.body.target);
    res.send({
      success: true,
      data: { execId: execId },
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send({
      success: false,
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
