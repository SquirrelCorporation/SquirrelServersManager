import { describe, expect, it } from 'vitest';
import {
  cidrToNetmask,
  getIPv6ScopeId,
  netmaskToCidr,
} from '../../../../../modules/remote-system-information/system-information/remoteos.utils';

describe('Remote OS Utils', () => {
  describe('netmaskToCidr', () => {
    const testCases = [
      { netmask: '255.255.255.0', expected: 24 },
      { netmask: '255.255.255.255', expected: 32 },
      { netmask: '255.255.0.0', expected: 16 },
      { netmask: '255.0.0.0', expected: 8 },
      { netmask: '255.255.255.252', expected: 30 },
      { netmask: '255.255.255.248', expected: 29 },
      { netmask: '255.255.254.0', expected: 23 },
      { netmask: '255.255.252.0', expected: 22 },
      { netmask: '0.0.0.0', expected: 0 },
    ];

    testCases.forEach(({ netmask, expected }) => {
      it(`should convert ${netmask} to CIDR ${expected}`, () => {
        expect(netmaskToCidr(netmask)).toBe(expected);
      });
    });
  });

  describe('cidrToNetmask', () => {
    const testCases = [
      { cidr: 24, expected: '255.255.255.0' },
      { cidr: 32, expected: '255.255.255.255' },
      { cidr: 16, expected: '255.255.0.0' },
      { cidr: 8, expected: '255.0.0.0' },
      { cidr: 30, expected: '255.255.255.252' },
      { cidr: 29, expected: '255.255.255.248' },
      { cidr: 23, expected: '255.255.254.0' },
      { cidr: 22, expected: '255.255.252.0' },
      { cidr: 0, expected: '0.0.0.0' },
    ];

    testCases.forEach(({ cidr, expected }) => {
      it(`should convert CIDR ${cidr} to netmask ${expected}`, () => {
        expect(cidrToNetmask(cidr)).toBe(expected);
      });
    });
  });

  describe('getIPv6ScopeId', () => {
    it('should return correct scope ID for known interfaces', () => {
      expect(getIPv6ScopeId('Ethernet')).toBe(3);
      expect(getIPv6ScopeId('WiFi')).toBe(4);
      expect(getIPv6ScopeId('Loopback')).toBe(1);
    });

    it('should return undefined for unknown interfaces', () => {
      expect(getIPv6ScopeId('NonExistentInterface')).toBeUndefined();
      expect(getIPv6ScopeId('')).toBeUndefined();
    });

    it('should be case sensitive for interface names', () => {
      expect(getIPv6ScopeId('ethernet')).toBeUndefined();
      expect(getIPv6ScopeId('WIFI')).toBeUndefined();
    });
  });
});
