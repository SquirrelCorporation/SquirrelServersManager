import PlaybooksRepositoryComponent, { AbstractComponent } from '../PlaybooksRepositoryComponent';
import Shell from '../../shell';

class LocalPlaybooksRepositoryComponent
  extends PlaybooksRepositoryComponent
  implements AbstractComponent
{
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

export default LocalPlaybooksRepositoryComponent;
