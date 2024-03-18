import express from 'express';
import DeviceAuth from '../../database/model/DeviceAuth';
import DeviceAuthRepo from '../../database/repository/DeviceAuthRepo';
import logger from '../../logger';
import InventoryTransformer from '../../integrations/ansible/transformers/InventoryTransformer';

const router = express.Router();

router.get(`/inventory`, async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /ansible/inventory`);
  let devicesAuth: DeviceAuth[] | null = [];
  if (req.body.target) {
    logger.info(`[CONTROLLER][ANSIBLE[Inventory] - Target is ${req.body.target}`);
    devicesAuth = await DeviceAuthRepo.findOneByDeviceUuid(req.body.target);
  } else {
    logger.info(`[CONTROLLER][ANSIBLE][Inventory] - No target, get all`);
    devicesAuth = await DeviceAuthRepo.findAllPop();
  }
  if (devicesAuth) {
    res.send({
      success: true,
      data: InventoryTransformer.inventoryBuilder(devicesAuth),
    });
  } else {
    res.send({
      success: false,
      message: 'No devices auth found',
    });
  }
});

export default router;
