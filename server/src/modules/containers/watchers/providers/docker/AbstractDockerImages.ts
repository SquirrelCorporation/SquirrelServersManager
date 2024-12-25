import Dockerode from 'dockerode';
import ContainerImage from '../../../../../data/database/model/ContainerImage';
import ContainerImageRepo from '../../../../../data/database/repository/ContainerImageRepo';
import DeviceRepo from '../../../../../data/database/repository/DeviceRepo';
import DockerVolumes from './AbstractDockerVolumes';

export default class DockerImages extends DockerVolumes {
  dockerApi: Dockerode | undefined = undefined;

  public async watchImagesFromCron() {
    this.childLogger.info(
      `watchImagesFromCron - (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
    );
    try {
      const device = await DeviceRepo.findOneByUuid(this.configuration.deviceUuid);
      if (!device) {
        throw new Error(
          `DeviceID not found: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host}`,
        );
      }
      const rawCurrentImages = await this.dockerApi?.listImages();

      const currentImages = rawCurrentImages?.map((rawCurrentImage) => {
        return {
          id: rawCurrentImage.Id,
          watcher: this.name,
          parentId: rawCurrentImage.ParentId,
          repoTags: rawCurrentImage.RepoTags,
          repoDigests: rawCurrentImage.RepoDigests,
          created: rawCurrentImage.Created,
          size: rawCurrentImage.Size,
          virtualSize: rawCurrentImage.VirtualSize,
          sharedSize: rawCurrentImage.SharedSize,
          device: device,
          labels: rawCurrentImage.Labels,
        } as ContainerImage;
      });
      const imagesInDb = await ContainerImageRepo.findImagesByWatcher(this.name);
      await this.insertNewImages(currentImages, imagesInDb);
      this.deleteOldImages(currentImages, imagesInDb);
    } catch (error: any) {
      this.childLogger.error(error);
    }
  }

  private async insertNewImages(
    currentImages: (ContainerImage | undefined)[] | undefined,
    imagesInDb: ContainerImage[] | null,
  ) {
    const imagesToInsert = currentImages?.filter((image) => {
      return imagesInDb?.find((e) => e.id === image?.id) === undefined;
    });
    if (imagesToInsert) {
      this.childLogger.info(
        `insertNewImage - got ${imagesToInsert?.length} images to insert (deviceID: ${this.configuration.deviceUuid}, deviceIP: ${this.configuration.host})`,
      );
      await Promise.all(
        imagesToInsert.map(async (image) => {
          if (image) {
            void ContainerImageRepo.create(image);
          }
        }),
      );
    }
  }

  private deleteOldImages(
    newImages: (ContainerImage | undefined)[] | undefined,
    imagesInDb: ContainerImage[] | null,
  ) {
    const imagesToRemove = this.getOldImages(newImages, imagesInDb);
    imagesToRemove.forEach((imageToRemove) => {
      void ContainerImageRepo.deleteImageById(imageToRemove.id);
    });
  }

  private getOldImages(
    newImages: (ContainerImage | undefined)[] | undefined,
    imagesInDb: ContainerImage[] | null,
  ) {
    if (!imagesInDb || !newImages) {
      return [];
    }
    return imagesInDb.filter((imageInDb) => {
      const isStillToWatch = newImages.find((newImage) => newImage?.id === imageInDb.id);
      return isStillToWatch === undefined;
    });
  }
}
