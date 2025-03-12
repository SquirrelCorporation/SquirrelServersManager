import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import PlaybooksRegisterComponent from '@modules/playbooks/application/services/components/abstract-playbooks-register-component';
import { IPlaybooksRegister } from '@modules/playbooks/domain/entities/playbooks-register.entity';
import { IPlaybooksRegisterRepository } from '@modules/playbooks/domain/repositories/playbooks-register-repository.interface';
import { PlaybooksRegisterEngineService } from '@modules/playbooks/application/services/engine/playbooks-register-engine.service';
import { InternalError, NotFoundError } from '../../../middlewares/api/ApiError';
import { DIRECTORY_ROOT } from '../constants';

/**
 * Service for managing local playbooks repositories
 */
@Injectable()
export class LocalPlaybooksRegisterService extends PlaybooksRegisterComponent {
  private readonly logger = new Logger(LocalPlaybooksRegisterService.name);

   constructor(uuid: string, logger: any, name: string, rootPath: string) {
    super(uuid, name, rootPath);
    this.childLogger = logger.child(
      { module: `PlaybooksLocalRepository`, moduleId: `${this.uuid}`, moduleName: `${this.name}` },
      { msgPrefix: `[PLAYBOOKS_LOCAL_REPOSITORY] - ` },
    );
  }

  async init(): Promise<void> {
    Shell.FileSystemManager.createDirectory(this.directory);
  }

  async syncFromRepository(): Promise<void> {
    await this.syncToDatabase();
  }
}
