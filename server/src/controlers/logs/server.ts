import express from "express";
import LogsRepo from '../../database/repository/LogsRepo';

const router = express.Router();

router.get(`/server`, async (req, res) => {
const logs = await LogsRepo.findAll();
    res.send({
        success: true,
        data: logs
    })
});

export default router;
