import { Injectable, Logger } from '@nestjs/common';
import { ShellString } from 'shelljs';
import { IDockerComposeService } from '../../domain/interfaces/docker-compose.interface';
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
  dockerComposeDryRun(command: string): ShellString {
    try {
      this.logger.debug(`dockerComposeDryRun - Starting command: ${command}`);
      return this.shellWrapper.exec(command);
    } catch (error) {
      this.logger.error(`dockerComposeDryRun failed: ${error}`);
      throw new Error(`Docker Compose command failed due to ${error}`);
    }
  }
}
