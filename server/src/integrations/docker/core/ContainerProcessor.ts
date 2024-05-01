import { API } from 'ssm-shared-lib';
import parse from 'parse-docker-image-name';
import Device from '../../../data/database/model/Device';
import ContainerRepo from '../../../data/database/repository/ContainerRepo';
import logger from '../../../logger';
import { Label } from '../utils/label';
import tag from '../utils/tag';
import {
  getContainerName,
  getRepoDigest,
  isDigestToWatch,
  normalizeContainer,
  pruneOldContainers,
} from '../utils/utils';
import { getDockerApi, getDockerApiAuth } from './DockerApi';

export async function processContainers(
  containersResult: API.ContainerResult[],
  device: Device,
): Promise<(API.Container | undefined)[]> {
  const containerPromises = containersResult.map((containerResult: API.ContainerResult) => {
    logger.info('Processing ' + containerResult.container.Id);
    const { Labels = {} } = containerResult.container;
    try {
      return addImageDetailsToContainer(
        device,
        containerResult,
        Labels[Label.wudTagInclude],
        Labels[Label.wudTagExclude],
        Labels[Label.wudTagTransform],
        Labels[Label.wudLinkTemplate],
        Labels[Label.wudDisplayName],
        Labels[Label.wudDisplayIcon],
      );
    } catch (error: any) {
      logger.warn(`Unprocessable container ${containerResult.container.Id}`);
    }
  });
  const containersWithImage = await Promise.all(containerPromises);
  // Return containers to process
  const containersToReturn = containersWithImage.filter(
    (imagePromise) => imagePromise !== undefined,
  );

  // Prune old containers from the store
  try {
    const containersFromTheStore = await ContainerRepo.findContainersByWatcher(
      `SSM-Watcher-${device.uuid}`,
    );
    pruneOldContainers(containersToReturn, containersFromTheStore);
  } catch (e: any) {
    logger.warn(`Error when trying to prune the old containers (${e.message})`);
  }
  return containersToReturn;
}

async function addImageDetailsToContainer(
  device: Device,
  containerResult: API.ContainerResult,
  includeTags?: string,
  excludeTags?: string,
  transformTags?: string,
  linkTemplate?: string,
  displayName?: string,
  displayIcon?: string,
) {
  try {
    const containerId = containerResult.container.Id;

    // Is container already in store? just return it :)
    const containerInStore = await ContainerRepo.findContainerById(containerId);
    if (
      containerInStore !== undefined &&
      containerInStore !== null &&
      containerInStore.error === undefined
    ) {
      logger.info(`Container ${containerInStore.id} already in store`);
      return containerInStore;
    }
    // Get useful properties
    const containerName = getContainerName(containerResult.container);
    const status = containerResult.container.State;
    const dockerApi = getDockerApi();
    const img = dockerApi.getImage(containerResult.container.Image);
    // Get container image details
    logger.info(`[DOCKER] ${containerResult.container.Id} addImageDetailsToContainer - inspect`);
    const image = await img.inspect();
    logger.info(
      `[DOCKER] ${containerResult.container.Id} addImageDetailsToContainer - distribution`,
    );
    const distribution = await img.distribution(getDockerApiAuth());

    const architecture = image.Architecture;
    const os = image.Os;
    const variant = distribution.Platforms.map((e: { variant: any }) => e.variant);
    const created = image.Created;
    const repoDigest = getRepoDigest(image);
    const imageId = image.Id;

    // Parse image to get registries, organization...
    let imageNameToParse = containerResult.container.Image;
    if (imageNameToParse.includes('sha256:')) {
      if (!image.RepoTags || image.RepoTags.length === 0) {
        logger.warn(`Cannot get a reliable tag for this image [${imageNameToParse}]`);
        return undefined;
      }
      // Get the first repo tag (better than nothing ;)
      [imageNameToParse] = image.RepoTags;
    }
    const parsedImage = parse(imageNameToParse);
    const tagName = parsedImage.tag || 'latest';
    const parsedTag = tag.parseSemver(tag.transformTag(transformTags, tagName));
    const isSemver = parsedTag !== null && parsedTag !== undefined;
    const watchDigest = isDigestToWatch(
      containerResult.container.Labels[Label.wudWatchDigest],
      isSemver,
    );
    if (!isSemver && !watchDigest) {
      logger.warn(
        "Image is not a semver and digest watching is disabled so wud won't report any update. Please review the configuration to enable digest watching for this container or exclude this container from being watched",
      );
    }
    return normalizeContainer({
      id: containerId,
      name: containerName || 'unknown',
      status,
      watcher: `SSM-Watcher-${device.uuid}`,
      includeTags,
      excludeTags,
      transformTags,
      linkTemplate,
      displayName,
      displayIcon,
      image: {
        id: imageId,
        registry: {
          url: parsedImage.domain,
        },
        name: parsedImage.path,
        tag: {
          value: tagName,
          semver: isSemver,
        },
        digest: {
          watch: watchDigest,
          repo: repoDigest,
        },
        architecture,
        os,
        variant,
        created,
      },
      result: {
        tag: tagName,
      },
    });
  } catch (error: any) {
    logger.error(`[DOCKER] Unable to process container, ${error.message}`);
  }
}
