import ContainerRepo from '../../../data/database/repository/ContainerRepo';
import { InternalError, NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import ContainerStatsUseCases from '../../../services/ContainerStatsUseCases';

export const getContainerStatByContainerId = async (req, res) => {
  const { id, type } = req.params;

  const container = await ContainerRepo.findContainerById(id);
  if (container == null) {
    throw new NotFoundError(`Container not found ${id}`);
  }
  try {
    const stat = await ContainerStatsUseCases.getStatByDeviceAndType(container, type);
    new SuccessResponse(
      'Get container stat by container id successful',
      stat ? stat[0] : null,
    ).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
};

export const getContainerStatsByContainerId = async (req, res) => {
  const { id, type } = req.params;
  const { from = 24 } = req.query;

  const container = await ContainerRepo.findContainerById(id);
  if (container == null) {
    throw new NotFoundError(`Container not found ${id}`);
  }
  try {
    const stats = await ContainerStatsUseCases.getStatsByDeviceAndType(
      container,
      from as number,
      type,
    );
    new SuccessResponse('Get container stats by container id successful', stats).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
};

export const getNbContainersByStatus = async (req, res) => {
  const { status } = req.params;
  try {
    if (status === 'all') {
      const nbContainers = await ContainerRepo.count();
      new SuccessResponse('Get nb containers', nbContainers).send(res);
    } else {
      const nbContainers = await ContainerRepo.countByStatus(status);
      new SuccessResponse('Get nb containers', nbContainers).send(res);
    }
  } catch (error: any) {
    throw new InternalError(error.message);
  }
};

export const getAveragedStats = async (req, res) => {
  try {
    const stats = await ContainerStatsUseCases.getCpUAndMemAveragedStats();
    new SuccessResponse('Get averaged container stats', stats).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
};
