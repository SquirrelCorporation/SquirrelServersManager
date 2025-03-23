import { Inject, Injectable } from '@nestjs/common';
import { filterByFields, filterByQueryParams } from '../../../../helpers/query/FilterHelper';
import { paginate } from '../../../../helpers/query/PaginationHelper';
import { sortByFields } from '../../../../helpers/query/SorterHelper';
import logger from '../../../../logger';
import {
  IServerLogsRepository,
  SERVER_LOGS_REPOSITORY,
} from '../../domain/repositories/server-logs-repository.interface';
import { ServerLogsQueryDto } from '../../presentation/dtos/server-logs-query.dto';
import { IServerLogsService } from '../interfaces/server-logs-service.interface';
import { ServerLogPresentationMapper } from '../../presentation/mappers/server-log.mapper';

@Injectable()
export class ServerLogsService implements IServerLogsService {
  constructor(
    @Inject(SERVER_LOGS_REPOSITORY) private serverLogsRepository: IServerLogsRepository,
    private serverLogPresentationMapper: ServerLogPresentationMapper,
  ) {}

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
      'hostname',
    ]);

    const totalBeforePaginate = dataSource?.length || 0;
    dataSource = paginate(dataSource, current as number, pageSize as number);

    // Map to DTOs
    const dtos = dataSource.map((log) => this.serverLogPresentationMapper.toDto(log));

    return {
      data: dtos,
      metadata: {
        total: totalBeforePaginate,
        pageSize,
        current: parseInt(`${current}`, 10) || 1,
      },
    };
  }
}
