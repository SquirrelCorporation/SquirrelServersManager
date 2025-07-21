// ==================================================================================
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2024
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================

import { LINUX_RAM_manufacturers, OSX_RAM_manufacturers } from './memory.consts';

export function getManufacturerDarwin(manId: any) {
  if ({}.hasOwnProperty.call(OSX_RAM_manufacturers, manId)) {
    return OSX_RAM_manufacturers[manId as keyof typeof OSX_RAM_manufacturers];
  }
  return manId;
}

export function getManufacturerLinux(manId: any) {
  const manIdSearch = manId.replace('0x', '').toUpperCase();
  if (manIdSearch.length === 4 && {}.hasOwnProperty.call(LINUX_RAM_manufacturers, manIdSearch)) {
    return LINUX_RAM_manufacturers[manIdSearch as keyof typeof LINUX_RAM_manufacturers];
  }
  return manId;
}
