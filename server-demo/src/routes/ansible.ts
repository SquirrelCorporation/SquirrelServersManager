import express from "express";
import ansibleConf from "../data/ansible-conf.json";
import smartFailure from "../data/ansible-smart-failure.json";
import { SuccessResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/AsyncHandler";

const router = express.Router();

router.get(
  "/ansible/config",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got Ansible Conf", ansibleConf).send(res);
  }),
);

router.get(
  "/ansible/smart-failure",
  asyncHandler(async (req, res) => {
    new SuccessResponse("May got Ansible SmartFailure", smartFailure).send(res);
  }),
);

export default router;
