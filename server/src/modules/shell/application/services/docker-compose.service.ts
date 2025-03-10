import { Injectable, Logger } from '@nestjs/common';
import { IDockerComposeService } from '../interfaces/docker-compose.interface';
import { ShellWrapperService } from './shell-wrapper.service';

/**
 * DockerComposeService provides methods for executing Docker Compose commands
 * through a NestJS injectable service.
 * It implements the IDockerComposeService interface.
 */
@Injectable()
export class DockerComposeService implements IDockerComposeService {
  private readonly logger = new Logger(DockerComposeService.name);

  constructor(private readonly shellWrapper: ShellWrapperService) {}

  /**
   * Executes a docker-compose command in dry-run mode
   * @param command The docker-compose command to execute
   * @returns The result of the command execution
   */
  async dockerComposeDryRun(command: string): Promise<string> {
    try {
      this.logger.debug(`dockerComposeDryRun - Starting command: ${command}`);
      const result = this.shellWrapper.exec(command);
      return result.stdout;
    } catch (error) {
      this.logger.error(`dockerComposeDryRun failed: ${error}`);
      throw new Error(`Docker Compose command failed due to ${error}`);
    }
  }
}
