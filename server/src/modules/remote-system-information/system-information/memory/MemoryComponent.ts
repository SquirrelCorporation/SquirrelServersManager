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
import * as util from '../utils';
import { Callback, RemoteExecutorType, RemoteExecutorTypeWithCallback } from '../types';
import { getManufacturerDarwin, getManufacturerLinux } from './memory.utils';

export default class MemoryComponent extends RemoteOS {
  private logger = PinoLogger.child({ component: 'MemoryComponent' });

  constructor(
    remoteExecAsync: RemoteExecutorType,
    remoteExecWithCallback: RemoteExecutorTypeWithCallback,
  ) {
    super(remoteExecAsync, remoteExecWithCallback);
  }

  // _______________________________________________________________________________________
  // |                         R A M                              |          H D           |
  // |______________________|_________________________|           |                        |
  // |        active             buffers/cache        |           |                        |
  // |________________________________________________|___________|_________|______________|
  // |                     used                            free   |   used       free      |
  // |____________________________________________________________|________________________|
  // |                        total                               |          swap          |
  // |____________________________________________________________|________________________|

  // free (older versions)
  // ----------------------------------
  // # free
  //              total       used        free     shared    buffers     cached
  // Mem:         16038 (1)   15653 (2)   384 (3)  0 (4)     236 (5)     14788 (6)
  // -/+ buffers/cache:       628 (7)     15409 (8)
  // Swap:        16371         83      16288
  //
  // |------------------------------------------------------------|
  // |                           R A M                            |
  // |______________________|_____________________________________|
  // | active (2-(5+6) = 7) |  available (3+5+6 = 8)              |
  // |______________________|_________________________|___________|
  // |        active        |  buffers/cache (5+6)    |           |
  // |________________________________________________|___________|
  // |                   used (2)                     | free (3)  |
  // |____________________________________________________________|
  // |                          total (1)                         |
  // |____________________________________________________________|

  //
  // free (since free von procps-ng 3.3.10)
  // ----------------------------------
  // # free
  //              total       used        free     shared    buffers/cache   available
  // Mem:         16038 (1)   628 (2)     386 (3)  0 (4)     15024 (5)     14788 (6)
  // Swap:        16371         83      16288
  //
  // |------------------------------------------------------------|
  // |                           R A M                            |
  // |______________________|_____________________________________|
  // |                      |      available (6) estimated        |
  // |______________________|_________________________|___________|
  // |     active (2)       |   buffers/cache (5)     | free (3)  |
  // |________________________________________________|___________|
  // |                          total (1)                         |
  // |____________________________________________________________|
  //
  // Reference: http://www.software-architect.net/blog/article/date/2015/06/12/-826c6e5052.html

  // /procs/meminfo - sample (all in kB)
  //
  // MemTotal: 32806380 kB
  // MemFree: 17977744 kB
  // MemAvailable: 19768972 kB
  // Buffers: 517028 kB
  // Cached: 2161876 kB
  // SwapCached: 456 kB
  // Active: 12081176 kB
  // Inactive: 2164616 kB
  // Active(anon): 10832884 kB
  // Inactive(anon): 1477272 kB
  // Active(file): 1248292 kB
  // Inactive(file): 687344 kB
  // Unevictable: 0 kB
  // Mlocked: 0 kB
  // SwapTotal: 16768892 kB
  // SwapFree: 16768304 kB
  // Dirty: 268 kB
  // Writeback: 0 kB
  // AnonPages: 11568832 kB
  // Mapped: 719992 kB
  // Shmem: 743272 kB
  // Slab: 335716 kB
  // SReclaimable: 256364 kB
  // SUnreclaim: 79352 kB

  public mem(callback?: Callback): Promise<Systeminformation.MemData> {
    return new Promise((resolve) => {
      process.nextTick(async () => {
        const result = {
          total: await this.totalmem(),
          free: await this.freemem(),
          used: (await this.totalmem()) - (await this.freemem()),

          active: (await this.totalmem()) - (await this.freemem()), // temporarily (fallback)
          available: await this.freemem(), // temporarily (fallback)
          buffers: 0,
          cached: 0,
          slab: 0,
          buffcache: 0,

          swaptotal: 0,
          swapused: 0,
          swapfree: 0,
          writeback: null,
          dirty: null,
        } as Systeminformation.MemData;

        if (this.platform === 'linux') {
          try {
            this.readFileWithCallback('/proc/meminfo', async (error, stdout) => {
              if (!error) {
                const lines = stdout.toString().split('\n');
                result.total = parseInt(util.getValue(lines, 'memtotal'), 10);
                result.total = result.total ? result.total * 1024 : await this.totalmem();
                result.free = parseInt(util.getValue(lines, 'memfree'), 10);
                result.free = result.free ? result.free * 1024 : await this.freemem();
                result.used = result.total - result.free;

                result.buffers = parseInt(util.getValue(lines, 'buffers'), 10);
                result.buffers = result.buffers ? result.buffers * 1024 : 0;
                result.cached = parseInt(util.getValue(lines, 'cached'), 10);
                result.cached = result.cached ? result.cached * 1024 : 0;
                result.slab = parseInt(util.getValue(lines, 'slab'), 10);
                result.slab = result.slab ? result.slab * 1024 : 0;
                result.buffcache = result.buffers + result.cached + result.slab;

                const available = parseInt(util.getValue(lines, 'memavailable'), 10);
                result.available = available ? available * 1024 : result.free + result.buffcache;
                result.active = result.total - result.available;

                result.swaptotal = parseInt(util.getValue(lines, 'swaptotal'), 10);
                result.swaptotal = result.swaptotal ? result.swaptotal * 1024 : 0;
                result.swapfree = parseInt(util.getValue(lines, 'swapfree'), 10);
                result.swapfree = result.swapfree ? result.swapfree * 1024 : 0;
                result.swapused = result.swaptotal - result.swapfree;
                result.writeback = parseInt(util.getValue(lines, 'writeback'), 10);
                result.writeback = result.writeback ? result.writeback * 1024 : 0;
                result.dirty = parseInt(util.getValue(lines, 'dirty'), 10);
                result.dirty = result.dirty ? result.dirty * 1024 : 0;
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            });
          } catch {
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        }
        if (
          this.platform === 'freebsd' ||
          this.platform === 'openbsd' ||
          this.platform === 'netbsd'
        ) {
          try {
            this.execWithCallback(
              '/sbin/sysctl hw.realmem hw.physmem vm.stats.vm.v_page_count vm.stats.vm.v_wire_count vm.stats.vm.v_active_count vm.stats.vm.v_inactive_count vm.stats.vm.v_cache_count vm.stats.vm.v_free_count vm.stats.vm.v_page_size',
              (error, stdout) => {
                if (!error) {
                  const lines = stdout.toString().split('\n');
                  const pagesize = parseInt(util.getValue(lines, 'vm.stats.vm.v_page_size'), 10);
                  const inactive =
                    parseInt(util.getValue(lines, 'vm.stats.vm.v_inactive_count'), 10) * pagesize;
                  const cache =
                    parseInt(util.getValue(lines, 'vm.stats.vm.v_cache_count'), 10) * pagesize;

                  result.total = parseInt(util.getValue(lines, 'hw.realmem'), 10);
                  if (isNaN(result.total)) {
                    result.total = parseInt(util.getValue(lines, 'hw.physmem'), 10);
                  }
                  result.free =
                    parseInt(util.getValue(lines, 'vm.stats.vm.v_free_count'), 10) * pagesize;
                  result.buffcache = inactive + cache;
                  result.available = result.buffcache + result.free;
                  result.active = result.total - result.free - result.buffcache;

                  result.swaptotal = 0;
                  result.swapfree = 0;
                  result.swapused = 0;
                }
                if (callback) {
                  callback(result);
                }
                resolve(result);
              },
            );
          } catch {
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        }
        if (this.platform === 'sunos') {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
        if (this.platform === 'darwin') {
          let pageSize = 4096;
          try {
            const sysPpageSize = util.toInt(
              (await this.execAsync('sysctl -n vm.pagesize')).toString(),
            );
            pageSize = sysPpageSize || pageSize;
          } catch (e) {
            this.logger.error(e);
            util.noop();
          }
          try {
            this.execWithCallback('vm_stat 2>/dev/null | grep "Pages active"', (error, stdout) => {
              if (!error) {
                const lines = stdout.toString().split('\n');

                result.active = parseInt(lines[0].split(':')[1], 10) * pageSize;
                result.buffcache = result.used - result.active;
                result.available = result.free + result.buffcache;
              }
              this.execWithCallback('sysctl -n vm.swapusage 2>/dev/null', (error, stdout) => {
                if (!error) {
                  const lines = stdout.toString().split('\n');
                  if (lines.length > 0) {
                    const firstline = lines[0].replace(/,/g, '.').replace(/M/g, '');
                    const lineArray = firstline.trim().split('  ');
                    lineArray.forEach((line) => {
                      if (line.toLowerCase().indexOf('total') !== -1) {
                        result.swaptotal = parseFloat(line.split('=')[1].trim()) * 1024 * 1024;
                      }
                      if (line.toLowerCase().indexOf('used') !== -1) {
                        result.swapused = parseFloat(line.split('=')[1].trim()) * 1024 * 1024;
                      }
                      if (line.toLowerCase().indexOf('free') !== -1) {
                        result.swapfree = parseFloat(line.split('=')[1].trim()) * 1024 * 1024;
                      }
                    });
                  }
                }
                if (callback) {
                  callback(result);
                }
                resolve(result);
              });
            });
          } catch {
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
        }
        if (this.platform === 'win32') {
          if (callback) {
            callback(result);
          }
          resolve(result);
          /*
          let swaptotal = 0;
          let swapused = 0;
          try {
            util.powerShell('Get-CimInstance Win32_PageFileUsage | Select AllocatedBaseSize, CurrentUsage').then((stdout, error) => {
              if (!error) {
                let lines = stdout.split('\r\n').filter(line => line.trim() !== '').filter((line, idx) => idx > 0);
                lines.forEach(function (line) {
                  if (line !== '') {
                    line = line.trim().split(/\s\s+/);
                    swaptotal = swaptotal + (parseInt(line[0], 10) || 0);
                    swapused = swapused + (parseInt(line[1], 10) || 0);
                  }
                });
              }
              result.swaptotal = swaptotal * 1024 * 1024;
              result.swapused = swapused * 1024 * 1024;
              result.swapfree = result.swaptotal - result.swapused;

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

  public memLayout(callback?: Callback): Promise<Systeminformation.MemLayoutData[]> {
    return new Promise((resolve) => {
      process.nextTick(async () => {
        const result: Systeminformation.MemLayoutData[] = [];
        if (
          this.platform === 'linux' ||
          this.platform === 'freebsd' ||
          this.platform === 'openbsd' ||
          this.platform === 'netbsd'
        ) {
          this.execWithCallback(
            'export LC_ALL=C; dmidecode -t memory 2>/dev/null | grep -iE "Size:|Type|Speed|Manufacturer|Form Factor|Locator|Memory Device|Serial Number|Voltage|Part Number"; unset LC_ALL',
            async (error, stdout) => {
              if (!error) {
                const devices = stdout.toString().split('Memory Device');
                devices.shift();
                devices.forEach(function (device) {
                  const lines = device.split('\n');
                  const sizeString = util.getValue(lines, 'Size');
                  const size =
                    sizeString.indexOf('GB') >= 0
                      ? parseInt(sizeString, 10) * 1024 * 1024 * 1024
                      : parseInt(sizeString, 10) * 1024 * 1024;
                  let bank = util.getValue(lines, 'Bank Locator');
                  if (bank.toLowerCase().indexOf('bad') >= 0) {
                    bank = '';
                  }
                  if (parseInt(util.getValue(lines, 'Size'), 10) > 0) {
                    const totalWidth = util.toInt(util.getValue(lines, 'Total Width'));
                    const dataWidth = util.toInt(util.getValue(lines, 'Data Width'));
                    result.push({
                      size,
                      bank,
                      type: util.getValue(lines, 'Type:'),
                      ecc: dataWidth && totalWidth ? totalWidth > dataWidth : false,
                      clockSpeed: util.getValue(lines, 'Configured Clock Speed:')
                        ? parseInt(util.getValue(lines, 'Configured Clock Speed:'), 10)
                        : util.getValue(lines, 'Speed:')
                          ? parseInt(util.getValue(lines, 'Speed:'), 10)
                          : null,
                      formFactor: util.getValue(lines, 'Form Factor:'),
                      manufacturer: getManufacturerLinux(util.getValue(lines, 'Manufacturer:')),
                      partNum: util.getValue(lines, 'Part Number:'),
                      serialNum: util.getValue(lines, 'Serial Number:'),
                      voltageConfigured:
                        parseFloat(util.getValue(lines, 'Configured Voltage:')) || null,
                      voltageMin: parseFloat(util.getValue(lines, 'Minimum Voltage:')) || null,
                      voltageMax: parseFloat(util.getValue(lines, 'Maximum Voltage:')) || null,
                    });
                  } else {
                    result.push({
                      size: 0,
                      bank,
                      type: 'Empty',
                      ecc: null,
                      clockSpeed: 0,
                      formFactor: util.getValue(lines, 'Form Factor:'),
                      partNum: '',
                      serialNum: '',
                      voltageConfigured: null,
                      voltageMin: null,
                      voltageMax: null,
                    });
                  }
                });
              }
              if (!result.length) {
                result.push({
                  size: await this.totalmem(),
                  bank: '',
                  type: '',
                  ecc: null,
                  clockSpeed: 0,
                  formFactor: '',
                  partNum: '',
                  serialNum: '',
                  voltageConfigured: null,
                  voltageMin: null,
                  voltageMax: null,
                });

                // Try Raspberry PI
                try {
                  let stdout = await this.execAsync(
                    'cat /proc/cpuinfo 2>/dev/null',
                    util.execOptsLinux,
                  );
                  let lines = stdout.toString().split('\n');
                  const version = util
                    .getValue(lines, 'revision', ':', true)
                    .toLowerCase() as string[];

                  if (await this.isRaspberry(lines)) {
                    const clockSpeed = {
                      '0': 400,
                      '1': 450,
                      '2': 450,
                      '3': 3200,
                      '4': 4267,
                    };
                    result[0].type = 'LPDDR2';
                    result[0].type =
                      version && version[2] && version[2] === '3' ? 'LPDDR4' : result[0].type;
                    result[0].type =
                      version && version[2] && version[2] === '4' ? 'LPDDR4X' : result[0].type;
                    result[0].ecc = false;
                    result[0].clockSpeed =
                      (version &&
                        version[2] &&
                        clockSpeed[version[2] as keyof typeof clockSpeed]) ||
                      400;
                    result[0].clockSpeed =
                      version && version[4] && version[4] === 'd' ? 500 : result[0].clockSpeed;
                    result[0].formFactor = 'SoC';

                    stdout = await this.execAsync(
                      'vcgencmd get_config sdram_freq 2>/dev/null',
                      util.execOptsLinux,
                    );
                    lines = stdout.toString().split('\n');
                    const freq = parseInt(util.getValue(lines, 'sdram_freq', '=', true), 10) || 0;
                    if (freq) {
                      result[0].clockSpeed = freq;
                    }

                    stdout = await this.execAsync(
                      'vcgencmd measure_volts sdram_p 2>/dev/null',
                      util.execOptsLinux,
                    );
                    lines = stdout.toString().split('\n');
                    const voltage = parseFloat(util.getValue(lines, 'volt', '=', true)) || 0;
                    if (voltage) {
                      result[0].voltageConfigured = voltage;
                      result[0].voltageMin = voltage;
                      result[0].voltageMax = voltage;
                    }
                  }
                } catch (e) {
                  this.logger.error(e);
                  util.noop();
                }
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            },
          );
        }

        if (this.platform === 'darwin') {
          this.execWithCallback('system_profiler SPMemoryDataType', (error, stdout) => {
            if (!error) {
              const allLines = stdout.toString().split('\n');
              const eccStatus = util.getValue(allLines, 'ecc', ':', true).toLowerCase();
              let devices = stdout.toString().split('        BANK ');
              let hasBank = true;
              if (devices.length === 1) {
                devices = stdout.toString().split('        DIMM');
                hasBank = false;
              }
              devices.shift();
              devices.forEach(function (device) {
                const lines = device.split('\n');
                const bank = (hasBank ? 'BANK ' : 'DIMM') + lines[0].trim().split('/')[0];
                const size = parseInt(util.getValue(lines, '          Size'));
                if (size) {
                  result.push({
                    size: size * 1024 * 1024 * 1024,
                    bank: bank,
                    type: util.getValue(lines, '          Type:'),
                    ecc: eccStatus ? eccStatus === 'enabled' : null,
                    clockSpeed: parseInt(util.getValue(lines, '          Speed:'), 10),
                    formFactor: '',
                    manufacturer: getManufacturerDarwin(
                      util.getValue(lines, '          Manufacturer:'),
                    ),
                    partNum: util.getValue(lines, '          Part Number:'),
                    serialNum: util.getValue(lines, '          Serial Number:'),
                    voltageConfigured: null,
                    voltageMin: null,
                    voltageMax: null,
                  });
                } else {
                  result.push({
                    size: 0,
                    bank: bank,
                    type: 'Empty',
                    ecc: null,
                    clockSpeed: 0,
                    formFactor: '',
                    manufacturer: '',
                    partNum: '',
                    serialNum: '',
                    voltageConfigured: null,
                    voltageMin: null,
                    voltageMax: null,
                  });
                }
              });
            }
            if (!result.length) {
              const lines = stdout.toString().split('\n');
              const size = parseInt(util.getValue(lines, '      Memory:'));
              const type = util.getValue(lines, '      Type:');
              const manufacturerId = util.getValue(lines, '      Manufacturer:');
              if (size && type) {
                result.push({
                  size: size * 1024 * 1024 * 1024,
                  bank: '0',
                  type,
                  ecc: false,
                  clockSpeed: null,
                  formFactor: 'SOC',
                  manufacturer: getManufacturerDarwin(manufacturerId),
                  partNum: '',
                  serialNum: '',
                  voltageConfigured: null,
                  voltageMin: null,
                  voltageMax: null,
                });
              }
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
          // https://www.dmtf.org/sites/default/files/standards/documents/DSP0134_3.4.0a.pdf
          const memoryTypes = 'Unknown|Other|DRAM|Synchronous DRAM|Cache DRAM|EDO|EDRAM|VRAM|SRAM|RAM|ROM|FLASH|EEPROM|FEPROM|EPROM|CDRAM|3DRAM|SDRAM|SGRAM|RDRAM|DDR|DDR2|DDR2 FB-DIMM|Reserved|DDR3|FBD2|DDR4|LPDDR|LPDDR2|LPDDR3|LPDDR4|Logical non-volatile device|HBM|HBM2|DDR5|LPDDR5'.split('|');
          const FormFactors = 'Unknown|Other|SIP|DIP|ZIP|SOJ|Proprietary|SIMM|DIMM|TSOP|PGA|RIMM|SODIMM|SRIMM|SMD|SSMP|QFP|TQFP|SOIC|LCC|PLCC|BGA|FPBGA|LGA'.split('|');

          try {
            util.powerShell('Get-CimInstance Win32_PhysicalMemory | select DataWidth,TotalWidth,Capacity,BankLabel,MemoryType,SMBIOSMemoryType,ConfiguredClockSpeed,Speed,FormFactor,Manufacturer,PartNumber,SerialNumber,ConfiguredVoltage,MinVoltage,MaxVoltage,Tag | fl').then((stdout, error) => {
              if (!error) {
                let devices = stdout.toString().split(/\n\s*\n/);
                devices.shift();
                devices.forEach(function (device) {
                  let lines = device.split('\r\n');
                  const dataWidth = util.toInt(util.getValue(lines, 'DataWidth', ':'));
                  const totalWidth = util.toInt(util.getValue(lines, 'TotalWidth', ':'));
                  const size = parseInt(util.getValue(lines, 'Capacity', ':'), 10) || 0;
                  const tag = util.getValue(lines, 'Tag', ':');
                  const tagInt = util.splitByNumber(tag);
                  if (size) {
                    result.push({
                      size,
                      bank: util.getValue(lines, 'BankLabel', ':') + (tagInt[1] ? '/' + tagInt[1] : ''), // BankLabel
                      type: memoryTypes[parseInt(util.getValue(lines, 'MemoryType', ':'), 10) || parseInt(util.getValue(lines, 'SMBIOSMemoryType', ':'), 10)],
                      ecc: dataWidth && totalWidth ? totalWidth > dataWidth : false,
                      clockSpeed: parseInt(util.getValue(lines, 'ConfiguredClockSpeed', ':'), 10) || parseInt(util.getValue(lines, 'Speed', ':'), 10) || 0,
                      formFactor: FormFactors[parseInt(util.getValue(lines, 'FormFactor', ':'), 10) || 0],
                      manufacturer: util.getValue(lines, 'Manufacturer', ':'),
                      partNum: util.getValue(lines, 'PartNumber', ':'),
                      serialNum: util.getValue(lines, 'SerialNumber', ':'),
                      voltageConfigured: (parseInt(util.getValue(lines, 'ConfiguredVoltage', ':'), 10) || 0) / 1000.0,
                      voltageMin: (parseInt(util.getValue(lines, 'MinVoltage', ':'), 10) || 0) / 1000.0,
                      voltageMax: (parseInt(util.getValue(lines, 'MaxVoltage', ':'), 10) || 0) / 1000.0,
                    });
                  }
                });
              }
              if (callback) { callback(result); }
              resolve(result);
            });
          } catch {
            if (callback) { callback(result); }
            resolve(result);
          }*/
        }
      });
    });
  }
}
