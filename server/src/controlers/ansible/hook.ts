import express from "express";
import logger from "../../logger";
import AnsibleTaskRepo from "../../database/repository/AnsibleTaskRepo";
import AnsibleTaskStatusRepo from "../../database/repository/AnsibleTaskStatusRepo";
import AnsibleLog from "../../database/model/AnsibleLogs";
import AnsibleLogsRepo from "../../database/repository/AnsibleLogsRepo";

const router = express.Router();
router.post(`/hook/task/status`, async (req, res) => {
    logger.info("[CONTROLLER] ansible/hook/task/status");
    if (!req.body.runner_ident || !req.body.status) {
        logger.error("[CONTROLLER] ansible/hook/task/status - malformed request");
        logger.error(req.body);
        res.status(400).send({
            success: false,
        })
        return;
    }
    const ident = req.body.runner_ident;
    const status = req.body.status;
    const ansibleTask = await AnsibleTaskRepo.updateStatus(
        ident, status
    );
    if (ansibleTask) {
        await AnsibleTaskStatusRepo.create({
            ident: ident,
            status: status,
        });
        res.send({
            success: true,
        });
    } else {
        logger.error(`[CONTROLLER] ansible/hook/status - Task ident not found ${ident}`)
        res.status(404).send({
            success: false,
            message: "Task not found"
        });
    }
});

router.post(`/hook/task/event`, async (req, res) => {
    logger.info("[CONTROLLER] ansible/hook/task/event");
    if (!req.body.runner_ident) {
        logger.error("[CONTROLLER] ansible/hook/tasks/events - malformed request");
        logger.error(req.body);
        res.status(400).send({
            success: false,
        })
        return;
    }
    const removeEmptyLines = (str : string) => str.split(/\r?\n/).filter(line => line.trim() !== '').join('\n');
    // @ts-ignore
    const ansibleLog: AnsibleLog = {
        ident: req.body.runner_ident,
        logRunnerId: req.body.uuid,
        stdout: req.body.stdout ? removeEmptyLines(req.body.stdout) : null,
        content : JSON.stringify(req.body),
    }
    await AnsibleLogsRepo.create(ansibleLog);
    res.send({
        success: true,
    })
});

export default router;
