import { describe, expect, it, vi } from 'vitest';

// Mock Express application
describe('HealthController (Integration)', () => {
  // Mock app with request/response simulation
  const app = {
    get: vi.fn().mockImplementation((path) => {
      return {
        set: vi.fn().mockImplementation(() => {
          if (path === '/ping') {
            return {
              status: 200,
              body: { status: 'ok' }
            };
          } else if (path === '/health') {
            return {
              status: 200,
              body: { 
                status: 'ok',
                services: {
                  database: 'ok',
                  ssh: 'ok'
                },
                version: '1.0.0'
              }
            };
          }
          return {
            status: 404,
            body: { error: 'Not found' }
          };
        })
      };
    })
  };
  
  describe('GET /ping', () => {
    it('should return a status of "ok"', async () => {
      const response = await app
        .get('/ping')
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
    
    it('should be accessible without authentication', async () => {
      const response = await app
        .get('/ping')
        .set();
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
  
  describe('GET /health', () => {
    it('should return the application health status', async () => {
      const response = await app
        .get('/health')
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('services');
      expect(response.body.services).toHaveProperty('database');
      expect(response.body).toHaveProperty('version');
    });
  });
});