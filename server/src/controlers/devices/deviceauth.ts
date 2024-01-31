import express from 'express';
import logger from '../../logger';
import DeviceRepo from '../../database/repository/DeviceRepo';
import DeviceAuthRepo from '../../database/repository/DeviceAuthRepo';
import DeviceAuth from '../../database/model/DeviceAuth';

const router = express.Router();

router.post(`/:id/auth`, async (req, res) => {
  if (!req.body.type) {
    logger.error('[CONTROLLER] - POST - Device Auth - Is called with no type');
    res.status(401).send({
      success: false,
      message: 'Type is not specified',
    });
    return;
  }
  if (!req.params.id) {
    logger.error('[CONTROLLER] - POST - Device Auth - Is called with no id');
    res.status(401).send({
      success: false,
      message: 'Device ID is not specified',
    });
    return;
  }
  const device = await DeviceRepo.findOneById(req.params.id);
  if (!device) {
    logger.error(`[CONTROLLER] - POST - Device Auth - Device not found (${req.params.id})`);
    res.status(404).send({
      success: false,
      message: 'Device ID not found',
    });
    return;
  }
  const deviceAuth = await DeviceAuthRepo.updateOrCreateIfNotExist({
    device: device,
    type: req.body.type,
    sshKey: req.body.sshKey,
    sshUser: req.body.sshUser,
    sshPwd: req.body.sshPwd,
    sshPort: req.body.sshPort,
    __enc_sshPwd: true,
    __enc_sshUser: true,
    __enc_sshKey: true,
  } as DeviceAuth);

  logger.info(
    `[CONTROLLER] - POST - Device Auth - Updated or Created device with uuid: ${device.uuid}`,
  );

  res.send({
    success: true,
    data: {
      type: deviceAuth.type,
    },
  });
});

router.get(`/:id/auth`, async (req, res) => {
  if (!req.params.id) {
    logger.error('[CONTROLLER] - GET - Device Auth - Is called with no id');
    res.status(401).send({
      success: false,
      message: 'Device id is not specified',
    });
    return;
  }

  const device = await DeviceRepo.findOneById(req.params.id);
  if (!device) {
    logger.error('[CONTROLLER] - POST - Device Auth - Deivce not found');
    res.status(404).send({
      success: false,
      message: 'Device ID not found',
    });
    return;
  }

  const deviceAuth = await DeviceAuthRepo.findOneByDevice(device);
  if (!deviceAuth) {
    logger.error('[CONTROLLER] - POST - Device Auth - DeviceAuth not found');
    res.status(404).send({
      success: false,
      message: 'DeviceAuth not found',
    });
    return;
  }

  res.send({
    success: true,
    data: deviceAuth,
  });
});

export default router;
