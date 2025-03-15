import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CONTAINER_IMAGE, ContainerImage, ContainerImageDocument } from '../schemas/container-image.schema';

@Injectable()
export class ContainerImageRepository {
  constructor(
    @InjectModel(CONTAINER_IMAGE)
    private readonly containerImageModel: Model<ContainerImageDocument>,
  ) {}

  /**
   * Find all container images
   * @returns All container images with populated device information
   */
  async findAll() {
    return this.containerImageModel.find().populate({ path: 'device' }).lean().exec();
  }

  /**
   * Create a new container image
   * @param image Container image data
   * @returns The created container image
   */
  async create(image: Partial<ContainerImage>) {
    return this.containerImageModel.create(image);
  }

  /**
   * Find container images by watcher
   * @param watcher The watcher name
   * @returns Container images for the specified watcher
   */
  async findImagesByWatcher(watcher: string): Promise<ContainerImage[] | null> {
    return this.containerImageModel.find({ watcher }).lean().exec();
  }

  /**
   * Delete a container image by ID
   * @param id The container image ID
   */
  async deleteImageById(id: string) {
    return this.containerImageModel.deleteOne({ id }).exec();
  }

  /**
   * Delete container images by device
   * @param device The device
   */
  async deleteByDevice(device: any) {
    return this.containerImageModel.deleteMany({ device }).exec();
  }
}