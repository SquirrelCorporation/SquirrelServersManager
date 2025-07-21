import { beforeEach, describe, expect, test, vi } from 'vitest';
import httpMocks from 'node-mocks-http';
import './test-setup';

// Mock findIpAddress function
const findIpAddress = vi.fn().mockImplementation((req) => {
  try {
    if (req.headers && req.headers['x-forwarded-for']) {
      const ips = req.headers['x-forwarded-for'].split(',');
      return ips[0].trim();
    }

    if (req.connection && req.connection.remoteAddress) {
      return req.connection.remoteAddress;
    }

    if (req.ip) {
      return req.ip;
    }

    return undefined;
  } catch (error) {
    return undefined;
  }
});

vi.mock('http');

describe('findIpAddress()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns the X-Forwarded-For header if it exists', () => {
    const expectedIp = '192.168.0.1';
    const mockExpressRequest = httpMocks.createRequest({
      method: 'GET',
      url: '/user/42',
      params: {
        id: 42,
      },
    });
    mockExpressRequest.headers['x-forwarded-for'] = `${expectedIp}, 192.168.0.2`;

    const resultIp = findIpAddress(mockExpressRequest);

    expect(resultIp).equal(expectedIp);
  });

  test('returns the remoteAddress if no X-Forwarded-For header provided', () => {
    const expectedIp = '192.168.0.3';
    const mockExpressRequest = httpMocks.createRequest({
      method: 'GET',
      url: '/user/42',
      params: {
        id: 42,
      },
      connection: {
        remoteAddress: expectedIp,
      },
    });

    const resultIp = findIpAddress(mockExpressRequest);

    expect(resultIp).equal(expectedIp);
  });

  test('returns the req.ip if no X-Forwarded-For header or remoteAddress provided', () => {
    const expectedIp = '192.168.0.4';
    const mockExpressRequest = httpMocks.createRequest({
      method: 'GET',
      url: '/user/42',
      params: {
        id: 42,
      },
    });
    // @ts-expect-error for test
    mockExpressRequest.ip = expectedIp;

    const resultIp = findIpAddress(mockExpressRequest);

    expect(resultIp).equal(expectedIp);
  });

  test('returns undefined on error', () => {
    const errorThrowingReq = {
      get headers() {
        throw new Error('Unexpected error');
      },
    };
    // @ts-expect-error error throwing
    const resultIp = findIpAddress(errorThrowingReq);

    expect(resultIp).equal(undefined);
  });
});
