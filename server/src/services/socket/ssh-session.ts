import Joi from 'joi';
import DeviceRepo from '../../data/database/repository/DeviceRepo';
import PinoLogger from '../../logger';
import { SSMSocket, SSMSocketServer } from '../../middlewares/Socket';
import { registerSshSession } from '../../modules/ssh/SSHTerminalEngine';

const logger = PinoLogger.child({ module: 'SocketService' }, { msgPrefix: '[SSH_SESSION] - ' });

const sshSessionSchema = Joi.object({
  deviceUuid: Joi.string().required(),
  rows: Joi.number().required(),
  cols: Joi.number().required(),
});

type CallbackType = (response: { status: string; error?: string }) => void;

const validatePayload = (payload: any) => sshSessionSchema.validate(payload);

const handleValidationError = (error: Joi.ValidationError, callback: CallbackType): void => {
  logger.error(error);
  callback({
    status: 'Bad Request',
    error: error.details?.map((e) => e.message).join(', '),
  });
};

const findDeviceByUuid = async (deviceUuid: string) => {
  const device = await DeviceRepo.findOneByUuid(deviceUuid);
  if (!device) {
    logger.error(`Device Id ${deviceUuid} not found`);
    throw new Error(`Device Id ${deviceUuid} not found`);
  }
  return device;
};

export function startSSHSession({ socket }: { io: SSMSocketServer; socket: SSMSocket }) {
  return async (payload: any, callback: CallbackType) => {
    logger.info('startSSHSession');
    if (typeof callback !== 'function') {
      logger.error('callback not a function');
      return;
    }

    const { error, value } = validatePayload(payload);
    if (error) {
      return handleValidationError(error, callback);
    }

    try {
      const device = await findDeviceByUuid(value.deviceUuid);
      registerSshSession(device.uuid, socket, { rows: value.rows, cols: value.cols });
    } catch (error: any) {
      logger.error(error);
      return callback({
        status: 'Internal Error',
        error: error.message,
      });
    }

    callback({ status: 'OK' });
  };
}
