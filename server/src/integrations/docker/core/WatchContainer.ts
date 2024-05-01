import Device from '../../../data/database/model/Device';
import Container from '../../../data/database/model/Container';
import ContainerRepo from '../../../data/database/repository/ContainerRepo';
import logger from '../../../logger';
import { hasResultChanged } from '../utils/utils';
import { findNewVersion } from './NewContainerVersionFinder';

/**
 * Watch main method.
 * @returns {Promise<*[]>}
 */
async function watch(containers, device: Device) {
  try {
    //EventHandler.emitContainerReports(containerReports);
    return await Promise.all(
      containers.map((container: Container) => watchContainer(container, device)),
    );
  } catch (e: any) {
    logger.error(e);
    logger.warn(`Error when processing some containers (${e.message})`);
    return [];
  }
}

/**
 * Watch a Container.
 * @param container
 * @param device
 * @returns {Promise<*>}
 */
async function watchContainer(container: Container, device: Device) {
  const containerWithResult = container;

  // Reset previous results if so
  delete containerWithResult.result;
  delete containerWithResult.error;
  logger.debug('Start watching');

  try {
    containerWithResult.result = await findNewVersion(container);
  } catch (e: any) {
    logger.warn(`Error when processing (${e.message})`);
    logger.debug(e);
    containerWithResult.error = {
      message: e.message,
    };
  }
  const containerReport = mapContainerToContainerReport(containerWithResult, device);
  //EventHandler.emitContainerReport(containerReport);
  return containerReport;
}

/**
 * Process a Container with result and map to a containerReport.
 * @param containerWithResult
 * @param device
 * @return {*}
 */
async function mapContainerToContainerReport(containerWithResult: Container, device: Device) {
  const containerReport = {
    container: containerWithResult,
    changed: false,
  };

  // Find container in db & compare
  const containerInDb = await ContainerRepo.findContainerById(containerWithResult.id);

  // Not found in DB? => Save it
  if (!containerInDb) {
    logger.debug('Container watched for the first time');
    containerReport.container = await ContainerRepo.createContainer(containerWithResult, device);
    containerReport.changed = true;

    // Found in DB? => update it
  } else {
    containerReport.container = await ContainerRepo.updateContainer(containerWithResult);
    containerReport.changed = !!(
      hasResultChanged(containerInDb, containerReport.container) &&
      containerWithResult.updateAvailable
    );
  }
  return containerReport;
}
export default {
  watch,
};
