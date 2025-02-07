import { describe, expect, it } from 'vitest';
import {
  parseBluetoothManufacturer,
  parseBluetoothType,
  parseDarwinBluetoothDevices,
  parseLinuxBluetoothInfo,
  parseWindowsBluetooth,
} from '../../../../../../modules/remote-system-information/system-information/bluetooth/bluetooth.utils';

describe('Bluetooth Utils', () => {
  describe('parseBluetoothType', () => {
    const testCases = [
      { input: 'wireless keyboard', expected: 'Keyboard' },
      { input: 'gaming mouse', expected: 'Mouse' },
      { input: 'magic trackpad', expected: 'Trackpad' },
      { input: 'bluetooth speaker', expected: 'Speaker' },
      { input: 'wireless headset', expected: 'Headset' },
      { input: 'iphone 12', expected: 'Phone' },
      { input: 'macbook pro', expected: 'Computer' },
      { input: 'imac 27', expected: 'Computer' },
      { input: 'ipad pro', expected: 'Tablet' },
      { input: 'apple watch', expected: 'Watch' },
      { input: 'unknown device', expected: '' },
    ];

    testCases.forEach(({ input, expected }) => {
      it(`should correctly parse "${input}" as "${expected}"`, () => {
        expect(parseBluetoothType(input)).toBe(expected);
      });
    });
  });

  describe('parseBluetoothManufacturer', () => {
    const testCases = [
      { input: 'Apple Magic Mouse', expected: 'Apple' },
      { input: 'iPad Pro', expected: 'Apple' },
      { input: 'iMac 27', expected: 'Apple' },
      { input: 'iPhone 12', expected: 'Apple' },
      { input: 'Magic Mouse 2', expected: 'Apple' },
      { input: 'Magic Trackpad', expected: 'Apple' },
      { input: 'MacBook Pro', expected: 'Apple' },
      { input: 'Logitech Mouse', expected: 'Logitech' },
      { input: 'Unknown Device', expected: 'Unknown' },
    ];

    testCases.forEach(({ input, expected }) => {
      it(`should correctly identify "${input}" as "${expected}"`, () => {
        expect(parseBluetoothManufacturer(input)).toBe(expected);
      });
    });
  });

  describe('parseLinuxBluetoothInfo', () => {
    it('should correctly parse Linux bluetooth device info', () => {
      const lines = ['Name=Magic Mouse', 'Class=0x002540', 'Icon=input-mouse'];
      const macAddr1 = '00:11:22:33:44:55';
      const macAddr2 = 'AA:BB:CC:DD:EE:FF';

      const result = parseLinuxBluetoothInfo(lines, macAddr1, macAddr2);

      expect(result).toEqual({
        device: null,
        name: 'Magic Mouse',
        manufacturer: null,
        macDevice: macAddr1,
        macHost: macAddr2,
        batteryPercent: null,
        type: 'Mouse',
        connected: false,
      });
    });

    it('should handle empty input', () => {
      const result = parseLinuxBluetoothInfo([]);
      expect(result.name).toBe('');
      expect(result.type).toBe('');
    });
  });

  describe('parseDarwinBluetoothDevices', () => {
    it('should correctly parse Darwin bluetooth device info', () => {
      const bluetoothObject = {
        device_minorClassOfDevice_string: 'Mouse',
        device_name: 'Magic Mouse 2',
        device_services: 'Mouse Service',
        device_manufacturer: 'Apple Inc.',
        device_addr: 'AA-BB-CC-DD-EE-FF',
        device_batteryPercent: 85,
        device_isconnected: 'attrib_Yes',
      };
      const macAddr2 = '00:11:22:33:44:55';

      const result = parseDarwinBluetoothDevices(bluetoothObject, macAddr2);

      expect(result).toEqual({
        device: 'Mouse Service',
        name: 'Magic Mouse 2',
        manufacturer: 'Apple Inc.',
        macDevice: 'aa:bb:cc:dd:ee:ff',
        macHost: macAddr2,
        batteryPercent: 85,
        type: 'Mouse',
        connected: true,
      });
    });

    it('should handle empty input', () => {
      const result = parseDarwinBluetoothDevices({}, '');
      expect(result.name).toBe('');
      expect(result.connected).toBe(false);
    });
  });

  describe('parseWindowsBluetooth', () => {
    it('should correctly parse Windows bluetooth device info', () => {
      const lines = ['Name: Magic Mouse', 'Manufacturer: Apple'];

      const result = parseWindowsBluetooth(lines);

      expect(result).toEqual({
        device: null,
        name: 'Magic Mouse',
        manufacturer: 'Apple',
        macDevice: null,
        macHost: null,
        batteryPercent: null,
        type: 'Mouse',
        connected: null,
      });
    });

    it('should handle empty input', () => {
      const result = parseWindowsBluetooth([]);
      expect(result.name).toBe('');
      expect(result.manufacturer).toBe('');
    });
  });
});
