import Joi from 'joi';
import DeviceRepo from '../../data/database/repository/DeviceRepo';
import PinoLogger from '../../logger';
import { SSMSocket, SSMSocketServer } from '../../middlewares/Socket';
import { registerSftpSession } from '../../modules/ssh/SFTPEngine';

const logger = PinoLogger.child({ module: 'SocketService' }, { msgPrefix: '[SFTP_SESSION] - ' });

const sftpSessionSchema = Joi.object({
  deviceUuid: Joi.string().required(),
});

type CallbackType = (response: { status: string; error?: string }) => void;

const validatePayload = (payload: any) => sftpSessionSchema.validate(payload);

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

export function startSFTPSession({ socket }: { io: SSMSocketServer; socket: SSMSocket }) {
  return async (payload: any, callback: CallbackType) => {
    logger.info('startSFTPSession');
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
      registerSftpSession(device.uuid, socket);
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
