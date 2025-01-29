import { API, SsmAnsible, SsmStatus } from 'ssm-shared-lib';
import DeviceRepo from '../../../data/database/repository/DeviceRepo';
import { NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import WatcherEngine from '../../../modules/containers/core/WatcherEngine';

export const postDeviceCapabilities = async (req, res) => {
  const { capabilities }: { capabilities: API.DeviceCapabilities } = req.body;
  const { uuid } = req.params;
  const device = await DeviceRepo.findOneByUuid(uuid);

  if (!device) {
    throw new NotFoundError(`Device not found (${uuid})`);
  }
  const updateDevice = await DeviceRepo.update({ ...device, capabilities });
  void WatcherEngine.deregisterWatchers();
  void WatcherEngine.registerWatchers();
  new SuccessResponse('Device capabilities successfully updated', updateDevice).send(res);
};
