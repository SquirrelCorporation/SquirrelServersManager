import { parse } from 'url';
import { SuccessResponse } from '../../core/api/ApiResponse';
import AnsibleTaskRepo from '../../data/database/repository/AnsibleTaskRepo';
import asyncHandler from '../../helpers/AsyncHandler';
import { filterByFields, filterByQueryParams } from '../../helpers/FilterHelper';
import { paginate } from '../../helpers/PaginationHelper';
import { sortByFields } from '../../helpers/SorterHelper';
import logger from '../../logger';
import { API } from 'ssm-shared-lib';

export const getTaskLogs = asyncHandler(async (req, res) => {
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
  dataSource = paginate(dataSource, current as number, pageSize as number);

  new SuccessResponse('Get task logs successful', dataSource, {
    total: tasks.length,
    success: true,
    pageSize,
    current: parseInt(`${params.current}`, 10) || 1,
  }).send(res);
});
