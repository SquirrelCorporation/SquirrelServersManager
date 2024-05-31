"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceStatsType = exports.ContainerStatsType = void 0;
var ContainerStatsType;
(function (ContainerStatsType) {
    ContainerStatsType["CPU"] = "cpu";
    ContainerStatsType["MEM"] = "mem";
})(ContainerStatsType || (exports.ContainerStatsType = ContainerStatsType = {}));
var DeviceStatsType;
(function (DeviceStatsType) {
    DeviceStatsType["CPU"] = "cpu";
    DeviceStatsType["MEM_USED"] = "memUsed";
    DeviceStatsType["MEM_FREE"] = "memFree";
    DeviceStatsType["SERVICES"] = "services";
})(DeviceStatsType || (exports.DeviceStatsType = DeviceStatsType = {}));
