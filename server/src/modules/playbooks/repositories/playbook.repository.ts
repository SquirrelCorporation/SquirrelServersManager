import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Playbook, PlaybookDocument } from '../schemas/playbook.schema';
import { PlaybooksRepositoryDocument } from '../schemas/playbooks-repository.schema';

@Injectable()
export class PlaybookRepository {
  constructor(
    @InjectModel(Playbook.name) private readonly playbookModel: Model<PlaybookDocument>,
  ) {}

  async create(playbook: Partial<Playbook>): Promise<Playbook> {
    const created = await this.playbookModel.create(playbook);
    return created.toObject();
  }

  async updateOrCreate(playbook: Partial<Playbook>): Promise<Playbook | null> {
    return this.playbookModel.findOneAndUpdate({ path: playbook.path }, playbook, { upsert: true })
      .lean()
      .exec();
  }

  async findAll(): Promise<Playbook[] | null> {
    return this.playbookModel.find().sort({ createdAt: -1 }).lean().exec();
  }

  async findAllWithActiveRepositories(): Promise<Playbook[] | null> {
    return this.playbookModel.find()
      .populate({ path: 'playbooksRepository', match: { enabled: { $eq: true } } })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findOneByName(name: string): Promise<Playbook | null> {
    return this.playbookModel.findOne({ name })
      .populate({ path: 'playbooksRepository', populate: { path: 'vaults' } })
      .lean()
      .exec();
  }

  async findOneByUuid(uuid: string): Promise<Playbook | null> {
    return this.playbookModel.findOne({ uuid })
      .populate({ path: 'playbooksRepository', populate: { path: 'vaults' } })
      .lean()
      .exec();
  }

  async listAllByRepository(
    playbooksRepository: PlaybooksRepositoryDocument,
  ): Promise<Playbook[] | null> {
    return this.playbookModel.find({ playbooksRepository }).lean().exec();
  }

  async deleteByUuid(uuid: string): Promise<void> {
    await this.playbookModel.deleteOne({ uuid }).lean().exec();
  }

  async findOneByPath(path: string): Promise<Playbook | null> {
    return this.playbookModel.findOne({ path })
      .populate({ path: 'playbooksRepository', populate: { path: 'vaults' } })
      .lean()
      .exec();
  }

  async findOneByUniqueQuickReference(quickRef: string): Promise<Playbook | null> {
    return this.playbookModel.findOne({ uniqueQuickRef: quickRef })
      .populate({ path: 'playbooksRepository', populate: { path: 'vaults' } })
      .lean()
      .exec();
  }

  async deleteAllByRepository(playbooksRepository: PlaybooksRepositoryDocument): Promise<void> {
    await this.playbookModel.deleteMany({ playbooksRepository }).exec();
  }
} 