import { parse } from 'url';
import { Injectable } from '@nestjs/common';
import { API } from 'ssm-shared-lib';
import { AnsibleLogsRepository } from '../repositories/ansible-logs.repository';
import { AnsibleTaskRepository } from '../repositories/ansible-task.repository';
import { filterByFields, filterByQueryParams } from '../../../helpers/query/FilterHelper';
import { paginate } from '../../../helpers/query/PaginationHelper';
import { sortByFields } from '../../../helpers/query/SorterHelper';
import { NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import logger from '../../../logger';

@Injectable()
export class TaskLogsService {
  constructor(
    private readonly ansibleLogsRepository: AnsibleLogsRepository,
    private readonly ansibleTaskRepository: AnsibleTaskRepository,
  ) {}

  async getTaskLogs(req, res) {
    logger.info(`[CONTROLLER] - GET - /logs/tasks`);
    const realUrl = req.url;
    const { current = 1, pageSize = 10 } = req.query;
    const params = parse(realUrl, true).query as unknown as API.PageParams &
      API.Task & {
        sorter: any;
        filter: any;
      };

    const tasks = await this.ansibleTaskRepository.findAllWithoutParams();
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
  }

  async getTaskEvents(req, res) {
    const { id } = req.params;
    if (!id) {
      throw new NotFoundError('No id');
    }
    const events = await this.ansibleLogsRepository.findByTaskId(id);

    new SuccessResponse('Get task logs successful', events).send(res);
  }

  // Keep other methods for compatibility
  async createTaskLog(taskId: string, event: string, data: Record<string, any>) {
    return this.ansibleLogsRepository.create({
      ident: taskId,
      content: event,
      stdout: JSON.stringify(data),
      logRunnerId: data.host,
    });
  }

  async createTask(taskData: Partial<any>) {
    return this.ansibleTaskRepository.create({
      uuid: taskData.uuid,
      command: taskData.command,
      status: 'running',
      startTime: new Date(),
      metadata: taskData.metadata,
      serverId: taskData.serverId,
      serverGroupId: taskData.serverGroupId,
      playbookPath: taskData.playbookPath,
      inventoryPath: taskData.inventoryPath,
      tags: taskData.tags,
      extraVars: taskData.extraVars,
      userId: taskData.userId,
    });
  }

  async updateTaskStatus(taskId: string, status: string, exitCode?: number) {
    const update: Record<string, any> = {
      status,
    };

    if (status === 'completed' || status === 'failed') {
      update.endTime = new Date();
    }

    if (exitCode !== undefined) {
      update.exitCode = exitCode;
    }

    return this.ansibleTaskRepository.update(taskId, update);
  }

  async deleteTaskAndLogs(taskId: string) {
    await this.ansibleLogsRepository.deleteByTaskId(taskId);
    return this.ansibleTaskRepository.delete(taskId);
  }
}
