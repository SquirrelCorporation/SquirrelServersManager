import { API } from 'ssm-shared-lib';
import { SuccessResponse } from '../../core/api/ApiResponse';
import ContainerRepo from '../../data/database/repository/ContainerRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import logger from '../../logger';

export const getContainers = asyncHandler(async (req, res) => {
  const containers = (await ContainerRepo.findAll()) as API.Container[];
  logger.debug(containers);
  new SuccessResponse('Get containers', {
    containers: containers,
  }).send(res);
});
