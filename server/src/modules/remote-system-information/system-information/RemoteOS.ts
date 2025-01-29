import os, { NetworkInterfaceInfo } from 'node:os';
import logger from '../../../logger';
import { decodePiCpuinfoUtil } from './cpu/cpu.utils';
import { PI_MODEL_NO } from './raspberry.consts';
import { cidrToNetmask, getIPv6ScopeId, netmaskToCidr } from './remoteos.utils';
import { Callback, RemoteExecutorType, RemoteExecutorTypeWithCallback } from './types';
import { execOptsLinux } from './utils';
import * as util from './utils';

export abstract class RemoteOS {
  protected readonly execAsync: RemoteExecutorType;
  protected readonly execWithCallback: RemoteExecutorTypeWithCallback;
  private _cores = 0;
  private _rpi_cpuinfo = null;
  private codepage!: string;
  private _osType!: 'linux' | 'darwin' | 'windows';
  private _platform!:
    | 'linux'
    | 'darwin'
    | 'android'
    | 'freebsd'
    | 'openbsd'
    | 'netbsd'
    | 'sunos'
    | 'win32'
    | 'unknown';

  protected constructor(
    execAsync: RemoteExecutorType,
    execWithCallback: RemoteExecutorTypeWithCallback,
  ) {
    this.execAsync = execAsync;
    this.execWithCallback = execWithCallback;
  }

  public async init() {
    this._osType = await this.detectOS();
    this._platform = await this.getHostPlatform();
    try {
      this._cores = (await this.cpus()).length;
    } catch {
      this._cores = 0;
    }
  }

  protected cores() {
    return this._cores;
  }

  protected async readFileAsync(
    path: string,
    options?: { encoding?: BufferEncoding },
  ): Promise<string> {
    const result = await this.execAsync(`cat ${path}`);

    // Handle encoding (default is 'utf8')
    if (options?.encoding) {
      return Buffer.from(result).toString(options.encoding);
    }

    return result; // Default return as a string (raw output)
  }

  protected readFileWithCallback(path: string, callback: Callback) {
    this.execWithCallback(`cat ${path}`, callback);
  }

  protected fileExistsWithCallback(path: string, callback: Callback) {
    this.execWithCallback(`test -f ${path}`, callback);
  }

  protected async fileExists(path: string): Promise<boolean> {
    try {
      // Execute the command to check if the file exists
      const command = `test -f ${path} && echo "true" || echo "false"`;
      const result = await this.execAsync(command);

      // The result should be "true" or "false", based on the command output
      return result.trim() === 'true';
    } catch (error: any) {
      logger.error(
        `fileExists: Failed to check file existence for path "${path}". Error: ${error.message}`,
      );
      return false; // Assume the file does not exist if the command fails
    }
  }

  // Detect Remote OS Type
  protected async detectOS(): Promise<'linux' | 'darwin' | 'windows'> {
    try {
      const result = await this.execAsync('uname -s'); // Linux/macOS specific
      if (result.includes('Linux')) {
        return 'linux';
      }
      if (result.includes('Darwin')) {
        return 'darwin';
      } // macOS returns Darwin
      logger.error(result);
    } catch (error: any) {
      logger.error(error);
      logger.error(error?.message);
      const windowsCheck = await this.execAsync('ver'); // Windows specific
      if (windowsCheck) {
        return 'windows';
      }
    }
    throw new Error('Unknown OS or OS detection failed');
  }

  public get platform() {
    return this._platform;
  }

  private async getHostPlatform() {
    const unameOutput = await this.execAsync('uname');
    switch (unameOutput) {
      case 'Linux': {
        // Further check for Android (commonly has `android` identifier)
        const osRelease = await this.execAsync('cat /proc/sys/kernel/osrelease');
        if (osRelease.includes('android')) {
          return 'android';
        }
        return 'linux';
      }
      case 'Darwin':
        return 'darwin';
      case 'FreeBSD':
        return 'freebsd';
      case 'OpenBSD':
        return 'openbsd';
      case 'NetBSD':
        return 'netbsd';
      case 'SunOS':
        return 'sunos';
      case 'Windows_NT':
        return 'win32';
      default:
        return 'unknown';
    }
  }

  protected async getType(): Promise<string> {
    try {
      const result = await this.execAsync('uname -s'); // Works on Linux/macOS
      if (result.includes('Linux')) {
        return 'Linux';
      }
      if (result.includes('Darwin')) {
        return 'Darwin';
      } // macOS returns Darwin
    } catch {
      const windowsCheck = await this.execAsync('ver'); // Windows specific
      if (windowsCheck) {
        return 'Windows_NT';
      }
    }
    throw new Error('Unknown OS or OS detection failed for type');
  }

  // os.release()
  protected async release(): Promise<string> {
    const command = this._osType === 'windows' ? 'ver' : 'uname -r';
    const result = await this.execAsync(command);
    return result.trim();
  }

  // os.arch()
  protected async arch(): Promise<string> {
    const command = this._osType === 'windows' ? 'wmic os get osarchitecture' : 'uname -m';
    const result = await this.execAsync(command);
    return result.trim().split('\n')[0];
  }

  // os.totalmem()
  protected async totalmem(): Promise<number> {
    let command;
    if (this._osType === 'linux') {
      command = "cat /proc/meminfo | grep MemTotal | awk '{print $2 * 1024}'";
    } else if (this._osType === 'darwin') {
      command = 'sysctl -n hw.memsize';
    } else {
      command = 'wmic OS get TotalVisibleMemorySize /Value';
    }

    const result = await this.execAsync(command);
    if (this._osType === 'windows') {
      const match = result.match(/TotalVisibleMemorySize=(\d+)/);
      return match ? parseInt(match[1], 10) * 1024 : 0; // Convert KB to bytes
    }

    return parseInt(result.trim(), 10); // Linux/Mac
  }

  // os.freemem()
  protected async freemem(): Promise<number> {
    let command;
    if (this._osType === 'linux') {
      command = "cat /proc/meminfo | grep MemAvailable | awk '{print $2 * 1024}'";
    } else if (this._osType === 'darwin') {
      command = "vm_stat | grep 'Pages free' | awk '{print $3 * 4096}'";
    } else {
      command = 'wmic OS get FreePhysicalMemory /Value';
    }

    const result = await this.execAsync(command);
    if (this._osType === 'windows') {
      const match = result.match(/FreePhysicalMemory=(\d+)/);
      return match ? parseInt(match[1], 10) * 1024 : 0; // Convert KB to bytes
    }

    return parseInt(result.trim(), 10); // Linux/Mac
  }

  // os.loadavg()
  protected async loadavg(): Promise<number[]> {
    if (this._osType === 'windows') {
      return [0, 0, 0]; // Load average not natively supported on Windows
    }

    const command = this._osType === 'linux' ? 'cat /proc/loadavg' : 'uptime';
    const result = await this.execAsync(command);
    if (this._osType === 'linux') {
      return result.split(' ').slice(0, 3).map(parseFloat); // Parse 1, 5, 15-minute load averages
    } else {
      const load = result.match(/averages?: ([\d.]+), ([\d.]+), ([\d.]+)/);
      return load ? load.slice(1, 4).map(parseFloat) : [0, 0, 0];
    }
  }

  protected async uptime(): Promise<number> {
    let command: string;

    // Determine the appropriate command based on the OS type
    if (this._osType === 'linux') {
      command = 'cat /proc/uptime'; // Reads uptime in seconds
    } else if (this._osType === 'darwin') {
      command = 'sysctl -n kern.boottime'; // macOS specific boot time
    } else if (this._osType === 'windows') {
      command = 'powershell -Command "(Get-WmiObject Win32_OperatingSystem).LastBootUpTime"'; // Windows-specific
    } else {
      throw new Error('Unsupported OS for uptime calculation');
    }

    // Execute the command
    const result = await this.execAsync(command);

    // Parse the result and calculate uptime
    if (this._osType === 'linux') {
      // Linux: result is like "12345.67 89012.34"
      const uptimeSeconds = parseFloat(result.split(' ')[0]);
      return Math.floor(uptimeSeconds); // Return as seconds, rounded down
    } else if (this._osType === 'darwin') {
      // macOS: result is like "{ sec = 1692280598, usec = 0 }"
      const match = result.match(/sec = (\d+)/);
      if (!match) {
        throw new Error('Failed to parse macOS uptime');
      }
      const bootTime = parseInt(match[1], 10); // Boot time in seconds since epoch
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      return currentTime - bootTime; // Return uptime in seconds
    } else if (this._osType === 'windows') {
      // Windows: result is like "20230926080447.000000+000"
      const match = result.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
      if (!match) {
        throw new Error('Failed to parse Windows uptime');
      }
      const bootTime = new Date(
        `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}Z`,
      ).getTime();
      const currentTime = Date.now(); // Current time in ms
      return Math.floor((currentTime - bootTime) / 1000); // Return uptime in seconds
    }

    throw new Error('Unsupported OS or failed to detect uptime');
  }

  protected get EOL(): string {
    if (this._osType === 'windows') {
      return '\r\n'; // Use Windows EOL
    }
    return '\n'; // Use Linux/macOS EOL
  }

  protected async cpus(): Promise<(os.CpuInfo & { times: { steal?: number; guest?: number } })[]> {
    if (this._osType === 'linux') {
      // For Linux systems
      const cpuInfoRaw = await this.execAsync('cat /proc/cpuinfo');
      const statsInfoRaw = await this.execAsync('cat /proc/stat | grep "^cpu[0-9]"');
      const scalingFrequencyRaw = await this.execAsync(
        'cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq',
      ).catch(() => '0');
      const scalingFrequencyMHz = parseFloat(scalingFrequencyRaw.trim()) / 1000 || 0; // Convert kHz to MHz

      // Parse /proc/cpuinfo for model names (and fallback if "model name" is not present)
      const modelLines = cpuInfoRaw
        .split('\n')
        .filter((line) => line.trim().length > 0) // Filter out unnecessary empty lines
        .reduce<string[]>((models, line) => {
          if (line.toLowerCase().startsWith('model name')) {
            models.push(line.split(':')[1].trim());
          } else if (
            line.toLowerCase().startsWith('hardware') ||
            line.toLowerCase().startsWith('processor')
          ) {
            // Fallback fields for devices like Raspberry Pi
            models.push(line.split(':')[1].trim());
          }
          return models;
        }, []);

      // Fallback if no models found
      if (modelLines.length === 0) {
        modelLines.push('Unknown CPU'); // Default placeholder
      }

      // Parse /proc/stat for CPU time information
      const cpuTimes = statsInfoRaw
        .split('\n')
        .filter(Boolean) // Remove empty lines
        .map((line) => {
          const parts = line
            .split(/\s+/)
            .map((value) => (isNaN(Number(value)) ? undefined : Number(value))); // Handle number conversion
          const [, user, nice, sys, idle, , irq] = parts; // Extract fields
          return {
            user: user || 0, // Default to 0 if undefined
            nice: nice || 0,
            sys: sys || 0,
            idle: idle || 0,
            irq: irq || 0,
          };
        });

      // Consolidate and return results for each core
      return modelLines.map((model, index) => ({
        model,
        speed: (scalingFrequencyMHz ? scalingFrequencyMHz * modelLines.length : undefined) || 0, // Clock speed (MHz) is optional, not directly available from /proc/cpuinfo
        times: cpuTimes[index] || {
          user: 0,
          nice: 0,
          sys: 0,
          idle: 0,
          irq: 0,
        }, // Fallback times if index doesn't exist
      }));
    }

    if (this._osType === 'darwin') {
      // For macOS systems
      const result = await this.execAsync(
        'sysctl -n machdep.cpu.brand_string hw.ncpu hw.cpufrequency',
      );
      const [brandString, cpuCount, frequency] = result.trim().split('\n');

      // Mocking the times object (macOS doesn’t provide per-core CPU times)
      const times = { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 };

      return Array.from({ length: parseInt(cpuCount, 10) }).map(() => ({
        model: brandString.trim(),
        speed: Math.round(parseInt(frequency, 10) / 1e6), // Convert Hz to MHz
        times,
      }));
    }

    if (this._osType === 'windows') {
      // For Windows systems
      const cpuInfo = await this.execAsync(
        'wmic cpu get Name,NumberOfLogicalProcessors,MaxClockSpeed /Format:csv',
      );
      const lines = cpuInfo.split('\n').filter(Boolean);

      // Extract column headers and rows
      const headers = lines[0].split(',');
      const rows = lines.slice(1).map((line) =>
        line.split(',').reduce(
          (acc, value, index) => {
            acc[headers[index].trim()] = value.trim();
            return acc;
          },
          {} as Record<string, string>,
        ),
      );

      return rows.map((row) => ({
        model: row['Name'],
        speed: parseInt(row['MaxClockSpeed'], 10), // Already in MHz
        times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 }, // Mock CPU times
      }));
    }

    throw new Error(`Unsupported OS: ${this._osType}`);
  }

  // os.networkInterfaces()
  protected async osNetworkInterfaces(): Promise<NodeJS.Dict<NetworkInterfaceInfo[]>> {
    const command =
      this._osType === 'windows'
        ? 'wmic nicconfig where "IPEnabled=true" get Description,MACAddress,IPAddress,IPSubnet /Value'
        : 'ip -j addr'; // Using JSON output for easier parsing on Linux/macOS

    const result = await this.execAsync(command);

    const interfaces: NodeJS.Dict<NetworkInterfaceInfo[]> = {};

    if (this._osType === 'windows') {
      // Parse Windows result
      const blocks = result.split(/\r?\n\r?\n/).filter((block) => block.trim()); // Split by blocks
      for (const block of blocks) {
        const name = block.match(/Description=(.+)/)?.[1]?.trim();
        const mac = block.match(/MACAddress=(.+)/)?.[1]?.trim();
        const ips = block
          .match(/IPAddress=\{(.+)\}/)?.[1]
          ?.split(',')
          .map((ip) => ip.trim());
        const subnets = block
          .match(/IPSubnet=\{(.+)\}/)?.[1]
          ?.split(',')
          .map((sub) => sub.trim());

        if (name && mac && ips && subnets) {
          interfaces[name] = ips.map(
            (ip, index) =>
              ({
                address: ip,
                netmask: subnets[index] || '',
                family: ip.includes(':') ? 'IPv6' : 'IPv4',
                mac,
                internal: ip.startsWith('127.') || ip === '::1', // Loopback checking
                cidr: `${ip}/${netmaskToCidr(subnets[index] || '')}`,
                scopeid: ip.includes(':') && name ? getIPv6ScopeId(name) : undefined, // Assign scopeid for IPv6
              }) as NetworkInterfaceInfo,
          );
        }
      }
    } else {
      // Parse Linux/macOS result (JSON output for easier parsing)
      const networkData = JSON.parse(result);
      for (const iface of networkData) {
        const { ifname, addr_info, address, link_index } = iface;
        if (!interfaces[ifname]) {
          interfaces[ifname] = [];
        }
        addr_info.forEach((addr: any) => {
          interfaces[ifname]?.push({
            address: addr.local,
            netmask: addr.prefixlen ? cidrToNetmask(addr.prefixlen) : '',
            family: addr.local.includes(':') ? 'IPv6' : 'IPv4',
            mac: address,
            internal: addr.local.startsWith('127.') || addr.local === '::1', // Loopback checking
            cidr: `${addr.local}/${addr.prefixlen}`,
            scopeid: addr.local.includes(':') ? link_index : undefined, // Add scopeid for IPv6
          });
        });
      }
    }

    return interfaces;
  }

  protected async isRaspberry(cpuinfo?: any) {
    if (this._rpi_cpuinfo !== null) {
      cpuinfo = this._rpi_cpuinfo;
    } else if (cpuinfo === undefined) {
      try {
        cpuinfo = (await this.readFileAsync('/proc/cpuinfo')).toString().split('\n');
        this._rpi_cpuinfo = cpuinfo;
      } catch {
        return false;
      }
    }

    const hardware = util.getValue(cpuinfo, 'hardware');
    const model = util.getValue(cpuinfo, 'model');
    return (
      (hardware && PI_MODEL_NO.indexOf(hardware) > -1) ||
      (model && model.indexOf('Raspberry Pi') > -1)
    );
  }

  protected decodePiCpuinfo(lines?: any) {
    if (this._rpi_cpuinfo === null) {
      this._rpi_cpuinfo = lines;
    } else if (lines === undefined) {
      lines = this._rpi_cpuinfo;
    }
    return decodePiCpuinfoUtil(lines);
  }

  protected async hostname(): Promise<string> {
    let command: string;

    // Determine the command to get hostname based on the OS type
    if (this._osType === 'linux' || this._osType === 'darwin') {
      command = 'hostname'; // Command available on Linux and macOS
    } else if (this._osType === 'windows') {
      command = 'hostname'; // Works on Windows as well
    } else {
      throw new Error('Unsupported OS for retrieving hostname');
    }

    // Execute the command and return the hostname
    const result = await this.execAsync(command);
    return result.trim(); // Remove any trailing newline for clean output
  }

  protected async getCodepage() {
    if (this.platform === 'win32') {
      if (!this.codepage) {
        /* try {
          const stdout = await this.execAsync('chcp', execOptsWin);
          const lines = stdout.toString().split('\r\n');
          const parts = lines[0].split(':');
          this.codepage = parts.length > 1 ? parts[1].replace('.', '').trim() : '';
        } catch  {
          this.codepage = '437';
        }
      }*/
        return this.codepage || '';
      }
    }
    if (
      this.platform === 'linux' ||
      this.platform === 'darwin' ||
      this.platform === 'freebsd' ||
      this.platform === 'openbsd' ||
      this.platform === 'netbsd'
    ) {
      if (!this.codepage) {
        try {
          const stdout = await this.execAsync('echo $LANG', execOptsLinux);
          const lines = stdout.toString().split('\r\n');
          const parts = lines[0].split('.');
          this.codepage = parts.length > 1 ? parts[1].trim() : '';
          if (!this.codepage) {
            this.codepage = 'UTF-8';
          }
        } catch (err) {
          logger.error(err);
          this.codepage = 'UTF-8';
        }
      }
      return this.codepage;
    }
  }

  protected async darwinXcodeExists() {
    const cmdLineToolsExists = await this.fileExists(
      '/Library/Developer/CommandLineTools/usr/bin/',
    );
    const xcodeAppExists = await this.fileExists(
      '/Applications/Xcode.app/Contents/Developer/Tools',
    );
    const xcodeExists = await this.fileExists('/Library/Developer/Xcode/');
    return cmdLineToolsExists || xcodeExists || xcodeAppExists;
  }

  /**
   * Checks if a path is a directory on a remote system
   */
  private async isDirectory(path: string): Promise<boolean> {
    const command = `[ -d "${path}" ] && echo "true" || echo "false"`;
    const result = await this.execAsync(command);
    return result.trim() === 'true';
  }

  /**
   * Checks if a path is a file on a remote system
   */
  private async isFile(path: string): Promise<boolean> {
    const command = `[ -f "${path}" ] && echo "true" || echo "false"`;
    const result = await this.execAsync(command);
    return result.trim() === 'true';
  }

  /**
   * Gets list of directories in a directory on a remote system
   */
  private async getDirectories(path: string): Promise<string[]> {
    const command = `find "${path}" -maxdepth 1 -type d ! -path "${path}"`;
    try {
      const result = await this.execAsync(command);
      return result.trim().split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }

  /**
   * Gets list of files in a directory on a remote system
   */
  private async getFiles(path: string): Promise<string[]> {
    const command = `find "${path}" -maxdepth 1 -type f`;
    try {
      const result = await this.execAsync(command);
      return result.trim().split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }

  /**
   * Recursively gets all files in a directory on a remote system
   */
  private async getFilesRecursively(path: string): Promise<string[]> {
    try {
      const directories = await this.getDirectories(path);
      const filesInDirs = await Promise.all(
        directories.map((dir) => this.getFilesRecursively(dir)),
      );

      const allFiles = filesInDirs.reduce((acc, files) => acc.concat(files), []);
      const filesInCurrentDir = await this.getFiles(path);

      return allFiles.concat(filesInCurrentDir);
    } catch {
      return [];
    }
  }

  /**
   * Main function to get all files under a path on the remote system
   */
  protected async getFilesInPath(path: string): Promise<string[]> {
    const exists = await this.fileExists(path);
    if (!exists) {
      return [];
    }
    return await this.getFilesRecursively(path);
  }

  protected async getRpiGpu(cpuinfo?: any) {
    if (this._rpi_cpuinfo === null && cpuinfo !== undefined) {
      this._rpi_cpuinfo = cpuinfo;
    } else if (cpuinfo === undefined && this._rpi_cpuinfo !== null) {
      cpuinfo = this._rpi_cpuinfo;
    } else {
      try {
        cpuinfo = (await this.readFileAsync('/proc/cpuinfo', { encoding: 'utf8' }))
          .toString()
          .split('\n');
        this._rpi_cpuinfo = cpuinfo;
      } catch {
        return undefined;
      }
    }

    const rpi = this.decodePiCpuinfo(cpuinfo);
    if (rpi.type === '4B' || rpi.type === 'CM4' || rpi.type === 'CM4S' || rpi.type === '400') {
      return 'VideoCore VI';
    }
    if (rpi.type === '5' || rpi.type === '500') {
      return 'VideoCore VII';
    }
    return 'VideoCore IV';
  }
}
