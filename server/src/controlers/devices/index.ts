import express from 'express';
import {parse} from "url";
import DeviceRepo from "../../database/repository/DeviceRepo";
import Device from "../../database/model/Device";
import API from '../../typings';
import DeviceStatsUseCases from "../../use_cases/DeviceStatsUseCases";
import DeviceUseCases from "../../use_cases/DeviceUseCases";
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
  let device = await DeviceRepo.findOneById(req.params.id);
  if (device == null) {
    res.status(404).send({
      success: false
    })
    return;
  }
  await DeviceUseCases.updateDeviceFromJson(req.body, device);
  await DeviceStatsUseCases.createStatIfMinInterval(req.body, device);
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
