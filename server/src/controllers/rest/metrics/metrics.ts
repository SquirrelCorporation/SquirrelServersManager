import express from 'express';
import { prometheusConf } from '../../../config';
import { deviceRegistry } from '../../../data/statistics';
import logger from '../../../logger';

const router = express.Router();

router.get('/metrics', async (req, res) => {
  const authHeader = req.headers['authorization'];

  // Check if the auth header exists and matches the expected username and password
  if (
    !authHeader ||
    authHeader !==
      'Basic ' + Buffer.from(`${prometheusConf.user}:${prometheusConf.password}`).toString('base64')
  ) {
    logger.fatal('Unauthorized');
    res.status(401).send('Unauthorized');
    return;
  }

  res.setHeader('Content-Type', deviceRegistry.contentType);
  res.send(await deviceRegistry.metrics());
});

export default router;
