import fs from 'fs';
import Dockerode from 'dockerode';
import Events from '../../../../../core/events/events';
import ContainerVolume from '../../../../../data/database/model/ContainerVolume';
import ContainerVolumeRepo from '../../../../../data/database/repository/ContainerVolumeRepo';
import DeviceRepo from '../../../../../data/database/repository/DeviceRepo';
import FileSystemManager from '../../../../shell/managers/FileSystemManager';
import DockerNetworks from './AbstractDockerNetworks';

export default class DockerVolumes extends DockerNetworks {
  dockerApi: Dockerode | undefined = undefined;

  public async watchVolumesFromCron() {
    this.childLogger.info('watchDockerVolumesFromCron');
    try {
      const device = await DeviceRepo.findOneByUuid(this.configuration.deviceUuid);
      if (!device) {
        throw new Error(`Device not found: ${this.configuration.deviceUuid}`);
      }
      const rawCurrentVolumes = await this.dockerApi?.listVolumes();

      const currentVolumes = rawCurrentVolumes?.Volumes.map((rawCurrentVolume) => {
        return {
          name: rawCurrentVolume.Name,
          watcher: this.name,
          device: device,
          mountPoint: rawCurrentVolume.Mountpoint,
          scope: rawCurrentVolume.Scope,
          driver: rawCurrentVolume.Driver,
          options: rawCurrentVolume.Options,
          labels: rawCurrentVolume.Labels,
          usageData: rawCurrentVolume.UsageData,
        } as ContainerVolume;
      });
      const volumesInDb = await ContainerVolumeRepo.findVolumesByWatcher(this.name);
      await this.insertOrUpdateVolumes(currentVolumes);
      this.deleteOldVolumes(currentVolumes, volumesInDb);
    } catch (error: any) {
      this.childLogger.error(error);
    }
  }

  private async insertOrUpdateVolumes(currentVolumes: (ContainerVolume | undefined)[] | undefined) {
    if (currentVolumes && currentVolumes.length > 0) {
      await Promise.all(
        currentVolumes.map(async (volume) => {
          if (volume) {
            void ContainerVolumeRepo.updateOrCreate(volume);
          }
        }),
      );
    }
  }

  private deleteOldVolumes(
    newVolumes: (ContainerVolume | undefined)[] | undefined,
    volumesInDb: ContainerVolume[] | null,
  ) {
    const volumesToRemove = this.getOldVolumes(newVolumes, volumesInDb);
    volumesToRemove.forEach((volumeToRemove) => {
      void ContainerVolumeRepo.deleteVolumeById(volumeToRemove);
    });
  }

  private getOldVolumes(
    newVolumes: (ContainerVolume | undefined)[] | undefined,
    volumesInDb: ContainerVolume[] | null,
  ) {
    if (!volumesInDb || !newVolumes) {
      return [];
    }
    return volumesInDb.filter((volumeInDb) => {
      const isStillToWatch = newVolumes.find((newVolume) => newVolume?.name === volumeInDb.name);
      return isStillToWatch === undefined;
    });
  }

  public async backupVolume(
    volumeName: string,
    backupPath: string,
    fileName: string,
    emitEvent: boolean,
  ) {
    try {
      const filePath = `${backupPath}/${fileName}`;
      if (!FileSystemManager.test('-d', backupPath)) {
        FileSystemManager.createDirectory(backupPath);
      }
      this.childLogger.info(`backupVolume - Backup of volume ${volumeName} started`);
      await this.dockerApi?.pull('alpine');
      this.childLogger.info(`backupVolume - Create container`);
      // Create a temporary container which will mount the volume
      const container = await this.dockerApi?.createContainer({
        Image: 'alpine',
        Cmd: ['sh', '-c', 'tar -cvf /backup.tar /backup'],
        HostConfig: {
          Binds: [`${volumeName}:/backup:ro`],
        },
        Labels: { 'wud.watch': 'false' },
      });
      if (!container) {
        throw new Error('Container for backup not created');
      }
      this.childLogger.info(`backupVolume - Start container`);
      // Start the container
      await container.start();

      this.childLogger.info(`backupVolume - Wait for container`);
      // Create a tar stream
      // Wait for the container to finish the tar command
      await container.wait();

      // Copy the tarball from the container
      const tarballStream = await container.getArchive({ path: '/backup.tar' });

      // Write the tarball to the filesystem
      const output = fs.createWriteStream(filePath);
      tarballStream.pipe(output);

      // Listen for the end event to stop and remove the container
      const onTarballStreamEnd = async () => {
        await container
          .stop({ t: 0 })
          .catch((err) => this.childLogger.warn('Container already stopped:', err));
        await container.remove();
        this.childLogger.info(`Backup of volume ${volumeName} has been saved to ${backupPath}`);
      };

      tarballStream.on('end', onTarballStreamEnd);
      tarballStream.on('error', async (err) => {
        this.childLogger.error('Error while streaming volume contents:', err);
        await container
          .stop({ t: 0 })
          .catch((err) => this.childLogger.warn('Container already stopped:', err));
        await container.remove();
      });
      if (emitEvent) {
        this.emit(Events.VOLUME_BACKUP, {
          success: true,
          message: 'Backup success',
          severity: 'info',
          module: 'docker',
        });
      }
      return filePath;
    } catch (err) {
      this.childLogger.error(err);
      if (emitEvent) {
        this.emit(Events.VOLUME_BACKUP, {
          success: false,
          message: 'Backup error',
          severity: 'error',
          module: 'docker',
        });
      }
      throw err;
    }
  }
}
