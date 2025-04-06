import { IShellCommand } from './domain/entities/shell-command.entity';
import { IDockerComposeService } from './domain/interfaces/docker-compose.interface';
import { IFileSystemService } from './domain/interfaces/file-system.interface';
import { IPlaybookFileService } from './domain/interfaces/playbook-file.interface';
import { IShellWrapperService } from './domain/interfaces/shell-wrapper.interface';
import { ISshKeyService } from './domain/interfaces/ssh-key.interface';
import { ShellModule } from './shell.module';

// Re-export the module
export { ShellModule };

// Re-export domain types
export { IShellCommand };

// Define injection tokens
export const SHELL_WRAPPER_SERVICE = 'SHELL_WRAPPER_SERVICE';
export const FILE_SYSTEM_SERVICE = 'FILE_SYSTEM_SERVICE';
export const DOCKER_COMPOSE_SERVICE = 'DOCKER_COMPOSE_SERVICE';
export const PLAYBOOK_FILE_SERVICE = 'PLAYBOOK_FILE_SERVICE';
export const SSH_KEY_SERVICE = 'ISshKeyService';

// Re-export application interfaces
export {
  IFileSystemService,
  IShellWrapperService,
  IDockerComposeService,
  IPlaybookFileService,
  ISshKeyService,
};

// Re-export application services
export { FileSystemService } from './application/services/file-system.service';
export { ShellWrapperService } from './application/services/shell-wrapper.service';
export { DockerComposeService } from './application/services/docker-compose.service';
export { PlaybookFileService } from './application/services/playbook-file.service';
export { SshKeyService } from './application/services/ssh-key.service';
