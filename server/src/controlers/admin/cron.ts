import express from 'express';
import CronRepo from '../../database/repository/CronRepo';
import Authentication from '../../middlewares/Authentication';
import logger from '../../logger';

const router = express.Router();

router.get(`/`, Authentication.isAuthenticated, async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /crons`);
  const crons = await CronRepo.findAll();
  res.send({
    success: true,
    data: crons,
  });
});

export default router;
