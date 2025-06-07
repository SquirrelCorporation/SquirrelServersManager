import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isValidUrl } from '../url-validation';

describe('URL Validation Utils', () => {
  // Mock console.log to not pollute test output
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isValidUrl', () => {
    it('should return true for valid HTTP URL', () => {
      const result = isValidUrl('http://example.com');
      expect(result).toBe(true);
    });

    it('should return true for valid HTTPS URL', () => {
      const result = isValidUrl('https://example.com');
      expect(result).toBe(true);
    });

    it('should return true for URL with path and query parameters', () => {
      const result = isValidUrl('https://example.com/path/to/resource?query=param&another=value');
      expect(result).toBe(true);
    });

    it('should return true for URL with port number', () => {
      const result = isValidUrl('http://localhost:3000');
      expect(result).toBe(true);
    });

    it('should return true for URL with username and password', () => {
      const result = isValidUrl('https://user:password@example.com');
      expect(result).toBe(true);
    });

    it('should return true for URL with IP address', () => {
      const result = isValidUrl('http://192.168.1.1');
      expect(result).toBe(true);
    });

    it('should return false for null input', () => {
      const result = isValidUrl(null as any);
      expect(result).toBe(false);
    });

    it('should return false for undefined input', () => {
      const result = isValidUrl(undefined as any);
      expect(result).toBe(false);
    });

    it('should return false for non-string input', () => {
      const result = isValidUrl(123 as any);
      expect(result).toBe(false);
    });

    it('should return false for empty string', () => {
      const result = isValidUrl('');
      expect(result).toBe(false);
    });

    it('should return false for non-HTTP/HTTPS protocols', () => {
      const ftpResult = isValidUrl('ftp://example.com');
      expect(ftpResult).toBe(false);

      const fileResult = isValidUrl('file:///path/to/file');
      expect(fileResult).toBe(false);

      const wssResult = isValidUrl('wss://example.com');
      expect(wssResult).toBe(false);
    });

    it('should return false for invalid URL format', () => {
      const result = isValidUrl('not-a-valid-url');
      expect(result).toBe(false);
    });

    it('should return false for URL with missing protocol', () => {
      const result = isValidUrl('example.com');
      expect(result).toBe(false);
    });

    it('should return false for URL with invalid characters', () => {
      const result = isValidUrl('http://example com');
      expect(result).toBe(false);
    });

    it('should handle errors during URL parsing', () => {
      // Create a case that would throw an error in URL constructor
      // by mocking the URL constructor to throw
      const originalURL = global.URL;
      global.URL = vi.fn().mockImplementation(() => {
        throw new Error('Invalid URL');
      }) as any;

      const result = isValidUrl('http://example.com');
      expect(result).toBe(false);

      // Restore the original URL constructor
      global.URL = originalURL;
    });
  });
});
