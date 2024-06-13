import { API } from 'ssm-shared-lib';
import { parse } from 'url';
import { InternalError, NotFoundError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import ContainerRepo from '../../data/database/repository/ContainerRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import { filterByFields, filterByQueryParams } from '../../helpers/FilterHelper';
import { paginate } from '../../helpers/PaginationHelper';
import { sortByFields } from '../../helpers/SorterHelper';
import WatcherEngine from '../../integrations/docker/core/WatcherEngine';
import logger from '../../logger';
import ContainerUseCases from '../../use-cases/ContainerUseCases';

export const getContainers = asyncHandler(async (req, res) => {
  const realUrl = req.url;
  const { current = 1, pageSize = 10 } = req.query;
  const params = parse(realUrl, true).query as unknown as API.PageParams &
    API.Container & {
      sorter: any;
      filter: any;
    };
  const containers = (await ContainerRepo.findAll()) as API.Container[];
  logger.debug(containers);
  // Add pagination
  let dataSource = paginate(containers, current as number, pageSize as number);
  // Use the separated services
  dataSource = sortByFields(dataSource, params);
  dataSource = filterByFields(dataSource, params);
  //TODO: update validator
  dataSource = filterByQueryParams(dataSource, params, ['status', 'name', 'updateAvailable']);

  new SuccessResponse('Get containers', dataSource, {
    total: dataSource.length,
    success: true,
    pageSize,
    current: parseInt(`${params.current}`, 10) || 1,
  }).send(res);
});

export const postCustomNameOfContainer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { customName } = req.body;
  const container = await ContainerRepo.findContainerById(id);
  if (!container) {
    throw new NotFoundError(`Container with id ${id} not found`);
  }
  await ContainerUseCases.updateCustomName(customName, container);
  new SuccessResponse('Updated container', {}).send(res);
});

export const refreshAll = asyncHandler(async (req, res) => {
  try {
    await Promise.all(
      Object.values(WatcherEngine.getStates().watcher).map((watcher) => watcher.watch()),
    );
    new SuccessResponse('refreshed all containers', {}).send(res);
  } catch (e: any) {
    throw new InternalError(`Error when watching images (${e.message})`);
  }
});
