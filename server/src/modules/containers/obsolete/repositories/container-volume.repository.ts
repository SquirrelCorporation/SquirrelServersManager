import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CONTAINER_VOLUME, ContainerVolumeDocument } from '../schemas/container-volume.schema';

@Injectable()
export class ContainerVolumeRepository {
  constructor(
    @InjectModel(CONTAINER_VOLUME)
    private readonly containerVolumeModel: Model<ContainerVolumeDocument>,
  ) {}

  async findAll() {
    return this.containerVolumeModel.find().populate({ path: 'device' }).lean().exec();
  }

  async create(volume: Partial<ContainerVolumeDocument>) {
    return this.containerVolumeModel.create(volume);
  }

  async updateOrCreate(volume: Partial<ContainerVolumeDocument>) {
    return this.containerVolumeModel.findOneAndUpdate(
      { name: volume.name, watcher: volume.watcher },
      volume,
      { upsert: true, new: true },
    );
  }

  async findVolumesByWatcher(watcher: string) {
    return this.containerVolumeModel.find({ watcher }).lean().exec();
  }

  async deleteVolumeById(volume: ContainerVolumeDocument) {
    return this.containerVolumeModel.deleteOne({ name: volume.name, watcher: volume.watcher }).exec();
  }

  async deleteByDevice(device: any) {
    return this.containerVolumeModel.deleteMany({ device }).exec();
  }

  async findByUuid(uuid: string) {
    return this.containerVolumeModel.findOne({ uuid }).lean().exec();
  }
}
