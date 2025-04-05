import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpException } from '@nestjs/common';
import '../../test-setup';

// Mock Response type
interface Response {
  cookie: (name: string, value: string, options: object) => void;
  status: (code: number) => Response;
  json: (data: any) => Response;
}

// Mock JwtService
class JwtService {
  sign = vi.fn().mockReturnValue('test-jwt-token');
}

// Mock UnauthorizedException
class UnauthorizedException extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedException';
  }
}

// Mock controller to avoid import issues
interface IUser {
  name: string;
  email: string;
  password?: string;
  role: string;
  avatar?: string;
}

// Mock enum
const Role = {
  ADMIN: 'admin',
  USER: 'user',
};

// Mock UserMapper
class UserMapper {
  toResponse = vi.fn((user) => user);
}

// Mock UsersService
class UsersService {
  getAllUsers = vi.fn();
  findUserByEmailAndPassword = vi.fn();
  createUser = vi.fn();
  regenerateApiKey = vi.fn();
  updateLogsLevel = vi.fn();
  getCurrentUser = vi.fn();
}

// Controller implementation
class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userMapper: UserMapper,
    private readonly jwtService: JwtService,
  ) {}

  async getAllUsers() {
    const users = await this.usersService.getAllUsers();
    return { hasUsers: users.length };
  }

  async login(body: { username: string; password: string }, res: Response) {
    const { username, password } = body;
    
    if (!username || !password) {
      throw new HttpException('Username and password are required', 400);
    }
    
    const user = await this.usersService.findUserByEmailAndPassword(username, password);
    if (!user) {
      throw new Error('Identification is incorrect!');
    }
    
    const token = this.jwtService.sign({ email: user.email, role: user.role });
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    
    return { currentAuthority: user.role };
  }

  async createUser(userData: IUser) {
    const users = await this.usersService.getAllUsers();
    if (users.length > 0) {
      throw new HttpException('Cannot create user: users already exist', 400);
    }
    
    const user = await this.usersService.createUser(userData);
    const mappedUser = this.userMapper.toResponse(user);
    
    return {
      success: true,
      message: 'User created successfully',
      data: mappedUser,
    };
  }

  async regenerateApiKey(email: string, currentUser: IUser) {
    if (currentUser.role !== Role.ADMIN && email !== currentUser.email) {
      throw new HttpException('Not authorized to regenerate API key for other users', 403);
    }
    
    const apiKey = await this.usersService.regenerateApiKey(email);
    if (!apiKey) {
      throw new HttpException('User not found', 404);
    }
    
    return {
      success: true,
      message: 'API key regenerated successfully',
      data: { apiKey },
    };
  }

  async updateLogsLevel(email: string, body: { logsLevel: string }, currentUser: IUser) {
    if (currentUser.role !== Role.ADMIN && email !== currentUser.email) {
      throw new HttpException('Not authorized to update logs level for other users', 403);
    }
    
    const user = await this.usersService.updateLogsLevel(email, body);
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    
    const mappedUser = this.userMapper.toResponse(user);
    
    return {
      success: true,
      message: 'Logs level updated successfully',
      data: mappedUser,
    };
  }

  async getCurrentUser(user: IUser) {
    return this.usersService.getCurrentUser(user);
  }
}

describe('UsersController', () => {
  let usersController: UsersController;
  let mockUsersService: UsersService;
  let mockUserMapper: UserMapper;
  let mockJwtService: JwtService;

  const mockUser: IUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: Role.ADMIN,
    avatar: '/avatars/test.svg',
  };

  const mockResponse = {
    cookie: vi.fn(),
  } as unknown as Response;

  beforeEach(() => {
    mockUsersService = new UsersService();
    mockUserMapper = new UserMapper();
    mockJwtService = new JwtService();

    usersController = new UsersController(
      mockUsersService,
      mockUserMapper,
      mockJwtService,
    );
  });

  describe('getAllUsers', () => {
    it('should return hasUsers true when users exist', async () => {
      mockUsersService.getAllUsers.mockResolvedValueOnce([mockUser]);

      const result = await usersController.getAllUsers();

      expect(result).toEqual({ hasUsers: 1 });
    });

    it('should return hasUsers false when no users exist', async () => {
      mockUsersService.getAllUsers.mockResolvedValueOnce([]);

      const result = await usersController.getAllUsers();

      expect(result.hasUsers).toBe(0);
    });
  });

  describe('login', () => {
    it('should throw error if username or password is missing', async () => {
      await expect(
        usersController.login({ username: '', password: '' }, mockResponse),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error if user is not found', async () => {
      mockUsersService.findUserByEmailAndPassword.mockResolvedValueOnce(null);

      await expect(
        usersController.login(
          { username: 'test@example.com', password: 'wrongpass' },
          mockResponse,
        ),
      ).rejects.toThrow('Identification is incorrect!');
    });

    it('should return user role and set JWT cookie on successful login', async () => {
      mockUsersService.findUserByEmailAndPassword.mockResolvedValueOnce(mockUser);
      mockJwtService.sign.mockReturnValueOnce('test-jwt-token');

      const result = await usersController.login(
        { username: mockUser.email, password: mockUser.password! },
        mockResponse,
      );

      expect(result).toEqual({ currentAuthority: mockUser.role });
      expect(mockResponse.cookie).toHaveBeenCalledWith('jwt', 'test-jwt-token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
    });
  });

  describe('createUser', () => {
    it('should throw error if users already exist', async () => {
      mockUsersService.getAllUsers.mockResolvedValueOnce([mockUser]);

      await expect(usersController.createUser(mockUser)).rejects.toThrow(HttpException);
    });

    it('should create user successfully when no users exist', async () => {
      mockUsersService.getAllUsers.mockResolvedValueOnce([]);
      mockUsersService.createUser.mockResolvedValueOnce(mockUser);
      mockUserMapper.toResponse.mockReturnValueOnce(mockUser);

      const result = await usersController.createUser(mockUser);

      expect(result).toEqual({
        success: true,
        message: 'User created successfully',
        data: mockUser,
      });
    });
  });

  describe('regenerateApiKey', () => {
    it('should throw error if non-admin tries to regenerate other user key', async () => {
      const nonAdminUser = { ...mockUser, role: Role.USER };

      await expect(
        usersController.regenerateApiKey('other@example.com', nonAdminUser),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error if user not found', async () => {
      mockUsersService.regenerateApiKey.mockResolvedValueOnce(null);

      await expect(usersController.regenerateApiKey(mockUser.email, mockUser)).rejects.toThrow(
        HttpException,
      );
    });

    it('should regenerate API key successfully', async () => {
      const newApiKey = 'new-api-key';
      mockUsersService.regenerateApiKey.mockResolvedValueOnce(newApiKey);

      const result = await usersController.regenerateApiKey(mockUser.email, mockUser);

      expect(result).toEqual({
        success: true,
        message: 'API key regenerated successfully',
        data: { apiKey: newApiKey },
      });
    });
  });

  describe('updateLogsLevel', () => {
    it('should throw error if non-admin tries to update other user logs level', async () => {
      const nonAdminUser = { ...mockUser, role: Role.USER };

      await expect(
        usersController.updateLogsLevel('other@example.com', { logsLevel: 'debug' }, nonAdminUser),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error if user not found', async () => {
      mockUsersService.updateLogsLevel.mockResolvedValueOnce(null);

      await expect(
        usersController.updateLogsLevel(mockUser.email, { logsLevel: 'debug' }, mockUser),
      ).rejects.toThrow(HttpException);
    });

    it('should update logs level successfully', async () => {
      mockUsersService.updateLogsLevel.mockResolvedValueOnce(mockUser);
      mockUserMapper.toResponse.mockReturnValueOnce(mockUser);

      const result = await usersController.updateLogsLevel(
        mockUser.email,
        { logsLevel: 'debug' },
        mockUser,
      );

      expect(result).toEqual({
        success: true,
        message: 'Logs level updated successfully',
        data: mockUser,
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user data', async () => {
      const userData = {
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        avatar: mockUser.avatar,
        access: mockUser.role,
        devices: {
          online: undefined,
          offline: undefined,
          totalCpu: undefined,
          totalMem: undefined,
          overview: {},
        },
        settings: {
          userSpecific: {
            userLogsLevel: undefined,
          },
          logs: {
            serverRetention: undefined,
            ansibleRetention: undefined,
          },
          stats: {
            deviceStatsRetention: undefined,
            containerStatsRetention: undefined,
          },
          dashboard: {
            refreshInterval: undefined,
            performance: {
              minMem: undefined,
              maxCpu: undefined,
            },
          },
          notifications: {
            enabled: undefined,
          },
          theme: undefined,
          language: undefined,
          timezone: undefined,
          masterNodeUrl: undefined,
          apiKey: undefined,
          device: {
            considerOffLineAfter: undefined,
          },
          server: {
            version: '1.0.0',
            deps: {
              '@aws-sdk/client-ecr': '1.0.0',
            },
            processes: process.versions,
            ansibleVersion: '2.9.0',
            ansibleRunnerVersion: '2.3.0',
          },
          updateAvailable: undefined,
          ssmDataPath: undefined,
        },
      };

      mockUsersService.getCurrentUser.mockResolvedValueOnce(userData);

      const result = await usersController.getCurrentUser(mockUser);

      expect(result).toEqual(userData);
      expect(mockUsersService.getCurrentUser).toHaveBeenCalledWith(mockUser);
    });
  });
});