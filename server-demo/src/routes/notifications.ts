import express from "express";
import notifications from "../data/notifications.json";
import { SuccessResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/AsyncHandler";

const router = express.Router();

router
  .route(`/notifications`)
  .get(
    asyncHandler(async (req, res) => {
      new SuccessResponse("Got notifications", notifications).send(res);
    }),
  )
  .post(
    asyncHandler(async (req, res) => {
      new SuccessResponse("mark all as seen").send(res);
    }),
  );

export default router;
