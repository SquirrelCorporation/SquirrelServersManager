import { parse } from 'url';
import { API } from 'ssm-shared-lib';
import AnsibleLogsRepo from '../../../data/database/repository/AnsibleLogsRepo';
import AnsibleTaskRepo from '../../../data/database/repository/AnsibleTaskRepo';
import { filterByFields, filterByQueryParams } from '../../../helpers/query/FilterHelper';
import { paginate } from '../../../helpers/query/PaginationHelper';
import { sortByFields } from '../../../helpers/query/SorterHelper';
import logger from '../../../logger';
import { NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';

export const getTaskLogs = async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /logs/tasks`);
  const realUrl = req.url;
  const { current = 1, pageSize = 10 } = req.query;
  const params = parse(realUrl, true).query as unknown as API.PageParams &
    API.Task & {
      sorter: any;
      filter: any;
    };

  const tasks = await AnsibleTaskRepo.findAll();
  // Add pagination
  // Use the separated services
  let dataSource = sortByFields(tasks, params);
  dataSource = filterByFields(dataSource, params);
  //TODO: update validator
  dataSource = filterByQueryParams(dataSource, params, [
    'ident',
    'status',
    'cmd',
    'createdAt',
    'updatedAt',
  ]);
  const totalBeforePaginate = dataSource?.length || 0;
  dataSource = paginate(dataSource, current as number, pageSize as number);

  new SuccessResponse('Get task logs successful', dataSource, {
    total: totalBeforePaginate,
    success: true,
    pageSize,
    current: parseInt(`${params.current}`, 10) || 1,
  }).send(res);
};

export const getTaskEvents = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new NotFoundError('No id');
  }
  const events = await AnsibleLogsRepo.findAllByIdent(id, 1);

  new SuccessResponse('Get task logs successful', events).send(res);
};
