import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { SsmStatus } from 'ssm-shared-lib';
import { DeviceModel } from '../../../../data/database/model/Device';
import DeviceUseCases from '../../../../services/DeviceUseCases';

describe('DeviceUseCases', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env['MONGO_URI'] as string);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await mongoose.connection.db?.dropDatabase();
  });

  it('should return correct overview stats for the given devices', async () => {
    const devices = [
      new DeviceModel({
        uuid: '1',
        status: SsmStatus.DeviceStatus.ONLINE,
        fqdn: 'device1.example.com',
        ip: '192.168.1.1',
        cpuSpeed: 1000.4,
        mem: 1024,
      }),
      new DeviceModel({
        uuid: '2',
        status: SsmStatus.DeviceStatus.OFFLINE,
        fqdn: 'device2.example.com',
        ip: '192.168.1.2',
        cpuSpeed: 2000.4,
        mem: 2048,
      }),
      new DeviceModel({
        uuid: '3',
        status: SsmStatus.DeviceStatus.UNMANAGED,
        fqdn: '',
        ip: '192.168.1.3',
        cpuSpeed: 1500.4,
        mem: 4096,
      }),
    ];

    await DeviceModel.insertMany(devices);
    const overview = await DeviceUseCases.getDevicesOverview();

    expect(overview.offline).toBe(1);
    expect(overview.online).toBe(1);
    expect(Number.parseFloat(overview.totalCpu.toFixed(1))).toBe(4501.2);
    expect(overview.totalMem).toBe(7); // 7168 / 1024 = 7
    expect(
      overview.overview?.sort((deviceA, deviceB) => deviceA.uuid.localeCompare(deviceB.uuid)),
    ).toEqual([
      {
        name: 'device1.example.com',
        status: SsmStatus.DeviceStatus.ONLINE,
        uuid: '1',
        cpu: 1000.4,
        mem: 1024,
      },
      {
        name: 'device2.example.com',
        status: SsmStatus.DeviceStatus.OFFLINE,
        uuid: '2',
        cpu: 2000.4,
        mem: 2048,
      },
      {
        name: '192.168.1.3',
        status: SsmStatus.DeviceStatus.UNMANAGED,
        uuid: '3',
        cpu: 1500.4,
        mem: 4096,
      },
    ]);
  });

  it('should return correct overview stats for the given devices - complex float', async () => {
    const devices = [
      new DeviceModel({
        uuid: '1',
        status: SsmStatus.DeviceStatus.ONLINE,
        fqdn: 'device1.example.com',
        ip: '192.168.1.1',
        cpuSpeed: 1400.412,
        mem: 1024.213,
      }),
      new DeviceModel({
        uuid: '2',
        status: SsmStatus.DeviceStatus.OFFLINE,
        fqdn: 'device2.example.com',
        ip: '192.168.1.2',
        cpuSpeed: 2500.4123123,
        mem: 2048.123,
      }),
      new DeviceModel({
        uuid: '3',
        status: SsmStatus.DeviceStatus.UNMANAGED,
        fqdn: '',
        ip: '192.168.1.3',
        cpuSpeed: 1501.4123123,
        mem: 4096.13134512,
      }),
    ];

    await DeviceModel.insertMany(devices);
    const overview = await DeviceUseCases.getDevicesOverview();

    expect(overview.offline).toBe(1);
    expect(overview.online).toBe(1);
    expect(Number.parseFloat(overview.totalCpu.toFixed(1))).toBe(5402.2);
    expect(Math.round(overview.totalMem)).toBe(7); // 7168 / 1024 = 7
    expect(
      overview.overview?.sort((deviceA, deviceB) => deviceA.uuid.localeCompare(deviceB.uuid)),
    ).toEqual([
      {
        name: 'device1.example.com',
        status: SsmStatus.DeviceStatus.ONLINE,
        uuid: '1',
        cpu: 1400.412,
        mem: 1024.213,
      },
      {
        name: 'device2.example.com',
        status: SsmStatus.DeviceStatus.OFFLINE,
        uuid: '2',
        cpu: 2500.4123123,
        mem: 2048.123,
      },
      {
        name: '192.168.1.3',
        status: SsmStatus.DeviceStatus.UNMANAGED,
        uuid: '3',
        cpu: 1501.4123123,
        mem: 4096.13134512,
      },
    ]);
  });

  it('should return NaN for totalCpu and totalMem if no devices exist', async () => {
    const overview = await DeviceUseCases.getDevicesOverview();

    expect(overview.offline).toBe(0);
    expect(overview.online).toBe(0);
    expect(overview.totalCpu).toBeNaN();
    expect(overview.totalMem).toBeNaN();
    expect(overview.overview).toEqual([]);
  });

  it('should handle a large number of devices correctly', async () => {
    const devices = Array.from({ length: 100 }, (_, idx) => ({
      uuid: `${idx}`,
      status: idx % 2 === 0 ? SsmStatus.DeviceStatus.ONLINE : SsmStatus.DeviceStatus.OFFLINE,
      fqdn: `device${idx}.example.com`,
      ip: `192.168.1.${idx}`,
      cpuSpeed: idx * 10,
      mem: idx * 512,
    }));

    await DeviceModel.insertMany(devices);
    const overview = await DeviceUseCases.getDevicesOverview();

    expect(overview.offline).toBe(50);
    expect(overview.online).toBe(50);

    const expectedTotalCpu = devices.reduce((acc, device) => acc + device.cpuSpeed, 0);
    expect(overview.totalCpu).toBe(expectedTotalCpu);

    const expectedTotalMem = devices.reduce((acc, device) => acc + device.mem, 0);
    expect(overview.totalMem).toBe(expectedTotalMem / 1024);
  });
});
