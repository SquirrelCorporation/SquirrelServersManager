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
import PinoLogger from '../../../../../logger';
import { RemoteOS } from '../remote-os/remote-os.component';
import {
  Callback,
  RemoteExecutorType,
  RemoteExecutorTypeWithCallback,
} from '../../types/remote-executor.types';
import * as util from '../utils/system-utils';
import {
  blkStdoutToObject,
  decodeMdabmData,
  filterLines,
  getVendorFromModel,
  isLinuxTmpFs,
  matchDevicesLinux,
  matchDevicesMac,
  parseBlk,
  parseDevices,
} from './filesystem.utils';

export class FileSystemComponent extends RemoteOS {
  private logger = PinoLogger.child({ component: 'OSInformationComponent' });
  private _fs_speed: Partial<Systeminformation.FsStatsData> & any = {};
  private _disk_io: Partial<Systeminformation.DisksIoData> & any = {};

  constructor(
    remoteExecAsync: RemoteExecutorType,
    remoteExecWithCallback: RemoteExecutorTypeWithCallback,
  ) {
    super(remoteExecAsync, remoteExecWithCallback);
  }
  // --------------------------
  // FS - mounted file systems
  public fsSize(drive?: any, callback?: Callback): Promise<Systeminformation.FsSizeData[]> {
    if (util.isFunction(drive)) {
      callback = drive;
      drive = '';
    }

    let macOsDisks: any[] = [];
    let osMounts: Record<any, any> = [];

    const getmacOsFsType = (fs: string) => {
      if (!fs.startsWith('/')) {
        return 'NFS';
      }
      const parts = fs.split('/');
      const fsShort = parts[parts.length - 1];
      const macOsDisksSingle = macOsDisks.filter((item) => item.indexOf(fsShort) >= 0);
      if (macOsDisksSingle.length === 1 && macOsDisksSingle[0].indexOf('APFS') >= 0) {
        return 'APFS';
      }
      return 'HFS';
    };

    const parseDf = (lines: any[]) => {
      const data: Systeminformation.FsSizeData[] = [];
      lines.forEach((line) => {
        if (line !== '') {
          line = line.replace(/ +/g, ' ').split(' ');
          if (
            line &&
            (line[0].startsWith('/') ||
              (line[6] && line[6] === '/') ||
              line[0].indexOf('/') > 0 ||
              line[0].indexOf(':') === 1 ||
              (!(this.platform === 'darwin') && !isLinuxTmpFs(line[1])))
          ) {
            const fs = line[0];
            const fsType =
              this.platform === 'linux' ||
              this.platform === 'freebsd' ||
              this.platform === 'openbsd' ||
              this.platform === 'netbsd'
                ? line[1]
                : getmacOsFsType(line[0]);
            const size =
              parseInt(
                this.platform === 'linux' ||
                  this.platform === 'freebsd' ||
                  this.platform === 'openbsd' ||
                  this.platform === 'netbsd'
                  ? line[2]
                  : line[1],
              ) * 1024;
            const used =
              parseInt(
                this.platform === 'linux' ||
                  this.platform === 'freebsd' ||
                  this.platform === 'openbsd' ||
                  this.platform === 'netbsd'
                  ? line[3]
                  : line[2],
              ) * 1024;
            const available =
              parseInt(
                this.platform === 'linux' ||
                  this.platform === 'freebsd' ||
                  this.platform === 'openbsd' ||
                  this.platform === 'netbsd'
                  ? line[4]
                  : line[3],
              ) * 1024;
            const use = parseFloat((100.0 * (used / (used + available))).toFixed(2));
            const rw = osMounts && Object.keys(osMounts).length > 0 ? osMounts[fs] || false : null;
            line.splice(
              0,
              this.platform === 'linux' ||
                this.platform === 'freebsd' ||
                this.platform === 'openbsd' ||
                this.platform === 'netbsd'
                ? 6
                : 5,
            );
            const mount = line.join(' ');
            if (!data.find((el) => el.fs === fs && el.type === fsType)) {
              data.push({
                fs,
                type: fsType,
                size,
                used,
                available,
                use,
                mount,
                rw,
              });
            }
          }
        }
      });
      return data;
    };

    return new Promise((resolve) => {
      process.nextTick(
        async () => {
          let data: any[] = [];
          if (
            this.platform === 'linux' ||
            this.platform === 'freebsd' ||
            this.platform === 'openbsd' ||
            this.platform === 'netbsd' ||
            this.platform === 'darwin'
          ) {
            let cmd = '';
            macOsDisks = [];
            osMounts = {};
            if (this.platform === 'darwin') {
              cmd = 'df -kP';
              try {
                macOsDisks = (await this.execAsync('diskutil list'))
                  .toString()
                  .split('\n')
                  .filter((line) => {
                    return !line.startsWith('/') && line.indexOf(':') > 0;
                  });
                (await this.execAsync('mount'))
                  .toString()
                  .split('\n')
                  .filter((line) => {
                    return line.startsWith('/');
                  })
                  .forEach((line) => {
                    osMounts[line.split(' ')[0]] = line.toLowerCase().indexOf('read-only') === -1;
                  });
              } catch (e) {
                this.logger.error(e);
                util.noop();
              }
            }
            if (this.platform === 'linux') {
              try {
                cmd = 'export LC_ALL=C; df -lkPTx squashfs; unset LC_ALL';
                (await this.execAsync('cat /proc/mounts 2>/dev/null', util.execOptsLinux))
                  .toString()
                  .split('\n')
                  .filter((line) => {
                    return line.startsWith('/');
                  })
                  .forEach((line) => {
                    osMounts[line.split(' ')[0]] = osMounts[line.split(' ')[0]] || false;
                    if (line.toLowerCase().indexOf('/snap/') === -1) {
                      osMounts[line.split(' ')[0]] =
                        line.toLowerCase().indexOf('rw,') >= 0 ||
                        line.toLowerCase().indexOf(' rw ') >= 0;
                    }
                  });
              } catch (e) {
                this.logger.error(e);
                util.noop();
              }
            }
            if (
              this.platform === 'freebsd' ||
              this.platform === 'openbsd' ||
              this.platform === 'netbsd'
            ) {
              try {
                cmd = 'df -lkPT';
                (await this.execAsync('mount'))
                  .toString()
                  .split('\n')
                  .forEach((line) => {
                    osMounts[line.split(' ')[0]] = line.toLowerCase().indexOf('read-only') === -1;
                  });
              } catch (e) {
                this.logger.error(e);
                util.noop();
              }
            }
            this.execWithCallback(
              cmd,
              (error, stdout) => {
                const lines = filterLines(stdout);
                data = parseDf(lines);
                if (drive) {
                  data = data.filter((item) => {
                    return (
                      item.fs.toLowerCase().indexOf(drive.toLowerCase()) >= 0 ||
                      item.mount.toLowerCase().indexOf(drive.toLowerCase()) >= 0
                    );
                  });
                }
                if ((!error || data.length) && stdout.toString().trim() !== '') {
                  if (callback) {
                    callback(data);
                  }
                  resolve(data);
                } else {
                  this.execWithCallback('df -kPT', (error, stdout) => {
                    if (!error) {
                      const lines = filterLines(stdout);
                      data = parseDf(lines);
                    }
                    if (callback) {
                      callback(data);
                    }
                    resolve(data);
                  });
                }
              },
              { maxBuffer: 1024 * 1024 },
            );
          }
          if (this.platform === 'sunos') {
            if (callback) {
              callback(data);
            }
            resolve(data);
          }
          if (this.platform === 'win32') {
            if (callback) {
              callback(data);
            }
            resolve(data);
            /*
          try {
            const cmd = `Get-WmiObject Win32_logicaldisk | select Access,Caption,FileSystem,FreeSpace,Size ${drive ? '| where -property Caption -eq ' + drive : ''} | fl`;
            util.powerShell(cmd).then((stdout, error) => {
              if (!error) {
                let devices = stdout.toString().split(/\n\s*\n/);
                devices.forEach(function (device) {
                  let lines = device.split('\r\n');
                  const size = util.toInt(util.getValue(lines, 'size', ':'));
                  const free = util.toInt(util.getValue(lines, 'freespace', ':'));
                  const caption = util.getValue(lines, 'caption', ':');
                  const rwValue = util.getValue(lines, 'access', ':');
                  const rw = rwValue ? (util.toInt(rwValue) !== 1) : null;
                  if (size) {
                    data.push({
                      fs: caption,
                      type: util.getValue(lines, 'filesystem', ':'),
                      size,
                      used: size - free,
                      available: free,
                      use: parseFloat(((100.0 * (size - free)) / size).toFixed(2)),
                      mount: caption,
                      rw
                    });
                  }
                });
              }
              if (callback) {
                callback(data);
              }
              resolve(data);
            });
          } catch (e) {
            if (callback) { callback(data); }
            resolve(data);
          }

           */
          }
        },
        { maxBuffer: 1024 * 1024 },
      );
    });
  }

  // --------------------------
  // FS - open files count
  public fsOpenFiles(callback?: Callback): Promise<Systeminformation.FsOpenFilesData | null> {
    return new Promise((resolve) => {
      process.nextTick(() => {
        const result: Systeminformation.FsOpenFilesData = {
          max: null,
          allocated: null,
          available: null,
        };
        if (
          this.platform === 'freebsd' ||
          this.platform === 'openbsd' ||
          this.platform === 'netbsd' ||
          this.platform === 'darwin'
        ) {
          const cmd = 'sysctl -i kern.maxfiles kern.num_files kern.open_files';
          this.execWithCallback(
            cmd,
            (error, stdout) => {
              if (!error) {
                const lines = stdout.toString().split('\n');
                result.max = parseInt(util.getValue(lines, 'kern.maxfiles', ':'), 10);
                result.allocated =
                  parseInt(util.getValue(lines, 'kern.num_files', ':'), 10) ||
                  parseInt(util.getValue(lines, 'kern.open_files', ':'), 10);
                result.available = result.max - result.allocated;
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            },
            { maxBuffer: 1024 * 1024 },
          );
        }
        if (this.platform === 'linux') {
          this.readFileWithCallback('/proc/sys/fs/file-nr', (error, stdout) => {
            if (!error) {
              const lines = stdout.toString().split('\n');
              if (lines[0]) {
                const parts = lines[0].replace(/\s+/g, ' ').split(' ');
                if (parts.length === 3) {
                  result.allocated = parseInt(parts[0], 10);
                  result.available = parseInt(parts[1], 10);
                  result.max = parseInt(parts[2], 10);
                  if (!result.available) {
                    result.available = result.max - result.allocated;
                  }
                }
              }
              if (callback) {
                callback(result);
              }
              resolve(result);
            } else {
              this.readFileWithCallback('/proc/sys/fs/file-max', (error, stdout) => {
                if (!error) {
                  const lines = stdout.toString().split('\n');
                  if (lines[0]) {
                    result.max = parseInt(lines[0], 10);
                  }
                }
                if (callback) {
                  callback(result);
                }
                resolve(result);
              });
            }
          });
        }
        if (this.platform === 'sunos') {
          if (callback) {
            callback(null);
          }
          resolve(null);
        }
        if (this.platform === 'win32') {
          if (callback) {
            callback(null);
          }
          resolve(null);
        }
      });
    });
  }

  // --------------------------
  // disks

  private async raidMatchLinux(data: any[]) {
    // for all block devices of type "raid%"
    let result = data;
    try {
      for (const element of data) {
        if (element.type.startsWith('raid')) {
          const lines = (
            await this.execAsync(`mdadm --export --detail /dev/${element.name}`, util.execOptsLinux)
          )
            .toString()
            .split('\n');
          const mdData = decodeMdabmData(lines);

          element.label = mdData.label; // <- assign label info
          element.uuid = mdData.uuid; // <- assign uuid info

          if (mdData.members && mdData.members.length && mdData.raid === element.type) {
            result = result.map((blockdevice) => {
              if (
                blockdevice.fsType === 'linux_raid_member' &&
                mdData.members.indexOf(blockdevice.name) >= 0
              ) {
                blockdevice.group = element.name;
              }
              return blockdevice;
            });
          }
        }
      }
    } catch (e) {
      this.logger.error(e);
      util.noop();
    }
    return result;
  }

  public blockDevices(callback?: Callback) {
    return new Promise((resolve) => {
      process.nextTick(
        () => {
          let data: Partial<Systeminformation.BlockDevicesData>[] = [];
          if (this.platform === 'linux') {
            // see https://wiki.ubuntuusers.de/lsblk/
            // this.execWithCallback"lsblk -bo NAME,TYPE,SIZE,FSTYPE,MOUNTPOINT,UUID,ROTA,RO,TRAN,SERIAL,LABEL,MODEL,OWNER,GROUP,MODE,ALIGNMENT,MIN-IO,OPT-IO,PHY-SEC,LOG-SEC,SCHED,RQ-SIZE,RA,WSAME", function (error, stdout) {
            this.execWithCallback(
              'lsblk -bPo NAME,TYPE,SIZE,FSTYPE,MOUNTPOINT,UUID,ROTA,RO,RM,TRAN,SERIAL,LABEL,MODEL,OWNER 2>/dev/null',
              async (error, stdout) => {
                if (!error) {
                  const lines = blkStdoutToObject(stdout).split('\n');
                  data = parseBlk(lines);
                  data = await this.raidMatchLinux(data);
                  data = matchDevicesLinux(data);
                  if (callback) {
                    callback(data);
                  }
                  resolve(data);
                } else {
                  this.execWithCallback(
                    'lsblk -bPo NAME,TYPE,SIZE,FSTYPE,MOUNTPOINT,UUID,ROTA,RO,RM,LABEL,MODEL,OWNER 2>/dev/null',
                    async (error, stdout) => {
                      if (!error) {
                        const lines = blkStdoutToObject(stdout).split('\n');
                        data = parseBlk(lines);
                        data = await this.raidMatchLinux(data);
                      }
                      if (callback) {
                        callback(data);
                      }
                      resolve(data);
                    },
                    { maxBuffer: 1024 * 1024 },
                  );
                }
              },
            );
          }
          if (this.platform === 'darwin') {
            this.execWithCallback(
              'diskutil info -all',
              (error, stdout) => {
                if (!error) {
                  const lines = stdout.toString().split('\n');
                  // parse lines into temp array of devices
                  data = parseDevices(lines);
                  data = matchDevicesMac(data);
                }
                if (callback) {
                  callback(data);
                }
                resolve(data);
              },
              { maxBuffer: 1024 * 1024 },
            );
          }
          if (this.platform === 'sunos') {
            if (callback) {
              callback(data);
            }
            resolve(data);
          }
          if (this.platform === 'win32') {
            if (callback) {
              callback(data);
            }
            resolve(data);
            /*
          let drivetypes = ['Unknown', 'NoRoot', 'Removable', 'Local', 'Network', 'CD/DVD', 'RAM'];
          try {
            // util.wmic('logicaldisk get Caption,Description,DeviceID,DriveType,FileSystem,FreeSpace,Name,Size,VolumeName,VolumeSerialNumber /value').then((stdout, error) => {
            // util.powerShell('Get-CimInstance Win32_logicaldisk | select Caption,DriveType,Name,FileSystem,Size,VolumeSerialNumber,VolumeName | fl').then((stdout, error) => {
            const workload = [];
            workload.push(util.powerShell('Get-CimInstance -ClassName Win32_LogicalDisk | select Caption,DriveType,Name,FileSystem,Size,VolumeSerialNumber,VolumeName | fl'));
            workload.push(util.powerShell('Get-WmiObject -Class Win32_diskdrive | Select-Object -Property PNPDeviceId,DeviceID, Model, Size, @{L=\'Partitions\'; E={$_.GetRelated(\'Win32_DiskPartition\').GetRelated(\'Win32_LogicalDisk\') | Select-Object -Property DeviceID, VolumeName, Size, FreeSpace}} | fl'));
            util.promiseAll(
              workload
            ).then((res) => {
              let logicalDisks = res.results[0].toString().split(/\n\s*\n/);
              let diskDrives = res.results[1].toString().split(/\n\s*\n/);
              logicalDisks.forEach(function (device) {
                let lines = device.split('\r\n');
                let drivetype = util.getValue(lines, 'drivetype', ':');
                if (drivetype) {
                  data.push({
                    name: util.getValue(lines, 'name', ':'),
                    identifier: util.getValue(lines, 'caption', ':'),
                    type: 'disk',
                    fsType: util.getValue(lines, 'filesystem', ':').toLowerCase(),
                    mount: util.getValue(lines, 'caption', ':'),
                    size: util.getValue(lines, 'size', ':'),
                    physical: (drivetype >= 0 && drivetype <= 6) ? drivetypes[drivetype] : drivetypes[0],
                    uuid: util.getValue(lines, 'volumeserialnumber', ':'),
                    label: util.getValue(lines, 'volumename', ':'),
                    model: '',
                    serial: util.getValue(lines, 'volumeserialnumber', ':'),
                    removable: drivetype === '2',
                    protocol: '',
                    group: '',
                    device: ''
                  });
                }
              });
              // match devices
              data = matchDevicesWin(data, diskDrives);
              if (callback) {
                callback(data);
              }
              resolve(data);
            });
          } catch (e) {
            if (callback) { callback(data); }
            resolve(data);
          }

           */
          }
          if (
            this.platform === 'freebsd' ||
            this.platform === 'openbsd' ||
            this.platform === 'netbsd'
          ) {
            // will follow
            if (callback) {
              callback(null);
            }
            resolve(null);
          }
        },
        { maxBuffer: 1024 * 1024 },
      );
    });
  }

  // --------------------------
  // FS - speed
  private calcFsSpeed(rx: number, wx: number) {
    const result = {
      rx: 0,
      wx: 0,
      tx: 0,
      rx_sec: null,
      wx_sec: null,
      tx_sec: null,
      ms: 0,
    } as Systeminformation.FsStatsData;

    if (this._fs_speed && this._fs_speed.ms) {
      result.rx = rx;
      result.wx = wx;
      result.tx = result.rx + result.wx;
      result.ms = Date.now() - this._fs_speed.ms;
      result.rx_sec = (result.rx - this._fs_speed.bytes_read) / (result.ms / 1000);
      result.wx_sec = (result.wx - this._fs_speed.bytes_write) / (result.ms / 1000);
      result.tx_sec = result.rx_sec + result.wx_sec;
      this._fs_speed.rx_sec = result.rx_sec;
      this._fs_speed.wx_sec = result.wx_sec;
      this._fs_speed.tx_sec = result.tx_sec;
      this._fs_speed.bytes_read = result.rx;
      this._fs_speed.bytes_write = result.wx;
      this._fs_speed.bytes_overall = result.rx + result.wx;
      this._fs_speed.ms = Date.now();
      this._fs_speed.last_ms = result.ms;
    } else {
      result.rx = rx;
      result.wx = wx;
      result.tx = result.rx + result.wx;
      this._fs_speed.rx_sec = null;
      this._fs_speed.wx_sec = null;
      this._fs_speed.tx_sec = null;
      this._fs_speed.bytes_read = result.rx;
      this._fs_speed.bytes_write = result.wx;
      this._fs_speed.bytes_overall = result.rx + result.wx;
      this._fs_speed.ms = Date.now();
      this._fs_speed.last_ms = 0;
    }
    return result;
  }

  public fsStats(callback?: Callback): Promise<Systeminformation.FsStatsData | null> {
    return new Promise((resolve) => {
      process.nextTick(() => {
        if (
          this.platform === 'win32' ||
          this.platform === 'freebsd' ||
          this.platform === 'openbsd' ||
          this.platform === 'netbsd' ||
          this.platform === 'sunos'
        ) {
          return resolve(null);
        }

        let result = {
          rx: 0,
          wx: 0,
          tx: 0,
          rx_sec: null,
          wx_sec: null,
          tx_sec: null,
          ms: 0,
        } as Systeminformation.FsStatsData;

        let rx = 0;
        let wx = 0;
        if (
          (this._fs_speed && !this._fs_speed.ms) ||
          (this._fs_speed && this._fs_speed.ms && Date.now() - this._fs_speed.ms >= 500)
        ) {
          if (this.platform === 'linux') {
            // this.execWithCallback"df -k | grep /dev/", function(error, stdout) {
            this.execWithCallback(
              'lsblk -r 2>/dev/null | grep /',
              (error, stdout) => {
                if (!error) {
                  const lines = stdout.toString().split('\n');
                  const fs_filter: string[] = [];
                  lines.forEach((line) => {
                    if (line !== '') {
                      const splitLine = line.trim().split(' ');
                      if (fs_filter.indexOf(splitLine[0]) === -1) {
                        fs_filter.push(splitLine[0]);
                      }
                    }
                  });

                  const output = fs_filter.join('|');
                  this.execWithCallback(
                    'cat /proc/diskstats | egrep "' + output + '"',
                    (error, stdout) => {
                      if (!error) {
                        const lines = stdout.toString().split('\n');
                        lines.forEach(
                          function (line) {
                            line = line.trim();
                            if (line !== '') {
                              const splitLine = line.replace(/ +/g, ' ').split(' ');

                              rx += parseInt(splitLine[5]) * 512;
                              wx += parseInt(splitLine[9]) * 512;
                            }
                          },
                          { maxBuffer: 1024 * 1024 },
                        );
                        result = this.calcFsSpeed(rx, wx);
                      }
                      if (callback) {
                        callback(result);
                      }
                      resolve(result);
                    },
                  );
                } else {
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                }
              },
              { maxBuffer: 1024 * 1024 },
            );
          }
          if (this.platform === 'darwin') {
            this.execWithCallback(
              'ioreg -c IOBlockStorageDriver -k Statistics -r -w0 | sed -n "/IOBlockStorageDriver/,/Statistics/p" | grep "Statistics" | tr -cd "01234567890,\n"',
              (error, stdout) => {
                if (!error) {
                  const lines = stdout.toString().split('\n');
                  lines.forEach(
                    function (line) {
                      line = line.trim();
                      if (line !== '') {
                        const splitLine = line.split(',');
                        rx += parseInt(splitLine[2]);
                        wx += parseInt(splitLine[9]);
                      }
                    },
                    { maxBuffer: 1024 * 1024 },
                  );
                  result = this.calcFsSpeed(rx, wx);
                }
                if (callback) {
                  callback(result);
                }
                resolve(result);
              },
            );
          }
        } else {
          result.ms = this._fs_speed.last_ms;
          result.rx = this._fs_speed.bytes_read;
          result.wx = this._fs_speed.bytes_write;
          result.tx = this._fs_speed.bytes_read + this._fs_speed.bytes_write;
          result.rx_sec = this._fs_speed.rx_sec;
          result.wx_sec = this._fs_speed.wx_sec;
          result.tx_sec = this._fs_speed.tx_sec;
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      });
    });
  }

  private calcDiskIO(
    rIO: number,
    wIO: number,
    rWaitTime: number,
    wWaitTime: number,
    tWaitTime: number,
  ) {
    const result = {
      rIO: 0,
      wIO: 0,
      tIO: 0,
      rIO_sec: null,
      wIO_sec: null,
      tIO_sec: null,
      rWaitTime: 0,
      wWaitTime: 0,
      tWaitTime: 0,
      rWaitPercent: null,
      wWaitPercent: null,
      tWaitPercent: null,
      ms: 0,
    } as Systeminformation.DisksIoData;
    if (this._disk_io && this._disk_io.ms) {
      result.rIO = rIO;
      result.wIO = wIO;
      result.tIO = rIO + wIO;
      result.ms = Date.now() - this._disk_io.ms;
      result.rIO_sec = (result.rIO - this._disk_io.rIO) / (result.ms / 1000);
      result.wIO_sec = (result.wIO - this._disk_io.wIO) / (result.ms / 1000);
      result.tIO_sec = result.rIO_sec + result.wIO_sec;
      result.rWaitTime = rWaitTime;
      result.wWaitTime = wWaitTime;
      result.tWaitTime = tWaitTime;
      result.rWaitPercent = ((result.rWaitTime - this._disk_io.rWaitTime) * 100) / result.ms;
      result.wWaitPercent = ((result.wWaitTime - this._disk_io.wWaitTime) * 100) / result.ms;
      result.tWaitPercent = ((result.tWaitTime - this._disk_io.tWaitTime) * 100) / result.ms;
      this._disk_io.rIO = rIO;
      this._disk_io.wIO = wIO;
      this._disk_io.rIO_sec = result.rIO_sec;
      this._disk_io.wIO_sec = result.wIO_sec;
      this._disk_io.tIO_sec = result.tIO_sec;
      this._disk_io.rWaitTime = rWaitTime;
      this._disk_io.wWaitTime = wWaitTime;
      this._disk_io.tWaitTime = tWaitTime;
      this._disk_io.rWaitPercent = result.rWaitPercent;
      this._disk_io.wWaitPercent = result.wWaitPercent;
      this._disk_io.tWaitPercent = result.tWaitPercent;
      this._disk_io.last_ms = result.ms;
      this._disk_io.ms = Date.now();
    } else {
      result.rIO = rIO;
      result.wIO = wIO;
      result.tIO = rIO + wIO;
      result.rWaitTime = rWaitTime;
      result.wWaitTime = wWaitTime;
      result.tWaitTime = tWaitTime;
      this._disk_io.rIO = rIO;
      this._disk_io.wIO = wIO;
      this._disk_io.rIO_sec = null;
      this._disk_io.wIO_sec = null;
      this._disk_io.tIO_sec = null;
      this._disk_io.rWaitTime = rWaitTime;
      this._disk_io.wWaitTime = wWaitTime;
      this._disk_io.tWaitTime = tWaitTime;
      this._disk_io.rWaitPercent = null;
      this._disk_io.wWaitPercent = null;
      this._disk_io.tWaitPercent = null;
      this._disk_io.last_ms = 0;
      this._disk_io.ms = Date.now();
    }
    return result;
  }

  disksIO(callback?: Callback) {
    return new Promise((resolve) => {
      process.nextTick(() => {
        if (this.platform === 'win32') {
          return resolve(null);
        }
        if (this.platform === 'sunos') {
          return resolve(null);
        }

        let result = {
          rIO: 0,
          wIO: 0,
          tIO: 0,
          rIO_sec: null,
          wIO_sec: null,
          tIO_sec: null,
          rWaitTime: 0,
          wWaitTime: 0,
          tWaitTime: 0,
          rWaitPercent: null,
          wWaitPercent: null,
          tWaitPercent: null,
          ms: 0,
        } as Systeminformation.DisksIoData;
        let rIO = 0;
        let wIO = 0;
        let rWaitTime = 0;
        let wWaitTime = 0;
        let tWaitTime = 0;

        if (
          (this._disk_io && !this._disk_io.ms) ||
          (this._disk_io && this._disk_io.ms && Date.now() - this._disk_io.ms >= 500)
        ) {
          if (
            this.platform === 'linux' ||
            this.platform === 'freebsd' ||
            this.platform === 'openbsd' ||
            this.platform === 'netbsd'
          ) {
            // prints Block layer statistics for all mounted volumes
            // var cmd = "for mount in `lsblk | grep / | sed -r 's/│ └─//' | cut -d ' ' -f 1`; do cat /sys/block/$mount/stat | sed -r 's/ +/;/g' | sed -r 's/^;//'; done";
            // var cmd = "for mount in `lsblk | grep / | sed 's/[│└─├]//g' | awk '{$1=$1};1' | cut -d ' ' -f 1 | sort -u`; do cat /sys/block/$mount/stat | sed -r 's/ +/;/g' | sed -r 's/^;//'; done";
            const cmd =
              'for mount in `lsblk 2>/dev/null | grep " disk " | sed "s/[│└─├]//g" | awk \'{$1=$1};1\' | cut -d " " -f 1 | sort -u`; do cat /sys/block/$mount/stat | sed -r "s/ +/;/g" | sed -r "s/^;//"; done';

            this.execWithCallback(
              cmd,
              (error, stdout) => {
                if (!error) {
                  const lines = stdout.split('\n');
                  lines.forEach((line) => {
                    // ignore empty lines
                    if (!line) {
                      return;
                    }

                    // sum r/wIO of all disks to compute all disks IO
                    const stats = line.split(';');
                    rIO += parseInt(stats[0]);
                    wIO += parseInt(stats[4]);
                    rWaitTime += parseInt(stats[3]);
                    wWaitTime += parseInt(stats[7]);
                    tWaitTime += parseInt(stats[10]);
                  });
                  result = this.calcDiskIO(rIO, wIO, rWaitTime, wWaitTime, tWaitTime);

                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                } else {
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                }
              },
              { maxBuffer: 1024 * 1024 },
            );
          }
          if (this.platform === 'darwin') {
            this.execWithCallback(
              'ioreg -c IOBlockStorageDriver -k Statistics -r -w0 | sed -n "/IOBlockStorageDriver/,/Statistics/p" | grep "Statistics" | tr -cd "01234567890,\n"',
              (error, stdout) => {
                if (!error) {
                  const lines = stdout.toString().split('\n');
                  lines.forEach((line) => {
                    line = line.trim();
                    if (line !== '') {
                      const splitLine = line.split(',');

                      rIO += parseInt(splitLine[10]);
                      wIO += parseInt(splitLine[0]);
                    }
                  });
                  result = this.calcDiskIO(rIO, wIO, rWaitTime, wWaitTime, tWaitTime);
                }
                if (callback) {
                  callback(result);
                }
                resolve(result);
              },
              { maxBuffer: 1024 * 1024 },
            );
          }
        } else {
          result.rIO = this._disk_io.rIO;
          result.wIO = this._disk_io.wIO;
          result.tIO = this._disk_io.rIO + this._disk_io.wIO;
          result.ms = this._disk_io.last_ms;
          result.rIO_sec = this._disk_io.rIO_sec;
          result.wIO_sec = this._disk_io.wIO_sec;
          result.tIO_sec = this._disk_io.tIO_sec;
          result.rWaitTime = this._disk_io.rWaitTime;
          result.wWaitTime = this._disk_io.wWaitTime;
          result.tWaitTime = this._disk_io.tWaitTime;
          result.rWaitPercent = this._disk_io.rWaitPercent;
          result.wWaitPercent = this._disk_io.wWaitPercent;
          result.tWaitPercent = this._disk_io.tWaitPercent;
          if (callback) {
            callback(result);
          }
          resolve(result);
        }
      });
    });
  }

  diskLayout(callback?: Callback): Promise<Systeminformation.DiskLayoutData[]> {
    return new Promise((resolve) => {
      process.nextTick(() => {
        const commitResult = (res: Systeminformation.DiskLayoutData[]) => {
          for (let i = 0; i < res.length; i++) {
            delete res[i].BSDName;
          }
          if (callback) {
            callback(res);
          }
          resolve(res);
        };

        const result: Systeminformation.DiskLayoutData[] = [];
        let cmd = '';

        if (this.platform === 'linux') {
          let cmdFullSmart = '';

          this.execWithCallback(
            'export LC_ALL=C; lsblk -ablJO 2>/dev/null; unset LC_ALL',
            async (error, stdout) => {
              if (!error) {
                try {
                  const out = stdout.toString().trim();
                  let devices: Partial<Systeminformation.BlockDevicesData>[] = [];
                  try {
                    const outJSON = JSON.parse(out);
                    if (outJSON && {}.hasOwnProperty.call(outJSON, 'blockdevices')) {
                      devices = outJSON.blockdevices.filter((item: any) => {
                        return (
                          item.type === 'disk' &&
                          item.size > 0 &&
                          (item.model !== null ||
                            (item.mountpoint === null &&
                              item.label === null &&
                              item.fstype === null &&
                              item.parttype === null &&
                              item.path &&
                              item.path.indexOf('/ram') !== 0 &&
                              item.path.indexOf('/loop') !== 0 &&
                              item['disc-max'] &&
                              item['disc-max'] !== 0))
                        );
                      });
                    }
                  } catch (e) {
                    this.logger.error(e);
                    // fallback to older version of lsblk
                    try {
                      const out2 = (
                        await this.execAsync(
                          'export LC_ALL=C; lsblk -bPo NAME,TYPE,SIZE,FSTYPE,MOUNTPOINT,UUID,ROTA,RO,RM,LABEL,MODEL,OWNER,GROUP 2>/dev/null; unset LC_ALL',
                          util.execOptsLinux,
                        )
                      ).toString();
                      const lines = blkStdoutToObject(out2).split('\n');
                      const data = parseBlk(lines);
                      devices = data.filter((item) => {
                        return (
                          item.type === 'disk' &&
                          (item.size as number) > 0 &&
                          ((item.model !== null && item.model !== '') ||
                            (item.mount === '' && item.label === '' && item.fsType === ''))
                        );
                      });
                    } catch (e) {
                      this.logger.debug(e);
                      util.noop();
                    }
                  }
                  for (const device of devices) {
                    let mediumType = '';
                    const BSDName = '/dev/' + device.name;
                    const logical = device.name;
                    try {
                      mediumType = (
                        await this.execAsync(
                          'cat /sys/block/' + logical + '/queue/rotational 2>/dev/null',
                          util.execOptsLinux,
                        )
                      )
                        .toString()
                        .split('\n')[0];
                    } catch (e) {
                      this.logger.debug(e);
                      util.noop();
                    }
                    let interfaceType = device.tran ? device.tran.toUpperCase().trim() : '';
                    if (interfaceType === 'NVME') {
                      mediumType = '2';
                      interfaceType = 'PCIe';
                    }
                    result.push({
                      device: BSDName,
                      type:
                        mediumType === '0'
                          ? 'SSD'
                          : mediumType === '1'
                            ? 'HD'
                            : mediumType === '2'
                              ? 'NVMe'
                              : device.model && device.model.indexOf('SSD') > -1
                                ? 'SSD'
                                : device.model && device.model.indexOf('NVM') > -1
                                  ? 'NVMe'
                                  : 'HD',
                      name: device.model || '',
                      vendor:
                        getVendorFromModel(device.model) ||
                        (device.vendor ? device.vendor.trim() : ''),
                      size: device.size || 0,
                      bytesPerSector: null,
                      totalCylinders: null,
                      totalHeads: null,
                      totalSectors: null,
                      totalTracks: null,
                      tracksPerCylinder: null,
                      sectorsPerTrack: null,
                      firmwareRevision: device.rev ? device.rev.trim() : '',
                      serialNum: device.serial ? device.serial.trim() : '',
                      interfaceType: interfaceType,
                      smartStatus: 'unknown',
                      temperature: null,
                      BSDName: BSDName,
                    });
                    cmd += `printf "\n${BSDName}|"; smartctl -H ${BSDName} | grep overall;`;
                    cmdFullSmart += `${cmdFullSmart ? 'printf ",";' : ''}smartctl -a -j ${BSDName};`;
                  }
                } catch (e) {
                  this.logger.debug(e);
                  util.noop();
                }
              }
              // check S.M.A.R.T. status
              if (cmdFullSmart) {
                this.execWithCallback(
                  cmdFullSmart,
                  (error, stdout) => {
                    try {
                      const data = JSON.parse(`[${stdout}]`);
                      data.forEach((disk: any) => {
                        const diskBSDName = disk.smartctl.argv[disk.smartctl.argv.length - 1];

                        for (let i = 0; i < result.length; i++) {
                          if (result[i].BSDName === diskBSDName) {
                            result[i].smartStatus = disk.smart_status.passed
                              ? 'Ok'
                              : disk.smart_status.passed === false
                                ? 'Predicted Failure'
                                : 'unknown';
                            if (disk.temperature && disk.temperature.current) {
                              result[i].temperature = disk.temperature.current;
                            }
                            result[i].smartData = disk;
                          }
                        }
                      });
                      commitResult(result);
                    } catch (e) {
                      this.logger.debug(e);
                      if (cmd) {
                        cmd = cmd + 'printf "\n"';
                        this.execWithCallback(
                          cmd,
                          (error, stdout) => {
                            const lines = stdout.toString().split('\n');
                            lines.forEach((line) => {
                              if (line) {
                                const parts = line.split('|');
                                if (parts.length === 2) {
                                  const BSDName = parts[0];
                                  parts[1] = parts[1].trim();
                                  const parts2 = parts[1].split(':');
                                  if (parts2.length === 2) {
                                    parts2[1] = parts2[1].trim();
                                    const status = parts2[1].toLowerCase();
                                    for (let i = 0; i < result.length; i++) {
                                      if (result[i].BSDName === BSDName) {
                                        result[i].smartStatus =
                                          status === 'passed'
                                            ? 'Ok'
                                            : status === 'failed!'
                                              ? 'Predicted Failure'
                                              : 'unknown';
                                      }
                                    }
                                  }
                                }
                              }
                            });
                            commitResult(result);
                          },
                          { maxBuffer: 1024 * 1024 },
                        );
                      } else {
                        commitResult(result);
                      }
                    }
                  },
                  { maxBuffer: 1024 * 1024 },
                );
              } else {
                commitResult(result);
              }
            },
            { maxBuffer: 1024 * 1024 },
          );
        }
        if (
          this.platform === 'freebsd' ||
          this.platform === 'openbsd' ||
          this.platform === 'netbsd'
        ) {
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
        if (this.platform === 'darwin') {
          this.execWithCallback(
            'system_profiler SPSerialATADataType SPNVMeDataType SPUSBDataType',
            (error, stdout) => {
              if (!error) {
                // split by type:
                const lines = stdout.toString().split('\n');
                const linesSATA: string[] = [];
                const linesNVMe: string[] = [];
                const linesUSB: string[] = [];
                let dataType = 'SATA';
                lines.forEach((line) => {
                  if (line === 'NVMExpress:') {
                    dataType = 'NVMe';
                  } else if (line === 'USB:') {
                    dataType = 'USB';
                  } else if (line === 'SATA/SATA Express:') {
                    dataType = 'SATA';
                  } else if (dataType === 'SATA') {
                    linesSATA.push(line);
                  } else if (dataType === 'NVMe') {
                    linesNVMe.push(line);
                  } else if (dataType === 'USB') {
                    linesUSB.push(line);
                  }
                });
                try {
                  // Serial ATA Drives
                  const devices = linesSATA.join('\n').split(' Physical Interconnect: ');
                  devices.shift();
                  devices.forEach(
                    function (device) {
                      device = 'InterfaceType: ' + device;
                      const lines = device.split('\n');
                      const mediumType = util.getValue(lines, 'Medium Type', ':', true).trim();
                      const sizeStr = util.getValue(lines, 'capacity', ':', true).trim();
                      const BSDName = util.getValue(lines, 'BSD Name', ':', true).trim();
                      if (sizeStr) {
                        let sizeValue = 0;
                        if (sizeStr.indexOf('(') >= 0) {
                          sizeValue = parseInt(
                            sizeStr
                              .match(/\(([^)]+)\)/)[1]
                              .replace(/\./g, '')
                              .replace(/,/g, '')
                              .replace(/\s/g, ''),
                          );
                        }
                        if (!sizeValue) {
                          sizeValue = parseInt(sizeStr);
                        }
                        if (sizeValue) {
                          const smartStatusString = util
                            .getValue(lines, 'S.M.A.R.T. status', ':', true)
                            .trim()
                            .toLowerCase();
                          result.push({
                            device: BSDName,
                            type: mediumType.startsWith('Solid') ? 'SSD' : 'HD',
                            name: util.getValue(lines, 'Model', ':', true).trim(),
                            vendor:
                              getVendorFromModel(util.getValue(lines, 'Model', ':', true).trim()) ||
                              util.getValue(lines, 'Manufacturer', ':', true),
                            size: sizeValue,
                            bytesPerSector: null,
                            totalCylinders: null,
                            totalHeads: null,
                            totalSectors: null,
                            totalTracks: null,
                            tracksPerCylinder: null,
                            sectorsPerTrack: null,
                            firmwareRevision: util.getValue(lines, 'Revision', ':', true).trim(),
                            serialNum: util.getValue(lines, 'Serial Number', ':', true).trim(),
                            interfaceType: util.getValue(lines, 'InterfaceType', ':', true).trim(),
                            smartStatus:
                              smartStatusString === 'verified'
                                ? 'OK'
                                : smartStatusString || 'unknown',
                            temperature: null,
                            BSDName: BSDName,
                          });
                          cmd =
                            cmd +
                            'printf "\n' +
                            BSDName +
                            '|"; diskutil info /dev/' +
                            BSDName +
                            ' | grep SMART;';
                        }
                      }
                    },
                    { maxBuffer: 1024 * 1024 },
                  );
                } catch (e) {
                  this.logger.error(e);
                  util.noop();
                }

                // NVME Drives
                try {
                  const devices = linesNVMe.join('\n').split('\n\n          Capacity:');
                  devices.shift();
                  devices.forEach(function (device) {
                    device = '!Capacity: ' + device;
                    const lines = device.split('\n');
                    const linkWidth = util.getValue(lines, 'link width', ':', true).trim();
                    const sizeStr = util.getValue(lines, '!capacity', ':', true).trim();
                    const BSDName = util.getValue(lines, 'BSD Name', ':', true).trim();
                    if (sizeStr) {
                      let sizeValue = 0;
                      if (sizeStr.indexOf('(') >= 0) {
                        sizeValue = parseInt(
                          sizeStr
                            .match(/\(([^)]+)\)/)[1]
                            .replace(/\./g, '')
                            .replace(/,/g, '')
                            .replace(/\s/g, ''),
                        );
                      }
                      if (!sizeValue) {
                        sizeValue = parseInt(sizeStr);
                      }
                      if (sizeValue) {
                        const smartStatusString = util
                          .getValue(lines, 'S.M.A.R.T. status', ':', true)
                          .trim()
                          .toLowerCase();
                        result.push({
                          device: BSDName,
                          type: 'NVMe',
                          name: util.getValue(lines, 'Model', ':', true).trim(),
                          vendor: getVendorFromModel(
                            util.getValue(lines, 'Model', ':', true).trim(),
                          ),
                          size: sizeValue,
                          bytesPerSector: null,
                          totalCylinders: null,
                          totalHeads: null,
                          totalSectors: null,
                          totalTracks: null,
                          tracksPerCylinder: null,
                          sectorsPerTrack: null,
                          firmwareRevision: util.getValue(lines, 'Revision', ':', true).trim(),
                          serialNum: util.getValue(lines, 'Serial Number', ':', true).trim(),
                          interfaceType: ('PCIe ' + linkWidth).trim(),
                          smartStatus:
                            smartStatusString === 'verified'
                              ? 'OK'
                              : smartStatusString || 'unknown',
                          temperature: null,
                          BSDName: BSDName,
                        });
                        cmd =
                          cmd +
                          'printf "\n' +
                          BSDName +
                          '|"; diskutil info /dev/' +
                          BSDName +
                          ' | grep SMART;';
                      }
                    }
                  });
                } catch (e) {
                  this.logger.error(e);
                  util.noop();
                }
                // USB Drives
                try {
                  const devices = linesUSB
                    .join('\n')
                    .replaceAll('Media:\n ', 'Model:')
                    .split('\n\n          Product ID:');
                  devices.shift();
                  devices.forEach(function (device) {
                    const lines = device.split('\n');
                    const sizeStr = util.getValue(lines, 'Capacity', ':', true).trim();
                    const BSDName = util.getValue(lines, 'BSD Name', ':', true).trim();
                    if (sizeStr) {
                      let sizeValue = 0;
                      if (sizeStr.indexOf('(') >= 0) {
                        sizeValue = parseInt(
                          sizeStr
                            .match(/\(([^)]+)\)/)[1]
                            .replace(/\./g, '')
                            .replace(/,/g, '')
                            .replace(/\s/g, ''),
                        );
                      }
                      if (!sizeValue) {
                        sizeValue = parseInt(sizeStr);
                      }
                      if (sizeValue) {
                        const smartStatusString = util
                          .getValue(lines, 'S.M.A.R.T. status', ':', true)
                          .trim()
                          .toLowerCase();
                        result.push({
                          device: BSDName,
                          type: 'USB',
                          name: util.getValue(lines, 'Model', ':', true).trim().replaceAll(':', ''),
                          vendor: getVendorFromModel(
                            util.getValue(lines, 'Model', ':', true).trim(),
                          ),
                          size: sizeValue,
                          bytesPerSector: null,
                          totalCylinders: null,
                          totalHeads: null,
                          totalSectors: null,
                          totalTracks: null,
                          tracksPerCylinder: null,
                          sectorsPerTrack: null,
                          firmwareRevision: util.getValue(lines, 'Revision', ':', true).trim(),
                          serialNum: util.getValue(lines, 'Serial Number', ':', true).trim(),
                          interfaceType: 'USB',
                          smartStatus:
                            smartStatusString === 'verified'
                              ? 'OK'
                              : smartStatusString || 'unknown',
                          temperature: null,
                          BSDName: BSDName,
                        });
                        cmd =
                          cmd +
                          'printf "\n' +
                          BSDName +
                          '|"; diskutil info /dev/' +
                          BSDName +
                          ' | grep SMART;';
                      }
                    }
                  });
                } catch (e) {
                  this.logger.error(e);
                  util.noop();
                }
                if (cmd) {
                  cmd = cmd + 'printf "\n"';
                  this.execWithCallback(cmd, (error, stdout) => {
                    const lines = stdout.toString().split('\n');
                    lines.forEach((line) => {
                      if (line) {
                        const parts = line.split('|');
                        if (parts.length === 2) {
                          const BSDName = parts[0];
                          parts[1] = parts[1].trim();
                          const parts2 = parts[1].split(':');
                          if (parts2.length === 2) {
                            parts2[1] = parts2[1].trim();
                            const status = parts2[1].toLowerCase();
                            for (let i = 0; i < result.length; i++) {
                              if (result[i].BSDName === BSDName) {
                                result[i].smartStatus =
                                  status === 'not supported'
                                    ? 'not supported'
                                    : status === 'verified'
                                      ? 'Ok'
                                      : status === 'failing'
                                        ? 'Predicted Failure'
                                        : 'unknown';
                              }
                            }
                          }
                        }
                      }
                    });
                    for (let i = 0; i < result.length; i++) {
                      delete result[i].BSDName;
                    }
                    if (callback) {
                      callback(result);
                    }
                    resolve(result);
                  });
                } else {
                  for (let i = 0; i < result.length; i++) {
                    delete result[i].BSDName;
                  }
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                }
              }
            },
            { maxBuffer: 1024 * 1024 },
          );
        }
        if (this.platform === 'win32') {
          if (callback) {
            callback(result);
          }
          resolve(result);
          /*
          try {
            const workload = [];
            workload.push(util.powerShell('Get-CimInstance Win32_DiskDrive | select Caption,Size,Status,PNPDeviceId,DeviceId,BytesPerSector,TotalCylinders,TotalHeads,TotalSectors,TotalTracks,TracksPerCylinder,SectorsPerTrack,FirmwareRevision,SerialNumber,InterfaceType | fl'));
            workload.push(util.powerShell('Get-PhysicalDisk | select BusType,MediaType,FriendlyName,Model,SerialNumber,Size | fl'));
            if (util.smartMonToolsInstalled()) {
              try {
                const smartDev = JSON.parse(await this.execAsync('smartctl --scan -j').toString());
                if (smartDev && smartDev.devices && smartDev.devices.length > 0) {
                  smartDev.devices.forEach((dev) => {
                    workload.push(execPromiseSave(`smartctl -j -a ${dev.name}`, util.execOptsWin));
                  });
                }
              } catch (e) {
                util.noop();
              }
            }
            util.promiseAll(
              workload
            ).then((data) => {
              let devices = data.results[0].toString().split(/\n\s*\n/);
              devices.forEach(function (device) {
                let lines = device.split('\r\n');
                const size = util.getValue(lines, 'Size', ':').trim();
                const status = util.getValue(lines, 'Status', ':').trim().toLowerCase();
                if (size) {
                  result.push({
                    device: util.getValue(lines, 'DeviceId', ':'),  // changed from PNPDeviceId to DeviceID (be be able to match devices)
                    type: device.indexOf('SSD') > -1 ? 'SSD' : 'HD',  // just a starting point ... better: MSFT_PhysicalDisk - Media Type ... see below
                    name: util.getValue(lines, 'Caption', ':'),
                    vendor: getVendorFromModel(util.getValue(lines, 'Caption', ':', true).trim()),
                    size: parseInt(size),
                    bytesPerSector: parseInt(util.getValue(lines, 'BytesPerSector', ':')),
                    totalCylinders: parseInt(util.getValue(lines, 'TotalCylinders', ':')),
                    totalHeads: parseInt(util.getValue(lines, 'TotalHeads', ':')),
                    totalSectors: parseInt(util.getValue(lines, 'TotalSectors', ':')),
                    totalTracks: parseInt(util.getValue(lines, 'TotalTracks', ':')),
                    tracksPerCylinder: parseInt(util.getValue(lines, 'TracksPerCylinder', ':')),
                    sectorsPerTrack: parseInt(util.getValue(lines, 'SectorsPerTrack', ':')),
                    firmwareRevision: util.getValue(lines, 'FirmwareRevision', ':').trim(),
                    serialNum: util.getValue(lines, 'SerialNumber', ':').trim(),
                    interfaceType: util.getValue(lines, 'InterfaceType', ':').trim(),
                    smartStatus: (status === 'ok' ? 'Ok' : (status === 'degraded' ? 'Degraded' : (status === 'pred fail' ? 'Predicted Failure' : 'Unknown'))),
                    temperature: null,
                  });
                }
              });
              devices = data.results[1].split(/\n\s*\n/);
              devices.forEach(function (device) {
                let lines = device.split('\r\n');
                const serialNum = util.getValue(lines, 'SerialNumber', ':').trim();
                const name = util.getValue(lines, 'FriendlyName', ':').trim().replace('Msft ', 'Microsoft');
                const size = util.getValue(lines, 'Size', ':').trim();
                const model = util.getValue(lines, 'Model', ':').trim();
                const interfaceType = util.getValue(lines, 'BusType', ':').trim();
                let mediaType = util.getValue(lines, 'MediaType', ':').trim();
                if (mediaType === '3' || mediaType === 'HDD') { mediaType = 'HD'; }
                if (mediaType === '4') { mediaType = 'SSD'; }
                if (mediaType === '5') { mediaType = 'SCM'; }
                if (mediaType === 'Unspecified' && (model.toLowerCase().indexOf('virtual') > -1 || model.toLowerCase().indexOf('vbox') > -1)) { mediaType = 'Virtual'; }
                if (size) {
                  let i = util.findObjectByKey(result, 'serialNum', serialNum);
                  if (i === -1 || serialNum === '') {
                    i = util.findObjectByKey(result, 'name', name);
                  }
                  if (i != -1) {
                    result[i].type = mediaType;
                    result[i].interfaceType = interfaceType;
                  }
                }
              });
              // S.M.A.R.T
              data.results.shift();
              data.results.shift();
              if (data.results.length) {
                data.results.forEach((smartStr) => {
                  try {
                    const smartData = JSON.parse(smartStr);
                    if (smartData.serial_number) {
                      const serialNum = smartData.serial_number;
                      let i = util.findObjectByKey(result, 'serialNum', serialNum);
                      if (i != -1) {
                        result[i].smartStatus = (smartData.smart_status && smartData.smart_status.passed ? 'Ok' : (smartData.smart_status && smartData.smart_status.passed === false ? 'Predicted Failure' : 'unknown'));
                        if (smartData.temperature && smartData.temperature.current) {
                          result[i].temperature = smartData.temperature.current;
                        }
                        result[i].smartData = smartData;
                      }
                    }
                  } catch (e) {
                    util.noop();
                  }
                });
              }
              if (callback) {
                callback(result);
              }
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
}
