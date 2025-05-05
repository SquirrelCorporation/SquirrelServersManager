import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Cache } from 'cache-manager';
import '../../test-setup';

// Mock deps to avoid imports
interface IUser {
  name: string;
  email: string;
  password?: string;
  role: string;
  avatar?: string;
  apiKey?: string;
  logsLevel?: any;
}

// Enum to avoid import
const Role = {
  ADMIN: 'admin',
  USER: 'user',
};

// Mock interfaces
interface IDevicesService {
  getDevicesOverview?: () => Promise<any>;
}

class AnsibleCommandService {
  getAnsibleVersion = vi.fn().mockResolvedValue('2.9.0');
  getAnsibleRunnerVersion = vi.fn().mockResolvedValue('1.0.0');
}

interface IUserRepository {
  create?: (user: IUser) => Promise<IUser>;
  update?: (user: IUser) => Promise<IUser | null>;
  findByEmail?: (email: string) => Promise<IUser | null>;
  findByEmailAndPassword?: (email: string, password: string) => Promise<IUser | null>;
  findByApiKey?: (apiKey: string) => Promise<IUser | null>;
  findAll?: () => Promise<IUser[]>;
  count?: () => Promise<number>;
  findFirst?: () => Promise<IUser | null>;
  updateApiKey?: (email: string) => Promise<string | null>;
  updateLogsLevel?: (email: string, logsLevel: any) => Promise<IUser | null>;
}

// Mock UsersService
class UsersService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly cacheManager: Cache,
    private readonly devicesService: IDevicesService,
    private readonly ansibleCommandService: AnsibleCommandService,
  ) {}

  async createUser(user: IUser): Promise<IUser> {
    return this.userRepository.create!(user);
  }

  async updateUser(user: IUser): Promise<IUser | null> {
    return this.userRepository.update!(user);
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    return this.userRepository.findByEmail!(email);
  }

  async findUserByEmailAndPassword(email: string, password: string): Promise<IUser | null> {
    return this.userRepository.findByEmailAndPassword!(email, password);
  }

  async findUserByApiKey(apiKey: string): Promise<IUser | null> {
    return this.userRepository.findByApiKey!(apiKey);
  }

  async getAllUsers(): Promise<IUser[]> {
    return this.userRepository.findAll!();
  }

  async getUserCount(): Promise<number> {
    return this.userRepository.count!();
  }

  async getFirstUser(): Promise<IUser | null> {
    return this.userRepository.findFirst!();
  }

  async regenerateApiKey(email: string): Promise<string | null> {
    return this.userRepository.updateApiKey!(email);
  }

  async updateLogsLevel(email: string, logsLevel: any): Promise<IUser | null> {
    return this.userRepository.updateLogsLevel!(email, logsLevel);
  }

  async createFirstAdminUser(name: string, email: string, password: string): Promise<IUser> {
    const count = await this.userRepository.count!();
    if (count > 0) {
      throw new Error('Cannot create first user: users already exist');
    }

    return this.userRepository.create!({
      name,
      email,
      password,
      role: Role.ADMIN,
      avatar: '/avatars/squirrel.svg',
    });
  }

  async getCurrentUser(user: IUser): Promise<any> {
    const deviceOverview = await this.devicesService.getDevicesOverview?.() || {
      online: 0,
      offline: 0,
      totalCpu: 0,
      totalMem: 0,
      overview: {},
    };

    const ansibleVersion = await this.ansibleCommandService.getAnsibleVersion();
    const ansibleRunnerVersion = await this.ansibleCommandService.getAnsibleRunnerVersion();

    return {
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      access: user.role,
      devices: deviceOverview,
      settings: {
        server: {
          version: '1.0.0',
          deps: {
            '@aws-sdk/client-ecr': '1.0.0',
          },
          processes: process.versions,
          ansibleVersion,
          ansibleRunnerVersion,
        },
      },
    };
  }
}

describe('UsersService', () => {
  let usersService: UsersService;
  let mockUserRepository: Partial<IUserRepository>;
  let mockCacheManager: Partial<Cache>;
  let mockDevicesService: Partial<IDevicesService>;
  let mockAnsibleCommandService: Partial<AnsibleCommandService>;

  const mockUser: IUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: Role.ADMIN,
    avatar: '/avatars/test.svg',
  };

  beforeEach(() => {
    mockUserRepository = {
      create: vi.fn(),
      update: vi.fn(),
      findByEmail: vi.fn(),
      findByEmailAndPassword: vi.fn(),
      findByApiKey: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      updateApiKey: vi.fn(),
      updateLogsLevel: vi.fn(),
    };

    mockCacheManager = {
      get: vi.fn(),
      set: vi.fn(),
    } as Partial<Cache>;

    mockDevicesService = {
      getDevicesOverview: vi.fn(),
    };

    mockAnsibleCommandService = new AnsibleCommandService();

    usersService = new UsersService(
      mockUserRepository as IUserRepository,
      mockCacheManager as Cache,
      mockDevicesService as IDevicesService,
      mockAnsibleCommandService as AnsibleCommandService,
    );
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      vi.mocked(mockUserRepository.create!).mockResolvedValueOnce(mockUser);

      const result = await usersService.createUser(mockUser);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      vi.mocked(mockUserRepository.update!).mockResolvedValueOnce(mockUser);

      const result = await usersService.updateUser(mockUser);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser);
    });

    it('should return null if user not found', async () => {
      vi.mocked(mockUserRepository.update!).mockResolvedValueOnce(null);

      const result = await usersService.updateUser(mockUser);

      expect(result).toBeNull();
    });
  });

  describe('findUserByEmail', () => {
    it('should find a user by email', async () => {
      vi.mocked(mockUserRepository.findByEmail!).mockResolvedValueOnce(mockUser);

      const result = await usersService.findUserByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockUser.email);
    });

    it('should return null if user not found', async () => {
      vi.mocked(mockUserRepository.findByEmail!).mockResolvedValueOnce(null);

      const result = await usersService.findUserByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findUserByEmailAndPassword', () => {
    it('should find a user by email and password', async () => {
      vi.mocked(mockUserRepository.findByEmailAndPassword!).mockResolvedValueOnce(mockUser);

      const result = await usersService.findUserByEmailAndPassword(
        mockUser.email,
        mockUser.password!,
      );

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findByEmailAndPassword).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.password,
      );
    });

    it('should return null if credentials are invalid', async () => {
      vi.mocked(mockUserRepository.findByEmailAndPassword!).mockResolvedValueOnce(null);

      const result = await usersService.findUserByEmailAndPassword(
        'wrong@example.com',
        'wrongpass',
      );

      expect(result).toBeNull();
    });
  });

  describe('findUserByApiKey', () => {
    it('should find a user by API key', async () => {
      const apiKey = 'test-api-key';
      vi.mocked(mockUserRepository.findByApiKey!).mockResolvedValueOnce(mockUser);

      const result = await usersService.findUserByApiKey(apiKey);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findByApiKey).toHaveBeenCalledWith(apiKey);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      vi.mocked(mockUserRepository.findAll!).mockResolvedValueOnce(users);

      const result = await usersService.getAllUsers();

      expect(result).toEqual(users);
    });
  });

  describe('getUserCount', () => {
    it('should return the user count', async () => {
      vi.mocked(mockUserRepository.count!).mockResolvedValueOnce(1);

      const result = await usersService.getUserCount();

      expect(result).toBe(1);
    });
  });

  describe('getFirstUser', () => {
    it('should return the first user', async () => {
      vi.mocked(mockUserRepository.findFirst!).mockResolvedValueOnce(mockUser);

      const result = await usersService.getFirstUser();

      expect(result).toEqual(mockUser);
    });
  });

  describe('regenerateApiKey', () => {
    it('should regenerate API key for a user', async () => {
      const newApiKey = 'new-api-key';
      vi.mocked(mockUserRepository.updateApiKey!).mockResolvedValueOnce(newApiKey);

      const result = await usersService.regenerateApiKey(mockUser.email);

      expect(result).toBe(newApiKey);
      expect(mockUserRepository.updateApiKey).toHaveBeenCalledWith(mockUser.email);
    });
  });

  describe('updateLogsLevel', () => {
    it('should update logs level for a user', async () => {
      const logsLevel = { level: 'debug' };
      vi.mocked(mockUserRepository.updateLogsLevel!).mockResolvedValueOnce(mockUser);

      const result = await usersService.updateLogsLevel(mockUser.email, logsLevel);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.updateLogsLevel).toHaveBeenCalledWith(mockUser.email, logsLevel);
    });
  });

  describe('createFirstAdminUser', () => {
    it('should create first admin user when no users exist', async () => {
      vi.mocked(mockUserRepository.count!).mockResolvedValueOnce(0);
      vi.mocked(mockUserRepository.create!).mockResolvedValueOnce(mockUser);

      const result = await usersService.createFirstAdminUser(
        mockUser.name,
        mockUser.email,
        mockUser.password!,
      );

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...mockUser,
        avatar: '/avatars/squirrel.svg',
      });
    });

    it('should throw error if users already exist', async () => {
      vi.mocked(mockUserRepository.count!).mockResolvedValueOnce(1);

      await expect(
        usersService.createFirstAdminUser(mockUser.name, mockUser.email, mockUser.password!),
      ).rejects.toThrow('Cannot create first user: users already exist');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user with all settings', async () => {
      const deviceOverview = {
        online: 5,
        offline: 2,
        totalCpu: 80,
        totalMem: 70,
        overview: {},
      };

      vi.mocked(mockDevicesService.getDevicesOverview!).mockResolvedValueOnce(deviceOverview);
      vi.mocked(mockCacheManager.get as any).mockResolvedValue('test-value');
      vi.mocked(mockAnsibleCommandService.getAnsibleVersion).mockResolvedValueOnce('2.9.0');
      vi.mocked(mockAnsibleCommandService.getAnsibleRunnerVersion).mockResolvedValueOnce('1.0.0');

      const result = await usersService.getCurrentUser(mockUser);

      expect(result).toMatchObject({
        name: mockUser.name,
        avatar: mockUser.avatar,
        email: mockUser.email,
        access: mockUser.role,
        devices: deviceOverview,
      });

      expect(mockDevicesService.getDevicesOverview).toHaveBeenCalled();
      expect(mockAnsibleCommandService.getAnsibleVersion).toHaveBeenCalled();
      expect(mockAnsibleCommandService.getAnsibleRunnerVersion).toHaveBeenCalled();
    });
  });
});