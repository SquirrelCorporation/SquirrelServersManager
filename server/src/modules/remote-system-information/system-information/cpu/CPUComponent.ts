// ==================================================================================
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2024
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================

import pino from 'pino';
import { Systeminformation } from 'ssm-shared-lib';
import PinoLogger from '../../../../logger';
import { RemoteOS } from '../RemoteOS';
import { Callback, RemoteExecutorType, RemoteExecutorTypeWithCallback } from '../types';
import * as util from '../utils';
import { cpuBrandManufacturer, cpuManufacturer, getAMDSpeed } from './cpu.utils';

export default class CPUComponent extends RemoteOS {
  private logger: pino.Logger<never>;

  constructor(
    remoteExecAsync: RemoteExecutorType,
    remoteExecWithCallback: RemoteExecutorTypeWithCallback,
    deviceUuid: string,
  ) {
    super(remoteExecAsync, remoteExecWithCallback);
    this.logger = PinoLogger.child({ module: 'CPUComponent', moduleId: deviceUuid });
  }

  private _cpu_speed: number | string = 0;
  private _current_cpu: Systeminformation.CurrentLoadData & any = {
    user: 0,
    nice: 0,
    system: 0,
    idle: 0,
    irq: 0,
    steal: 0,
    guest: 0,
    load: 0,
    tick: 0,
    ms: 0,
    currentLoad: 0,
    currentLoadUser: 0,
    currentLoadSystem: 0,
    currentLoadNice: 0,
    currentLoadIdle: 0,
    currentLoadIrq: 0,
    currentLoadSteal: 0,
    currentLoadGuest: 0,
    rawCurrentLoad: 0,
    rawCurrentLoadUser: 0,
    rawCurrentLoadSystem: 0,
    rawCurrentLoadNice: 0,
    rawCurrentLoadIdle: 0,
    rawCurrentLoadIrq: 0,
    rawCurrentLoadSteal: 0,
    rawCurrentLoadGuest: 0,
  };
  private _cpus: any[] = [];
  private _corecount = 0;

  // --------------------------
  // CPU - brand, speed

  private getCpu(): Promise<Systeminformation.CpuData> {
    return new Promise((resolve) => {
      process.nextTick(async () => {
        const UNKNOWN = 'unknown';
        let result: Systeminformation.CpuData = {
          manufacturer: UNKNOWN,
          brand: UNKNOWN,
          vendor: '',
          family: '',
          model: '',
          stepping: '',
          revision: '',
          voltage: '',
          speed: 0,
          speedMin: 0,
          speedMax: 0,
          governor: '',
          cores: this.cores(),
          physicalCores: this.cores(),
          performanceCores: this.cores(),
          efficiencyCores: 0,
          processors: 1,
          socket: '',
          flags: '',
          virtualization: false,
          cache: {
            l1d: 0,
            l1i: 0,
            l2: 0,
            l3: 0,
          },
        };
        this.cpuFlags().then(async (flags) => {
          result.flags = flags;
          result.virtualization = flags.indexOf('vmx') > -1 || flags.indexOf('svm') > -1;
          if (this.platform === 'darwin') {
            this.execWithCallback(
              'sysctl machdep.cpu hw.cpufrequency_max hw.cpufrequency_min hw.packages hw.physicalcpu_max hw.ncpu hw.tbfrequency hw.cpufamily hw.cpusubfamily',
              async (error, stdout) => {
                const lines = stdout.toString().split('\n');
                const modelline = util.getValue(lines, 'machdep.cpu.brand_string');
                const modellineParts = modelline.split('@');
                result.brand = modellineParts[0].trim();
                const speed = modellineParts[1] ? modellineParts[1].trim() : '0';
                result.speed = parseFloat(speed.replace(/GHz+/g, ''));
                let tbFrequency = parseFloat(util.getValue(lines, 'hw.tbfrequency')) / 1000000000.0;
                tbFrequency = tbFrequency < 0.1 ? tbFrequency * 100 : tbFrequency;
                result.speed = result.speed === 0 ? tbFrequency : result.speed;

                this._cpu_speed = result.speed;
                result = cpuBrandManufacturer(result);
                result.speedMin = util.getValue(lines, 'hw.cpufrequency_min')
                  ? parseFloat(util.getValue(lines, 'hw.cpufrequency_min')) / 1000000000.0
                  : result.speed;
                result.speedMax = util.getValue(lines, 'hw.cpufrequency_max')
                  ? parseFloat(util.getValue(lines, 'hw.cpufrequency_max')) / 1000000000.0
                  : result.speed;
                result.vendor = util.getValue(lines, 'machdep.cpu.vendor') || 'Apple';
                result.family =
                  util.getValue(lines, 'machdep.cpu.family') ||
                  util.getValue(lines, 'hw.cpufamily');
                result.model = util.getValue(lines, 'machdep.cpu.model');
                result.stepping =
                  util.getValue(lines, 'machdep.cpu.stepping') ||
                  util.getValue(lines, 'hw.cpusubfamily');
                result.virtualization = true;
                const countProcessors = util.getValue(lines, 'hw.packages');
                const countCores = util.getValue(lines, 'hw.physicalcpu_max');
                const countThreads = util.getValue(lines, 'hw.ncpu');
                if ((await this.arch()) === 'arm64') {
                  result.socket = 'SOC';
                  try {
                    const clusters = (
                      await this.execAsync('ioreg -c IOPlatformDevice -d 3 -r | grep cluster-type')
                    )
                      .toString()
                      .split('\n');
                    const efficiencyCores = clusters.filter(
                      (line) => line.indexOf('"E"') >= 0,
                    ).length;
                    const performanceCores = clusters.filter(
                      (line) => line.indexOf('"P"') >= 0,
                    ).length;
                    result.efficiencyCores = efficiencyCores;
                    result.performanceCores = performanceCores;
                  } catch (e) {
                    this.logger.error(e);
                    util.noop();
                  }
                }
                if (countProcessors) {
                  result.processors = parseInt(countProcessors) || 1;
                }
                if (countCores && countThreads) {
                  result.cores = parseInt(countThreads) || this.cores();
                  result.physicalCores = parseInt(countCores) || this.cores();
                }
                this.cpuCache().then((res) => {
                  result.cache = res;
                  resolve(result);
                });
              },
            );
          }
          if (this.platform === 'linux') {
            let modelline = '';
            let lines: string[] = [];
            const cpus = await this.cpus();
            if (cpus[0] && cpus[0].model) {
              modelline = cpus[0].model;
            }
            this.execWithCallback(
              'export LC_ALL=C; lscpu; echo -n "Governor: "; cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor 2>/dev/null; echo; unset LC_ALL',
              async (error, stdout) => {
                if (!error) {
                  lines = stdout.toString().split('\n');
                }
                modelline = util.getValue(lines, 'model name') || modelline;
                modelline = util.getValue(lines, 'bios model name') || modelline;
                modelline = util.cleanString(modelline);
                const modellineParts = modelline.split('@');
                result.brand = modellineParts[0].trim();
                result.speed = modellineParts[1] ? parseFloat(modellineParts[1].trim()) : 0;
                if (
                  result.speed === 0 &&
                  (result.brand.indexOf('AMD') > -1 ||
                    result.brand.toLowerCase().indexOf('ryzen') > -1)
                ) {
                  result.speed = getAMDSpeed(result.brand);
                }
                if (result.speed === 0) {
                  const current = await this.getCpuCurrentSpeedSync();
                  if (current.avg !== 0) {
                    result.speed = current.avg;
                  }
                }
                this._cpu_speed = result.speed;
                result.speedMin =
                  Math.round(
                    parseFloat(util.getValue(lines, 'cpu min mhz').replace(/,/g, '.')) / 10.0,
                  ) / 100;
                result.speedMax =
                  Math.round(
                    parseFloat(util.getValue(lines, 'cpu max mhz').replace(/,/g, '.')) / 10.0,
                  ) / 100;

                result = cpuBrandManufacturer(result);
                result.vendor = cpuManufacturer(util.getValue(lines, 'vendor id'));

                result.family = util.getValue(lines, 'cpu family');
                result.model = util.getValue(lines, 'model:');
                result.stepping = util.getValue(lines, 'stepping');
                result.revision = util.getValue(lines, 'cpu revision');
                result.cache.l1d = util.getValue(lines, 'l1d cache') as string;
                if (result.cache.l1d) {
                  result.cache.l1d =
                    parseInt(result.cache.l1d) *
                    (result.cache.l1d.indexOf('M') !== -1
                      ? 1024 * 1024
                      : result.cache.l1d.indexOf('K') !== -1
                        ? 1024
                        : 1);
                }
                result.cache.l1i = util.getValue(lines, 'l1i cache') as string;
                if (result.cache.l1i) {
                  result.cache.l1i =
                    parseInt(result.cache.l1i) *
                    (result.cache.l1i.indexOf('M') !== -1
                      ? 1024 * 1024
                      : result.cache.l1i.indexOf('K') !== -1
                        ? 1024
                        : 1);
                }
                result.cache.l2 = util.getValue(lines, 'l2 cache') as string;
                if (result.cache.l2) {
                  result.cache.l2 =
                    parseInt(result.cache.l2) *
                    (result.cache.l2.indexOf('M') !== -1
                      ? 1024 * 1024
                      : result.cache.l2.indexOf('K') !== -1
                        ? 1024
                        : 1);
                }
                result.cache.l3 = util.getValue(lines, 'l3 cache') as string;
                if (result.cache.l3) {
                  result.cache.l3 =
                    parseInt(result.cache.l3) *
                    (result.cache.l3.indexOf('M') !== -1
                      ? 1024 * 1024
                      : result.cache.l3.indexOf('K') !== -1
                        ? 1024
                        : 1);
                }

                const threadsPerCore = util.getValue(lines, 'thread(s) per core') || '1';
                const processors = util.getValue(lines, 'socket(s)') || '1';
                const threadsPerCoreInt = parseInt(threadsPerCore, 10); // threads per code (normally only for performance cores)
                const processorsInt = parseInt(processors, 10) || 1; // number of sockets /  processor units in machine (normally 1)
                const coresPerSocket = parseInt(util.getValue(lines, 'core(s) per socket'), 10); // number of cores (e.g. 16 on i12900)
                result.physicalCores = coresPerSocket
                  ? coresPerSocket * processorsInt
                  : result.cores / threadsPerCoreInt;
                result.performanceCores =
                  threadsPerCoreInt > 1 ? result.cores - result.physicalCores : result.cores;
                result.efficiencyCores =
                  threadsPerCoreInt > 1
                    ? result.cores - threadsPerCoreInt * result.performanceCores
                    : 0;
                result.processors = processorsInt;
                result.governor = util.getValue(lines, 'governor') || '';

                // Test Raspberry
                if (result.vendor === 'ARM' && (await this.isRaspberry())) {
                  const rPIRevision = this.decodePiCpuinfo();
                  result.family = result.manufacturer;
                  result.manufacturer = rPIRevision.manufacturer as string;
                  result.brand = rPIRevision.processor as string;
                  result.revision = rPIRevision.revisionCode as string;
                  result.socket = 'SOC';
                }

                // socket type
                let lines2: string[] = [];
                this.execWithCallback(
                  'export LC_ALL=C; dmidecode –t 4 2>/dev/null | grep "Upgrade: Socket"; unset LC_ALL',
                  (error2, stdout2) => {
                    lines2 = stdout2.toString().split('\n');
                    if (lines2 && lines2.length) {
                      result.socket =
                        util.getValue(lines2, 'Upgrade').replace('Socket', '').trim() ||
                        result.socket;
                    }
                    resolve(result);
                  },
                );
              },
            );
          }
          if (
            this.platform === 'freebsd' ||
            this.platform === 'openbsd' ||
            this.platform === 'netbsd'
          ) {
            let modelline = '';
            let lines: any = [];
            const cpus = await this.cpus();
            if (cpus[0] && cpus[0].model) {
              modelline = cpus[0].model;
            }
            this.execWithCallback(
              'export LC_ALL=C; dmidecode -t 4; dmidecode -t 7 unset LC_ALL',
              async (error, stdout) => {
                let cache: any = [];
                if (!error) {
                  const data = stdout.toString().split('# dmidecode');
                  const processor = data.length > 1 ? data[1] : '';
                  cache = data.length > 2 ? data[2].split('Cache Information') : [];

                  lines = processor.split('\n');
                }
                result.brand = modelline.split('@')[0].trim();
                result.speed = modelline.split('@')[1]
                  ? parseFloat(modelline.split('@')[1].trim())
                  : 0;
                if (
                  result.speed === 0 &&
                  (result.brand.indexOf('AMD') > -1 ||
                    result.brand.toLowerCase().indexOf('ryzen') > -1)
                ) {
                  result.speed = getAMDSpeed(result.brand);
                }
                if (result.speed === 0) {
                  const current = await this.getCpuCurrentSpeedSync();
                  if (current.avg !== 0) {
                    result.speed = current.avg;
                  }
                }
                this._cpu_speed = result.speed;
                result.speedMin = result.speed;
                result.speedMax =
                  Math.round(
                    parseFloat(util.getValue(lines, 'max speed').replace(/Mhz/g, '')) / 10.0,
                  ) / 100;

                result = cpuBrandManufacturer(result);
                result.vendor = cpuManufacturer(util.getValue(lines, 'manufacturer'));
                let sig = util.getValue(lines, 'signature');
                sig = sig.split(',');
                for (let i = 0; i < sig.length; i++) {
                  sig[i] = sig[i].trim();
                }
                result.family = util.getValue(sig, 'Family', ' ', true);
                result.model = util.getValue(sig, 'Model', ' ', true);
                result.stepping = util.getValue(sig, 'Stepping', ' ', true);
                result.revision = '';
                const voltage = parseFloat(util.getValue(lines, 'voltage'));
                result.voltage = isNaN(voltage) ? '' : voltage.toFixed(2);
                for (let i = 0; i < cache.length; i++) {
                  lines = cache[i].split('\n');
                  let cacheType = util
                    .getValue(lines, 'Socket Designation')
                    .toLowerCase()
                    .replace(' ', '-')
                    .split('-');
                  cacheType = cacheType.length ? cacheType[0] : '';
                  const sizeParts = util.getValue(lines, 'Installed Size').split(' ');
                  let size = parseInt(sizeParts[0], 10);
                  const unit = sizeParts.length > 1 ? sizeParts[1] : 'kb';
                  size =
                    size *
                    (unit === 'kb'
                      ? 1024
                      : unit === 'mb'
                        ? 1024 * 1024
                        : unit === 'gb'
                          ? 1024 * 1024 * 1024
                          : 1);
                  if (cacheType) {
                    if (cacheType === 'l1') {
                      result.cache[(cacheType + 'd') as keyof typeof result.cache] = size / 2;
                      result.cache[(cacheType + 'i') as keyof typeof result.cache] = size / 2;
                    } else {
                      result.cache[cacheType as keyof typeof result.cache] = size;
                    }
                  }
                }
                // socket type
                result.socket = util.getValue(lines, 'Upgrade').replace('Socket', '').trim();
                // # threads / # cores
                const threadCount = util.getValue(lines, 'thread count').trim();
                const coreCount = util.getValue(lines, 'core count').trim();
                if (coreCount && threadCount) {
                  result.cores = parseInt(threadCount, 10);
                  result.physicalCores = parseInt(coreCount, 10);
                }
                resolve(result);
              },
            );
          }
          if (this.platform === 'sunos') {
            resolve(result);
          }
          if (this.platform === 'win32') {
            resolve(result);
            /*
              try {
                const workload = [];
                workload.push(
                  util.powerShell(
                    'Get-CimInstance Win32_processor | select Name, Revision, L2CacheSize, L3CacheSize, Manufacturer, MaxClockSpeed, Description, UpgradeMethod, Caption, NumberOfLogicalProcessors, NumberOfCores | fl',
                  ),
                );
                workload.push(
                  util.powerShell(
                    'Get-CimInstance Win32_CacheMemory | select CacheType,InstalledSize,Level | fl',
                  ),
                );
                workload.push(
                  util.powerShell('(Get-CimInstance Win32_ComputerSystem).HypervisorPresent'),
                );

                Promise.all(workload).then((data) => {
                  let lines = data[0].split('\r\n');
                  let name = util.getValue(lines, 'name', ':') || '';
                  if (name.indexOf('@') >= 0) {
                    result.brand = name.split('@')[0].trim();
                    result.speed = name.split('@')[1] ? parseFloat(name.split('@')[1].trim()) : 0;
                    _cpu_speed = result.speed;
                  } else {
                    result.brand = name.trim();
                    result.speed = 0;
                  }
                  result = cpuBrandManufacturer(result);
                  result.revision = util.getValue(lines, 'revision', ':');
                  result.vendor = util.getValue(lines, 'manufacturer', ':');
                  result.speedMax =
                    Math.round(
                      parseFloat(util.getValue(lines, 'maxclockspeed', ':').replace(/,/g, '.')) / 10.0,
                    ) / 100;
                  if (
                    result.speed === 0 &&
                    (result.brand.indexOf('AMD') > -1 ||
                      result.brand.toLowerCase().indexOf('ryzen') > -1)
                  ) {
                    result.speed = getAMDSpeed(result.brand);
                  }
                  if (result.speed === 0) {
                    result.speed = result.speedMax;
                  }
                  result.speedMin = result.speed;

                  let description = util.getValue(lines, 'description', ':').split(' ');
                  for (let i = 0; i < description.length; i++) {
                    if (
                      description[i].toLowerCase().startsWith('family') &&
                      i + 1 < description.length &&
                      description[i + 1]
                    ) {
                      result.family = description[i + 1];
                    }
                    if (
                      description[i].toLowerCase().startsWith('model') &&
                      i + 1 < description.length &&
                      description[i + 1]
                    ) {
                      result.model = description[i + 1];
                    }
                    if (
                      description[i].toLowerCase().startsWith('stepping') &&
                      i + 1 < description.length &&
                      description[i + 1]
                    ) {
                      result.stepping = description[i + 1];
                    }
                  }
                  // socket type
                  const socketId = util.getValue(lines, 'UpgradeMethod', ':');
                  if (socketTypes[socketId]) {
                    result.socket = socketTypes[socketId];
                  }
                  const socketByName = getSocketTypesByName(name);
                  if (socketByName) {
                    result.socket = socketByName;
                  }
                  // # threads / # cores
                  const countProcessors = util.countLines(lines, 'Caption');
                  const countThreads = util.getValue(lines, 'NumberOfLogicalProcessors', ':');
                  const countCores = util.getValue(lines, 'NumberOfCores', ':');
                  if (countProcessors) {
                    result.processors = parseInt(countProcessors) || 1;
                  }
                  if (countCores && countThreads) {
                    result.cores = parseInt(countThreads) || util.cores();
                    result.physicalCores = parseInt(countCores) || util.cores();
                  }
                  if (countProcessors > 1) {
                    result.cores = result.cores * countProcessors;
                    result.physicalCores = result.physicalCores * countProcessors;
                  }
                  result.cache = parseWinCache(data[0], data[1]);
                  const hyperv = data[2] ? data[2].toString().toLowerCase() : '';
                  result.virtualization = hyperv.indexOf('true') !== -1;

                  resolve(result);
                });
              } catch (e) {
                resolve(result);
              }
              */
          }
        });
      });
    });
  }

  // --------------------------
  // CPU - Processor Data
  public cpu(callback?: Callback): Promise<Systeminformation.CpuData> {
    return new Promise((resolve) => {
      process.nextTick(() => {
        this.getCpu().then((result) => {
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      });
    });
  }

  // --------------------------
  // CPU - current speed - in GHz
  private async getCpuCurrentSpeedSync() {
    const cpus = await this.cpus();
    let minFreq = 999999999;
    let maxFreq = 0;
    let avgFreq = 0;
    const cores: number[] = [];
    const speeds: number[] = [];

    if (cpus && cpus.length && cpus[0].speed) {
      for (const i in cpus) {
        if ({}.hasOwnProperty.call(cpus, i)) {
          speeds.push(cpus[i].speed > 100 ? (cpus[i].speed + 1) / 1000 : cpus[i].speed / 10);
        }
      }
    } else if (this.platform === 'linux') {
      try {
        const speedStrings = (
          await this.execAsync(
            'cat /proc/cpuinfo | grep "cpu MHz" | cut -d " " -f 3',
            util.execOptsLinux,
          )
        )
          .toString()
          .split('\n')
          .filter((line) => line.length > 0);
        for (const i in speedStrings) {
          speeds.push(Math.floor(parseInt(speedStrings[i], 10) / 10) / 100);
        }
      } catch {
        util.noop();
      }
    }

    if (speeds && speeds.length) {
      for (const i in speeds) {
        avgFreq = avgFreq + speeds[i];
        if (speeds[i] > maxFreq) {
          maxFreq = speeds[i];
        }
        if (speeds[i] < minFreq) {
          minFreq = speeds[i];
        }
        cores.push(parseFloat(speeds[i].toFixed(2)));
      }
      avgFreq = avgFreq / cpus.length;
      avgFreq = avgFreq / speeds.length;
      return {
        min: parseFloat(minFreq.toFixed(2)),
        max: parseFloat(maxFreq.toFixed(2)),
        avg: parseFloat(avgFreq.toFixed(2)),
        cores: cores,
      };
    } else {
      return {
        min: 0,
        max: 0,
        avg: 0,
        cores: cores,
      };
    }
  }

  public async cpuCurrentSpeed(
    callback?: Callback,
  ): Promise<Systeminformation.CpuCurrentSpeedData> {
    return new Promise((resolve) => {
      process.nextTick(async () => {
        let result = await this.getCpuCurrentSpeedSync();
        if (result.avg === 0 && this._cpu_speed !== 0) {
          const currCpuSpeed = parseFloat(this._cpu_speed as string);
          result = {
            min: currCpuSpeed,
            max: currCpuSpeed,
            avg: currCpuSpeed,
            cores: [],
          };
        }
        if (callback) {
          callback(result);
        }
        resolve(result);
      });
    });
  }

  // --------------------------
  // CPU - temperature
  // if sensors are installed

  public async cpuTemperature(callback?: Callback): Promise<Systeminformation.CpuTemperatureData> {
    return new Promise((resolve) => {
      process.nextTick(async () => {
        const result: Systeminformation.CpuTemperatureData = {
          main: null,
          cores: [],
          max: null,
          socket: [],
          chipset: null,
        };
        if (this.platform === 'linux') {
          // CPU Chipset, Socket
          try {
            const cmd =
              'cat /sys/class/thermal/thermal_zone*/type  2>/dev/null; echo "-----"; cat /sys/class/thermal/thermal_zone*/temp 2>/dev/null;';
            const parts = (await this.execAsync(cmd, util.execOptsLinux))
              .toString()
              .split('-----\n');
            if (parts.length === 2) {
              const lines = parts[0].split('\n');
              const lines2 = parts[1].split('\n');
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.startsWith('acpi') && lines2[i]) {
                  result.socket?.push(Math.round(parseInt(lines2[i], 10) / 100) / 10);
                }
                if (line.startsWith('pch') && lines2[i]) {
                  result.chipset = Math.round(parseInt(lines2[i], 10) / 100) / 10;
                }
              }
            }
          } catch {
            util.noop();
          }

          const cmd =
            'for mon in /sys/class/hwmon/hwmon*; do for label in "$mon"/temp*_label; do if [ -f $label ]; then value=${label%_*}_input; echo $(cat "$label")___$(cat "$value"); fi; done; done;';
          try {
            this.execWithCallback(cmd, (error, stdout) => {
              stdout = stdout.toString();
              const tdiePos = stdout.toLowerCase().indexOf('tdie');
              if (tdiePos !== -1) {
                stdout = stdout.substring(tdiePos);
              }
              const lines = stdout.split('\n');
              let tctl = 0;
              lines.forEach((line) => {
                const parts = line.split('___');
                const label = parts[0];
                const value = parts.length > 1 && parts[1] ? parts[1] : '0';
                if (value && label && label.toLowerCase() === 'tctl') {
                  tctl = result.main = Math.round(parseInt(value, 10) / 100) / 10;
                }
                if (
                  value &&
                  (label === undefined || (label && label.toLowerCase().startsWith('core')))
                ) {
                  result.cores.push(Math.round(parseInt(value, 10) / 100) / 10);
                } else if (
                  value &&
                  label &&
                  result.main === null &&
                  (label.toLowerCase().indexOf('package') >= 0 ||
                    label.toLowerCase().indexOf('physical') >= 0 ||
                    label.toLowerCase() === 'tccd1')
                ) {
                  result.main = Math.round(parseInt(value, 10) / 100) / 10;
                }
              });
              if (tctl && result.main === null) {
                result.main = tctl;
              }

              if (result.cores.length > 0) {
                if (result.main === null) {
                  result.main = Math.round(
                    result.cores.reduce((a, b) => a + b, 0) / result.cores.length,
                  );
                }
                const maxtmp = Math.max(...result.cores);
                result.max = maxtmp > result.main ? maxtmp : result.main;
              }
              if (result.main !== null) {
                if (result.max === null) {
                  result.max = result.main;
                }
                if (callback) {
                  callback(result);
                }
                resolve(result);
                return;
              }
              this.execWithCallback('sensors', (error, stdout) => {
                if (!error) {
                  const lines = stdout.toString().split('\n');
                  let tdieTemp: any = null;
                  let newSectionStarts = true;
                  let section = '';
                  lines.forEach(function (line) {
                    // determine section
                    if (line.trim() === '') {
                      newSectionStarts = true;
                    } else if (newSectionStarts) {
                      if (line.trim().toLowerCase().startsWith('acpi')) {
                        section = 'acpi';
                      }
                      if (line.trim().toLowerCase().startsWith('pch')) {
                        section = 'pch';
                      }
                      if (line.trim().toLowerCase().startsWith('core')) {
                        section = 'core';
                      }
                      newSectionStarts = false;
                    }
                    const regex = /[+-]([^°]*)/g;
                    const temps = line.match(regex) as unknown as string;
                    const firstPart = line.split(':')[0].toUpperCase();
                    if (section === 'acpi') {
                      // socket temp
                      if (firstPart.indexOf('TEMP') !== -1) {
                        result.socket?.push(parseFloat(temps));
                      }
                    } else if (section === 'pch') {
                      // chipset temp
                      if (firstPart.indexOf('TEMP') !== -1 && !result.chipset) {
                        result.chipset = parseFloat(temps);
                      }
                    }
                    // cpu temp
                    if (
                      firstPart.indexOf('PHYSICAL') !== -1 ||
                      firstPart.indexOf('PACKAGE') !== -1
                    ) {
                      result.main = parseFloat(temps);
                    }
                    if (firstPart.indexOf('CORE ') !== -1) {
                      result.cores.push(parseFloat(temps));
                    }
                    if (firstPart.indexOf('TDIE') !== -1 && tdieTemp === null) {
                      tdieTemp = parseFloat(temps);
                    }
                  });
                  if (result.cores.length > 0) {
                    result.main = Math.round(
                      result.cores.reduce((a, b) => a + b, 0) / result.cores.length,
                    );
                    const maxtmp = Math.max(...result.cores);
                    result.max = maxtmp > result.main ? maxtmp : result.main;
                  } else {
                    if (result.main === null && tdieTemp !== null) {
                      result.main = tdieTemp;
                      result.max = tdieTemp;
                    }
                  }
                  if (result.main !== null || result.max !== null) {
                    if (callback) {
                      callback(result);
                    }
                    resolve(result);
                    return;
                  }
                }
                this.fileExistsWithCallback('/sys/class/thermal/thermal_zone0/temp', (err: any) => {
                  if (err === null) {
                    this.readFileWithCallback(
                      '/sys/class/thermal/thermal_zone0/temp',
                      (error: any, stdout: string) => {
                        if (!error) {
                          const lines = stdout.toString().split('\n');
                          if (lines.length > 0) {
                            result.main = parseFloat(lines[0]) / 1000.0;
                            result.max = result.main;
                          }
                        }
                        if (callback) {
                          callback(result);
                        }
                        resolve(result);
                      },
                    );
                  } else {
                    this.execWithCallback('/opt/vc/bin/vcgencmd measure_temp', (error, stdout) => {
                      if (!error) {
                        const lines = stdout.toString().split('\n');
                        if (lines.length > 0 && lines[0].indexOf('=')) {
                          result.main = parseFloat(lines[0].split('=')[1]);
                          result.max = result.main;
                        }
                      }
                      if (callback) {
                        callback(result);
                      }
                      resolve(result);
                    });
                  }
                });
              });
            });
          } catch (e) {
            this.logger.error(e);
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
          this.execWithCallback('sysctl dev.cpu | grep temp', (error, stdout) => {
            if (!error) {
              const lines = stdout.toString().split('\n');
              let sum = 0;
              lines.forEach(function (line) {
                const parts = line.split(':');
                if (parts.length > 1) {
                  const temp = parseFloat(parts[1].replace(',', '.'));
                  if (temp > (result.max as number)) {
                    result.max = temp;
                  }
                  sum = sum + temp;
                  result.cores.push(temp);
                }
              });
              if (result.cores.length) {
                result.main = Math.round((sum / result.cores.length) * 100) / 100;
              }
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        }
        if (this.platform === 'darwin') {
          const osxTemp = null;
          /*
          try {
            osxTemp = await import('osx-temperature-sensor');
          } catch (er) {
            osxTemp = null;
          }*/
          if (osxTemp) {
            // result = osxTemp.cpuTemperature();
            // round to 2 digits
            if (result.main) {
              result.main = Math.round(result.main * 100) / 100;
            }
            if (result.max) {
              result.max = Math.round(result.max * 100) / 100;
            }
            if (result.cores && result.cores.length) {
              for (let i = 0; i < result.cores.length; i++) {
                result.cores[i] = Math.round(result.cores[i] * 100) / 100;
              }
            }
          }

          if (callback) {
            callback(result);
          }
          resolve(result);
        }
        if (this.platform === 'sunos') {
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
        if (this.platform === 'win32') {
          resolve(result);
          /*
          try {
            util
              .powerShell(
                'Get-CimInstance MSAcpi_ThermalZoneTemperature -Namespace "root/wmi" | Select CurrentTemperature',
              )
              .then((stdout, error) => {
                if (!error) {
                  let sum = 0;
                  let lines = stdout
                    .split('\r\n')
                    .filter((line) => line.trim() !== '')
                    .filter((line, idx) => idx > 0);
                  lines.forEach(function (line) {
                    let value = (parseInt(line, 10) - 2732) / 10;
                    if (!isNaN(value)) {
                      sum = sum + value;
                      if (value > result.max) {
                        result.max = value;
                      }
                      result.cores.push(value);
                    }
                  });
                  if (result.cores.length) {
                    result.main = sum / result.cores.length;
                  }
                }
                if (callback) {
                  callback(result);
                }
                resolve(result);
              });
          } catch (e) {
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
          */
        }
      });
    });
  }

  // --------------------------
  // CPU Flags
  public cpuFlags(callback?: Callback): Promise<string> {
    return new Promise((resolve) => {
      process.nextTick(() => {
        let result = '';
        if (this.platform === 'win32') {
          resolve(result);
          /*
          try {
            exec(
              'reg query "HKEY_LOCAL_MACHINE\\HARDWARE\\DESCRIPTION\\System\\CentralProcessor\\0" /v FeatureSet',
              util.execOptsWin,
              function (error, stdout) {
                if (!error) {
                  let flag_hex = stdout.split('0x').pop().trim();
                  let flag_bin_unpadded = parseInt(flag_hex, 16).toString(2);
                  let flag_bin = '0'.repeat(32 - flag_bin_unpadded.length) + flag_bin_unpadded;
                  // empty flags are the reserved fields in the CPUID feature bit list
                  // as found on wikipedia:
                  // https://en.wikipedia.org/wiki/CPUID
                  let all_flags = [
                    'fpu',
                    'vme',
                    'de',
                    'pse',
                    'tsc',
                    'msr',
                    'pae',
                    'mce',
                    'cx8',
                    'apic',
                    '',
                    'sep',
                    'mtrr',
                    'pge',
                    'mca',
                    'cmov',
                    'pat',
                    'pse-36',
                    'psn',
                    'clfsh',
                    '',
                    'ds',
                    'acpi',
                    'mmx',
                    'fxsr',
                    'sse',
                    'sse2',
                    'ss',
                    'htt',
                    'tm',
                    'ia64',
                    'pbe',
                  ];
                  for (let f = 0; f < all_flags.length; f++) {
                    if (flag_bin[f] === '1' && all_flags[f] !== '') {
                      result += ' ' + all_flags[f];
                    }
                  }
                  result = result.trim().toLowerCase();
                }
                if (callback) {
                  callback(result);
                }
                resolve(result);
              },
            );
          } catch (e) {
            if (callback) {
              callback(result);
            }
            resolve(result);
          }
          */
        }
        if (this.platform === 'linux') {
          try {
            this.execWithCallback('export LC_ALL=C; lscpu; unset LC_ALL', (error, stdout) => {
              if (!error) {
                const lines = stdout.toString().split('\n');
                lines.forEach(function (line) {
                  if (line.split(':')[0].toUpperCase().indexOf('FLAGS') !== -1) {
                    result = line.split(':')[1].trim().toLowerCase();
                  }
                });
              }
              if (!result) {
                this.readFileWithCallback('/proc/cpuinfo', (error: any, stdout: string) => {
                  if (!error) {
                    const lines = stdout.toString().split('\n');
                    result = util.getValue(lines, 'features', ':', true).toLowerCase();
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
            });
          } catch (error: any) {
            this.logger.error(error);
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
          this.execWithCallback(
            'export LC_ALL=C; dmidecode -t 4 2>/dev/null; unset LC_ALL',
            (error, stdout) => {
              const flags: any = [];
              if (!error) {
                const parts = stdout.toString().split('\tFlags:');
                const lines = parts.length > 1 ? parts[1].split('\tVersion:')[0].split('\n') : [];
                lines.forEach(function (line) {
                  const flag = (line.indexOf('(') ? line.split('(')[0].toLowerCase() : '')
                    .trim()
                    .replace(/\t/g, '');
                  if (flag) {
                    flags.push(flag);
                  }
                });
              }
              result = flags.join(' ').trim().toLowerCase();
              if (callback) {
                callback(result);
              }
              resolve(result);
            },
          );
        }
        if (this.platform === 'darwin') {
          this.execWithCallback('sysctl machdep.cpu.features', (error, stdout) => {
            if (!error) {
              const lines = stdout.toString().split('\n');
              if (lines.length > 0 && lines[0].indexOf('machdep.cpu.features:') !== -1) {
                result = lines[0].split(':')[1].trim().toLowerCase();
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
      });
    });
  }

  // --------------------------
  // CPU Cache
  public cpuCache(callback?: Callback): Promise<Systeminformation.CpuCacheData> {
    return new Promise((resolve) => {
      process.nextTick(() => {
        const result: Systeminformation.CpuCacheData = {
          l1d: null,
          l1i: null,
          l2: null,
          l3: null,
        };
        if (this.platform === 'linux') {
          try {
            this.execWithCallback('export LC_ALL=C; lscpu; unset LC_ALL', (error, stdout) => {
              if (!error) {
                const lines = stdout.toString().split('\n');
                lines.forEach(function (line) {
                  const parts = line.split(':');
                  if (parts[0].toUpperCase().indexOf('L1D CACHE') !== -1) {
                    result.l1d =
                      parseInt(parts[1].trim()) *
                      (parts[1].indexOf('M') !== -1
                        ? 1024 * 1024
                        : parts[1].indexOf('K') !== -1
                          ? 1024
                          : 1);
                  }
                  if (parts[0].toUpperCase().indexOf('L1I CACHE') !== -1) {
                    result.l1i =
                      parseInt(parts[1].trim()) *
                      (parts[1].indexOf('M') !== -1
                        ? 1024 * 1024
                        : parts[1].indexOf('K') !== -1
                          ? 1024
                          : 1);
                  }
                  if (parts[0].toUpperCase().indexOf('L2 CACHE') !== -1) {
                    result.l2 =
                      parseInt(parts[1].trim()) *
                      (parts[1].indexOf('M') !== -1
                        ? 1024 * 1024
                        : parts[1].indexOf('K') !== -1
                          ? 1024
                          : 1);
                  }
                  if (parts[0].toUpperCase().indexOf('L3 CACHE') !== -1) {
                    result.l3 =
                      parseInt(parts[1].trim()) *
                      (parts[1].indexOf('M') !== -1
                        ? 1024 * 1024
                        : parts[1].indexOf('K') !== -1
                          ? 1024
                          : 1);
                  }
                });
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
          this.execWithCallback(
            'export LC_ALL=C; dmidecode -t 7 2>/dev/null; unset LC_ALL',
            (error, stdout) => {
              let cache: any = [];
              if (!error) {
                const data = stdout.toString();
                cache = data.split('Cache Information');
                cache.shift();
              }
              for (let i = 0; i < cache.length; i++) {
                const lines = cache[i].split('\n');
                let cacheType = util
                  .getValue(lines, 'Socket Designation')
                  .toLowerCase()
                  .replace(' ', '-')
                  .split('-');
                cacheType = cacheType.length ? cacheType[0] : '';
                const sizeParts = util.getValue(lines, 'Installed Size').split(' ');
                let size = parseInt(sizeParts[0], 10);
                const unit = sizeParts.length > 1 ? sizeParts[1] : 'kb';
                size =
                  size *
                  (unit === 'kb'
                    ? 1024
                    : unit === 'mb'
                      ? 1024 * 1024
                      : unit === 'gb'
                        ? 1024 * 1024 * 1024
                        : 1);
                if (cacheType) {
                  if (cacheType === 'l1') {
                    result.cache[cacheType + 'd'] = size / 2;
                    result.cache[cacheType + 'i'] = size / 2;
                  } else {
                    result.cache[cacheType] = size;
                  }
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
          this.execWithCallback(
            'sysctl hw.l1icachesize hw.l1dcachesize hw.l2cachesize hw.l3cachesize',
            (error, stdout) => {
              if (!error) {
                const lines = stdout.toString().split('\n');
                lines.forEach(function (line) {
                  const parts = line.split(':');
                  if (parts[0].toLowerCase().indexOf('hw.l1icachesize') !== -1) {
                    result.l1d =
                      parseInt(parts[1].trim()) * (parts[1].indexOf('K') !== -1 ? 1024 : 1);
                  }
                  if (parts[0].toLowerCase().indexOf('hw.l1dcachesize') !== -1) {
                    result.l1i =
                      parseInt(parts[1].trim()) * (parts[1].indexOf('K') !== -1 ? 1024 : 1);
                  }
                  if (parts[0].toLowerCase().indexOf('hw.l2cachesize') !== -1) {
                    result.l2 =
                      parseInt(parts[1].trim()) * (parts[1].indexOf('K') !== -1 ? 1024 : 1);
                  }
                  if (parts[0].toLowerCase().indexOf('hw.l3cachesize') !== -1) {
                    result.l3 =
                      parseInt(parts[1].trim()) * (parts[1].indexOf('K') !== -1 ? 1024 : 1);
                  }
                });
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            },
          );
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
                workload.push(
                  util.powerShell(
                    'Get-CimInstance Win32_processor | select L2CacheSize, L3CacheSize | fl',
                  ),
                );
                workload.push(
                  util.powerShell(
                    'Get-CimInstance Win32_CacheMemory | select CacheType,InstalledSize,Level | fl',
                  ),
                );

                Promise.all(workload).then((data) => {
                  result = parseWinCache(data[0], data[1]);

                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                });
              } catch (e) {
                if (callback) {
                  callback(result);
                }
                resolve(result);
              }
           */
        }
      });
    });
  }

  // --------------------------
  // CPU - current load - in %
  public getLoad(): Promise<Partial<Systeminformation.CurrentLoadData>> {
    return new Promise((resolve) => {
      process.nextTick(async () => {
        const loadsAvg = await this.loadavg();
        const cores = this.cores() === 0 ? 1 : this.cores();
        const loads = loadsAvg.map((x) => {
          return x / cores;
        });
        const avgLoad = parseFloat(Math.max(...loads).toFixed(2));
        let result: Partial<Systeminformation.CurrentLoadData> = {};

        const now = Date.now() - this._current_cpu.ms;
        if (now >= 200) {
          this._current_cpu.ms = Date.now();
          const cpus = (await this.cpus()).map((cpu) => {
            cpu.times.steal = 0;
            cpu.times.guest = 0;
            return cpu;
          });
          let totalUser = 0;
          let totalSystem = 0;
          let totalNice = 0;
          let totalIrq = 0;
          let totalIdle = 0;
          let totalSteal = 0;
          let totalGuest = 0;
          const cores: any = [];
          this._corecount = cpus && cpus.length ? cpus.length : 0;

          // linux: try to get other cpu stats
          if (this.platform === 'linux') {
            try {
              const lines = (
                await this.execAsync('cat /proc/stat 2>/dev/null | grep cpu', util.execOptsLinux)
              )
                .toString()
                .split('\n');
              if (lines.length > 1) {
                lines.shift();
                if (lines.length === cpus.length) {
                  for (let i = 0; i < lines.length; i++) {
                    const parts = lines[i].split(' ');
                    if (parts.length >= 10) {
                      const steal = parseFloat(parts[8]) || 0;
                      const guest = parseFloat(parts[9]) || 0;
                      cpus[i].times.steal = steal;
                      cpus[i].times.guest = guest;
                    }
                  }
                }
              }
            } catch (e) {
              this.logger.error(e);
              util.noop();
            }
          }
          for (let i = 0; i < this._corecount; i++) {
            const cpu = cpus[i].times;
            totalUser += cpu.user;
            totalSystem += cpu.sys;
            totalNice += cpu.nice;
            totalIdle += cpu.idle;
            totalIrq += cpu.irq;
            totalSteal += cpu.steal || 0;
            totalGuest += cpu.guest || 0;
            const tmpTick =
              this._cpus && this._cpus[i] && this._cpus[i].totalTick ? this._cpus[i].totalTick : 0;
            const tmpLoad =
              this._cpus && this._cpus[i] && this._cpus[i].totalLoad ? this._cpus[i].totalLoad : 0;
            const tmpUser =
              this._cpus && this._cpus[i] && this._cpus[i].user ? this._cpus[i].user : 0;
            const tmpSystem =
              this._cpus && this._cpus[i] && this._cpus[i].sys ? this._cpus[i].sys : 0;
            const tmpNice =
              this._cpus && this._cpus[i] && this._cpus[i].nice ? this._cpus[i].nice : 0;
            const tmpIdle =
              this._cpus && this._cpus[i] && this._cpus[i].idle ? this._cpus[i].idle : 0;
            const tmpIrq = this._cpus && this._cpus[i] && this._cpus[i].irq ? this._cpus[i].irq : 0;
            const tmpSteal =
              this._cpus && this._cpus[i] && this._cpus[i].steal ? this._cpus[i].steal : 0;
            const tmpGuest =
              this._cpus && this._cpus[i] && this._cpus[i].guest ? this._cpus[i].guest : 0;
            this._cpus[i] = cpu;
            this._cpus[i].totalTick =
              this._cpus[i].user +
              this._cpus[i].sys +
              this._cpus[i].nice +
              this._cpus[i].irq +
              this._cpus[i].steal +
              this._cpus[i].guest +
              this._cpus[i].idle;
            this._cpus[i].totalLoad =
              this._cpus[i].user +
              this._cpus[i].sys +
              this._cpus[i].nice +
              this._cpus[i].irq +
              this._cpus[i].steal +
              this._cpus[i].guest;
            this._cpus[i].currentTick = this._cpus[i].totalTick - tmpTick;
            this._cpus[i].load = this._cpus[i].totalLoad - tmpLoad;
            this._cpus[i].loadUser = this._cpus[i].user - tmpUser;
            this._cpus[i].loadSystem = this._cpus[i].sys - tmpSystem;
            this._cpus[i].loadNice = this._cpus[i].nice - tmpNice;
            this._cpus[i].loadIdle = this._cpus[i].idle - tmpIdle;
            this._cpus[i].loadIrq = this._cpus[i].irq - tmpIrq;
            this._cpus[i].loadSteal = this._cpus[i].steal - tmpSteal;
            this._cpus[i].loadGuest = this._cpus[i].guest - tmpGuest;
            cores[i] = {};
            cores[i].load = (this._cpus[i].load / this._cpus[i].currentTick) * 100;
            cores[i].loadUser = (this._cpus[i].loadUser / this._cpus[i].currentTick) * 100;
            cores[i].loadSystem = (this._cpus[i].loadSystem / this._cpus[i].currentTick) * 100;
            cores[i].loadNice = (this._cpus[i].loadNice / this._cpus[i].currentTick) * 100;
            cores[i].loadIdle = (this._cpus[i].loadIdle / this._cpus[i].currentTick) * 100;
            cores[i].loadIrq = (this._cpus[i].loadIrq / this._cpus[i].currentTick) * 100;
            cores[i].loadSteal = (this._cpus[i].loadSteal / this._cpus[i].currentTick) * 100;
            cores[i].loadGuest = (this._cpus[i].loadGuest / this._cpus[i].currentTick) * 100;
            cores[i].rawLoad = this._cpus[i].load;
            cores[i].rawLoadUser = this._cpus[i].loadUser;
            cores[i].rawLoadSystem = this._cpus[i].loadSystem;
            cores[i].rawLoadNice = this._cpus[i].loadNice;
            cores[i].rawLoadIdle = this._cpus[i].loadIdle;
            cores[i].rawLoadIrq = this._cpus[i].loadIrq;
            cores[i].rawLoadSteal = this._cpus[i].loadSteal;
            cores[i].rawLoadGuest = this._cpus[i].loadGuest;
          }
          const totalTick =
            totalUser + totalSystem + totalNice + totalIrq + totalSteal + totalGuest + totalIdle;
          const totalLoad =
            totalUser + totalSystem + totalNice + totalIrq + totalSteal + totalGuest;
          const currentTick = totalTick - this._current_cpu.tick;
          result = {
            avgLoad: avgLoad,
            currentLoad: ((totalLoad - this._current_cpu.load) / currentTick) * 100,
            currentLoadUser: ((totalUser - this._current_cpu.user) / currentTick) * 100,
            currentLoadSystem: ((totalSystem - this._current_cpu.system) / currentTick) * 100,
            currentLoadNice: ((totalNice - this._current_cpu.nice) / currentTick) * 100,
            currentLoadIdle: ((totalIdle - this._current_cpu.idle) / currentTick) * 100,
            currentLoadIrq: ((totalIrq - this._current_cpu.irq) / currentTick) * 100,
            currentLoadSteal: ((totalSteal - this._current_cpu.steal) / currentTick) * 100,
            currentLoadGuest: ((totalGuest - this._current_cpu.guest) / currentTick) * 100,
            rawCurrentLoad: totalLoad - this._current_cpu.load,
            rawCurrentLoadUser: totalUser - this._current_cpu.user,
            rawCurrentLoadSystem: totalSystem - this._current_cpu.system,
            rawCurrentLoadNice: totalNice - this._current_cpu.nice,
            rawCurrentLoadIdle: totalIdle - this._current_cpu.idle,
            rawCurrentLoadIrq: totalIrq - this._current_cpu.irq,
            rawCurrentLoadSteal: totalSteal - this._current_cpu.steal,
            rawCurrentLoadGuest: totalGuest - this._current_cpu.guest,
            cpus: cores,
          };
          this._current_cpu = {
            user: totalUser,
            nice: totalNice,
            system: totalSystem,
            idle: totalIdle,
            irq: totalIrq,
            steal: totalSteal,
            guest: totalGuest,
            tick: totalTick,
            load: totalLoad,
            ms: this._current_cpu.ms,
            currentLoad: result.currentLoad,
            currentLoadUser: result.currentLoadUser,
            currentLoadSystem: result.currentLoadSystem,
            currentLoadNice: result.currentLoadNice,
            currentLoadIdle: result.currentLoadIdle,
            currentLoadIrq: result.currentLoadIrq,
            currentLoadSteal: result.currentLoadSteal,
            currentLoadGuest: result.currentLoadGuest,
            rawCurrentLoad: result.rawCurrentLoad,
            rawCurrentLoadUser: result.rawCurrentLoadUser,
            rawCurrentLoadSystem: result.rawCurrentLoadSystem,
            rawCurrentLoadNice: result.rawCurrentLoadNice,
            rawCurrentLoadIdle: result.rawCurrentLoadIdle,
            rawCurrentLoadIrq: result.rawCurrentLoadIrq,
            rawCurrentLoadSteal: result.rawCurrentLoadSteal,
            rawCurrentLoadGuest: result.rawCurrentLoadGuest,
          };
        } else {
          const cores: any = [];
          for (let i = 0; i < this._corecount; i++) {
            cores[i] = {};
            cores[i].load = (this._cpus[i].load / this._cpus[i].currentTick) * 100;
            cores[i].loadUser = (this._cpus[i].loadUser / this._cpus[i].currentTick) * 100;
            cores[i].loadSystem = (this._cpus[i].loadSystem / this._cpus[i].currentTick) * 100;
            cores[i].loadNice = (this._cpus[i].loadNice / this._cpus[i].currentTick) * 100;
            cores[i].loadIdle = (this._cpus[i].loadIdle / this._cpus[i].currentTick) * 100;
            cores[i].loadIrq = (this._cpus[i].loadIrq / this._cpus[i].currentTick) * 100;
            cores[i].rawLoad = this._cpus[i].load;
            cores[i].rawLoadUser = this._cpus[i].loadUser;
            cores[i].rawLoadSystem = this._cpus[i].loadSystem;
            cores[i].rawLoadNice = this._cpus[i].loadNice;
            cores[i].rawLoadIdle = this._cpus[i].loadIdle;
            cores[i].rawLoadIrq = this._cpus[i].loadIrq;
            cores[i].rawLoadSteal = this._cpus[i].loadSteal;
            cores[i].rawLoadGuest = this._cpus[i].loadGuest;
          }
          result = {
            avgLoad: avgLoad,
            currentLoad: this._current_cpu.currentLoad,
            currentLoadUser: this._current_cpu.currentLoadUser,
            currentLoadSystem: this._current_cpu.currentLoadSystem,
            currentLoadNice: this._current_cpu.currentLoadNice,
            currentLoadIdle: this._current_cpu.currentLoadIdle,
            currentLoadIrq: this._current_cpu.currentLoadIrq,
            currentLoadSteal: this._current_cpu.currentLoadSteal,
            currentLoadGuest: this._current_cpu.currentLoadGuest,
            rawCurrentLoad: this._current_cpu.rawCurrentLoad,
            rawCurrentLoadUser: this._current_cpu.rawCurrentLoadUser,
            rawCurrentLoadSystem: this._current_cpu.rawCurrentLoadSystem,
            rawCurrentLoadNice: this._current_cpu.rawCurrentLoadNice,
            rawCurrentLoadIdle: this._current_cpu.rawCurrentLoadIdle,
            rawCurrentLoadIrq: this._current_cpu.rawCurrentLoadIrq,
            rawCurrentLoadSteal: this._current_cpu.rawCurrentLoadSteal,
            rawCurrentLoadGuest: this._current_cpu.rawCurrentLoadGuest,
            cpus: cores,
          };
        }
        resolve(result);
      });
    });
  }

  public currentLoad(callback?: Callback): Promise<Partial<Systeminformation.CurrentLoadData>> {
    return new Promise((resolve) => {
      process.nextTick(() => {
        this.getLoad().then((result) => {
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      });
    });
  }

  // --------------------------
  // PS - full load
  // since bootup

  public getFullLoad(): Promise<number> {
    return new Promise((resolve) => {
      process.nextTick(async () => {
        const cpus = await this.cpus();
        let totalUser = 0;
        let totalSystem = 0;
        let totalNice = 0;
        let totalIrq = 0;
        let totalIdle = 0;

        let result = 0;

        if (cpus && cpus.length) {
          for (let i = 0, len = cpus.length; i < len; i++) {
            const cpu = cpus[i].times;
            totalUser += cpu.user;
            totalSystem += cpu.sys;
            totalNice += cpu.nice;
            totalIrq += cpu.irq;
            totalIdle += cpu.idle;
          }
          const totalTicks = totalIdle + totalIrq + totalNice + totalSystem + totalUser;
          result = ((totalTicks - totalIdle) / totalTicks) * 100.0;
        }
        resolve(result);
      });
    });
  }

  public fullLoad(callback?: Callback): Promise<number> {
    return new Promise((resolve) => {
      process.nextTick(() => {
        this.getFullLoad().then((result) => {
          if (callback) {
            callback(result);
          }
          resolve(result);
        });
      });
    });
  }
}
