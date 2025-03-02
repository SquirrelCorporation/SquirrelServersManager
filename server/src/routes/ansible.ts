import express from 'express';
import passport from 'passport';
// import { getSmartFailure } from '../controllers/rest/ansible/smart-failure';
// import { getSmartFailureValidator } from '../controllers/rest/ansible/smart-failure.validator';
import { deleteVault, getVaults, postVault, updateVault } from '../controllers/rest/ansible/vault';
import {
  deleteVaultValidator,
  postVaultValidator,
  updateVaultValidator,
} from '../controllers/rest/ansible/vault.validator';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

// The config routes are now handled by the NestJS AnsibleConfigController
// router
//   .route('/config')
//   .get(getConf)
//   .post(postConfValidator, postConf)
//   .put(postConfValidator, putConf)
//   .delete(deleteConfValidator, deleteConf);

// The smart-failure route is now handled by the NestJS SmartFailureController
// router.route('/smart-failure').get(getSmartFailureValidator, getSmartFailure);

router.route('/vaults').get(getVaults).post(postVaultValidator, postVault);
router
  .route('/vaults/:vaultId')
  .delete(deleteVaultValidator, deleteVault)
  .post(updateVaultValidator, updateVault);

export default router;
