import express from "express";
import ansibleConf from "../data/ansible-conf.json";
import smartFailure from "../data/ansible-smart-failure.json";
import { SuccessResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/AsyncHandler";

const router = express.Router();



export default router;
