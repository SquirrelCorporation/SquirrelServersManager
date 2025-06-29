// Proxmox-API Interactive proxmox API for developpers how do not like reading docs
// Copyright (C) 2020-2022  Chemouni Uriel <uchemouni@gmail.com>
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { ProxmoxModel } from 'ssm-shared-lib';

// 'mem', // ERROR: VM XXX qmp command 'human-monitor-command' failed - got timeout
// 'tlb', // ERROR: VM XXX qmp command 'human-monitor-command' failed - got timeout

export const VALID_QEMU_INFO_SIMPLE = [
  'backup',
  'balloon',
  'block-jobs',
  'blockstats',
  'capture',
  'chardev',
  'cpus',
  'cpustats',
  'dump',
  'history',
  'hotpluggable-cpus',
  'ioapic',
  'iothreads',
  'irq',
  'jit',
  'kvm',
  'memdev',
  'memory-devices',
  'memory_size_summary',
  'mice',
  'migrate',
  'migrate_cache_size',
  'migrate_capabilities',
  'migrate_parameters',
  'name',
  'network',
  'numa',
  'opcount',
  'pci',
  'pic',
  'profile',
  'qdm',
  'qtree',
  'ramblock',
  'rdma',
  'roms',
  'savevm',
  'sev',
  'snapshots',
  'spice',
  'status',
  'tpm',
  'usb',
  'usbhost',
  'usernet',
  'uuid',
  'version',
  'vm-generation-id',
  'vnc',
] as const;

export const VALID_QEMU_INFO_OPTION = [
  'block',
  'lapic',
  'mtree',
  'qom-tree',
  'registers',
  'sync-profile',
  'trace-events',
] as const;

export const VALID_QEMU_INFO_PARAM = [
  'rocker-of-dpa-flows',
  'rocker-of-dpa-groups',
  'rocker-ports',
] as const;

export type QemuInfoSimple = (typeof VALID_QEMU_INFO_SIMPLE)[number];
export type QemuInfoOption = (typeof VALID_QEMU_INFO_OPTION)[number];
export type QemuInfoParam = (typeof VALID_QEMU_INFO_PARAM)[number];

export interface USBHostInfo {
  bus: number;
  addr: number;
  port: string;
  speed: string;
  class: string;
  vendorId: string;
  productId: string;
  name: string;
}

export interface USBInfo {
  device: string;
  port: string;
  speed: string;
  product: string;
  id: string;
}

export class QmMonitor {
  private _vmid: number;
  private _node: string;
  monitor: (command: string) => Promise<string>;

  constructor(
    private proxmox: ProxmoxModel.Api,
    node: string,
    vmid: number,
  ) {
    this._node = node;
    this._vmid = vmid;
    const call = proxmox.nodes.$(node).qemu.$(vmid).monitor.$post;
    this.monitor = (command) => {
      // this.calls++
      return call({ command });
    };
  }

  public get vmid(): number {
    return this._vmid;
  }

  public get node(): string {
    return this._node;
  }

  info(type: QemuInfoSimple): Promise<string>;
  info(type: QemuInfoOption, ...args: string[]): Promise<string>;
  info(type: QemuInfoParam, arg1: string, ...args: string[]): Promise<string>;
  async info(
    type: QemuInfoSimple | QemuInfoOption | QemuInfoParam,
    ...args: string[]
  ): Promise<string> {
    let ext = args.join(' ');
    if (ext) {
      ext = ' ' + ext;
    }
    return this.monitor(`info ${type}${ext}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async infoUsb(filters?: {
    vendorId?: RegExp;
    productId?: RegExp;
    name?: RegExp;
  }): Promise<USBInfo[]> {
    //Device 1.1, Port 1, Speed 1.5 Mb/s, Product USB OPTICAL MOUSE , ID: mouse
    //Device 1.0, Port 2, Speed 12 Mb/s, Product Gaming KB , ID: keyboard
    const text = await this.info('usb');
    const expected = (text.match(/[\r\n]+/g) || []).length;
    const matches = text.matchAll(
      /Device ([\d.]+), Port ([\d.]+), Speed ([\d KMGTbfs\/.]+)(?:, Product (.+), ID: (.+))?/g,
    );
    const results = [...matches].map((m) => ({
      device: m[1],
      port: m[2],
      speed: m[3],
      product: m[4],
      id: m[5],
    }));
    if (expected !== results.length) {
      throw Error(
        `Identify ${results.length} usb element should find ${expected} Error in API, Failed to parse:\n${text}`,
      );
    }
    return results;
  }

  async deviceDel(id: string): Promise<string> {
    // return `Error: Device '${id}' not found`
    // console.log(text);
    return await this.monitor(`device_del ${id}`);
  }

  /**
   * list available usb on host
   */
  async infoUsbhost(filters?: {
    vendorId?: RegExp;
    productId?: RegExp;
    name?: RegExp;
  }): Promise<USBHostInfo[]> {
    const text = await this.info('usbhost');
    const matches = text.matchAll(
      /Bus (\d+), Addr (\d+), Port ([\d.]+), Speed ([\d KMGTbfs\/.]+)[\r\n]\s+Class (\d+): USB device ([0-9a-f]{4}):([0-9a-f]{4}), (.*)/gm,
    );
    let results = [...matches].map((m) => ({
      bus: Number(m[1]),
      addr: Number(m[2]),
      port: m[3],
      speed: m[4],
      class: m[5],
      vendorId: m[6],
      productId: m[7],
      name: m[8],
    }));
    if (filters) {
      results = results.filter((usb) => {
        if (filters.name && !filters.name.test(usb.name)) {
          return false;
        }
        if (filters.vendorId && !filters.vendorId.test(usb.name)) {
          return false;
        }
        if (filters.productId && !filters.productId.test(usb.name)) {
          return false;
        }
        return true;
      });
    }
    return results;
  }
  //
  // https://www.linux-kvm.org/page/USB
  // https://www.qemu.org/docs/master/qemu-doc.html
  async deviceAddById(id: string, params: { vendorId: string; productId: string }): Promise<any> {
    // TODO: check param values
    params.vendorId = params.vendorId.replace(/0x/i, '');
    params.productId = params.productId.replace(/0x/i, '');
    // if (text)
    //    console.log(`deviceAddById return: '${text}'`);
    return await this.monitor(
      `device_add usb-host,vendorid=0x${params.vendorId},productid=0x${params.productId},id=${id}`,
    );
  }

  // usb-host,hostbus=2,hostport=4,id=front2
  // device_add driver[,prop=value][,...] -- add device, like -device on the command line
  async deviceAddByPort(id: string, params: { bus: number; port: string }): Promise<any> {
    // TODO: check param values
    const text = await this.monitor(
      `device_add usb-host,hostbus=${params.bus},hostport=${params.port},id=${id}`,
    );
    // `Duplicate ID '${id}' for device\nTry "help device_add" for more information`
    //if (text)
    //    console.log(`deviceAddByPort return: '${text}'`);
    return text;
  }

  async deviceAddMissing(
    id: string,
    filters: { vendorId?: RegExp; productId?: RegExp; name?: RegExp },
  ): Promise<any> {
    const connected = await this.infoUsb();
    if (connected.findIndex((v) => v.id === id) >= 0) {
      throw Error(`USB device ${id} already present`);
    }
    {
      const usbs = await this.infoUsbhost(filters);
      for (let i = 0; i < usbs.length; i++) {
        const id2 = i ? `${id}-${i}` : id;
        // console.log(`connecting '${usbs[i].name}' as ${id2}`);
        this.deviceAddByPort(id2, usbs[i]);
      }
    }
  }
}
