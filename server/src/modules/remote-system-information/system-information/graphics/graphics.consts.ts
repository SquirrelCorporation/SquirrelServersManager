export const videoTypes = {
  '-2': 'UNINITIALIZED',
  '-1': 'OTHER',
  '0': 'HD15',
  '1': 'SVIDEO',
  '2': 'Composite video',
  '3': 'Component video',
  '4': 'DVI',
  '5': 'HDMI',
  '6': 'LVDS',
  '8': 'D_JPN',
  '9': 'SDI',
  '10': 'DP',
  '11': 'DP embedded',
  '12': 'UDI',
  '13': 'UDI embedded',
  '14': 'SDTVDONGLE',
  '15': 'MIRACAST',
  '2147483648': 'INTERNAL',
};

export const manufacturers = [
  { pattern: '^LG.+', manufacturer: 'LG' },
  { pattern: '^BENQ.+', manufacturer: 'BenQ' },
  { pattern: '^ASUS.+', manufacturer: 'Asus' },
  { pattern: '^DELL.+', manufacturer: 'Dell' },
  { pattern: '^SAMSUNG.+', manufacturer: 'Samsung' },
  { pattern: '^VIEWSON.+', manufacturer: 'ViewSonic' },
  { pattern: '^SONY.+', manufacturer: 'Sony' },
  { pattern: '^ACER.+', manufacturer: 'Acer' },
  { pattern: '^AOC.+', manufacturer: 'AOC Monitors' },
  { pattern: '^HP.+', manufacturer: 'HP' },
  { pattern: '^EIZO.?', manufacturer: 'Eizo' },
  { pattern: '^PHILIPS.?', manufacturer: 'Philips' },
  { pattern: '^IIYAMA.?', manufacturer: 'Iiyama' },
  { pattern: '^SHARP.?', manufacturer: 'Sharp' },
  { pattern: '^NEC.?', manufacturer: 'NEC' },
  { pattern: '^LENOVO.?', manufacturer: 'Lenovo' },
  { pattern: 'COMPAQ.?', manufacturer: 'Compaq' },
  { pattern: 'APPLE.?', manufacturer: 'Apple' },
  { pattern: 'INTEL.?', manufacturer: 'Intel' },
  { pattern: 'AMD.?', manufacturer: 'AMD' },
  { pattern: 'NVIDIA.?', manufacturer: 'NVDIA' },
];

export const vendors = {
  '610': 'Apple',
  '1e6d': 'LG',
  '10ac': 'DELL',
  '4dd9': 'Sony',
  '38a3': 'NEC',
};

export const families = {
  spdisplays_mtlgpufamilymac1: 'mac1',
  spdisplays_mtlgpufamilymac2: 'mac2',
  spdisplays_mtlgpufamilyapple1: 'apple1',
  spdisplays_mtlgpufamilyapple2: 'apple2',
  spdisplays_mtlgpufamilyapple3: 'apple3',
  spdisplays_mtlgpufamilyapple4: 'apple4',
  spdisplays_mtlgpufamilyapple5: 'apple5',
  spdisplays_mtlgpufamilyapple6: 'apple6',
  spdisplays_mtlgpufamilyapple7: 'apple7',
  spdisplays_metalfeaturesetfamily11: 'family1_v1',
  spdisplays_metalfeaturesetfamily12: 'family1_v2',
  spdisplays_metalfeaturesetfamily13: 'family1_v3',
  spdisplays_metalfeaturesetfamily14: 'family1_v4',
  spdisplays_metalfeaturesetfamily21: 'family2_v1',
};
