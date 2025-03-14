import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IServerLogsRepository } from '../../../logs/domain/repositories/server-logs-repository.interface';
import { IAnsibleLogsRepository } from '../../../logs/domain/repositories/ansible-logs-repository.interface';

@Injectable()
export class AdvancedOperationsService {
  private readonly logger = new Logger(AdvancedOperationsService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject('SERVER_LOGS_REPOSITORY')
    private readonly serverLogsRepository: IServerLogsRepository,
    @Inject('ANSIBLE_LOGS_REPOSITORY')
    private readonly ansibleLogsRepository: IAnsibleLogsRepository,
    @InjectModel('Playbook') private readonly playbookModel: Model<any>
  ) {}

  /**
   * Restart the server
   */
  async restartServer(): Promise<void> {
    this.logger.log('Restarting server...');
    // Emit an event that can be caught by the main application to restart the server
    this.eventEmitter.emit('server.restart');
  }

  /**
   * Delete all logs
   */
  async deleteLogs(): Promise<void> {
    this.logger.log('Deleting logs...');
    // Use the server logs repository to delete all logs
    await this.serverLogsRepository.deleteAll();
  }

  /**
   * Delete all Ansible logs
   */
  async deleteAnsibleLogs(): Promise<void> {
    this.logger.log('Deleting Ansible logs...');
    // Use the ansible logs repository to delete all logs
    await this.ansibleLogsRepository.deleteAll();
  }

  /**
   * Delete playbooks model and resync
   */
  async deletePlaybooksModelAndResync(): Promise<void> {
    this.logger.log('Deleting playbooks model and resyncing...');

    try {
      // Drop the Playbook collection
      await this.playbookModel.db.collection('playbooks').drop();


      this.logger.log('Playbooks model deleted and resynced successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error deleting playbooks model and resyncing: ${errorMessage}`);
      throw error;
    }
  }
}