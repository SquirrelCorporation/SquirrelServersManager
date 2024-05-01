import logger from '../../../logger';
import Container from '../../../data/database/model/Container';
import { getRegistry, getTagCandidates } from '../utils/utils';
import { getDockerApi } from './DockerApi';

async function findNewVersion(container: Container) {
  const registryProvider = getRegistry(container.image.registry.name);
  const result: { tag: string; digest?: string; created?: string } = {
    tag: container.image.tag.value,
  };
  if (!registryProvider) {
    logger.error(`Unsupported registry (${container.image.registry.name})`);
  } else {
    // Must watch digest? => Find local/remote digests on registries
    if (container.image.digest.watch && container.image.digest.repo) {
      const remoteDigest = await registryProvider.getImageManifestDigest(container.image);
      result.digest = remoteDigest.digest;
      result.created = remoteDigest.created;

      if (remoteDigest.version === 2) {
        // Regular v2 manifest => Get manifest digest
        /*  eslint-disable no-param-reassign */
        const digestV2 = await registryProvider.getImageManifestDigest(
          container.image,
          container.image.digest.repo,
        );
        container.image.digest.value = digestV2.digest;
      } else {
        // Legacy v1 image => take Image digest as reference for comparison
        const dockerApi = getDockerApi();
        const image = await dockerApi.getImage(container.image.id).inspect();
        container.image.digest.value = image.Config.Image === '' ? undefined : image.Config.Image;
      }
    }
    logger.debug(`[DOCKER] findNewVersion - getTags`);
    const tags = await registryProvider.getTags(container.image);
    logger.debug(`[DOCKER] findNewVersion - tags: ${tags}`);
    // Get candidates (based on tag name)
    const tagsCandidates = getTagCandidates(container, tags);

    // The first one in the array is the highest
    if (tagsCandidates && tagsCandidates.length > 0) {
      result.tag = tagsCandidates[0];
    }
    return result;
  }
}

export { findNewVersion };
