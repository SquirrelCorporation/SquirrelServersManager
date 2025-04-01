import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { DEVICES_SERVICE, IDevicesService } from '@modules/devices';
import { SSM_DATA_PATH } from 'src/config';
import { SettingsKeys, SsmAnsible } from 'ssm-shared-lib';
import { AnsibleCommandService } from '@modules/ansible';
import { IUser, Role } from '../../domain/entities/user.entity';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user-repository.interface';
import PinoLogger from '../../../../logger';
import { dependencies, version } from '../../../../../package.json';

const logger = PinoLogger.child({ module: 'UsersService' });

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(DEVICES_SERVICE) private readonly devicesService: IDevicesService,
    private readonly ansibleCommandService: AnsibleCommandService,
  ) {}

  async createUser(userData: IUser): Promise<IUser> {
    logger.info(`Creating user with email: ${userData.email}`);
    return this.userRepository.create(userData);
  }

  async updateUser(userData: IUser): Promise<IUser | null> {
    logger.info(`Updating user with email: ${userData.email}`);
    return this.userRepository.update(userData);
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    return this.userRepository.findByEmail(email);
  }

  async findUserByEmailAndPassword(email: string, password: string): Promise<IUser | null> {
    return this.userRepository.findByEmailAndPassword(email, password);
  }

  async findUserByApiKey(apiKey: string): Promise<IUser | null> {
    return this.userRepository.findByApiKey(apiKey);
  }

  async getAllUsers(): Promise<IUser[] | null> {
    return this.userRepository.findAll();
  }

  async getUserCount(): Promise<number> {
    return this.userRepository.count();
  }

  async getFirstUser(): Promise<IUser | null> {
    return this.userRepository.findFirst();
  }

  async regenerateApiKey(email: string): Promise<string | null> {
    logger.info(`Regenerating API key for user: ${email}`);
    return this.userRepository.updateApiKey(email);
  }

  async updateLogsLevel(email: string, logsLevel: any): Promise<IUser | null> {
    logger.info(`Updating logs level for user: ${email}`);
    return this.userRepository.updateLogsLevel(email, logsLevel);
  }

  async createFirstAdminUser(
    name: string,
    email: string,
    password: string,
    avatar = '/avatars/squirrel.svg',
  ): Promise<IUser> {
    const userCount = await this.getUserCount();

    if (userCount > 0) {
      logger.error('Attempted to create first admin user when users already exist');
      throw new Error('Cannot create first user: users already exist');
    }

    const userData: IUser = {
      name,
      email,
      password,
      role: Role.ADMIN,
      avatar,
    };

    logger.info('Creating first admin user');
    return this.createUser(userData);
  }

  async getCurrentUser(user: IUser) {
    const { online, offline, totalCpu, totalMem, overview } =
      await this.devicesService.getDevicesOverview();
    const systemPerformance = {
      danger: false,
      message: '',
    };
    const considerDeviceOffline = await this.cacheManager.get(
      SettingsKeys.GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES,
    );
    const serverLogRetention = await this.cacheManager.get(
      SettingsKeys.GeneralSettingsKeys.SERVER_LOG_RETENTION_IN_DAYS,
    );
    const containerStatsRetention = await this.cacheManager.get(
      SettingsKeys.GeneralSettingsKeys.CONTAINER_STATS_RETENTION_IN_DAYS,
    );
    const deviceStatsRetention = await this.cacheManager.get(
      SettingsKeys.GeneralSettingsKeys.DEVICE_STATS_RETENTION_IN_DAYS,
    );
    const ansibleLogRetention = await this.cacheManager.get(
      SettingsKeys.GeneralSettingsKeys.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS,
    );
    const performanceMinMem = await this.cacheManager.get(
      SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER,
    );
    const performanceMaxCpu = await this.cacheManager.get(
      SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER,
    );
    const updateAvailable = await this.cacheManager.get(
      SettingsKeys.GeneralSettingsKeys.UPDATE_AVAILABLE,
    );
    const masterNodeUrl = await this.cacheManager.get(
      SsmAnsible.DefaultSharedExtraVarsList.MASTER_NODE_URL,
    );

    return {
      name: user?.name,
      avatar: user?.avatar,
      email: user?.email,
      access: user?.role,
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
          userLogsLevel: user?.logsLevel,
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
        apiKey: user?.apiKey,
        device: {
          considerOffLineAfter: considerDeviceOffline,
        },
        server: {
          version: version,
          deps: dependencies,
          processes: process.versions,
          ansibleVersion: await this.ansibleCommandService.getAnsibleVersion(),
          ansibleRunnerVersion: await this.ansibleCommandService.getAnsibleRunnerVersion(),
        },
        updateAvailable,
        ssmDataPath: SSM_DATA_PATH,
        masterNodeUrl,
      },
    };
  }
}
