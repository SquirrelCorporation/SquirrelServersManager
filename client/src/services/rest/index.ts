// @ts-ignore
import * as cron from './cron';
import * as device from './device';
import * as deviceauth from './deviceauth';
import * as logs from './logs';
import * as ansible from './playbooks';
/* eslint-disable */
import * as user from './user';
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
