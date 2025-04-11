// @ts-ignore
import * as cron from './scheduler/scheduler';
import * as deviceauth from './devices/device-credentials';
import * as device from './devices/devices';
import * as logs from './logs/logs';
import * as ansible from './playbooks/playbooks';
/* eslint-disable */
import * as user from './users/users';
import * as usersettings from './usersettings';

export default {
  user,
  device,
  cron,
  ansible,
  logs,
  deviceauth,
  usersettings,
};
