import { API } from 'ssm-shared-lib';
import Device from '../data/database/model/Device';
import { processContainers } from '../integrations/docker/core/ContainerProcessor';
import WatchContainer from '../integrations/docker/core/WatchContainer';
import logger from '../logger';

async function addOrUpdateContainer(containersResult: API.ContainerResult[], device: Device) {
  logger.info(JSON.stringify(containersResult));
  const processedContainers = await processContainers(containersResult, device);
  const watchedContainers = await WatchContainer.watch(processedContainers, device);
  // Count container reports
  const containerReportsCount = watchedContainers.length;

  // Count container available updates
  const containerUpdatesCount = watchedContainers.filter(
    (containerReport) => containerReport.container.updateAvailable,
  ).length;

  // Count container errors
  const containerErrorsCount = watchedContainers.filter(
    (containerReport) => containerReport.container.error !== undefined,
  ).length;

  const stats = `${containerReportsCount} containers watched, ${containerErrorsCount} errors, ${containerUpdatesCount} available updates`;
  logger.info(`[USERCASES] - Docker - finished (${stats})`);
}

export default {
  addOrUpdateContainer,
};
