import * as dns from 'node:dns';

function isIPv4(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) {
    return false;
  }

  const parts = ip.split('.');
  return parts.every((part) => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

function dnsLookup(hostname: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Use system's default resolver (including local DNS)
    dns.lookup(
      hostname,
      {
        family: 4,
        all: false,
      },
      (err, address) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(address);
      },
    );
  });
}

export async function tryResolveHost(hostname: string): Promise<string> {
  if (isIPv4(hostname)) {
    return hostname;
  }

  // For local DNS, we'll primarily rely on dns.lookup which uses the system resolver
  try {
    return await dnsLookup(hostname);
  } catch (error: any) {
    throw new Error(`Failed to resolve local hostname ${hostname}: ${error?.message}`);
  }
}
