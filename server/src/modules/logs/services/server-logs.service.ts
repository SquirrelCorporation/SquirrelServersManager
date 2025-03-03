import { Injectable } from '@nestjs/common';
import { filterByFields, filterByQueryParams } from '../../../helpers/query/FilterHelper';
import { paginate } from '../../../helpers/query/PaginationHelper';
import { sortByFields } from '../../../helpers/query/SorterHelper';
import logger from '../../../logger';
import { ServerLogsQueryDto } from '../dto/server-logs-query.dto';
import { ServerLogsRepository } from '../repositories/server-logs.repository';

@Injectable()
export class ServerLogsService {
  constructor(private serverLogsRepository: ServerLogsRepository) {}

  async getServerLogs(params: ServerLogsQueryDto) {
    logger.info('[SERVICE] - ServerLogsService - getServerLogs');
    const { current = 1, pageSize = 10 } = params;

    const logs = await this.serverLogsRepository.findAll();

    // Apply sorting, filtering and pagination
    let dataSource = sortByFields(logs, params);
    dataSource = filterByFields(dataSource, params);
    dataSource = filterByQueryParams(dataSource, params, [
      'time',
      'pid',
      'level',
      'msg',
      'module',
      'moduleId',
      'moduleName',
    ]);

    const totalBeforePaginate = dataSource?.length || 0;
    dataSource = paginate(dataSource, current as number, pageSize as number);

    return {
      data: dataSource,
      meta: {
        total: totalBeforePaginate,
        success: true,
        pageSize,
        current: parseInt(`${current}`, 10) || 1,
      },
      message: 'Get server logs successful',
    };
  }
}
