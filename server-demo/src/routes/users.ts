import express from "express";
import currentUser from "../data/current-user.json";
import { SuccessResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/AsyncHandler";

const router = express.Router();

router.get(
  `/users`,
  asyncHandler(async (req, res) => {
    new SuccessResponse("Has user", { hasUsers: true }).send(res);
  }),
);

router.get(
  "/users/current",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Current user", currentUser).send(res);
  }),
);

router.post(
  "/users/logout",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Logout user").send(res);
  }),
);

router.post(
  "/users/login",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Login success", {
      currentAuthority: "admin",
    }).send(res);
  }),
);

router.post(
  "/users/settings/resetApiKey",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Reset Api Key", {
      uuid: "6354171c-152d-464f-8f3f-3ab6ce37e361",
    }).send(res);
  }),
);

router.post(
  "/users/settings/logs",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Set user log level").send(res);
  }),
);

export default router;
