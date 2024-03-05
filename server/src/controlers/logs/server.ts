import express from 'express';
import LogsRepo from '../../database/repository/LogsRepo';
import Authentication from '../../middlewares/Authentication';
import logger from '../../logger';

const router = express.Router();

router.get(`/server`, Authentication.isAuthenticated, async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /logs/server`);
  const logs = await LogsRepo.findAll();
  res.send({
    success: true,
    data: logs,
  });
});

export default router;
