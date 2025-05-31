import express from "express";
import containers from "../data/containers.json";
import registries from "../data/registries.json";
import stacks from '../data/custom-stacks.json'
import { SuccessResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/AsyncHandler";

const router = express.Router();

router.get(
  "/containers",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got running containers", containers).send(res);
  }),
);

router.get(
  "/container-registries",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got running containers", registries).send(res);
  }),
);

router.get(
  "/custom-stacks/dry-run",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got custom stacks", stacks).send(res);
  }),
);

router.get(
  "/container-stacks",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got custom stacks", stacks).send(res);
  }),
);

router.get(
  `/container-statistics/count/running`,
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got running containers", 25).send(res);
  }),
);
router.get(
  `/container-statistics/count/all`,
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got all containers", 30).send(res);
  }),
);

router.get(
  "/container-statistics/averaged",
  asyncHandler(async (req, res) => {
    const statsCpu: any = [];
    for (let i = 0; i < 24 * 5; i++) {
      const date = new Date(new Date().setHours(-i));
      const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}:${date.getHours()}:00:00`;
      statsCpu.push({
        _id: "",
        date: formattedDate,
        value: Math.floor(Math.random() * 100),
      });
    }
    const statsMem: any = [];
    for (let i = 0; i < 24 * 5; i++) {
      const date = new Date(new Date().setHours(-i));
      const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}:${date.getHours()}:00:00`;
      statsMem.push({
        _id: "",
        date: formattedDate,
        value: Math.floor(Math.random() * 100),
      });
    }
    new SuccessResponse("Got averaged stats containers", {
      cpuStats: statsCpu.reverse(),
      memStats: statsMem.reverse(),
    }).send(res);
  }),
);

router.get(
  "/containers/:uuid/stat/:type",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got container stat", {
      value: Math.floor(Math.random() * 60),
    }).send(res);
  }),
);

router.post(
  "/containers/:uuid/name",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Updated container name").send(res);
  }),
);

router.post(
  "/containers/:uuid/docker/action/:action",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Updated container state").send(res);
  }),
);

router.get(
  "/containers/:uuid/stats/:type",
  asyncHandler(async (req, res) => {
    const stats: any = [];
    for (let i = 0; i < 24 * 5; i++) {
      const date = new Date(new Date().setHours(-i));
      const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}:${date.getHours()}:00:00`;
      stats.push({
        _id: "",
        date: formattedDate,
        value: Math.floor(Math.random() * 80),
      });
    }
    new SuccessResponse("Got container stat", stats).send(res);
  }),
);

export default router;
