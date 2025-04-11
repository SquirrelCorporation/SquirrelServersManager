import { Systeminformation } from 'ssm-shared-lib';
import PinoLogger from '../../../../../logger';
import { RemoteOS } from '../remote-os/remote-os.component';
import {
  Callback,
  RemoteExecutorType,
  RemoteExecutorTypeWithCallback,
} from '../../types/remote-executor.types';
import * as util from '../utils/system-utils';
import {
  parseWifiDarwin,
  wifiChannelFromFrequencs,
  wifiDBFromQuality,
  wifiFrequencyFromChannel,
  wifiQualityFromDB,
} from './wifi.utils';

export class WifiComponent extends RemoteOS {
  private logger = PinoLogger.child({ component: 'WifiComponent' });
  constructor(
    remoteExecAsync: RemoteExecutorType,
    remoteExecWithCallback: RemoteExecutorTypeWithCallback,
  ) {
    super(remoteExecAsync, remoteExecWithCallback);
  }

  private async ifaceListLinux() {
    const result: any[] = [];
    const cmd = 'iw dev 2>/dev/null';
    try {
      const all = (await this.execAsync(cmd, util.execOptsLinux))
        .toString()
        .split('\n')
        .map((line) => line.trim())
        .join('\n');
      const parts = all.split('\nInterface ');
      parts.shift();
      parts.forEach((ifaceDetails) => {
        const lines = ifaceDetails.split('\n');
        const iface = lines[0];
        const id = util.toInt(util.getValue(lines, 'ifindex', ' '));
        const mac = util.getValue(lines, 'addr', ' ');
        const channel = util.toInt(util.getValue(lines, 'channel', ' '));
        result.push({
          id,
          iface,
          mac,
          channel,
        });
      });
      return result;
    } catch (e) {
      this.logger.debug(e);
      try {
        const all = (
          await this.execAsync(
            'nmcli -t -f general,wifi-properties,wired-properties,interface-flags,capabilities,nsp device show 2>/dev/null',
            util.execOptsLinux,
          )
        ).toString();
        const parts = all.split('\n\n');
        let i = 1;
        parts.forEach((ifaceDetails) => {
          const lines = ifaceDetails.split('\n');
          const iface = util.getValue(lines, 'GENERAL.DEVICE');
          const type = util.getValue(lines, 'GENERAL.TYPE');
          const id = i++; // // util.getValue(lines, 'GENERAL.PATH');
          const mac = util.getValue(lines, 'GENERAL.HWADDR');
          const channel = '';
          if (type.toLowerCase() === 'wifi') {
            result.push({
              id,
              iface,
              mac,
              channel,
            });
          }
        });
        return result;
      } catch (e) {
        this.logger.debug(e);
        return [];
      }
    }
  }

  private async nmiDeviceLinux(iface: string) {
    const cmd = `nmcli -t -f general,wifi-properties,capabilities,ip4,ip6 device show ${iface} 2> /dev/null`;
    try {
      const lines = (await this.execAsync(cmd, util.execOptsLinux)).toString().split('\n');
      const ssid = util.getValue(lines, 'GENERAL.CONNECTION');
      return {
        iface,
        type: util.getValue(lines, 'GENERAL.TYPE'),
        vendor: util.getValue(lines, 'GENERAL.VENDOR'),
        product: util.getValue(lines, 'GENERAL.PRODUCT'),
        mac: util.getValue(lines, 'GENERAL.HWADDR').toLowerCase(),
        ssid: ssid !== '--' ? ssid : null,
      };
    } catch (e) {
      this.logger.debug(e);
      return {};
    }
  }

  private async nmiConnectionLinux(ssid: string) {
    const cmd = `nmcli -t --show-secrets connection show ${ssid} 2>/dev/null`;
    try {
      const lines = (await this.execAsync(cmd, util.execOptsLinux)).toString().split('\n');
      const bssid = util.getValue(lines, '802-11-wireless.seen-bssids').toLowerCase();
      return {
        ssid: ssid !== '--' ? ssid : null,
        uuid: util.getValue(lines, 'connection.uuid'),
        type: util.getValue(lines, 'connection.type'),
        autoconnect: util.getValue(lines, 'connection.autoconnect') === 'yes',
        security: util.getValue(lines, '802-11-wireless-security.key-mgmt'),
        bssid: bssid !== '--' ? bssid : null,
      };
    } catch (e) {
      this.logger.error(e);
      return {};
    }
  }

  private async wpaConnectionLinux(iface: string) {
    if (!iface) {
      return {};
    }
    const cmd = `wpa_cli -i ${iface} status 2>&1`;
    try {
      const lines = (await this.execAsync(cmd, util.execOptsLinux)).toString().split('\n');
      const freq = util.toInt(util.getValue(lines, 'freq', '='));
      return {
        ssid: util.getValue(lines, 'ssid', '='),
        uuid: util.getValue(lines, 'uuid', '='),
        security: util.getValue(lines, 'key_mgmt', '='),
        freq,
        channel: wifiChannelFromFrequencs(freq),
        bssid: util.getValue(lines, 'bssid', '=').toLowerCase(),
      };
    } catch (e) {
      this.logger.error(e);
      return {};
    }
  }

  private async getWifiNetworkListNmi() {
    const result: Systeminformation.WifiNetworkData[] = [];
    const cmd =
      'nmcli -t -m multiline --fields active,ssid,bssid,mode,chan,freq,signal,security,wpa-flags,rsn-flags device wifi list 2>/dev/null';
    try {
      const stdout = await this.execAsync(cmd, util.execOptsLinux);
      const parts = stdout.toString().split('ACTIVE:');
      parts.shift();
      parts.forEach((part) => {
        part = 'ACTIVE:' + part;
        const lines = part.split(this.EOL);
        const channel = util.getValue(lines, 'CHAN');
        const frequency = util.getValue(lines, 'FREQ').toLowerCase().replace('mhz', '').trim();
        const security = util.getValue(lines, 'SECURITY').replace('(', '').replace(')', '');
        const wpaFlags = util.getValue(lines, 'WPA-FLAGS').replace('(', '').replace(')', '');
        const rsnFlags = util.getValue(lines, 'RSN-FLAGS').replace('(', '').replace(')', '');
        const quality = util.getValue(lines, 'SIGNAL');
        result.push({
          ssid: util.getValue(lines, 'SSID'),
          bssid: util.getValue(lines, 'BSSID').toLowerCase(),
          mode: util.getValue(lines, 'MODE'),
          channel: channel ? parseInt(channel, 10) : null,
          frequency: frequency ? parseInt(frequency, 10) : null,
          signalLevel: wifiDBFromQuality(quality),
          quality: quality ? parseInt(quality, 10) : null,
          security: security && security !== 'none' ? security.split(' ') : [],
          wpaFlags: wpaFlags && wpaFlags !== 'none' ? wpaFlags.split(' ') : [],
          rsnFlags: rsnFlags && rsnFlags !== 'none' ? rsnFlags.split(' ') : [],
        });
      });
      return result;
    } catch (e) {
      this.logger.error(e);
      return [];
    }
  }

  private async getWifiNetworkListIw(iface: string) {
    const result: Systeminformation.WifiNetworkData[] = [];
    try {
      const iwlistParts = (
        await this.execAsync(
          `export LC_ALL=C; iwlist ${iface} scan 2>&1; unset LC_ALL`,
          util.execOptsLinux,
        )
      )
        .toString()
        .split('        Cell ');
      if (iwlistParts[0].indexOf('resource busy') >= 0) {
        return -1;
      }
      if (iwlistParts.length > 1) {
        iwlistParts.shift();
        iwlistParts.forEach((element) => {
          const lines = element.split('\n');
          const channel = util.getValue(lines, 'channel', ':', true);
          const address =
            lines && lines.length && lines[0].indexOf('Address:') >= 0
              ? lines[0].split('Address:')[1].trim().toLowerCase()
              : '';
          const mode = util.getValue(lines, 'mode', ':', true);
          const frequency = util.getValue(lines, 'frequency', ':', true);
          const qualityString = util.getValue(lines, 'Quality', '=', true);
          const dbParts = qualityString.toLowerCase().split('signal level=');
          const db = dbParts.length > 1 ? util.toInt(dbParts[1]) : 0;
          const quality = db ? wifiQualityFromDB(db) : 0;
          const ssid = util.getValue(lines, 'essid', ':', true);

          // security and wpa-flags
          const isWpa = element.indexOf(' WPA ') >= 0;
          const isWpa2 = element.indexOf('WPA2 ') >= 0;
          const security: string[] = [];
          if (isWpa) {
            security.push('WPA');
          }
          if (isWpa2) {
            security.push('WPA2');
          }
          const wpaFlags: string[] = [];
          let wpaFlag = '';
          lines.forEach((line) => {
            const l = line.trim().toLowerCase();
            if (l.indexOf('group cipher') >= 0) {
              if (wpaFlag) {
                wpaFlags.push(wpaFlag);
              }
              const parts = l.split(':');
              if (parts.length > 1) {
                wpaFlag = parts[1].trim().toUpperCase();
              }
            }
            if (l.indexOf('pairwise cipher') >= 0) {
              const parts = l.split(':');
              if (parts.length > 1) {
                if (parts[1].indexOf('tkip')) {
                  wpaFlag = wpaFlag ? 'TKIP/' + wpaFlag : 'TKIP';
                } else if (parts[1].indexOf('ccmp')) {
                  wpaFlag = wpaFlag ? 'CCMP/' + wpaFlag : 'CCMP';
                } else if (parts[1].indexOf('proprietary')) {
                  wpaFlag = wpaFlag ? 'PROP/' + wpaFlag : 'PROP';
                }
              }
            }
            if (l.indexOf('authentication suites') >= 0) {
              const parts = l.split(':');
              if (parts.length > 1) {
                if (parts[1].indexOf('802.1x')) {
                  wpaFlag = wpaFlag ? '802.1x/' + wpaFlag : '802.1x';
                } else if (parts[1].indexOf('psk')) {
                  wpaFlag = wpaFlag ? 'PSK/' + wpaFlag : 'PSK';
                }
              }
            }
          });
          if (wpaFlag) {
            wpaFlags.push(wpaFlag);
          }

          result.push({
            ssid,
            bssid: address,
            mode,
            channel: channel ? util.toInt(channel) : null,
            frequency: frequency ? util.toInt(frequency.replace('.', '')) : null,
            signalLevel: db,
            quality,
            security,
            wpaFlags,
            rsnFlags: [],
          });
        });
      }
      return result;
    } catch (e) {
      this.logger.error(e);
      return -1;
    }
  }

  public wifiNetworks(callback?: Callback) {
    return new Promise((resolve) => {
      process.nextTick(async () => {
        let result: Systeminformation.WifiNetworkData[] = [];
        if (this.platform === 'linux') {
          result = await this.getWifiNetworkListNmi();
          if (result.length === 0) {
            try {
              const iwconfigParts = (
                await this.execAsync(
                  'export LC_ALL=C; iwconfig 2>/dev/null; unset LC_ALL',
                  util.execOptsLinux,
                )
              )
                .toString()
                .split('\n\n');
              let iface = '';
              iwconfigParts.forEach((element) => {
                if (element.indexOf('no wireless') === -1 && element.trim() !== '') {
                  iface = element.split(' ')[0];
                }
              });
              if (iface) {
                let ifaceSanitized = '';
                const s = util.isPrototypePolluted()
                  ? '---'
                  : util.sanitizeShellString(iface, true);
                const l = Math.min(s.length, 2000);

                for (let i = 0; i <= l; i++) {
                  if (s[i] !== undefined) {
                    ifaceSanitized = ifaceSanitized + s[i];
                  }
                }

                const res = await this.getWifiNetworkListIw(ifaceSanitized);
                if (res === -1) {
                  // try again after 4 secs
                  setTimeout(async (iface) => {
                    const res = await this.getWifiNetworkListIw(iface);
                    if (res !== -1) {
                      result = res;
                    }
                    if (callback) {
                      callback(result);
                    }
                    resolve(result);
                  }, 4000);
                } else {
                  result = res;
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                }
              } else {
                if (callback) {
                  callback(result);
                }
                resolve(result);
              }
            } catch (e) {
              this.logger.error(e);
              if (callback) {
                callback(result);
              }
              resolve(result);
            }
          } else {
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        } else if (this.platform === 'darwin') {
          const cmd = 'system_profiler SPAirPortDataType -json 2>/dev/null';
          this.execWithCallback(
            cmd,
            (error, stdout) => {
              result = parseWifiDarwin(stdout.toString());
              if (callback) {
                callback(result);
              }
              resolve(result);
            },
            { maxBuffer: 1024 * 40000 },
          );
        } else if (this.platform === 'win32') {
          if (callback) {
            callback(result);
          }
          resolve(result);
          /*
          let cmd = 'netsh wlan show networks mode=Bssid';
          util.powerShell(cmd).then((stdout) => {
            const ssidParts = stdout.toString('utf8').split(os.EOL + os.EOL + 'SSID ');
            ssidParts.shift();

            ssidParts.forEach(ssidPart => {
              const ssidLines = ssidPart.split(os.EOL);
              if (ssidLines && ssidLines.length >= 8 && ssidLines[0].indexOf(':') >= 0) {
                const bssidsParts = ssidPart.split(' BSSID');
                bssidsParts.shift();

                bssidsParts.forEach((bssidPart) => {
                  const bssidLines = bssidPart.split(os.EOL);
                  const bssidLine = bssidLines[0].split(':');
                  bssidLine.shift();
                  const bssid = bssidLine.join(':').trim().toLowerCase();
                  const channel = bssidLines[3].split(':').pop().trim();
                  const quality = bssidLines[1].split(':').pop().trim();

                  result.push({
                    ssid: ssidLines[0].split(':').pop().trim(),
                    bssid,
                    mode: '',
                    channel: channel ? parseInt(channel, 10) : null,
                    frequency: wifiFrequencyFromChannel(channel),
                    signalLevel: wifiDBFromQuality(quality),
                    quality: quality ? parseInt(quality, 10) : null,
                    security: [ssidLines[2].split(':').pop().trim()],
                    wpaFlags: [ssidLines[3].split(':').pop().trim()],
                    rsnFlags: []
                  });
                });
              }
            });

            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        } else {
          if (callback) {
            callback(result);
          }
          resolve(result);

           */
        }
      });
    });
  }

  public wifiConnections(callback?: Callback) {
    return new Promise((resolve) => {
      process.nextTick(async () => {
        const result: Systeminformation.WifiConnectionData[] = [];

        if (this.platform === 'linux') {
          const ifaces = await this.ifaceListLinux();
          const networkList = await this.getWifiNetworkListNmi();
          for (const ifaceDetail of ifaces) {
            let ifaceSanitized = '';
            const s = util.isPrototypePolluted()
              ? '---'
              : util.sanitizeShellString(ifaceDetail.iface, true);
            const ll = Math.min(s.length, 2000);

            for (let i = 0; i <= ll; i++) {
              if (s[i] !== undefined) {
                ifaceSanitized = ifaceSanitized + s[i];
              }
            }

            const nmiDetails = await this.nmiDeviceLinux(ifaceSanitized);
            const wpaDetails = await this.wpaConnectionLinux(ifaceSanitized);
            const ssid = nmiDetails.ssid || wpaDetails.ssid;
            const network = networkList.filter((nw) => nw.ssid === ssid);
            let ssidSanitized = '';
            const t = util.isPrototypePolluted() ? '---' : util.sanitizeShellString(ssid, true);
            const l = Math.min(t.length, 32);
            for (let i = 0; i <= l; i++) {
              if (t[i] !== undefined) {
                ssidSanitized = ssidSanitized + t[i];
              }
            }

            const nmiConnection = await this.nmiConnectionLinux(ssidSanitized);
            const channel =
              network && network.length && network[0].channel
                ? network[0].channel
                : wpaDetails.channel
                  ? wpaDetails.channel
                  : null;
            const bssid =
              network && network.length && network[0].bssid
                ? network[0].bssid
                : wpaDetails.bssid
                  ? wpaDetails.bssid
                  : null;
            const signalLevel =
              network && network.length && network[0].signalLevel ? network[0].signalLevel : null;
            if (ssid && bssid) {
              result.push({
                id: ifaceDetail.id,
                iface: ifaceDetail.iface,
                model: nmiDetails.product,
                ssid,
                bssid:
                  network && network.length && network[0].bssid
                    ? network[0].bssid
                    : wpaDetails.bssid
                      ? wpaDetails.bssid
                      : null,
                channel,
                frequency: channel ? wifiFrequencyFromChannel(channel) : null,
                type: nmiConnection.type ? nmiConnection.type : '802.11',
                security: nmiConnection.security
                  ? nmiConnection.security
                  : wpaDetails.security
                    ? wpaDetails.security
                    : null,
                signalLevel,
                quality: wifiQualityFromDB(signalLevel),
                txRate: null,
              });
            }
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        } else if (this.platform === 'darwin') {
          const cmd =
            'system_profiler SPNetworkDataType SPAirPortDataType -xml 2>/dev/null; echo "######" ; ioreg -n AppleBCMWLANSkywalkInterface -r 2>/dev/null';
          this.execWithCallback(cmd, (error, stdout) => {
            try {
              const parts = stdout.toString().split('######');
              const profilerObj = util.plistParser(parts[0]);
              const networkObj =
                profilerObj[0]._SPCommandLineArguments.indexOf('SPNetworkDataType') >= 0
                  ? profilerObj[0]._items
                  : profilerObj[1]._items;
              const airportObj =
                profilerObj[0]._SPCommandLineArguments.indexOf('SPAirPortDataType') >= 0
                  ? profilerObj[0]._items[0].spairport_airport_interfaces
                  : profilerObj[1]._items[0].spairport_airport_interfaces;

              const networkWifiObj = networkObj.find((item: any) => {
                return item._name === 'Wi-Fi';
              });
              const airportWifiObj = airportObj[0].spairport_current_network_information;

              const channel =
                parseInt(('' + airportWifiObj.spairport_network_channel).split(' ')[0]) || 0;
              const signalLevel = airportWifiObj.spairport_signal_noise || null;

              const security: string[] = [];
              const sm = airportWifiObj.spairport_security_mode;
              if (sm === 'spairport_security_mode_wep') {
                security.push('WEP');
              } else if (sm === 'spairport_security_mode_wpa2_personal') {
                security.push('WPA2');
              } else if (sm.startsWith('spairport_security_mode_wpa2_enterprise')) {
                security.push('WPA2 EAP');
              } else if (sm.startsWith('pairport_security_mode_wpa3_transition')) {
                security.push('WPA2/WPA3');
              } else if (sm.startsWith('pairport_security_mode_wpa3')) {
                security.push('WPA3');
              }

              result.push({
                id: networkWifiObj._name || 'Wi-Fi',
                iface: networkWifiObj.interface || '',
                model: networkWifiObj.hardware || '',
                ssid: airportWifiObj._name || '',
                bssid: airportWifiObj.spairport_network_bssid || '',
                channel,
                frequency: channel ? wifiFrequencyFromChannel(channel) : null,
                type: airportWifiObj.spairport_network_phymode || '802.11',
                security,
                signalLevel: signalLevel ? parseInt(signalLevel, 10) : null,
                quality: wifiQualityFromDB(signalLevel),
                txRate: airportWifiObj.spairport_network_rate || null,
              });
            } catch (e) {
              this.logger.error(e);
              util.noop();
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        } else if (this.platform === 'win32') {
          if (callback) {
            callback(result);
          }
          resolve(result);
          /*
          let cmd = 'netsh wlan show interfaces';
          util.powerShell(cmd).then(function (stdout) {
            const allLines = stdout.toString().split('\r\n');
            for (let i = 0; i < allLines.length; i++) {
              allLines[i] = allLines[i].trim();
            }
            const parts = allLines.join('\r\n').split(':\r\n\r\n');
            parts.shift();
            parts.forEach(part => {
              const lines = part.split('\r\n');
              if (lines.length >= 5) {
                const iface = lines[0].indexOf(':') >= 0 ? lines[0].split(':')[1].trim() : '';
                const model = lines[1].indexOf(':') >= 0 ? lines[1].split(':')[1].trim() : '';
                const id = lines[2].indexOf(':') >= 0 ? lines[2].split(':')[1].trim() : '';
                const ssid = util.getValue(lines, 'SSID', ':', true);
                const bssid = util.getValue(lines, 'BSSID', ':', true) || util.getValue(lines, 'AP BSSID', ':', true);
                const quality = util.getValue(lines, 'Signal', ':', true);
                const signalLevel = wifiDBFromQuality(quality);
                const type = util.getValue(lines, 'Radio type', ':', true) || util.getValue(lines, 'Type de radio', ':', true) || util.getValue(lines, 'Funktyp', ':', true) || null;
                const security = util.getValue(lines, 'authentication', ':', true) || util.getValue(lines, 'Authentification', ':', true) || util.getValue(lines, 'Authentifizierung', ':', true) || null;
                const channel = util.getValue(lines, 'Channel', ':', true) || util.getValue(lines, 'Canal', ':', true) || util.getValue(lines, 'Kanal', ':', true) || null;
                const txRate = util.getValue(lines, 'Transmit rate (mbps)', ':', true) || util.getValue(lines, 'Transmission (mbit/s)', ':', true) || util.getValue(lines, 'Empfangsrate (MBit/s)', ':', true) || null;
                if (model && id && ssid && bssid) {
                  result.push({
                    id,
                    iface,
                    model,
                    ssid,
                    bssid,
                    channel: util.toInt(channel),
                    frequency: channel ? wifiFrequencyFromChannel(channel) : null,
                    type,
                    security,
                    signalLevel,
                    quality: quality ? parseInt(quality, 10) : null,
                    txRate: util.toInt(txRate) || null
                  });
                }
              }
            });
            if (callback) {
              callback(result);
            }
            resolve(result);
          });

           */
        } else {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      });
    });
  }

  public wifiInterfaces(callback?: Callback): Promise<Systeminformation.WifiInterfaceData[]> {
    return new Promise((resolve) => {
      process.nextTick(async () => {
        const result: Systeminformation.WifiInterfaceData[] = [];

        if (this.platform === 'linux') {
          const ifaces = await this.ifaceListLinux();
          for (const ifaceDetail of ifaces) {
            const nmiDetails = await this.nmiDeviceLinux(ifaceDetail.iface);
            result.push({
              id: ifaceDetail.id,
              iface: ifaceDetail.iface,
              model: nmiDetails.product ? nmiDetails.product : null,
              vendor: nmiDetails.vendor ? nmiDetails.vendor : null,
              mac: ifaceDetail.mac,
            });
          }
          if (callback) {
            callback(result);
          }
          resolve(result);
        } else if (this.platform === 'darwin') {
          const cmd = 'system_profiler SPNetworkDataType';
          this.execWithCallback(cmd, (error, stdout) => {
            const parts1 = stdout.toString().split('\n\n    Wi-Fi:\n\n');
            if (parts1.length > 1) {
              const lines = parts1[1].split('\n\n')[0].split('\n');
              const iface = util.getValue(lines, 'BSD Device Name', ':', true);
              const mac = util.getValue(lines, 'MAC Address', ':', true);
              const model = util.getValue(lines, 'hardware', ':', true);
              result.push({
                id: 'Wi-Fi',
                iface,
                model,
                vendor: '',
                mac,
              });
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        } else if (this.platform === 'win32') {
          if (callback) {
            callback(result);
          }
          resolve(result);
          /*
          let cmd = 'netsh wlan show interfaces';
          util.powerShell(cmd).then(function (stdout) {
            const allLines = stdout.toString().split('\r\n');
            for (let i = 0; i < allLines.length; i++) {
              allLines[i] = allLines[i].trim();
            }
            const parts = allLines.join('\r\n').split(':\r\n\r\n');
            parts.shift();
            parts.forEach(part => {
              const lines = part.split('\r\n');
              if (lines.length >= 5) {
                const iface = lines[0].indexOf(':') >= 0 ? lines[0].split(':')[1].trim() : '';
                const model = lines[1].indexOf(':') >= 0 ? lines[1].split(':')[1].trim() : '';
                const id = lines[2].indexOf(':') >= 0 ? lines[2].split(':')[1].trim() : '';
                const macParts = lines[3].indexOf(':') >= 0 ? lines[3].split(':') : [];
                macParts.shift();
                const mac = macParts.join(':').trim();
                const vendor = getVendor(model);
                if (iface && model && id && mac) {
                  result.push({
                    id,
                    iface,
                    model,
                    vendor,
                    mac,
                  });
                }
              }
            });
            if (callback) {
              callback(result);
            }
            resolve(result);
          });

           */
        } else {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      });
    });
  }
}
