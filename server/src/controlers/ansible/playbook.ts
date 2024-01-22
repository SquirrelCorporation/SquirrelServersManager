import express from "express";
import ansible from '../../shell/ansible'
import logger from "../../logger";
const router = express.Router();

router.get(`/playbooks`, async (req, res) => {
    try {
        const listOfPlaybooks = await ansible.listPlaybooks();
        const listOfPlaybooksToSelect = listOfPlaybooks.map(e => {
            //TODO: logic to be moved elsewhere
            return {value: e, label: e.replaceAll('.yml', '')};
        })
        res.send({
            success: true,
            data: listOfPlaybooksToSelect
        })
    } catch (error) {
        res.status(500).send({
            success: false
        })
    }
});

router.get(`/playbooks/:playbook/content`, async (req, res) => {
    if (!req.params.playbook) {
        res.status(400).send({
            success: false,
        });
        return;
    }
    logger.info(`[CONTROLLER][ANSIBLE] playbook content ${req.params.playbook}`);
    try {
        const content = await ansible.readPlaybook(req.params.playbook);
        res.send({
            success: true,
            data: content
        })
    } catch (error) {
        res.status(500).send({
            success: false
        })
    }
});

router.patch(`/playbooks/:playbook/`, async (req, res) => {
    if (!req.params.playbook) {
        res.status(400).send({
            success: false,
        });
        return;
    }
    if (!req.body.content) {
        logger.error("[CONTROLLER] patch /playbooks/:playbook/ - malformed request");
        logger.error(req.body);
        res.status(400).send({
            success: false,
        })
        return;
    }
    logger.info(`[CONTROLLER][ANSIBLE] patch playbook content ${req.params.playbook}`);
    try {
        await ansible.editPlaybook(req.params.playbook, req.body.content);
        res.send({
            success: true
        })
    } catch (error) {
        res.status(500).send({
            success: false
        })
    }
});

router.put(`/playbooks/:playbook/`, async (req, res) => {
    if (!req.params.playbook) {
        res.status(400).send({
            success: false,
        });
        return;
    }
    if (req.params.playbook.startsWith("_")) {
        res.status(401).send({
            success: false,
            message: "Cannot create a playbook that starts with _"
        });
        return;
    }
    logger.info(`[CONTROLLER][ANSIBLE] new playbook  ${req.params.playbook}`);
    try {
        await ansible.newPlaybook(req.params.playbook);
        res.send({
            success: true
        })
    } catch (error) {
        res.status(500).send({
            success: false
        })
    }
});

router.delete(`/playbooks/:playbook/`, async (req, res) => {
    if (!req.params.playbook) {
        res.status(400).send({
            success: false,
        });
        return;
    }
    if (req.params.playbook.startsWith("_")) {
        res.status(401).send({
            success: false,
            message: "Cannot delete playbook with name that starts with _"
        });
        return;
    }
    logger.info(`[CONTROLLER][ANSIBLE] delete playbook  ${req.params.playbook}`);
    try {
        await ansible.deletePlaybook(req.params.playbook);
        res.send({
            success: true
        })
    } catch (error) {
        res.status(500).send({
            success: false
        })
    }
});

export default router;
