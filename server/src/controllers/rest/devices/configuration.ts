import { API } from 'ssm-shared-lib';
import DeviceRepo from '../../../data/database/repository/DeviceRepo';
import { NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import DeviceUseCases from '../../../services/DeviceUseCases';

export const postDeviceSystemInformationConfiguration = async (req, res) => {
  const {
    systemInformationConfiguration,
  }: { systemInformationConfiguration: Partial<API.SystemInformationConfiguration> } = req.body;
  const { uuid } = req.params;
  const device = await DeviceRepo.findOneByUuid(uuid);
  if (!device) {
    throw new NotFoundError(`Device not found (${uuid})`);
  }
  const updateDevice = await DeviceRepo.update({
    ...device,
    configuration: {
      ...device.configuration,
      systemInformation: {
        ...device.configuration.systemInformation,
        ...systemInformationConfiguration,
      },
    },
  });
  new SuccessResponse(
    'Device system information configuration successfully updated',
    updateDevice,
  ).send(res);
};

export const postDeviceProxmoxConfiguration = async (req, res) => {
  const { proxmoxConfiguration }: { proxmoxConfiguration: API.ProxmoxConfiguration } = req.body;
  const { uuid } = req.params;
  const device = await DeviceRepo.findOneByUuid(uuid);
  if (!device) {
    throw new NotFoundError(`Device not found (${uuid})`);
  }
  const updateDevice = await DeviceRepo.update({
    ...device,
    configuration: {
      ...device.configuration,
      containers: { ...device.configuration.containers, proxmox: proxmoxConfiguration },
    },
  });
  new SuccessResponse('Device proxmox configuration successfully updated', updateDevice).send(res);
};

export const updateDockerWatcher = async (req, res) => {
  const {
    dockerWatcher,
    dockerWatcherCron,
    dockerStatsWatcher,
    dockerStatsCron,
    dockerEventsWatcher,
  } = req.body;
  const device = await DeviceRepo.findOneByUuid(req.params.uuid);

  if (!device) {
    throw new NotFoundError(`Device not found (${req.params.uuid})`);
  }
  await DeviceUseCases.updateDockerWatcher(
    device,
    dockerWatcher,
    dockerWatcherCron,
    dockerStatsWatcher,
    dockerStatsCron,
    dockerEventsWatcher,
  );
  new SuccessResponse('Update docker watcher flag successful', {
    dockerWatcher: dockerWatcher,
    dockerWatcherCron: dockerWatcherCron,
    dockerStatsWatcher: dockerStatsWatcher,
    dockerEventsWatcher: dockerEventsWatcher,
    dockerStatsCron: dockerStatsCron,
  }).send(res);
};
