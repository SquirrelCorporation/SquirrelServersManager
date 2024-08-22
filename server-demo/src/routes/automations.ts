import express from "express";
import automations from "../data/automations.json";
import { SuccessResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/AsyncHandler";

const router = express.Router();

router.get(
  "/automations",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got automations", automations).send(res);
  }),
);

router.put(
  "/automations/:name",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Put automation").send(res);
  }),
);

export default router;
