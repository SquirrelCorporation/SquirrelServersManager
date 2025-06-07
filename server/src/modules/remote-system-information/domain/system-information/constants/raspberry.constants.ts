// ==================================================================================
// ----------------------------------------------------------------------------------
// Description:   System Information - library
//                for Node.js
// Copyright:     (c) 2014 - 2024
// Author:        Sebastian Hildebrandt
// ----------------------------------------------------------------------------------
// License:       MIT
// ==================================================================================

// https://www.raspberrypi.org/documentation/hardware/raspberrypi/revision-codes/README.md
export const PI_MODEL_NO = [
  'BCM2708',
  'BCM2709',
  'BCM2710',
  'BCM2711',
  'BCM2712',
  'BCM2835',
  'BCM2836',
  'BCM2837',
  'BCM2837B0',
];
export const oldRevisionCodes = {
  '0002': {
    type: 'B',
    revision: '1.0',
    memory: 256,
    manufacturer: 'Egoman',
    processor: 'BCM2835',
  },
  '0003': {
    type: 'B',
    revision: '1.0',
    memory: 256,
    manufacturer: 'Egoman',
    processor: 'BCM2835',
  },
  '0004': {
    type: 'B',
    revision: '2.0',
    memory: 256,
    manufacturer: 'Sony UK',
    processor: 'BCM2835',
  },
  '0005': {
    type: 'B',
    revision: '2.0',
    memory: 256,
    manufacturer: 'Qisda',
    processor: 'BCM2835',
  },
  '0006': {
    type: 'B',
    revision: '2.0',
    memory: 256,
    manufacturer: 'Egoman',
    processor: 'BCM2835',
  },
  '0007': {
    type: 'A',
    revision: '2.0',
    memory: 256,
    manufacturer: 'Egoman',
    processor: 'BCM2835',
  },
  '0008': {
    type: 'A',
    revision: '2.0',
    memory: 256,
    manufacturer: 'Sony UK',
    processor: 'BCM2835',
  },
  '0009': {
    type: 'A',
    revision: '2.0',
    memory: 256,
    manufacturer: 'Qisda',
    processor: 'BCM2835',
  },
  '000d': {
    type: 'B',
    revision: '2.0',
    memory: 512,
    manufacturer: 'Egoman',
    processor: 'BCM2835',
  },
  '000e': {
    type: 'B',
    revision: '2.0',
    memory: 512,
    manufacturer: 'Sony UK',
    processor: 'BCM2835',
  },
  '000f': {
    type: 'B',
    revision: '2.0',
    memory: 512,
    manufacturer: 'Egoman',
    processor: 'BCM2835',
  },
  '0010': {
    type: 'B+',
    revision: '1.2',
    memory: 512,
    manufacturer: 'Sony UK',
    processor: 'BCM2835',
  },
  '0011': {
    type: 'CM1',
    revision: '1.0',
    memory: 512,
    manufacturer: 'Sony UK',
    processor: 'BCM2835',
  },
  '0012': {
    type: 'A+',
    revision: '1.1',
    memory: 256,
    manufacturer: 'Sony UK',
    processor: 'BCM2835',
  },
  '0013': {
    type: 'B+',
    revision: '1.2',
    memory: 512,
    manufacturer: 'Embest',
    processor: 'BCM2835',
  },
  '0014': {
    type: 'CM1',
    revision: '1.0',
    memory: 512,
    manufacturer: 'Embest',
    processor: 'BCM2835',
  },
  '0015': {
    type: 'A+',
    revision: '1.1',
    memory: 256,
    manufacturer: '512MB	Embest',
    processor: 'BCM2835',
  },
};

export const processorList = ['BCM2835', 'BCM2836', 'BCM2837', 'BCM2711', 'BCM2712'];
export const manufacturerList = ['Sony UK', 'Egoman', 'Embest', 'Sony Japan', 'Embest', 'Stadium'];
export const typeList = {
  '00': 'A',
  '01': 'B',
  '02': 'A+',
  '03': 'B+',
  '04': '2B',
  '05': 'Alpha (early prototype)',
  '06': 'CM1',
  '08': '3B',
  '09': 'Zero',
  '0a': 'CM3',
  '0c': 'Zero W',
  '0d': '3B+',
  '0e': '3A+',
  '0f': 'Internal use only',
  '10': 'CM3+',
  '11': '4B',
  '12': 'Zero 2 W',
  '13': '400',
  '14': 'CM4',
  '15': 'CM4S',
  '16': 'Internal use only',
  '17': '5',
  '18': 'CM5',
  '19': '500',
  '1a': 'CM5 Lite',
};
