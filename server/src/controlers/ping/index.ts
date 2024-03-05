import express from 'express';
import logger from '../../logger';

const router = express.Router();

router.get(`/`, async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /ping/`);
  res.send({
    success: true,
    data: {
      message: 'Hello!',
    },
  });
});

export default router;
