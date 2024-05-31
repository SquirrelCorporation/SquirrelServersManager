import { Request } from 'express';
import logger from '../logger';

export function findIpAddress(req: Request) {
  try {
    logger.info(JSON.stringify(req.headers));
    if (req.headers['x-forwarded-for']) {
      return req.headers['x-forwarded-for'].toString().split(',')[0];
    } else if (req.connection && req.connection.remoteAddress) {
      return req.connection.remoteAddress;
    }
    return req.ip;
  } catch (e) {
    logger.error(e);
    return undefined;
  }
}
