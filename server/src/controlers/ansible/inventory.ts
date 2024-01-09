import express from "express";

const router = express.Router();

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

export default router;
