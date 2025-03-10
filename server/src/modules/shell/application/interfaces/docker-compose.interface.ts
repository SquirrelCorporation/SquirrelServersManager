/**
 * Interface for Docker Compose operations in the application layer
 */
export interface IDockerComposeService {
  dockerComposeDryRun(command: string): Promise<string>;
}