import { VAULT_PWD } from '../../../config';
import AnsibleVaultRepo from '../../../data/database/repository/AnsibleVaultRepo';
import logger from '../../../logger';
import { NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import { DEFAULT_VAULT_ID } from '../../../modules/ansible-vault/ansible-vault';

export const postVault = async (req, res) => {
  const { vaultId, password } = req.body;

  await AnsibleVaultRepo.create({ vaultId, password });
  new SuccessResponse('Vault created').send(res);
};

export const deleteVault = async (req, res) => {
  const { vaultId } = req.params;

  const ansibleVault = await AnsibleVaultRepo.findOneById(vaultId);
  if (!ansibleVault) {
    throw new NotFoundError('Vault not found');
  }
  await AnsibleVaultRepo.deleteOne(ansibleVault);
  new SuccessResponse('Vault deleted').send(res);
};

export const getVaultPwd = async (req, res) => {
  const { vaultId } = req.params;

  if (vaultId !== 'default' && vaultId !== DEFAULT_VAULT_ID) {
    const vault = await AnsibleVaultRepo.findOneById(vaultId);
    if (!vault) {
      throw new NotFoundError('Vault not found');
    }
    logger.info(`Vault password for vault ${vaultId} found ` + vault.password);
    new SuccessResponse('Successfully got vault pwd', { pwd: vault.password }).send(res);
    return;
  }
  new SuccessResponse('Successfully got vault pwd', { pwd: VAULT_PWD }).send(res);
};

export const getVaults = async (req, res) => {
  const ansibleVaults = await AnsibleVaultRepo.findAll();
  new SuccessResponse('Vaults found', ansibleVaults).send(res);
};

export const updateVault = async (req, res) => {
  const { vaultId } = req.params;
  const { password } = req.body;

  const ansibleVault = await AnsibleVaultRepo.findOneById(vaultId);
  if (!ansibleVault) {
    throw new NotFoundError('Vault not found');
  }
  ansibleVault.password = password;
  await AnsibleVaultRepo.updateOne(ansibleVault);
  new SuccessResponse('Vault updated').send(res);
};
