import axios, { AxiosRequestConfig } from 'axios';
import logger from '../../../logger';
import Component from '../core/Component';
import type { SSMServicesTypes } from '../../../types/typings.d.ts';

/**
 * Docker Registry Abstract class.
 */
abstract class Registry extends Component<SSMServicesTypes.ConfigurationRegistrySchema> {
  /**
   * Encode Bse64(login:password)
   * @param login
   * @param token
   * @returns {string}
   */
  static base64Encode(login: string, token: string) {
    return Buffer.from(`${login}:${token}`, 'utf-8').toString('base64');
  }

  /**
   * Override getId to return the name only (hub, ecr...).
   * @returns {string}
   */
  getId() {
    return this.type;
  }

  /**
   * If this registries is responsible for the image (to be overridden).
   * @param image the image
   * @returns {boolean}
   */
  // eslint-disable-next-line no-unused-vars,class-methods-use-this,@typescript-eslint/no-unused-vars
  match(image: SSMServicesTypes.Image) {
    return false;
  }

  /**
   * Normalize image according to Registry Custom characteristics (to be overridden).
   * @param image
   * @returns {*}
   */
  // eslint-disable-next-line class-methods-use-this
  normalizeImage(image: SSMServicesTypes.Image) {
    return image;
  }

  /**
   * Authenticate and set authentications value to requestOptions.
   * @param image
   * @param requestOptions
   * @returns {*}
   */
  // eslint-disable-next-line class-methods-use-this
  async authenticate(
    image: SSMServicesTypes.Image,
    requestOptions: SSMServicesTypes.RequestOptionsType,
  ) {
    return requestOptions;
  }

  /**
   * Get Tags.
   * @param image
   * @returns {*}
   */
  async getTags(image: SSMServicesTypes.Image) {
    this.childLogger.info(`[REGISTRY] - getTags: ${this.getId()} - Get ${image.name} tags`);
    const tags: string[] = [];
    let page;
    let hasNext = true;
    let link;
    while (hasNext) {
      const lastItem = page ? page.data.tags[page.data.tags.length - 1] : undefined;
      // eslint-disable-next-line no-await-in-loop
      page = await this.getTagsPage(image, lastItem, link);
      const pageTags = page.data.tags ? page.data.tags : [];
      link = page.headers.link;
      hasNext = page.headers.link !== undefined;
      tags.push(...pageTags);
    }

    // Sort alpha then reverse to get higher values first
    tags.sort();
    tags.reverse();
    return tags;
  }

  /**
   * Get tags page
   * @param image
   * @param lastItem
   * @param link
   * @returns {Promise<*>}
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTagsPage(image: SSMServicesTypes.Image, lastItem = undefined, link?: string) {
    // Default items per page (not honoured by all registries)
    const itemsPerPage = 1000;
    const last = lastItem ? `&last=${lastItem}` : '';
    return this.callRegistry({
      image,
      url: `${image.registry.url}/${image.name}/tags/list?n=${itemsPerPage}${last}`,
    });
  }

  /**
   * Get image manifest for a remote tag.
   * @param image
   * @param digest (optional)
   * @returns {Promise<undefined|*>}
   */
  async getImageManifestDigest(
    image: SSMServicesTypes.Image,
    digest?: string,
  ): Promise<{ digest: string; version: number; created?: string }> {
    const tagOrDigest = digest || image.tag.value;
    let manifestDigestFound: string | undefined = undefined;
    let manifestMediaType: string | undefined = undefined;
    logger.info(
      `[REGISTRY] getImageManifestDigest - ${this.getId()} - Get ${image.name}:${tagOrDigest} manifest`,
    );
    const responseManifests = (
      await this.callRegistry({
        image,
        url: `${image.registry.url}/${image.name}/manifests/${tagOrDigest}`,
        headers: {
          Accept:
            'application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.oci.image.index.v1+json',
        },
      })
    )?.data;
    if (responseManifests) {
      if (responseManifests.schemaVersion === 2) {
        this.childLogger.debug(
          '[REGISTRY] getImageManifestDigest - Manifests found with schemaVersion = 2',
        );
        this.childLogger.debug(
          `[REGISTRY] getImageManifestDigest - Manifests media type detected [${responseManifests.mediaType}]`,
        );
        if (
          responseManifests.mediaType ===
            'application/vnd.docker.distribution.manifest.list.v2+json' ||
          responseManifests.mediaType === 'application/vnd.oci.image.index.v1+json'
        ) {
          this.childLogger.debug(
            `[REGISTRY] getImageManifestDigest - Filter manifest for [arch=${image.architecture}, os=${image.os}, variant=${image.variant}]`,
          );
          let manifestFound;
          const manifestFounds = responseManifests.manifests.filter(
            (manifest: SSMServicesTypes.Manifest) =>
              manifest.platform.architecture === image.architecture &&
              manifest.platform.os === image.os,
          );

          // 1 manifest matching al least? Get the first one (better than nothing)
          if (manifestFounds.length > 0) {
            [manifestFound] = manifestFounds;
          }

          // Multiple matching manifests? Try to refine using variant filtering
          if (manifestFounds.length > 1) {
            const manifestFoundFilteredOnVariant = manifestFounds.find(
              (manifest: SSMServicesTypes.Manifest) => manifest.platform.variant === image.variant,
            );

            // Manifest exactly matching with variant? Select it
            if (manifestFoundFilteredOnVariant) {
              manifestFound = manifestFoundFilteredOnVariant;
            }
          }

          if (manifestFound) {
            this.childLogger.debug(
              `[REGISTRY] getImageManifestDigest - Manifest found with [digest=${manifestFound.digest}, mediaType=${manifestFound.mediaType}]`,
            );
            manifestDigestFound = manifestFound.digest;
            manifestMediaType = manifestFound.mediaType;
          }
        } else if (
          responseManifests.mediaType === 'application/vnd.docker.distribution.manifest.v2+json' ||
          responseManifests.mediaType === 'application/vnd.oci.image.manifest.v1+json'
        ) {
          this.childLogger.debug(
            `[REGISTRY] getImageManifestDigest - Manifest found with [digest=${responseManifests.config.digest}, mediaType=${responseManifests.config.mediaType}]`,
          );
          manifestDigestFound = responseManifests.config.digest;
          manifestMediaType = responseManifests.config.mediaType;
        }
      } else if (responseManifests.schemaVersion === 1) {
        this.childLogger.debug(
          '[REGISTRY] getImageManifestDigest - Manifests found with schemaVersion = 1',
        );
        const v1Compat = JSON.parse(responseManifests.history[0].v1Compatibility);
        const manifestFound = {
          digest: v1Compat.config ? v1Compat.config.Image : undefined,
          created: v1Compat.created,
          version: 1,
        };
        this.childLogger.debug(
          `[REGISTRY] getImageManifestDigest - Manifest found with [digest=${manifestFound.digest}, created=${manifestFound.created}, version=${manifestFound.version}]`,
        );
        return manifestFound;
      }
      if (
        (manifestDigestFound &&
          manifestMediaType === 'application/vnd.docker.distribution.manifest.v2+json') ||
        (manifestDigestFound && manifestMediaType === 'application/vnd.oci.image.manifest.v1+json')
      ) {
        this.childLogger.info(
          '[REGISTRY] getImageManifestDigest - Calling registries to get docker-content-digest header',
        );
        const responseManifest = await this.callRegistry({
          image,
          method: 'head',
          url: `${image.registry.url}/${image.name}/manifests/${manifestDigestFound}`,
          headers: {
            Accept: manifestMediaType,
          },
        });
        const manifestFound = {
          digest: responseManifest.headers['docker-content-digest'],
          version: 2,
        };
        this.childLogger.info(
          `[REGISTRY] getImageManifestDigest - Manifest found with [digest=${manifestFound.digest}, version=${manifestFound.version}]`,
        );
        return manifestFound;
      }
      if (
        (manifestDigestFound &&
          manifestMediaType === 'application/vnd.docker.container.image.v1+json') ||
        (manifestDigestFound && manifestMediaType === 'application/vnd.oci.image.config.v1+json')
      ) {
        const manifestFound = {
          digest: manifestDigestFound,
          version: 1,
        };
        this.childLogger.debug(
          `[REGISTRY] getImageManifestDigest - Manifest found with [digest=${manifestFound.digest}, version=${manifestFound.version}]`,
        );
        return manifestFound;
      }
    }
    // Empty result...
    throw new Error('[REGISTRY] getImageManifestDigest - Unexpected error; no manifest found');
  }

  async callRegistry({
    image,
    url,
    method = 'get',
    headers = {
      Accept: 'application/json',
    },
  }: {
    image: SSMServicesTypes.Image;
    url: string;
    method?: string;
    headers?: { Accept?: string; Authorization?: string };
  }) {
    try {
      const getRequestOptions: AxiosRequestConfig = {
        url: url,
        method,
        headers,
      };
      this.childLogger.debug(`[REGISTRY] - callRegistry ${JSON.stringify(getRequestOptions)}`);
      const getRequestOptionsWithAuth = await this.authenticate(image, getRequestOptions);
      return await axios.request(getRequestOptionsWithAuth);
    } catch (error: any) {
      logger.error(error);
      throw error;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getImageFullName(image: SSMServicesTypes.Image, tagOrDigest: string) {
    // digests are separated with @ whereas tags are separated with :
    const tagOrDigestWithSeparator =
      tagOrDigest.indexOf(':') !== -1 ? `@${tagOrDigest}` : `:${tagOrDigest}`;
    let fullName = `${image.registry.url}/${image.name}${tagOrDigestWithSeparator}`;

    fullName = fullName.replace(/https?:\/\//, '');
    fullName = fullName.replace(/\/v2/, '');
    return fullName;
  }

  /**
   * Return {username, password } or undefined.
   * @returns {}
   */
  // eslint-disable-next-line class-methods-use-this
  getAuthPull(): undefined | { username?: string; password?: string } {
    return undefined;
  }
}

export default Registry;
