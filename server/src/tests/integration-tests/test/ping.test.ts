import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from './server';

describe('delete a task', () => {
  it('Ping', async () => {
    const response = await request(app).get('/ping').set('content-type', 'application/json').send();
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
  });
});
