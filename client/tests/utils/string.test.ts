import { describe, expect, it } from 'vitest';
import { capitalizeFirstLetter, truncateString } from '../../src/utils/string';

describe('String Utility Functions', () => {
  describe('capitalizeFirstLetter', () => {
    it('should capitalize the first letter of a string', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello');
      expect(capitalizeFirstLetter('world')).toBe('World');
    });

    it('should return the same string if it is already capitalized', () => {
      expect(capitalizeFirstLetter('Hello')).toBe('Hello');
      expect(capitalizeFirstLetter('World')).toBe('World');
    });

    it('should handle empty strings', () => {
      expect(capitalizeFirstLetter('')).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(capitalizeFirstLetter(null as unknown as string)).toBe(null);
      expect(capitalizeFirstLetter(undefined as unknown as string)).toBe(undefined);
    });
  });

  describe('truncateString', () => {
    it('should truncate a string if it exceeds the maximum length', () => {
      expect(truncateString('Hello, world!', 5)).toBe('Hello...');
      expect(truncateString('This is a long string', 10)).toBe('This is a ...');
    });

    it('should not truncate a string if it is shorter than the maximum length', () => {
      expect(truncateString('Hello', 10)).toBe('Hello');
      expect(truncateString('World', 10)).toBe('World');
    });

    it('should handle empty strings', () => {
      expect(truncateString('', 10)).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(truncateString(null as unknown as string, 10)).toBe(null);
      expect(truncateString(undefined as unknown as string, 10)).toBe(undefined);
    });
  });
});
