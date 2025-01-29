export function netmaskToCidr(netmask: string): number {
  return (
    netmask
      .split('.')
      .map((octet) => parseInt(octet, 10).toString(2).padStart(8, '0'))
      .join('')
      .split('1').length - 1
  );
}

export function cidrToNetmask(cidr: number): string {
  const mask = Array(32).fill('0'); // Initialize binary array
  for (let i = 0; i < cidr; i++) {
    mask[i] = '1';
  }
  return (
    mask
      .join('')
      .match(/.{8}/g) // Split into octets
      ?.map((binary) => parseInt(binary, 2).toString(10))
      .join('.') || ''
  );
}

export function getIPv6ScopeId(interfaceName: string): number | undefined {
  // This is a placeholder function. Replace with proper logic to map interface names to scope IDs if applicable.
  // For example, "Ethernet" might correspond to scope ID 3 in some cases, depending on your system's configuration.
  const scopeIdMapping: Record<string, number> = {
    Ethernet: 3,
    WiFi: 4,
    Loopback: 1,
  };
  return scopeIdMapping[interfaceName];
}
