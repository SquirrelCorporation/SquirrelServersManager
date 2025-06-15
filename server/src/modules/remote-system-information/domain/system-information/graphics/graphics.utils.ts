import { Systeminformation } from 'ssm-shared-lib';
import { noop } from '../utils/system-utils';
import * as util from '../utils/system-utils';
import { families, manufacturers, vendors, videoTypes } from './graphics.consts';

export function getVendorFromModel(model: string) {
  let result = '';
  if (model) {
    model = model.toUpperCase();
    manufacturers.forEach((manufacturer) => {
      const re = RegExp(manufacturer.pattern);
      if (re.test(model)) {
        result = manufacturer.manufacturer;
      }
    });
  }
  return result;
}

export function getVendorFromId(id: string) {
  return vendors[id as keyof typeof vendors] || '';
}

export function vendorToId(str: string) {
  let result = '';
  str = (str || '').toLowerCase();
  if (str.indexOf('apple') >= 0) {
    result = '0x05ac';
  } else if (str.indexOf('nvidia') >= 0) {
    result = '0x10de';
  } else if (str.indexOf('intel') >= 0) {
    result = '0x8086';
  } else if (str.indexOf('ati') >= 0 || str.indexOf('amd') >= 0) {
    result = '0x1002';
  }

  return result;
}

export function getMetalVersion(id: string) {
  return families[id as keyof typeof families] || '';
}

export function safeParseNumber(value: any) {
  if ([null, undefined].includes(value)) {
    return value;
  }
  return parseFloat(value);
}

export function mergeControllerNvidia(
  controller: Systeminformation.GraphicsControllerData,
  nvidia: any,
) {
  if (nvidia.driverVersion) {
    controller.driverVersion = nvidia.driverVersion;
  }
  if (nvidia.subDeviceId) {
    controller.subDeviceId = nvidia.subDeviceId;
  }
  if (nvidia.name) {
    controller.name = nvidia.name;
  }
  if (nvidia.pciBus) {
    controller.pciBus = nvidia.pciBus;
  }
  if (nvidia.fanSpeed) {
    controller.fanSpeed = nvidia.fanSpeed;
  }
  if (nvidia.memoryTotal) {
    controller.memoryTotal = nvidia.memoryTotal;
    controller.vram = nvidia.memoryTotal;
    controller.vramDynamic = false;
  }
  if (nvidia.memoryUsed) {
    controller.memoryUsed = nvidia.memoryUsed;
  }
  if (nvidia.memoryFree) {
    controller.memoryFree = nvidia.memoryFree;
  }
  if (nvidia.utilizationGpu) {
    controller.utilizationGpu = nvidia.utilizationGpu;
  }
  if (nvidia.utilizationMemory) {
    controller.utilizationMemory = nvidia.utilizationMemory;
  }
  if (nvidia.temperatureGpu) {
    controller.temperatureGpu = nvidia.temperatureGpu;
  }
  if (nvidia.temperatureMemory) {
    controller.temperatureMemory = nvidia.temperatureMemory;
  }
  if (nvidia.powerDraw) {
    controller.powerDraw = nvidia.powerDraw;
  }
  if (nvidia.powerLimit) {
    controller.powerLimit = nvidia.powerLimit;
  }
  if (nvidia.clockCore) {
    controller.clockCore = nvidia.clockCore;
  }
  if (nvidia.clockMemory) {
    controller.clockMemory = nvidia.clockMemory;
  }
  return controller;
}

export function parseLinesLinuxEdid(edid: string) {
  // parsen EDID
  // --> model
  // --> resolutionx
  // --> resolutiony
  // --> builtin = false
  // --> pixeldepth (?)
  // --> sizex
  // --> sizey
  const result: Partial<Systeminformation.GraphicsDisplayData> = {
    vendor: '',
    model: '',
    deviceName: '',
    main: false,
    builtin: false,
    connection: '',
    sizeX: null,
    sizeY: null,
    pixelDepth: null,
    resolutionX: null,
    resolutionY: null,
    currentResX: null,
    currentResY: null,
    positionX: 0,
    positionY: 0,
    currentRefreshRate: null,
  };
  // find first "Detailed Timing Description"
  let start = 108;
  if (edid.substr(start, 6) === '000000') {
    start += 36;
  }
  if (edid.substr(start, 6) === '000000') {
    start += 36;
  }
  if (edid.substr(start, 6) === '000000') {
    start += 36;
  }
  if (edid.substr(start, 6) === '000000') {
    start += 36;
  }
  result.resolutionX = parseInt('0x0' + edid.substr(start + 8, 1) + edid.substr(start + 4, 2));
  result.resolutionY = parseInt('0x0' + edid.substr(start + 14, 1) + edid.substr(start + 10, 2));
  result.sizeX = parseInt('0x0' + edid.substr(start + 28, 1) + edid.substr(start + 24, 2));
  result.sizeY = parseInt('0x0' + edid.substr(start + 29, 1) + edid.substr(start + 26, 2));
  // monitor name
  start = edid.indexOf('000000fc00'); // find first "Monitor Description Data"
  if (start >= 0) {
    let model_raw = edid.substr(start + 10, 26);
    if (model_raw.indexOf('0a') !== -1) {
      model_raw = model_raw.substr(0, model_raw.indexOf('0a'));
    }
    try {
      if (model_raw.length > 2) {
        result.model = model_raw
          ?.match(/.{1,2}/g)
          ?.map((v) => {
            return String.fromCharCode(parseInt(v, 16));
          })
          .join('');
      }
    } catch {
      util.noop();
    }
  } else {
    result.model = '';
  }
  return result;
}

export function parseLinesLinuxDisplays(lines: string[], depth: number) {
  const displays: Partial<Systeminformation.GraphicsDisplayData>[] = [];
  let currentDisplay: Partial<Systeminformation.GraphicsDisplayData> = {
    vendor: '',
    model: '',
    deviceName: '',
    main: false,
    builtin: false,
    connection: '',
    sizeX: null,
    sizeY: null,
    pixelDepth: null,
    resolutionX: null,
    resolutionY: null,
    currentResX: null,
    currentResY: null,
    positionX: 0,
    positionY: 0,
    currentRefreshRate: null,
  };
  let is_edid = false;
  let is_current = false;
  let edid_raw = '';
  let start = 0;
  for (let i = 1; i < lines.length; i++) {
    // start with second line
    if ('' !== lines[i].trim()) {
      if (
        ' ' !== lines[i][0] &&
        '\t' !== lines[i][0] &&
        lines[i].toLowerCase().indexOf(' connected ') !== -1
      ) {
        // first line of new entry
        if (
          currentDisplay.model ||
          currentDisplay.main ||
          currentDisplay.builtin ||
          currentDisplay.connection ||
          currentDisplay.sizeX !== null ||
          currentDisplay.pixelDepth !== null ||
          currentDisplay.resolutionX !== null
        ) {
          // push last display to array
          displays.push(currentDisplay);
          currentDisplay = {
            vendor: '',
            model: '',
            main: false,
            builtin: false,
            connection: '',
            sizeX: null,
            sizeY: null,
            pixelDepth: null,
            resolutionX: null,
            resolutionY: null,
            currentResX: null,
            currentResY: null,
            positionX: 0,
            positionY: 0,
            currentRefreshRate: null,
          };
        }
        const parts = lines[i].split(' ');
        currentDisplay.connection = parts[0];
        currentDisplay.main = lines[i].toLowerCase().indexOf(' primary ') >= 0;
        currentDisplay.builtin = parts[0].toLowerCase().indexOf('edp') >= 0;
      }

      // try to read EDID information
      if (is_edid) {
        if (lines[i].search(/\S|$/) > start) {
          edid_raw += lines[i].toLowerCase().trim();
        } else {
          // parsen EDID
          const edid_decoded = parseLinesLinuxEdid(edid_raw);
          currentDisplay.vendor = edid_decoded.vendor;
          currentDisplay.model = edid_decoded.model;
          currentDisplay.resolutionX = edid_decoded.resolutionX;
          currentDisplay.resolutionY = edid_decoded.resolutionY;
          currentDisplay.sizeX = edid_decoded.sizeX;
          currentDisplay.sizeY = edid_decoded.sizeY;
          currentDisplay.pixelDepth = depth;
          is_edid = false;
        }
      }
      if (lines[i].toLowerCase().indexOf('edid:') >= 0) {
        is_edid = true;
        start = lines[i].search(/\S|$/);
      }
      if (lines[i].toLowerCase().indexOf('*current') >= 0) {
        const parts1 = lines[i].split('(');
        if (parts1 && parts1.length > 1 && parts1[0].indexOf('x') >= 0) {
          const resParts = parts1[0].trim().split('x');
          currentDisplay.currentResX = util.toInt(resParts[0]);
          currentDisplay.currentResY = util.toInt(resParts[1]);
        }
        is_current = true;
      }
      if (
        is_current &&
        lines[i].toLowerCase().indexOf('clock') >= 0 &&
        lines[i].toLowerCase().indexOf('hz') >= 0 &&
        lines[i].toLowerCase().indexOf('v: height') >= 0
      ) {
        const parts1 = lines[i].split('clock');
        if (parts1 && parts1.length > 1 && parts1[1].toLowerCase().indexOf('hz') >= 0) {
          currentDisplay.currentRefreshRate = util.toInt(parts1[1]);
        }
        is_current = false;
      }
    }
  }

  // pushen displays
  if (
    currentDisplay.model ||
    currentDisplay.main ||
    currentDisplay.builtin ||
    currentDisplay.connection ||
    currentDisplay.sizeX !== null ||
    currentDisplay.pixelDepth !== null ||
    currentDisplay.resolutionX !== null
  ) {
    // still information there
    displays.push(currentDisplay);
  }
  return displays;
}

export function parseLinesLinuxClinfo(
  controllers: Systeminformation.GraphicsControllerData[],
  lines: string[],
) {
  const fieldPattern = /\[([^\]]+)\]\s+(\w+)\s+(.*)/;
  const devices: Record<string, any> = lines.reduce((devices: any, line) => {
    const field = fieldPattern.exec(line.trim());
    if (field) {
      const index = field[1] as keyof typeof devices;
      if (!devices[index]) {
        devices[index] = {};
      }
      devices[index][field[2]] = field[3];
    }
    return devices;
  }, {});
  for (const deviceId in devices) {
    const device = devices[deviceId];
    if (device['CL_DEVICE_TYPE'] === 'CL_DEVICE_TYPE_GPU') {
      let busAddress;
      if (device['CL_DEVICE_TOPOLOGY_AMD']) {
        const bdf = device['CL_DEVICE_TOPOLOGY_AMD'].match(/[a-zA-Z0-9]+:\d+\.\d+/);
        if (bdf) {
          busAddress = bdf[0];
        }
      } else if (device['CL_DEVICE_PCI_BUS_ID_NV'] && device['CL_DEVICE_PCI_SLOT_ID_NV']) {
        const bus = parseInt(device['CL_DEVICE_PCI_BUS_ID_NV']);
        const slot = parseInt(device['CL_DEVICE_PCI_SLOT_ID_NV']);
        if (!isNaN(bus) && !isNaN(slot)) {
          // eslint-disable-next-line no-bitwise
          const b = bus & 0xff;
          // eslint-disable-next-line no-bitwise
          const d = (slot >> 3) & 0xff;
          // eslint-disable-next-line no-bitwise
          const f = slot & 0x07;
          busAddress = `${b.toString().padStart(2, '0')}:${d.toString().padStart(2, '0')}.${f}`;
        }
      }
      if (busAddress) {
        let controller = controllers.find((controller) => controller.busAddress === busAddress);
        if (!controller) {
          controller = {
            vendor: '',
            model: '',
            bus: '',
            busAddress,
            vram: null,
            vramDynamic: false,
          };
          controllers.push(controller);
        }
        controller.vendor = device['CL_DEVICE_VENDOR'];
        if (device['CL_DEVICE_BOARD_NAME_AMD']) {
          controller.model = device['CL_DEVICE_BOARD_NAME_AMD'];
        } else {
          controller.model = device['CL_DEVICE_NAME'];
        }
        const memory = parseInt(device['CL_DEVICE_GLOBAL_MEM_SIZE']);
        if (!isNaN(memory)) {
          controller.vram = Math.round(memory / 1024 / 1024);
        }
      }
    }
  }
  return controllers;
}

export function parseLinesDarwin(graphicsArr: any[]) {
  const res: Systeminformation.GraphicsData = {
    controllers: [],
    displays: [],
  };
  try {
    graphicsArr.forEach((item) => {
      // controllers
      const bus =
        (item.sppci_bus || '').indexOf('builtin') > -1
          ? 'Built-In'
          : (item.sppci_bus || '').indexOf('pcie') > -1
            ? 'PCIe'
            : '';
      const vram =
        (parseInt(item.spdisplays_vram || '', 10) || 0) *
        ((item.spdisplays_vram || '').indexOf('GB') > -1 ? 1024 : 1);
      const vramDyn =
        (parseInt(item.spdisplays_vram_shared || '', 10) || 0) *
        ((item.spdisplays_vram_shared || '').indexOf('GB') > -1 ? 1024 : 1);
      const metalVersion = getMetalVersion(
        item.spdisplays_metal || item.spdisplays_metalfamily || '',
      );
      res.controllers.push({
        vendor: getVendorFromModel(item.spdisplays_vendor || '') || item.spdisplays_vendor || '',
        model: item.sppci_model || '',
        bus,
        vramDynamic: bus === 'Built-In',
        vram: vram || vramDyn || null,
        deviceId: item['spdisplays_device-id'] || '',
        vendorId:
          item['spdisplays_vendor-id'] ||
          vendorToId((item['spdisplays_vendor'] || '') + (item.sppci_model || '')),
        external: item.sppci_device_type === 'spdisplays_egpu',
        cores: item['sppci_cores'] || null,
        metalVersion,
      });

      // displays
      if (item.spdisplays_ndrvs && item.spdisplays_ndrvs.length) {
        item.spdisplays_ndrvs.forEach((displayItem: any) => {
          const connectionType = displayItem['spdisplays_connection_type'] || '';
          const currentResolutionParts = (displayItem['_spdisplays_resolution'] || '').split('@');
          const currentResolution = currentResolutionParts[0].split('x');
          const pixelParts = (displayItem['_spdisplays_pixels'] || '').split('x');
          const pixelDepthString = displayItem['spdisplays_depth'] || '';
          const serial =
            displayItem['_spdisplays_display-serial-number'] ||
            displayItem['_spdisplays_display-serial-number2'] ||
            null;
          res.displays.push({
            deviceName: '',
            vendor:
              getVendorFromId(displayItem['_spdisplays_display-vendor-id'] || '') ||
              getVendorFromModel(displayItem['_name'] || ''),
            vendorId: displayItem['_spdisplays_display-vendor-id'] || '',
            model: displayItem['_name'] || '',
            productionYear: displayItem['_spdisplays_display-year'] || null,
            serial: serial !== '0' ? serial : null,
            displayId: displayItem['_spdisplays_displayID'] || null,
            main: displayItem['spdisplays_main']
              ? displayItem['spdisplays_main'] === 'spdisplays_yes'
              : false,
            builtin: (displayItem['spdisplays_display_type'] || '').indexOf('built-in') > -1,
            connection:
              connectionType.indexOf('_internal') > -1
                ? 'Internal'
                : connectionType.indexOf('_displayport') > -1
                  ? 'Display Port'
                  : connectionType.indexOf('_hdmi') > -1
                    ? 'HDMI'
                    : null,
            sizeX: null,
            sizeY: null,
            pixelDepth:
              pixelDepthString === 'CGSThirtyBitColor'
                ? 30
                : pixelDepthString === 'CGSThirtytwoBitColor'
                  ? 32
                  : pixelDepthString === 'CGSTwentyfourBitColor'
                    ? 24
                    : null,
            resolutionX: pixelParts.length > 1 ? parseInt(pixelParts[0], 10) : null,
            resolutionY: pixelParts.length > 1 ? parseInt(pixelParts[1], 10) : null,
            currentResX: currentResolution.length > 1 ? parseInt(currentResolution[0], 10) : null,
            currentResY: currentResolution.length > 1 ? parseInt(currentResolution[1], 10) : null,
            positionX: 0,
            positionY: 0,
            currentRefreshRate:
              currentResolutionParts.length > 1 ? parseInt(currentResolutionParts[1], 10) : null,
          });
        });
      }
    });
    return res;
  } catch {
    return res;
  }
}

export function parseLinesWindowsDisplaysPowershell(
  ssections: any[],
  msections: any[],
  dsections: any[],
  tsections: any[],
  isections: any[],
) {
  const displays: Partial<Systeminformation.GraphicsDisplayData>[] = [];
  let vendor = '';
  let model = '';
  let deviceID = '';
  let resolutionX = 0;
  let resolutionY = 0;
  if (dsections && dsections.length) {
    const linesDisplay = dsections[0].split('\n');
    vendor = util.getValue(linesDisplay, 'MonitorManufacturer', ':');
    model = util.getValue(linesDisplay, 'Name', ':');
    deviceID = util.getValue(linesDisplay, 'PNPDeviceID', ':').replace(/&amp;/g, '&').toLowerCase();
    resolutionX = util.toInt(util.getValue(linesDisplay, 'ScreenWidth', ':'));
    resolutionY = util.toInt(util.getValue(linesDisplay, 'ScreenHeight', ':'));
  }
  for (let i = 0; i < ssections.length; i++) {
    if (ssections[i].trim() !== '') {
      ssections[i] = 'BitsPerPixel ' + ssections[i];
      msections[i] = 'Active ' + msections[i];
      // tsections can be empty OR undefined on earlier versions of powershell (<=2.0)
      // Tag connection type as UNKNOWN by default if this information is missing
      if (tsections.length === 0 || tsections[i] === undefined) {
        tsections[i] = 'Unknown';
      }
      const linesScreen = ssections[i].split('\n');
      const linesMonitor = msections[i].split('\n');

      const linesConnection = tsections[i].split('\n');
      const bitsPerPixel = util.getValue(linesScreen, 'BitsPerPixel');
      const bounds = util
        .getValue(linesScreen, 'Bounds')
        .replace('{', '')
        .replace('}', '')
        .replace(/=/g, ':')
        .split(',');
      const primary = util.getValue(linesScreen, 'Primary');
      const sizeX = util.getValue(linesMonitor, 'MaxHorizontalImageSize');
      const sizeY = util.getValue(linesMonitor, 'MaxVerticalImageSize');
      const instanceName = util.getValue(linesMonitor, 'InstanceName').toLowerCase();
      const videoOutputTechnology = util.getValue(linesConnection, 'VideoOutputTechnology');
      const deviceName = util.getValue(linesScreen, 'DeviceName');
      let displayVendor = '';
      let displayModel = '';
      isections.forEach((element) => {
        if (
          element.instanceId.toLowerCase().startsWith(instanceName) &&
          vendor.startsWith('(') &&
          model.startsWith('PnP')
        ) {
          displayVendor = element.vendor;
          displayModel = element.model;
        }
      });
      displays.push({
        vendor: instanceName.startsWith(deviceID) && displayVendor === '' ? vendor : displayVendor,
        model: instanceName.startsWith(deviceID) && displayModel === '' ? model : displayModel,
        deviceName,
        main: primary.toLowerCase() === 'true',
        builtin: videoOutputTechnology === '2147483648',
        connection:
          videoOutputTechnology && videoTypes[videoOutputTechnology as keyof typeof videoTypes]
            ? videoTypes[videoOutputTechnology as keyof typeof videoTypes]
            : '',
        resolutionX: util.toInt(util.getValue(bounds, 'Width', ':')),
        resolutionY: util.toInt(util.getValue(bounds, 'Height', ':')),
        sizeX: sizeX ? parseInt(sizeX, 10) : null,
        sizeY: sizeY ? parseInt(sizeY, 10) : null,
        pixelDepth: bitsPerPixel,
        currentResX: util.toInt(util.getValue(bounds, 'Width', ':')),
        currentResY: util.toInt(util.getValue(bounds, 'Height', ':')),
        positionX: util.toInt(util.getValue(bounds, 'X', ':')),
        positionY: util.toInt(util.getValue(bounds, 'Y', ':')),
      });
    }
  }
  if (ssections.length === 0) {
    displays.push({
      vendor,
      model,
      main: true,
      sizeX: null,
      sizeY: null,
      resolutionX,
      resolutionY,
      pixelDepth: null,
      currentResX: resolutionX,
      currentResY: resolutionY,
      positionX: 0,
      positionY: 0,
    });
  }
  return displays;
}

export function plistReader(output) {
  const lines = output.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].indexOf(' = ') >= 0) {
      const lineParts = lines[i].split(' = ');
      lineParts[0] = lineParts[0].trim();
      if (!lineParts[0].startsWith('"')) {
        lineParts[0] = '"' + lineParts[0] + '"';
      }
      lineParts[1] = lineParts[1].trim();
      if (lineParts[1].indexOf('"') === -1 && lineParts[1].endsWith(';')) {
        const valueString = lineParts[1].substring(0, lineParts[1].length - 1);
        if (!util.strIsNumeric(valueString)) {
          lineParts[1] = `"${valueString}";`;
        }
      }
      if (lineParts[1].indexOf('"') >= 0 && lineParts[1].endsWith(';')) {
        const valueString = lineParts[1].substring(0, lineParts[1].length - 1).replace(/"/g, '');
        if (util.strIsNumeric(valueString)) {
          lineParts[1] = `${valueString};`;
        }
      }
      lines[i] = lineParts.join(' : ');
    }
    lines[i] = lines[i].replace(/\(/g, '[').replace(/\)/g, ']').replace(/;/g, ',').trim();
    if (lines[i].startsWith('}') && lines[i - 1] && lines[i - 1].endsWith(',')) {
      lines[i - 1] = lines[i - 1].substring(0, lines[i - 1].length - 1);
    }
  }
  output = lines.join('');
  let obj = {};
  try {
    obj = JSON.parse(output);
  } catch {
    noop();
  }
  return obj;
}
