import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Playbook, PlaybookDocument } from '../schemas/playbook.schema';
import { IPlaybookRepository } from '../../domain/repositories/playbook-repository.interface';
import { IPlaybook } from '../../domain/entities/playbook.entity';
import { IPlaybooksRegister } from '../..//domain/entities/playbooks-register.entity';
import { PlaybookMapper } from '../mappers/playbook.mapper';

@Injectable()
export class PlaybookRepository implements IPlaybookRepository {
  constructor(
    @InjectModel(Playbook.name) private readonly playbookModel: Model<PlaybookDocument>,
  ) {}

  async create(playbook: Partial<IPlaybook>): Promise<IPlaybook> {
    const created = await this.playbookModel.create(playbook);
    return PlaybookMapper.toDomain(created) as IPlaybook;
  }

  async updateOrCreate(playbook: Partial<IPlaybook>): Promise<IPlaybook> {
    // Create a copy of the playbook object to avoid modifying the original
    const playbookToUpdate = { ...playbook };

    // If playbooksRepository is provided as an object, use its _id
    if (playbookToUpdate.playbooksRepository && typeof playbookToUpdate.playbooksRepository === 'object') {
      playbookToUpdate.playbooksRepository = playbookToUpdate.playbooksRepository._id;
    }

    const updated = await this.playbookModel.findOneAndUpdate(
      { path: playbook.path },
      playbookToUpdate,
      { upsert: true, new: true }
    )
      .lean()
      .exec();

    return PlaybookMapper.toDomain(updated) as IPlaybook;
  }

  async findAll(): Promise<IPlaybook[] | null> {
    const playbooks = await this.playbookModel.find().sort({ createdAt: -1 }).lean().exec();
    return PlaybookMapper.toDomainArray(playbooks);
  }

  async findAllWithActiveRepositories(): Promise<IPlaybook[] | null> {
    const playbooks = await this.playbookModel.find()
      .populate({ path: 'playbooksRepository', match: { enabled: { $eq: true } } })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return PlaybookMapper.toDomainArray(playbooks);
  }

  async findOneByName(name: string): Promise<IPlaybook | null> {
    const playbook = await this.playbookModel.findOne({ name })
      .populate({ path: 'playbooksRepository', populate: { path: 'vaults' } })
      .lean()
      .exec();

    return PlaybookMapper.toDomain(playbook);
  }

  async findOneByUuid(uuid: string): Promise<IPlaybook | null> {
    const playbook = await this.playbookModel.findOne({ uuid })
      .populate({ path: 'playbooksRepository', populate: { path: 'vaults' } })
      .lean()
      .exec();

    return PlaybookMapper.toDomain(playbook);
  }

  async listAllByRepository(
    playbooksRepository: IPlaybooksRegister,
  ): Promise<IPlaybook[] | null> {
    const playbooks = await this.playbookModel.find({
      playbooksRepository: playbooksRepository._id,
    }).lean().exec();
    return PlaybookMapper.toDomainArray(playbooks);
  }

  async deleteByUuid(uuid: string): Promise<void> {
    await this.playbookModel.deleteOne({ uuid }).lean().exec();
  }

  async findOneByPath(path: string): Promise<IPlaybook | null> {
    const playbook = await this.playbookModel.findOne({ path })
      .populate({ path: 'playbooksRepository', populate: { path: 'vaults' } })
      .lean()
      .exec();

    return PlaybookMapper.toDomain(playbook);
  }

  async findOneByUniqueQuickReference(quickRef: string): Promise<IPlaybook | null> {
    const playbook = await this.playbookModel.findOne({ uniqueQuickRef: quickRef })
      .populate({ path: 'playbooksRepository', populate: { path: 'vaults' } })
      .lean()
      .exec();

    return PlaybookMapper.toDomain(playbook);
  }

  async deleteAllByRepository(playbooksRepository: IPlaybooksRegister): Promise<void> {
    await this.playbookModel.deleteMany({ playbooksRepository: playbooksRepository._id }).exec();
  }
}