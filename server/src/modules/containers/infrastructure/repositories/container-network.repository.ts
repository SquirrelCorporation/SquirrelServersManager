import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ContainerNetworkRepositoryInterface } from '../../domain/repositories/container-network-repository.interface';
import { ContainerNetworkEntity } from '../../domain/entities/container-network.entity';
import { CONTAINER_NETWORK_SCHEMA } from '../schemas/container-network.schema';
import { ContainerNetworkMapper } from '../mappers/container-network.mapper';


@Injectable()
export class ContainerNetworkRepository implements ContainerNetworkRepositoryInterface {
  constructor(
    @InjectModel(CONTAINER_NETWORK_SCHEMA)
    private readonly networkModel: Model<any>,
    private readonly networkMapper: ContainerNetworkMapper,
  ) {}

  async findAll(): Promise<ContainerNetworkEntity[]> {
    const networks = await this.networkModel.find().populate('device').lean().exec();
    return networks.map(network => this.networkMapper.toEntity(network));
  }

  async findAllByDeviceUuid(deviceUuid: string): Promise<ContainerNetworkEntity[]> {
    const networks = await this.networkModel.find({ deviceUuid }).populate('device').lean().exec();
    return networks.map(network => this.networkMapper.toEntity(network));
  }

  async findOneById(uuid: string): Promise<ContainerNetworkEntity | null> {
    const network = await this.networkModel.findOne({ uuid }).populate('device').lean().exec();
    return network ? this.networkMapper.toEntity(network) : null;
  }

  async findOneByNameAndDeviceUuid(name: string, deviceUuid: string): Promise<ContainerNetworkEntity | null> {
    const network = await this.networkModel.findOne({ name, deviceUuid }).populate('device').lean().exec();
    return network ? this.networkMapper.toEntity(network) : null;
  }

  async save(network: ContainerNetworkEntity): Promise<ContainerNetworkEntity> {
    const document = this.networkMapper.toDocument(network);

    if (network.id) {
      await this.networkModel.updateOne(
        { id: new Types.ObjectId(network.id) },
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

  async update(id: string, networkData: Partial<ContainerNetworkEntity>): Promise<ContainerNetworkEntity> {
    const document = this.networkMapper.toDocument(networkData);
    const updatedNetwork = await this.networkModel.findOneAndUpdate(
      { id },
      { $set: document },
      { new: true },
    ).exec();

    if (!updatedNetwork) {
      throw new Error(`Network with id ${id} not found`);
    }

    return this.networkMapper.toEntity(updatedNetwork);
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.networkModel.deleteOne({ id }).exec();
    return result.deletedCount > 0;
  }

  async deleteAllByDeviceUuid(deviceUuid: string): Promise<boolean> {
    const result = await this.networkModel.deleteMany({ deviceUuid }).populate('device').lean().exec();
    return result.deletedCount > 0;
  }
}