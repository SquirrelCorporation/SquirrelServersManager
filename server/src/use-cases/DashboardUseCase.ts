import { SettingsKeys } from 'ssm-shared-lib';
import { getConfFromCache } from '../data/cache';
import PinoLogger from '../logger';
import DeviceStatsUseCases from './DeviceStatsUseCases';

const logger = PinoLogger.child({ module: 'DashboardUseCases' }, { msgPrefix: '[DASHBOARD] - ' });

async function getSystemPerformance() {
  logger.info(`getSystemPerformance`);
  const currentMem = await DeviceStatsUseCases.getSingleAveragedStatByType(7, 0, 'memFree');
  const previousMem = await DeviceStatsUseCases.getSingleAveragedStatByType(14, 7, 'memFree');
  const currentCpu = await DeviceStatsUseCases.getSingleAveragedStatByType(7, 0, 'cpu');
  const previousCpu = await DeviceStatsUseCases.getSingleAveragedStatByType(14, 7, 'cpu');
  const minMem = await getConfFromCache(
    SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER,
  );
  const maxCpu = await getConfFromCache(
    SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER,
  );
  const values = {
    currentMem: currentMem && currentMem.length > 0 ? currentMem[0].value : NaN,
    previousMem: previousMem && previousMem.length > 0 ? previousMem[0].value : NaN,
    currentCpu: currentCpu && currentCpu.length > 0 ? currentCpu[0].value : NaN,
    previousCpu: previousCpu && previousCpu.length > 0 ? previousCpu[0].value : NaN,
  };
  const status = {
    message:
      values.currentMem > parseInt(minMem) && values.currentCpu < parseInt(maxCpu)
        ? 'HEALTHY'
        : 'POOR',
    danger: !(values.currentMem > parseInt(minMem) && values.currentCpu < parseInt(maxCpu)),
  };
  return { ...values, ...status };
}

export default {
  getSystemPerformance,
};
