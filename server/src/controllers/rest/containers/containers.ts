import { parse } from 'url';
import { API, SsmContainer } from 'ssm-shared-lib';
import ContainerRepo from '../../../data/database/repository/ContainerRepo';
import ProxmoxContainerRepo from '../../../data/database/repository/ProxmoxContainerRepo';
import { filterByFields, filterByQueryParams } from '../../../helpers/query/FilterHelper';
import { paginate } from '../../../helpers/query/PaginationHelper';
import { sortByFields } from '../../../helpers/query/SorterHelper';
import { BadRequestError, InternalError, NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import WatcherEngine from '../../../modules/containers/core/WatcherEngine';
import ContainerUseCases from '../../../services/ContainerUseCases';

export const getContainers = async (req, res) => {
  const realUrl = req.url;
  const { current = 1, pageSize = 10 } = req.query;
  const params = parse(realUrl, true).query as unknown as API.PageParams &
    API.Container & {
      sorter: any;
      filter: any;
    };

  const containers = (await Promise.all([ContainerRepo.findAll(), ProxmoxContainerRepo.findAll()]))
    .filter(Boolean) // Remove any undefined or null
    .flat() as API.Container[];

  // Use the separated services
  let dataSource = sortByFields(containers, params);
  dataSource = filterByFields(dataSource, params);
  dataSource = filterByQueryParams(
    dataSource.map((e) => ({ ...e, deviceUuid: e.device?.uuid })),
    params,
    ['status[]', 'name', 'updateAvailable', 'deviceUuid'],
  );
  const totalBeforePaginate = dataSource?.length || 0;

  // Add pagination
  dataSource = paginate(dataSource, current as number, pageSize as number);

  new SuccessResponse('Get containers', dataSource, {
    total: totalBeforePaginate,
    success: true,
    pageSize,
    current: parseInt(`${params.current}`, 10) || 1,
  }).send(res);
};

export const postCustomNameOfContainer = async (req, res) => {
  const { id } = req.params;
  const { customName } = req.body;
  const container = await ContainerRepo.findContainerById(id);
  if (!container) {
    throw new NotFoundError(`Container with id ${id} not found`);
  }
  await ContainerUseCases.updateCustomName(customName, container);
  new SuccessResponse('Updated container', {}).send(res);
};

export const refreshAll = async (req, res) => {
  try {
    await Promise.all(
      Object.values(WatcherEngine.getStates().watcher).map((watcher) => watcher.watch()),
    );
    new SuccessResponse('refreshed all containers', {}).send(res);
  } catch (e: any) {
    throw new InternalError(`Error when watching images (${e.message})`);
  }
};

export const postDockerContainerAction = async (req, res) => {
  const { id, action } = req.params;
  const container = await ContainerRepo.findContainerById(id);
  if (!container) {
    throw new NotFoundError(`Container with id ${id} not found`);
  }
  if (!(Object.values(SsmContainer.Actions) as string[]).includes(action)) {
    throw new BadRequestError();
  }
  const result = await ContainerUseCases.performDockerAction(
    container,
    action as SsmContainer.Actions,
  );
  new SuccessResponse('Performed container action', result).send(res);
};

export const postProxmoxContainerAction = async (req, res) => {
  const { uuid, action } = req.params;
  const container = await ProxmoxContainerRepo.findContainerByUuid(uuid);
  if (!container) {
    throw new NotFoundError(`Container with uuid ${uuid} not found`);
  }
  if (!(Object.values(SsmContainer.Actions) as string[]).includes(action)) {
    throw new BadRequestError();
  }
  const result = await ContainerUseCases.performProxmoxAction(
    container,
    action as SsmContainer.Actions,
  );
  new SuccessResponse('Performed container action', result).send(res);
};
