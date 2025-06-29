import { Systeminformation } from 'ssm-shared-lib';
import * as util from '../utils/system-utils';
import { bluetoothVendors } from './bluetooth.consts';

export function parseBluetoothType(str: string) {
  let result = '';

  if (str.indexOf('keyboard') >= 0) {
    result = 'Keyboard';
  }
  if (str.indexOf('mouse') >= 0) {
    result = 'Mouse';
  }
  if (str.indexOf('trackpad') >= 0) {
    result = 'Trackpad';
  }
  if (str.indexOf('speaker') >= 0) {
    result = 'Speaker';
  }
  if (str.indexOf('headset') >= 0) {
    result = 'Headset';
  }
  if (str.indexOf('phone') >= 0) {
    result = 'Phone';
  }
  if (str.indexOf('macbook') >= 0) {
    result = 'Computer';
  }
  if (str.indexOf('imac') >= 0) {
    result = 'Computer';
  }
  if (str.indexOf('ipad') >= 0) {
    result = 'Tablet';
  }
  if (str.indexOf('watch') >= 0) {
    result = 'Watch';
  }
  if (str.indexOf('headphone') >= 0) {
    result = 'Headset';
  }
  // to be continued ...

  return result;
}

export function parseBluetoothManufacturer(str: string) {
  let result = str.split(' ')[0];
  str = str.toLowerCase();
  if (str.indexOf('apple') >= 0) {
    result = 'Apple';
  }
  if (str.indexOf('ipad') >= 0) {
    result = 'Apple';
  }
  if (str.indexOf('imac') >= 0) {
    result = 'Apple';
  }
  if (str.indexOf('iphone') >= 0) {
    result = 'Apple';
  }
  if (str.indexOf('magic mouse') >= 0) {
    result = 'Apple';
  }
  if (str.indexOf('magic track') >= 0) {
    result = 'Apple';
  }
  if (str.indexOf('macbook') >= 0) {
    result = 'Apple';
  }
  // to be continued ...

  return result;
}

function parseBluetoothVendor(str: string) {
  const id = parseInt(str);
  if (!isNaN(id)) {
    return bluetoothVendors[id as keyof typeof bluetoothVendors];
  }
}

export function parseLinuxBluetoothInfo(
  lines: string[],
  macAddr1?: string | null,
  macAddr2?: string | null,
) {
  const result: Partial<Systeminformation.BluetoothDeviceData> = {};

  result.device = null;
  result.name = util.getValue(lines, 'name', '=');
  result.manufacturer = null;
  result.macDevice = macAddr1;
  result.macHost = macAddr2;
  result.batteryPercent = null;
  result.type = parseBluetoothType(result.name?.toLowerCase() || '');
  result.connected = false;

  return result;
}

export function parseDarwinBluetoothDevices(bluetoothObject: any, macAddr2: string | null) {
  const result: Partial<Systeminformation.BluetoothDeviceData> = {};
  const typeStr = (
    (bluetoothObject.device_minorClassOfDevice_string ||
      bluetoothObject.device_majorClassOfDevice_string ||
      bluetoothObject.device_minorType ||
      '') + (bluetoothObject.device_name || '')
  ).toLowerCase();

  result.device = bluetoothObject.device_services || '';
  result.name = bluetoothObject.device_name || '';
  result.manufacturer =
    bluetoothObject.device_manufacturer ||
    parseBluetoothVendor(bluetoothObject.device_vendorID) ||
    parseBluetoothManufacturer(bluetoothObject.device_name || '') ||
    '';
  result.macDevice = (bluetoothObject.device_addr || bluetoothObject.device_address || '')
    .toLowerCase()
    .replace(/-/g, ':');
  result.macHost = macAddr2;
  result.batteryPercent = bluetoothObject.device_batteryPercent || null;
  result.type = parseBluetoothType(typeStr);
  result.connected = bluetoothObject.device_isconnected === 'attrib_Yes' || false;

  return result;
}

export function parseWindowsBluetooth(lines: string[]) {
  const result: Partial<Systeminformation.BluetoothDeviceData> = {};

  result.device = null;
  result.name = util.getValue(lines, 'name', ':');
  result.manufacturer = util.getValue(lines, 'manufacturer', ':');
  result.macDevice = null;
  result.macHost = null;
  result.batteryPercent = null;
  result.type = parseBluetoothType(result.name?.toLowerCase() || '');
  result.connected = null;

  return result;
}
