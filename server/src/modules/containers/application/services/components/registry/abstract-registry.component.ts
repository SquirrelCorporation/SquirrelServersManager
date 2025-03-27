import axios, { AxiosRequestConfig } from 'axios';
import Joi from 'joi';
import {
  ConfigurationRegistrySchema,
  Image,
  Manifest,
  RequestOptionsType,
} from '@modules/containers/types';
import { Component } from '../../../../domain/components/component.interface';
import { Kind } from '../../../../domain/components/kind.enum';
import PinoLogger from '../../../../../../logger';

const logger = PinoLogger.child(
  { module: 'AbstractRegistryComponent' },
  { msgPrefix: '[ABSTRACT_REGISTRY] - ' },
);

/**
 * Docker Registry Abstract class.
 * Base class for all registry implementations.
 */
export abstract class AbstractRegistryComponent implements Component<ConfigurationRegistrySchema> {
  protected id: string;
  protected name: string;
  protected provider: string;
  protected kind: Kind;
  protected type: string;
  protected childLogger: any;
  protected joi = Joi;
  public configuration!: ConfigurationRegistrySchema;

  constructor() {
    this.kind = Kind.REGISTRY;
    this.childLogger = logger;
    this.id = 'unknown';
    this.type = 'unknown';
    this.name = 'unknown';
    this.provider = 'unknown';
  }

  /**
   * Encode Base64(login:password)
   * @param login
   * @param token
   * @returns {string}
   */
  static base64Encode(login: string, token: string): string {
    return Buffer.from(`${login}:${token}`, 'utf-8').toString('base64');
  }

  /**
   * Mask sensitive data
   * @param value
   * @returns {string}
   */
  static mask(value: string | undefined): string {
    if (!value) {
      return '';
    }
    if (value.length <= 8) {
      return '*'.repeat(value.length);
    }
    return value.substring(0, 3) + '*'.repeat(value.length - 6) + value.substring(value.length - 3);
  }

  /**
   * Get the component's ID
   */
  getId(): string {
    return this.type;
  }

  /**
   * Get the component's name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get the component's provider
   */
  getProvider(): string {
    return this.provider;
  }

  /**
   * Get the component's kind
   */
  getKind(): Kind {
    return this.kind;
  }

  /**
   * Register the component
   */
  async register(
    id: string,
    kind: Kind,
    provider: string,
    name: string,
    configuration: ConfigurationRegistrySchema,
  ): Promise<Component<ConfigurationRegistrySchema>> {
    logger.info(`Registering registry component ${provider}/${name}`);
    this.id = `${kind}.${provider}.${name}`;
    this.kind = kind;
    this.provider = provider;
    this.name = name;
    this.type = provider;
    this.configuration = { ...configuration };

    // Initialize component-specific settings
    await this.init();

    return this;
  }

  /**
   * Deregister the component
   */
  async deregister(): Promise<void> {
    logger.info(`Deregistering registry component ${this.provider}/${this.name}`);
  }

  /**
   * Update the component configuration
   */
  async update(
    configuration: ConfigurationRegistrySchema,
  ): Promise<Component<ConfigurationRegistrySchema>> {
    logger.info(`Updating registry component ${this.provider}/${this.name}`);
    this.configuration = { ...configuration };

    // Re-initialize with new configuration
    await this.init();

    return this;
  }

  /**
   * Initialize the registry with configuration
   * To be implemented by specific registry implementations
   */
  abstract init(): Promise<void>;

  /**
   * Get the configuration schema for validation
   */
  abstract getConfigurationSchema(): Joi.ObjectSchema<any> | Joi.AlternativesSchema<any>;

  /**
   * Sanitize sensitive data
   */
  abstract maskConfiguration(): any;

  /**
   * If this registry is responsible for the image (to be overridden).
   * @param image the image
   * @returns {boolean}
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  match(image: Image): boolean {
    return false;
  }

  /**
   * Normalize image according to Registry Custom characteristics (to be overridden).
   * @param image
   * @returns {*}
   */
  normalizeImage(image: Image): Image {
    return image;
  }

  /**
   * Authenticate and set authentications value to requestOptions.
   * @param image
   * @param requestOptions
   * @returns {*}
   */
  async authenticate(
    image: Image,
    requestOptions: RequestOptionsType,
  ): Promise<RequestOptionsType> {
    return requestOptions;
  }

  /**
   * Get Tags.
   * @param image
   * @returns {*}
   */
  async getTags(image: Image): Promise<string[]> {
    this.childLogger.debug(`getTags- Get "${image.name}" tags`);
    const tags: string[] = [];
    let page;
    let hasNext = true;
    let link;
    while (hasNext) {
      const lastItem = page ? page.data.tags[page.data.tags.length - 1] : undefined;

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
  getTagsPage(image: Image, lastItem: string | undefined = undefined, link?: string): Promise<any> {
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
    image: Image,
    digest?: string,
  ): Promise<{ digest: string; version: number; created?: string }> {
    const tagOrDigest = digest || image.tag.value;
    let manifestDigestFound: string | undefined = undefined;
    let manifestMediaType: string | undefined = undefined;
    this.childLogger.debug(
      `getImageManifestDigest - Get "${image.name}:${tagOrDigest}" manifest...`,
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
        this.childLogger.debug('getImageManifestDigest - Manifests found with schemaVersion = 2');
        this.childLogger.debug(
          `getImageManifestDigest - Manifests media type detected [${responseManifests.mediaType}]`,
        );
        if (
          responseManifests.mediaType ===
            'application/vnd.docker.distribution.manifest.list.v2+json' ||
          responseManifests.mediaType === 'application/vnd.oci.image.index.v1+json'
        ) {
          this.childLogger.debug(
            `getImageManifestDigest - Filter manifest for [arch=${image.architecture}, os=${image.os}, variant=${image.variant}]`,
          );
          let manifestFound: any;
          const manifestFounds = responseManifests.manifests.filter(
            (manifest: Manifest) =>
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
              (manifest: Manifest) => manifest.platform.variant === image.variant,
            );

            // Manifest exactly matching with variant? Select it
            if (manifestFoundFilteredOnVariant) {
              manifestFound = manifestFoundFilteredOnVariant;
            }
          }

          if (manifestFound) {
            this.childLogger.debug(
              `getImageManifestDigest - Manifest found with [digest=${manifestFound.digest}, mediaType=${manifestFound.mediaType}]`,
            );
            manifestDigestFound = manifestFound.digest;
            manifestMediaType = manifestFound.mediaType;
          }
        } else if (
          responseManifests.mediaType === 'application/vnd.docker.distribution.manifest.v2+json' ||
          responseManifests.mediaType === 'application/vnd.oci.image.manifest.v1+json'
        ) {
          this.childLogger.debug(
            `getImageManifestDigest - Manifest found with [digest=${responseManifests.config.digest}, mediaType=${responseManifests.config.mediaType}]`,
          );
          manifestDigestFound = responseManifests.config.digest;
          manifestMediaType = responseManifests.config.mediaType;
        }
      } else if (responseManifests.schemaVersion === 1) {
        this.childLogger.debug('getImageManifestDigest - Manifests found with schemaVersion = 1');
        const v1Compat = JSON.parse(responseManifests.history[0].v1Compatibility);
        const manifestFound = {
          digest: v1Compat.config ? v1Compat.config.Image : undefined,
          created: v1Compat.created,
          version: 1,
        };
        this.childLogger.debug(
          `getImageManifestDigest - Manifest found for image ${image.name} with [digest=${manifestFound.digest}, created=${manifestFound.created}, version=${manifestFound.version}]`,
        );
        return manifestFound;
      }
      if (
        (manifestDigestFound &&
          manifestMediaType === 'application/vnd.docker.distribution.manifest.v2+json') ||
        (manifestDigestFound && manifestMediaType === 'application/vnd.oci.image.manifest.v1+json')
      ) {
        this.childLogger.debug(
          'getImageManifestDigest - Calling registries to get docker-content-digest header',
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
        this.childLogger.debug(
          `getImageManifestDigest - Manifest found for image ${image.name}  with [digest=${manifestFound.digest}, version=${manifestFound.version}]`,
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
          `getImageManifestDigest - Manifest found with [digest=${manifestFound.digest}, version=${manifestFound.version}]`,
        );
        return manifestFound;
      }
    }
    // Empty result...
    throw new Error(
      `getImageManifestDigest - Unexpected error; no manifest found for image for image "${image.name}"`,
    );
  }

  async callRegistry({
    image,
    url,
    method = 'get',
    headers = {
      Accept: 'application/json',
    },
  }: {
    image: Image;
    url: string;
    method?: string;
    headers?: { Accept?: string; Authorization?: string };
  }): Promise<any> {
    try {
      const getRequestOptions: AxiosRequestConfig = {
        url: url,
        method,
        headers,
      };
      this.childLogger.debug(`callRegistry ${JSON.stringify(getRequestOptions)}`);
      const getRequestOptionsWithAuth = await this.authenticate(image, getRequestOptions);
      return await axios.request(getRequestOptionsWithAuth);
    } catch (error: any) {
      this.childLogger.error(
        `Error calling registry ${url} with "${error?.message}" for image: "${image.name}" (${error?.stack})`,
      );
      throw new Error(
        `Error calling registry ${url} with "${error?.message}" for image: "${image.name}"`,
      );
    }
  }

  getImageFullName(image: Image, tagOrDigest: string): string {
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
  getAuthPull(): undefined | { username?: string; password?: string } {
    return undefined;
  }
}
