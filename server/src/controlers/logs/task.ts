import express from 'express';
import AnsibleTaskRepo from '../../database/repository/AnsibleTaskRepo';
import Authentication from '../../middlewares/Authentication';
import logger from '../../logger';

const router = express.Router();

router.get(`/tasks`, Authentication.isAuthenticated, async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /logs/tasks`);
  const tasks = await AnsibleTaskRepo.findAll();
  res.send({
    success: true,
    data: tasks,
  });
});

export default router;
