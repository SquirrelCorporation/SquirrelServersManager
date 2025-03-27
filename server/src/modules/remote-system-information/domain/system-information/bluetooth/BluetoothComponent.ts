import path from 'path';
import { Systeminformation } from 'ssm-shared-lib';
import PinoLogger from '../../../../../logger';
import { RemoteOS } from '../remote-os/remote-os.component';
import {
  Callback,
  RemoteExecutorType,
  RemoteExecutorTypeWithCallback,
} from '../../types/remote-executor.types';
import * as util from '../utils/system-utils';
import { parseDarwinBluetoothDevices, parseLinuxBluetoothInfo } from './bluetooth.utils';

export class BluetoothComponent extends RemoteOS {
  private logger = PinoLogger.child({ component: 'BluetoothComponent' });
  constructor(
    remoteExecAsync: RemoteExecutorType,
    remoteExecWithCallback: RemoteExecutorTypeWithCallback,
  ) {
    super(remoteExecAsync, remoteExecWithCallback);
  }
  public bluetoothDevices(
    callback?: Callback,
  ): Promise<(Partial<Systeminformation.BluetoothDeviceData> | undefined)[] | null> {
    return new Promise((resolve) => {
      process.nextTick(async () => {
        const result: Partial<Systeminformation.BluetoothDeviceData>[] = [];
        if (this.platform === 'linux') {
          // get files in /var/lib/bluetooth/ recursive

          const btFiles = await this.getFilesInPath('/var/lib/bluetooth/');
          for (const element of btFiles) {
            const filename = path.basename(element);
            const pathParts = element.split('/');
            const macAddr1 = pathParts.length >= 6 ? pathParts[pathParts.length - 2] : null;
            const macAddr2 = pathParts.length >= 7 ? pathParts[pathParts.length - 3] : null;
            if (filename === 'info') {
              const infoFile = (await this.readFileAsync(element, { encoding: 'utf8' })).split(
                '\n',
              );
              result.push(parseLinuxBluetoothInfo(infoFile, macAddr1, macAddr2));
            }
          }
          // determine "connected" with hcitool con
          try {
            const hdicon = (await this.execAsync('hcitool con', util.execOptsLinux))
              .toString()
              .toLowerCase();
            for (let i = 0; i < result.length; i++) {
              if (
                result?.[i]?.macDevice &&
                // @ts-expect-error erroneous warning
                result[i].macDevice.length > 10 &&
                // @ts-expect-error erroneous warning
                hdicon.indexOf(result[i].macDevice.toLowerCase()) >= 0
              ) {
                result[i].connected = true;
              }
            }
          } catch (e) {
            this.logger.debug(e);
            util.noop();
          }

          if (callback) {
            callback(result);
          }
          resolve(result);
        }
        if (this.platform === 'darwin') {
          const cmd = 'system_profiler SPBluetoothDataType -json';
          this.execWithCallback(cmd, (error, stdout) => {
            if (!error) {
              try {
                const outObj = JSON.parse(stdout.toString());
                if (
                  outObj.SPBluetoothDataType &&
                  outObj.SPBluetoothDataType.length &&
                  outObj.SPBluetoothDataType[0] &&
                  outObj.SPBluetoothDataType[0]['device_title'] &&
                  outObj.SPBluetoothDataType[0]['device_title'].length
                ) {
                  // missing: host BT Adapter macAddr ()
                  let macAddr2 = null;
                  if (
                    outObj.SPBluetoothDataType[0]['local_device_title'] &&
                    outObj.SPBluetoothDataType[0].local_device_title.general_address
                  ) {
                    macAddr2 = outObj.SPBluetoothDataType[0].local_device_title.general_address
                      .toLowerCase()
                      .replace(/-/g, ':');
                  }
                  outObj.SPBluetoothDataType[0]['device_title'].forEach((element: any) => {
                    const obj = element;
                    const objKey = Object.keys(obj);
                    if (objKey && objKey.length === 1) {
                      const innerObject = obj[objKey[0]];
                      innerObject.device_name = objKey[0];
                      const bluetoothDevice = parseDarwinBluetoothDevices(innerObject, macAddr2);
                      result.push(bluetoothDevice);
                    }
                  });
                }
                if (
                  outObj.SPBluetoothDataType &&
                  outObj.SPBluetoothDataType.length &&
                  outObj.SPBluetoothDataType[0] &&
                  outObj.SPBluetoothDataType[0]['device_connected'] &&
                  outObj.SPBluetoothDataType[0]['device_connected'].length
                ) {
                  const macAddr2 =
                    outObj.SPBluetoothDataType[0].controller_properties &&
                    outObj.SPBluetoothDataType[0].controller_properties.controller_address
                      ? outObj.SPBluetoothDataType[0].controller_properties.controller_address
                          .toLowerCase()
                          .replace(/-/g, ':')
                      : null;
                  outObj.SPBluetoothDataType[0]['device_connected'].forEach((element: any) => {
                    const obj = element;
                    const objKey = Object.keys(obj);
                    if (objKey && objKey.length === 1) {
                      const innerObject = obj[objKey[0]];
                      innerObject.device_name = objKey[0];
                      innerObject.device_isconnected = 'attrib_Yes';
                      const bluetoothDevice = parseDarwinBluetoothDevices(innerObject, macAddr2);
                      result.push(bluetoothDevice);
                    }
                  });
                }
                if (
                  outObj.SPBluetoothDataType &&
                  outObj.SPBluetoothDataType.length &&
                  outObj.SPBluetoothDataType[0] &&
                  outObj.SPBluetoothDataType[0]['device_not_connected'] &&
                  outObj.SPBluetoothDataType[0]['device_not_connected'].length
                ) {
                  const macAddr2 =
                    outObj.SPBluetoothDataType[0].controller_properties &&
                    outObj.SPBluetoothDataType[0].controller_properties.controller_address
                      ? outObj.SPBluetoothDataType[0].controller_properties.controller_address
                          .toLowerCase()
                          .replace(/-/g, ':')
                      : null;
                  outObj.SPBluetoothDataType[0]['device_not_connected'].forEach((element: any) => {
                    const obj = element;
                    const objKey = Object.keys(obj);
                    if (objKey && objKey.length === 1) {
                      const innerObject = obj[objKey[0]];
                      innerObject.device_name = objKey[0];
                      innerObject.device_isconnected = 'attrib_No';
                      const bluetoothDevice = parseDarwinBluetoothDevices(innerObject, macAddr2);
                      result.push(bluetoothDevice);
                    }
                  });
                }
              } catch (e) {
                this.logger.debug(e);
                util.noop();
              }
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        }
        if (this.platform === 'win32') {
          if (callback) {
            callback(result);
          }
          resolve(result);
          /*
          util
            .powerShell('Get-CimInstance Win32_PNPEntity | select PNPClass, Name, Manufacturer | fl')
            .then((stdout, error) => {
              if (!error) {
                const parts = stdout.toString().split(/\n\s*\n/);
                parts.forEach((part) => {
                  if (util.getValue(part.split('\n'), 'PNPClass', ':') === 'Bluetooth') {
                    result.push(parseWindowsBluetooth(part.split('\n')));
                  }
                });
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            });

           */
        }
        if (
          this.platform === 'openbsd' ||
          this.platform === 'freebsd' ||
          this.platform === 'netbsd' ||
          this.platform === 'sunos'
        ) {
          resolve(null);
        }
      });
    });
  }
}
