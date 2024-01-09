import express from "express";
import AnsibleTaskRepo from "../../database/repository/AnsibleTaskRepo";

const router = express.Router();

router.get(`/tasks`, async (req, res) => {
const tasks = await AnsibleTaskRepo.findAll();
    res.send({
        success: true,
        data: tasks
    })
});

export default router;
