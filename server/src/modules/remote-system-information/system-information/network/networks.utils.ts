import { Systeminformation } from 'ssm-shared-lib';
import * as util from '../utils';

export function splitSectionsNics(lines: string[]) {
  const result: string[][] = [];
  let section: string[] = [];
  lines.forEach(function (line) {
    if (!line.startsWith('\t') && !line.startsWith(' ')) {
      if (section.length) {
        result.push(section);
        section = [];
      }
    }
    section.push(line);
  });
  if (section.length) {
    result.push(section);
  }
  return result;
}

export function parseLinesDarwinNics(
  sections: string[][],
): Systeminformation.NetworkInterfacesData[] {
  const nics: Systeminformation.NetworkInterfacesData[] = [];
  sections.forEach((section) => {
    const nic = {
      iface: '',
      mtu: null,
      mac: '',
      ip6: '',
      ip4: '',
      speed: null,
      type: '',
      operstate: '',
      duplex: '',
      internal: false,
    } as Systeminformation.NetworkInterfacesData;
    const first = section[0];
    nic.iface = first.split(':')[0].trim();
    const parts = first.split('> mtu');
    nic.mtu = parts.length > 1 ? parseInt(parts[1], 10) : null;
    if (isNaN(nic.mtu as number)) {
      nic.mtu = null;
    }
    nic.internal = parts[0].toLowerCase().indexOf('loopback') > -1;
    section.forEach((line) => {
      if (line.trim().startsWith('ether ')) {
        nic.mac = line.split('ether ')[1].toLowerCase().trim();
      }
      if (line.trim().startsWith('inet6 ') && !nic.ip6) {
        nic.ip6 = line.split('inet6 ')[1].toLowerCase().split('%')[0].split(' ')[0];
      }
      if (line.trim().startsWith('inet ') && !nic.ip4) {
        nic.ip4 = line.split('inet ')[1].toLowerCase().split(' ')[0];
      }
    });
    let speed = util.getValue(section, 'link rate');
    nic.speed = speed ? parseFloat(speed) : null;
    if (nic.speed === null) {
      speed = util.getValue(section, 'uplink rate');
      nic.speed = speed ? parseFloat(speed) : null;
      if (nic.speed !== null && speed.toLowerCase().indexOf('gbps') >= 0) {
        nic.speed = nic.speed * 1000;
      }
    } else {
      if (speed.toLowerCase().indexOf('gbps') >= 0) {
        nic.speed = nic.speed * 1000;
      }
    }
    nic.type =
      util.getValue(section, 'type').toLowerCase().indexOf('wi-fi') > -1 ? 'wireless' : 'wired';
    const operstate = util.getValue(section, 'status').toLowerCase();
    nic.operstate = operstate === 'active' ? 'up' : operstate === 'inactive' ? 'down' : 'unknown';
    nic.duplex =
      util.getValue(section, 'media').toLowerCase().indexOf('half-duplex') > -1 ? 'half' : 'full';
    if (nic.ip6 || nic.ip4 || nic.mac) {
      nics.push(nic);
    }
  });
  return nics;
}

export function parseLinesWindowsPerfData(sections: string[]) {
  const perfData: Partial<Systeminformation.NetworkStatsData>[] = [];
  for (const i in sections) {
    if ({}.hasOwnProperty.call(sections, i)) {
      if (sections[i].trim() !== '') {
        const lines = sections[i].trim().split('\r\n');
        perfData.push({
          name: util
            .getValue(lines, 'Name', ':')
            .replace(/[()[\] ]+/g, '')
            .replace(/#|\//g, '_')
            .toLowerCase(),
          rx_bytes: parseInt(util.getValue(lines, 'BytesReceivedPersec', ':'), 10),
          rx_errors: parseInt(util.getValue(lines, 'PacketsReceivedErrors', ':'), 10),
          rx_dropped: parseInt(util.getValue(lines, 'PacketsReceivedDiscarded', ':'), 10),
          tx_bytes: parseInt(util.getValue(lines, 'BytesSentPersec', ':'), 10),
          tx_errors: parseInt(util.getValue(lines, 'PacketsOutboundErrors', ':'), 10),
          tx_dropped: parseInt(util.getValue(lines, 'PacketsOutboundDiscarded', ':'), 10),
        });
      }
    }
  }
  return perfData;
}

export function getProcessName(processes: string[], pid: number) {
  let cmd = '';
  processes.forEach((line) => {
    const parts = line.split(' ');
    const id = parseInt(parts[0], 10) || -1;
    if (id === pid) {
      parts.shift();
      cmd = parts.join(' ').split(':')[0];
    }
  });
  cmd = cmd.split(' -')[0];
  cmd = cmd.split(' /')[0];
  return cmd;
}
