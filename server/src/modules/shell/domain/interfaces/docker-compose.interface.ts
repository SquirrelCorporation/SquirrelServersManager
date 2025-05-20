import { ShellString } from 'shelljs';

/**
 * Interface for Docker Compose operations in the application layer
 */
export interface IDockerComposeService {
  dockerComposeDryRun(command: string): ShellString;
}
