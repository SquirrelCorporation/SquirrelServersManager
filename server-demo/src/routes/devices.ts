import express from "express";
import availability from "../data/availability.json";
import deviceAuth from "../data/device-auth.json";
import devices from "../data/devices.json";
import performance from "../data/performance.json";
import { SuccessResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/AsyncHandler";

const router = express.Router();

router.route("/devices").get(
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got Devices", devices).send(res);
  }),
);

router.route("/devices/:uuid/docker").post(
  asyncHandler(async (req, res) => {
    new SuccessResponse("Docker").send(res);
  }),
);

router.get(
  "/devices/:uuid/auth",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got Device Auth", deviceAuth).send(res);
  }),
);

router.route("/devices/:uuid/docker-watcher").post(
  asyncHandler(async (req, res) => {
    new SuccessResponse("Docker watcher").send(res);
  }),
);

router.get(
  "/devices/dashboard/stats/performances",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got performance", performance).send(res);
  }),
);

router.get(
  "/devices/dashboard/stats/availability",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got availability", availability).send(res);
  }),
);

router.post(
  `/devices/dashboard/stats/averaged/:type`,
  asyncHandler(async (req, res) => {
    const stats: any = [];
    let j = 0;
    devices.forEach((device) => {
      if (device.fqdn) {
        stats.push({
          _id: "",
          value: Math.floor(Math.random() * 10 + j++ * 5),
          name: device.fqdn,
        });
      }
    });
    new SuccessResponse(
      "Stats Device",
      stats.sort((a, b) => b.value - a.value),
    ).send(res);
  }),
);

router.post(
  `/devices/dashboard/stats/:type`,
  asyncHandler(async (req, res) => {
    const stats: any = [];
    for (let i = 0; i < 24 * 30; i++) {
      const date = new Date(new Date().setHours(-i));
      const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}:${date.getHours()}:00:00`;
      let j = 0;
      devices.forEach((device) => {
        if (device.fqdn) {
          stats.push({
            _id: "",
            date: formattedDate,
            value: Math.floor(Math.random() * 10 + j++ * 5),
            name: device.fqdn,
          });
        }
      });
    }
    new SuccessResponse("Stats Device", stats.reverse()).send(res);
  }),
);

router.delete(
  `/devices/:uuid`,
  asyncHandler(async (req, res) => {
    new SuccessResponse("Deleted Device").send(res);
  }),
);

router.get(
  `/devices/:uuid/stats/:type/`,
  asyncHandler(async (req, res) => {
    new SuccessResponse("Stats Device").send(res);
  }),
);

router.get(
  `/devices/:uuid/stat/:type/`,
  asyncHandler(async (req, res) => {
    const { type } = req.params;
    new SuccessResponse("Stat Device", {
      value:
        type === "services"
          ? Math.floor(Math.random() * 10)
          : Math.floor(Math.random() * 100),
      date: new Date(),
    }).send(res);
  }),
);

export default router;
