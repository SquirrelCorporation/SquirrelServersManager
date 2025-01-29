import { parse } from 'url';
import { API, SsmAnsible, SsmStatus } from 'ssm-shared-lib';
import { setToCache } from '../../../data/cache';
import Device from '../../../data/database/model/Device';
import DeviceAuth from '../../../data/database/model/DeviceAuth';
import DeviceAuthRepo from '../../../data/database/repository/DeviceAuthRepo';
import DeviceRepo from '../../../data/database/repository/DeviceRepo';
import { filterByFields, filterByQueryParams } from '../../../helpers/query/FilterHelper';
import { paginate } from '../../../helpers/query/PaginationHelper';
import { sortByFields } from '../../../helpers/query/SorterHelper';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import { DEFAULT_VAULT_ID, vaultEncrypt } from '../../../modules/ansible-vault/ansible-vault';
import WatcherEngine from '../../../modules/containers/core/WatcherEngine';
import DeviceUseCases from '../../../services/DeviceUseCases';

export const addDevice = async (req, res) => {
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
    installMethod,
  } = req.body;
  if (masterNodeUrl) {
    await setToCache(SsmAnsible.DefaultSharedExtraVarsList.MASTER_NODE_URL, masterNodeUrl);
  }
  try {
    const isUnManagedDevice = unManaged === true;
    const createdDevice = await DeviceRepo.create({
      ip: ip,
      status: isUnManagedDevice
        ? SsmStatus.DeviceStatus.UNMANAGED
        : SsmStatus.DeviceStatus.REGISTERING,
      agentType: installMethod,
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
    void WatcherEngine.registerWatcher(createdDevice);
    new SuccessResponse('Add device successful', { device: createdDevice as API.DeviceItem }).send(
      res,
    );
  } catch (error: any) {
    throw new BadRequestError(`Error during device creation: ${error.message}`);
  }
};

export const addDeviceAuto = async (req, res) => {
  const { ip } = req.body;

  const device = await DeviceRepo.findOneByIp(ip);

  if (device) {
    throw new ForbiddenError(
      'The ip already exists, please delete or change your devices before registering this device',
    );
  }

  const createdDevice = await DeviceRepo.create({
    ip: ip,
  } as Device);
  new SuccessResponse('Add device auto successful', { id: createdDevice.uuid }).send(res);
};

export const getDevices = async (req, res) => {
  const realUrl = req.url;
  const { current = 1, pageSize = 10 } = req.query;
  const params = parse(realUrl, true).query as unknown as API.PageParams &
    API.DeviceItem & {
      sorter: any;
      filter: any;
    };
  const devices = await DeviceRepo.findAll();
  if (!devices) {
    new SuccessResponse('Get Devices successful', []).send(res);
    return;
  }

  // Use the separated services
  let dataSource = sortByFields(devices, params);
  dataSource = filterByFields(dataSource, params);
  //TODO: update validator
  dataSource = filterByQueryParams(dataSource, params, ['ip', 'uuid', 'status', 'hostname']);
  const totalBeforePaginate = dataSource?.length || 0;
  // Add pagination
  dataSource = paginate(dataSource, current as number, pageSize as number);

  new SuccessResponse('Get Devices successful', dataSource, {
    total: totalBeforePaginate,
    success: true,
    pageSize,
    current: parseInt(`${params.current}`, 10) || 1,
  }).send(res);
};

export const deleteDevice = async (req, res) => {
  const { uuid } = req.params;
  const device = await DeviceRepo.findOneByUuid(uuid);

  if (!device) {
    throw new NotFoundError(`Device not found (${req.params.uuid})`);
  }
  await DeviceUseCases.deleteDevice(device);
  new SuccessResponse('Delete device successful').send(res);
};

export const getAllDevices = async (req, res) => {
  const devices = await DeviceRepo.findAll();
  if (!devices) {
    new SuccessResponse('Get Devices successful', []).send(res);
    return;
  }

  new SuccessResponse('Get Devices successful', devices).send(res);
};

export const updateAgentInstallMethod = async (req, res) => {
  const { installMethod } = req.body;
  const { uuid } = req.params;

  const device = await DeviceRepo.findOneByUuid(uuid);

  if (!device) {
    throw new NotFoundError(`Device not found (${uuid})`);
  }
  const updateDevice = await DeviceRepo.update({ ...device, agentType: installMethod });
  new SuccessResponse('Update agent install method successful', updateDevice).send(res);
};
