import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Model as MongooseModel } from 'mongoose';
import { IAnsibleVaultRepository } from '../../domain/repositories/ansible-vault-repository.interface';
import { IAnsibleVault } from '../../domain/entities/ansible-vault.entity';
import { ANSIBLE_VAULT, AnsibleVaultDocument } from '../schemas/ansible-vault.schema';
import { AnsibleVaultRepositoryMapper } from '../mappers/ansible-vault-repository.mapper';
import { PlaybooksRegister } from '../../../playbooks/infrastructure/schemas/playbooks-register.schema';
import PinoLogger from '../../../../logger';

const logger = PinoLogger.child({ module: 'AnsibleVaultRepository' });

@Injectable()
export class AnsibleVaultRepository implements IAnsibleVaultRepository {
  constructor(
    @InjectModel(ANSIBLE_VAULT) private ansibleVaultModel: Model<AnsibleVaultDocument>,
    private readonly mapper: AnsibleVaultRepositoryMapper,
    @InjectModel(PlaybooksRegister.name) private readonly playbooksRepositoryModel: MongooseModel<any>
  ) {}

  async findAll(): Promise<IAnsibleVault[] | null> {
    logger.info('Finding all ansible vaults');
    const vaults = await this.ansibleVaultModel.find().select('-password').lean().exec();
    return this.mapper.toDomainList(vaults);
  }

  async create(ansibleVault: Partial<IAnsibleVault>): Promise<IAnsibleVault> {
    logger.info(`Creating ansible vault with ID: ${ansibleVault.vaultId}`);
    const createdVault = await this.ansibleVaultModel.create(ansibleVault);
    return this.mapper.toDomain(createdVault.toObject())!;
  }

  async deleteOne(ansibleVault: IAnsibleVault): Promise<void> {
    logger.info(`Deleting ansible vault with ID: ${ansibleVault.vaultId}`);

    // Remove the vault reference from any repositories that use it
    await this.playbooksRepositoryModel.updateMany(
      { vaults: ansibleVault._id },
      { $pull: { vaults: ansibleVault._id } }
    );

    // Delete the vault
    await this.ansibleVaultModel.deleteOne({ vaultId: ansibleVault.vaultId });
  }

  async findOneByVaultId(vaultId: string): Promise<IAnsibleVault | null> {
    logger.info(`Finding ansible vault with ID: ${vaultId}`);
    const vault = await this.ansibleVaultModel.findOne({ vaultId }).lean().exec();
    return this.mapper.toDomain(vault);
  }

  async updateOne(ansibleVault: IAnsibleVault): Promise<IAnsibleVault | null> {
    logger.info(`Updating ansible vault with ID: ${ansibleVault.vaultId}`);
    const updated = await this.ansibleVaultModel.findOneAndUpdate(
      { vaultId: ansibleVault.vaultId },
      ansibleVault,
      { new: true }
    ).lean().exec();

    return this.mapper.toDomain(updated);
  }
}