import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { SALT_ROUNDS, UsersModel } from '../../../../data/database/model/User';
import UserRepo from '../../../../data/database/repository/UserRepo';
import app from '../../server';

describe('Auth Integration Tests', () => {
  vi.mock('../../../../data/database/repository/UserRepo', () => ({
    findByEmailAndPassword: vi.fn(),
  }));

  beforeAll(async () => {
    await mongoose.connect(process.env['MONGO_URI'] as string);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  afterEach(async () => {
    await mongoose.connection.db?.dropDatabase();
    vi.clearAllMocks();
  });

  beforeEach(async () => {
    const user = new UsersModel({
      email: 'test@example.com',
      password: 'password',
      role: 'admin',
      avatar: 'test',
      name: 'test',
    });
    await user.save();
  });

  describe('POST /login', () => {
    it('should return 200 and set jwt cookie on successful login', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({ username: 'test@example.com', password: 'password' });

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: 'Login success',
          data: {
            currentAuthority: 'admin',
          },
        }),
      );
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({ username: 'invalid@example.com', password: 'wrongpassword' });

      // Assertions
      expect(response.status).toBe(401);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: 'Identification is incorrect！',
          success: false,
        }),
      );
    });

    it('should return 400 when email is incorrect', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({ username: 'invalid_example.com', password: 'password' });

      // Assertions
      expect(response.status).toBe(400);
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app).post('/users/login').send({ password: 'password' });

      // Assertions
      expect(response.status).toBe(400);
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({ username: 'test@example.com' });

      // Assertions
      expect(response.status).toBe(400);
    });
  });

  describe('POST /logout', () => {
    it('should clear jwt cookie on successful logout', async () => {
      const response = await request(app).post('/users/logout').set('Cookie', 'jwt=fake-jwt-token');

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: 'Logout success',
        }),
      );
      expect(response.headers['set-cookie']).toContainEqual(expect.stringContaining('jwt=;'));
    });

    it('should return 401 if no jwt token is found', async () => {
      const response = await request(app).post('/users/logout');

      // Assertions
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid jwt' });
    });
  });
});
