import mongoose from 'mongoose';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from './server';

describe('Ping Basic test', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env['MONGO_URI'] as string);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('Ping', async () => {
    const response = await request(app).get('/ping').set('content-type', 'application/json').send();
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
  });
});
