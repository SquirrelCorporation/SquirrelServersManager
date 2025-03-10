import { ShellModule } from './shell.module';
import { IShellCommand } from './domain/entities/shell-command.entity';
import { IFileSystemService } from './application/interfaces/file-system.interface';
import { IShellWrapperService } from './application/interfaces/shell-wrapper.interface';
import { IDockerComposeService } from './application/interfaces/docker-compose.interface';
import { IPlaybookFileService } from './application/interfaces/playbook-file.interface';
import { ISshKeyService } from './application/interfaces/ssh-key.interface';

// Re-export the module
export { ShellModule };

// Re-export domain types
export { IShellCommand };

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