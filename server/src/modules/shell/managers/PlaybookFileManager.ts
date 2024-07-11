import logger from '../../../logger';
import shellWrapper from '../ShellWrapper';
import { AbstractShellCommander } from '../AbstractShellCommander';

class PlaybookFileManager extends AbstractShellCommander {
  constructor() {
    super(logger.child({ module: 'PlaybookFileManager' }), 'Playbook');
  }

  readPlaybook(path: string): string {
    return this.executeCommand(shellWrapper.cat, path).toString();
  }

  editPlaybook(content: string, path: string): void {
    this.executeCommand(shellWrapper.to, content, path);
  }

  newPlaybook(path: string): void {
    this.executeCommand(shellWrapper.touch, path);
  }

  deletePlaybook(path: string): void {
    this.executeCommand(shellWrapper.rm, path);
  }

  testExistence(path: string): boolean {
    return this.executeCommand(shellWrapper.test.bind(null, '-f'), path);
  }

  readConfigIfExists(path: string): any {
    this.logger.info('readPlaybookConfiguration - Starting...');
    if (!this.testExistence(path)) {
      this.logger.info('readPlaybookConfiguration - Not found');
      return undefined;
    }

    const config = this.executeCommand(shellWrapper.cat, path).toString();
    this.logger.info('readPlaybookConfiguration - Configuration:', { config });
    return config;
  }
}

export default new PlaybookFileManager();
