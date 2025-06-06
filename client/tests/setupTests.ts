/**
 * Enhanced Test Setup for SSM Client
 * Comprehensive testing infrastructure setup
 */

import '@testing-library/jest-dom';
import { Buffer } from 'buffer';
import { TextDecoder, TextEncoder } from 'util';
import { vi } from 'vitest';
import { configure } from '@testing-library/react';
import { server } from './mocks/server';

// Set up globals
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.Buffer = Buffer;

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000
});

// Establish API mocking before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset any request handlers that we may add during the tests
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

// Clean up after the tests are finished
afterAll(() => {
  server.close();
});

// Mock UmiJS Max hooks and utilities
vi.mock('@umijs/max', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('@umijs/max')>();
  return {
    ...originalModule,
    useModel: vi.fn().mockImplementation((namespace) => {
      if (namespace === '@@initialState') {
        return {
          initialState: {
            currentUser: {
              id: 'test-user-1',
              name: 'Test User',
              email: 'test@example.com',
              permissions: ['admin', 'read', 'write'],
            },
            settings: {
              theme: 'light',
              language: 'en-US',
            },
            plugins: [],
          },
          setInitialState: vi.fn(),
        };
      }
      return {};
    }),
    useRequest: vi.fn().mockImplementation((api, options = {}) => {
      return {
        data: null,
        loading: false,
        error: null,
        run: vi.fn(),
        refresh: vi.fn(),
        cancel: vi.fn(),
        ...options,
      };
    }),
    history: {
      push: vi.fn(),
      replace: vi.fn(),
      goBack: vi.fn(),
      location: { pathname: '/' },
    },
    request: vi.fn().mockResolvedValue({ success: true, data: {} }),
  };
});

// Mock Ant Design components
vi.mock('antd', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('antd')>();
  return {
    ...originalModule,
    message: {
      ...originalModule.message,
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
      loading: vi.fn(),
      destroy: vi.fn(),
    },
    notification: {
      ...originalModule.notification,
      open: vi.fn(),
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
      destroy: vi.fn(),
    },
  };
});

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    connected: true,
  })),
}));

// Mock xterm terminal
vi.mock('xterm', () => ({
  Terminal: vi.fn().mockImplementation(() => ({
    open: vi.fn(),
    write: vi.fn(),
    writeln: vi.fn(),
    clear: vi.fn(),
    focus: vi.fn(),
    onData: vi.fn(),
    dispose: vi.fn(),
    rows: 24,
    cols: 80,
    element: document.createElement('div'),
  })),
}));

vi.mock('@xterm/addon-fit', () => ({
  FitAddon: vi.fn().mockImplementation(() => ({
    fit: vi.fn(),
    activate: vi.fn(),
    dispose: vi.fn(),
  })),
}));

// Match media mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

// Canvas mock for charts
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: () => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(),
    putImageData: vi.fn(),
    createImageData: vi.fn().mockReturnValue({}),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 0 }),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    createLinearGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn(),
    }),
  }),
});

// Mock getComputedStyle
// @ts-ignore
window.getComputedStyle = () => ({
  getPropertyValue: () => '',
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock localStorage and sessionStorage
const storageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = storageMock;
global.sessionStorage = storageMock;

// Mock CSS modules
vi.mock('*.less', () => ({}));
vi.mock('*.css', () => ({}));

// Global test utilities
global.testUtils = {
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  mockApiResponse: (data: any, success = true) => ({
    success,
    data,
    message: success ? 'Success' : 'Error',
  }),
};
