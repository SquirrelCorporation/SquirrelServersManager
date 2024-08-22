import express from "express";
import serverLogs from "../data/logs-server.json";
import tasksLogs from "../data/logs-task.json";
import { SuccessResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/AsyncHandler";

const router = express.Router();

router.route("/logs/tasks").get(
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got task logs", tasksLogs).send(res);
  }),
);

router.route("/logs/server").get(
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got server logs", serverLogs).send(res);
  }),
);
export default router;
