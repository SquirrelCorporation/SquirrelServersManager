/**
 * MSW request handlers for API mocking
 */

import { http, HttpResponse } from 'msw';

// Define your API base URL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

export const handlers = [
  // User authentication handlers
  http.post(`${API_BASE_URL}/login`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        token: 'mock-jwt-token',
        user: {
          id: 'test-user-1',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
    });
  }),

  http.get(`${API_BASE_URL}/currentUser`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: 'test-user-1',
        name: 'Test User',
        email: 'test@example.com',
        permissions: ['admin', 'read', 'write'],
      },
    });
  }),

  // Device handlers
  http.get(`${API_BASE_URL}/devices`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        list: [
          {
            uuid: 'device-1',
            name: 'Test Device 1',
            ip: '192.168.1.100',
            status: 'online',
          },
          {
            uuid: 'device-2',
            name: 'Test Device 2',
            ip: '192.168.1.101',
            status: 'offline',
          },
        ],
        total: 2,
      },
    });
  }),

  // Containers handlers
  http.get(`${API_BASE_URL}/containers`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        list: [],
        total: 0,
      },
    });
  }),

  // Playbooks handlers
  http.get(`${API_BASE_URL}/playbooks`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        list: [],
        total: 0,
      },
    });
  }),

  // Settings handlers
  http.get(`${API_BASE_URL}/settings`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        theme: 'light',
        language: 'en-US',
      },
    });
  }),

  // Catch-all handler for unhandled requests
  http.get('*', ({ request }) => {
    console.warn(`Unhandled request: ${request.url}`);
    return HttpResponse.json(
      {
        success: false,
        message: 'Not found',
      },
      { status: 404 }
    );
  }),
];