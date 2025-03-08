import Dockerode from 'dockerode';
import ContainerRepo from '../../../data/database/repository/ContainerRepo';
import logger from '../../../logger';
import Registry from '../registries/Registry';
import Container from '../../../data/database/model/Container';
import { ContainerDocument } from '../schemas/container.schema';
import Tag from './tag';
import tagUtil from './tag';

// We'll need to get the registries from the WatcherEngineService instance
let registriesGetter: () => Registry[] = () => [];

/**
 * Set the registries getter function
 * @param getter Function that returns the registries
 */
export function setRegistriesGetter(getter: () => Registry[]) {
  registriesGetter = getter;
}

/**
 * Get the registries
 * @returns The registries
 */
export function getRegistries(): Registry[] {
  return registriesGetter();
}

/**
 * Filter candidate tags (based on tag name).
 * @param container
 * @param tags
 * @returns {*}
 */
export function getTagCandidates(container: Container, tags: string[]) {
  logger.debug(`[UTILS] - getTagCandidates ${tags?.join(', ')}`);
  let filteredTags = tags;

  // Match include tag regex
  if (container.includeTags) {
    const includeTagsRegex = new RegExp(container.includeTags);
    filteredTags = filteredTags.filter((tag) => includeTagsRegex.test(tag));
  }

  // Match exclude tag regex
  if (container.excludeTags) {
    const excludeTagsRegex = new RegExp(container.excludeTags);
    filteredTags = filteredTags.filter((tag) => !excludeTagsRegex.test(tag));
  }

  // Semver image -> find higher semver tag
  if (container.image.tag.semver) {
    // Keep semver only
    filteredTags = filteredTags.filter(
      (tag) => tagUtil.parseSemver(tagUtil.transformTag(container.transformTags, tag)) !== null,
    );

    // Keep only greater semver
    filteredTags = filteredTags.filter((tag) =>
      tagUtil.isGreaterSemver(
        tagUtil.transformTag(container.transformTags, tag),
        tagUtil.transformTag(container.transformTags, container.image.tag.value),
      ),
    );

    // Apply semver sort desc
    filteredTags.sort((t1, t2) => {
      const greater = tagUtil.isGreaterSemver(
        tagUtil.transformTag(container.transformTags, t2),
        tagUtil.transformTag(container.transformTags, t1),
      );
      return greater ? 1 : -1;
    });
  } else {
    // Non semver tag -> do not propose any other registries tag
    filteredTags = [];
  }
  return filteredTags;
}

export function normalizeContainer(container: Container) {
  const containerWithNormalizedImage = container;
  logger.info(`[UTILS] - normalizeContainer - for name: ${container.image?.name}`);
  const registryProvider = Object.values(getRegistries()).find((provider) =>
    provider.match(container.image),
  ) as Registry;
  if (!registryProvider) {
    logger.warn(`${fullName(container)} - No Registry Provider found`);
    containerWithNormalizedImage.image.registry.name = 'unknown';
  } else {
    logger.info('Registry found! ' + registryProvider.getId());
    containerWithNormalizedImage.image = registryProvider.normalizeImage(container.image);
  }
  return containerWithNormalizedImage;
}

export function fullName(container: Container) {
  return `${container.watcher}_${container.name}`;
}

/**
 * Get the Docker Registry by name.
 * @param registryName
 */
export function getRegistry(registryName: string): Registry {
  const registryToReturn = Object.values(getRegistries()).find((e) => e.name === registryName);
  if (!registryToReturn) {
    throw new Error(
      `Unsupported Registry ${registryName} - (${JSON.stringify(Object.values(getRegistries()))}`,
    );
  }
  return registryToReturn;
}

/**
 * Get old containers to prune.
 * @param newContainers
 * @param containersFromTheStore
 * @returns {*[]|*}
 */
export function getOldContainers(
  newContainers: (Container | undefined)[] | undefined,
  containersFromTheStore?: Container[] | null,
) {
  if (!containersFromTheStore || !newContainers) {
    return [];
  }
  return containersFromTheStore.filter((containerFromStore) => {
    const isContainerStillToWatch = newContainers.find(
      (newContainer) => newContainer?.id === containerFromStore.id,
    );
    return isContainerStillToWatch === undefined;
  });
}

/**
 * Prune old containers from the store.
 * @param newContainers
 * @param containersFromTheStore
 */
export function pruneOldContainers(
  newContainers: (Container | undefined)[] | undefined,
  containersFromTheStore: Container[] | null,
) {
  const containersToRemove = getOldContainers(newContainers, containersFromTheStore);
  containersToRemove.forEach((containerToRemove) => {
    void ContainerRepo.deleteContainerById(containerToRemove.id);
  });
}

export function getContainerName(container: Dockerode.ContainerInfo) {
  let containerName;
  const names = container.Names;
  if (names && names.length > 0) {
    [containerName] = names;
  }
  // Strip ugly forward slash
  containerName = containerName?.replace(/\//, '');
  return containerName;
}

/**
 * Get image repo digest.
 * @param containerImage
 * @returns {*} digest
 */
export function getRepoDigest(containerImage: Dockerode.ImageInspectInfo) {
  if (!containerImage.RepoDigests || containerImage.RepoDigests.length === 0) {
    return undefined;
  }
  const fullDigest = containerImage.RepoDigests[0];
  const digestSplit = fullDigest.split('@');
  return digestSplit[1];
}

/**
 * Return true if container must be watched.
 * @param wudWatchLabelValue the value of the wud.watch label
 * @param watchByDefault true if containers must be watched by default
 * @returns {boolean}
 */
export function isContainerToWatch(
  wudWatchLabelValue: string | undefined,
  watchByDefault: boolean,
) {
  return wudWatchLabelValue !== undefined && wudWatchLabelValue !== ''
    ? wudWatchLabelValue.toLowerCase() === 'true'
    : watchByDefault;
}

/**
 * Return true if container digest must be watched.
 * @param wudWatchDigestLabelValue the value of wud.watch.digest label
 * @param isSemver if image is semver
 * @returns {boolean|*}
 */
export function isDigestToWatch(wudWatchDigestLabelValue: string | undefined, isSemver: boolean) {
  let result = false;
  if (isSemver) {
    if (wudWatchDigestLabelValue !== undefined && wudWatchDigestLabelValue !== '') {
      result = wudWatchDigestLabelValue.toLowerCase() === 'true';
    }
  } else {
    result = true;
    if (wudWatchDigestLabelValue !== undefined && wudWatchDigestLabelValue !== '') {
      result = wudWatchDigestLabelValue.toLowerCase() === 'true';
    }
  }
  return result;
}

export function hasResultChanged(container, otherContainer) {
  return (
    otherContainer === undefined ||
    container.result?.tag !== otherContainer.result?.tag ||
    container.result?.digest !== otherContainer.result?.digest ||
    container.result?.created !== otherContainer.result?.created
  );
}

export function isUpdateAvailable(container: ContainerDocument) {
  if (container.image === undefined || container.result === undefined) {
    return false;
  }
  // Compare digests if we have them
  if (
    container.image.digest.watch &&
    container.image.digest.value !== undefined &&
    container.result.digest !== undefined
  ) {
    return container.image.digest.value !== container.result.digest;
  }

  const localTag = Tag.transformTag(container.transformTags, container.image.tag.value);
  const remoteTag = Tag.transformTag(container.transformTags, container.result.tag || '');
  let updateAvailable = localTag !== remoteTag;

  // Fallback to image created date (especially for legacy v1 manifests)
  if (container.image.created && container.result.created) {
    const createdDate = new Date(container.image.created).getTime();
    const createdDateResult = new Date(container.result.created).getTime();

    updateAvailable = updateAvailable || createdDate !== createdDateResult;
  }
  return updateAvailable;
}

/**
 * Render Link template.
 * @param linkTemplate
 * @param tagValue
 * @param isSemver
 * @returns {undefined|*}
 */
function getLink(linkTemplate: string | undefined, tagValue: string, isSemver: boolean) {
  if (!linkTemplate) {
    return undefined;
  }
  const raw = tagValue;
  let link = linkTemplate;
  link = link.replace(/\${\s*raw\s*}/g, raw);
  if (isSemver) {
    const versionSemver = Tag.parseSemver(tagValue);
    if (versionSemver !== null) {
      const { major, minor, patch, prerelease } = versionSemver;
      link = link.replace(/\${\s*major\s*}/g, `${major}`);
      link = link.replace(/\${\s*minor\s*}/g, `${minor}`);
      link = link.replace(/\${\s*patch\s*}/g, `${patch}`);
      link = link.replace(
        /\${\s*prerelease\s*}/g,
        `${prerelease && prerelease.length > 0 ? prerelease[0] : ''}`,
      );
    }
  }
  return link;
}

/**
 * Computed link property.
 * @param container
 * @returns {undefined|*}
 */
//TODO that is not correct
export function addLinkProperty(container: ContainerDocument) {
  if (container.linkTemplate) {
    return getLink(
      container.linkTemplate,
      Tag.transformTag(container.transformTags, container.image.tag.value),
      container.image.tag.semver,
    );
  }
  if (container.result) {
    return getLink(
      container.linkTemplate,
      Tag.transformTag(container.transformTags, container.result.tag),
      container.image.tag.semver,
    );
  }
}

export function getKindProperty(container: ContainerDocument) {
  const updateKind: {
    kind: 'unknown' | 'tag' | 'digest';
    localValue?: string;
    remoteValue?: string;
    semverDiff?: 'unknown' | 'major' | 'minor' | 'patch' | 'prerelease' | undefined;
  } = {
    kind: 'unknown',
    localValue: undefined,
    remoteValue: undefined,
    semverDiff: undefined,
  };
  if (container.image === undefined || container.result === undefined) {
    return updateKind;
  }
  if (!container.updateAvailable) {
    return updateKind;
  }

  if (
    container.image !== undefined &&
    container.result !== undefined &&
    container.updateAvailable
  ) {
    if (container.image.tag.value !== container.result.tag) {
      updateKind.kind = 'tag';
      let semverDiffWud = 'unknown';
      const isSemver = container.image.tag.semver;
      if (isSemver) {
        const semverDiff = Tag.diff(
          Tag.transformTag(container.transformTags, container.image.tag.value),
          Tag.transformTag(container.transformTags, container.result.tag),
        );
        switch (semverDiff) {
          case 'major':
          case 'premajor':
            semverDiffWud = 'major';
            break;
          case 'minor':
          case 'preminor':
            semverDiffWud = 'minor';
            break;
          case 'patch':
          case 'prepatch':
            semverDiffWud = 'patch';
            break;
          case 'prerelease':
            semverDiffWud = 'prerelease';
            break;
          default:
            semverDiffWud = 'unknown';
        }
      }
      updateKind.localValue = container.image.tag.value;
      updateKind.remoteValue = container.result.tag;
      updateKind.semverDiff = semverDiffWud as
        | 'unknown'
        | 'major'
        | 'minor'
        | 'patch'
        | 'prerelease'
        | undefined;
    } else if (container.image.digest && container.image.digest.value !== container.result.digest) {
      updateKind.kind = 'digest';
      updateKind.localValue = container.image.digest.value;
      updateKind.remoteValue = container.result.digest;
    }
  }
  return updateKind;
}
