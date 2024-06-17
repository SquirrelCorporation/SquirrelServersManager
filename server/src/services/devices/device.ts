import { parse } from 'url';
import { SsmStatus, SettingsKeys } from 'ssm-shared-lib';
import { API } from 'ssm-shared-lib';
import { BadRequestError, NotFoundError } from '../../core/api/ApiError';
import { SuccessResponse } from '../../core/api/ApiResponse';
import Device from '../../data/database/model/Device';
import DeviceAuth from '../../data/database/model/DeviceAuth';
import DeviceAuthRepo from '../../data/database/repository/DeviceAuthRepo';
import DeviceRepo from '../../data/database/repository/DeviceRepo';
import { setToCache } from '../../data/cache';
import asyncHandler from '../../helpers/AsyncHandler';
import { filterByFields, filterByQueryParams } from '../../helpers/FilterHelper';
import { paginate } from '../../helpers/PaginationHelper';
import { sortByFields } from '../../helpers/SorterHelper';
import { DEFAULT_VAULT_ID, vaultEncrypt } from '../../integrations/ansible-vault/vault';
import Shell from '../../integrations/shell';
import logger from '../../logger';
import DeviceUseCases from '../../use-cases/DeviceUseCases';

export const addDevice = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - PUT - /devices/`);
  const {
    masterNodeUrl,
    ip,
    authType,
    sshKey,
    sshUser,
    sshPwd,
    sshPort,
    unManaged,
    becomeMethod,
    becomePass,
    sshKeyPass,
  } = req.body;
  if (masterNodeUrl) {
    await setToCache(SettingsKeys.AnsibleReservedExtraVarsKeys.MASTER_NODE_URL, masterNodeUrl);
  }
  try {
    const isUnManagedDevice = unManaged === true;
    const createdDevice = await DeviceRepo.create({
      ip: ip,
      status: isUnManagedDevice
        ? SsmStatus.DeviceStatus.UNMANAGED
        : SsmStatus.DeviceStatus.REGISTERING,
    } as Device);
    await DeviceAuthRepo.updateOrCreateIfNotExist({
      device: createdDevice,
      authType: authType,
      sshUser: sshUser,
      sshPwd: sshPwd ? await vaultEncrypt(sshPwd, DEFAULT_VAULT_ID) : undefined,
      sshPort: sshPort,
      sshKey: sshKey ? await vaultEncrypt(sshKey, DEFAULT_VAULT_ID) : undefined,
      sshKeyPass: sshKeyPass ? await vaultEncrypt(sshKeyPass, DEFAULT_VAULT_ID) : undefined,
      becomeMethod: becomeMethod,
      becomePass: becomePass ? await vaultEncrypt(becomePass, DEFAULT_VAULT_ID) : undefined,
    } as DeviceAuth);
    if (sshKey) {
      await Shell.saveSshKey(sshKey, createdDevice.uuid);
    }
    logger.info(`[CONTROLLER] Device - Created device with uuid: ${createdDevice.uuid}`);
    new SuccessResponse('Add device successful', { device: createdDevice as API.DeviceItem }).send(
      res,
    );
  } catch (error) {
    logger.error(error);
    throw new BadRequestError('The ip likely already exists');
  }
});

export const addDeviceAuto = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - POST - /devices/`);
  const { ip } = req.body;

  const device = await DeviceRepo.findOneByIp(ip);

  if (device) {
    logger.error('[CONTROLLER] Device - Is called ip already existing');
    res.status(403).send({
      success: false,
      message:
        'The ip already exists, please delete or change your devices before registering this device',
    });
    return;
  }

  const createdDevice = await DeviceRepo.create({
    ip: ip,
  } as Device);
  logger.info(`[CONTROLLER] Device - Created device with uuid: ${createdDevice.uuid}`);
  new SuccessResponse('Add device auto successful', { id: createdDevice.uuid }).send(res);
});

export const getDevices = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /devices/`);
  const realUrl = req.url;
  const { current = 1, pageSize = 10 } = req.query;
  const params = parse(realUrl, true).query as unknown as API.PageParams &
    API.DeviceItem & {
      sorter: any;
      filter: any;
    };
  const devices = await DeviceRepo.findAll();
  if (!devices) {
    return new SuccessResponse('Get Devices successful', []).send(res);
  }
  // Add pagination
  let dataSource = paginate(devices, current as number, pageSize as number);
  // Use the separated services
  dataSource = sortByFields(dataSource, params);
  dataSource = filterByFields(dataSource, params);
  //TODO: update validator
  dataSource = filterByQueryParams(dataSource, params, ['ip', 'uuid', 'status', 'hostname']);

  new SuccessResponse('Get Devices successful', dataSource, {
    total: devices.length,
    success: true,
    pageSize,
    current: parseInt(`${params.current}`, 10) || 1,
  }).send(res);
});

export const deleteDevice = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - DELETE - /devices/${req.params.uuid}`);

  const device = await DeviceRepo.findOneByUuid(req.params.uuid);

  if (!device) {
    logger.error('[CONTROLLER] Device not found');
    throw new NotFoundError(`Device not found (${req.params.uuid})`);
  }
  await DeviceUseCases.deleteDevice(device);
  new SuccessResponse('Delete device successful').send(res);
});

//TODO validation
export const updateDockerWatcher = asyncHandler(async (req, res) => {
  logger.info(`[CONTROLLER] - POST - /devices/${req.params.uuid}/docker-watcher`);
  const {
    dockerWatcher,
    dockerWatcherCron,
    dockerStatsWatcher,
    dockerStatsCron,
    dockerEventsWatcher,
  } = req.body;
  const device = await DeviceRepo.findOneByUuid(req.params.uuid);

  if (!device) {
    logger.error('[CONTROLLER] Device not found');
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
});
