import { Injectable, Logger } from '@nestjs/common';
import { ShellWrapperService } from './shell-wrapper.service';

/**
 * DockerComposeService provides methods for executing Docker Compose commands
 * through a NestJS injectable service.
 */
@Injectable()
export class DockerComposeService {
  private readonly logger = new Logger(DockerComposeService.name);

  constructor(private readonly shellWrapper: ShellWrapperService) {}

  /**
   * Executes a docker-compose command in dry-run mode
   * @param command The docker-compose command to execute
   * @returns The result of the command execution
   */
  dockerComposeDryRun(command: string) {
    try {
      this.logger.debug(`dockerComposeDryRun - Starting command: ${command}`);
      return this.shellWrapper.exec(command);
    } catch (error) {
      this.logger.error(`dockerComposeDryRun failed: ${error}`);
      throw new Error(`Docker Compose command failed due to ${error}`);
    }
  }
}
