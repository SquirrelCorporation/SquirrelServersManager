import Dockerode from 'dockerode';
import ContainerVolume from '../../../../../data/database/model/ContainerVolume';
import ContainerVolumeRepo from '../../../../../data/database/repository/ContainerVolumeRepo';
import DeviceRepo from '../../../../../data/database/repository/DeviceRepo';
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
}
