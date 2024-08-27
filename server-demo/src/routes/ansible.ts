import express from "express";
import ansibleConf from "../data/ansible-conf.json";
import { SuccessResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/AsyncHandler";

const router = express.Router();

router.get(
  "/ansible/confif",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got Ansible Conf", ansibleConf).send(res);
  }),
);

export default router;
