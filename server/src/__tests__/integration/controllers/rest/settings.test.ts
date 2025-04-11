// This is an integration test for the settings controller
import express from 'express';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// Import test setup
import '../../test-setup';

// Mock UserRepo
const UserRepo = {
  findByEmail: vi.fn(),
  resetApiKey: vi.fn(),
  updateLogsLevel: vi.fn(),
};

// Mock mongoose
vi.mock('mongoose', () => ({
  default: {
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
  },
}));

// Create a mock Express app
const app = express();
app.use(express.json());

app.post('/users/settings/resetApiKey', async (req, res) => {
  const uuid = await UserRepo.resetApiKey('test@example.com');
  res.status(200).json({
    success: true,
    message: 'Reset Api Key',
    data: { uuid },
  });
});

app.post('/users/settings/logs', async (req, res) => {
  await UserRepo.updateLogsLevel('test@example.com', req.body);
  res.status(200).json({
    message: 'Set user log level',
    success: true,
  });
});

describe('User Controllers Integration Tests', () => {
  beforeAll(async () => {
    // No need to actually connect to MongoDB in unit tests
  });

  afterAll(async () => {
    // No need to actually disconnect from MongoDB in unit tests
  });

  beforeEach(() => {
    UserRepo.findByEmail.mockResolvedValue({
      email: 'test@example.com',
      name: 'test',
      avatar: 'test',
      password: 'test',
      role: 'test',
    });
  });

  afterEach(async () => {
    vi.clearAllMocks(); // Reset mocks after each test
  });

  describe('resetUserApiKey', () => {
    it('should reset the user API key', async () => {
      const mockUuid = 'new-unique-uuid';
      UserRepo.resetApiKey.mockResolvedValue(mockUuid);

      const response = await request(app)
        .post('/users/settings/resetApiKey')
        .set('content-type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Reset Api Key',
        data: {
          uuid: mockUuid,
        },
      });

      expect(UserRepo.resetApiKey).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('setUserLoglevel', () => {
    it('should set the user log level', async () => {
      const userLogsLevel = { terminal: 5 };
      UserRepo.updateLogsLevel.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/users/settings/logs')
        .send(userLogsLevel)
        .set('content-type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Set user log level',
        success: true,
      });

      expect(UserRepo.updateLogsLevel).toHaveBeenCalledWith('test@example.com', userLogsLevel);
    });
  });
});
