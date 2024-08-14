import Joi from 'joi';
import DeviceRepo from '../../data/database/repository/DeviceRepo';
import PinoLogger from '../../logger';
import { SSMSocket, SSMSocketServer } from '../../middlewares/Socket';
import { registerSshSession } from '../../modules/ssh/SSHTerminalEngine';

const logger = PinoLogger.child({ module: 'SocketService' }, { msgPrefix: '[SSH_SESSION] - ' });

const sshSession = Joi.object({
  deviceUuid: Joi.string().required(),
  rows: Joi.number().required(),
  cols: Joi.number().required(),
});

export function startSSHSession({ io, socket }: { io: SSMSocketServer; socket: SSMSocket }) {
  return async (payload, callback) => {
    logger.info('startSSHSession');

    if (typeof callback !== 'function') {
      logger.error('callback not fun');
      return;
    }
    const { error, value } = sshSession.validate(payload);
    if (error) {
      logger.error(error);
      return callback({
        status: 'Bad Request',
        error: error.details?.map((e) => e.message).join(', '),
      });
    }
    const device = await DeviceRepo.findOneByUuid(value.deviceUuid);
    if (!device) {
      logger.error(`Device Id ${value.deviceUuid} not found`);
      return callback({
        status: 'Bad Request',
        error: `Device Id ${value.deviceUuid} not found`,
      });
    }

    try {
      registerSshSession(value.deviceUuid, socket, {
        rows: value.rows,
        cols: value.cols,
      });
    } catch (error: any) {
      logger.error(error);
      return callback({
        status: 'Internal Error',
        error: error.message,
      });
    }
    callback({
      status: 'OK',
    });
  };
}
