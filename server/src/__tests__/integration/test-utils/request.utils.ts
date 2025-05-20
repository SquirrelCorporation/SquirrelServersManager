import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

/**
 * Utility functions for making HTTP requests in tests
 */

/**
 * Creates a function to make authenticated requests to the API
 * @param app NestJS application instance
 * @param authToken Authentication token
 * @returns Object with methods for different HTTP verbs
 */
export function createAuthenticatedRequest(app: INestApplication, authToken: string) {
  const req = request(app.getHttpServer());
  const authHeader = { Authorization: `Bearer ${authToken}` };
  
  return {
    /**
     * Makes an authenticated GET request
     * @param url API endpoint URL
     * @param additionalHeaders Optional additional headers
     * @returns SuperTest request
     */
    get: (url: string, additionalHeaders = {}) => {
      return req.get(url)
        .set({ ...authHeader, ...additionalHeaders })
        .set('Content-Type', 'application/json');
    },
    
    /**
     * Makes an authenticated POST request
     * @param url API endpoint URL
     * @param data Request body data
     * @param additionalHeaders Optional additional headers
     * @returns SuperTest request
     */
    post: (url: string, data: any, additionalHeaders = {}) => {
      return req.post(url)
        .set({ ...authHeader, ...additionalHeaders })
        .set('Content-Type', 'application/json')
        .send(data);
    },
    
    /**
     * Makes an authenticated PUT request
     * @param url API endpoint URL
     * @param data Request body data
     * @param additionalHeaders Optional additional headers
     * @returns SuperTest request
     */
    put: (url: string, data: any, additionalHeaders = {}) => {
      return req.put(url)
        .set({ ...authHeader, ...additionalHeaders })
        .set('Content-Type', 'application/json')
        .send(data);
    },
    
    /**
     * Makes an authenticated PATCH request
     * @param url API endpoint URL
     * @param data Request body data
     * @param additionalHeaders Optional additional headers
     * @returns SuperTest request
     */
    patch: (url: string, data: any, additionalHeaders = {}) => {
      return req.patch(url)
        .set({ ...authHeader, ...additionalHeaders })
        .set('Content-Type', 'application/json')
        .send(data);
    },
    
    /**
     * Makes an authenticated DELETE request
     * @param url API endpoint URL
     * @param additionalHeaders Optional additional headers
     * @returns SuperTest request
     */
    delete: (url: string, additionalHeaders = {}) => {
      return req.delete(url)
        .set({ ...authHeader, ...additionalHeaders })
        .set('Content-Type', 'application/json');
    }
  };
}

/**
 * Makes a public (unauthenticated) request to the API
 * @param app NestJS application instance
 * @returns Object with methods for different HTTP verbs
 */
export function createPublicRequest(app: INestApplication) {
  const req = request(app.getHttpServer());
  
  return {
    /**
     * Makes a public GET request
     * @param url API endpoint URL
     * @param additionalHeaders Optional additional headers
     * @returns SuperTest request
     */
    get: (url: string, additionalHeaders = {}) => {
      return req.get(url)
        .set(additionalHeaders)
        .set('Content-Type', 'application/json');
    },
    
    /**
     * Makes a public POST request
     * @param url API endpoint URL
     * @param data Request body data
     * @param additionalHeaders Optional additional headers
     * @returns SuperTest request
     */
    post: (url: string, data: any, additionalHeaders = {}) => {
      return req.post(url)
        .set(additionalHeaders)
        .set('Content-Type', 'application/json')
        .send(data);
    },
    
    /**
     * Makes a public PUT request
     * @param url API endpoint URL
     * @param data Request body data
     * @param additionalHeaders Optional additional headers
     * @returns SuperTest request
     */
    put: (url: string, data: any, additionalHeaders = {}) => {
      return req.put(url)
        .set(additionalHeaders)
        .set('Content-Type', 'application/json')
        .send(data);
    },
    
    /**
     * Makes a public PATCH request
     * @param url API endpoint URL
     * @param data Request body data
     * @param additionalHeaders Optional additional headers
     * @returns SuperTest request
     */
    patch: (url: string, data: any, additionalHeaders = {}) => {
      return req.patch(url)
        .set(additionalHeaders)
        .set('Content-Type', 'application/json')
        .send(data);
    },
    
    /**
     * Makes a public DELETE request
     * @param url API endpoint URL
     * @param additionalHeaders Optional additional headers
     * @returns SuperTest request
     */
    delete: (url: string, additionalHeaders = {}) => {
      return req.delete(url)
        .set(additionalHeaders)
        .set('Content-Type', 'application/json');
    }
  };
}

/**
 * Validates common API response properties 
 * @param response API response object
 */
export function validateApiResponse(response: any) {
  expect(response.status).toBeDefined();
  expect([200, 201, 400, 401, 403, 404, 500]).toContain(response.status);
  
  if (response.status >= 200 && response.status < 300) {
    // Success response should have data or metadata
    if (response.body) {
      expect(response.body).toBeDefined();
    }
  } else {
    // Error response should have message
    expect(response.body.message || response.body.error).toBeDefined();
  }
}