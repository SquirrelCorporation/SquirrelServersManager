import { describe, expect, it, vi } from 'vitest';
import {
  cleanString,
  getValue,
  hex2bin,
  isFunction,
  plistParser,
  promiseAll,
  sanitizeShellString,
  strIsNumeric,
  toInt,
} from '../../../../../modules/remote-system-information/system-information/utils';

describe('Utils', () => {
  describe('getValue', () => {
    it('should extract value from lines with default separator', () => {
      const lines = ['Name: Test', 'Version: 1.0', 'Description: Some text'];
      expect(getValue(lines, 'Version')).toBe('1.0');
    });

    it('should handle custom separator', () => {
      const lines = ['Name=Test', 'Version=1.0', 'Description=Some text'];
      expect(getValue(lines, 'Version', '=')).toBe('1.0');
    });

    it('should handle trimmed option', () => {
      const lines = ['Name:   Test   ', 'Version:   1.0   '];
      expect(getValue(lines, 'Name', ':', true)).toBe('Test');
    });

    it('should handle lineMatch option', () => {
      const lines = ['NameSpace: Test', 'Name: Actual'];
      expect(getValue(lines, 'Name', ':', false, true)).toBe('Actual');
    });

    it('should return empty string when property not found', () => {
      const lines = ['Name: Test'];
      expect(getValue(lines, 'Version')).toBe('');
    });
  });

  describe('hex2bin', () => {
    it('should convert hex to binary string', () => {
      expect(hex2bin('FF')).toBe('11111111');
      expect(hex2bin('A5')).toBe('10100101');
      expect(hex2bin('00')).toBe('00000000');
    });
  });

  describe('cleanString', () => {
    it('should remove "To Be Filled By O.E.M." text', () => {
      expect(cleanString('To Be Filled By O.E.M.')).toBe('');
      expect(cleanString('Model: To Be Filled By O.E.M.')).toBe('Model: ');
    });

    it('should not modify other strings', () => {
      expect(cleanString('Normal text')).toBe('Normal text');
    });
  });

  describe('toInt', () => {
    it('should convert string to integer', () => {
      expect(toInt('123')).toBe(123);
      expect(toInt('-123')).toBe(-123);
    });

    it('should return 0 for invalid numbers', () => {
      expect(toInt('abc')).toBe(0);
      expect(toInt('')).toBe(0);
    });
  });

  describe('isFunction', () => {
    it('should identify functions correctly', () => {
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(function () {})).toBe(true);
      expect(isFunction(new Function())).toBe(true);
    });

    it('should return false for non-functions', () => {
      expect(isFunction({})).toBe(false);
      expect(isFunction(42)).toBe(false);
      expect(isFunction('string')).toBe(false);
    });
  });

  describe('promiseAll', () => {
    it('should handle successful promises', async () => {
      const promises = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];

      const result = await promiseAll(promises);
      expect(result.results).toEqual([1, 2, 3]);
      expect(result.errors).toEqual([null, null, null]);
    });

    it('should handle failed promises', async () => {
      const error = new Error('Test error');
      const promises = [Promise.resolve(1), Promise.reject(error), Promise.resolve(3)];

      const result = await promiseAll(promises);
      expect(result.results).toEqual([1, null, 3]);
      expect(result.errors[1]).toBe(error);
    });
  });

  describe('sanitizeShellString', () => {
    it('should sanitize strings with default options', () => {
      expect(sanitizeShellString('hello<>world')).toBe('helloworld');
      expect(sanitizeShellString('test*?[]|')).toBe('test');
      expect(sanitizeShellString('cmd && rm')).toBe('cmd  rm');
    });

    it('should handle strict mode', () => {
      expect(sanitizeShellString('test (123)', true)).toBe('test123');
      expect(sanitizeShellString('hello@world', true)).toBe('helloworld');
      expect(sanitizeShellString('test {value}', true)).toBe('testvalue');
    });

    it('should handle empty or undefined input', () => {
      expect(sanitizeShellString('')).toBe('');
      expect(sanitizeShellString(undefined)).toBe('');
    });
  });

  describe('plistParser', () => {
    it('should parse simple plist string', () => {
      const xml = `
        <?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
        <plist version="1.0">
          <dict>
            <key>name</key>
            <string>Test</string>
            <key>value</key>
            <integer>42</integer>
            <key>enabled</key>
            <boolean>true</boolean>
          </dict>
        </plist>
      `;

      const result = plistParser(xml);
      expect(result).toEqual({
        name: 'Test',
        value: 42,
        enabled: 'true',
      });
    });

    it('should parse arrays in plist', () => {
      const xml = `
        <?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
        <plist version="1.0">
          <dict>
            <key>items</key>
            <array>
              <string>item1</string>
              <string>item2</string>
            </array>
          </dict>
        </plist>
      `;

      const result = plistParser(xml);
      expect(result).toEqual({
        items: ['item1', 'item2'],
      });
    });

    it('should handle empty arrays', () => {
      const xml = `
        <?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
        <plist version="1.0">
          <dict>
            <key>items</key>
            <array/>
          </dict>
        </plist>
      `;

      const result = plistParser(xml);
      expect(result).toEqual({
        items: [],
      });
    });
  });

  describe('strIsNumeric', () => {
    it('should identify numeric strings', () => {
      expect(strIsNumeric('123')).toBe(true);
      expect(strIsNumeric('-123')).toBe(true);
      expect(strIsNumeric('123.456')).toBe(true);
    });

    it('should return false for non-numeric strings', () => {
      expect(strIsNumeric('abc')).toBe(false);
      expect(strIsNumeric('')).toBe(false);
    });

    it('should return false for non-string inputs', () => {
      expect(strIsNumeric(123)).toBe(false);
      expect(strIsNumeric(null)).toBe(false);
      expect(strIsNumeric(undefined)).toBe(false);
      expect(strIsNumeric({})).toBe(false);
    });
  });
});
