// ==================================================================================
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2024
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================

import * as semver from 'semver';
import { Systeminformation } from 'ssm-shared-lib';
import PinoLogger from '../../../../../logger';
import { RemoteOS } from '../remote-os/remote-os.component';
import {
  Callback,
  RemoteExecutorType,
  RemoteExecutorTypeWithCallback,
} from '../../types/remote-executor.types';
import * as util from '../utils/system-utils';
import { getVboxmanage } from './osinformation.utils';

export class OSInformationComponent extends RemoteOS {
  private logger = PinoLogger.child({ component: 'OSInformationComponent' });
  constructor(
    remoteExecAsync: RemoteExecutorType,
    remoteExecWithCallback: RemoteExecutorTypeWithCallback,
  ) {
    super(remoteExecAsync, remoteExecWithCallback);
  }

  public async time() {
    const t = new Date().toString().split(' ');
    const result: Systeminformation.TimeData = {
      current: Date.now(),
      uptime: await this.uptime(),
      timezone: t.length >= 7 ? t[5] : '',
      timezoneName: Intl
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : t.length >= 7
          ? t.slice(6).join(' ').replace(/\(/g, '').replace(/\)/g, '')
          : '',
    };
    if (this.platform === 'darwin' || this.platform === 'linux') {
      try {
        const stdout = await this.execAsync(
          'date +%Z && date +%z && ls -l /etc/localtime 2>/dev/null',
          util.execOptsLinux,
        );
        const lines = stdout.toString().split(this.EOL);
        if (lines.length > 3 && !lines[0]) {
          lines.shift();
        }
        let timezone = lines[0] || '';
        if (timezone.startsWith('+') || timezone.startsWith('-')) {
          timezone = 'GMT';
        }
        return {
          current: Date.now(),
          uptime: await this.uptime(),
          timezone: lines[1] ? timezone + lines[1] : timezone,
          timezoneName:
            lines[2] && lines[2].indexOf('/zoneinfo/') > 0
              ? lines[2].split('/zoneinfo/')[1] || ''
              : '',
        };
      } catch (e) {
        this.logger.debug(e);
        util.noop();
      }
    }
    return result;
  }

  // --------------------------
  // Get logo filename of OS distribution

  public getLogoFile(distro: string) {
    distro = distro || '';
    distro = distro.toLowerCase();
    let result: string = this.platform;
    if (this.platform === 'win32') {
      result = 'windows';
    } else if (distro.indexOf('mac os') !== -1 || distro.indexOf('macos') !== -1) {
      result = 'apple';
    } else if (distro.indexOf('arch') !== -1) {
      result = 'arch';
    } else if (distro.indexOf('cachy') !== -1) {
      result = 'cachy';
    } else if (distro.indexOf('centos') !== -1) {
      result = 'centos';
    } else if (distro.indexOf('coreos') !== -1) {
      result = 'coreos';
    } else if (distro.indexOf('debian') !== -1) {
      result = 'debian';
    } else if (distro.indexOf('deepin') !== -1) {
      result = 'deepin';
    } else if (distro.indexOf('elementary') !== -1) {
      result = 'elementary';
    } else if (distro.indexOf('endeavour') !== -1) {
      result = 'endeavour';
    } else if (distro.indexOf('fedora') !== -1) {
      result = 'fedora';
    } else if (distro.indexOf('gentoo') !== -1) {
      result = 'gentoo';
    } else if (distro.indexOf('mageia') !== -1) {
      result = 'mageia';
    } else if (distro.indexOf('mandriva') !== -1) {
      result = 'mandriva';
    } else if (distro.indexOf('manjaro') !== -1) {
      result = 'manjaro';
    } else if (distro.indexOf('mint') !== -1) {
      result = 'mint';
    } else if (distro.indexOf('mx') !== -1) {
      result = 'mx';
    } else if (distro.indexOf('openbsd') !== -1) {
      result = 'openbsd';
    } else if (distro.indexOf('freebsd') !== -1) {
      result = 'freebsd';
    } else if (distro.indexOf('opensuse') !== -1) {
      result = 'opensuse';
    } else if (distro.indexOf('pclinuxos') !== -1) {
      result = 'pclinuxos';
    } else if (distro.indexOf('puppy') !== -1) {
      result = 'puppy';
    } else if (distro.indexOf('popos') !== -1) {
      result = 'popos';
    } else if (distro.indexOf('raspbian') !== -1) {
      result = 'raspbian';
    } else if (distro.indexOf('reactos') !== -1) {
      result = 'reactos';
    } else if (distro.indexOf('redhat') !== -1) {
      result = 'redhat';
    } else if (distro.indexOf('slackware') !== -1) {
      result = 'slackware';
    } else if (distro.indexOf('sugar') !== -1) {
      result = 'sugar';
    } else if (distro.indexOf('steam') !== -1) {
      result = 'steam';
    } else if (distro.indexOf('suse') !== -1) {
      result = 'suse';
    } else if (distro.indexOf('mate') !== -1) {
      result = 'ubuntu-mate';
    } else if (distro.indexOf('lubuntu') !== -1) {
      result = 'lubuntu';
    } else if (distro.indexOf('xubuntu') !== -1) {
      result = 'xubuntu';
    } else if (distro.indexOf('ubuntu') !== -1) {
      result = 'ubuntu';
    } else if (distro.indexOf('solaris') !== -1) {
      result = 'solaris';
    } else if (distro.indexOf('tails') !== -1) {
      result = 'tails';
    } else if (distro.indexOf('feren') !== -1) {
      result = 'ferenos';
    } else if (distro.indexOf('robolinux') !== -1) {
      result = 'robolinux';
    } else if (this.platform === 'linux' && distro) {
      result = distro.toLowerCase().trim().replace(/\s+/g, '-');
    }
    return result;
  }

  // --------------------------
  // FQDN

  private async getFQDN() {
    let fqdn = await this.hostname();
    if (this.platform === 'linux' || this.platform === 'darwin') {
      try {
        const stdout = await this.execAsync('hostname -f 2>/dev/null', util.execOptsLinux);
        fqdn = stdout.toString().split(this.EOL)[0];
      } catch (e) {
        this.logger.debug(e);
        util.noop();
      }
    }
    if (this.platform === 'freebsd' || this.platform === 'openbsd' || this.platform === 'netbsd') {
      try {
        const stdout = await this.execAsync('hostname 2>/dev/null');
        fqdn = stdout.toString().split(this.EOL)[0];
      } catch (e) {
        this.logger.debug(e);
        util.noop();
      }
    }
    if (this.platform === 'win32') {
      /*
      try {
        const stdout = await this.execAsync('echo %COMPUTERNAME%.%USERDNSDOMAIN%', util.execOptsWin);
        fqdn = stdout.toString().replace('.%USERDNSDOMAIN%', '').split(os.EOL)[0];
      } catch (e) {
        util.noop();
      }
       */
    }
    return fqdn;
  }

  // --------------------------
  // OS Information

  public osInfo(callback?: Callback): Promise<Systeminformation.OsData> {
    return new Promise((resolve) => {
      process.nextTick(async () => {
        const result = {
          platform: this.platform === 'win32' ? 'Windows' : this.platform,
          distro: 'unknown',
          release: 'unknown',
          codename: '',
          kernel: await this.release(),
          arch: await this.arch(),
          hostname: await this.hostname(),
          fqdn: await this.getFQDN(),
          codepage: '',
          logofile: '',
          serial: '',
          build: '',
          servicepack: '',
          uefi: false,
        } as Systeminformation.OsData;

        if (this.platform === 'linux') {
          this.execWithCallback(
            'cat /etc/*-release; cat /usr/lib/os-release; cat /etc/openwrt_release',
            async (error, stdout) => {
              /**
               * @namespace
               * @property {string}  DISTRIB_ID
               * @property {string}  NAME
               * @property {string}  DISTRIB_RELEASE
               * @property {string}  VERSION_ID
               * @property {string}  DISTRIB_CODENAME
               */
              const release = {
                DISTRIB_ID: null,
                NAME: null,
                DISTRIB_RELEASE: null,
                VERSION_ID: null,
                DISTRIB_CODENAME: null,
                VERSION: null,
                VERSION_CODENAME: null,
                PRETTY_NAME: null,
                BUILD_ID: null,
              };
              const lines = stdout.toString().split('\n');
              lines.forEach((line) => {
                if (line.indexOf('=') !== -1) {
                  release[line.split('=')[0].trim().toUpperCase()] = line.split('=')[1].trim();
                }
              });
              result.distro = (release.DISTRIB_ID || release.NAME || 'unknown').replace(/"/g, '');
              result.logofile = this.getLogoFile(result.distro);
              let releaseVersion = (release.VERSION || '').replace(/"/g, '');
              let codename = (release.DISTRIB_CODENAME || release.VERSION_CODENAME || '').replace(
                /"/g,
                '',
              );
              const prettyName = (release.PRETTY_NAME || '').replace(/"/g, '');
              if (prettyName.indexOf(result.distro + ' ') === 0) {
                releaseVersion = prettyName.replace(result.distro + ' ', '').trim();
              }
              if (releaseVersion.indexOf('(') >= 0) {
                codename = releaseVersion.split('(')[1].replace(/[()]/g, '').trim();
                releaseVersion = releaseVersion.split('(')[0].trim();
              }
              result.release = (
                releaseVersion ||
                release.DISTRIB_RELEASE ||
                release.VERSION_ID ||
                'unknown'
              ).replace(/"/g, '');
              result.codename = codename;
              result.codepage = (await this.getCodepage()) as string;
              result.build = (release.BUILD_ID || '').replace(/"/g, '').trim();
              this.isUefiLinux().then((uefi: boolean) => {
                result.uefi = uefi;
                this.uuid().then((data) => {
                  result.serial = data.os;
                  if (callback) {
                    callback(result);
                  }
                  resolve(result);
                });
              });
            },
          );
        }
        if (
          this.platform === 'freebsd' ||
          this.platform === 'openbsd' ||
          this.platform === 'netbsd'
        ) {
          this.execWithCallback(
            'sysctl kern.ostype kern.osrelease kern.osrevision kern.hostuuid machdep.bootmethod kern.geom.confxml',
            async (error, stdout) => {
              const lines = stdout.toString().split('\n');
              const distro = util.getValue(lines, 'kern.ostype');
              const logofile = this.getLogoFile(distro);
              const release = util.getValue(lines, 'kern.osrelease').split('-')[0];
              const serial = util.getValue(lines, 'kern.uuid');
              const bootmethod = util.getValue(lines, 'machdep.bootmethod');
              const uefiConf = stdout.toString().indexOf('<type>efi</type>') >= 0;
              const uefi = bootmethod
                ? bootmethod.toLowerCase().indexOf('uefi') >= 0
                : uefiConf
                  ? uefiConf
                  : null;
              result.distro = distro || result.distro;
              result.logofile = logofile || result.logofile;
              result.release = release || result.release;
              result.serial = serial || result.serial;
              result.codename = '';
              result.codepage = (await this.getCodepage()) as string;
              result.uefi = uefi || null;
              if (callback) {
                callback(result);
              }
              resolve(result);
            },
          );
        }
        if (this.platform === 'darwin') {
          this.execWithCallback(
            'sw_vers; sysctl kern.ostype kern.osrelease kern.osrevision kern.uuid',
            async (error, stdout) => {
              const lines = stdout.toString().split('\n');
              result.serial = util.getValue(lines, 'kern.uuid');
              result.distro = util.getValue(lines, 'ProductName');
              result.release = (
                util.getValue(lines, 'ProductVersion', ':', true, true) +
                ' ' +
                util.getValue(lines, 'ProductVersionExtra', ':', true, true)
              ).trim();
              result.build = util.getValue(lines, 'BuildVersion');
              result.logofile = this.getLogoFile(result.distro);
              result.codename = 'macOS';
              result.codename =
                result.release.indexOf('10.4') > -1 ? 'OS X Tiger' : result.codename;
              result.codename =
                result.release.indexOf('10.5') > -1 ? 'OS X Leopard' : result.codename;
              result.codename =
                result.release.indexOf('10.6') > -1 ? 'OS X Snow Leopard' : result.codename;
              result.codename = result.release.indexOf('10.7') > -1 ? 'OS X Lion' : result.codename;
              result.codename =
                result.release.indexOf('10.8') > -1 ? 'OS X Mountain Lion' : result.codename;
              result.codename =
                result.release.indexOf('10.9') > -1 ? 'OS X Mavericks' : result.codename;
              result.codename =
                result.release.indexOf('10.10') > -1 ? 'OS X Yosemite' : result.codename;
              result.codename =
                result.release.indexOf('10.11') > -1 ? 'OS X El Capitan' : result.codename;
              result.codename = result.release.indexOf('10.12') > -1 ? 'Sierra' : result.codename;
              result.codename =
                result.release.indexOf('10.13') > -1 ? 'High Sierra' : result.codename;
              result.codename = result.release.indexOf('10.14') > -1 ? 'Mojave' : result.codename;
              result.codename = result.release.indexOf('10.15') > -1 ? 'Catalina' : result.codename;
              result.codename = result.release.startsWith('11.') ? 'Big Sur' : result.codename;
              result.codename = result.release.startsWith('12.') ? 'Monterey' : result.codename;
              result.codename = result.release.startsWith('13.') ? 'Ventura' : result.codename;
              result.codename = result.release.startsWith('14.') ? 'Sonoma' : result.codename;
              result.codename = result.release.startsWith('15.') ? 'Sequoia' : result.codename;
              result.uefi = true;
              result.codepage = (await this.getCodepage()) as string;
              if (callback) {
                callback(result);
              }
              resolve(result);
            },
          );
        }
        if (this.platform === 'sunos') {
          result.release = result.kernel;
          this.execWithCallback('uname -o', (error, stdout) => {
            const lines = stdout.toString().split('\n');
            result.distro = lines[0];
            result.logofile = this.getLogoFile(result.distro);
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
          result.logofile = getLogoFile();
          result.release = result.kernel;
          try {
            const workload = [];
            workload.push(util.powerShell('Get-CimInstance Win32_OperatingSystem | select Caption,SerialNumber,BuildNumber,ServicePackMajorVersion,ServicePackMinorVersion | fl'));
            workload.push(util.powerShell('(Get-CimInstance Win32_ComputerSystem).HypervisorPresent'));
            workload.push(util.powerShell('Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SystemInformation]::TerminalServerSession'));
            util.promiseAll(
              workload
            ).then((data) => {
              let lines = data.results[0] ? data.results[0].toString().split('\r\n') : [''];
              result.distro = util.getValue(lines, 'Caption', ':').trim();
              result.serial = util.getValue(lines, 'SerialNumber', ':').trim();
              result.build = util.getValue(lines, 'BuildNumber', ':').trim();
              result.servicepack = util.getValue(lines, 'ServicePackMajorVersion', ':').trim() + '.' + util.getValue(lines, 'ServicePackMinorVersion', ':').trim();
              result.codepage = util.getCodepage();
              const hyperv = data.results[1] ? data.results[1].toString().toLowerCase() : '';
              result.hypervisor = hyperv.indexOf('true') !== -1;
              const term = data.results[2] ? data.results[2].toString() : '';
              result.remoteSession = (term.toString().toLowerCase().indexOf('true') >= 0);
              isUefiWindows().then(uefi => {
                result.uefi = uefi;
                if (callback) {
                  callback(result);
                }
                resolve(result);
              });
            });
          } catch (e) {
            if (callback) { callback(result); }
            resolve(result);
          }*/
        }
      });
    });
  }

  private isUefiLinux(): Promise<boolean> {
    return new Promise((resolve) => {
      process.nextTick(async () => {
        this.fileExistsWithCallback('/sys/firmware/efi', (err) => {
          if (!err) {
            return resolve(true);
          } else {
            this.execWithCallback('dmesg | grep -E "EFI v"', (error, stdout) => {
              if (!error) {
                const lines = stdout.toString().split('\n');
                return resolve(lines.length > 0);
              }
              return resolve(false);
            });
          }
        });
      });
    });
  }

  private isUefiWindows() {
    return new Promise((resolve) => {
      process.nextTick(() => {
        return resolve(false);
        /*
        try {
          this.execWithCallback('findstr /C:"Detected boot environment" "%windir%\\Panther\\setupact.log"', util.execOptsWin, (error, stdout) => {
            if (!error) {
              const line = stdout.toString().split('\n\r')[0];
              return resolve(line.toLowerCase().indexOf('efi') >= 0);
            } else {
              exec('echo %firmware_type%', util.execOptsWin, function (error, stdout) {
                if (!error) {
                  const line = stdout.toString() || '';
                  return resolve(line.toLowerCase().indexOf('efi') >= 0);
                } else {
                  return resolve(false);
                }
              });
            }
          });
        } catch (e) {
          return resolve(false);
        }
 */
      });
    });
  }

  public async versions(apps: any, callback?: Callback): Promise<Systeminformation.VersionData> {
    const versionObject = {
      kernel: await this.release(),
      apache: '',
      bash: '',
      bun: '',
      deno: '',
      docker: '',
      dotnet: '',
      fish: '',
      gcc: '',
      git: '',
      grunt: '',
      gulp: '',
      homebrew: '',
      java: '',
      mongodb: '',
      mysql: '',
      nginx: '',
      node: '', //process.versions.node,
      npm: '',
      openssl: '',
      perl: '',
      php: '',
      pip3: '',
      pip: '',
      pm2: '',
      postfix: '',
      postgresql: '',
      powershell: '',
      python3: '',
      python: '',
      redis: '',
      systemOpenssl: '',
      systemOpensslLib: '',
      tsc: '',
      v8: process.versions.v8,
      virtualbox: '',
      yarn: '',
      zsh: '',
    } as Systeminformation.VersionData; // .Versions;

    function checkVersionParam(apps: string | string[]) {
      if (apps === '*') {
        return {
          versions: versionObject,
          counter: 34,
        };
      }
      if (!Array.isArray(apps)) {
        apps = apps.trim().toLowerCase().replace(/,+/g, '|').replace(/ /g, '|');
        apps = apps.split('|');
        const result: {
          versions: Systeminformation.VersionData;
          counter: number;
        } = {
          versions: {},
          counter: 0,
        };
        apps.forEach((el: any) => {
          if (el) {
            for (const key in versionObject) {
              if ({}.hasOwnProperty.call(versionObject, key)) {
                if (
                  key.toLowerCase() === el.toLowerCase() &&
                  !{}.hasOwnProperty.call(result.versions, key)
                ) {
                  result.versions[key as keyof Systeminformation.VersionData] =
                    versionObject[key as keyof typeof versionObject];
                  if (key === 'openssl') {
                    result.versions.systemOpenssl = '';
                    result.versions.systemOpensslLib = '';
                  }

                  if (!result.versions[key as keyof Systeminformation.VersionData]) {
                    result.counter++;
                  }
                }
              }
            }
          }
        });
        return result;
      }
    }

    return new Promise((resolve) => {
      process.nextTick(async () => {
        if (util.isFunction(apps) && !callback) {
          callback = apps;
          apps = '*';
        } else {
          apps = apps || '*';
          if (typeof apps !== 'string') {
            if (callback) {
              callback({});
            }
            return resolve({});
          }
        }
        const appsObj = checkVersionParam(apps) as {
          versions: Systeminformation.VersionData;
          counter: number;
        };
        let totalFunctions = appsObj.counter || 0;

        const functionProcessed = (() => {
          return () => {
            if (--totalFunctions === 0) {
              if (callback) {
                callback(appsObj.versions);
              }
              resolve(appsObj.versions);
            }
          };
        })();

        let cmd = '';
        try {
          if ({}.hasOwnProperty.call(appsObj?.versions, 'openssl')) {
            appsObj.versions.openssl = process.versions.openssl;
            this.execWithCallback('openssl version', (error, stdout) => {
              if (!error) {
                const openssl_string = stdout.toString().split('\n')[0].trim();
                const openssl = openssl_string.split(' ');
                appsObj.versions.systemOpenssl = openssl.length > 0 ? openssl[1] : openssl[0];
                appsObj.versions.systemOpensslLib = openssl.length > 0 ? openssl[0] : 'openssl';
              }
              functionProcessed();
            });
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'npm')) {
            this.execWithCallback('npm -v', (error, stdout) => {
              if (!error) {
                appsObj.versions.npm = stdout.toString().split('\n')[0];
              }
              functionProcessed();
            });
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'pm2')) {
            cmd = 'pm2';
            if (this.platform === 'win32') {
              cmd += '.cmd';
            }
            this.execWithCallback(`${cmd} -v`, (error, stdout) => {
              if (!error) {
                const pm2 = stdout.toString().split('\n')[0].trim();
                if (!pm2.startsWith('[PM2]')) {
                  appsObj.versions.pm2 = pm2;
                }
              }
              functionProcessed();
            });
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'yarn')) {
            this.execWithCallback('yarn --version', (error, stdout) => {
              if (!error) {
                appsObj.versions.yarn = stdout.toString().split('\n')[0];
              }
              functionProcessed();
            });
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'gulp')) {
            cmd = 'gulp';
            if (this.platform === 'win32') {
              cmd += '.cmd';
            }
            this.execWithCallback(`${cmd} --version`, (error, stdout) => {
              if (!error) {
                const gulp = stdout.toString().split('\n')[0] || '';
                appsObj.versions.gulp = (gulp.toLowerCase().split('version')[1] || '').trim();
              }
              functionProcessed();
            });
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'homebrew')) {
            cmd = 'brew';
            this.execWithCallback(`${cmd} --version`, (error, stdout) => {
              if (!error) {
                const brew = stdout.toString().split('\n')[0] || '';
                appsObj.versions.homebrew = (brew.toLowerCase().split(' ')[1] || '').trim();
              }
              functionProcessed();
            });
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'tsc')) {
            cmd = 'tsc';
            if (this.platform === 'win32') {
              cmd += '.cmd';
            }
            this.execWithCallback(`${cmd} --version`, (error, stdout) => {
              if (!error) {
                const tsc = stdout.toString().split('\n')[0] || '';
                appsObj.versions.tsc = (tsc.toLowerCase().split('version')[1] || '').trim();
              }
              functionProcessed();
            });
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'grunt')) {
            cmd = 'grunt';
            if (this.platform === 'win32') {
              cmd += '.cmd';
            }
            this.execWithCallback(`${cmd} --version`, (error, stdout) => {
              if (!error) {
                const grunt = stdout.toString().split('\n')[0] || '';
                appsObj.versions.grunt = (grunt.toLowerCase().split('cli v')[1] || '').trim();
              }
              functionProcessed();
            });
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'git')) {
            if (this.platform === 'darwin') {
              const gitHomebrewExists =
                (await this.fileExists('/usr/local/Cellar/git')) ||
                (await this.fileExists('/opt/homebrew/bin/git'));
              if ((await this.darwinXcodeExists()) || gitHomebrewExists) {
                this.execWithCallback('git --version', (error, stdout) => {
                  if (!error) {
                    let git = stdout.toString().split('\n')[0] || '';
                    git = (git.toLowerCase().split('version')[1] || '').trim();
                    appsObj.versions.git = (git.split(' ')[0] || '').trim();
                  }
                  functionProcessed();
                });
              } else {
                functionProcessed();
              }
            } else {
              this.execWithCallback('git --version', (error, stdout) => {
                if (!error) {
                  let git = stdout.toString().split('\n')[0] || '';
                  git = (git.toLowerCase().split('version')[1] || '').trim();
                  appsObj.versions.git = (git.split(' ')[0] || '').trim();
                }
                functionProcessed();
              });
            }
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'apache')) {
            this.execWithCallback('apachectl -v 2>&1', (error, stdout) => {
              if (!error) {
                const apache = (stdout.toString().split('\n')[0] || '').split(':');
                appsObj.versions.apache =
                  apache.length > 1
                    ? apache[1].replace('Apache', '').replace('/', '').split('(')[0].trim()
                    : '';
              }
              functionProcessed();
            });
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'nginx')) {
            this.execWithCallback('nginx -v 2>&1', (error, stdout) => {
              if (!error) {
                const nginx = stdout.toString().split('\n')[0] || '';
                appsObj.versions.nginx = (nginx.toLowerCase().split('/')[1] || '').trim();
              }
              functionProcessed();
            });
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'mysql')) {
            this.execWithCallback('mysql -V', (error, stdout) => {
              if (!error) {
                let mysql = stdout.toString().split('\n')[0] || '';
                mysql = mysql.toLowerCase();
                if (mysql.indexOf(',') > -1) {
                  mysql = (mysql.split(',')[0] || '').trim();
                  const parts = mysql.split(' ');
                  appsObj.versions.mysql = (parts[parts.length - 1] || '').trim();
                } else {
                  if (mysql.indexOf(' ver ') > -1) {
                    mysql = mysql.split(' ver ')[1];
                    appsObj.versions.mysql = mysql.split(' ')[0];
                  }
                }
              }
              functionProcessed();
            });
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'php')) {
            this.execWithCallback('php -v', (error, stdout) => {
              if (!error) {
                const php = stdout.toString().split('\n')[0] || '';
                let parts = php.split('(');
                if (parts[0].indexOf('-')) {
                  parts = parts[0].split('-');
                }
                appsObj.versions.php = parts[0].replace(/[^0-9.]/g, '');
              }
              functionProcessed();
            });
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'redis')) {
            this.execWithCallback('redis-server --version', (error, stdout) => {
              if (!error) {
                const redis = stdout.toString().split('\n')[0] || '';
                const parts = redis.split(' ');
                appsObj.versions.redis = util.getValue(parts, 'v', '=', true);
              }
              functionProcessed();
            });
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'docker')) {
            this.execWithCallback('docker --version', (error, stdout) => {
              if (!error) {
                const docker = stdout.toString().split('\n')[0] || '';
                const parts = docker.split(' ');
                appsObj.versions.docker =
                  parts.length > 2 && parts[2].endsWith(',') ? parts[2].slice(0, -1) : '';
              }
              functionProcessed();
            });
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'postfix')) {
            this.execWithCallback('postconf -d | grep mail_version', (error, stdout) => {
              if (!error) {
                const postfix = stdout.toString().split('\n') || [];
                appsObj.versions.postfix = util.getValue(postfix, 'mail_version', '=', true);
              }
              functionProcessed();
            });
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'mongodb')) {
            this.execWithCallback('mongod --version', (error, stdout) => {
              if (!error) {
                const mongodb = stdout.toString().split('\n')[0] || '';
                appsObj.versions.mongodb = (mongodb.toLowerCase().split(',')[0] || '').replace(
                  /[^0-9.]/g,
                  '',
                );
              }
              functionProcessed();
            });
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'postgresql')) {
            if (this.platform === 'linux') {
              this.execWithCallback('locate bin/postgres', (error, stdout) => {
                if (!error) {
                  const postgresqlBin = stdout.toString().split('\n').sort();
                  if (postgresqlBin.length) {
                    this.execWithCallback(
                      postgresqlBin[postgresqlBin.length - 1] + ' -V',
                      (error, stdout) => {
                        if (!error) {
                          const postgresql = stdout.toString().split('\n')[0].split(' ') || [];
                          appsObj.versions.postgresql = postgresql.length
                            ? postgresql[postgresql.length - 1]
                            : '';
                        }
                        functionProcessed();
                      },
                    );
                  } else {
                    functionProcessed();
                  }
                } else {
                  this.execWithCallback('psql -V', (error, stdout) => {
                    if (!error) {
                      const postgresql = stdout.toString().split('\n')[0].split(' ') || [];
                      appsObj.versions.postgresql = postgresql.length
                        ? postgresql[postgresql.length - 1]
                        : '';
                      appsObj.versions.postgresql = appsObj.versions.postgresql.split('-')[0];
                    }
                    functionProcessed();
                  });
                }
              });
            } else {
              if (this.platform === 'win32') {
                functionProcessed();
                /*
                util.powerShell('Get-CimInstance Win32_Service | select caption | fl').then((stdout) => {
                  let serviceSections = stdout.split(/\n\s*\n/);
                  serviceSections.forEach((item) => {
                    if (item.trim() !== '') {
                      let lines = item.trim().split('\r\n');
                      let srvCaption = util.getValue(lines, 'caption', ':', true).toLowerCase();
                      if (srvCaption.indexOf('postgresql') > -1) {
                        const parts = srvCaption.split(' server ');
                        if (parts.length > 1) {
                          appsObj.versions.postgresql = parts[1];
                        }
                      }
                    }
                  });
                  functionProcessed();
                });*/
              } else {
                this.execWithCallback('postgres -V', (error, stdout) => {
                  if (!error) {
                    const postgresql = stdout.toString().split('\n')[0].split(' ') || [];
                    appsObj.versions.postgresql = postgresql.length
                      ? postgresql[postgresql.length - 1]
                      : '';
                  } else {
                    this.execWithCallback('pg_config --version', (error, stdout) => {
                      if (!error) {
                        const postgresql = stdout.toString().split('\n')[0].split(' ') || [];
                        appsObj.versions.postgresql = postgresql.length
                          ? postgresql[postgresql.length - 1]
                          : '';
                      }
                    });
                  }
                  functionProcessed();
                });
              }
            }
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'perl')) {
            this.execWithCallback('perl -v', (error, stdout) => {
              if (!error) {
                const perl = stdout.toString().split('\n') || '';
                while (perl.length > 0 && perl[0].trim() === '') {
                  perl.shift();
                }
                if (perl.length > 0) {
                  appsObj.versions.perl = perl[0].split('(').pop()?.split(')')[0].replace('v', '');
                }
              }
              functionProcessed();
            });
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'python')) {
            if (this.platform === 'darwin') {
              try {
                const stdout = await this.execAsync('sw_vers');
                const lines = stdout.toString().split('\n');
                const osVersion = util.getValue(lines, 'ProductVersion', ':');
                const gitHomebrewExists1 = await this.fileExists('/usr/local/Cellar/python');
                const gitHomebrewExists2 = await this.fileExists('/opt/homebrew/bin/python');
                if (
                  ((await this.darwinXcodeExists()) && semver.compare('12.0.1', osVersion) < 0) ||
                  gitHomebrewExists1 ||
                  gitHomebrewExists2
                ) {
                  const cmd = gitHomebrewExists1
                    ? '/usr/local/Cellar/python -V 2>&1'
                    : gitHomebrewExists2
                      ? '/opt/homebrew/bin/python -V 2>&1'
                      : 'python -V 2>&1';
                  this.execWithCallback(cmd, (error, stdout) => {
                    if (!error) {
                      const python = stdout.toString().split('\n')[0] || '';
                      appsObj.versions.python = python.toLowerCase().replace('python', '').trim();
                    }
                    functionProcessed();
                  });
                } else {
                  functionProcessed();
                }
              } catch (e) {
                this.logger.error(e);
                functionProcessed();
              }
            } else {
              this.execWithCallback('python -V 2>&1', (error, stdout) => {
                if (!error) {
                  const python = stdout.toString().split('\n')[0] || '';
                  appsObj.versions.python = python.toLowerCase().replace('python', '').trim();
                }
                functionProcessed();
              });
            }
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'python3')) {
            if (this.platform === 'darwin') {
              const gitHomebrewExists =
                (await this.fileExists('/usr/local/Cellar/python3')) ||
                (await this.fileExists('/opt/homebrew/bin/python3'));
              if ((await this.darwinXcodeExists()) || gitHomebrewExists) {
                this.execWithCallback('python3 -V 2>&1', (error, stdout) => {
                  if (!error) {
                    const python = stdout.toString().split('\n')[0] || '';
                    appsObj.versions.python3 = python.toLowerCase().replace('python', '').trim();
                  }
                  functionProcessed();
                });
              } else {
                functionProcessed();
              }
            } else {
              this.execWithCallback('python3 -V 2>&1', (error, stdout) => {
                if (!error) {
                  const python = stdout.toString().split('\n')[0] || '';
                  appsObj.versions.python3 = python.toLowerCase().replace('python', '').trim();
                }
                functionProcessed();
              });
            }
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'pip')) {
            if (this.platform === 'darwin') {
              const gitHomebrewExists =
                (await this.fileExists('/usr/local/Cellar/pip')) ||
                (await this.fileExists('/opt/homebrew/bin/pip'));
              if ((await this.darwinXcodeExists()) || gitHomebrewExists) {
                this.execWithCallback('pip -V 2>&1', (error, stdout) => {
                  if (!error) {
                    const pip = stdout.toString().split('\n')[0] || '';
                    const parts = pip.split(' ');
                    appsObj.versions.pip = parts.length >= 2 ? parts[1] : '';
                  }
                  functionProcessed();
                });
              } else {
                functionProcessed();
              }
            } else {
              this.execWithCallback('pip -V 2>&1', (error, stdout) => {
                if (!error) {
                  const pip = stdout.toString().split('\n')[0] || '';
                  const parts = pip.split(' ');
                  appsObj.versions.pip = parts.length >= 2 ? parts[1] : '';
                }
                functionProcessed();
              });
            }
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'pip3')) {
            if (this.platform === 'darwin') {
              const gitHomebrewExists =
                (await this.fileExists('/usr/local/Cellar/pip3')) ||
                (await this.fileExists('/opt/homebrew/bin/pip3'));
              if ((await this.darwinXcodeExists()) || gitHomebrewExists) {
                this.execWithCallback('pip3 -V 2>&1', (error, stdout) => {
                  if (!error) {
                    const pip = stdout.toString().split('\n')[0] || '';
                    const parts = pip.split(' ');
                    appsObj.versions.pip3 = parts.length >= 2 ? parts[1] : '';
                  }
                  functionProcessed();
                });
              } else {
                functionProcessed();
              }
            } else {
              this.execWithCallback('pip3 -V 2>&1', (error, stdout) => {
                if (!error) {
                  const pip = stdout.toString().split('\n')[0] || '';
                  const parts = pip.split(' ');
                  appsObj.versions.pip3 = parts.length >= 2 ? parts[1] : '';
                }
                functionProcessed();
              });
            }
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'java')) {
            if (this.platform === 'darwin') {
              // check if any JVM is installed but avoid dialog box that Java needs to be installed
              this.execWithCallback('/usr/libexec/java_home -V 2>&1', (error, stdout) => {
                if (!error && stdout.toString().toLowerCase().indexOf('no java runtime') === -1) {
                  // now this can be done savely
                  this.execWithCallback('java -version 2>&1', (error, stdout) => {
                    if (!error) {
                      const java = stdout.toString().split('\n')[0] || '';
                      const parts = java.split('"');
                      appsObj.versions.java = parts.length === 3 ? parts[1].trim() : '';
                    }
                    functionProcessed();
                  });
                } else {
                  functionProcessed();
                }
              });
            } else {
              this.execWithCallback('java -version 2>&1', (error, stdout) => {
                if (!error) {
                  const java = stdout.toString().split('\n')[0] || '';
                  const parts = java.split('"');
                  appsObj.versions.java = parts.length === 3 ? parts[1].trim() : '';
                }
                functionProcessed();
              });
            }
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'gcc')) {
            if (
              (this.platform === 'darwin' && (await this.darwinXcodeExists())) ||
              this.platform !== 'darwin'
            ) {
              this.execWithCallback('gcc -dumpversion', (error, stdout) => {
                if (!error) {
                  appsObj.versions.gcc = stdout.toString().split('\n')[0].trim() || '';
                }
                if (!appsObj.versions?.gcc || appsObj.versions?.gcc?.indexOf('.') > -1) {
                  functionProcessed();
                } else {
                  this.execWithCallback('gcc --version', (error, stdout) => {
                    if (!error) {
                      const gcc = stdout.toString().split('\n')[0].trim();
                      if (gcc.indexOf('gcc') > -1 && gcc.indexOf(')') > -1) {
                        const parts = gcc.split(')');
                        appsObj.versions = appsObj.versions || {};
                        appsObj.versions.gcc = parts[1].trim() || appsObj.versions.gcc;
                      }
                    }
                    functionProcessed();
                  });
                }
              });
            } else {
              functionProcessed();
            }
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'virtualbox')) {
            this.execWithCallback(getVboxmanage() + ' -v 2>&1', (error, stdout) => {
              if (!error) {
                const vbox = stdout.toString().split('\n')[0] || '';
                const parts = vbox.split('r');
                appsObj.versions.virtualbox = parts[0];
              }
              functionProcessed();
            });
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'bash')) {
            this.execWithCallback('bash --version', (error, stdout) => {
              if (!error) {
                const line = stdout.toString().split('\n')[0];
                const parts = line.split(' version ');
                if (parts.length > 1) {
                  appsObj.versions.bash = parts[1].split(' ')[0].split('(')[0];
                }
              }
              functionProcessed();
            });
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'zsh')) {
            this.execWithCallback('zsh --version', (error, stdout) => {
              if (!error) {
                const line = stdout.toString().split('\n')[0];
                const parts = line.split('zsh ');
                if (parts.length > 1) {
                  appsObj.versions.zsh = parts[1].split(' ')[0];
                }
              }
              functionProcessed();
            });
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'fish')) {
            this.execWithCallback('fish --version', (error, stdout) => {
              if (!error) {
                const line = stdout.toString().split('\n')[0];
                const parts = line.split(' version ');
                if (parts.length > 1) {
                  appsObj.versions.fish = parts[1].split(' ')[0];
                }
              }
              functionProcessed();
            });
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'bun')) {
            this.execWithCallback('bun -v', (error, stdout) => {
              if (!error) {
                appsObj.versions.bun = stdout.toString().split('\n')[0].trim();
              }
              functionProcessed();
            });
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'deno')) {
            this.execWithCallback('deno -v', (error, stdout) => {
              if (!error) {
                const line = stdout.toString().split('\n')[0].trim();
                const parts = line.split(' ');
                if (parts.length > 1) {
                  appsObj.versions.deno = parts[1];
                }
              }
              functionProcessed();
            });
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'node')) {
            this.execWithCallback('node -v', (error, stdout) => {
              if (!error) {
                let line = stdout.toString().split('\n')[0].trim();
                if (line.startsWith('v')) {
                  line = line.slice(1);
                }
                appsObj.versions.node = line;
              }
              functionProcessed();
            });
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'powershell')) {
            functionProcessed();
            /*
            if (_windows) {
              util.powerShell('$PSVersionTable').then(stdout => {
                const lines = stdout.toString().toLowerCase().split('\n').map(line => line.replace(/ +/g, ' ').replace(/ +/g, ':'));
                appsObj.versions.powershell = util.getValue(lines, 'psversion');
                functionProcessed();
              });
            } else {
              functionProcessed();
            }
           */
          }
          if ({}.hasOwnProperty.call(appsObj.versions, 'dotnet')) {
            if (this.platform === 'win32') {
              /*  util.powerShell('gci "HKLM:\\SOFTWARE\\Microsoft\\NET Framework Setup\\NDP" -recurse | gp -name Version,Release -EA 0 | where { $_.PSChildName -match "^(?!S)\\p{L}"} | select PSChildName, Version, Release').then(stdout => {
                const lines = stdout.toString().split('\r\n');
                let dotnet = '';
                lines.forEach(line => {
                  line = line.replace(/ +/g, ' ');
                  const parts = line.split(' ');
                  dotnet = dotnet || (parts[0].toLowerCase().startsWith('client') && parts.length > 2 ? parts[1].trim() : (parts[0].toLowerCase().startsWith('full') && parts.length > 2 ? parts[1].trim() : ''));
                });
                appsObj.versions.dotnet = dotnet.trim();
                functionProcessed();
              });

             */
              functionProcessed();
            } else {
              functionProcessed();
            }
          }
        } catch (e) {
          this.logger.error(e);
          if (callback) {
            callback(appsObj.versions);
          }
          resolve(appsObj.versions);
        }
      });
    });
  }

  public shell(callback?: Callback): Promise<string> {
    return new Promise((resolve) => {
      process.nextTick(() => {
        if (this.platform === 'win32') {
          if (callback) {
            callback('CMD');
          }
          resolve('CMD');
          /*
          try {
            const result = 'CMD';
            util.powerShell(`Get-CimInstance -className win32_process | where-object {$_.ProcessId -eq ${process.ppid} } | select Name`).then(stdout => {
              let result = 'CMD';
              if (stdout) {
                if (stdout.toString().toLowerCase().indexOf('powershell') >= 0) {
                  result = 'PowerShell';
                }
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

           */
        } else {
          let result = '';
          this.execWithCallback('echo $SHELL', (error, stdout) => {
            if (!error) {
              result = stdout.toString().split('\n')[0];
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        }
      });
    });
  }

  private async getUniqueMacAdresses() {
    let macs: string[] = [];
    try {
      const ifaces = await this.osNetworkInterfaces();
      for (const dev in ifaces) {
        if ({}.hasOwnProperty.call(ifaces, dev)) {
          ifaces[dev]?.forEach(function (details) {
            if (details && details.mac && details.mac !== '00:00:00:00:00:00') {
              const mac = details.mac.toLowerCase();
              if (macs.indexOf(mac) === -1) {
                macs.push(mac);
              }
            }
          });
        }
      }
      macs = macs.sort(function (a, b) {
        if (a < b) {
          return -1;
        }
        if (a > b) {
          return 1;
        }
        return 0;
      });
    } catch (e) {
      this.logger.debug(e);
      macs.push('00:00:00:00:00:00');
    }
    return macs;
  }

  public uuid(callback?: Callback): Promise<Systeminformation.UuidData> {
    return new Promise((resolve) => {
      process.nextTick(async () => {
        const result = {
          os: '',
          hardware: '',
          macs: await this.getUniqueMacAdresses(),
        } as Systeminformation.UuidData;

        if (this.platform === 'darwin') {
          this.execWithCallback('system_profiler SPHardwareDataType -json', (error, stdout) => {
            if (!error) {
              try {
                const jsonObj = JSON.parse(stdout.toString());
                if (jsonObj.SPHardwareDataType && jsonObj.SPHardwareDataType.length > 0) {
                  const spHardware = jsonObj.SPHardwareDataType[0];
                  result.os = spHardware.platform_UUID.toLowerCase();
                  result.hardware = spHardware.serial_number;
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
        if (this.platform === 'linux') {
          const cmd = `echo -n "os: "; cat /var/lib/dbus/machine-id 2> /dev/null ||
cat /etc/machine-id 2> /dev/null; echo;
echo -n "hardware: "; cat /sys/class/dmi/id/product_uuid 2> /dev/null; echo;`;
          this.execWithCallback(cmd, async (error, stdout) => {
            const lines = stdout.toString().split('\n');
            result.os = util.getValue(lines, 'os').toLowerCase();
            result.hardware = util.getValue(lines, 'hardware').toLowerCase();
            if (!result.hardware) {
              const lines = (await this.readFileAsync('/proc/cpuinfo', { encoding: 'utf8' }))
                .toString()
                .split('\n');
              const serial = util.getValue(lines, 'serial');
              result.hardware = serial || '';
            }
            if (callback) {
              callback(result);
            }
            resolve(result);
          });
        }
        if (
          this.platform === 'freebsd' ||
          this.platform === 'openbsd' ||
          this.platform === 'netbsd'
        ) {
          this.execWithCallback('sysctl -i kern.hostid kern.hostuuid', (error, stdout) => {
            const lines = stdout.toString().split('\n');
            result.os = util.getValue(lines, 'kern.hostid', ':').toLowerCase();
            result.hardware = util.getValue(lines, 'kern.hostuuid', ':').toLowerCase();
            if (result.os.indexOf('unknown') >= 0) {
              result.os = '';
            }
            if (result.hardware.indexOf('unknown') >= 0) {
              result.hardware = '';
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
          let sysdir = '%windir%\\System32';
          if (process.arch === 'ia32' && Object.prototype.hasOwnProperty.call(process.env, 'PROCESSOR_ARCHITEW6432')) {
            sysdir = '%windir%\\sysnative\\cmd.exe /c %windir%\\System32';
          }
          util.powerShell('Get-CimInstance Win32_ComputerSystemProduct | select UUID | fl').then((stdout) => {
            let lines = stdout.split('\r\n');
            result.hardware = util.getValue(lines, 'uuid', ':').toLowerCase();
            exec(`${sysdir}\\reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography" /v MachineGuid`, util.execOptsWin, function (error, stdout) {
              parts = stdout.toString().split('\n\r')[0].split('REG_SZ');
              result.os = parts.length > 1 ? parts[1].replace(/\r+|\n+|\s+/ig, '').toLowerCase() : '';
              if (callback) {
                callback(result);
              }
              resolve(result);
            });
          });*/
        }
      });
    });
  }
}
