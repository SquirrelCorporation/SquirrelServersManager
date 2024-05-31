"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerStatus = exports.DeviceStatus = void 0;
var DeviceStatus;
(function (DeviceStatus) {
    DeviceStatus[DeviceStatus["REGISTERING"] = 0] = "REGISTERING";
    DeviceStatus[DeviceStatus["ONLINE"] = 1] = "ONLINE";
    DeviceStatus[DeviceStatus["OFFLINE"] = 2] = "OFFLINE";
    DeviceStatus[DeviceStatus["UNMANAGED"] = 3] = "UNMANAGED";
})(DeviceStatus || (exports.DeviceStatus = DeviceStatus = {}));
var ContainerStatus;
(function (ContainerStatus) {
    ContainerStatus["RUNNING"] = "running";
    ContainerStatus["PAUSED"] = "paused";
})(ContainerStatus || (exports.ContainerStatus = ContainerStatus = {}));
