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
  mergeControllerNvidia,
  parseLinesDarwin,
  parseLinesLinuxClinfo,
  parseLinesLinuxDisplays,
  plistReader,
  safeParseNumber,
} from './graphics.utils';

export class GraphicsComponent extends RemoteOS {
  private logger = PinoLogger.child({ component: 'GraphicsComponent' });
  private _resolutionX = 0;
  private _resolutionY = 0;
  private _pixelDepth = 0;
  private _refreshRate = 0;
  private _nvidiaSmiPath!: string;

  constructor(
    remoteExecAsync: RemoteExecutorType,
    remoteExecWithCallback: RemoteExecutorTypeWithCallback,
  ) {
    super(remoteExecAsync, remoteExecWithCallback);
  }

  private async parseLinesLinuxControllers(lines: string[]) {
    const controllers: Systeminformation.GraphicsControllerData[] = [];
    let currentController: Systeminformation.GraphicsControllerData = {
      vendor: '',
      subVendor: '',
      model: '',
      bus: '',
      busAddress: '',
      vram: null,
      vramDynamic: false,
      pciID: '',
    };
    let isGraphicsController = false;
    // PCI bus IDs
    let pciIDs: string[] = [];
    try {
      pciIDs = (
        await this.execAsync(
          'export LC_ALL=C; dmidecode -t 9 2>/dev/null; unset LC_ALL | grep "Bus Address: "',
          util.execOptsLinux,
        )
      )
        .toString()
        .split('\n');
      for (let i = 0; i < pciIDs.length; i++) {
        pciIDs[i] = pciIDs[i].replace('Bus Address:', '').replace('0000:', '').trim();
      }
      pciIDs = pciIDs.filter((el) => {
        return el != null && el;
      });
    } catch (e) {
      this.logger.debug(e);
      util.noop();
    }
    let i = 1;
    lines.forEach((line) => {
      let subsystem = '';
      if (i < lines.length && lines[i]) {
        // get next line;
        subsystem = lines[i];
        if (subsystem.indexOf(':') > 0) {
          subsystem = subsystem.split(':')[1];
        }
      }
      if ('' !== line.trim()) {
        if (' ' !== line[0] && '\t' !== line[0]) {
          // first line of new entry
          const isExternal = pciIDs.indexOf(line.split(' ')[0]) >= 0;
          let vgapos = line.toLowerCase().indexOf(' vga ');
          const _3dcontrollerpos = line.toLowerCase().indexOf('3d controller');
          if (vgapos !== -1 || _3dcontrollerpos !== -1) {
            // VGA
            if (_3dcontrollerpos !== -1 && vgapos === -1) {
              vgapos = _3dcontrollerpos;
            }
            if (
              currentController.vendor ||
              currentController.model ||
              currentController.bus ||
              currentController.vram !== null ||
              currentController.vramDynamic
            ) {
              // already a controller found
              controllers.push(currentController);
              currentController = {
                vendor: '',
                model: '',
                bus: '',
                busAddress: '',
                vram: null,
                vramDynamic: false,
              };
            }

            const pciIDCandidate = line.split(' ')[0];
            if (/[\da-fA-F]{2}:[\da-fA-F]{2}\.[\da-fA-F]/.test(pciIDCandidate)) {
              currentController.busAddress = pciIDCandidate;
            }
            isGraphicsController = true;
            const endpos = line.search(/\[[0-9a-f]{4}:[0-9a-f]{4}]|$/);
            const parts = line.substr(vgapos, endpos - vgapos).split(':');
            currentController.busAddress = line.substr(0, vgapos).trim();
            if (parts.length > 1) {
              parts[1] = parts[1].trim();
              if (parts[1].toLowerCase().indexOf('corporation') >= 0) {
                currentController.vendor = parts[1]
                  .substr(0, parts[1].toLowerCase().indexOf('corporation') + 11)
                  .trim();
                currentController.model = parts[1]
                  .substr(parts[1].toLowerCase().indexOf('corporation') + 11, 200)
                  .split('(')[0]
                  .trim();
                currentController.bus = pciIDs.length > 0 && isExternal ? 'PCIe' : 'Onboard';
                currentController.vram = null;
                currentController.vramDynamic = false;
              } else if (parts[1].toLowerCase().indexOf(' inc.') >= 0) {
                if ((parts[1].match(/]/g) || []).length > 1) {
                  currentController.vendor = parts[1]
                    .substr(0, parts[1].toLowerCase().indexOf(']') + 1)
                    .trim();
                  currentController.model = parts[1]
                    .substr(parts[1].toLowerCase().indexOf(']') + 1, 200)
                    .trim()
                    .split('(')[0]
                    .trim();
                } else {
                  currentController.vendor = parts[1]
                    .substr(0, parts[1].toLowerCase().indexOf(' inc.') + 5)
                    .trim();
                  currentController.model = parts[1]
                    .substr(parts[1].toLowerCase().indexOf(' inc.') + 5, 200)
                    .trim()
                    .split('(')[0]
                    .trim();
                }
                currentController.bus = pciIDs.length > 0 && isExternal ? 'PCIe' : 'Onboard';
                currentController.vram = null;
                currentController.vramDynamic = false;
              } else if (parts[1].toLowerCase().indexOf(' ltd.') >= 0) {
                if ((parts[1].match(/]/g) || []).length > 1) {
                  currentController.vendor = parts[1]
                    .substr(0, parts[1].toLowerCase().indexOf(']') + 1)
                    .trim();
                  currentController.model = parts[1]
                    .substr(parts[1].toLowerCase().indexOf(']') + 1, 200)
                    .trim()
                    .split('(')[0]
                    .trim();
                } else {
                  currentController.vendor = parts[1]
                    .substr(0, parts[1].toLowerCase().indexOf(' ltd.') + 5)
                    .trim();
                  currentController.model = parts[1]
                    .substr(parts[1].toLowerCase().indexOf(' ltd.') + 5, 200)
                    .trim()
                    .split('(')[0]
                    .trim();
                }
              }
              if (currentController.model && subsystem.indexOf(currentController.model) !== -1) {
                const subVendor = subsystem.split(currentController.model)[0].trim();
                if (subVendor) {
                  currentController.subVendor = subVendor;
                }
              }
            }
          } else {
            isGraphicsController = false;
          }
        }
        if (isGraphicsController) {
          // within VGA details
          const parts = line.split(':');
          if (
            parts.length > 1 &&
            parts[0].replace(/ +/g, '').toLowerCase().indexOf('devicename') !== -1 &&
            parts[1].toLowerCase().indexOf('onboard') !== -1
          ) {
            currentController.bus = 'Onboard';
          }
          if (
            parts.length > 1 &&
            parts[0].replace(/ +/g, '').toLowerCase().indexOf('region') !== -1 &&
            parts[1].toLowerCase().indexOf('memory') !== -1
          ) {
            const memparts = parts[1].split('=');
            if (memparts.length > 1) {
              currentController.vram = parseInt(memparts[1]);
            }
          }
        }
      }
      i++;
    });

    if (
      currentController.vendor ||
      currentController.model ||
      currentController.bus ||
      currentController.busAddress ||
      currentController.vram !== null ||
      currentController.vramDynamic
    ) {
      // already a controller found
      controllers.push(currentController);
    }
    return controllers;
  }

  private getNvidiaSmi() {
    if (this._nvidiaSmiPath) {
      return this._nvidiaSmiPath;
    }

    if (this.platform === 'win32') {
      /*
      try {
        const basePath = util.WINDIR + '\\System32\\DriverStore\\FileRepository';
        // find all directories that have an nvidia-smi.exe file
        const candidateDirs = fs.readdirSync(basePath).filter((dir) => {
          return fs.readdirSync([basePath, dir].join('/')).includes('nvidia-smi.exe');
        });
        // use the directory with the most recently created nvidia-smi.exe file
        const targetDir = candidateDirs.reduce((prevDir, currentDir) => {
          const previousNvidiaSmi = fs.statSync([basePath, prevDir, 'nvidia-smi.exe'].join('/'));
          const currentNvidiaSmi = fs.statSync(
            [basePath, currentDir, 'nvidia-smi.exe'].join('/'),
          );
          return previousNvidiaSmi.ctimeMs > currentNvidiaSmi.ctimeMs ? prevDir : currentDir;
        });

        if (targetDir) {
          _nvidiaSmiPath = [basePath, targetDir, 'nvidia-smi.exe'].join('/');
        }
      } catch (e) {
        util.noop();
      }
       */
    } else if (this.platform === 'linux') {
      this._nvidiaSmiPath = 'nvidia-smi';
    }
    return this._nvidiaSmiPath;
  }

  private async nvidiaSmi(options?: any) {
    const nvidiaSmiExe = this.getNvidiaSmi();
    options = options || util.execOptsWin;
    if (nvidiaSmiExe) {
      const nvidiaSmiOpts =
        '--query-gpu=driver_version,pci.sub_device_id,name,pci.bus_id,fan.speed,memory.total,memory.used,memory.free,utilization.gpu,utilization.memory,temperature.gpu,temperature.memory,power.draw,power.limit,clocks.gr,clocks.mem --format=csv,noheader,nounits';
      const cmd =
        nvidiaSmiExe + ' ' + nvidiaSmiOpts + (this.platform === 'linux' ? '  2>/dev/null' : '');
      if (this.platform === 'linux') {
        options.stdio = ['pipe', 'pipe', 'ignore'];
      }
      try {
        const res = (await this.execAsync(cmd, options)).toString();
        return res;
      } catch (e) {
        this.logger.debug(e);
        util.noop();
      }
    }
    return '';
  }

  private async nvidiaDevices() {
    const stdout = await this.nvidiaSmi();
    if (!stdout) {
      return [];
    }

    const gpus = stdout.split('\n').filter(Boolean);
    let results = gpus.map((gpu) => {
      const splittedData = gpu
        .split(', ')
        .map((value) => (value.includes('N/A') ? undefined : value));
      if (splittedData.length === 16) {
        return {
          driverVersion: splittedData[0],
          subDeviceId: splittedData[1],
          name: splittedData[2],
          pciBus: splittedData[3],
          fanSpeed: safeParseNumber(splittedData[4]),
          memoryTotal: safeParseNumber(splittedData[5]),
          memoryUsed: safeParseNumber(splittedData[6]),
          memoryFree: safeParseNumber(splittedData[7]),
          utilizationGpu: safeParseNumber(splittedData[8]),
          utilizationMemory: safeParseNumber(splittedData[9]),
          temperatureGpu: safeParseNumber(splittedData[10]),
          temperatureMemory: safeParseNumber(splittedData[11]),
          powerDraw: safeParseNumber(splittedData[12]),
          powerLimit: safeParseNumber(splittedData[13]),
          clockCore: safeParseNumber(splittedData[14]),
          clockMemory: safeParseNumber(splittedData[15]),
        };
      } else {
        return {};
      }
    });
    results = results.filter((item) => {
      return 'pciBus' in item;
    });
    return results;
  }

  public graphics(callback?: Callback): Promise<Systeminformation.GraphicsData | null> {
    // function starts here
    return new Promise((resolve) => {
      process.nextTick(async () => {
        let result: Systeminformation.GraphicsData = {
          controllers: [],
          displays: [],
        };
        if (this.platform === 'darwin') {
          const cmd = 'system_profiler -xml -detailLevel full SPDisplaysDataType';
          this.execWithCallback(cmd, async (error, stdout) => {
            if (!error) {
              try {
                const output = stdout.toString();
                result = parseLinesDarwin(util.plistParser(output)[0]._items);
              } catch (e) {
                this.logger.error(e);
                util.noop();
              }
              try {
                stdout = await this.execAsync(
                  'defaults read /Library/Preferences/com.apple.windowserver.plist 2>/dev/null;defaults read /Library/Preferences/com.apple.windowserver.displays.plist 2>/dev/null; echo ""',
                  { maxBuffer: 1024 * 20000 },
                );
                const output = (stdout || '').toString();
                const obj: any = plistReader(output);
                const displayAnyUserSets = 'DisplayAnyUserSets' as keyof typeof obj;
                if (
                  obj[displayAnyUserSets] &&
                  obj[displayAnyUserSets]['Configs'] &&
                  obj[displayAnyUserSets]['Configs'][0] &&
                  obj[displayAnyUserSets]['Configs'][0]['DisplayConfig']
                ) {
                  const current: any[] = obj[displayAnyUserSets]['Configs'][0]['DisplayConfig'];
                  let i = 0;
                  current.forEach((o) => {
                    if (
                      o['CurrentInfo'] &&
                      o['CurrentInfo']['OriginX'] !== undefined &&
                      result.displays &&
                      result.displays[i]
                    ) {
                      result.displays[i].positionX = o['CurrentInfo']['OriginX'];
                    }
                    if (
                      o['CurrentInfo'] &&
                      o['CurrentInfo']['OriginY'] !== undefined &&
                      result.displays &&
                      result.displays[i]
                    ) {
                      result.displays[i].positionY = o['CurrentInfo']['OriginY'];
                    }
                    i++;
                  });
                }
                if (
                  obj[displayAnyUserSets] &&
                  obj[displayAnyUserSets].length > 0 &&
                  obj[displayAnyUserSets][0].length > 0 &&
                  obj[displayAnyUserSets][0][0]['DisplayID']
                ) {
                  const current = obj['DisplayAnyUserSets'][0];
                  let i = 0;
                  current.forEach((o: any) => {
                    if ('OriginX' in o && result.displays && result.displays[i]) {
                      result.displays[i].positionX = o['OriginX'];
                    }
                    if ('OriginY' in o && result.displays && result.displays[i]) {
                      result.displays[i].positionY = o['OriginY'];
                    }
                    if (
                      o['Mode'] &&
                      o['Mode']['BitsPerPixel'] !== undefined &&
                      result.displays &&
                      result.displays[i]
                    ) {
                      result.displays[i].pixelDepth = o['Mode']['BitsPerPixel'];
                    }
                    i++;
                  });
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
          });
        }
        if (this.platform === 'linux') {
          // Raspberry: https://elinux.org/RPI_vcgencmd_usage
          if (await this.isRaspberry()) {
            const cmd =
              "fbset -s 2> /dev/null | grep 'mode \"' ; vcgencmd get_mem gpu 2> /dev/null; tvservice -s 2> /dev/null; tvservice -n 2> /dev/null;";
            this.execWithCallback(cmd, async (error, stdout) => {
              const lines = stdout.toString().split('\n');
              if (
                lines.length > 3 &&
                lines[0].indexOf('mode "') >= -1 &&
                lines[2].indexOf('0x12000a') > -1
              ) {
                const parts = lines[0].replace('mode', '').replace(/"/g, '').trim().split('x');
                if (parts.length === 2) {
                  result.displays.push({
                    vendor: '',
                    model: util.getValue(lines, 'device_name', '='),
                    main: true,
                    builtin: false,
                    connection: 'HDMI',
                    sizeX: null,
                    sizeY: null,
                    pixelDepth: null,
                    resolutionX: parseInt(parts[0], 10),
                    resolutionY: parseInt(parts[1], 10),
                    currentResX: null,
                    currentResY: null,
                    positionX: 0,
                    positionY: 0,
                    currentRefreshRate: null,
                  } as Systeminformation.GraphicsDisplayData);
                }
              }
              if (lines.length >= 1 && stdout.toString().indexOf('gpu=') >= -1) {
                result.controllers.push({
                  vendor: 'Broadcom',
                  model: await this.getRpiGpu(),
                  bus: '',
                  vram: util.getValue(lines, 'gpu', '=').replace('M', ''),
                  vramDynamic: true,
                });
              }
              // if (callback) {
              //   callback(result);
              // }
              // resolve(result);
            });
          }
          // } else {
          const cmd = 'lspci -vvv  2>/dev/null';
          this.execWithCallback(cmd, async (error, stdout) => {
            if (!error) {
              const lines = stdout.toString().split('\n');
              if (result.controllers.length === 0) {
                result.controllers = await this.parseLinesLinuxControllers(lines);

                const nvidiaData = await this.nvidiaDevices();
                // needs to be rewritten ... using no spread operators
                result.controllers = result.controllers.map((controller) => {
                  // match by busAddress
                  return mergeControllerNvidia(
                    controller,
                    nvidiaData.find((contr) =>
                      contr.pciBus
                        ?.toLowerCase()
                        .endsWith(controller.busAddress?.toLowerCase() as string),
                    ) || {},
                  );
                });
              }
            }
            const cmd = 'clinfo --raw';
            this.execWithCallback(cmd, (error, stdout) => {
              if (!error) {
                const lines = stdout.toString().split('\n');
                result.controllers = parseLinesLinuxClinfo(result.controllers, lines);
              }
              const cmd = "xdpyinfo 2>/dev/null | grep 'depth of root window' | awk '{ print $5 }'";
              this.execWithCallback(cmd, (error, stdout) => {
                let depth = 0;
                if (!error) {
                  const lines = stdout.toString().split('\n');
                  depth = parseInt(lines[0]) || 0;
                }
                const cmd = 'xrandr --verbose 2>/dev/null';
                this.execWithCallback(cmd, (error, stdout) => {
                  if (!error) {
                    const lines = stdout.toString().split('\n');
                    result.displays = parseLinesLinuxDisplays(
                      lines,
                      depth,
                    ) as Systeminformation.GraphicsDisplayData[];
                  }
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                });
              });
            });
          });
          // }
        }
        if (
          this.platform === 'freebsd' ||
          this.platform === 'openbsd' ||
          this.platform === 'netbsd'
        ) {
          if (callback) {
            callback(null);
          }
          resolve(null);
        }
        if (this.platform === 'sunos') {
          if (callback) {
            callback(null);
          }
          resolve(null);
        }
        if (this.platform === 'win32') {
          if (callback) {
            callback(result);
          }
          resolve(result);
          // https://blogs.technet.microsoft.com/heyscriptingguy/2013/10/03/use-powershell-to-discover-multi-monitor-information/
          // https://devblogs.microsoft.com/scripting/use-powershell-to-discover-multi-monitor-information/
          /*
          try {
            const workload = [];
            workload.push(util.powerShell('Get-CimInstance win32_VideoController | fl *'));
            workload.push(
              util.powerShell(
                'gp "HKLM:\\SYSTEM\\ControlSet001\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}\\*" -ErrorAction SilentlyContinue | where MatchingDeviceId $null -NE | select MatchingDeviceId,HardwareInformation.qwMemorySize | fl',
              ),
            );
            workload.push(util.powerShell('Get-CimInstance win32_desktopmonitor | fl *'));
            workload.push(
              util.powerShell(
                'Get-CimInstance -Namespace root\\wmi -ClassName WmiMonitorBasicDisplayParams | fl',
              ),
            );
            workload.push(
              util.powerShell(
                'Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Screen]::AllScreens',
              ),
            );
            workload.push(
              util.powerShell(
                'Get-CimInstance -Namespace root\\wmi -ClassName WmiMonitorConnectionParams | fl',
              ),
            );
            workload.push(
              util.powerShell(
                'gwmi WmiMonitorID -Namespace root\\wmi | ForEach-Object {(($_.ManufacturerName -notmatch 0 | foreach {[char]$_}) -join "") + "|" + (($_.ProductCodeID -notmatch 0 | foreach {[char]$_}) -join "") + "|" + (($_.UserFriendlyName -notmatch 0 | foreach {[char]$_}) -join "") + "|" + (($_.SerialNumberID -notmatch 0 | foreach {[char]$_}) -join "") + "|" + $_.InstanceName}',
              ),
            );

            const nvidiaData = nvidiaDevices();

            Promise.all(workload)
              .then((data) => {
                // controller + vram
                const csections = data[0].replace(/\r/g, '').split(/\n\s*\n/);
                const vsections = data[1].replace(/\r/g, '').split(/\n\s*\n/);
                result.controllers = parseLinesWindowsControllers(csections, vsections);
                result.controllers = result.controllers.map((controller) => {
                  // match by subDeviceId
                  if (controller.vendor.toLowerCase() === 'nvidia') {
                    return mergeControllerNvidia(
                      controller,
                      nvidiaData.find((device) => {
                        let windowsSubDeviceId = (controller.subDeviceId || '').toLowerCase();
                        const nvidiaSubDeviceIdParts = device.subDeviceId.split('x');
                        let nvidiaSubDeviceId =
                          nvidiaSubDeviceIdParts.length > 1
                            ? nvidiaSubDeviceIdParts[1].toLowerCase()
                            : nvidiaSubDeviceIdParts[0].toLowerCase();
                        const lengthDifference = Math.abs(
                          windowsSubDeviceId.length - nvidiaSubDeviceId.length,
                        );
                        if (windowsSubDeviceId.length > nvidiaSubDeviceId.length) {
                          for (let i = 0; i < lengthDifference; i++) {
                            nvidiaSubDeviceId = '0' + nvidiaSubDeviceId;
                          }
                        } else if (windowsSubDeviceId.length < nvidiaSubDeviceId.length) {
                          for (let i = 0; i < lengthDifference; i++) {
                            windowsSubDeviceId = '0' + windowsSubDeviceId;
                          }
                        }
                        return windowsSubDeviceId === nvidiaSubDeviceId;
                      }) || {},
                    );
                  } else {
                    return controller;
                  }
                });

                // displays
                const dsections = data[2].replace(/\r/g, '').split(/\n\s*\n/);
                // result.displays = parseLinesWindowsDisplays(dsections);
                if (dsections[0].trim() === '') {
                  dsections.shift();
                }
                if (dsections.length && dsections[dsections.length - 1].trim() === '') {
                  dsections.pop();
                }

                // monitor (powershell)
                const msections = data[3].replace(/\r/g, '').split('Active ');
                msections.shift();

                // forms.screens (powershell)
                const ssections = data[4].replace(/\r/g, '').split('BitsPerPixel ');
                ssections.shift();

                // connection params (powershell) - video type
                const tsections = data[5].replace(/\r/g, '').split(/\n\s*\n/);
                tsections.shift();

                // monitor ID (powershell) - model / vendor
                const res = data[6].replace(/\r/g, '').split(/\n/);
                const isections = [];
                res.forEach((element) => {
                  const parts = element.split('|');
                  if (parts.length === 5) {
                    isections.push({
                      vendor: parts[0],
                      code: parts[1],
                      model: parts[2],
                      serial: parts[3],
                      instanceId: parts[4],
                    });
                  }
                });

                result.displays = parseLinesWindowsDisplaysPowershell(
                  ssections,
                  msections,
                  dsections,
                  tsections,
                  isections,
                );

                if (result.displays.length === 1) {
                  if (_resolutionX) {
                    result.displays[0].resolutionX = _resolutionX;
                    if (!result.displays[0].currentResX) {
                      result.displays[0].currentResX = _resolutionX;
                    }
                  }
                  if (_resolutionY) {
                    result.displays[0].resolutionY = _resolutionY;
                    if (result.displays[0].currentResY === 0) {
                      result.displays[0].currentResY = _resolutionY;
                    }
                  }
                  if (_pixelDepth) {
                    result.displays[0].pixelDepth = _pixelDepth;
                  }
                }
                result.displays = result.displays.map((element) => {
                  if (_refreshRate && !element.currentRefreshRate) {
                    element.currentRefreshRate = _refreshRate;
                  }
                  return element;
                });

                if (callback) {
                  callback(result);
                }
                resolve(result);
              })
              .catch(() => {
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

  private parseLinesWindowsControllers(sections: string[], vections: string[]) {
    const memorySizes: Record<string, any> = {};
    for (const i in vections) {
      if ({}.hasOwnProperty.call(vections, i)) {
        if (vections[i].trim() !== '') {
          const lines = vections[i].trim().split('\n');
          const matchingDeviceId = util
            .getValue(lines, 'MatchingDeviceId')
            .match(
              /PCI\\(VEN_[0-9A-F]{4})&(DEV_[0-9A-F]{4})(?:&(SUBSYS_[0-9A-F]{8}))?(?:&(REV_[0-9A-F]{2}))?/i,
            );
          if (matchingDeviceId) {
            const quadWordmemorySize = parseInt(
              util.getValue(lines, 'HardwareInformation.qwMemorySize'),
            );
            if (!isNaN(quadWordmemorySize)) {
              let deviceId =
                matchingDeviceId[1].toUpperCase() + '&' + matchingDeviceId[2].toUpperCase();
              if (matchingDeviceId[3]) {
                deviceId += '&' + matchingDeviceId[3].toUpperCase();
              }
              if (matchingDeviceId[4]) {
                deviceId += '&' + matchingDeviceId[4].toUpperCase();
              }
              memorySizes[deviceId] = quadWordmemorySize;
            }
          }
        }
      }
    }

    const controllers: Systeminformation.GraphicsControllerData[] = [];
    for (const i in sections) {
      if ({}.hasOwnProperty.call(sections, i)) {
        if (sections[i].trim() !== '') {
          const lines = sections[i].trim().split('\n');
          const pnpDeviceId = util
            .getValue(lines, 'PNPDeviceID', ':')
            .match(
              /PCI\\(VEN_[0-9A-F]{4})&(DEV_[0-9A-F]{4})(?:&(SUBSYS_[0-9A-F]{8}))?(?:&(REV_[0-9A-F]{2}))?/i,
            );
          let subDeviceId: string | null = null;
          let memorySize = null;
          if (pnpDeviceId) {
            subDeviceId = pnpDeviceId[3] || '';
            if (subDeviceId) {
              subDeviceId = subDeviceId.split('_')[1];
            }

            // Match PCI device identifier (there's an order of increasing generality):
            // https://docs.microsoft.com/en-us/windows-hardware/drivers/install/identifiers-for-pci-devices

            // PCI\VEN_v(4)&DEV_d(4)&SUBSYS_s(4)n(4)&REV_r(2)
            if (memorySize == null && pnpDeviceId[3] && pnpDeviceId[4]) {
              const deviceId =
                pnpDeviceId[1].toUpperCase() +
                '&' +
                pnpDeviceId[2].toUpperCase() +
                '&' +
                pnpDeviceId[3].toUpperCase() +
                '&' +
                pnpDeviceId[4].toUpperCase();
              if ({}.hasOwnProperty.call(memorySizes, deviceId)) {
                memorySize = memorySizes[deviceId];
              }
            }

            // PCI\VEN_v(4)&DEV_d(4)&SUBSYS_s(4)n(4)
            if (memorySize == null && pnpDeviceId[3]) {
              const deviceId =
                pnpDeviceId[1].toUpperCase() +
                '&' +
                pnpDeviceId[2].toUpperCase() +
                '&' +
                pnpDeviceId[3].toUpperCase();
              if ({}.hasOwnProperty.call(memorySizes, deviceId)) {
                memorySize = memorySizes[deviceId];
              }
            }

            // PCI\VEN_v(4)&DEV_d(4)&REV_r(2)
            if (memorySize == null && pnpDeviceId[4]) {
              const deviceId =
                pnpDeviceId[1].toUpperCase() +
                '&' +
                pnpDeviceId[2].toUpperCase() +
                '&' +
                pnpDeviceId[4].toUpperCase();
              if ({}.hasOwnProperty.call(memorySizes, deviceId)) {
                memorySize = memorySizes[deviceId];
              }
            }

            // PCI\VEN_v(4)&DEV_d(4)
            if (memorySize == null) {
              const deviceId = pnpDeviceId[1].toUpperCase() + '&' + pnpDeviceId[2].toUpperCase();
              if ({}.hasOwnProperty.call(memorySizes, deviceId)) {
                memorySize = memorySizes[deviceId];
              }
            }
          }

          controllers.push({
            vendor: util.getValue(lines, 'AdapterCompatibility', ':'),
            model: util.getValue(lines, 'name', ':'),
            bus: util.getValue(lines, 'PNPDeviceID', ':').startsWith('PCI') ? 'PCI' : '',
            vram:
              (memorySize == null
                ? util.toInt(util.getValue(lines, 'AdapterRAM', ':'))
                : memorySize) /
              1024 /
              1024,
            vramDynamic: util.getValue(lines, 'VideoMemoryType', ':') === '2',
            subDeviceId,
          } as Systeminformation.GraphicsControllerData);
          this._resolutionX =
            util.toInt(util.getValue(lines, 'CurrentHorizontalResolution', ':')) ||
            this._resolutionX;
          this._resolutionY =
            util.toInt(util.getValue(lines, 'CurrentVerticalResolution', ':')) || this._resolutionY;
          this._refreshRate =
            util.toInt(util.getValue(lines, 'CurrentRefreshRate', ':')) || this._refreshRate;
          this._pixelDepth =
            util.toInt(util.getValue(lines, 'CurrentBitsPerPixel', ':')) || this._pixelDepth;
        }
      }
    }
    return controllers;
  }
}
