import { cidrContains, isCidr, isIp } from '../../src/utils/ip';

describe('IP and CIDR Utility Functions', () => {
  describe('isIp', () => {
    it('should return true for valid IP addresses', () => {
      expect(isIp('192.168.1.1')).toBe(true);
      expect(isIp('0.0.0.0')).toBe(true);
      expect(isIp('255.255.255.255')).toBe(true);
    });

    it('should return false for invalid IP addresses', () => {
      expect(isIp('256.256.256.256')).toBe(false);
      expect(isIp('192.168.1.')).toBe(false);
      expect(isIp('abc.def.ghi.jkl')).toBe(false);
      expect(isIp('1234.123.123.123')).toBe(false);
    });
  });

  describe('isCidr', () => {
    it('should return true for valid CIDRs', () => {
      expect(isCidr('192.168.1.0/24')).toBe(true);
      expect(isCidr('0.0.0.0/0')).toBe(true);
      expect(isCidr('255.255.255.255/32')).toBe(true);
    });

    it('should return false for invalid CIDRs', () => {
      expect(isCidr('192.168.1.0/33')).toBe(false);
      expect(isCidr('192.168.1.0')).toBe(false);
      expect(isCidr('abc.def.ghi.jkl/24')).toBe(false);
    });
  });

  describe('cidrContains', () => {
    it('should return true if the IP is within the CIDR range', () => {
      expect(cidrContains('192.168.1.0/24', '192.168.1.1')).toBe(true);
      expect(cidrContains('10.0.0.0/8', '10.0.1.2')).toBe(true);
    });

    it('should return false if the IP is not within the CIDR range', () => {
      expect(cidrContains('192.168.1.0/24', '192.168.2.1')).toBe(false);
      expect(cidrContains('10.0.0.0/8', '192.168.1.1')).toBe(false);
    });
  });
});
