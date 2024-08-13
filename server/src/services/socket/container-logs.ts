import Joi from 'joi';
import ContainerRepo from '../../data/database/repository/ContainerRepo';
import logger from '../../logger';
import { SSMSocket, SSMSocketServer } from '../../middlewares/Socket';
import { Kind } from '../../modules/docker/core/Component';
import WatcherEngine from '../../modules/docker/core/WatcherEngine';
import Docker from '../../modules/docker/watchers/providers/docker/Docker';

const containerSchema = Joi.object({
  containerId: Joi.string().uuid().required(),
});

export function getContainerLogs({ io, socket }: { io: SSMSocketServer; socket: SSMSocket }) {
  return async (payload, callback) => {
    if (typeof callback !== 'function') {
      logger.error('callback not fun');
      return;
    }
    const { error, value } = containerSchema.validate(payload);
    if (error) {
      logger.error(error);
      return callback({
        status: 'Bad Request',
        error: error.details?.map((e) => e.message).join(', '),
      });
    }
    const container = await ContainerRepo.findContainerById(value.containerId);
    if (!container) {
      logger.error(`Container Id ${value.containerId} not found`);
      return callback({
        status: 'Bad Request',
        error: `Container Id ${value.containerId} not found`,
      });
    }
    const registeredComponent = WatcherEngine.getStates().watcher[
      WatcherEngine.buildId(Kind.WATCHER, 'docker', container.watcher)
    ] as Docker;
    if (!registeredComponent) {
      return callback({
        status: 'Bad Request',
        error: `Watcher is not registered  ${container.watcher}`,
      });
    }
    try {
      const getContainerLogsCallback = (data: string) => {
        socket.emit('logs:newLogs', { data: data });
      };
      const closingCallback = registeredComponent.getContainerLiveLogs(
        container.id,
        0,
        getContainerLogsCallback,
      );
      socket.on('logs:closing', closingCallback);
      socket.on('disconnect', closingCallback);
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
