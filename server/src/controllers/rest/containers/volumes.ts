import { parse } from 'url';
import { API } from 'ssm-shared-lib';
import ContainerVolumeRepo from '../../../data/database/repository/ContainerVolumeRepo';
import PlaybookRepo from '../../../data/database/repository/PlaybookRepo';
import { filterByFields, filterByQueryParams } from '../../../helpers/query/FilterHelper';
import { paginate } from '../../../helpers/query/PaginationHelper';
import { sortByFields } from '../../../helpers/query/SorterHelper';
import { InternalError, NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import PlaybookUseCases from '../../../services/PlaybookUseCases';

export const getVolumes = async (req, res) => {
  const realUrl = req.url;
  const { current = 1, pageSize = 10 } = req.query;
  const params = parse(realUrl, true).query as unknown as API.PageParams &
    API.ContainerVolume & {
      sorter: any;
      filter: any;
    };
  const networks = (await ContainerVolumeRepo.findAll()) as unknown as API.ContainerVolume[];
  // Use the separated services
  let dataSource = sortByFields(networks, params);
  dataSource = filterByFields(dataSource, params);
  dataSource = filterByQueryParams(
    dataSource.map((e) => ({ ...e, deviceUuid: e.device?.uuid })),
    params,
    ['name', 'scope', 'driver', 'deviceUuid'],
  );
  const totalBeforePaginate = dataSource?.length || 0;
  dataSource = paginate(dataSource, current as number, pageSize as number);

  new SuccessResponse('Got volumes', dataSource, {
    total: totalBeforePaginate,
    success: true,
    pageSize,
    current: parseInt(`${params.current}`, 10) || 1,
  }).send(res);
};

export const postVolume = async (req, res) => {
  const { config, target }: API.CreateNetwork = req.body;
  const playbook = await PlaybookRepo.findOneByUniqueQuickReference('createDockerVolume');
  if (!playbook) {
    throw new NotFoundError(`Playbook 'createDockerVolume' not found`);
  }
  if (!req.user) {
    throw new NotFoundError('No user');
  }
  const createVolumeConfig: API.ExtraVars = [];
  Object.keys(config).forEach((key) => {
    let value = config[key];
    if (value) {
      if (typeof value !== 'string') {
        // If value is an object (including arrays), stringify it
        value = JSON.stringify(value);
      }
      createVolumeConfig.push({ extraVar: key, value: value });
    }
  });
  try {
    const execId = await PlaybookUseCases.executePlaybook(
      playbook,
      req.user,
      [target],
      createVolumeConfig,
    );
    new SuccessResponse('Execution in progress', { execId: execId } as API.ExecId).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
};
