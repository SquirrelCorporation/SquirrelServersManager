import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SsmContainer } from 'ssm-shared-lib';
import { IProxmoxContainer } from '@modules/containers/domain/entities/proxmox-container.entity';
import {
  IProxmoxContainerRepository,
  PopulatedProxmoxContainer,
} from '../../domain/repositories/proxmox-container.repository.interface';
import {
  PROXMOX_CONTAINER_MODEL_TOKEN,
  ProxmoxContainer,
} from '../schemas/proxmox-container.schema';

@Injectable()
export class ProxmoxContainerRepository implements IProxmoxContainerRepository {
  private readonly logger = new Logger(ProxmoxContainerRepository.name);

  constructor(
    // Use the defined injection token
    @InjectModel(PROXMOX_CONTAINER_MODEL_TOKEN)
    private readonly model: Model<ProxmoxContainer>,
  ) {}

  async findAll(): Promise<PopulatedProxmoxContainer[]> {
    // Use populate with virtual field 'device' instead of manual $lookup
    const results = await this.model
      .find()
      .populate('device') // Populate using the virtual field defined in the schema
      .lean<IProxmoxContainer[]>() // Use lean for performance
      .exec();

    // Add the displayType manually after fetching
    return results.map((container) => ({
      ...container,
      displayType: SsmContainer.ContainerTypes.PROXMOX,
    }));
  }

  async updateOrCreate(container: Partial<IProxmoxContainer>): Promise<IProxmoxContainer> {
    // Ensure deviceUuid is explicitly provided in the input for matching
    if (!container.deviceUuid) {
      this.logger.error('deviceUuid is required for updateOrCreate operation', {
        containerName: container.name,
        watcher: container.watcher,
      });
      throw new Error('deviceUuid is required for updateOrCreate');
    }
    const query = {
      name: container.name,
      watcher: container.watcher,
      deviceUuid: container.deviceUuid, // Use the asserted deviceUuid
    };

    // Create update data, excluding the possibly partial device object
    const updateData = { ...container }; // Just copy the rest
    delete updateData.deviceUuid; // Don't update the deviceUuid itself during upsert based on it
    // Optionally delete other fields if they shouldn't be updated during upsert

    return await this.model
      .findOneAndUpdate(query, updateData, {
        upsert: true,
        new: true,
      })
      .lean()
      .exec();
  }

  async findByUuid(uuid: string): Promise<IProxmoxContainer | null> {
    return await this.model.findOne({ uuid: uuid }).populate('device').lean().exec();
  }

  async findByDeviceUuid(deviceUuid: string): Promise<IProxmoxContainer[]> {
    return await this.model.find({ deviceUuid: deviceUuid }).populate('device').lean().exec();
  }

  async findByWatcher(watcher: string): Promise<IProxmoxContainer[]> {
    return await this.model.find({ watcher: watcher }).populate('device').lean().exec();
  }

  async deleteByUuid(uuid: string): Promise<boolean> {
    const result = await this.model.deleteOne({ uuid: uuid }).exec();
    return result.deletedCount > 0;
  }

  async deleteByDeviceUuid(deviceUuid: string): Promise<number> {
    const result = await this.model.deleteMany({ deviceUuid: deviceUuid }).exec();
    return result.deletedCount;
  }

  async create(containerDto: Partial<IProxmoxContainer>): Promise<IProxmoxContainer> {
    return await this.model.create(containerDto); // Mongoose handles the object creation
  }

  async update(
    uuid: string,
    updates: Partial<IProxmoxContainer>,
  ): Promise<IProxmoxContainer | null> {
    return await this.model.findOneAndUpdate({ uuid: uuid }, updates, { new: true }).lean().exec();
  }

  async countByDeviceUuid(deviceUuid: string): Promise<number> {
    return await this.model.countDocuments({ deviceUuid: deviceUuid }).exec();
  }

  async countByStatus(status: string): Promise<number> {
    return await this.model.countDocuments({ status: status }).exec();
  }

  async countAll(): Promise<number> {
    return await this.model.countDocuments().exec();
  }

  async updateStatusByWatcher(watcher: string, status: string): Promise<number> {
    const result = await this.model.updateMany({ watcher: watcher }, { status: status }).exec();
    return result.modifiedCount; // Return the count of documents modified
  }
}
