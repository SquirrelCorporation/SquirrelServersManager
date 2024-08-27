import express from "express";
import ansible from "./ansible";
import automations from "./automations";
import containers from "./containers";
import devices from "./devices";
import logs from "./logs";
import notifications from "./notifications";
import playbooks from "./playbooks";
import services from "./services";
import users from "./users";

const router = express.Router();
router.use("/", users);
router.use("/", devices);
router.use("/", notifications);
router.use("/", containers);
router.use("/", services);
router.use("/", automations);
router.use("/", playbooks);
router.use("/", logs);
router.use("/", ansible);

export default router;
