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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var moment_1 = __importDefault(require("moment/moment"));
var url_1 = require("url");
var os_utils_1 = __importDefault(require("./os-utils"));
var app = (0, express_1.default)();
app.use(express_1.default.json());
var getAccess = function () {
    return true;
};
app.get("/api/currentUser", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (!getAccess()) {
            res.status(401).send({
                data: {
                    isLogin: false,
                },
                errorCode: '401',
                errorMessage: '请先登录！',
                success: true,
            });
            return [2 /*return*/];
        }
        res.send({
            success: true,
            data: {
                name: 'Serati Ma',
                avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
                userid: '00000001',
                email: 'antdesign@alipay.com',
                signature: '海纳百川，有容乃大',
                title: '交互专家',
                group: '蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED',
                tags: [
                    {
                        key: '0',
                        label: '很有想法的',
                    },
                    {
                        key: '1',
                        label: '专注设计',
                    },
                    {
                        key: '2',
                        label: '辣~',
                    },
                    {
                        key: '3',
                        label: '大长腿',
                    },
                    {
                        key: '4',
                        label: '川妹子',
                    },
                    {
                        key: '5',
                        label: '海纳百川',
                    },
                ],
                notifyCount: 12,
                unreadCount: 11,
                country: 'China',
                access: getAccess(),
                geographic: {
                    province: {
                        label: '浙江省',
                        key: '330000',
                    },
                    city: {
                        label: '杭州市',
                        key: '330100',
                    },
                },
                address: '西湖区工专路 77 号',
                phone: '0752-268888888',
            },
        });
        return [2 /*return*/];
    });
}); });
var genList = function (current, pageSize) {
    var tableListDataSource = [];
    for (var i = 0; i < pageSize; i += 1) {
        var index = (current - 1) * 10 + i;
        tableListDataSource.push({
            key: index,
            disabled: i % 6 === 0,
            href: 'https://ant.design',
            avatar: [
                'https://gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png',
                'https://gw.alipayobjects.com/zos/rmsportal/udxAbMEhpwthVVcjLXik.png',
            ][i % 2],
            ip: "192.168.0.".concat(index),
            hostname: "Server ".concat(index),
            status: Math.floor(Math.random() * 10) % 2,
            updatedAt: (0, moment_1.default)().format('YYYY-MM-DD'),
            createdAt: (0, moment_1.default)().format('YYYY-MM-DD'),
            progress: Math.ceil(Math.random() * 100),
            type: 'pi',
        });
    }
    tableListDataSource.reverse();
    return tableListDataSource;
};
var tableListDataSource = genList(1, 10);
app.get("/api/devices", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var realUrl, _a, _b, current, _c, pageSize, params, dataSource, sorter_1, filter_1, result;
    return __generator(this, function (_d) {
        realUrl = req.url;
        (0, os_utils_1.default)();
        _a = req.query, _b = _a.current, current = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c;
        params = (0, url_1.parse)(realUrl, true).query;
        dataSource = __spreadArray([], tableListDataSource, true).slice((current - 1) * pageSize, current * pageSize);
        if (params.sorter) {
            sorter_1 = JSON.parse(params.sorter);
            dataSource = dataSource.sort(function (prev, next) {
                var sortNumber = 0;
                Object.keys(sorter_1).forEach(function (key) {
                    var nextSort = next === null || next === void 0 ? void 0 : next[key];
                    var preSort = prev === null || prev === void 0 ? void 0 : prev[key];
                    if (sorter_1[key] === 'descend') {
                        if (preSort - nextSort > 0) {
                            sortNumber += -1;
                        }
                        else {
                            sortNumber += 1;
                        }
                        return;
                    }
                    if (preSort - nextSort > 0) {
                        sortNumber += 1;
                    }
                    else {
                        sortNumber += -1;
                    }
                });
                return sortNumber;
            });
        }
        if (params.filter) {
            filter_1 = JSON.parse(params.filter);
            if (Object.keys(filter_1).length > 0) {
                dataSource = dataSource.filter(function (item) {
                    return Object.keys(filter_1).some(function (key) {
                        if (!filter_1[key]) {
                            return true;
                        }
                        if (filter_1[key].includes("".concat(item[key]))) {
                            return true;
                        }
                        return false;
                    });
                });
            }
        }
        if (params.ip) {
            dataSource = dataSource.filter(function (data) { var _a; return (_a = data === null || data === void 0 ? void 0 : data.ip) === null || _a === void 0 ? void 0 : _a.includes(params.ip || ''); });
        }
        result = {
            data: dataSource,
            total: tableListDataSource.length,
            success: true,
            pageSize: pageSize,
            current: parseInt("".concat(params.current), 10) || 1,
        };
        return [2 /*return*/, res.json(result)];
    });
}); });
var server = app.listen(3000, function () {
    return console.log("\n\uD83D\uDE80 Server ready at: http://localhost:3000\n\u2B50\uFE0F See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api");
});
//# sourceMappingURL=index.js.map