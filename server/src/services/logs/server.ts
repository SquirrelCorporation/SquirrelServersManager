import { parse } from 'url';
import { API } from 'ssm-shared-lib';
import { SuccessResponse } from '../../middlewares/api/ApiResponse';
import LogsRepo from '../../data/database/repository/LogsRepo';
import asyncHandler from '../../middlewares/AsyncHandler';
import { filterByFields, filterByQueryParams } from '../../helpers/query/FilterHelper';
import { paginate } from '../../helpers/query/PaginationHelper';
import { sortByFields } from '../../helpers/query/SorterHelper';

export const getServerLogs = asyncHandler(async (req, res) => {
  const realUrl = req.url;
  const { current = 1, pageSize = 10 } = req.query;
  const params = parse(realUrl, true).query as unknown as API.PageParams &
    API.ServerLog & {
      sorter: any;
      filter: any;
    };
  const logs = await LogsRepo.findAll();
  // Add pagination
  // Use the separated services
  let dataSource = sortByFields(logs, params);
  dataSource = filterByFields(dataSource, params);
  //TODO: update validator
  dataSource = filterByQueryParams(dataSource, params, [
    'time',
    'pid',
    'level',
    'message',
    'module',
    'moduleId',
    'moduleName',
  ]);
  dataSource = paginate(dataSource, current as number, pageSize as number);
  new SuccessResponse('Get server logs successful', dataSource, {
    total: logs.length,
    success: true,
    pageSize,
    current: parseInt(`${params.current}`, 10) || 1,
  }).send(res);
});
