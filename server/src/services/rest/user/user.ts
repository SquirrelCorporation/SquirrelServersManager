import { API, SettingsKeys } from 'ssm-shared-lib';
import InAppNotificationRepo from '../../../data/database/repository/InAppNotificationRepo';
import { AuthFailureError } from '../../../middlewares/api/ApiError';
import { SuccessResponse } from '../../../middlewares/api/ApiResponse';
import { getAnsibleRunnerVersion, getAnsibleVersion } from '../../../core/system/ansible-versions';
import { Role } from '../../../data/database/model/User';
import UserRepo from '../../../data/database/repository/UserRepo';
import { getIntConfFromCache } from '../../../data/cache';
import asyncHandler from '../../../middlewares/AsyncHandler';
import { createADefaultLocalUserRepository } from '../../../modules/playbooks-repository/default-repositories';
import DashboardUseCase from '../../../use-cases/DashboardUseCase';
import DeviceUseCases from '../../../use-cases/DeviceUseCases';
import { dependencies, version } from '../../../../package.json';

export const getCurrentUser = asyncHandler(async (req, res) => {
  const { online, offline, totalCpu, totalMem, overview } =
    await DeviceUseCases.getDevicesOverview();
  const considerDeviceOffline = await getIntConfFromCache(
    SettingsKeys.GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES,
  );
  const serverLogRetention = await getIntConfFromCache(
    SettingsKeys.GeneralSettingsKeys.SERVER_LOG_RETENTION_IN_DAYS,
  );
  const containerStatsRetention = await getIntConfFromCache(
    SettingsKeys.GeneralSettingsKeys.CONTAINER_STATS_RETENTION_IN_DAYS,
  );
  const deviceStatsRetention = await getIntConfFromCache(
    SettingsKeys.GeneralSettingsKeys.DEVICE_STATS_RETENTION_IN_DAYS,
  );
  const ansibleLogRetention = await getIntConfFromCache(
    SettingsKeys.GeneralSettingsKeys.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS,
  );
  const performanceMinMem = await getIntConfFromCache(
    SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER,
  );
  const performanceMaxCpu = await getIntConfFromCache(
    SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER,
  );
  const registerDeviceStatEvery = await getIntConfFromCache(
    SettingsKeys.GeneralSettingsKeys.REGISTER_DEVICE_STAT_EVERY_IN_SECONDS,
  );
  const systemPerformance = await DashboardUseCase.getSystemPerformance();

  new SuccessResponse('Get current user', {
    name: req.user?.name,
    avatar: req.user?.avatar,
    email: req.user?.email,
    access: req.user?.role,
    devices: {
      online: online,
      offline: offline,
      totalCpu: totalCpu,
      totalMem: totalMem,
      overview: overview,
    },
    systemPerformance: {
      danger: systemPerformance.danger,
      message: systemPerformance.message,
    },
    settings: {
      userSpecific: {
        userLogsLevel: req.user?.logsLevel,
      },
      logs: {
        serverRetention: serverLogRetention,
        ansibleRetention: ansibleLogRetention,
      },
      stats: {
        deviceStatsRetention: deviceStatsRetention,
        containerStatsRetention: containerStatsRetention,
      },
      dashboard: {
        performance: {
          minMem: performanceMinMem,
          maxCpu: performanceMaxCpu,
        },
      },
      apiKey: req.user?.apiKey,
      device: {
        registerDeviceStatEvery: registerDeviceStatEvery,
        considerOffLineAfter: considerDeviceOffline,
      },
      server: {
        version: version,
        deps: dependencies,
        processes: process.versions,
        ansibleVersion: await getAnsibleVersion(),
        ansibleRunnerVersion: await getAnsibleRunnerVersion(),
      },
    },
  } as API.CurrentUser).send(res);
});

export const createFirstUser = asyncHandler(async (req, res) => {
  const { email, password, name, avatar } = req.body;
  const hasUser = (await UserRepo.count()) > 0;
  if (hasUser) {
    throw new AuthFailureError('Your instance already has a user, you must first connect');
  }
  // TODO: move to use cases
  await UserRepo.create({
    email: email,
    password: password,
    name: name,
    role: Role.ADMIN,
    avatar: avatar || '/avatars/squirrel.svg',
  });
  await createADefaultLocalUserRepository();
  new SuccessResponse('Create first user').send(res);
});

export const hasUser = asyncHandler(async (req, res) => {
  const hasUser = (await UserRepo.count()) > 0;
  new SuccessResponse('Has user', { hasUsers: hasUser }).send(res);
});
