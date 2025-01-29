// ==================================================================================
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2024
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================

export const linuxTmpFileSystems = [
  'rootfs',
  'unionfs',
  'squashfs',
  'cramfs',
  'initrd',
  'initramfs',
  'devtmpfs',
  'tmpfs',
  'udev',
  'devfs',
  'specfs',
  'type',
  'appimaged',
];

export const diskManufacturers = [
  { pattern: 'WESTERN.*', manufacturer: 'Western Digital' },
  { pattern: '^WDC.*', manufacturer: 'Western Digital' },
  { pattern: 'WD.*', manufacturer: 'Western Digital' },
  { pattern: 'TOSHIBA.*', manufacturer: 'Toshiba' },
  { pattern: 'HITACHI.*', manufacturer: 'Hitachi' },
  { pattern: '^IC.*', manufacturer: 'Hitachi' },
  { pattern: '^HTS.*', manufacturer: 'Hitachi' },
  { pattern: 'SANDISK.*', manufacturer: 'SanDisk' },
  { pattern: 'KINGSTON.*', manufacturer: 'Kingston Technology' },
  { pattern: '^SONY.*', manufacturer: 'Sony' },
  { pattern: 'TRANSCEND.*', manufacturer: 'Transcend' },
  { pattern: 'SAMSUNG.*', manufacturer: 'Samsung' },
  { pattern: '^ST(?!I\\ ).*', manufacturer: 'Seagate' },
  { pattern: '^STI\\ .*', manufacturer: 'SimpleTech' },
  { pattern: '^D...-.*', manufacturer: 'IBM' },
  { pattern: '^IBM.*', manufacturer: 'IBM' },
  { pattern: '^FUJITSU.*', manufacturer: 'Fujitsu' },
  { pattern: '^MP.*', manufacturer: 'Fujitsu' },
  { pattern: '^MK.*', manufacturer: 'Toshiba' },
  { pattern: 'MAXTO.*', manufacturer: 'Maxtor' },
  { pattern: 'PIONEER.*', manufacturer: 'Pioneer' },
  { pattern: 'PHILIPS.*', manufacturer: 'Philips' },
  { pattern: 'QUANTUM.*', manufacturer: 'Quantum Technology' },
  { pattern: 'FIREBALL.*', manufacturer: 'Quantum Technology' },
  { pattern: '^VBOX.*', manufacturer: 'VirtualBox' },
  { pattern: 'CORSAIR.*', manufacturer: 'Corsair Components' },
  { pattern: 'CRUCIAL.*', manufacturer: 'Crucial' },
  { pattern: 'ECM.*', manufacturer: 'ECM' },
  { pattern: 'INTEL.*', manufacturer: 'INTEL' },
  { pattern: 'EVO.*', manufacturer: 'Samsung' },
  { pattern: 'APPLE.*', manufacturer: 'Apple' },
];
