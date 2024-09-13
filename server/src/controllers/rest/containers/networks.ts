import { parse } from 'url';
import { API } from 'ssm-shared-lib';
import ContainerNetworkRepo from '../../../data/database/repository/ContainerNetworkRepo';
import PlaybookRepo from '../../../data/database/repository/PlaybookRepo';
import { filterByFields, filterByQueryParams } from '../../../helpers/query/FilterHelper';
import { paginate } from '../../../helpers/query/PaginationHelper';
import { sortByFields } from '../../../helpers/query/SorterHelper';
import { InternalError, NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import asyncHandler from '../../../middlewares/AsyncHandler';
import PlaybookUseCases from '../../../services/PlaybookUseCases';

export const getNetworks = asyncHandler(async (req, res) => {
  const realUrl = req.url;
  const { current = 1, pageSize = 10 } = req.query;
  const params = parse(realUrl, true).query as unknown as API.PageParams &
    API.ContainerNetwork & {
      sorter: any;
      filter: any;
    };
  const networks = (await ContainerNetworkRepo.findAll()) as unknown as API.ContainerNetwork[];
  // Use the separated services
  let dataSource = sortByFields(networks, params);
  dataSource = filterByFields(dataSource, params);
  dataSource = filterByQueryParams(
    dataSource.map((e) => ({ ...e, deviceUuid: e.device?.uuid })),
    params,
    ['attachable', 'name', 'scope', 'driver', 'deviceUuid'],
  );
  const totalBeforePaginate = dataSource?.length || 0;
  dataSource = paginate(dataSource, current as number, pageSize as number);

  new SuccessResponse('Got networks', dataSource, {
    total: totalBeforePaginate,
    success: true,
    pageSize,
    current: parseInt(`${params.current}`, 10) || 1,
  }).send(res);
});

export const postNetwork = asyncHandler(async (req, res) => {
  const { config, target }: API.CreateNetwork = req.body;
  const playbook = await PlaybookRepo.findOneByUniqueQuickReference('createDockerNetwork');
  if (!playbook) {
    throw new NotFoundError(`Playbook 'createDockerNetwork' not found`);
  }
  if (!req.user) {
    throw new NotFoundError('No user');
  }
  const createNetworkConfig: API.ExtraVars = [];
  Object.keys(config).forEach((key) => {
    let value = config[key];
    if (value) {
      if (typeof value !== 'string') {
        // If value is an object (including arrays), stringify it
        value = JSON.stringify(value);
      }
      createNetworkConfig.push({ extraVar: key, value: value });
    }
  });
  try {
    const execId = await PlaybookUseCases.executePlaybook(
      playbook,
      req.user,
      [target],
      createNetworkConfig,
    );
    new SuccessResponse('Execution in progress', { execId: execId } as API.ExecId).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});
