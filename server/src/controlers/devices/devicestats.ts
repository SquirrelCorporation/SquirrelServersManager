import express from 'express';
import DeviceRepo from '../../database/repository/DeviceRepo';
import DeviceStatsUseCases from '../../use_cases/DeviceStatsUseCases';
import DeviceUseCases from '../../use_cases/DeviceUseCases';

const router = express.Router();

router.post(`/:id`, async (req, res) => {
  const device = await DeviceRepo.findOneById(req.params.id);
  if (device == null) {
    res.status(404).send({
      success: false,
    });
    return;
  }
  await DeviceUseCases.updateDeviceFromJson(req.body, device);
  await DeviceStatsUseCases.createStatIfMinInterval(req.body, device);
  res.send({
    success: true,
  });
});

router.get(`/:id/stats/:type/`, async (req, res) => {
  const device = await DeviceRepo.findOneById(req.params.id);
  const { from = 24 } = req.query;

  if (device == null) {
    res.status(404).send({
      success: false,
    });
    return;
  }
  try {
    const stats = await DeviceStatsUseCases.getStatsByDeviceAndType(
      device,
      from as number,
      req.params.type,
    );
    res.send({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(401).send({
      success: false,
      message: error.message,
    });
  }
});

router.get(`/:id/stat/:type/`, async (req, res) => {
  const device = await DeviceRepo.findOneById(req.params.id);

  if (device == null) {
    res.status(404).send({
      success: false,
    });
    return;
  }
  try {
    const stat = await DeviceStatsUseCases.getStatByDeviceAndType(device, req.params.type);
    res.send({
      success: true,
      data: stat ? stat[0] : null,
    });
  } catch (error: any) {
    res.status(401).send({
      success: false,
      message: error.message,
    });
  }
});

export default router;
