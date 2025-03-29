import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../server';

describe('HealthController (Integration)', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env['MONGO_URI'] as string);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('GET /ping', () => {
    it('should return a status of "ok"', async () => {
      const response = await request(app)
        .get('/ping')
        .set('content-type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});