// ==================================================================================
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2025
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT

import { Systeminformation } from 'ssm-shared-lib';
import * as RaspberryConsts from '../raspberry.consts';
import { getValue, hex2bin } from '../utils';
import * as util from '../utils';
import { AMDBaseFrequencies, socketTypesByName } from './cpu.consts';

export function getSocketTypesByName(str: string) {
  let result = '';
  for (const key in socketTypesByName) {
    const names = socketTypesByName[key as keyof typeof socketTypesByName].split(' ');
    names.forEach((element: string) => {
      if (str.indexOf(element) >= 0) {
        result = key;
      }
    });
  }
  return result;
}

export function cpuManufacturer(str: string) {
  let result = str;
  str = str.toLowerCase();

  if (str.indexOf('intel') >= 0) {
    result = 'Intel';
  }
  if (str.indexOf('amd') >= 0) {
    result = 'AMD';
  }
  if (str.indexOf('qemu') >= 0) {
    result = 'QEMU';
  }
  if (str.indexOf('hygon') >= 0) {
    result = 'Hygon';
  }
  if (str.indexOf('centaur') >= 0) {
    result = 'WinChip/Via';
  }
  if (str.indexOf('vmware') >= 0) {
    result = 'VMware';
  }
  if (str.indexOf('Xen') >= 0) {
    result = 'Xen Hypervisor';
  }
  if (str.indexOf('tcg') >= 0) {
    result = 'QEMU';
  }
  if (str.indexOf('apple') >= 0) {
    result = 'Apple';
  }

  return result;
}

export function cpuBrandManufacturer(res: Systeminformation.CpuData) {
  res.brand = res.brand
    .replace(/\(R\)+/g, '®')
    .replace(/\s+/g, ' ')
    .trim();
  res.brand = res.brand
    .replace(/\(TM\)+/g, '™')
    .replace(/\s+/g, ' ')
    .trim();
  res.brand = res.brand
    .replace(/\(C\)+/g, '©')
    .replace(/\s+/g, ' ')
    .trim();
  res.brand = res.brand.replace(/CPU+/g, '').replace(/\s+/g, ' ').trim();
  res.manufacturer = cpuManufacturer(res.brand);

  const parts = res.brand.split(' ');
  parts.shift();
  res.brand = parts.join(' ');
  return res;
}

export function getAMDSpeed(brand: string) {
  let result = '0';
  for (const key in AMDBaseFrequencies) {
    if ({}.hasOwnProperty.call(AMDBaseFrequencies, key)) {
      const parts = key.split('|');
      let found = 0;
      parts.forEach((item) => {
        if (brand.indexOf(item) > -1) {
          found++;
        }
      });
      if (found === parts.length) {
        result = AMDBaseFrequencies[key as keyof typeof AMDBaseFrequencies];
      }
    }
  }
  return parseFloat(result);
}

export function parseWinCache(linesProc: any, linesCache: any) {
  const result: Systeminformation.CpuCacheData = {
    l1d: null,
    l1i: null,
    l2: null,
    l3: null,
  };

  // Win32_processor
  const lines = linesProc.split('\r\n');
  result.l1d = 0;
  result.l1i = 0;
  result.l2 = util.getValue(lines, 'l2cachesize', ':') as string;
  result.l3 = util.getValue(lines, 'l3cachesize', ':') as string;
  if (result.l2) {
    result.l2 = parseInt(result.l2, 10) * 1024;
  } else {
    result.l2 = 0;
  }
  if (result.l3) {
    result.l3 = parseInt(result.l3, 10) * 1024;
  } else {
    result.l3 = 0;
  }

  // Win32_CacheMemory
  const parts = linesCache.split(/\n\s*\n/);
  let l1i = 0;
  let l1d = 0;
  let l2 = 0;
  parts.forEach((part: any) => {
    const lines = part.split('\r\n');
    const cacheType = util.getValue(lines, 'CacheType');
    const level = util.getValue(lines, 'Level');
    const installedSize = util.getValue(lines, 'InstalledSize');
    // L1 Instructions
    if (level === '3' && cacheType === '3') {
      result.l1i = (result.l1i as number) + parseInt(installedSize, 10) * 1024;
    }
    // L1 Data
    if (level === '3' && cacheType === '4') {
      result.l1d = (result.l1d as number) + parseInt(installedSize, 10) * 1024;
    }
    // L1 all
    if (level === '3' && cacheType === '5') {
      l1i = parseInt(installedSize, 10) / 2;
      l1d = parseInt(installedSize, 10) / 2;
    }
    // L2
    if (level === '4' && cacheType === '5') {
      l2 = l2 + parseInt(installedSize, 10) * 1024;
    }
  });
  if (!result.l1i && !result.l1d) {
    result.l1i = l1i;
    result.l1d = l1d;
  }
  if (l2) {
    result.l2 = l2;
  }
  return result;
}

export function decodePiCpuinfoUtil(lines: any) {
  const revisionCode = getValue(
    lines,
    'revision',
    ':',
    true,
  ) as keyof typeof RaspberryConsts.oldRevisionCodes;
  const model = getValue(lines, 'model:', ':', true) as string;
  const serial = getValue(lines, 'serial', ':', true) as string;

  let result: Partial<
    Systeminformation.CpuData &
      Systeminformation.RaspberryRevisionData & { revisionCode?: string; serial?: string }
  > = {};
  if ({}.hasOwnProperty.call(RaspberryConsts.oldRevisionCodes, revisionCode)) {
    // old revision codes
    result = {
      model,
      serial,
      revisionCode,
      memory: RaspberryConsts.oldRevisionCodes[revisionCode].memory,
      manufacturer: RaspberryConsts.oldRevisionCodes[revisionCode].manufacturer,
      processor: RaspberryConsts.oldRevisionCodes[revisionCode].processor,
      type: RaspberryConsts.oldRevisionCodes[revisionCode].type,
      revision: RaspberryConsts.oldRevisionCodes[revisionCode].revision,
    } as Partial<Systeminformation.CpuData & Systeminformation.RaspberryRevisionData>;
  } else {
    // new revision code
    const revision = ('00000000' + getValue(lines, 'revision', ':', true).toLowerCase()).substr(-8);
    const memSizeCode = parseInt(hex2bin(revision.substr(2, 1)).substr(5, 3), 2) || 0;
    const manufacturer = RaspberryConsts.manufacturerList[parseInt(revision.substr(3, 1), 10)];
    const processor = RaspberryConsts.processorList[parseInt(revision.substr(4, 1), 10)];
    const typeCode = revision.substr(5, 2) as keyof typeof RaspberryConsts.typeList;

    result = {
      model,
      serial,
      revisionCode,
      memory: 256 * Math.pow(2, memSizeCode),
      manufacturer,
      processor,
      type: {}.hasOwnProperty.call(RaspberryConsts.typeList, typeCode)
        ? RaspberryConsts.typeList[typeCode]
        : '',
      revision: '1.' + revision.substr(7, 1),
    } as Partial<Systeminformation.CpuData & Systeminformation.RaspberryRevisionData>;
  }
  return result;
}
