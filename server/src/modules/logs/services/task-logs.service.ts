import { Injectable, NotFoundException } from '@nestjs/common';
import { filterByFields, filterByQueryParams } from '../../../helpers/query/FilterHelper';
import { paginate } from '../../../helpers/query/PaginationHelper';
import { sortByFields } from '../../../helpers/query/SorterHelper';
import logger from '../../../logger';
import { TaskLogsQueryDto } from '../dto/task-logs-query.dto';
import { AnsibleLogsRepository } from '../repositories/ansible-logs.repository';
import { AnsibleTaskRepository } from '../repositories/ansible-task.repository';

@Injectable()
export class TaskLogsService {
  constructor(
    private ansibleTaskRepository: AnsibleTaskRepository,
    private ansibleLogsRepository: AnsibleLogsRepository,
  ) {}

  async getTaskLogs(params: TaskLogsQueryDto) {
    logger.info(`[SERVICE] - TaskLogsService - getTaskLogs`);
    const { current = 1, pageSize = 10 } = params;

    const tasks = await this.ansibleTaskRepository.findAll();

    // Apply sorting, filtering and pagination
    let dataSource = sortByFields(tasks, params);
    dataSource = filterByFields(dataSource, params);
    dataSource = filterByQueryParams(dataSource, params, [
      'ident',
      'status',
      'cmd',
      'createdAt',
      'updatedAt',
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
      message: 'Get task logs successful',
    };
  }

  async getTaskEvents(id: string) {
    if (!id) {
      throw new NotFoundException('No task id provided');
    }

    const events = await this.ansibleLogsRepository.findAllByIdent(id, 1);

    if (!events || events.length === 0) {
      throw new NotFoundException(`No events found for task ${id}`);
    }

    return {
      data: events,
      meta: {
        success: true,
      },
      message: 'Get task events successful',
    };
  }
}
