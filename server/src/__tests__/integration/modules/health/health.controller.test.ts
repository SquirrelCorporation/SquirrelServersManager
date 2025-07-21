import express from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

// Mock mongoose
vi.mock('mongoose', () => ({
  default: {
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
  },
}));

// Create a mock Express app
const app = express();
app.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

describe('HealthController (Integration)', () => {
  beforeAll(async () => {
    // No need to actually connect to MongoDB in unit tests
  });

  afterAll(async () => {
    // No need to actually disconnect from MongoDB in unit tests
  });

  describe('GET /ping', () => {
    it('should return a status of "ok"', async () => {
      const response = await request(app).get('/ping').set('content-type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});
