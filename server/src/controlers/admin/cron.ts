import express from 'express';
import CronRepo from '../../database/repository/CronRepo';
import Authentication from '../../middlewares/Authentication';

const router = express.Router();

router.get(`/`, Authentication.isAuthenticated, async (req, res) => {
  const crons = await CronRepo.findAll();
  res.send({
    success: true,
    data: crons,
  });
});

export default router;
