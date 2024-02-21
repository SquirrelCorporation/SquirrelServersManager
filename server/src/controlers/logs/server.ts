import express from 'express';
import LogsRepo from '../../database/repository/LogsRepo';
import Authentication from '../../middlewares/Authentication';

const router = express.Router();

router.get(`/server`, Authentication.isAuthenticated, async (req, res) => {
  const logs = await LogsRepo.findAll();
  res.send({
    success: true,
    data: logs,
  });
});

export default router;
