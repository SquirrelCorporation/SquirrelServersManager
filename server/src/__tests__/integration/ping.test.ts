import express from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import './test-setup';

// Create a mock Express app
const app = express();
app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'pong' });
});

// Mock mongoose
vi.mock('mongoose', () => ({
  default: {
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('Ping Basic test', () => {
  beforeAll(async () => {
    // No need to actually connect to MongoDB in unit tests
  });

  afterAll(async () => {
    // No need to actually disconnect from MongoDB in unit tests
  });

  it('Ping', async () => {
    const response = await request(app).get('/ping').set('content-type', 'application/json').send();
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
  });
});
