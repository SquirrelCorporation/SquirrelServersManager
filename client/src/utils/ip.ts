export const isIp = (ip: string): boolean => {
  const ipRegex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9]?\d?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9]?\d?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9]?\d?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9]?\d?)$/;
  return ipRegex.test(ip);
};

export const isCidr = (cidr: string): boolean => {
  const cidrRegex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9]?\d?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9]?\d?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9]?\d?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9]?\d?)\/(3[0-2]|[12]?[0-9])$/;
  return cidrRegex.test(cidr);
};

export const cidrContains = (cidr: string, ip: string): boolean => {
  const [range, bits] = cidr.split('/');
  const ipAddr = ip.split('.').map((octet) => parseInt(octet, 10));
  const subnetAddr = range.split('.').map((octet) => parseInt(octet, 10));
  const mask = ~(2 ** (32 - parseInt(bits, 10)) - 1);

  const ipInt =
    (ipAddr[0] << 24) | (ipAddr[1] << 16) | (ipAddr[2] << 8) | ipAddr[3];
  const subnetInt =
    (subnetAddr[0] << 24) |
    (subnetAddr[1] << 16) |
    (subnetAddr[2] << 8) |
    subnetAddr[3];

  return (ipInt & mask) === (subnetInt & mask);
};

export const isNetworkBaseAddress = (cidr: string): boolean => {
  const [range, bits] = cidr.split('/');
  if (!bits) return false;
  const subnetAddr = range.split('.').map((octet) => parseInt(octet, 10));
  const subnetInt =
    (subnetAddr[0] << 24) |
    (subnetAddr[1] << 16) |
    (subnetAddr[2] << 8) |
    subnetAddr[3];
  const mask = ~(2 ** (32 - parseInt(bits, 10)) - 1);
  return (subnetInt & ~mask) === 0;
};

export const validateSubnet = () => (rule: any, value: string) => {
  return new Promise<void>((resolve, reject) => {
    if (!value) {
      return resolve();
    }
    // Ensure IP/CIDR value is valid
    if (!isCidr(value)) {
      return reject('CIDR format invalid');
    }
    if (!isNetworkBaseAddress(value)) {
      return reject(
        'CIDR ${value} is incorrectly formed. It should start with the base like 192.168.0.0/24',
      );
    }
    return resolve();
  });
};

export const validateIpRangeInSubnet =
  (getFieldValue: (name: string) => any) => (rule: any, value: string) => {
    return new Promise<void>((resolve, reject) => {
      const subnet = getFieldValue('v4_subnet');
      if (!value) {
        return resolve();
      }
      // Ensure IP/CIDR value is valid
      if (!isCidr(value)) {
        return reject('CIDR format invalid');
      }

      if (!isNetworkBaseAddress(value)) {
        return reject(
          `CIDR ${value} is incorrectly formed. It should start with the base like 192.168.0.0/24`,
        );
      }

      // Validate CIDR containment for a single IP or base IP of CIDR
      const valueBaseIp = value.split('/')[0];
      if (!cidrContains(subnet, valueBaseIp)) {
        return reject('CIDR not within the subnet');
      }

      // Additional check if value is CIDR: prefix lengths comparison
      if (isCidr(value)) {
        const valuePrefixLength = parseInt(value.split('/')[1], 10);
        const subnetPrefixLength = parseInt(subnet.split('/')[1], 10);
        if (valuePrefixLength < subnetPrefixLength) {
          return reject('IP range is less than the subnet prefix');
        }
      }

      return resolve();
    });
  };

export const validateIpInSubnet =
  (getFieldValue: (name: string) => any) => (rule: any, value: string) => {
    return new Promise<void>((resolve, reject) => {
      const subnet = getFieldValue('v4_subnet');
      if (!value) {
        return resolve();
      }

      // Ensure IP/CIDR value is valid
      if (!isIp(value)) {
        return reject('Invalid IP format');
      }

      if (!cidrContains(subnet, value)) {
        return reject('IP not within the subnet');
      }

      return resolve();
    });
  };
