import { Systeminformation } from 'ssm-shared-lib';
import logger from '../../../../logger';
import PinoLogger from '../../../../logger';
import { RemoteOS } from '../RemoteOS';
import { Callback, RemoteExecutorType, RemoteExecutorTypeWithCallback } from '../types';
import { parseDarwinUsb, parseLinuxUsb } from './usb.utils';

export default class USBComponent extends RemoteOS {
  private logger = PinoLogger.child({ component: 'USBComponent' });
  constructor(
    remoteExecAsync: RemoteExecutorType,
    remoteExecWithCallback: RemoteExecutorTypeWithCallback,
  ) {
    super(remoteExecAsync, remoteExecWithCallback);
  }

  public usb(callback?: Callback) {
    return new Promise((resolve) => {
      process.nextTick(() => {
        const result: Partial<Systeminformation.UsbData>[] = [];
        if (this.platform === 'linux') {
          const cmd = 'export LC_ALL=C; lsusb -v 2>/dev/null; unset LC_ALL';
          this.execWithCallback(
            cmd,
            (error, stdout) => {
              if (!error) {
                const parts = ('\n\n' + stdout.toString()).split('\n\nBus ');
                for (let i = 1; i < parts.length; i++) {
                  const usb = parseLinuxUsb(parts[i]);
                  result.push(usb);
                }
              } else {
                this.logger.error(error);
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            },
            { maxBuffer: 1024 * 1024 * 128 },
          );
        }
        if (this.platform === 'darwin') {
          const cmd = 'ioreg -p IOUSB -c AppleUSBRootHubDevice -w0 -l';
          this.execWithCallback(
            cmd,
            (error, stdout) => {
              if (!error) {
                const parts = stdout.toString().split(' +-o ');
                for (let i = 1; i < parts.length; i++) {
                  const usb = parseDarwinUsb(parts[i]);
                  if (usb) {
                    result.push(usb);
                  }
                }
                if (callback) {
                  callback(result);
                }
                resolve(result);
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            },
            { maxBuffer: 1024 * 1024 * 128 },
          );
        }
        if (this.platform === 'win32') {
          if (callback) {
            callback(result);
          }
          resolve(result);
          /*
          util.powerShell('Get-CimInstance CIM_LogicalDevice | where { $_.Description -match "USB"} | select Name,CreationClassName,DeviceId,Manufacturer | fl').then((stdout, error) => {
            if (!error) {
              const parts = stdout.toString().split(/\n\s*\n/);
              for (let i = 0; i < parts.length; i++) {
                const usb = parseWindowsUsb(parts[i].split('\n'), i);
                if (usb && result.filter(x => x.deviceId === usb.deviceId).length === 0) {
                  result.push(usb);
                }
              }
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });

           */
        }
        if (
          this.platform === 'sunos' ||
          this.platform === 'freebsd' ||
          this.platform === 'openbsd' ||
          this.platform === 'netbsd'
        ) {
          resolve(null);
        }
      });
    });
  }
}
