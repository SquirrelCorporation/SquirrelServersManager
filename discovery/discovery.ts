import { exec } from 'child_process';
import util from 'util';
import { parseStringPromise } from 'xml2js';

const execAsync = util.promisify(exec);

interface SSHServerInfo {
  ip: string;
  fqdn?: string;
  port: number;
  service?: string;
  version?: string;
}

export async function discoverSSHServers(subnet: string): Promise<SSHServerInfo[]> {
  const discoveredServers: SSHServerInfo[] = [];

  try {
    // Enhanced nmap command with XML output
    const { stdout, stderr } = await execAsync(`nmap -p 22 --open -sV ${subnet} -oX -`);
    if (stderr) {
      throw new Error(stderr);
    }

    // Parse the XML output using xml2js
    const result = await parseStringPromise(stdout);
    const hosts = result.nmaprun.host;

    // Iterate through the parsed XML to extract detailed device information
    hosts.forEach((host: any) => {
      const ip = host.address[0]['$'].addr;
      const fqdn = host.hostnames[0].hostname ? host.hostnames[0].hostname[0]['$'].name : undefined;
      const ports = host.ports[0].port;

      ports.forEach((port: any) => {
        if (port['$'].portid === '22' && port.state[0]['$'].state === 'open') {
          const serviceInfo = port.service[0]['$'];
          discoveredServers.push({
            ip,
            fqdn,
            port: parseInt(port['$'].portid),
            service: serviceInfo.name,
            version: serviceInfo.version,
          });
        }
      });
    });
  } catch (err: any) {
    console.log(err);
    throw new Error(`Error discovering SSH servers: ${err.message}`);
  }

  return discoveredServers;
}

export default { discoverSSHServers };
