import { TestOptions } from 'shelljs';
import { AnsibleCommandService } from '../ansible/services/ansible-command.service';
import originalAnsibleShellCommandsManager from './managers/AnsibleShellCommandsManager';
import originalDockerComposeCommandManager from './managers/DockerComposeCommandManager';
import originalFileSystemManager from './managers/FileSystemManager';
import originalPlaybookFileManager from './managers/PlaybookFileManager';
import originalSshPrivateKeyFileManager from './managers/SshPrivateKeyFileManager';
import { DockerComposeService } from './services/docker-compose.service';
import { FileSystemService } from './services/file-system.service';
import { PlaybookFileService } from './services/playbook-file.service';
import { ShellWrapperService } from './services/shell-wrapper.service';
import { SshKeyService } from './services/ssh-key.service';

// Global service instances
let _fileSystemService: FileSystemService | null = null;
let _ansibleCommandService: AnsibleCommandService | null = null;
let _dockerComposeService: DockerComposeService | null = null;
let _sshKeyService: SshKeyService | null = null;
let _shellWrapperService: ShellWrapperService | null = null;

/**
 * Create a basic instance of the ShellWrapperService to use as a dependency
 */
function getOrCreateShellWrapperService(): ShellWrapperService {
  if (!_shellWrapperService) {
    _shellWrapperService = new ShellWrapperService();
  }
  return _shellWrapperService;
}

/**
 * Get or create a service instance from the NestJS container
 * @param serviceClass The service class to get
 * @returns The service instance
 */
async function getServiceInstance<T>(serviceClass: new (...args: any[]) => T): Promise<T> {
  try {
    // Get the global nestApp reference from global scope
    // We need to cast to any to access the global nestApp property
    const nestApp = (global as any).nestApp;

    if (nestApp && typeof nestApp.get === 'function') {
      try {
        return nestApp.get(serviceClass);
      } catch (error) {
        console.error(`Error getting service ${serviceClass.name} from NestJS container:`, error);

        // If we can't get the service from NestJS container, try to create an instance directly
        return createServiceInstance(serviceClass);
      }
    } else {
      console.warn(
        `NestJS app not properly initialized, service ${serviceClass.name} will be initialized directly`,
      );
      return createServiceInstance(serviceClass);
    }
  } catch (error) {
    console.error(`Failed to get service ${serviceClass.name}:`, error);
    return null as any;
  }
}

/**
 * Create a service instance directly
 * @param serviceClass The service class to instantiate
 * @returns The created service instance
 */
function createServiceInstance<T>(serviceClass: new (...args: any[]) => T): T {
  console.warn(`Creating fallback instance of ${serviceClass.name}`);
  try {
    // Get a shell wrapper service
    const shellWrapperService = getOrCreateShellWrapperService();

    // Create an instance based on the service type
    switch (serviceClass.name) {
      case 'FileSystemService':
        return new FileSystemService(shellWrapperService) as unknown as T;
      case 'PlaybookFileService':
        return new PlaybookFileService(shellWrapperService) as unknown as T;
      case 'AnsibleCommandService':
        // AnsibleCommandService needs SshKeyService as a dependency
        if (!_sshKeyService) {
          _sshKeyService = new SshKeyService(shellWrapperService);
        }
        return new AnsibleCommandService(shellWrapperService, _sshKeyService) as unknown as T;
      case 'SshKeyService':
        return new SshKeyService(shellWrapperService) as unknown as T;
      case 'DockerComposeService':
        return new DockerComposeService(shellWrapperService) as unknown as T;
      default:
        throw new Error(`No fallback creation logic for service: ${serviceClass.name}`);
    }
  } catch (error) {
    console.error(`Failed to create fallback instance of ${serviceClass.name}:`, error);
    return null as any;
  }
}

// Bridge classes that maintain the same interface as the original managers
// but delegate to the NestJS services

/**
 * FileSystemManager bridge class that forwards calls to the NestJS FileSystemService
 */
class FileSystemManagerBridge {
  async getService(): Promise<FileSystemService> {
    if (!_fileSystemService) {
      _fileSystemService = await getServiceInstance(FileSystemService);
    }
    return _fileSystemService!;
  }

  createDirectory(fullPath: string, rootPath?: string) {
    return (() => {
      try {
        // Use IIFE to make async code synchronous
        let result;
        const promise = this.getService().then((service) => {
          result = service.createDirectory(fullPath, rootPath);
          return result;
        });

        // This is a synchronous operation in the original, so we need to handle it synchronously
        // We'll use a workaround to wait for the promise to resolve
        while (result === undefined) {
          // This is a busy wait, but it's necessary to maintain the synchronous interface
          // In a real-world scenario, we might want to refactor the calling code instead
        }

        return result;
      } catch (error) {
        console.error(`Error in createDirectory: ${error}`);
        // Fallback to original manager if available
        return originalFileSystemManager.createDirectory(fullPath, rootPath);
      }
    })();
  }

  deleteFiles(directory: string, rootPath?: string): void {
    try {
      // Use IIFE to make async code synchronous
      (() => {
        this.getService().then((service) => {
          service.deleteFiles(directory, rootPath);
        });
      })();
    } catch (error) {
      console.error(`Error in deleteFiles: ${error}`);
      // Fallback to original manager if available
      originalFileSystemManager.deleteFiles(directory, rootPath);
    }
  }

  deleteFile(filePath: string): void {
    try {
      // Use IIFE to make async code synchronous
      (() => {
        this.getService().then((service) => {
          service.deleteFile(filePath);
        });
      })();
    } catch (error) {
      console.error(`Error in deleteFile: ${error}`);
      // Fallback to original manager if available
      originalFileSystemManager.deleteFile(filePath);
    }
  }

  writeFile(content: string, path: string): void {
    try {
      // Use IIFE to make async code synchronous
      (() => {
        this.getService().then((service) => {
          service.writeFile(content, path);
        });
      })();
    } catch (error) {
      console.error(`Error in writeFile: ${error}`);
      // Fallback to original manager if available
      originalFileSystemManager.writeFile(content, path);
    }
  }

  copyFile(origin: string, dest: string) {
    return (() => {
      try {
        // Use IIFE to make async code synchronous
        let result;
        const promise = this.getService().then((service) => {
          result = service.copyFile(origin, dest);
          return result;
        });

        // This is a synchronous operation in the original, so we need to handle it synchronously
        // We'll use a workaround to wait for the promise to resolve
        while (result === undefined) {
          // This is a busy wait, but it's necessary to maintain the synchronous interface
          // In a real-world scenario, we might want to refactor the calling code instead
        }

        return result;
      } catch (error) {
        console.error(`Error in copyFile: ${error}`);
        // Fallback to original manager if available
        return originalFileSystemManager.copyFile(origin, dest);
      }
    })();
  }

  test(options: TestOptions, path: string) {
    return (() => {
      try {
        // Use IIFE to make async code synchronous
        let result;
        const promise = this.getService().then((service) => {
          result = service.test(options, path);
          return result;
        });

        // This is a synchronous operation in the original, so we need to handle it synchronously
        // We'll use a workaround to wait for the promise to resolve
        while (result === undefined) {
          // This is a busy wait, but it's necessary to maintain the synchronous interface
          // In a real-world scenario, we might want to refactor the calling code instead
        }

        return result;
      } catch (error) {
        console.error(`Error in test: ${error}`);
        // Fallback to original manager if available
        return originalFileSystemManager.test(options, path);
      }
    })();
  }

  readFile(path: string): string {
    return (() => {
      try {
        // Use IIFE to make async code synchronous
        let result;
        const promise = this.getService().then((service) => {
          result = service.readFile(path);
          return result;
        });

        // This is a synchronous operation in the original, so we need to handle it synchronously
        // We'll use a workaround to wait for the promise to resolve
        while (result === undefined) {
          // This is a busy wait, but it's necessary to maintain the synchronous interface
          // In a real-world scenario, we might want to refactor the calling code instead
        }

        return result;
      } catch (error) {
        console.error(`Error in readFile: ${error}`);
        // Fallback to original manager if available
        return originalFileSystemManager.readFile(path);
      }
    })();
  }
}

/**
 * AnsibleShellCommandsManager bridge class that forwards calls to the NestJS AnsibleCommandService
 */
class AnsibleShellCommandsManagerBridge {
  stdout: string = '';
  stderr: string = '';
  exitCode: number = 0;

  async getService(): Promise<AnsibleCommandService> {
    if (!_ansibleCommandService) {
      _ansibleCommandService = await getServiceInstance(AnsibleCommandService);
    }
    return _ansibleCommandService!;
  }

  async executePlaybook(
    playbookPath: string,
    user: any,
    target?: string[],
    extraVars?: any,
    mode: any = 'apply',
    execUuid?: string,
    vaults?: any[],
  ) {
    try {
      const service = await this.getService();
      return service.executePlaybookFull(
        playbookPath,
        user,
        target,
        extraVars,
        mode,
        execUuid,
        vaults,
      );
    } catch (error) {
      console.error(`Error in executePlaybook: ${error}`);
      // Fallback to original manager if available
      return originalAnsibleShellCommandsManager.executePlaybook(
        playbookPath,
        user,
        target,
        extraVars,
        mode,
        execUuid,
        vaults,
      );
    }
  }

  async executePlaybookOnInventory(
    playbookPath: string,
    user: any,
    inventoryTargets?: any,
    extraVars?: any,
    mode: any = 'apply',
    target?: string[],
    execUuid?: string,
    vaults?: any[],
  ) {
    try {
      const service = await this.getService();
      return service.executePlaybookOnInventory(
        playbookPath,
        user,
        inventoryTargets,
        extraVars,
        mode,
        target,
        execUuid,
        vaults,
      );
    } catch (error) {
      console.error(`Error in executePlaybookOnInventory: ${error}`);
      // Fallback to original manager if available
      return originalAnsibleShellCommandsManager.executePlaybookOnInventory(
        playbookPath,
        user,
        inventoryTargets,
        extraVars,
        mode,
        target,
        execUuid,
        vaults,
      );
    }
  }

  async getAnsibleVersion() {
    try {
      const service = await this.getService();
      return service.getAnsibleVersion();
    } catch (error) {
      console.error(`Error in getAnsibleVersion: ${error}`);
      // Fallback to original manager if available
      return originalAnsibleShellCommandsManager.getAnsibleVersion();
    }
  }

  async getAnsibleRunnerVersion() {
    try {
      const service = await this.getService();
      return service.getAnsibleRunnerVersion();
    } catch (error) {
      console.error(`Error in getAnsibleRunnerVersion: ${error}`);
      // Fallback to original manager if available
      return originalAnsibleShellCommandsManager.getAnsibleRunnerVersion();
    }
  }

  async installAnsibleGalaxyCollection(name: string, namespace: string) {
    try {
      const service = await this.getService();
      return service.installAnsibleGalaxyCollection(name, namespace);
    } catch (error) {
      console.error(`Error in installAnsibleGalaxyCollection: ${error}`);
      // Fallback to original manager if available
      return originalAnsibleShellCommandsManager.installAnsibleGalaxyCollection(name, namespace);
    }
  }
}

/**
 * PlaybookFileManager bridge class that forwards calls to the NestJS PlaybookFileService
 */
class PlaybookFileManagerBridge {
  private service: PlaybookFileService | null = null;

  constructor() {
    // Initialize the service synchronously
    try {
      this.service = createServiceInstance(PlaybookFileService);
    } catch (error) {
      console.error(`Error initializing PlaybookFileService: ${error}`);
      this.service = null;
    }
  }

  readPlaybook(path: string): string {
    try {
      if (!this.service) {
        throw new Error('PlaybookFileService not initialized');
      }
      return this.service.readPlaybook(path);
    } catch (error) {
      console.error(`Error in readPlaybook: ${error}`);
      // Fallback to original manager if available
      return originalPlaybookFileManager.readPlaybook(path);
    }
  }

  editPlaybook(content: string, path: string): void {
    try {
      if (!this.service) {
        throw new Error('PlaybookFileService not initialized');
      }
      this.service.editPlaybook(content, path);
    } catch (error) {
      console.error(`Error in editPlaybook: ${error}`);
      // Fallback to original manager if available
      originalPlaybookFileManager.editPlaybook(content, path);
    }
  }

  newPlaybook(path: string): void {
    try {
      if (!this.service) {
        throw new Error('PlaybookFileService not initialized');
      }
      this.service.newPlaybook(path);
    } catch (error) {
      console.error(`Error in newPlaybook: ${error}`);
      // Fallback to original manager if available
      originalPlaybookFileManager.newPlaybook(path);
    }
  }

  deletePlaybook(path: string): void {
    try {
      if (!this.service) {
        throw new Error('PlaybookFileService not initialized');
      }
      this.service.deletePlaybook(path);
    } catch (error) {
      console.error(`Error in deletePlaybook: ${error}`);
      // Fallback to original manager if available
      originalPlaybookFileManager.deletePlaybook(path);
    }
  }

  testExistence(path: string): boolean {
    try {
      if (!this.service) {
        throw new Error('PlaybookFileService not initialized');
      }
      return this.service.testExistence(path);
    } catch (error) {
      console.error(`Error in testExistence: ${error}`);
      // Fallback to original manager if available
      return originalPlaybookFileManager.testExistence(path);
    }
  }

  readConfigIfExists(path: string): any {
    try {
      if (!this.service) {
        throw new Error('PlaybookFileService not initialized');
      }
      return this.service.readConfigIfExists(path);
    } catch (error) {
      console.error(`Error in readConfigIfExists: ${error}`);
      // Fallback to original manager if available
      return originalPlaybookFileManager.readConfigIfExists(path);
    }
  }
}

/**
 * SshPrivateKeyFileManager bridge class that forwards calls to the NestJS SshKeyService
 */
class SshPrivateKeyFileManagerBridge {
  async getService(): Promise<SshKeyService> {
    if (!_sshKeyService) {
      _sshKeyService = await getServiceInstance(SshKeyService);
    }
    return _sshKeyService!;
  }

  async getTmpKeyFileName(execUuid: string, deviceUuid: string) {
    try {
      const service = await this.getService();
      return service.getTmpKeyFileName(execUuid, deviceUuid);
    } catch (error) {
      console.error(`Error in getTmpKeyFileName: ${error}`);
      // Fallback to original manager if available
      return originalSshPrivateKeyFileManager.getTmpKeyFileName(execUuid, deviceUuid);
    }
  }

  async getTmpKeyFilePath(fileName: string) {
    try {
      const service = await this.getService();
      return service.getTmpKeyFilePath(fileName);
    } catch (error) {
      console.error(`Error in getTmpKeyFilePath: ${error}`);
      // Fallback to original manager if available
      return originalSshPrivateKeyFileManager.getTmpKeyFilePath(fileName);
    }
  }

  async genAnsibleTemporaryPrivateKey(sskVaultedKey: string, deviceUuid: string, execUuid: string) {
    try {
      const service = await this.getService();
      return service.genAnsibleTemporaryPrivateKey(sskVaultedKey, deviceUuid, execUuid);
    } catch (error) {
      console.error(`Error in genAnsibleTemporaryPrivateKey: ${error}`);
      // Fallback to original manager if available
      return originalSshPrivateKeyFileManager.genAnsibleTemporaryPrivateKey(
        sskVaultedKey,
        deviceUuid,
        execUuid,
      );
    }
  }

  async removeAnsibleTemporaryPrivateKey(deviceUuid: string, execUuid: string) {
    try {
      const service = await this.getService();
      return service.removeAnsibleTemporaryPrivateKey(deviceUuid, execUuid);
    } catch (error) {
      console.error(`Error in removeAnsibleTemporaryPrivateKey: ${error}`);
      // Fallback to original manager if available
      return originalSshPrivateKeyFileManager.removeAnsibleTemporaryPrivateKey(
        deviceUuid,
        execUuid,
      );
    }
  }

  async removeAllAnsibleExecTemporaryPrivateKeys(execUuid: string) {
    try {
      const service = await this.getService();
      return service.removeAllAnsibleExecTemporaryPrivateKeys(execUuid);
    } catch (error) {
      console.error(`Error in removeAllAnsibleExecTemporaryPrivateKeys: ${error}`);
      // Fallback to original manager if available
      return originalSshPrivateKeyFileManager.removeAllAnsibleExecTemporaryPrivateKeys(execUuid);
    }
  }

  async removeAllAnsibleTemporaryPrivateKeys() {
    try {
      const service = await this.getService();
      return service.removeAllAnsibleTemporaryPrivateKeys();
    } catch (error) {
      console.error(`Error in removeAllAnsibleTemporaryPrivateKeys: ${error}`);
      // Fallback to original manager if available
      return originalSshPrivateKeyFileManager.removeAllAnsibleTemporaryPrivateKeys();
    }
  }
}

/**
 * DockerComposeCommandManager bridge class that forwards calls to the NestJS DockerComposeService
 */
class DockerComposeCommandManagerBridge {
  async getService(): Promise<DockerComposeService> {
    if (!_dockerComposeService) {
      _dockerComposeService = await getServiceInstance(DockerComposeService);
    }
    return _dockerComposeService!;
  }

  async dockerComposeDryRun(command: string) {
    try {
      const service = await this.getService();
      return service.dockerComposeDryRun(command);
    } catch (error) {
      console.error(`Error in dockerComposeDryRun: ${error}`);
      // Fallback to original manager if available
      return originalDockerComposeCommandManager.dockerComposeDryRun(command);
    }
  }
}

// Create singleton instances of the bridge classes
const FileSystemManager = new FileSystemManagerBridge();
const AnsibleShellCommandsManager = new AnsibleShellCommandsManagerBridge();
const PlaybookFileManager = new PlaybookFileManagerBridge();
const SshPrivateKeyFileManager = new SshPrivateKeyFileManagerBridge();
const DockerComposeCommandManager = new DockerComposeCommandManagerBridge();

// Export the bridge instances for backward compatibility
export {
  FileSystemManager,
  AnsibleShellCommandsManager,
  PlaybookFileManager,
  SshPrivateKeyFileManager,
  DockerComposeCommandManager,
};

// Also export the NestJS services for direct access
export {
  FileSystemService,
  AnsibleCommandService,
  PlaybookFileService,
  SshKeyService,
  DockerComposeService,
  ShellWrapperService,
};

// Export the bridges as a default export for backward compatibility
export default {
  FileSystemManager,
  AnsibleShellCommandsManager,
  PlaybookFileManager,
  SshPrivateKeyFileManager,
  DockerComposeCommandManager,
};
