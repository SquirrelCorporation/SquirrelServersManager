import request from 'supertest';
import mongoose from 'mongoose';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import app from '../../server';
import UserRepo from '../../../../../data/database/repository/UserRepo';

describe('User Controllers Integration Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env['MONGO_URI'] as string);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(() => {
    vi.spyOn(UserRepo, 'findByEmail').mockResolvedValue({
      email: 'test@example.com',
      name: 'test',
      avatar: 'test',
      password: 'test',
      role: 'test',
    });
  });

  afterEach(async () => {
    vi.restoreAllMocks(); // Reset mocks after each test
  });

  describe('resetUserApiKey', () => {
    it('should reset the user API key', async () => {
      const mockUuid = 'new-unique-uuid';
      const resetApiKeySpy = vi.spyOn(UserRepo, 'resetApiKey').mockResolvedValue(mockUuid);

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

      expect(resetApiKeySpy).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('setUserLoglevel', () => {
    it('should set the user log level', async () => {
      const userLogsLevel = { terminal: 5 };
      const updateLogsLevelSpy = vi.spyOn(UserRepo, 'updateLogsLevel').mockResolvedValue();

      const response = await request(app)
        .post('/users/settings/logs')
        .send(userLogsLevel)
        .set('content-type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Set user log level',
        success: true,
      });

      expect(updateLogsLevelSpy).toHaveBeenCalledWith('test@example.com', userLogsLevel);
    });
  });
});
