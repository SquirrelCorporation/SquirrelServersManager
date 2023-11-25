"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_os_utils_1 = __importDefault(require("node-os-utils"));
function testosutils() {
    var cpu = node_os_utils_1.default.cpu;
    var drive = node_os_utils_1.default.drive;
    drive.info("")
        .then(function (info) {
        console.log(info);
    });
    cpu.usage()
        .then(function (cpuPercentage) {
        console.log(cpuPercentage); // 10.38
    });
    var oscmd = node_os_utils_1.default.oscmd;
    oscmd.whoami()
        .then(function (userName) {
        console.log(userName); // admin
    });
    var mem = node_os_utils_1.default.mem;
    mem.info()
        .then(function (info) {
        console.log(info);
    });
}
exports.default = testosutils;
//# sourceMappingURL=os-utils.js.map