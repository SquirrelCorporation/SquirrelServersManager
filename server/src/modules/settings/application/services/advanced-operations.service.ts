import {
  ANSIBLE_LOGS_SERVICE,
  IAnsibleLogsService,
  IServerLogsService,
  SERVER_LOGS_SERVICE,
} from '@modules/logs';
import { PLAYBOOKS_REGISTER_ENGINE_EVENT } from '@modules/playbooks';
import { IAdvancedOperationsService } from '@modules/settings/doma../../domain/interfaces/advanced-operations-service.interface';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AdvancedOperationsService implements IAdvancedOperationsService {
  private readonly logger = new Logger(AdvancedOperationsService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(SERVER_LOGS_SERVICE)
    private readonly serverLogsService: IServerLogsService,
    @Inject(ANSIBLE_LOGS_SERVICE)
    private readonly ansibleLogsService: IAnsibleLogsService,
    @InjectModel('Playbook') private readonly playbookModel: Model<any>,
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
    // Use the server logs service to delete all logs
    await this.serverLogsService.deleteAll();
  }

  /**
   * Delete all Ansible logs
   */
  async deleteAnsibleLogs(): Promise<void> {
    this.logger.log('Deleting Ansible logs...');
    // Use the ansible logs service to delete all logs
    await this.ansibleLogsService.deleteAll();
  }

  /**
   * Delete playbooks model and resync
   */
  async deletePlaybooksModelAndResync(): Promise<void> {
    this.logger.log('Deleting playbooks model and resyncing...');

    try {
      // Drop the Playbook collection
      await this.playbookModel.db.collection('playbooks').drop();
      this.eventEmitter.emit(PLAYBOOKS_REGISTER_ENGINE_EVENT.SYNC_ALL_REGISTERS, {
        force: true,
      });
      this.logger.log('Playbooks model deleted and resynced successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error deleting playbooks model and resyncing: ${errorMessage}`);
      throw error;
    }
  }
}
