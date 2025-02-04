import Queue from 'bull';
import { redisConf } from '../../config';

// Initialize a queue for device updates
export const updateQueue = new Queue('deviceUpdates', {
  redis: { host: redisConf.host, port: redisConf.port },
});
