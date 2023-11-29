import express from 'express';
import CronRepo from "../../database/repository/CronRepo";

const router = express.Router();

router.get(`/`, async (req, res) => {
  const crons = await CronRepo.findAll();
  res.send({
    success: true,
    data: crons
  })
});

export  default router;
