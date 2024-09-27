import shell from 'shelljs';
import logger from '../../../logger';
import { AbstractShellCommander } from '../AbstractShellCommander';

class DockerComposeCommandManager extends AbstractShellCommander {
  constructor() {
    super(logger.child({ module: 'DockerComposeCommandManager' }), 'DockerCompose');
  }

  dockerComposeDryRun(command: string) {
    return shell.exec(command);
  }
}

export default new DockerComposeCommandManager();
