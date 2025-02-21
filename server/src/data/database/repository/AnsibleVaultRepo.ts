import { AnsibleVault, AnsibleVaultModel } from '../model/AnsibleVault';
import { PlaybooksRepositoryModel } from '../model/PlaybooksRepository';

async function findAll() {
  return await AnsibleVaultModel.find().select('-password').lean().exec();
}

async function create(ansibleVault: Partial<AnsibleVault>) {
  return await AnsibleVaultModel.create(ansibleVault);
}

async function deleteOne(ansibleVault: AnsibleVault) {
  await PlaybooksRepositoryModel.updateMany(
    { vaults: ansibleVault._id },
    { $pull: { vaults: ansibleVault._id } },
  );
  // Delete the vault
  await AnsibleVaultModel.deleteOne(ansibleVault);
}

async function findOneById(vaultId: string) {
  return await AnsibleVaultModel.findOne({ vaultId: vaultId }).lean().exec();
}

async function updateOne(ansibleVault: AnsibleVault) {
  return await AnsibleVaultModel.updateOne({ vaultId: ansibleVault.vaultId }, ansibleVault)
    .lean()
    .exec();
}

export default {
  findAll,
  create,
  deleteOne,
  findOneById,
  updateOne,
};
