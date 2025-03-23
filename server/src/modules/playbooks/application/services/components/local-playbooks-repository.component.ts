import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import PlaybooksRegisterComponent from '@modules/playbooks/application/services/components/abstract-playbooks-register.component';
import { IFileSystemService, IPlaybookFileService } from '@modules/shell';
import { IPlaybookRepository, IPlaybooksRegisterRepository } from '@modules/playbooks';
import { ITreeNodeService } from '@modules/playbooks/domain/interfaces/tree-node-service.interface';

/**
 * Service for managing local playbooks repositories
 */
@Injectable()
export class LocalPlaybooksRegisterComponent extends PlaybooksRegisterComponent {
  private readonly logger = new Logger(LocalPlaybooksRegisterComponent.name);

  constructor(
    fileSystemService: IFileSystemService,
    playbookFileService: IPlaybookFileService,
    playbookRepository: IPlaybookRepository,
    playbooksRegisterRepository: IPlaybooksRegisterRepository,
    private readonly eventEmitter: EventEmitter2,
    treeNodeService: ITreeNodeService,
    uuid: string,
    logger: any,
    name: string,
    rootPath: string,
  ) {
    super(
      fileSystemService,
      playbookFileService,
      playbookRepository,
      playbooksRegisterRepository,
      treeNodeService,
      uuid,
      name,
      rootPath,
    );
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
