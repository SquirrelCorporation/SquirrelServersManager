// ==================================================================================
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2024
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================

import { NetworkInterfaceInfo } from 'node:os';
import { Systeminformation } from 'ssm-shared-lib';
import PinoLogger from '../../../../logger';
import { RemoteOS } from '../RemoteOS';
import { Callback, RemoteExecutorType, RemoteExecutorTypeWithCallback } from '../types';
import {
  stringReplace,
  stringStartWith,
  stringSubstr,
  stringSubstring,
  stringToLower,
  stringToString,
  stringTrim,
} from '../utils';
import * as util from '../utils';
import { getProcessName, parseLinesDarwinNics, splitSectionsNics } from './networks.utils';

export default class NetworkComponent extends RemoteOS {
  private logger = PinoLogger.child({ component: 'NetworkComponent' });
  private _network: Record<string, Systeminformation.NetworkStatsData & any> = {};
  private _default_iface = '';
  private _ifaces = {};
  private _dhcpNics: string[] = [];
  private _networkInterfaces:
    | Systeminformation.NetworkInterfacesData[]
    | Systeminformation.NetworkInterfacesData = [];
  private _mac = {};
  private pathToIp!: string;

  constructor(
    remoteExecAsync: RemoteExecutorType,
    remoteExecWithCallback: RemoteExecutorTypeWithCallback,
  ) {
    super(remoteExecAsync, remoteExecWithCallback);
  }

  public async getDefaultNetworkInterface() {
    let ifacename = '';
    let ifacenameFirst = '';
    try {
      const ifaces = await this.osNetworkInterfaces();

      let scopeid = 9999;

      // fallback - "first" external interface (sorted by scopeid)
      for (const dev in ifaces) {
        if ({}.hasOwnProperty.call(ifaces, dev)) {
          ifaces?.[dev]?.forEach(function (details) {
            if (details && details.internal === false) {
              ifacenameFirst = ifacenameFirst || dev; // fallback if no scopeid
              if (details.scopeid && details.scopeid < scopeid) {
                ifacename = dev;
                scopeid = details.scopeid;
              }
            }
          });
        }
      }
      ifacename = ifacename || ifacenameFirst || '';

      if (this.platform === 'win32') {
        // https://www.inetdaemon.com/tutorials/internet/ip/routing/default_route.shtml
        /*
        let defaultIp = '';
        const cmd = 'netstat -r';
        const result = await this.execAsync(cmd, util.execOptsWin);
        const lines = result.toString().split(os.EOL);
        lines.forEach(line => {
          line = line.replace(/\s+/g, ' ').trim();
          if (line.indexOf('0.0.0.0 0.0.0.0') > -1 && !(/[a-zA-Z]/.test(line))) {
            const parts = line.split(' ');
            if (parts.length >= 5) {
              defaultIp = parts[parts.length - 2];
            }
          }
        });
        if (defaultIp) {
          for (let dev in ifaces) {
            if ({}.hasOwnProperty.call(ifaces, dev)) {
              ifaces[dev].forEach(function (details) {
                if (details && details.address && details.address === defaultIp) {
                  ifacename = dev;
                }
              });
            }
          }
        }*/
      }
      if (this.platform === 'linux') {
        const cmd = 'ip route 2> /dev/null | grep default';
        const result = await this.execAsync(cmd, util.execOptsLinux);
        const parts = result.toString().split('\n')[0].split(/\s+/);
        if (parts[0] === 'none' && parts[5]) {
          ifacename = parts[5];
        } else if (parts[4]) {
          ifacename = parts[4];
        }

        if (ifacename.indexOf(':') > -1) {
          ifacename = ifacename.split(':')[1].trim();
        }
      }
      if (
        this.platform === 'darwin' ||
        this.platform === 'freebsd' ||
        this.platform === 'openbsd' ||
        this.platform === 'netbsd' ||
        this.platform === 'sunos'
      ) {
        let cmd = '';
        if (this.platform === 'darwin') {
          cmd = "route -n get default 2>/dev/null | grep interface: | awk '{print $2}'";
        }
        if (
          this.platform === 'freebsd' ||
          this.platform === 'openbsd' ||
          this.platform === 'netbsd' ||
          this.platform === 'sunos'
        ) {
          cmd = 'route get 0.0.0.0 | grep interface:';
        }
        const result = await this.execAsync(cmd);
        ifacename = result.toString().split('\n')[0];
        if (ifacename.indexOf(':') > -1) {
          ifacename = ifacename.split(':')[1].trim();
        }
      }
    } catch (e) {
      this.logger.debug(e);
      util.noop();
    }
    if (ifacename) {
      this._default_iface = ifacename;
    }
    return this._default_iface;
  }

  public async getMacAddresses() {
    let iface = '';
    let mac = '';
    const result: Record<string, any> = {};
    if (
      this.platform === 'linux' ||
      this.platform === 'freebsd' ||
      this.platform === 'openbsd' ||
      this.platform === 'netbsd'
    ) {
      if (typeof this.pathToIp === 'undefined') {
        try {
          const lines = (await this.execAsync('which ip', util.execOptsLinux))
            .toString()
            .split('\n');
          if (lines.length && lines[0].indexOf(':') === -1 && lines[0].indexOf('/') === 0) {
            this.pathToIp = lines[0];
          } else {
            this.pathToIp = '';
          }
        } catch (e) {
          this.logger.debug(e);
          this.pathToIp = '';
        }
      }
      try {
        const cmd =
          'export LC_ALL=C; ' +
          (this.pathToIp ? this.pathToIp + ' link show up' : '/sbin/ifconfig') +
          '; unset LC_ALL';
        const res = await this.execAsync(cmd, util.execOptsLinux);
        const lines = res.toString().split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i] && lines[i][0] !== ' ') {
            if (this.pathToIp) {
              const nextline = lines[i + 1].trim().split(' ');
              if (nextline[0] === 'link/ether') {
                iface = lines[i].split(' ')[1];
                iface = iface.slice(0, iface.length - 1);
                mac = nextline[1];
              }
            } else {
              iface = lines[i].split(' ')[0];
              mac = lines[i].split('HWaddr ')[1];
            }

            if (iface && mac) {
              result[iface] = mac.trim();
              iface = '';
              mac = '';
            }
          }
        }
      } catch (e) {
        this.logger.debug(e);
        util.noop();
      }
    }
    if (this.platform === 'darwin') {
      try {
        const cmd = '/sbin/ifconfig';
        const res = await this.execAsync(cmd);
        const lines = res.toString().split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i] && lines[i][0] !== '\t' && lines[i].indexOf(':') > 0) {
            iface = lines[i].split(':')[0];
          } else if (lines[i].indexOf('\tether ') === 0) {
            mac = lines[i].split('\tether ')[1];
            if (iface && mac) {
              result[iface] = mac.trim();
              iface = '';
              mac = '';
            }
          }
        }
      } catch (e) {
        this.logger.debug(e);
        util.noop();
      }
    }
    return result;
  }

  public networkInterfaceDefault(callback?: Callback) {
    return new Promise((resolve) => {
      process.nextTick(async () => {
        const result = await this.getDefaultNetworkInterface();
        if (callback) {
          callback(result);
        }
        resolve(result);
      });
    });
  }

  // --------------------------
  // NET - interfaces

  private parseLinesWindowsNics(sections: string[], nconfigsections: string[]) {
    const nics: Partial<Systeminformation.NetworkInterfacesData>[] = [];
    for (const i in sections) {
      try {
        if ({}.hasOwnProperty.call(sections, i)) {
          if (sections[i].trim() !== '') {
            const lines = sections[i].trim().split('\r\n');
            let linesNicConfig: string[] | null = null;
            try {
              linesNicConfig =
                nconfigsections && nconfigsections[i]
                  ? nconfigsections[i].trim().split('\r\n')
                  : [];
            } catch (e) {
              this.logger.debug(e);
              util.noop();
            }
            const netEnabled = util.getValue(lines, 'NetEnabled', ':');
            let adapterType =
              util.getValue(lines, 'AdapterTypeID', ':') === '9' ? 'wireless' : 'wired';
            const ifacename = util
              .getValue(lines, 'Name', ':')
              .replace(/\]/g, ')')
              .replace(/\[/g, '(');
            const iface = util
              .getValue(lines, 'NetConnectionID', ':')
              .replace(/\]/g, ')')
              .replace(/\[/g, '(');
            if (
              ifacename.toLowerCase().indexOf('wi-fi') >= 0 ||
              ifacename.toLowerCase().indexOf('wireless') >= 0
            ) {
              adapterType = 'wireless';
            }
            if (netEnabled !== '') {
              const speed = parseInt(util.getValue(lines, 'speed', ':').trim(), 10) / 1000000;
              nics.push({
                mac: util.getValue(lines, 'MACAddress', ':').toLowerCase(),
                dhcp:
                  util.getValue(linesNicConfig as any[], 'dhcpEnabled', ':').toLowerCase() ===
                  'true',
                name: ifacename,
                iface,
                netEnabled: netEnabled === 'TRUE',
                speed: isNaN(speed) ? null : speed,
                operstate: util.getValue(lines, 'NetConnectionStatus', ':') === '2' ? 'up' : 'down',
                type: adapterType,
              });
            }
          }
        }
      } catch (e) {
        this.logger.debug(e);
        util.noop();
      }
    }
    return nics;
  }

  public getWindowsNics(): Promise<any[]> {
    return new Promise((resolve) => {
      process.nextTick(async () => {
        resolve([]);
        /*
        let cmd = 'Get-CimInstance Win32_NetworkAdapter | fl *' + '; echo \'#-#-#-#\';';
        cmd += 'Get-CimInstance Win32_NetworkAdapterConfiguration | fl DHCPEnabled' + '';
        try {
          util.powerShell(cmd).then((data) => {
            data = data.split('#-#-#-#');
            const nsections = (data[0] || '').split(/\n\s*\n/);
            const nconfigsections = (data[1] || '').split(/\n\s*\n/);
            resolve(parseLinesWindowsNics(nsections, nconfigsections));
          });
        } catch (e) {
          resolve([]);
        }

      */
      });
    });
  }

  private getWindowsDNSsuffixes() {
    /*
const iface = {};

const dnsSuffixes = {
  primaryDNS: '',
  exitCode: 0,
  ifaces: [],
};
try {
  const ipconfig = await this.execAsync('ipconfig /all', util.execOptsWin);
  const ipconfigArray = ipconfig.split('\r\n\r\n');

  ipconfigArray.forEach((element, index) => {

    if (index == 1) {
      const longPrimaryDNS = element.split('\r\n').filter((element) => {
        return element.toUpperCase().includes('DNS');
      });
      const primaryDNS = longPrimaryDNS[0].substring(longPrimaryDNS[0].lastIndexOf(':') + 1);
      dnsSuffixes.primaryDNS = primaryDNS.trim();
      if (!dnsSuffixes.primaryDNS) { dnsSuffixes.primaryDNS = 'Not defined'; }
    }
    if (index > 1) {
      if (index % 2 == 0) {
        const name = element.substring(element.lastIndexOf(' ') + 1).replace(':', '');
        iface.name = name;
      } else {
        const connectionSpecificDNS = element.split('\r\n').filter((element) => {
          return element.toUpperCase().includes('DNS');
        });
        const dnsSuffix = connectionSpecificDNS[0].substring(connectionSpecificDNS[0].lastIndexOf(':') + 1);
        iface.dnsSuffix = dnsSuffix.trim();
        dnsSuffixes.ifaces.push(iface);
        iface = {};
      }
    }
  });

  return dnsSuffixes;
} catch (error) {
  return {
    primaryDNS: '',
    exitCode: 0,
    ifaces: [],
  };
}

*/
    return {
      primaryDNS: '',
      exitCode: 0,
      ifaces: [],
    };
  }

  private getWindowsIfaceDNSsuffix(ifaces: any[], ifacename: string) {
    let dnsSuffix = '';
    // Adding (.) to ensure ifacename compatibility when duplicated iface-names
    const interfaceName = ifacename + '.';
    try {
      const connectionDnsSuffix = ifaces
        .filter((iface) => {
          return interfaceName.includes(iface.name + '.');
        })
        .map((iface) => iface.dnsSuffix);
      if (connectionDnsSuffix[0]) {
        dnsSuffix = connectionDnsSuffix[0];
      }
      if (!dnsSuffix) {
        dnsSuffix = '';
      }
      return dnsSuffix;
    } catch (e) {
      this.logger.debug(e);
      return 'Unknown';
    }
  }

  private async getWindowsWiredProfilesInformation() {
    /*try {
      const result = await this.execAsync('netsh lan show profiles', util.execOptsWin);
      const profileList = result.split('\r\nProfile on interface');
      return profileList;
    } catch (error) {
      if (error.status === 1 && error.stdout.includes('AutoConfig')) {
        return 'Disabled';
      }
      return [];
    }

     */
    return [];
  }

  private async getWindowsWirelessIfaceSSID(interfaceName: string): Promise<string | 'Unknown'> {
    try {
      const result = await this.execAsync(
        `netsh wlan show  interface name="${interfaceName}" | findstr "SSID"`,
        util.execOptsWin,
      );
      const SSID = result.split('\r\n').shift();
      const parseSSID = SSID?.split(':')?.pop()?.trim();
      return parseSSID || 'Unknown';
    } catch (e) {
      this.logger.debug(e);
      return 'Unknown';
    }
  }

  private async getWindowsIEEE8021x(
    connectionType: string,
    iface: string,
    ifaces: string[] | 'Disabled',
  ) {
    const i8021x = {
      state: 'Unknown',
      protocol: 'Unknown',
    };

    if (ifaces === 'Disabled') {
      i8021x.state = 'Disabled';
      i8021x.protocol = 'Not defined';
      return i8021x;
    }

    if (connectionType === 'wired' && ifaces.length > 0) {
      try {
        // Get 802.1x information by interface name
        const iface8021xInfo = ifaces.find((element) => {
          return element.includes(iface + '\r\n');
        });
        const arrayIface8021xInfo = iface8021xInfo?.split('\r\n');
        const state8021x = arrayIface8021xInfo?.find((element) => {
          return element.includes('802.1x');
        });

        if (state8021x?.includes('Disabled')) {
          i8021x.state = 'Disabled';
          i8021x.protocol = 'Not defined';
        } else if (state8021x?.includes('Enabled')) {
          const protocol8021x = arrayIface8021xInfo?.find((element) => {
            return element.includes('EAP');
          });
          i8021x.protocol = protocol8021x?.split(':').pop() as string;
          i8021x.state = 'Enabled';
        }
      } catch (e) {
        this.logger.debug(e);
        return i8021x;
      }
    } else if (connectionType === 'wireless') {
      let i8021xState = '';
      let i8021xProtocol = '';

      try {
        const SSID = await this.getWindowsWirelessIfaceSSID(iface);
        if (SSID !== 'Unknown') {
          let ifaceSanitized = '';
          const s = util.isPrototypePolluted() ? '---' : util.sanitizeShellString(SSID);
          const l = Math.min(s.length, 32);

          for (let i = 0; i <= l; i++) {
            if (s[i] !== undefined) {
              ifaceSanitized = ifaceSanitized + s[i];
            }
          }
          i8021xState = await this.execAsync(
            `netsh wlan show profiles "${ifaceSanitized}" | findstr "802.1X"`,
            util.execOptsWin,
          );
          i8021xProtocol = await this.execAsync(
            `netsh wlan show profiles "${ifaceSanitized}" | findstr "EAP"`,
            util.execOptsWin,
          );
        }

        if (i8021xState.includes(':') && i8021xProtocol.includes(':')) {
          i8021x.state = i8021xState.split(':').pop() as string;
          i8021x.protocol = i8021xProtocol.split(':').pop() as string;
        }
      } catch (error: any) {
        if (error?.status === 1 && error?.stdout.includes('AutoConfig')) {
          i8021x.state = 'Disabled';
          i8021x.protocol = 'Not defined';
        }
        return i8021x;
      }
    }
    return i8021x;
  }

  private async getDarwinNics() {
    const cmd = '/sbin/ifconfig -v';
    try {
      const lines = (await this.execAsync(cmd, { maxBuffer: 1024 * 20000 })).toString().split('\n');
      const nsections = splitSectionsNics(lines);
      return parseLinesDarwinNics(nsections);
    } catch (e) {
      this.logger.debug(e);
      return [];
    }
  }

  private async getLinuxIfaceConnectionName(interfaceName: string) {
    const cmd = `nmcli device status 2>/dev/null | grep ${interfaceName}`;

    try {
      const result = (await this.execAsync(cmd, util.execOptsLinux)).toString();
      const resultFormat = result.replace(/\s+/g, ' ').trim();
      const connectionNameLines = resultFormat.split(' ').slice(3);
      const connectionName = connectionNameLines.join(' ');
      return connectionName !== '--' ? connectionName : '';
    } catch (e) {
      this.logger.debug(e);
      return '';
    }
  }

  private async checkLinuxDCHPInterfaces(file: string) {
    let result: string[] = [];
    try {
      const cmd = `cat ${file} 2> /dev/null | grep 'iface\\|source'`;
      const lines = (await this.execAsync(cmd, util.execOptsLinux)).toString().split('\n');

      for (const line of lines) {
        const parts = line.replace(/\s+/g, ' ').trim().split(' ');
        if (parts.length >= 4) {
          if (
            line.toLowerCase().indexOf(' inet ') >= 0 &&
            line.toLowerCase().indexOf('dhcp') >= 0
          ) {
            result.push(parts[1]);
          }
        }
        if (line.toLowerCase().includes('source')) {
          const file = line.split(' ')[1];
          result = result.concat(await this.checkLinuxDCHPInterfaces(file));
        }
      }
    } catch (e) {
      this.logger.debug(e);
      util.noop();
    }
    return result;
  }

  private async getLinuxDHCPNics() {
    // alternate methods getting interfaces using DHCP
    const cmd = 'ip a 2> /dev/null';
    let result: string[] = [];
    try {
      const lines = (await this.execAsync(cmd, util.execOptsLinux)).toString().split('\n');
      const nsections = splitSectionsNics(lines);
      result = this.parseLinuxDHCPNics(nsections);
    } catch (e) {
      this.logger.debug(e);
      util.noop();
    }
    try {
      result = await this.checkLinuxDCHPInterfaces('/etc/network/interfaces');
    } catch (e) {
      this.logger.debug(e);
      util.noop();
    }
    return result;
  }

  private parseLinuxDHCPNics(sections: string[][]) {
    const result: string[] = [];
    if (sections && sections.length) {
      sections.forEach((lines) => {
        if (lines && lines.length) {
          const parts = lines[0].split(':');
          if (parts.length > 2) {
            for (const line of lines) {
              if (line.indexOf(' inet ') >= 0 && line.indexOf(' dynamic ') >= 0) {
                const parts2 = line.split(' ');
                const nic = parts2[parts2.length - 1].trim();
                result.push(nic);
                break;
              }
            }
          }
        }
      });
    }
    return result;
  }

  private async getLinuxIfaceDHCPstatus(
    iface: string,
    connectionName: string | undefined,
    DHCPNics: string[],
  ) {
    let result = false;
    if (connectionName) {
      const cmd = `nmcli connection show "${connectionName}" 2>/dev/null | grep ipv4.method;`;
      try {
        const lines = (await this.execAsync(cmd, util.execOptsLinux)).toString();
        const resultFormat = lines.replace(/\s+/g, ' ').trim();

        const dhcStatus = resultFormat.split(' ').slice(1).toString();
        switch (dhcStatus) {
          case 'auto':
            result = true;
            break;

          default:
            result = false;
            break;
        }
        return result;
      } catch (e) {
        this.logger.debug(e);
        return DHCPNics.indexOf(iface) >= 0;
      }
    } else {
      return DHCPNics.indexOf(iface) >= 0;
    }
  }

  private async getDarwinIfaceDHCPstatus(iface: string) {
    let result = false;
    const cmd = `ipconfig getpacket "${iface}" 2>/dev/null | grep lease_time;`;
    try {
      const lines = (await this.execAsync(cmd)).toString().split('\n');
      if (lines.length && lines[0].startsWith('lease_time')) {
        result = true;
      }
    } catch (e) {
      this.logger.debug(e);
      util.noop();
    }
    return result;
  }

  private async getLinuxIfaceDNSsuffix(connectionName?: string) {
    if (connectionName) {
      const cmd = `nmcli connection show "${connectionName}" 2>/dev/null | grep ipv4.dns-search;`;
      try {
        const result = (await this.execAsync(cmd, util.execOptsLinux)).toString();
        const resultFormat = result.replace(/\s+/g, ' ').trim();
        const dnsSuffix = resultFormat.split(' ').slice(1).toString();
        return dnsSuffix === '--' ? 'Not defined' : dnsSuffix;
      } catch (e) {
        this.logger.debug(e);
        return 'Unknown';
      }
    } else {
      return 'Unknown';
    }
  }

  private async getLinuxIfaceIEEE8021xAuth(connectionName?: string) {
    if (connectionName) {
      const cmd = `nmcli connection show "${connectionName}" 2>/dev/null | grep 802-1x.eap;`;
      try {
        const result = (await this.execAsync(cmd, util.execOptsLinux)).toString();
        const resultFormat = result.replace(/\s+/g, ' ').trim();
        const authenticationProtocol = resultFormat.split(' ').slice(1).toString();

        return authenticationProtocol === '--' ? '' : authenticationProtocol;
      } catch (e) {
        this.logger.debug(e);
        return 'Not defined';
      }
    } else {
      return 'Not defined';
    }
  }

  private getLinuxIfaceIEEE8021xState(authenticationProtocol?: string) {
    if (authenticationProtocol) {
      if (authenticationProtocol === 'Not defined') {
        return 'Disabled';
      }
      return 'Enabled';
    } else {
      return 'Unknown';
    }
  }

  private testVirtualNic(iface: string, ifaceName: string, mac?: any) {
    const virtualMacs = [
      '00:00:00:00:00:00',
      '00:03:FF',
      '00:05:69',
      '00:0C:29',
      '00:0F:4B',
      '00:13:07',
      '00:13:BE',
      '00:15:5d',
      '00:16:3E',
      '00:1C:42',
      '00:21:F6',
      '00:24:0B',
      '00:50:56',
      '00:A0:B1',
      '00:E0:C8',
      '08:00:27',
      '0A:00:27',
      '18:92:2C',
      '16:DF:49',
      '3C:F3:92',
      '54:52:00',
      'FC:15:97',
    ];
    if (mac) {
      return (
        virtualMacs.filter((item) => {
          return mac.toUpperCase().toUpperCase().startsWith(item.substring(0, mac.length));
        }).length > 0 ||
        iface.toLowerCase().indexOf(' virtual ') > -1 ||
        ifaceName.toLowerCase().indexOf(' virtual ') > -1 ||
        iface.toLowerCase().indexOf('vethernet ') > -1 ||
        ifaceName.toLowerCase().indexOf('vethernet ') > -1 ||
        iface.toLowerCase().startsWith('veth') ||
        ifaceName.toLowerCase().startsWith('veth') ||
        iface.toLowerCase().startsWith('vboxnet') ||
        ifaceName.toLowerCase().startsWith('vboxnet')
      );
    } else {
      return false;
    }
  }

  public networkInterfaces(
    callback?: Callback | null,
    rescan?: boolean,
    defaultString?: string,
  ): Promise<Systeminformation.NetworkInterfacesData[] | Systeminformation.NetworkInterfacesData> {
    if (typeof callback === 'string') {
      defaultString = callback;
      rescan = true;
      callback = null;
    }

    if (typeof callback === 'boolean') {
      rescan = callback;
      callback = null;
      defaultString = '';
    }
    if (typeof rescan === 'undefined') {
      rescan = true;
    }
    defaultString = defaultString || '';
    defaultString = '' + defaultString;

    return new Promise((resolve) => {
      process.nextTick(async () => {
        const ifaces: Partial<NodeJS.Dict<NetworkInterfaceInfo[]>> =
          await this.osNetworkInterfaces();
        let result:
          | Systeminformation.NetworkInterfacesData[]
          | Systeminformation.NetworkInterfacesData = [];
        let nics: Systeminformation.NetworkInterfacesData[] = [];
        let dnsSuffixes: Record<string, any> = [];
        let nics8021xInfo = [];
        // seperate handling in OSX
        if (
          this.platform === 'darwin' ||
          this.platform === 'freebsd' ||
          this.platform === 'openbsd' ||
          this.platform === 'netbsd'
        ) {
          if (JSON.stringify(ifaces) === JSON.stringify(this._ifaces) && !rescan) {
            // no changes - just return object
            result = this._networkInterfaces;

            if (callback) {
              callback(result);
            }
            resolve(result);
          } else {
            const defaultInterface = await this.getDefaultNetworkInterface();
            this._ifaces = JSON.parse(JSON.stringify(ifaces));

            nics = await this.getDarwinNics();

            for (const nic of nics) {
              if ({}.hasOwnProperty.call(ifaces, nic.iface)) {
                ifaces?.[nic.iface]?.forEach((details) => {
                  if (details.family === 'IPv4' || parseInt(details.family) === 4) {
                    nic.ip4subnet = details.netmask;
                  }
                  if (details.family === 'IPv6' || parseInt(details.family) === 6) {
                    nic.ip6subnet = details.netmask;
                  }
                });
              }

              let ifaceSanitized = '';
              const s = util.isPrototypePolluted() ? '---' : util.sanitizeShellString(nic.iface);
              const l = Math.min(s.length, 2000);
              for (let i = 0; i <= l; i++) {
                if (s[i] !== undefined) {
                  ifaceSanitized = ifaceSanitized + s[i];
                }
              }

              (result as Systeminformation.NetworkInterfacesData[]).push({
                iface: nic.iface,
                ifaceName: nic.iface,
                default: nic.iface === defaultInterface,
                ip4: nic.ip4,
                ip4subnet: nic.ip4subnet || '',
                ip6: nic.ip6,
                ip6subnet: nic.ip6subnet || '',
                mac: nic.mac,
                internal: nic.internal,
                virtual: nic.internal ? false : this.testVirtualNic(nic.iface, nic.iface, nic.mac),
                operstate: nic.operstate,
                type: nic.type,
                duplex: nic.duplex,
                mtu: nic.mtu,
                speed: nic.speed,
                dhcp: await this.getDarwinIfaceDHCPstatus(ifaceSanitized),
                dnsSuffix: '',
                ieee8021xAuth: '',
                ieee8021xState: '',
                carrierChanges: 0,
              });
            }
            this._networkInterfaces = result;
            if (defaultString.toLowerCase().indexOf('default') >= 0) {
              result = result.filter((item) => item.default);
              if (result.length > 0) {
                result = result[0];
              } else {
                result = [];
              }
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        }
        if (this.platform === 'linux') {
          if (JSON.stringify(ifaces) === JSON.stringify(this._ifaces) && !rescan) {
            // no changes - just return object
            result = this._networkInterfaces;
            if (callback) {
              callback(result);
            }
            resolve(result);
          } else {
            this._ifaces = JSON.parse(JSON.stringify(ifaces));
            this._dhcpNics = await this.getLinuxDHCPNics();
            const defaultInterface = await this.getDefaultNetworkInterface();
            for (const dev in ifaces) {
              let ip4 = '';
              let ip4subnet = '';
              let ip6 = '';
              let ip6subnet = '';
              let mac = '';
              let duplex = '';
              let mtu: string | number = '';
              let speed: number | null = null;
              let carrierChanges = 0;
              let dhcp = false;
              let dnsSuffix = '';
              let ieee8021xAuth = '';
              let ieee8021xState = '';
              let type = '';

              if ({}.hasOwnProperty.call(ifaces, dev)) {
                const ifaceName = dev;
                if (ifaces?.[dev]) {
                  for (const details of ifaces[dev]) {
                    if (details.family === 'IPv4' || parseInt(details.family) === 4) {
                      ip4 = details.address;
                      ip4subnet = details.netmask;
                    }
                    if (details.family === 'IPv6' || parseInt(details.family) === 6) {
                      if (!ip6 || ip6.match(/^fe80::/i)) {
                        ip6 = details.address;
                        ip6subnet = details.netmask;
                      }
                    }
                    mac = details.mac;
                  }
                }
                const iface = dev.split(':')[0].trim().toLowerCase();
                let ifaceSanitized = '';
                const s = util.isPrototypePolluted() ? '---' : util.sanitizeShellString(iface);
                const l = Math.min(s.length, 2000);
                for (let i = 0; i <= l; i++) {
                  if (s[i] !== undefined) {
                    ifaceSanitized = ifaceSanitized + s[i];
                  }
                }
                const cmd = `echo -n "addr_assign_type: "; cat /sys/class/net/${ifaceSanitized}/addr_assign_type 2>/dev/null; echo;
            echo -n "address: "; cat /sys/class/net/${ifaceSanitized}/address 2>/dev/null; echo;
            echo -n "addr_len: "; cat /sys/class/net/${ifaceSanitized}/addr_len 2>/dev/null; echo;
            echo -n "broadcast: "; cat /sys/class/net/${ifaceSanitized}/broadcast 2>/dev/null; echo;
            echo -n "carrier: "; cat /sys/class/net/${ifaceSanitized}/carrier 2>/dev/null; echo;
            echo -n "carrier_changes: "; cat /sys/class/net/${ifaceSanitized}/carrier_changes 2>/dev/null; echo;
            echo -n "dev_id: "; cat /sys/class/net/${ifaceSanitized}/dev_id 2>/dev/null; echo;
            echo -n "dev_port: "; cat /sys/class/net/${ifaceSanitized}/dev_port 2>/dev/null; echo;
            echo -n "dormant: "; cat /sys/class/net/${ifaceSanitized}/dormant 2>/dev/null; echo;
            echo -n "duplex: "; cat /sys/class/net/${ifaceSanitized}/duplex 2>/dev/null; echo;
            echo -n "flags: "; cat /sys/class/net/${ifaceSanitized}/flags 2>/dev/null; echo;
            echo -n "gro_flush_timeout: "; cat /sys/class/net/${ifaceSanitized}/gro_flush_timeout 2>/dev/null; echo;
            echo -n "ifalias: "; cat /sys/class/net/${ifaceSanitized}/ifalias 2>/dev/null; echo;
            echo -n "ifindex: "; cat /sys/class/net/${ifaceSanitized}/ifindex 2>/dev/null; echo;
            echo -n "iflink: "; cat /sys/class/net/${ifaceSanitized}/iflink 2>/dev/null; echo;
            echo -n "link_mode: "; cat /sys/class/net/${ifaceSanitized}/link_mode 2>/dev/null; echo;
            echo -n "mtu: "; cat /sys/class/net/${ifaceSanitized}/mtu 2>/dev/null; echo;
            echo -n "netdev_group: "; cat /sys/class/net/${ifaceSanitized}/netdev_group 2>/dev/null; echo;
            echo -n "operstate: "; cat /sys/class/net/${ifaceSanitized}/operstate 2>/dev/null; echo;
            echo -n "proto_down: "; cat /sys/class/net/${ifaceSanitized}/proto_down 2>/dev/null; echo;
            echo -n "speed: "; cat /sys/class/net/${ifaceSanitized}/speed 2>/dev/null; echo;
            echo -n "tx_queue_len: "; cat /sys/class/net/${ifaceSanitized}/tx_queue_len 2>/dev/null; echo;
            echo -n "type: "; cat /sys/class/net/${ifaceSanitized}/type 2>/dev/null; echo;
            echo -n "wireless: "; cat /proc/net/wireless 2>/dev/null | grep ${ifaceSanitized}; echo;
            echo -n "wirelessspeed: "; iw dev ${ifaceSanitized} link 2>&1 | grep bitrate; echo;`;

                let lines: string[] = [];
                try {
                  lines = (await this.execAsync(cmd, util.execOptsLinux)).toString().split('\n');
                  const connectionName = await this.getLinuxIfaceConnectionName(ifaceSanitized);
                  dhcp = await this.getLinuxIfaceDHCPstatus(
                    ifaceSanitized,
                    connectionName,
                    this._dhcpNics,
                  );
                  dnsSuffix = await this.getLinuxIfaceDNSsuffix(connectionName);
                  ieee8021xAuth = await this.getLinuxIfaceIEEE8021xAuth(connectionName);
                  ieee8021xState = this.getLinuxIfaceIEEE8021xState(ieee8021xAuth);
                } catch (e) {
                  this.logger.debug(e);
                  util.noop();
                }
                duplex = util.getValue(lines, 'duplex');
                duplex = duplex.startsWith('cat') ? '' : duplex;
                mtu = parseInt(util.getValue(lines, 'mtu'), 10);
                let myspeed = parseInt(util.getValue(lines, 'speed'), 10);
                speed = isNaN(myspeed) ? null : myspeed;
                const wirelessspeed = util.getValue(lines, 'wirelessspeed').split('tx bitrate: ');
                if (speed === null && wirelessspeed.length === 2) {
                  myspeed = parseFloat(wirelessspeed[1]);
                  speed = isNaN(myspeed) ? null : myspeed;
                }
                carrierChanges = parseInt(util.getValue(lines, 'carrier_changes'), 10);
                const operstate = util.getValue(lines, 'operstate');
                type =
                  operstate === 'up'
                    ? util.getValue(lines, 'wireless').trim()
                      ? 'wireless'
                      : 'wired'
                    : 'unknown';
                if (ifaceSanitized === 'lo' || ifaceSanitized.startsWith('bond')) {
                  type = 'virtual';
                }

                let internal = ifaces[dev] && ifaces[dev][0] ? ifaces[dev][0].internal : false;
                if (
                  dev.toLowerCase().indexOf('loopback') > -1 ||
                  ifaceName.toLowerCase().indexOf('loopback') > -1
                ) {
                  internal = true;
                }
                const virtual = internal ? false : this.testVirtualNic(dev, ifaceName, mac);
                (result as Systeminformation.NetworkInterfacesData[]).push({
                  iface: ifaceSanitized,
                  ifaceName,
                  default: iface === defaultInterface,
                  ip4,
                  ip4subnet,
                  ip6,
                  ip6subnet,
                  mac,
                  internal,
                  virtual,
                  operstate,
                  type,
                  duplex,
                  mtu,
                  speed,
                  dhcp,
                  dnsSuffix,
                  ieee8021xAuth,
                  ieee8021xState,
                  carrierChanges,
                });
              }
            }
            this._networkInterfaces = result;
            if (defaultString.toLowerCase().indexOf('default') >= 0) {
              result = (result as Systeminformation.NetworkInterfacesData[]).filter(
                (item) => item.default,
              );
              if (result.length > 0) {
                result = result[0];
              } else {
                result = [];
              }
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        }
        if (this.platform === 'win32') {
          if (JSON.stringify(ifaces) === JSON.stringify(this._ifaces) && !rescan) {
            // no changes - just return object
            result = this._networkInterfaces;

            if (callback) {
              callback(result);
            }
            resolve(result);
          } else {
            this._ifaces = JSON.parse(JSON.stringify(ifaces));
            const defaultInterface = await this.getDefaultNetworkInterface();

            this.getWindowsNics().then(async (nics) => {
              nics.forEach((nic) => {
                let found = false;
                Object.keys(ifaces).forEach((key) => {
                  if (!found) {
                    ifaces?.[key]?.forEach((value) => {
                      if (Object.keys(value).indexOf('mac') >= 0) {
                        found = value['mac'] === nic.mac;
                      }
                    });
                  }
                });

                if (!found) {
                  ifaces[nic.name] = [{ mac: nic.mac } as NetworkInterfaceInfo];
                }
              });
              nics8021xInfo = await this.getWindowsWiredProfilesInformation();
              dnsSuffixes = this.getWindowsDNSsuffixes();
              for (const dev in ifaces) {
                let ifaceSanitized = '';
                const s = util.isPrototypePolluted() ? '---' : util.sanitizeShellString(dev);
                const l = Math.min(s.length, 2000);
                for (let i = 0; i <= l; i++) {
                  if (s[i] !== undefined) {
                    ifaceSanitized = ifaceSanitized + s[i];
                  }
                }

                let iface = dev;
                let ip4 = '';
                let ip4subnet = '';
                let ip6 = '';
                let ip6subnet = '';
                let mac = '';
                const duplex = '';
                const mtu: number = 0;
                let speed = null;
                const carrierChanges = 0;
                let operstate = 'down';
                let dhcp = false;
                let dnsSuffix = '';
                let ieee8021xAuth = '';
                let ieee8021xState = '';
                let type = '';

                if ({}.hasOwnProperty.call(ifaces, dev)) {
                  let ifaceName = dev;
                  if (ifaces?.[dev]) {
                    for (const details of ifaces[dev]) {
                      if (details.family === 'IPv4' || parseInt(details.family) === 4) {
                        ip4 = details.address;
                        ip4subnet = details.netmask;
                      }
                      if (details.family === 'IPv6' || parseInt(details.family) === 6) {
                        if (!ip6 || ip6.match(/^fe80::/i)) {
                          ip6 = details.address;
                          ip6subnet = details.netmask;
                        }
                      }
                      mac = details.mac;
                    }
                  }
                  dnsSuffix = this.getWindowsIfaceDNSsuffix(dnsSuffixes.ifaces, ifaceSanitized);
                  let foundFirst = false;
                  nics.forEach((detail) => {
                    if (detail.mac === mac && !foundFirst) {
                      iface = detail.iface || iface;
                      ifaceName = detail.name;
                      dhcp = detail.dhcp;
                      operstate = detail.operstate;
                      speed = operstate === 'up' ? detail.speed : 0;
                      type = detail.type;
                      foundFirst = true;
                    }
                  });

                  if (
                    dev.toLowerCase().indexOf('wlan') >= 0 ||
                    ifaceName.toLowerCase().indexOf('wlan') >= 0 ||
                    ifaceName.toLowerCase().indexOf('802.11n') >= 0 ||
                    ifaceName.toLowerCase().indexOf('wireless') >= 0 ||
                    ifaceName.toLowerCase().indexOf('wi-fi') >= 0 ||
                    ifaceName.toLowerCase().indexOf('wifi') >= 0
                  ) {
                    type = 'wireless';
                  }

                  const IEEE8021x = await this.getWindowsIEEE8021x(
                    type,
                    ifaceSanitized,
                    nics8021xInfo,
                  );
                  ieee8021xAuth = IEEE8021x.protocol;
                  ieee8021xState = IEEE8021x.state;
                  let internal = ifaces[dev] && ifaces[dev][0] ? ifaces[dev][0].internal : false;
                  if (
                    dev.toLowerCase().indexOf('loopback') > -1 ||
                    ifaceName.toLowerCase().indexOf('loopback') > -1
                  ) {
                    internal = true;
                  }
                  const virtual = internal ? false : this.testVirtualNic(dev, ifaceName, mac);
                  (result as Systeminformation.NetworkInterfacesData[]).push({
                    iface,
                    ifaceName,
                    default: iface === defaultInterface,
                    ip4,
                    ip4subnet,
                    ip6,
                    ip6subnet,
                    mac,
                    internal,
                    virtual,
                    operstate,
                    type,
                    duplex,
                    mtu,
                    speed,
                    dhcp,
                    dnsSuffix,
                    ieee8021xAuth,
                    ieee8021xState,
                    carrierChanges,
                  });
                }
              }
              this._networkInterfaces = result;
              if (defaultString.toLowerCase().indexOf('default') >= 0) {
                result = (result as Systeminformation.NetworkInterfacesData[]).filter(
                  (item) => item.default,
                );
                if (result.length > 0) {
                  result = result[0];
                } else {
                  result = [];
                }
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            });
          }
        }
      });
    });
  }

  // --------------------------
  // NET - Speed

  private calcNetworkSpeed(
    iface: string, // Define as a key of the expected type
    rx_bytes: number,
    tx_bytes: number,
    operstate: string,
    rx_dropped: number,
    rx_errors: number,
    tx_dropped: number,
    tx_errors: number,
  ) {
    const result = {
      iface,
      operstate,
      rx_bytes,
      rx_dropped,
      rx_errors,
      tx_bytes,
      tx_dropped,
      tx_errors,
      rx_sec: null,
      tx_sec: null,
      ms: 0,
    } as Systeminformation.NetworkStatsData;

    if (this._network[iface] && this._network[iface].ms) {
      result.ms = Date.now() - this._network[iface].ms;
      result.rx_sec =
        rx_bytes - this._network[iface].rx_bytes >= 0
          ? (rx_bytes - this._network[iface].rx_bytes) / (result.ms / 1000)
          : 0;
      result.tx_sec =
        tx_bytes - this._network[iface].tx_bytes >= 0
          ? (tx_bytes - this._network[iface].tx_bytes) / (result.ms / 1000)
          : 0;
      this._network[iface].rx_bytes = rx_bytes;
      this._network[iface].tx_bytes = tx_bytes;
      this._network[iface].rx_sec = result.rx_sec;
      this._network[iface].tx_sec = result.tx_sec;
      this._network[iface].ms = Date.now();
      this._network[iface].last_ms = result.ms;
      this._network[iface].operstate = operstate;
    } else {
      if (!this._network[iface]) {
        this._network[iface] = {};
      }
      this._network[iface].rx_bytes = rx_bytes;
      this._network[iface].tx_bytes = tx_bytes;
      this._network[iface].rx_sec = null;
      this._network[iface].tx_sec = null;
      this._network[iface].ms = Date.now();
      this._network[iface].last_ms = 0;
      this._network[iface].operstate = operstate;
    }
    return result;
  }

  public networkStats(ifaces: any, callback?: Callback) {
    let ifacesArray: string[] = [];

    return new Promise((resolve) => {
      process.nextTick(async () => {
        // fallback - if only callback is given
        if (util.isFunction(ifaces) && !callback) {
          callback = ifaces;
          ifacesArray = [await this.getDefaultNetworkInterface()];
        } else {
          if (typeof ifaces !== 'string' && ifaces !== undefined) {
            if (callback) {
              callback([]);
            }
            return resolve([]);
          }
          ifaces = ifaces || (await this.getDefaultNetworkInterface());

          try {
            const customPrototype = {
              replace: stringReplace,
              toLowerCase: stringToLower,
              toString: stringToString,
              substr: stringSubstr,
              substring: stringSubstring,
              trim: stringTrim,
              startsWith: stringStartWith,
            };

            Object.setPrototypeOf(
              ifaces,
              Object.assign(Object.create(Object.getPrototypeOf(ifaces)), customPrototype),
            );
          } catch (e) {
            this.logger.debug(e);
            Object.setPrototypeOf(ifaces, util.stringObj);
          }

          ifaces = ifaces.trim().toLowerCase().replace(/,+/g, '|');
          ifacesArray = ifaces.split('|');
        }

        const result: Systeminformation.NetworkStatsData[] = [];

        const workload: Promise<any>[] = [];
        if (ifacesArray.length && ifacesArray[0].trim() === '*') {
          ifacesArray = [];
          this.networkInterfaces(undefined, false).then((allIFaces) => {
            for (const iface of allIFaces as Systeminformation.NetworkInterfacesData[]) {
              ifacesArray.push(iface.iface);
            }
            this.networkStats(ifacesArray.join(',')).then((result) => {
              if (callback) {
                callback(result);
              }
              resolve(result);
            });
          });
        } else {
          for (const iface of ifacesArray) {
            workload.push(this.networkStatsSingle(iface.trim()));
          }
          if (workload.length) {
            Promise.all(workload).then((data) => {
              if (callback) {
                callback(data);
              }
              resolve(data);
            });
          } else {
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        }
      });
    });
  }

  private networkStatsSingle(iface: string): Promise<Systeminformation.NetworkStatsData> {
    return new Promise((resolve) => {
      process.nextTick(async () => {
        let ifaceSanitized: string = '';
        const s = util.isPrototypePolluted() ? '---' : util.sanitizeShellString(iface);
        const l = Math.min(s.length, 2000);
        for (let i = 0; i <= l; i++) {
          if (s[i] !== undefined) {
            ifaceSanitized = ifaceSanitized + s[i];
          }
        }

        let result = {
          iface: ifaceSanitized,
          operstate: 'unknown',
          rx_bytes: 0,
          rx_dropped: 0,
          rx_errors: 0,
          tx_bytes: 0,
          tx_dropped: 0,
          tx_errors: 0,
          rx_sec: null,
          tx_sec: null,
          ms: 0,
        } as Systeminformation.NetworkStatsData;

        let operstate = 'unknown';
        let rx_bytes = 0;
        let tx_bytes = 0;
        let rx_dropped = 0;
        let rx_errors = 0;
        let tx_dropped = 0;
        let tx_errors = 0;

        let cmd, lines, stats;
        if (
          !this._network[ifaceSanitized as keyof typeof this._network] ||
          (this._network[ifaceSanitized as keyof typeof this._network] &&
            !this._network[ifaceSanitized as keyof typeof this._network].ms) ||
          (this._network[ifaceSanitized as keyof typeof this._network] &&
            this._network[ifaceSanitized as keyof typeof this._network].ms &&
            Date.now() - this._network[ifaceSanitized as keyof typeof this._network].ms >= 500)
        ) {
          if (this.platform === 'linux') {
            if (await this.fileExists('/sys/class/net/' + ifaceSanitized)) {
              cmd =
                'cat /sys/class/net/' +
                ifaceSanitized +
                '/operstate; ' +
                'cat /sys/class/net/' +
                ifaceSanitized +
                '/statistics/rx_bytes; ' +
                'cat /sys/class/net/' +
                ifaceSanitized +
                '/statistics/tx_bytes; ' +
                'cat /sys/class/net/' +
                ifaceSanitized +
                '/statistics/rx_dropped; ' +
                'cat /sys/class/net/' +
                ifaceSanitized +
                '/statistics/rx_errors; ' +
                'cat /sys/class/net/' +
                ifaceSanitized +
                '/statistics/tx_dropped; ' +
                'cat /sys/class/net/' +
                ifaceSanitized +
                '/statistics/tx_errors; ';
              this.execWithCallback(cmd, (error, stdout) => {
                if (!error) {
                  lines = stdout.toString().split('\n');
                  operstate = lines[0].trim();
                  rx_bytes = parseInt(lines[1], 10);
                  tx_bytes = parseInt(lines[2], 10);
                  rx_dropped = parseInt(lines[3], 10);
                  rx_errors = parseInt(lines[4], 10);
                  tx_dropped = parseInt(lines[5], 10);
                  tx_errors = parseInt(lines[6], 10);

                  result = this.calcNetworkSpeed(
                    ifaceSanitized,
                    rx_bytes,
                    tx_bytes,
                    operstate,
                    rx_dropped,
                    rx_errors,
                    tx_dropped,
                    tx_errors,
                  );
                }
                resolve(result);
              });
            } else {
              resolve(result);
            }
          }
          if (
            this.platform === 'freebsd' ||
            this.platform === 'openbsd' ||
            this.platform === 'netbsd'
          ) {
            cmd = 'netstat -ibndI ' + ifaceSanitized; // lgtm [js/shell-command-constructed-from-input]
            this.execWithCallback(cmd, (error, stdout) => {
              if (!error) {
                lines = stdout.toString().split('\n');
                for (let i = 1; i < lines.length; i++) {
                  const line = lines[i].replace(/ +/g, ' ').split(' ');
                  if (line && line[0] && line[7] && line[10]) {
                    rx_bytes = rx_bytes + parseInt(line[7]);
                    if (line[6].trim() !== '-') {
                      rx_dropped = rx_dropped + parseInt(line[6]);
                    }
                    if (line[5].trim() !== '-') {
                      rx_errors = rx_errors + parseInt(line[5]);
                    }
                    tx_bytes = tx_bytes + parseInt(line[10]);
                    if (line[12].trim() !== '-') {
                      tx_dropped = tx_dropped + parseInt(line[12]);
                    }
                    if (line[9].trim() !== '-') {
                      tx_errors = tx_errors + parseInt(line[9]);
                    }
                    operstate = 'up';
                  }
                }
                result = this.calcNetworkSpeed(
                  ifaceSanitized,
                  rx_bytes,
                  tx_bytes,
                  operstate,
                  rx_dropped,
                  rx_errors,
                  tx_dropped,
                  tx_errors,
                );
              }
              resolve(result);
            });
          }
          if (this.platform === 'darwin') {
            cmd = 'ifconfig ' + ifaceSanitized + ' | grep "status"'; // lgtm [js/shell-command-constructed-from-input]
            this.execWithCallback(cmd, (error, stdout) => {
              result.operstate = (stdout.toString().split(':')[1] || '').trim();
              result.operstate = (result.operstate || '').toLowerCase();
              result.operstate =
                result.operstate === 'active'
                  ? 'up'
                  : result.operstate === 'inactive'
                    ? 'down'
                    : 'unknown';
              cmd = 'netstat -bdI ' + ifaceSanitized; // lgtm [js/shell-command-constructed-from-input]
              this.execWithCallback(cmd, (error, stdout) => {
                if (!error) {
                  lines = stdout.toString().split('\n');
                  // if there is less than 2 lines, no information for this interface was found
                  if (lines.length > 1 && lines[1].trim() !== '') {
                    // skip header line
                    // use the second line because it is tied to the NIC instead of the ipv4 or ipv6 address
                    stats = lines[1].replace(/ +/g, ' ').split(' ');
                    const offset = stats.length > 11 ? 1 : 0;
                    rx_bytes = parseInt(stats[offset + 5]);
                    rx_dropped = parseInt(stats[offset + 10]);
                    rx_errors = parseInt(stats[offset + 4]);
                    tx_bytes = parseInt(stats[offset + 8]);
                    tx_dropped = parseInt(stats[offset + 10]);
                    tx_errors = parseInt(stats[offset + 7]);
                    result = this.calcNetworkSpeed(
                      ifaceSanitized,
                      rx_bytes,
                      tx_bytes,
                      result.operstate,
                      rx_dropped,
                      rx_errors,
                      tx_dropped,
                      tx_errors,
                    );
                  }
                }
                resolve(result);
              });
            });
          }
          if (this.platform === 'win32') {
            /*
            const perfData = [];
            const ifaceName = ifaceSanitized;

            // Performance Data
            util
              .powerShell(
                'Get-CimInstance Win32_PerfRawData_Tcpip_NetworkInterface | select Name,BytesReceivedPersec,PacketsReceivedErrors,PacketsReceivedDiscarded,BytesSentPersec,PacketsOutboundErrors,PacketsOutboundDiscarded | fl',
              )
              .then((stdout, error) => {
                if (!error) {
                  const psections = stdout.toString().split(/\n\s*\n/);
                  perfData = parseLinesWindowsPerfData(psections);
                }

                // Network Interfaces
                networkInterfaces(false).then((interfaces) => {
                  // get bytes sent, received from perfData by name
                  rx_bytes = 0;
                  tx_bytes = 0;
                  perfData.forEach((detail) => {
                    interfaces.forEach((det) => {
                      if (
                        (det.iface.toLowerCase() === ifaceSanitized.toLowerCase() ||
                          det.mac.toLowerCase() === ifaceSanitized.toLowerCase() ||
                          det.ip4.toLowerCase() === ifaceSanitized.toLowerCase() ||
                          det.ip6.toLowerCase() === ifaceSanitized.toLowerCase() ||
                          det.ifaceName
                            .replace(/[()[\] ]+/g, '')
                            .replace(/#|\//g, '_')
                            .toLowerCase() ===
                            ifaceSanitized
                              .replace(/[()[\] ]+/g, '')
                              .replace('#', '_')
                              .toLowerCase()) &&
                        det.ifaceName
                          .replace(/[()[\] ]+/g, '')
                          .replace(/#|\//g, '_')
                          .toLowerCase() === detail.name
                      ) {
                        ifaceName = det.iface;
                        rx_bytes = detail.rx_bytes;
                        rx_dropped = detail.rx_dropped;
                        rx_errors = detail.rx_errors;
                        tx_bytes = detail.tx_bytes;
                        tx_dropped = detail.tx_dropped;
                        tx_errors = detail.tx_errors;
                        operstate = det.operstate;
                      }
                    });
                  });
                  if (rx_bytes && tx_bytes) {
                    result = calcNetworkSpeed(
                      ifaceName,
                      parseInt(rx_bytes),
                      parseInt(tx_bytes),
                      operstate,
                      rx_dropped,
                      rx_errors,
                      tx_dropped,
                      tx_errors,
                    );
                  }
                  resolve(result);
                });
              });*/
          }
        } else {
          result.rx_bytes = this._network[ifaceSanitized].rx_bytes;
          result.tx_bytes = this._network[ifaceSanitized].tx_bytes;
          result.rx_sec = this._network[ifaceSanitized].rx_sec;
          result.tx_sec = this._network[ifaceSanitized].tx_sec;
          result.ms = this._network[ifaceSanitized].last_ms;
          result.operstate = this._network[ifaceSanitized].operstate;
          resolve(result);
        }
      });
    });
  }

  // --------------------------
  // NET - connections (sockets)

  public networkConnections(callback?: Callback) {
    return new Promise((resolve) => {
      process.nextTick(() => {
        const result: Systeminformation.NetworkConnectionsData[] = [];
        if (
          this.platform === 'linux' ||
          this.platform === 'freebsd' ||
          this.platform === 'openbsd' ||
          this.platform === 'netbsd'
        ) {
          let cmd =
            'export LC_ALL=C; netstat -tunap | grep "ESTABLISHED\\|SYN_SENT\\|SYN_RECV\\|FIN_WAIT1\\|FIN_WAIT2\\|TIME_WAIT\\|CLOSE\\|CLOSE_WAIT\\|LAST_ACK\\|LISTEN\\|CLOSING\\|UNKNOWN"; unset LC_ALL';
          if (
            this.platform === 'freebsd' ||
            this.platform === 'openbsd' ||
            this.platform === 'netbsd'
          ) {
            cmd =
              'export LC_ALL=C; netstat -na | grep "ESTABLISHED\\|SYN_SENT\\|SYN_RECV\\|FIN_WAIT1\\|FIN_WAIT2\\|TIME_WAIT\\|CLOSE\\|CLOSE_WAIT\\|LAST_ACK\\|LISTEN\\|CLOSING\\|UNKNOWN"; unset LC_ALL';
          }
          this.execWithCallback(
            cmd,
            (error, stdout) => {
              const lines = stdout.toString().split('\n');
              if (!error && (lines.length > 1 || lines[0] !== '')) {
                lines.forEach((rawLine) => {
                  const line = rawLine.replace(/ +/g, ' ').split(' ');
                  if (line.length >= 7) {
                    let localip = line[3];
                    let localport = '';
                    const localaddress = line[3].split(':');
                    if (localaddress.length > 1) {
                      localport = localaddress[localaddress.length - 1];
                      localaddress.pop();
                      localip = localaddress.join(':');
                    }
                    let peerip = line[4];
                    let peerport = '';
                    const peeraddress = line[4].split(':');
                    if (peeraddress.length > 1) {
                      peerport = peeraddress[peeraddress.length - 1];
                      peeraddress.pop();
                      peerip = peeraddress.join(':');
                    }
                    const connstate = line[5];
                    const proc = line[6].split('/');

                    if (connstate) {
                      result.push({
                        protocol: line[0],
                        localAddress: localip,
                        localPort: localport,
                        peerAddress: peerip,
                        peerPort: peerport,
                        state: connstate,
                        pid: proc[0] && proc[0] !== '-' ? parseInt(proc[0], 10) : null,
                        process: proc[1] ? proc[1].split(' ')[0].split(':')[0] : '',
                      });
                    }
                  }
                });
                if (callback) {
                  callback(result);
                }
                resolve(result);
              } else {
                cmd =
                  'ss -tunap | grep "ESTAB\\|SYN-SENT\\|SYN-RECV\\|FIN-WAIT1\\|FIN-WAIT2\\|TIME-WAIT\\|CLOSE\\|CLOSE-WAIT\\|LAST-ACK\\|LISTEN\\|CLOSING"';
                this.execWithCallback(
                  cmd,
                  (error, stdout) => {
                    if (!error) {
                      const lines = stdout.toString().split('\n');
                      lines.forEach((rawLine) => {
                        const line = rawLine.replace(/ +/g, ' ').split(' ');
                        if (line.length >= 6) {
                          let localip = line[4];
                          let localport = '';
                          const localaddress = line[4].split(':');
                          if (localaddress.length > 1) {
                            localport = localaddress[localaddress.length - 1];
                            localaddress.pop();
                            localip = localaddress.join(':');
                          }
                          let peerip = line[5];
                          let peerport = '';
                          const peeraddress = line[5].split(':');
                          if (peeraddress.length > 1) {
                            peerport = peeraddress[peeraddress.length - 1];
                            peeraddress.pop();
                            peerip = peeraddress.join(':');
                          }
                          let connstate = line[1];
                          if (connstate === 'ESTAB') {
                            connstate = 'ESTABLISHED';
                          }
                          if (connstate === 'TIME-WAIT') {
                            connstate = 'TIME_WAIT';
                          }
                          let pid: number | null = null;
                          let process = '';
                          if (line.length >= 7 && line[6].indexOf('users:') > -1) {
                            const proc = line[6]
                              .replace('users:(("', '')
                              .replace(/"/g, '')
                              .split(',');
                            if (proc.length > 2) {
                              process = proc[0].split(' ')[0].split(':')[0];
                              pid = parseInt(proc[1], 10);
                            }
                          }
                          if (connstate) {
                            result.push({
                              protocol: line[0],
                              localAddress: localip,
                              localPort: localport,
                              peerAddress: peerip,
                              peerPort: peerport,
                              state: connstate,
                              pid,
                              process,
                            });
                          }
                        }
                      });
                    }
                    if (callback) {
                      callback(result);
                    }
                    resolve(result);
                  },
                  { maxBuffer: 1024 * 20000 },
                );
              }
            },
            { maxBuffer: 1024 * 20000 },
          );
        }
        if (this.platform === 'darwin') {
          const cmd =
            'netstat -natvln | head -n2; netstat -natvln | grep "tcp4\\|tcp6\\|udp4\\|udp6"';
          const states =
            'ESTABLISHED|SYN_SENT|SYN_RECV|FIN_WAIT1|FIN_WAIT_1|FIN_WAIT2|FIN_WAIT_2|TIME_WAIT|CLOSE|CLOSE_WAIT|LAST_ACK|LISTEN|CLOSING|UNKNOWN'.split(
              '|',
            );
          this.execWithCallback(
            cmd,
            (error, stdout) => {
              if (!error) {
                this.execWithCallback('ps -axo pid,command', (err2, stdout2) => {
                  let processes = stdout2.toString().split('\n');
                  processes = processes.map((line) => {
                    return line.trim().replace(/ +/g, ' ');
                  });
                  const lines = stdout.toString().split('\n');
                  lines.shift();
                  let pidPos = 8;
                  if (lines.length > 1 && lines[0].indexOf('pid') > 0) {
                    const header = (lines.shift() || '')
                      .replace(/ Address/g, '_Address')
                      .replace(/ +/g, ' ')
                      .split(' ');
                    pidPos = header.indexOf('pid');
                  }
                  lines.forEach(
                    (rawLine) => {
                      const line = rawLine.replace(/ +/g, ' ').split(' ');
                      if (line.length >= 8) {
                        let localip = line[3];
                        let localport = '';
                        const localaddress = line[3].split('.');
                        if (localaddress.length > 1) {
                          localport = localaddress[localaddress.length - 1];
                          localaddress.pop();
                          localip = localaddress.join('.');
                        }
                        let peerip = line[4];
                        let peerport = '';
                        const peeraddress = line[4].split('.');
                        if (peeraddress.length > 1) {
                          peerport = peeraddress[peeraddress.length - 1];
                          peeraddress.pop();
                          peerip = peeraddress.join('.');
                        }
                        const hasState = states.indexOf(line[5]) >= 0;
                        const connstate = hasState ? line[5] : 'UNKNOWN';
                        const pid = parseInt(line[pidPos + (hasState ? 0 : -1)], 10);
                        if (connstate) {
                          result.push({
                            protocol: line[0],
                            localAddress: localip,
                            localPort: localport,
                            peerAddress: peerip,
                            peerPort: peerport,
                            state: connstate,
                            pid: pid,
                            process: getProcessName(processes, pid),
                          });
                        }
                      }
                    },
                    { maxBuffer: 1024 * 20000 },
                  );
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                });
              }
            },
            { maxBuffer: 1024 * 20000 },
          );
        }
        if (this.platform === 'win32') {
          const cmd = 'netstat -nao';
          try {
            this.execWithCallback(cmd, (error, stdout) => {
              if (!error) {
                const lines = stdout.toString().split('\r\n');

                lines.forEach((rawLine) => {
                  const line = rawLine.trim().replace(/ +/g, ' ').split(' ');
                  if (line.length >= 4) {
                    let localip = line[1];
                    let localport = '';
                    const localaddress = line[1].split(':');
                    if (localaddress.length > 1) {
                      localport = localaddress[localaddress.length - 1];
                      localaddress.pop();
                      localip = localaddress.join(':');
                    }
                    localip = localip.replace(/\[/g, '').replace(/\]/g, '');
                    let peerip = line[2];
                    let peerport = '';
                    const peeraddress = line[2].split(':');
                    if (peeraddress.length > 1) {
                      peerport = peeraddress[peeraddress.length - 1];
                      peeraddress.pop();
                      peerip = peeraddress.join(':');
                    }
                    peerip = peerip.replace(/\[/g, '').replace(/\]/g, '');
                    const pid = util.toInt(line[4]);
                    let connstate = line[3];
                    if (connstate === 'HERGESTELLT') {
                      connstate = 'ESTABLISHED';
                    }
                    if (connstate.startsWith('ABH')) {
                      connstate = 'LISTEN';
                    }
                    if (connstate === 'SCHLIESSEN_WARTEN') {
                      connstate = 'CLOSE_WAIT';
                    }
                    if (connstate === 'WARTEND') {
                      connstate = 'TIME_WAIT';
                    }
                    if (connstate === 'SYN_GESENDET') {
                      connstate = 'SYN_SENT';
                    }

                    if (connstate === 'LISTENING') {
                      connstate = 'LISTEN';
                    }
                    if (connstate === 'SYN_RECEIVED') {
                      connstate = 'SYN_RECV';
                    }
                    if (connstate === 'FIN_WAIT_1') {
                      connstate = 'FIN_WAIT1';
                    }
                    if (connstate === 'FIN_WAIT_2') {
                      connstate = 'FIN_WAIT2';
                    }
                    if (line[0].toLowerCase() !== 'udp' && connstate) {
                      result.push({
                        protocol: line[0].toLowerCase(),
                        localAddress: localip,
                        localPort: localport,
                        peerAddress: peerip,
                        peerPort: peerport,
                        state: connstate,
                        pid,
                        process: '',
                      });
                    } else if (line[0].toLowerCase() === 'udp') {
                      result.push({
                        protocol: line[0].toLowerCase(),
                        localAddress: localip,
                        localPort: localport,
                        peerAddress: peerip,
                        peerPort: peerport,
                        state: '',
                        pid: parseInt(line[3], 10),
                        process: '',
                      });
                    }
                  }
                }, util.execOptsWin);
                if (callback) {
                  callback(result);
                }
                resolve(result);
              }
            });
          } catch (e) {
            this.logger.debug(e);
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        }
      });
    });
  }

  public networkGatewayDefault(callback?: Callback) {
    return new Promise((resolve) => {
      process.nextTick(() => {
        let result: string | undefined = '';
        if (
          this.platform === 'linux' ||
          this.platform === 'freebsd' ||
          this.platform === 'openbsd' ||
          this.platform === 'netbsd'
        ) {
          const cmd = 'ip route get 1';
          try {
            this.execWithCallback(
              cmd,
              (error, stdout) => {
                if (!error) {
                  const lines = stdout.toString().split('\n');
                  const line = lines && lines[0] ? lines[0] : '';
                  let parts = line.split(' via ');
                  if (parts && parts[1]) {
                    parts = parts[1].split(' ');
                    result = parts[0];
                  }
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                } else {
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                }
              },
              { maxBuffer: 1024 * 20000 },
            );
          } catch (e) {
            this.logger.debug(e);
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        }
        if (this.platform === 'darwin') {
          let cmd = 'route -n get default';
          try {
            this.execWithCallback(
              cmd,
              (error, stdout) => {
                if (!error) {
                  const lines = stdout
                    .toString()
                    .split('\n')
                    .map((line) => line.trim());
                  result = util.getValue(lines, 'gateway');
                }
                if (!result) {
                  cmd = "netstat -rn | awk '/default/ {print $2}'";
                  this.execWithCallback(
                    cmd,
                    (error, stdout) => {
                      const lines = stdout
                        .toString()
                        .split('\n')
                        .map((line) => line.trim());
                      result = lines.find((line) =>
                        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
                          line,
                        ),
                      );
                      if (callback) {
                        callback(result);
                      }
                      resolve(result);
                    },
                    { maxBuffer: 1024 * 20000 },
                  );
                } else {
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                }
              },
              { maxBuffer: 1024 * 20000 },
            );
          } catch (e) {
            this.logger.debug(e);
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        }
        if (this.platform === 'win32') {
          try {
            this.execWithCallback('netstat -r', (error, stdout) => {
              const lines = stdout.toString().split(this.EOL);
              lines.forEach((line) => {
                line = line.replace(/\s+/g, ' ').trim();
                if (line.indexOf('0.0.0.0 0.0.0.0') > -1 && !/[a-zA-Z]/.test(line)) {
                  const parts = line.split(' ');
                  if (parts.length >= 5 && parts[parts.length - 3].indexOf('.') > -1) {
                    result = parts[parts.length - 3];
                  }
                }
              });
              /*
              if (!result) {
                util
                  .powerShell(
                    "Get-CimInstance -ClassName Win32_IP4RouteTable | Where-Object { $_.Destination -eq '0.0.0.0' -and $_.Mask -eq '0.0.0.0' }",
                  )
                  .then((data) => {
                    const lines = data.toString().split('\r\n');
                    if (lines.length > 1 && !result) {
                      result = util.getValue(lines, 'NextHop');
                      if (callback) {
                        callback(result);
                      }
                      resolve(result);
                    }
                  });
              } else {
                if (callback) {
                  callback(result);
                }
                resolve(result);
              }*/
            });
          } catch (e) {
            this.logger.debug(e);
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        }
      });
    });
  }
}
