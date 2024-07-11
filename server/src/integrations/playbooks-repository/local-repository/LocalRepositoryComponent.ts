import PlaybooksRepositoryComponent, { AbstractComponent } from '../PlaybooksRepositoryComponent';
import Shell from '../../shell';

class LocalRepositoryComponent extends PlaybooksRepositoryComponent implements AbstractComponent {
  constructor(uuid: string, logger: any, name: string, rootPath: string) {
    super(uuid, name, rootPath);
    this.childLogger = logger.child(
      { module: `local-repository/${this.name}` },
      { msgPrefix: `[LOCAL_REPOSITORY] - ` },
    );
  }

  async init(): Promise<void> {
    Shell.FileSystemManager.createDirectory(this.directory);
  }

  async syncFromRepository(): Promise<void> {
    await this.syncToDatabase();
  }
}

export default LocalRepositoryComponent;
