import express from 'express';
import passport from 'passport';
import { deleteConf, getConf, postConf, putConf } from '../controllers/rest/ansible/configuration';
import {
  deleteConfValidator,
  postConfValidator,
} from '../controllers/rest/ansible/configuration.validator';
import { getSmartFailure } from '../controllers/rest/ansible/smart-failure';
import { getSmartFailureValidator } from '../controllers/rest/ansible/smart-failure.validator';
import { deleteVault, getVaults, postVault, updateVault } from '../controllers/rest/ansible/vault';
import {
  deleteVaultValidator,
  postVaultValidator,
  updateVaultValidator,
} from '../controllers/rest/ansible/vault.validator';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router
  .route('/config')
  .get(getConf)
  .post(postConfValidator, postConf)
  .put(postConfValidator, putConf)
  .delete(deleteConfValidator, deleteConf);

router.route('/smart-failure').get(getSmartFailureValidator, getSmartFailure);

router.route('/vaults').get(getVaults).post(postVaultValidator, postVault);
router
  .route('/vaults/:vaultId')
  .delete(deleteVaultValidator, deleteVault)
  .post(updateVaultValidator, updateVault);

export default router;
