import { NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import DeviceAuth from '../../../data/database/model/DeviceAuth';
import DeviceAuthRepo from '../../../data/database/repository/DeviceAuthRepo';
import asyncHandler from '../../../middlewares/AsyncHandler';
import InventoryTransformer from '../../../modules/ansible/utils/InventoryTransformer';
import logger from '../../../logger';

export const getInventory = asyncHandler(async (req, res) => {
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
    new SuccessResponse('Get inventory', InventoryTransformer.inventoryBuilder(devicesAuth)).send(
      res,
    );
  } else {
    throw new NotFoundError('No devices auth found');
  }
});
