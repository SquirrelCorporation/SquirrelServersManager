"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnsibleBecomeMethod = exports.SSHType = exports.SSMReservedExtraVars = void 0;
var SSMReservedExtraVars;
(function (SSMReservedExtraVars) {
    SSMReservedExtraVars["MASTER_NODE_URL"] = "_ssm_masterNodeUrl";
    SSMReservedExtraVars["DEVICE_ID"] = "_ssm_deviceId";
})(SSMReservedExtraVars || (exports.SSMReservedExtraVars = SSMReservedExtraVars = {}));
var SSHType;
(function (SSHType) {
    SSHType["UserPassword"] = "userPwd";
    SSHType["KeyBased"] = "keyBased";
})(SSHType || (exports.SSHType = SSHType = {}));
var AnsibleBecomeMethod;
(function (AnsibleBecomeMethod) {
    AnsibleBecomeMethod["SUDO"] = "sudo";
    AnsibleBecomeMethod["SU"] = "su";
    AnsibleBecomeMethod["PBRUN"] = "pbrun";
    AnsibleBecomeMethod["PFEXEC"] = "pfexec";
    AnsibleBecomeMethod["DOAS"] = "doas";
    AnsibleBecomeMethod["DZDO"] = "dzdo";
    AnsibleBecomeMethod["KSU"] = "ksu";
    AnsibleBecomeMethod["RUNAS"] = "runas";
    AnsibleBecomeMethod["MACHINECTL"] = "machinectl";
})(AnsibleBecomeMethod || (exports.AnsibleBecomeMethod = AnsibleBecomeMethod = {}));
