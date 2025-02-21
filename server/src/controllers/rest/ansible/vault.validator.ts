import { body, param } from 'express-validator';
import validator from '../../../middlewares/Validator';
import { DEFAULT_VAULT_ID } from '../../../modules/ansible-vault/ansible-vault';

export const postVaultValidator = [
  body('vaultId')
    .exists()
    .notEmpty()
    .isString()
    .not()
    .equals(DEFAULT_VAULT_ID)
    .withMessage('VaultId must be different than "ssm"'),
  body('password').exists().notEmpty().isString(),
  validator,
];

export const deleteVaultValidator = [param('vaultId').exists().notEmpty().isString(), validator];

export const updateVaultValidator = [
  param('vaultId').exists().notEmpty().isString(),
  body('vaultId').exists().notEmpty().isString(),
  body('password').exists().notEmpty().isString(),
  validator,
];
