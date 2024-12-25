import Joi from 'joi';
import { DateTime } from 'luxon';
import { SsmEvents } from 'ssm-shared-lib';
import ContainerRepo from '../../data/database/repository/ContainerRepo';
import PinoLogger from '../../logger';
import { SSMSocket, SSMSocketServer } from '../../middlewares/Socket';
import { Kind } from '../../modules/containers/core/Component';
import { WATCHERS } from '../../modules/containers/core/conf';
import WatcherEngine from '../../modules/containers/core/WatcherEngine';
import Docker from '../../modules/containers/watchers/providers/docker/Docker';

const containerSchema = Joi.object({
  containerId: Joi.string().required(),
  from: Joi.number().optional().default(DateTime.now().toUnixInteger()),
});

const logger = PinoLogger.child({ module: 'SocketService' }, { msgPrefix: '[CONTAINER_LOGS] - ' });

export function getContainerLogs({ socket }: { io: SSMSocketServer; socket: SSMSocket }) {
  return async (payload: any, callback: (response: { status: string; error?: string }) => void) => {
    logger.info('getContainerLogs');

    if (typeof callback !== 'function') {
      logger.error('callback not a function');
      return;
    }

    const { error, value } = validatePayload(payload, callback);
    if (error) {
      return;
    }

    try {
      const container = await ContainerRepo.findContainerById(value.containerId);
      if (!container) {
        return handleError(`Container Id ${value.containerId} not found`, 'Bad Request', callback);
      }

      const registeredComponent = findRegisteredComponent(container.watcher);
      if (!registeredComponent) {
        return handleError(
          `Watcher is not registered: ${container.watcher}`,
          'Bad Request',
          callback,
        );
      }

      const from = parseInt(value.from);
      logger.info(`Getting container (${container.id}) logs from ${from}`);
      const getContainerLogsCallback = (data: string) =>
        socket.emit(SsmEvents.Logs.NEW_LOGS, { data });

      const closingCallback = registeredComponent.getContainerLiveLogs(
        container.id,
        from,
        getContainerLogsCallback,
      );
      socket.on(SsmEvents.Logs.CLOSED, closingCallback);
      socket.on(SsmEvents.Common.DISCONNECT, closingCallback);

      callback({ status: 'OK' });
      getContainerLogsCallback(`🛜 Connecting...\n`);
    } catch (err: any) {
      logger.error(err);
      handleError(err.message, 'Internal Error', callback);
    }
  };
}

function validatePayload(
  payload: any,
  callback: (response: { status: string; error?: string }) => void,
): { error: Joi.ValidationError | null; value: any } {
  const { error, value } = containerSchema.validate(payload);
  if (error) {
    const errorMsg = error.details?.map((e) => e.message).join(', ');
    handleError(errorMsg, 'Bad Request', callback, error);
    return { error, value: null };
  }
  return { error: null, value };
}

function handleError(
  errorMsg: string,
  status: string,
  callback: (response: { status: string; error?: string }) => void,
  error?: Error,
): void {
  logger.error(error);
  callback({ status, error: errorMsg });
}

function findRegisteredComponent(watcher: string): Docker | undefined {
  return WatcherEngine.getStates().watcher[
    WatcherEngine.buildId(Kind.WATCHER, WATCHERS.DOCKER, watcher)
  ] as Docker;
}
