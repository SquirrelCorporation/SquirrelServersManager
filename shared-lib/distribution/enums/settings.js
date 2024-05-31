"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultValue = exports.AnsibleReservedExtraVarsKeys = exports.GeneralSettingsKeys = void 0;
var GeneralSettingsKeys;
(function (GeneralSettingsKeys) {
    GeneralSettingsKeys["SCHEME_VERSION"] = "scheme-version";
    GeneralSettingsKeys["SERVER_LOG_RETENTION_IN_DAYS"] = "server-log-retention-in-days";
    GeneralSettingsKeys["CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES"] = "consider-device-offline-after-in-minutes";
    GeneralSettingsKeys["CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER"] = "consider-performance-good-mem-if-greater";
    GeneralSettingsKeys["CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER"] = "consider-performance-good-cpu-if-greater";
    GeneralSettingsKeys["CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS"] = "clean-up-ansible";
    GeneralSettingsKeys["REGISTER_DEVICE_STAT_EVERY_IN_SECONDS"] = "device-stat-frequency-in-seconds";
    GeneralSettingsKeys["DEVICE_STATS_RETENTION_IN_DAYS"] = "device-stats-retention-in-days";
    GeneralSettingsKeys["CONTAINER_STATS_RETENTION_IN_DAYS"] = "container-stats-retention-in-days";
})(GeneralSettingsKeys || (exports.GeneralSettingsKeys = GeneralSettingsKeys = {}));
var AnsibleReservedExtraVarsKeys;
(function (AnsibleReservedExtraVarsKeys) {
    AnsibleReservedExtraVarsKeys["MASTER_NODE_URL"] = "ansible-master-node-url";
})(AnsibleReservedExtraVarsKeys || (exports.AnsibleReservedExtraVarsKeys = AnsibleReservedExtraVarsKeys = {}));
var DefaultValue;
(function (DefaultValue) {
    DefaultValue["SCHEME_VERSION"] = "2";
    DefaultValue["SERVER_LOG_RETENTION_IN_DAYS"] = "30";
    DefaultValue["CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES"] = "3";
    DefaultValue["CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER"] = "10";
    DefaultValue["CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER"] = "90";
    DefaultValue["CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS"] = "600";
    DefaultValue["REGISTER_DEVICE_STAT_EVERY_IN_SECONDS"] = "60";
    DefaultValue["DEVICE_STATS_RETENTION_IN_DAYS"] = "30";
    DefaultValue["CONTAINER_STATS_RETENTION_IN_DAYS"] = "30";
})(DefaultValue || (exports.DefaultValue = DefaultValue = {}));
