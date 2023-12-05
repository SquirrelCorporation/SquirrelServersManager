import express from 'express';
import logger from "../../logger";
import AnsibleLogsRepo from "../../database/repository/AnsibleLogsRepo";
import AnsibleLog, {AnsibleLogModel} from "../../database/model/AnsibleLogs";
import AnsibleTaskStatus, {AnsibleTaskStatusModel} from "../../database/model/AnsibleTaskStatus";
import AnsibleTaskRepo from "../../database/repository/AnsibleTaskRepo";
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
        await AnsibleTaskStatusModel.create({
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
    const ansibleLog: AnsibleLog = {
        ident : req.body.runner_ident,
        content : JSON.stringify(req.body),
    }
    await AnsibleLogsRepo.create(ansibleLog);
    res.send({
        success: true,
    })
});

router.get(`/inventory`, async (req, res) => {
    res.send({
        success: true,
        data: { "_meta": {
                "hostvars": {
                    "Rasp1": {
                        "ip": [
                            "192.168.0.61"
                        ]
                    },
                    "Rasp2": {
                        "ip": [
                            "192.168.0.254"
                        ]
                    },
                    "Rasp3": {
                        "ip": [
                            "192.168.0.137"
                        ]
                    },
                    "Server1": {
                        "ip": [
                            "192.168.0.111"
                        ]
                    }
                }
            },
            "all": {
                "children": ["raspian", "ubuntu"],
                "vars": {
                    "ansible_connection": "ssh",
                    "ansible_become": "yes",
                    "ansible_become_method": "sudo",
                    "ansible_ssh_extra_args": "'-o StrictHostKeyChecking=no'"

                },
            },
            "raspian": {
                "hosts": [
                    "192.168.0.61",
                    "192.168.0.254",
                    "192.168.0.137"
                ],
                "vars": {
                    "ansible_user":"pi",
                    "ansible_ssh_pass":"pi"
                }
            },
            "ubuntu": {
                "hosts": [
                    "192.168.0.111"
                ],
                "vars": {}
            }
        }
    })
});

export  default router;
