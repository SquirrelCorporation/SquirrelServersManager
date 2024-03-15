import express from 'express';
import Authentication from '../../middlewares/Authentication';
import shell from '../../shell';
import logger from '../../logger';
import PlaybookUseCases from '../../use-cases/PlaybookUseCases';
import PlaybookRepo from '../../database/repository/PlaybookRepo';

const router = express.Router();

router.get(`/playbooks`, Authentication.isAuthenticated, async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /ansible/playbooks`);
  try {
    const listOfPlaybooksToSelect = await PlaybookUseCases.getAllPlaybooks();
    res.send({
      success: true,
      data: listOfPlaybooksToSelect,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
    });
  }
});

router.get(`/playbooks/:playbook/content`, Authentication.isAuthenticated, async (req, res) => {
  logger.info(`[CONTROLLER] - GET - /ansible/playbooks/${req.params.playbook}/content`);
  if (!req.params.playbook) {
    res.status(400).send({
      success: false,
    });
    return;
  }
  logger.info(`[CONTROLLER][ANSIBLE] playbook content ${req.params.playbook}`);
  try {
    const content = await shell.readPlaybook(req.params.playbook);
    res.send({
      success: true,
      data: content,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
    });
  }
});

router.patch(`/playbooks/:playbook/`, Authentication.isAuthenticated, async (req, res) => {
  logger.info(`[CONTROLLER] - PATCH - /ansible/playbooks/${req.params.playbook}`);
  if (!req.params.playbook) {
    res.status(400).send({
      success: false,
    });
    return;
  }
  if (!req.body.content) {
    logger.error('[CONTROLLER] patch /playbooks/:playbook/ - malformed request');
    logger.error(req.body);
    res.status(400).send({
      success: false,
    });
    return;
  }
  logger.info(`[CONTROLLER][ANSIBLE] patch playbook content ${req.params.playbook}`);
  try {
    await shell.editPlaybook(req.params.playbook, req.body.content);
    res.send({
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
    });
  }
});

router.put(`/playbooks/:playbook/`, Authentication.isAuthenticated, async (req, res) => {
  logger.info(`[CONTROLLER] - PUT - /ansible/playbooks/${req.params.playbook}`);
  if (!req.params.playbook) {
    res.status(400).send({
      success: false,
    });
    return;
  }
  if (req.params.playbook.startsWith('_')) {
    res.status(401).send({
      success: false,
      message: 'Cannot create a playbook that starts with _',
    });
    return;
  }
  logger.info(`[CONTROLLER][ANSIBLE] new playbook  ${req.params.playbook}`);
  try {
    await PlaybookUseCases.createCustomPlaybook(req.params.playbook);
    res.send({
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
    });
  }
});

router.delete(`/playbooks/:playbook/`, Authentication.isAuthenticated, async (req, res) => {
  logger.info(`[CONTROLLER] - DELETE - /ansible/playbooks/${req.params.playbook}`);
  if (!req.params.playbook) {
    res.status(400).send({
      success: false,
    });
    return;
  }
  if (req.params.playbook.startsWith('_')) {
    res.status(401).send({
      success: false,
      message: 'Cannot delete playbook with name that starts with _',
    });
    return;
  }
  logger.info(`[CONTROLLER][ANSIBLE] - DELETE - delete playbook  ${req.params.playbook}`);
  try {
    await PlaybookUseCases.deleteCustomPlaybook(req.params.playbook);
    res.send({
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
    });
  }
});

router.post(`/playbooks/:playbook/extravars`, Authentication.isAuthenticated, async (req, res) => {
  logger.info(`[CONTROLLER] - POST - /ansible/playbooks/${req.params.playbook}/extravars`);
  if (!req.params.playbook) {
    res.status(400).send({
      success: false,
    });
    return;
  }
  if (!req.body.extraVar) {
    res.status(401).send({
      success: false,
      message: 'ExtraVar required',
    });
    return;
  }
  const playbook = await PlaybookRepo.findOne(req.params.playbook);
  if (!playbook) {
    res.status(404).send({
      success: false,
    });
    return;
  }
  try {
    await PlaybookUseCases.addExtraVarToPlaybook(playbook, req.body.extraVar);
    res.send({
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
    });
  }
});

router.delete(
  `/playbooks/:playbook/extravars/:varname`,
  Authentication.isAuthenticated,
  async (req, res) => {
    logger.info(
      `[CONTROLLER] - DELETE - /ansible/playbooks/${req.params.playbook}/extravars/${req.params.varname}`,
    );
    if (!req.params.playbook || !req.params.varname) {
      res.status(400).send({
        success: false,
      });
      return;
    }
    const playbook = await PlaybookRepo.findOne(req.params.playbook + '.yml');
    if (!playbook) {
      res.status(404).send({
        success: false,
      });
      return;
    }
    try {
      await PlaybookUseCases.deleteExtraVarFromPlaybook(playbook, req.params.varname);
      res.send({
        success: true,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
      });
    }
  },
);

export default router;
