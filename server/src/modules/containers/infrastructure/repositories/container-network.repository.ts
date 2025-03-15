import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ContainerNetworkRepositoryInterface } from '../../domain/repositories/container-network-repository.interface';
import { ContainerNetworkEntity } from '../../domain/entities/container-network.entity';
import { CONTAINER_NETWORK } from '../schemas/container-network.schema';
import { ContainerNetworkMapper } from '../mappers/container-network.mapper';
import PinoLogger from '../../../../logger';

const logger = PinoLogger.child({ module: 'ContainerNetworkRepository' }, { msgPrefix: '[CONTAINER_NETWORK_REPOSITORY] - ' });

@Injectable()
export class ContainerNetworkRepository implements ContainerNetworkRepositoryInterface {
  constructor(
    @InjectModel(CONTAINER_NETWORK)
    private readonly networkModel: Model<any>,
    private readonly networkMapper: ContainerNetworkMapper,
  ) {}

  async findAll(): Promise<ContainerNetworkEntity[]> {
    const networks = await this.networkModel.find().exec();
    return networks.map(network => this.networkMapper.toEntity(network));
  }

  async findAllByDeviceUuid(deviceUuid: string): Promise<ContainerNetworkEntity[]> {
    const networks = await this.networkModel.find({ deviceUuid }).exec();
    return networks.map(network => this.networkMapper.toEntity(network));
  }

  async findOneByUuid(uuid: string): Promise<ContainerNetworkEntity | null> {
    const network = await this.networkModel.findOne({ uuid }).exec();
    return network ? this.networkMapper.toEntity(network) : null;
  }

  async findOneByNameAndDeviceUuid(name: string, deviceUuid: string): Promise<ContainerNetworkEntity | null> {
    const network = await this.networkModel.findOne({ name, deviceUuid }).exec();
    return network ? this.networkMapper.toEntity(network) : null;
  }

  async save(network: ContainerNetworkEntity): Promise<ContainerNetworkEntity> {
    const document = this.networkMapper.toDocument(network);
    
    if (network.id) {
      await this.networkModel.updateOne(
        { _id: new Types.ObjectId(network.id) },
        { $set: document },
      ).exec();
      return network;
    } else {
      const createdNetwork = await this.networkModel.create(document);
      return this.networkMapper.toEntity(createdNetwork);
    }
  }

  async create(network: ContainerNetworkEntity): Promise<ContainerNetworkEntity> {
    const document = this.networkMapper.toDocument(network);
    const createdNetwork = await this.networkModel.create(document);
    return this.networkMapper.toEntity(createdNetwork);
  }

  async update(uuid: string, networkData: Partial<ContainerNetworkEntity>): Promise<ContainerNetworkEntity> {
    const document = this.networkMapper.toDocument(networkData);
    const updatedNetwork = await this.networkModel.findOneAndUpdate(
      { uuid },
      { $set: document },
      { new: true },
    ).exec();
    
    if (!updatedNetwork) {
      throw new Error(`Network with UUID ${uuid} not found`);
    }
    
    return this.networkMapper.toEntity(updatedNetwork);
  }

  async deleteByUuid(uuid: string): Promise<boolean> {
    const result = await this.networkModel.deleteOne({ uuid }).exec();
    return result.deletedCount > 0;
  }

  async deleteAllByDeviceUuid(deviceUuid: string): Promise<boolean> {
    const result = await this.networkModel.deleteMany({ deviceUuid }).exec();
    return result.deletedCount > 0;
  }
}