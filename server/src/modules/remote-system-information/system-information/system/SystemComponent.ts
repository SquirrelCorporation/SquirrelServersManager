// ==================================================================================
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2024
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================

import { Systeminformation } from 'ssm-shared-lib';
import PinoLogger from '../../../../logger';
import { RemoteOS } from '../RemoteOS';
import { Callback, RemoteExecutorType, RemoteExecutorTypeWithCallback } from '../types';
import * as util from '../utils';
import { chassisTypes } from './system.consts';
import { cleanDefaults, getAppleModel, macOsChassisType, parseDateTime } from './system.utils';

export default class SystemComponent extends RemoteOS {
  private logger = PinoLogger.child({ component: 'SystemComponent' });
  constructor(
    remoteExecAsync: RemoteExecutorType,
    remoteExecWithCallback: RemoteExecutorTypeWithCallback,
  ) {
    super(remoteExecAsync, remoteExecWithCallback);
  }
  public system(callback?: Callback): Promise<Systeminformation.SystemData> {
    return new Promise((resolve) => {
      process.nextTick(() => {
        const result = {
          manufacturer: '',
          model: 'Computer',
          version: '',
          serial: '-',
          uuid: '-',
          sku: '-',
          virtual: false,
        } as Systeminformation.SystemData;

        if (
          this.platform === 'linux' ||
          this.platform === 'freebsd' ||
          this.platform === 'openbsd' ||
          this.platform === 'netbsd'
        ) {
          this.execWithCallback(
            'export LC_ALL=C; dmidecode -t system 2>/dev/null; unset LC_ALL',
            async (error, stdout) => {
              let lines = stdout.toString().split('\n');
              result.manufacturer = cleanDefaults(util.getValue(lines, 'manufacturer'));
              result.model = cleanDefaults(util.getValue(lines, 'product name'));
              result.version = cleanDefaults(util.getValue(lines, 'version'));
              result.serial = cleanDefaults(util.getValue(lines, 'serial number'));
              result.uuid = cleanDefaults(util.getValue(lines, 'uuid')).toLowerCase();
              result.sku = cleanDefaults(util.getValue(lines, 'sku number'));
              // Non-Root values
              const cmd = `echo -n "product_name: "; cat /sys/devices/virtual/dmi/id/product_name 2>/dev/null; echo;
            echo -n "product_serial: "; cat /sys/devices/virtual/dmi/id/product_serial 2>/dev/null; echo;
            echo -n "product_uuid: "; cat /sys/devices/virtual/dmi/id/product_uuid 2>/dev/null; echo;
            echo -n "product_version: "; cat /sys/devices/virtual/dmi/id/product_version 2>/dev/null; echo;
            echo -n "sys_vendor: "; cat /sys/devices/virtual/dmi/id/sys_vendor 2>/dev/null; echo;`;
              try {
                lines = (await this.execAsync(cmd, util.execOptsLinux)).toString().split('\n');
                result.manufacturer = cleanDefaults(
                  result.manufacturer === ''
                    ? util.getValue(lines, 'sys_vendor')
                    : result.manufacturer,
                );
                result.model = cleanDefaults(
                  result.model === '' ? util.getValue(lines, 'product_name') : result.model,
                );
                result.version = cleanDefaults(
                  result.version === '' ? util.getValue(lines, 'product_version') : result.version,
                );
                result.serial = cleanDefaults(
                  result.serial === '' ? util.getValue(lines, 'product_serial') : result.serial,
                );
                result.uuid = cleanDefaults(
                  result.uuid === ''
                    ? util.getValue(lines, 'product_uuid').toLowerCase()
                    : result.uuid,
                );
              } catch (e) {
                this.logger.error(e);
                util.noop();
              }
              if (!result.serial) {
                result.serial = '-';
              }
              if (!result.manufacturer) {
                result.manufacturer = '';
              }
              if (!result.model) {
                result.model = 'Computer';
              }
              if (!result.version) {
                result.version = '';
              }
              if (!result.sku) {
                result.sku = '-';
              }

              // detect virtual (1)
              if (
                result.model.toLowerCase() === 'virtualbox' ||
                result.model.toLowerCase() === 'kvm' ||
                result.model.toLowerCase() === 'virtual machine' ||
                result.model.toLowerCase() === 'bochs' ||
                result.model.toLowerCase().startsWith('vmware') ||
                result.model.toLowerCase().startsWith('droplet')
              ) {
                result.virtual = true;
                switch (result.model.toLowerCase()) {
                  case 'virtualbox':
                    result.virtualHost = 'VirtualBox';
                    break;
                  case 'vmware':
                    result.virtualHost = 'VMware';
                    break;
                  case 'kvm':
                    result.virtualHost = 'KVM';
                    break;
                  case 'bochs':
                    result.virtualHost = 'bochs';
                    break;
                }
              }
              if (
                result.manufacturer.toLowerCase().startsWith('vmware') ||
                result.manufacturer.toLowerCase() === 'xen'
              ) {
                result.virtual = true;
                switch (result.manufacturer.toLowerCase()) {
                  case 'vmware':
                    result.virtualHost = 'VMware';
                    break;
                  case 'xen':
                    result.virtualHost = 'Xen';
                    break;
                }
              }
              if (!result.virtual) {
                try {
                  const disksById = (
                    await this.execAsync('ls -1 /dev/disk/by-id/ 2>/dev/null', util.execOptsLinux)
                  ).toString();
                  if (disksById.indexOf('_QEMU_') >= 0) {
                    result.virtual = true;
                    result.virtualHost = 'QEMU';
                  }
                  if (disksById.indexOf('_VBOX_') >= 0) {
                    result.virtual = true;
                    result.virtualHost = 'VirtualBox';
                  }
                } catch (e) {
                  this.logger.error(e);
                  util.noop();
                }
              }
              if (
                !result.virtual &&
                ((await this.release()).toLowerCase().indexOf('microsoft') >= 0 ||
                  (await this.release()).toLowerCase().endsWith('wsl2'))
              ) {
                const kernelVersion = parseFloat((await this.release()).toLowerCase());
                result.virtual = true;
                result.manufacturer = 'Microsoft';
                result.model = 'WSL';
                result.version = kernelVersion < 4.19 ? '1' : '2';
              }
              if (
                (this.platform === 'freebsd' ||
                  this.platform === 'openbsd' ||
                  this.platform === 'netbsd') &&
                !result.virtualHost
              ) {
                try {
                  const procInfo = await this.execAsync('dmidecode -t 4', util.execOptsLinux);
                  const procLines = procInfo.toString().split('\n');
                  const procManufacturer = util.getValue(procLines, 'manufacturer', ':', true);
                  switch (procManufacturer.toLowerCase()) {
                    case 'virtualbox':
                      result.virtualHost = 'VirtualBox';
                      break;
                    case 'vmware':
                      result.virtualHost = 'VMware';
                      break;
                    case 'kvm':
                      result.virtualHost = 'KVM';
                      break;
                    case 'bochs':
                      result.virtualHost = 'bochs';
                      break;
                  }
                } catch (e) {
                  this.logger.error(e);
                  util.noop();
                }
              }
              // detect docker
              if (
                (await this.fileExists('/.dockerenv')) ||
                (await this.fileExists('/.dockerinit'))
              ) {
                result.model = 'Docker Container';
              }
              try {
                const stdout = await this.execAsync(
                  'dmesg 2>/dev/null | grep -iE "virtual|hypervisor" | grep -iE "vmware|qemu|kvm|xen" | grep -viE "Nested Virtualization|/virtual/"',
                );
                // detect virtual machines
                const lines = stdout.toString().split('\n');
                if (lines.length > 0) {
                  if (result.model === 'Computer') {
                    result.model = 'Virtual machine';
                  }
                  result.virtual = true;
                  if (
                    stdout.toString().toLowerCase().indexOf('vmware') >= 0 &&
                    !result.virtualHost
                  ) {
                    result.virtualHost = 'VMware';
                  }
                  if (stdout.toString().toLowerCase().indexOf('qemu') >= 0 && !result.virtualHost) {
                    result.virtualHost = 'QEMU';
                  }
                  if (stdout.toString().toLowerCase().indexOf('xen') >= 0 && !result.virtualHost) {
                    result.virtualHost = 'Xen';
                  }
                  if (stdout.toString().toLowerCase().indexOf('kvm') >= 0 && !result.virtualHost) {
                    result.virtualHost = 'KVM';
                  }
                }
              } catch (e) {
                this.logger.debug(e);
                util.noop();
              }

              if (
                result.manufacturer === '' &&
                result.model === 'Computer' &&
                result.version === ''
              ) {
                // Check Raspberry Pi
                this.readFileWithCallback('/proc/cpuinfo', async (error, stdout) => {
                  if (!error) {
                    const lines = stdout.toString().split('\n');
                    result.model = util.getValue(lines, 'hardware', ':', true).toUpperCase();
                    result.version = util.getValue(lines, 'revision', ':', true).toLowerCase();
                    result.serial = util.getValue(lines, 'serial', ':', true);
                    // reference values: https://elinux.org/RPi_HardwareHistory
                    // https://www.raspberrypi.org/documentation/hardware/raspberrypi/revision-codes/README.md
                    if (await this.isRaspberry(lines)) {
                      const rPIRevision = this.decodePiCpuinfo(lines);
                      result.model = rPIRevision.model as string;
                      result.version = rPIRevision.revisionCode as string;
                      result.manufacturer = 'Raspberry Pi Foundation';
                      result.raspberry = {
                        manufacturer: rPIRevision.manufacturer as string,
                        processor: rPIRevision.processor as string,
                        type: rPIRevision.type as string,
                        revision: rPIRevision.revision as string,
                      };
                    }
                  }
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
              }
            },
          );
        }
        if (this.platform === 'darwin') {
          this.execWithCallback('ioreg -c IOPlatformExpertDevice -d 2', (error, stdout) => {
            if (!error) {
              const lines = stdout.toString().replace(/[<>"]/g, '').split('\n');

              const model = getAppleModel(util.getValue(lines, 'model', '=', true));
              // const modelParts = util.splitByNumber(model);
              // const version = util.getValue(lines, 'version', '=', true);
              result.manufacturer = util.getValue(lines, 'manufacturer', '=', true);
              result.model = model.key;
              result.type = macOsChassisType(model.version);
              result.version = model.version;
              result.serial = util.getValue(lines, 'ioplatformserialnumber', '=', true);
              result.uuid = util.getValue(lines, 'ioplatformuuid', '=', true).toLowerCase();
              result.sku =
                util.getValue(lines, 'board-id', '=', true) ||
                util.getValue(lines, 'target-sub-type', '=', true);
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        }
        if (this.platform === 'sunos') {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
        if (this.platform === 'win32') {
          if (callback) {
            callback(result);
          }
          resolve(result);
          /*
          try {
            util.powerShell('Get-CimInstance Win32_ComputerSystemProduct | select Name,Vendor,Version,IdentifyingNumber,UUID | fl').then((stdout, error) => {
              if (!error) {
                let lines = stdout.split('\r\n');
                result.manufacturer = util.getValue(lines, 'vendor', ':');
                result.model = util.getValue(lines, 'name', ':');
                result.version = util.getValue(lines, 'version', ':');
                result.serial = util.getValue(lines, 'identifyingnumber', ':');
                result.uuid = util.getValue(lines, 'uuid', ':').toLowerCase();
                // detect virtual (1)
                const model = result.model.toLowerCase();
                if (model === 'virtualbox' || model === 'kvm' || model === 'virtual machine' || model === 'bochs' || model.startsWith('vmware') || model.startsWith('qemu') || model.startsWith('parallels')) {
                  result.virtual = true;
                  if (model.startsWith('virtualbox')) { result.virtualHost = 'VirtualBox'; }
                  if (model.startsWith('vmware')) { result.virtualHost = 'VMware'; }
                  if (model.startsWith('kvm')) { result.virtualHost = 'KVM'; }
                  if (model.startsWith('bochs')) { result.virtualHost = 'bochs'; }
                  if (model.startsWith('qemu')) { result.virtualHost = 'KVM'; }
                  if (model.startsWith('parallels')) { result.virtualHost = 'Parallels'; }
                }
                const manufacturer = result.manufacturer.toLowerCase();
                if (manufacturer.startsWith('vmware') || manufacturer.startsWith('qemu') || manufacturer === 'xen' || manufacturer.startsWith('parallels')) {
                  result.virtual = true;
                  if (manufacturer.startsWith('vmware')) { result.virtualHost = 'VMware'; }
                  if (manufacturer.startsWith('xen')) { result.virtualHost = 'Xen'; }
                  if (manufacturer.startsWith('qemu')) { result.virtualHost = 'KVM'; }
                  if (manufacturer.startsWith('parallels')) { result.virtualHost = 'Parallels'; }
                }
                util.powerShell('Get-CimInstance MS_Systeminformation -Namespace "root/wmi" | select systemsku | fl ').then((stdout, error) => {
                  if (!error) {
                    let lines = stdout.split('\r\n');
                    result.sku = util.getValue(lines, 'systemsku', ':');
                  }
                  if (!result.virtual) {
                    util.powerShell('Get-CimInstance Win32_bios | select Version, SerialNumber, SMBIOSBIOSVersion').then((stdout, error) => {
                      if (!error) {
                        let lines = stdout.toString();
                        if (lines.indexOf('VRTUAL') >= 0 || lines.indexOf('A M I ') >= 0 || lines.indexOf('VirtualBox') >= 0 || lines.indexOf('VMWare') >= 0 || lines.indexOf('Xen') >= 0 || lines.indexOf('Parallels') >= 0) {
                          result.virtual = true;
                          if (lines.indexOf('VirtualBox') >= 0 && !result.virtualHost) {
                            result.virtualHost = 'VirtualBox';
                          }
                          if (lines.indexOf('VMware') >= 0 && !result.virtualHost) {
                            result.virtualHost = 'VMware';
                          }
                          if (lines.indexOf('Xen') >= 0 && !result.virtualHost) {
                            result.virtualHost = 'Xen';
                          }
                          if (lines.indexOf('VRTUAL') >= 0 && !result.virtualHost) {
                            result.virtualHost = 'Hyper-V';
                          }
                          if (lines.indexOf('A M I') >= 0 && !result.virtualHost) {
                            result.virtualHost = 'Virtual PC';
                          }
                          if (lines.indexOf('Parallels') >= 0 && !result.virtualHost) {
                            result.virtualHost = 'Parallels';
                          }
                        }
                        if (callback) { callback(result); }
                        resolve(result);
                      } else {
                        if (callback) { callback(result); }
                        resolve(result);
                      }
                    });
                  } else {
                    if (callback) { callback(result); }
                    resolve(result);
                  }
                });
              } else {
                if (callback) { callback(result); }
                resolve(result);
              }
            });
          } catch (e) {
            if (callback) { callback(result); }
            resolve(result);
          }

           */
        }
      });
    });
  }

  public bios(callback?: Callback) {
    return new Promise((resolve) => {
      process.nextTick(() => {
        const result = {
          vendor: '',
          version: '',
          releaseDate: '',
          revision: '',
        } as Systeminformation.BiosData;

        let cmd = '';
        if (
          this.platform === 'linux' ||
          this.platform === 'freebsd' ||
          this.platform === 'openbsd' ||
          this.platform === 'netbsd'
        ) {
          if (process.arch === 'arm') {
            cmd = 'cat /proc/cpuinfo | grep Serial';
          } else {
            cmd = 'export LC_ALL=C; dmidecode -t bios 2>/dev/null; unset LC_ALL';
          }
          this.execWithCallback(cmd, async (error, stdout) => {
            let lines = stdout.toString().split('\n');
            result.vendor = util.getValue(lines, 'Vendor');
            result.version = util.getValue(lines, 'Version');
            let datetime = util.getValue(lines, 'Release Date');
            result.releaseDate = parseDateTime(datetime).date as string;
            result.revision = util.getValue(lines, 'BIOS Revision');
            result.serial = util.getValue(lines, 'SerialNumber');
            const language = util.getValue(lines, 'Currently Installed Language').split('|')[0];
            if (language) {
              result.language = language;
            }
            if (lines.length && stdout.toString().indexOf('Characteristics:') >= 0) {
              const features: string[] = [];
              lines.forEach((line) => {
                if (line.indexOf(' is supported') >= 0) {
                  const feature = line.split(' is supported')[0].trim();
                  features.push(feature);
                }
              });
              result.features = features;
            }
            // Non-Root values
            const cmd = `echo -n "bios_date: "; cat /sys/devices/virtual/dmi/id/bios_date 2>/dev/null; echo;
            echo -n "bios_vendor: "; cat /sys/devices/virtual/dmi/id/bios_vendor 2>/dev/null; echo;
            echo -n "bios_version: "; cat /sys/devices/virtual/dmi/id/bios_version 2>/dev/null; echo;`;
            try {
              lines = (await this.execAsync(cmd, util.execOptsLinux)).toString().split('\n');
              result.vendor = !result.vendor ? util.getValue(lines, 'bios_vendor') : result.vendor;
              result.version = !result.version
                ? util.getValue(lines, 'bios_version')
                : result.version;
              datetime = util.getValue(lines, 'bios_date');
              result.releaseDate = !result.releaseDate
                ? (parseDateTime(datetime).date as string)
                : result.releaseDate;
            } catch (e) {
              this.logger.error(e);
              util.noop();
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        }
        if (this.platform === 'darwin') {
          result.vendor = 'Apple Inc.';
          this.execWithCallback('system_profiler SPHardwareDataType -json', (error, stdout) => {
            try {
              const hardwareData = JSON.parse(stdout.toString());
              if (
                hardwareData &&
                hardwareData.SPHardwareDataType &&
                hardwareData.SPHardwareDataType.length
              ) {
                let bootRomVersion = hardwareData.SPHardwareDataType[0].boot_rom_version;
                bootRomVersion = bootRomVersion ? bootRomVersion.split('(')[0].trim() : null;
                result.version = bootRomVersion;
              }
            } catch (e) {
              this.logger.error(e);
              util.noop();
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        }
        if (this.platform === 'sunos') {
          result.vendor = 'Sun Microsystems';
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
        if (this.platform === 'win32') {
          if (callback) {
            callback(result);
          }
          resolve(result);
          /*
          try {
            util.powerShell('Get-CimInstance Win32_bios | select Description,Version,Manufacturer,@{n="ReleaseDate";e={$_.ReleaseDate.ToString("yyyy-MM-dd")}},BuildNumber,SerialNumber,SMBIOSBIOSVersion | fl').then((stdout, error) => {
              if (!error) {
                let lines = stdout.toString().split('\r\n');
                const description = util.getValue(lines, 'description', ':');
                const version = util.getValue(lines, 'SMBIOSBIOSVersion', ':');
                if (description.indexOf(' Version ') !== -1) {
                  // ... Phoenix ROM BIOS PLUS Version 1.10 A04
                  result.vendor = description.split(' Version ')[0].trim();
                  result.version = description.split(' Version ')[1].trim();
                } else if (description.indexOf(' Ver: ') !== -1) {
                  // ... BIOS Date: 06/27/16 17:50:16 Ver: 1.4.5
                  result.vendor = util.getValue(lines, 'manufacturer', ':');
                  result.version = description.split(' Ver: ')[1].trim();
                } else {
                  result.vendor = util.getValue(lines, 'manufacturer', ':');
                  result.version = version || util.getValue(lines, 'version', ':');
                }
                result.releaseDate = util.getValue(lines, 'releasedate', ':');
                result.revision = util.getValue(lines, 'buildnumber', ':');
                result.serial = cleanDefaults(util.getValue(lines, 'serialnumber', ':'));
              }

              if (callback) { callback(result); }
              resolve(result);
            });
          } catch (e) {
            if (callback) { callback(result); }
            resolve(result);
          }

           */
        }
      });
    });
  }

  public baseboard(callback?: Callback): Promise<Systeminformation.BaseboardData> {
    return new Promise((resolve) => {
      process.nextTick(() => {
        const result = {
          manufacturer: '',
          model: '',
          version: '',
          serial: '-',
          assetTag: '-',
          memMax: null,
          memSlots: null,
        } as Systeminformation.BaseboardData;
        let cmd = '';
        if (
          this.platform === 'linux' ||
          this.platform === 'freebsd' ||
          this.platform === 'openbsd' ||
          this.platform === 'netbsd'
        ) {
          if (process.arch === 'arm') {
            cmd = 'cat /proc/cpuinfo | grep Serial';
            // 'BCM2709', 'BCM2835', 'BCM2708' -->
          } else {
            cmd = 'export LC_ALL=C; dmidecode -t 2 2>/dev/null; unset LC_ALL';
          }
          const workload: Promise<any>[] = [];
          workload.push(this.execAsync(cmd));
          workload.push(this.execAsync('export LC_ALL=C; dmidecode -t memory 2>/dev/null'));
          util.promiseAll(workload).then(async (data) => {
            let lines = data.results[0] ? data.results[0].toString().split('\n') : [''];
            result.manufacturer = cleanDefaults(util.getValue(lines, 'Manufacturer'));
            result.model = cleanDefaults(util.getValue(lines, 'Product Name'));
            result.version = cleanDefaults(util.getValue(lines, 'Version'));
            result.serial = cleanDefaults(util.getValue(lines, 'Serial Number'));
            result.assetTag = cleanDefaults(util.getValue(lines, 'Asset Tag'));
            // Non-Root values
            const cmd = `echo -n "board_asset_tag: "; cat /sys/devices/virtual/dmi/id/board_asset_tag 2>/dev/null; echo;
            echo -n "board_name: "; cat /sys/devices/virtual/dmi/id/board_name 2>/dev/null; echo;
            echo -n "board_serial: "; cat /sys/devices/virtual/dmi/id/board_serial 2>/dev/null; echo;
            echo -n "board_vendor: "; cat /sys/devices/virtual/dmi/id/board_vendor 2>/dev/null; echo;
            echo -n "board_version: "; cat /sys/devices/virtual/dmi/id/board_version 2>/dev/null; echo;`;
            try {
              lines = (await this.execAsync(cmd, util.execOptsLinux)).toString().split('\n');
              result.manufacturer = cleanDefaults(
                !result.manufacturer ? util.getValue(lines, 'board_vendor') : result.manufacturer,
              );
              result.model = cleanDefaults(
                !result.model ? util.getValue(lines, 'board_name') : result.model,
              );
              result.version = cleanDefaults(
                !result.version ? util.getValue(lines, 'board_version') : result.version,
              );
              result.serial = cleanDefaults(
                !result.serial ? util.getValue(lines, 'board_serial') : result.serial,
              );
              result.assetTag = cleanDefaults(
                !result.assetTag ? util.getValue(lines, 'board_asset_tag') : result.assetTag,
              );
            } catch (e) {
              this.logger.debug(e);
              util.noop();
            }

            // mem
            lines = data.results[1] ? data.results[1].toString().split('\n') : [''];
            result.memMax =
              util.toInt(util.getValue(lines, 'Maximum Capacity')) * 1024 * 1024 * 1024 || null;
            result.memSlots = util.toInt(util.getValue(lines, 'Number Of Devices')) || null;

            // raspberry
            if (await this.isRaspberry()) {
              const rpi = this.decodePiCpuinfo();
              result.manufacturer = rpi.manufacturer as string;
              result.model = 'Raspberry Pi';
              result.serial = rpi.serial as string;
              result.version = rpi.type + ' - ' + rpi.revision;
              result.memMax = await this.totalmem();
              result.memSlots = 0;
            }

            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        }
        if (this.platform === 'darwin') {
          const workload: Promise<string>[] = [];
          workload.push(this.execAsync('ioreg -c IOPlatformExpertDevice -d 2'));
          workload.push(this.execAsync('system_profiler SPMemoryDataType'));
          util.promiseAll(workload).then(async (data) => {
            const lines = data.results[0]
              ? data.results[0].toString().replace(/[<>"]/g, '').split('\n')
              : [''];
            result.manufacturer = util.getValue(lines, 'manufacturer', '=', true);
            result.model = util.getValue(lines, 'model', '=', true);
            result.version = util.getValue(lines, 'version', '=', true);
            result.serial = util.getValue(lines, 'ioplatformserialnumber', '=', true);
            result.assetTag = util.getValue(lines, 'board-id', '=', true);

            // mem
            let devices = data.results[1]
              ? data.results[1].toString().split('        BANK ')
              : [''];
            if (devices.length === 1) {
              devices = data.results[1] ? data.results[1].toString().split('        DIMM') : [''];
            }
            devices.shift();
            result.memSlots = devices.length;

            if ((await this.arch()) === 'arm64') {
              result.memSlots = 0;
              result.memMax = await this.totalmem();
            }

            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        }
        if (this.platform === 'sunos') {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
        if (this.platform === 'win32') {
          if (callback) {
            callback(result);
          }
          resolve(result);
          /*
          try {
            const workload = [];
            const win10plus = parseInt(os.release()) >= 10;
            const maxCapacityAttribute = win10plus ? 'MaxCapacityEx' : 'MaxCapacity';
            workload.push(util.powerShell('Get-CimInstance Win32_baseboard | select Model,Manufacturer,Product,Version,SerialNumber,PartNumber,SKU | fl'));
            workload.push(util.powerShell(`Get-CimInstance Win32_physicalmemoryarray | select ${maxCapacityAttribute}, MemoryDevices | fl`));
            util.promiseAll(
              workload
            ).then((data) => {
              let lines = data.results[0] ? data.results[0].toString().split('\r\n') : [''];

              result.manufacturer = cleanDefaults(util.getValue(lines, 'manufacturer', ':'));
              result.model = cleanDefaults(util.getValue(lines, 'model', ':'));
              if (!result.model) {
                result.model = cleanDefaults(util.getValue(lines, 'product', ':'));
              }
              result.version = cleanDefaults(util.getValue(lines, 'version', ':'));
              result.serial = cleanDefaults(util.getValue(lines, 'serialnumber', ':'));
              result.assetTag = cleanDefaults(util.getValue(lines, 'partnumber', ':'));
              if (!result.assetTag) {
                result.assetTag = cleanDefaults(util.getValue(lines, 'sku', ':'));
              }

              // memphysical
              lines = data.results[1] ? data.results[1].toString().split('\r\n') : [''];
              result.memMax = util.toInt(util.getValue(lines, maxCapacityAttribute, ':')) * (win10plus ? 1024 : 1) || null;
              result.memSlots = util.toInt(util.getValue(lines, 'MemoryDevices', ':')) || null;

              if (callback) { callback(result); }
              resolve(result);
            });
          } catch (e) {
            if (callback) { callback(result); }
            resolve(result);
          }

           */
        }
      });
    });
  }

  public chassis(callback?: Callback): Promise<Systeminformation.ChassisData> {
    return new Promise((resolve) => {
      process.nextTick(() => {
        const result = {
          manufacturer: '',
          model: '',
          type: '',
          version: '',
          serial: '-',
          assetTag: '-',
          sku: '',
        } as Systeminformation.ChassisData;

        if (
          this.platform === 'linux' ||
          this.platform === 'freebsd' ||
          this.platform === 'openbsd' ||
          this.platform === 'netbsd'
        ) {
          const cmd = `echo -n "chassis_asset_tag: "; cat /sys/devices/virtual/dmi/id/chassis_asset_tag 2>/dev/null; echo;
            echo -n "chassis_serial: "; cat /sys/devices/virtual/dmi/id/chassis_serial 2>/dev/null; echo;
            echo -n "chassis_type: "; cat /sys/devices/virtual/dmi/id/chassis_type 2>/dev/null; echo;
            echo -n "chassis_vendor: "; cat /sys/devices/virtual/dmi/id/chassis_vendor 2>/dev/null; echo;
            echo -n "chassis_version: "; cat /sys/devices/virtual/dmi/id/chassis_version 2>/dev/null; echo;`;
          this.execWithCallback(cmd, (error, stdout) => {
            const lines = stdout.toString().split('\n');
            result.manufacturer = cleanDefaults(util.getValue(lines, 'chassis_vendor'));
            const ctype = parseInt(util.getValue(lines, 'chassis_type').replace(/\D/g, ''));
            result.type = cleanDefaults(
              ctype && !isNaN(ctype) && ctype < chassisTypes.length ? chassisTypes[ctype - 1] : '',
            );
            result.version = cleanDefaults(util.getValue(lines, 'chassis_version'));
            result.serial = cleanDefaults(util.getValue(lines, 'chassis_serial'));
            result.assetTag = cleanDefaults(util.getValue(lines, 'chassis_asset_tag'));

            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        }
        if (this.platform === 'darwin') {
          this.execWithCallback('ioreg -c IOPlatformExpertDevice -d 2', (error, stdout) => {
            if (!error) {
              const lines = stdout.toString().replace(/[<>"]/g, '').split('\n');
              const model = getAppleModel(util.getValue(lines, 'model', '=', true));
              // const modelParts = util.splitByNumber(model);
              // const version = util.getValue(lines, 'version', '=', true);
              result.manufacturer = util.getValue(lines, 'manufacturer', '=', true);
              result.model = model.key;
              result.type = macOsChassisType(model.model);
              result.version = model.version;
              result.serial = util.getValue(lines, 'ioplatformserialnumber', '=', true);
              result.assetTag =
                util.getValue(lines, 'board-id', '=', true) ||
                util.getValue(lines, 'target-type', '=', true);
              result.sku = util.getValue(lines, 'target-sub-type', '=', true);
            }

            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        }
        if (this.platform === 'sunos') {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
        if (this.platform === 'win32') {
          if (callback) {
            callback(result);
          }
          resolve(result);
          /*
          try {
            util.powerShell('Get-CimInstance Win32_SystemEnclosure | select Model,Manufacturer,ChassisTypes,Version,SerialNumber,PartNumber,SKU,SMBIOSAssetTag | fl').then((stdout, error) => {
              if (!error) {
                let lines = stdout.toString().split('\r\n');

                result.manufacturer = cleanDefaults(util.getValue(lines, 'manufacturer', ':'));
                result.model = cleanDefaults(util.getValue(lines, 'model', ':'));
                const ctype = parseInt(util.getValue(lines, 'ChassisTypes', ':').replace(/\D/g, ''));
                result.type = (ctype && !isNaN(ctype) && ctype < chassisTypes.length) ? chassisTypes[ctype - 1] : '';
                result.version = cleanDefaults(util.getValue(lines, 'version', ':'));
                result.serial = cleanDefaults(util.getValue(lines, 'serialnumber', ':'));
                result.assetTag = cleanDefaults(util.getValue(lines, 'partnumber', ':'));
                if (!result.assetTag) {
                  result.assetTag = cleanDefaults(util.getValue(lines, 'SMBIOSAssetTag', ':'));
                }
                result.sku = cleanDefaults(util.getValue(lines, 'sku', ':'));
              }

              if (callback) { callback(result); }
              resolve(result);
            });
          } catch (e) {
            if (callback) { callback(result); }
            resolve(result);
          }*/
        }
      });
    });
  }
}
