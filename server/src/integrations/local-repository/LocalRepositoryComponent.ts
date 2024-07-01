import PlaybooksRepositoryComponent, {
  AbstractComponent,
} from '../playbooks-repository/PlaybooksRepositoryComponent';
import { createDirectoryWithFullPath } from '../shell/utils';

class LocalRepositoryComponent extends PlaybooksRepositoryComponent implements AbstractComponent {
  constructor(uuid: string, logger: any, name: string, rootPath: string) {
    super(uuid, name, rootPath);
    this.childLogger = logger.child(
      { module: `local-repository/${this.name}` },
      { msgPrefix: `[LOCAL_REPOSITORY] - ` },
    );
  }

  async init(): Promise<void> {
    await createDirectoryWithFullPath(this.directory);
  }

  async syncFromRepository(): Promise<void> {
    await this.syncToDatabase();
  }
}

export default LocalRepositoryComponent;
