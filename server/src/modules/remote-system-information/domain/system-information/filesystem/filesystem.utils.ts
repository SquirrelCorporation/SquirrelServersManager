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
import logger from '../../../../../logger';
import * as util from '../utils/system-utils';
import { diskManufacturers, linuxTmpFileSystems } from './filesystem.consts';

export function parseBytes(s: string) {
  return parseInt(s.substr(s.indexOf(' (') + 2, s.indexOf(' Bytes)') - 10));
}

export function parseDevices(lines: any[]) {
  const devices: Systeminformation.BlockDevicesData[] = [];
  let i = 0;
  lines.forEach((line) => {
    if (line.length > 0) {
      if (line[0] === '*') {
        i++;
      } else {
        const parts = line.split(':');
        if (parts.length > 1) {
          if (!devices[i]) {
            devices[i] = {
              name: '',
              identifier: '',
              type: 'disk',
              fsType: '',
              mount: '',
              size: 0,
              physical: 'HDD',
              uuid: '',
              label: '',
              model: '',
              serial: '',
              removable: false,
              protocol: '',
              group: '',
              device: '',
            };
          }
          parts[0] = parts[0].trim().toUpperCase().replace(/ +/g, '');
          parts[1] = parts[1].trim();
          if ('DEVICEIDENTIFIER' === parts[0]) {
            devices[i].identifier = parts[1];
          }
          if ('DEVICENODE' === parts[0]) {
            devices[i].name = parts[1];
          }
          if ('VOLUMENAME' === parts[0]) {
            if (parts[1].indexOf('Not applicable') === -1) {
              devices[i].label = parts[1];
            }
          }
          if ('PROTOCOL' === parts[0]) {
            devices[i].protocol = parts[1];
          }
          if ('DISKSIZE' === parts[0]) {
            devices[i].size = parseBytes(parts[1]);
          }
          if ('FILESYSTEMPERSONALITY' === parts[0]) {
            devices[i].fsType = parts[1];
          }
          if ('MOUNTPOINT' === parts[0]) {
            devices[i].mount = parts[1];
          }
          if ('VOLUMEUUID' === parts[0]) {
            devices[i].uuid = parts[1];
          }
          if ('READ-ONLYMEDIA' === parts[0] && parts[1] === 'Yes') {
            devices[i].physical = 'CD/DVD';
          }
          if ('SOLIDSTATE' === parts[0] && parts[1] === 'Yes') {
            devices[i].physical = 'SSD';
          }
          if ('VIRTUAL' === parts[0]) {
            devices[i].type = 'virtual';
          }
          if ('REMOVABLEMEDIA' === parts[0]) {
            devices[i].removable = parts[1] === 'Removable';
          }
          if ('PARTITIONTYPE' === parts[0]) {
            devices[i].type = 'part';
          }
          if ('DEVICE/MEDIANAME' === parts[0]) {
            devices[i].model = parts[1];
          }
        }
      }
    }
  });
  return devices;
}

export function unique(obj: any) {
  const uniques: any[] = [];
  const stringify: Record<string, boolean> = {};
  for (let i = 0; i < obj.length; i++) {
    const keys = Object.keys(obj[i]);
    keys.sort((a, b) => {
      // @ts-expect-error Expecting compare error
      return a - b;
    });
    let str = '';
    for (let j = 0; j < keys.length; j++) {
      str += JSON.stringify(keys[j]);
      str += JSON.stringify(obj[i][keys[j]]);
    }
    if (!{}.hasOwnProperty.call(stringify, str)) {
      uniques.push(obj[i]);
      stringify[str] = true;
    }
  }
  return uniques;
}

export function sortByKey(array: any[], keys: string[]) {
  return array.sort((a, b) => {
    let x = '';
    let y = '';
    keys.forEach((key) => {
      x = x + a[key];
      y = y + b[key];
    });
    return x < y ? -1 : x > y ? 1 : 0;
  });
}

export function parseBlk(lines: any[]) {
  let data: Partial<Systeminformation.BlockDevicesData>[] = [];

  lines
    .filter((line) => line !== '')
    .forEach((line) => {
      try {
        line = decodeURIComponent(line.replace(/\\x/g, '%'));
        line = line.replace(/\\/g, '\\\\');
        const disk = JSON.parse(line);
        data.push({
          name: disk.name,
          type: disk.type,
          fsType: disk.fsType,
          mount: disk.mountpoint,
          size: parseInt(disk.size),
          physical:
            disk.type === 'disk'
              ? disk.rota === '0'
                ? 'SSD'
                : 'HDD'
              : disk.type === 'rom'
                ? 'CD/DVD'
                : '',
          uuid: disk.uuid,
          label: disk.label,
          model: (disk.model || '').trim(),
          serial: disk.serial,
          removable: disk.rm === '1',
          protocol: disk.tran,
          group: disk.group || '',
        });
      } catch (e) {
        logger.error(e);
        util.noop();
      }
    });
  data = unique(data);
  data = sortByKey(data, ['type', 'name']);
  return data;
}

export function decodeMdabmData(lines: any[]) {
  const raid = util.getValue(lines, 'md_level', '=');
  const label = util.getValue(lines, 'md_name', '='); // <- get label info
  const uuid = util.getValue(lines, 'md_uuid', '='); // <- get uuid info
  const members: any[] = [];
  lines.forEach((line) => {
    if (line.toLowerCase().startsWith('md_device_dev') && line.toLowerCase().indexOf('/dev/') > 0) {
      members.push(line.split('/dev/')[1]);
    }
  });
  return {
    raid,
    label,
    uuid,
    members,
  };
}

export function getDevicesLinux(data: any[]) {
  const result: any[] = [];
  data.forEach((element) => {
    if (element.type.startsWith('disk')) {
      result.push(element.name);
    }
  });
  return result;
}

export function matchDevicesLinux(data: any[]) {
  let result = data;
  try {
    const devices = getDevicesLinux(data);
    result = result.map((blockdevice) => {
      if (blockdevice.type.startsWith('part') || blockdevice.type.startsWith('disk')) {
        devices.forEach((element) => {
          if (blockdevice.name.startsWith(element)) {
            blockdevice.device = '/dev/' + element;
          }
        });
      }
      return blockdevice;
    });
  } catch (e) {
    logger.error(e);
    util.noop();
  }
  return result;
}

export function getDevicesMac(data: any[]) {
  const result: any[] = [];
  data.forEach((element) => {
    if (element.type.startsWith('disk')) {
      result.push({ name: element.name, model: element.model, device: element.name });
    }
    if (element.type.startsWith('virtual')) {
      let device = '';
      result.forEach((e) => {
        if (e.model === element.model) {
          device = e.device;
        }
      });
      if (device) {
        result.push({ name: element.name, model: element.model, device });
      }
    }
  });
  return result;
}

export function matchDevicesMac(data: any[]) {
  let result = data;
  try {
    const devices = getDevicesMac(data);
    result = result.map((blockdevice) => {
      if (
        blockdevice.type.startsWith('part') ||
        blockdevice.type.startsWith('disk') ||
        blockdevice.type.startsWith('virtual')
      ) {
        devices.forEach((element) => {
          if (blockdevice.name.startsWith(element.name)) {
            blockdevice.device = element.device;
          }
        });
      }
      return blockdevice;
    });
  } catch (e) {
    logger.error(e);
    util.noop();
  }
  return result;
}

function getDevicesWin(diskDrives: string[]) {
  const result: any[] = [];
  diskDrives.forEach((element) => {
    const lines = element.split('\r\n');
    const device = util.getValue(lines, 'DeviceID', ':');
    let partitions = element.split('@{DeviceID=');
    if (partitions.length > 1) {
      partitions = partitions.slice(1);
      partitions.forEach((partition) => {
        result.push({ name: partition.split(';')[0].toUpperCase(), device });
      });
    }
  });
  return result;
}

export function matchDevicesWin(data: any[], diskDrives: string[]) {
  const devices = getDevicesWin(diskDrives);
  data.map((element) => {
    const filteresDevices = devices.filter((e) => {
      return e.name === element.name.toUpperCase();
    });
    if (filteresDevices.length > 0) {
      element.device = filteresDevices[0].device;
    }
    return element;
  });
  return data;
}

export function blkStdoutToObject(stdout: any) {
  return stdout
    .toString()
    .replace(/NAME=/g, '{"name":')
    .replace(/FSTYPE=/g, ',"fsType":')
    .replace(/TYPE=/g, ',"type":')
    .replace(/SIZE=/g, ',"size":')
    .replace(/MOUNTPOINT=/g, ',"mountpoint":')
    .replace(/UUID=/g, ',"uuid":')
    .replace(/ROTA=/g, ',"rota":')
    .replace(/RO=/g, ',"ro":')
    .replace(/RM=/g, ',"rm":')
    .replace(/TRAN=/g, ',"tran":')
    .replace(/SERIAL=/g, ',"serial":')
    .replace(/LABEL=/g, ',"label":')
    .replace(/MODEL=/g, ',"model":')
    .replace(/OWNER=/g, ',"owner":')
    .replace(/GROUP=/g, ',"group":')
    .replace(/\n/g, '}\n');
}

export function isLinuxTmpFs(fs: string) {
  let result = false;
  linuxTmpFileSystems.forEach((linuxFs) => {
    if (fs.toLowerCase().indexOf(linuxFs) >= 0) {
      result = true;
    }
  });
  return result;
}

export function getVendorFromModel(model?: string) {
  let result = '';
  if (model) {
    model = model.toUpperCase();
    diskManufacturers.forEach((manufacturer) => {
      const re = RegExp(manufacturer.pattern);
      if (re.test(model as string)) {
        result = manufacturer.manufacturer;
      }
    });
  }
  return result;
}

export function filterLines(stdout: any) {
  const lines = stdout.toString().split('\n');
  lines.shift();
  if (stdout.toString().toLowerCase().indexOf('filesystem')) {
    let removeLines = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] && lines[i].toLowerCase().startsWith('filesystem')) {
        removeLines = i;
      }
    }
    for (let i = 0; i < removeLines; i++) {
      lines.shift();
    }
  }
  return lines;
}
