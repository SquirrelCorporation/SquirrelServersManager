import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import PlaybooksRegisterComponent from '@modules/playbooks/application/services/components/abstract-playbooks-register.component';
import { FileSystemService, PlaybookFileService } from '@modules/shell';
import { PlaybookRepository } from '@modules/playbooks/infrastructure/repositories/playbook.repository';
import { PlaybooksRegisterRepository } from '@modules/playbooks/infrastructure/repositories/playbooks-register.repository';

/**
 * Service for managing local playbooks repositories
 */
@Injectable()
export class LocalPlaybooksRegisterComponent extends PlaybooksRegisterComponent {
  private readonly logger = new Logger(LocalPlaybooksRegisterComponent.name);

  constructor(
    fileSystemService: FileSystemService,
    playbookFileService: PlaybookFileService,
    playbookRepository: PlaybookRepository,
    playbooksRegisterRepository: PlaybooksRegisterRepository,
    private readonly eventEmitter: EventEmitter2,
    uuid: string,
    logger: any,
    name: string,
    rootPath: string
  ) {
    super(fileSystemService, playbookFileService, playbookRepository, playbooksRegisterRepository, uuid, name, rootPath);
    this.childLogger = logger.child(
      { module: `PlaybooksLocalRepository`, moduleId: `${this.uuid}`, moduleName: `${this.name}` },
      { msgPrefix: `[PLAYBOOKS_LOCAL_REPOSITORY] - ` },
    );
  }

  async init(): Promise<void> {
    this.fileSystemService.createDirectory(this.directory);
  }

  async syncFromRepository(): Promise<void> {
    await this.syncToDatabase();
  }
}
