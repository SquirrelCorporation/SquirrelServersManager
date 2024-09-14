import express from "express";
import images from "../data/images.json";
import networks from "../data/networks.json";
import templates from "../data/templates.json";
import volumes from "../data/volumes.json";
import { SuccessResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/AsyncHandler";

const router = express.Router();

router.get(
  "/containers/templates",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got templates", templates).send(res);
  }),
);

router.get(
  "/containers/images",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got images", images).send(res);
  }),
);

router.get(
  "/containers/volumes",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got volumes", volumes).send(res);
  }),
);

router.get(
  "/containers/networks",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got networks", networks).send(res);
  }),
);

export default router;
