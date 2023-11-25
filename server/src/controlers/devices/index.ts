import express from 'express';
import {parse} from "url";
import DeviceRepo from "../../database/repository/DeviceRepo";
import Device, {Status} from "../../database/model/Device";
import DeviceStatRepo from "../../database/repository/DeviceStatRepo";
import API from '../../typings';
const router = express.Router();

router.post(`/`, async (req, res) => {
  const createdDevice = await DeviceRepo.create({
  } as Device);

  res.send({
    success: true,
    data: {
      id: createdDevice.uuid,
    }
  })
});

router.post(`/:id`, async (req, res) => {
  const device = await DeviceRepo.findOneById(req.params.id);
  if (device == null) {
    res.status(404).send({
      success: false
    })
    return;
  }
  if (req.body.ip) device.ip = req.body.ip;
  if (req.body.hostname) device.hostname = req.body.hostname;
  if (req.body.uptime) device.uptime = req.body.uptime;
  if (req.body.os.type) device.os_type = req.body.os.type;
  if (req.body.os.arch) device.os_arch = req.body.os.arch;
  if (req.body.os.platform) device.os_platform = req.body.os.platform;
  if (req.body.os.originalOsName) device.os_original_name = req.body.os.originalOsName;
  device.status = Status.ONLINE;
  await DeviceRepo.update(device);
  const deviceStat = await DeviceStatRepo.findLatestStat(device);
  if (!deviceStat || !deviceStat.createdAt || ((new Date().getDate() - deviceStat.createdAt.getDate()) > 60 * 60 * 1000)) {
    console.log("Creating new device stat record...");
    await DeviceStatRepo.create({
      device: device,
      storage_total_gb: req.body.storage.totalGb,
      storage_used_gb: req.body.storage.usedGb,
      storage_free_gb: req.body.storage.freeGb,
      storage_used_percentage: req.body.storage.usedPercentage,
      storage_free_percentage: req.body.storage.freePercentage,
      cpu_usage: req.body.cpu.usage,
      mem_total_mb: req.body.mem.totalMemMb,
      mem_total_used_mb: req.body.mem.usedMemMb,
      mem_total_free_mb: req.body.mem.freeMemMb,
      mem_used_percentage: req.body.mem.usedMemPercentage,
      mem_free_percentage: req.body.mem.freeMemPercentage,
    })
  } else {
    console.log("DeviceStat already exist, not creating")
  }
  res.send({
    success: true
  })
});

router.get(`/`, async (req, res) => {
  let realUrl = req.url;
  const { current = 1, pageSize = 10 } = req.query;
  const params = parse(realUrl, true).query as unknown as API.PageParams &
    API.Device & {
    sorter: any;
    filter: any;
  };
  const devices = await DeviceRepo.findAll();
  if (!devices) {
    return res.json([]);
  }
  let dataSource = [...devices].slice(
    ((current as number) - 1) * (pageSize as number),
    (current as number) * (pageSize as number),
  );
  if (params.sorter) {
    const sorter = JSON.parse(params.sorter);
    dataSource = dataSource.sort((prev, next) => {
      let sortNumber = 0;
      (Object.keys(sorter) as Array<keyof API.Device>).forEach((uuid) => {
        let nextSort = next?.uuid as string;
        let preSort = prev?.uuid as string;
        if (sorter[uuid] === 'descend') {
          if (preSort.localeCompare(nextSort) > 0) {
            sortNumber += -1;
          } else {
            sortNumber += 1;
          }
          return;
        }
        if (preSort.localeCompare(nextSort) > 0) {
          sortNumber += 1;
        } else {
          sortNumber += -1;
        }
      });
      return sortNumber;
    });
  }
  if (params.filter) {
    const filter = JSON.parse(params.filter as any) as {
      [key: string]: string[];
    };
    if (Object.keys(filter).length > 0) {
      dataSource = dataSource.filter((item) => {
        return (Object.keys(filter) as Array<keyof API.Device>).some((uuid) => {
          if (!filter[uuid]) {
            return true;
          }
          return filter[uuid].includes(`${item.uuid}`);

        });
      });
    }
  }

  if (params.ip) {
    dataSource = dataSource.filter((data) => data?.ip?.includes(params.ip || ''));
  }
  const result = {
    data: dataSource,
    total: devices.length,
    success: true,
    pageSize,
    current: parseInt(`${params.current}`, 10) || 1,
  };

  return res.json(result);
});

export default router;
