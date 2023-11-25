"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_os_utils_1 = __importDefault(require("node-os-utils"));
function getDeviceInfo() {
    return __awaiter(this, void 0, void 0, function () {
        var deviceInfo, e_1, e_2, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    deviceInfo = {};
                    deviceInfo.os = {};
                    try {
                        deviceInfo.ip = node_os_utils_1.default.os.ip();
                        deviceInfo.os.type = node_os_utils_1.default.os.type();
                        deviceInfo.os.arch = node_os_utils_1.default.os.arch();
                        deviceInfo.hostname = node_os_utils_1.default.os.hostname();
                        deviceInfo.os.platform = node_os_utils_1.default.os.platform();
                        deviceInfo.uptime = node_os_utils_1.default.os.uptime();
                    }
                    catch (e) {
                        console.error(e);
                    }
                    try {
                        // @ts-ignore
                        node_os_utils_1.default.os.oos().then(function (name) {
                            // @ts-ignore
                            deviceInfo.os.originalOsName = name;
                        });
                    }
                    catch (e) {
                        console.error(e);
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, node_os_utils_1.default.drive.info("")
                            .then(function (info) {
                            deviceInfo.storage = info;
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    console.error(e_1);
                    return [3 /*break*/, 4];
                case 4:
                    deviceInfo.cpu = {};
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, node_os_utils_1.default.cpu.usage()
                            .then(function (cpuPercentage) {
                            // @ts-ignore
                            deviceInfo.cpu.usage = cpuPercentage;
                        })];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    e_2 = _a.sent();
                    console.error(e_2);
                    return [3 /*break*/, 8];
                case 8:
                    _a.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, node_os_utils_1.default.mem.info()
                            .then(function (info) {
                            deviceInfo.mem = info;
                        })];
                case 9:
                    _a.sent();
                    return [3 /*break*/, 11];
                case 10:
                    e_3 = _a.sent();
                    console.error(e_3);
                    return [3 /*break*/, 11];
                case 11:
                    console.log(JSON.stringify(deviceInfo));
                    return [2 /*return*/];
            }
        });
    });
}
exports.default = getDeviceInfo;
//# sourceMappingURL=os-utils.js.map