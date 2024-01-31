import express from 'express';
import DeviceAuth, { DeviceAuthModel } from '../../database/model/DeviceAuth';
import DeviceAuthRepo from '../../database/repository/DeviceAuthRepo';
import DeviceRepo from '../../database/repository/DeviceRepo';
import logger from '../../logger';
import Inventory from '../../transformers/Inventory';

const router = express.Router();

router.get(`/inventory`, async (req, res) => {
  logger.info(`[CONTROLLER][ANSIBLE][Inventory] Get`);
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
      data: Inventory.inventoryBuilder(devicesAuth),
    });
  } else {
    res.send({
      success: false,
    });
  }
});

export default router;
