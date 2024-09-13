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
