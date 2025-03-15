import * as os from 'os';
import { Injectable } from '@nestjs/common';
import { SsmContainer } from 'ssm-shared-lib';
import { ContainerVolumeDocument } from '../schemas/container-volume.schema';
import { Kind } from '../core/Component';
import { WATCHERS } from '../core/conf';
import Docker from '../watchers/providers/docker/Docker';
import { FileSystemService } from '../../shell/services/file-system.service';
import { WatcherEngineService } from './watcher-engine.service';

// Constants for backup paths
const SSM_DATA_PATH = process.env.SSM_DATA_PATH || '/var/lib/ssm';
const FILESYSTEM_BACKUP_PATH = `${SSM_DATA_PATH}/backup/volumes/`;
const BROWSER_BACKUP_PATH = os.tmpdir() + '/';

/**
 * Service for managing container volumes
 */
@Injectable()
export class ContainerVolumesService {
  /**
   * Constructor for ContainerVolumesService
   * @param fileSystemService Injected FileSystemService for file operations
   * @param watcherEngineService Injected WatcherEngineService for accessing watchers
   */
  constructor(
    private readonly fileSystemService: FileSystemService,
    private readonly watcherEngineService: WatcherEngineService
  ) {}

  /**
   * Backup a container volume
   * @param volume The volume to backup
   * @param mode The backup mode (filesystem or browser)
   * @param asyncResult Whether to perform the backup asynchronously
   * @returns The file path and name of the backup
   */
  async backupVolume(
    volume: ContainerVolumeDocument,
    mode: SsmContainer.VolumeBackupMode,
    asyncResult = false,
  ): Promise<{ filePath: string; fileName: string }> {
    const registeredComponent = this.watcherEngineService.getStates().watcher[
      this.watcherEngineService.buildId(Kind.WATCHER, WATCHERS.DOCKER, volume.watcher)
    ] as Docker;

    if (!registeredComponent) {
      throw new Error('Watcher is not registered');
    }

    const filePath =
      mode === SsmContainer.VolumeBackupMode.FILE_SYSTEM
        ? FILESYSTEM_BACKUP_PATH
        : BROWSER_BACKUP_PATH;

    // Ensure the backup directory exists
    if (!this.fileSystemService.test('-d', filePath)) {
      this.fileSystemService.createDirectory(filePath);
    }

    const fileName = `${volume.name}_${Date.now()}.tar`;

    if (asyncResult) {
      void registeredComponent.backupVolume(volume.name, filePath, fileName, true);
    } else {
      await registeredComponent.backupVolume(volume.name, filePath, fileName, false);
    }

    return { filePath, fileName };
  }
}