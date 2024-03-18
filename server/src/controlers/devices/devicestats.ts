import express from 'express';
import DeviceRepo from '../../database/repository/DeviceRepo';
import Authentication from '../../middlewares/Authentication';
import DeviceStatsUseCases from '../../use-cases/DeviceStatsUseCases';
import DeviceUseCases from '../../use-cases/DeviceUseCases';
import logger from '../../logger';

const router = express.Router();

router.post(`/:id`, async (req, res) => {
  const device = await DeviceRepo.findOneById(req.params.id);
  if (device == null) {
    res.status(404).send({
      success: false,
      message: 'Device not found',
    });
    return;
  }
  await DeviceUseCases.updateDeviceFromJson(req.body, device);
  await DeviceStatsUseCases.createStatIfMinInterval(req.body, device);
  res.send({
    success: true,
  });
});

router.get(`/:id/stats/:type/`, Authentication.isAuthenticated, async (req, res) => {
  const device = await DeviceRepo.findOneById(req.params.id);
  const { from = 24 } = req.query;

  if (device == null) {
    res.status(404).send({
      success: false,
      message: 'Device not found',
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

router.get(`/:id/stat/:type/`, Authentication.isAuthenticated, async (req, res) => {
  const device = await DeviceRepo.findOneById(req.params.id);

  if (device == null) {
    res.status(404).send({
      success: false,
      message: 'Device not found',
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
