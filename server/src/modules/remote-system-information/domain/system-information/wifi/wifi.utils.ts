import { Systeminformation } from 'ssm-shared-lib';
import logger from '../../../../../logger';
import * as util from '../utils/system-utils';
import { _wifi_frequencies } from './wifi.consts';

export function wifiDBFromQuality(quality: string) {
  const qual = parseFloat(quality);
  if (qual < 0) {
    return 0;
  }
  if (qual >= 100) {
    return -50;
  }
  return qual / 2 - 100;
}

export function wifiQualityFromDB(db: string | number | null) {
  const result = 2 * ((typeof db === 'string' ? parseFloat(db) : db || 0) + 100);
  return result <= 100 ? result : 100;
}

export function wifiFrequencyFromChannel(channel: number) {
  return {}.hasOwnProperty.call(_wifi_frequencies, channel)
    ? _wifi_frequencies[channel as keyof typeof _wifi_frequencies]
    : null;
}

export function wifiChannelFromFrequencs(frequency: number) {
  let channel = 0;
  for (const key in _wifi_frequencies) {
    if ({}.hasOwnProperty.call(_wifi_frequencies, key)) {
      if (_wifi_frequencies[parseInt(key) as keyof typeof _wifi_frequencies] === frequency) {
        channel = util.toInt(key);
      }
    }
  }
  return channel;
}

export function parseWifiDarwin(wifiStr: string) {
  const result: Systeminformation.WifiNetworkData[] = [];
  try {
    let wifiObj = JSON.parse(wifiStr);
    wifiObj =
      wifiObj.SPAirPortDataType[0].spairport_airport_interfaces[0]
        .spairport_airport_other_local_wireless_networks;
    wifiObj.forEach((wifiItem: any) => {
      const security: string[] = [];
      const sm = wifiItem.spairport_security_mode;
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
      const channel = parseInt(('' + wifiItem.spairport_network_channel).split(' ')[0]) || 0;
      const signalLevel = wifiItem.spairport_signal_noise || null;

      result.push({
        ssid: wifiItem._name || '',
        bssid: wifiItem.spairport_network_bssid || null,
        mode: wifiItem.spairport_network_phymode,
        channel,
        frequency: wifiFrequencyFromChannel(channel),
        signalLevel: signalLevel ? parseInt(signalLevel, 10) : null,
        quality: wifiQualityFromDB(signalLevel),
        security,
        wpaFlags: [],
        rsnFlags: [],
      });
    });
    return result;
  } catch (e) {
    logger.error(e);
    return result;
  }
}

export function parseWifiDarwinXX(wifiObj: any) {
  const result: Systeminformation.WifiNetworkData[] = [];
  if (wifiObj) {
    wifiObj.forEach((wifiItem: any) => {
      const signalLevel = wifiItem.RSSI;
      const security: string[] = [];
      const wpaFlags: string[] = [];
      let ssid = wifiItem.SSID_STR || '';
      if (wifiItem.WPA_IE) {
        security.push('WPA');
        if (wifiItem.WPA_IE.IE_KEY_WPA_UCIPHERS) {
          wifiItem.WPA_IE.IE_KEY_WPA_UCIPHERS.forEach((ciphers: number) => {
            if (ciphers === 0 && wpaFlags.indexOf('unknown/TKIP') === -1) {
              wpaFlags.push('unknown/TKIP');
            }
            if (ciphers === 2 && wpaFlags.indexOf('PSK/TKIP') === -1) {
              wpaFlags.push('PSK/TKIP');
            }
            if (ciphers === 4 && wpaFlags.indexOf('PSK/AES') === -1) {
              wpaFlags.push('PSK/AES');
            }
          });
        }
      }
      if (wifiItem.RSN_IE) {
        security.push('WPA2');
        if (wifiItem.RSN_IE.IE_KEY_RSN_UCIPHERS) {
          wifiItem.RSN_IE.IE_KEY_RSN_UCIPHERS.forEach((ciphers: number) => {
            if (ciphers === 0 && wpaFlags.indexOf('unknown/TKIP') === -1) {
              wpaFlags.push('unknown/TKIP');
            }
            if (ciphers === 2 && wpaFlags.indexOf('TKIP/TKIP') === -1) {
              wpaFlags.push('TKIP/TKIP');
            }
            if (ciphers === 4 && wpaFlags.indexOf('PSK/AES') === -1) {
              wpaFlags.push('PSK/AES');
            }
          });
        }
      }
      if (wifiItem.SSID && ssid === '') {
        try {
          ssid = Buffer.from(wifiItem.SSID, 'base64').toString('utf8');
        } catch (err) {
          logger.error(err);
          util.noop();
        }
      }
      result.push({
        ssid,
        bssid: wifiItem.BSSID || '',
        mode: '',
        channel: wifiItem.CHANNEL,
        frequency: wifiFrequencyFromChannel(wifiItem.CHANNEL),
        signalLevel: signalLevel ? parseInt(signalLevel, 10) : null,
        quality: wifiQualityFromDB(signalLevel),
        security,
        wpaFlags,
        rsnFlags: [],
      });
    });
  }
  return result;
}

export function getVendor(model: string) {
  model = model.toLowerCase();
  let result = '';
  if (model.indexOf('intel') >= 0) {
    result = 'Intel';
  } else if (model.indexOf('realtek') >= 0) {
    result = 'Realtek';
  } else if (model.indexOf('qualcom') >= 0) {
    result = 'Qualcom';
  } else if (model.indexOf('broadcom') >= 0) {
    result = 'Broadcom';
  } else if (model.indexOf('cavium') >= 0) {
    result = 'Cavium';
  } else if (model.indexOf('cisco') >= 0) {
    result = 'Cisco';
  } else if (model.indexOf('marvel') >= 0) {
    result = 'Marvel';
  } else if (model.indexOf('zyxel') >= 0) {
    result = 'Zyxel';
  } else if (model.indexOf('melanox') >= 0) {
    result = 'Melanox';
  } else if (model.indexOf('d-link') >= 0) {
    result = 'D-Link';
  } else if (model.indexOf('tp-link') >= 0) {
    result = 'TP-Link';
  } else if (model.indexOf('asus') >= 0) {
    result = 'Asus';
  } else if (model.indexOf('linksys') >= 0) {
    result = 'Linksys';
  }
  return result;
}

export function formatBssid(s: string) {
  const _s =
    s
      .replace(/</g, '')
      .replace(/>/g, '')
      .match(/.{1,2}/g) || [];
  return _s.join(':');
}
