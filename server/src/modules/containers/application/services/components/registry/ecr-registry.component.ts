import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ECR } from '@aws-sdk/client-ecr';
import { AbstractRegistryComponent } from '@modules/containers/application/services/components/registry/abstract-registry.component';
import { Image, RequestOptionsType } from '@modules/containers/types';
import PinoLogger from '../../../../../../logger';

const logger = PinoLogger.child(
  { module: 'EcrRegistryComponent' },
  { msgPrefix: '[ECR_REGISTRY] - ' },
);
const ECR_PUBLIC_GALLERY_HOSTNAME = 'public.ecr.aws';

/**
 * Elastic Container Registry integration.
 */
@Injectable()
export class EcrRegistryComponent extends AbstractRegistryComponent {
  /**
   * Initialize the ECR registry component
   */
  async init(): Promise<void> {
    logger.info(`Initializing ECR registry: ${this.name}`);
  }

  /**
   * Get the configuration schema for validation
   */
  getConfigurationSchema() {
    return this.joi.alternatives().try(
      this.joi.object().optional().keys({
        name: this.joi.string().optional(),
        provider: this.joi.string().optional(),
        accesskeyid: this.joi.string().required(),
        secretaccesskey: this.joi.string().required(),
        region: this.joi.string().required(),
      }),
      this.joi.object().equal({}),
    );
  }

  /**
   * Sanitize sensitive data
   */
  maskConfiguration() {
    return {
      ...this.configuration,
      accesskeyid: AbstractRegistryComponent.mask(this.configuration.accesskeyid),
      secretaccesskey: AbstractRegistryComponent.mask(this.configuration.secretaccesskey),
      region: this.configuration.region,
    };
  }

  /**
   * Return true if image has not registryUrl.
   * @param image the image
   * @returns {boolean}
   */
  match(image: Image): boolean {
    return (
      /^.*\.dkr\.ecr\..*\.amazonaws\.com$/.test(image.registry.url) ||
      image.registry.url === ECR_PUBLIC_GALLERY_HOSTNAME
    );
  }

  /**
   * Normalize image according to AWS ECR characteristics.
   * @param image
   * @returns {*}
   */
  normalizeImage(image: Image): Image {
    const imageNormalized = image;
    imageNormalized.registry.name = 'ecr';
    if (!imageNormalized.registry.url.startsWith('https://')) {
      imageNormalized.registry.url = `https://${imageNormalized.registry.url}/v2`;
    }
    return imageNormalized;
  }

  /**
   * Authenticate to ECR registry
   */
  async authenticate(
    image: Image,
    requestOptions: RequestOptionsType,
  ): Promise<RequestOptionsType> {
    const requestOptionsWithAuth = requestOptions;
    // Private registry
    if (this.configuration.accesskeyid && this.configuration.secretaccesskey) {
      const ecr = new ECR({
        credentials: {
          accessKeyId: this.configuration.accesskeyid,
          secretAccessKey: this.configuration.secretaccesskey,
        },
        region: this.configuration.region,
      });
      const authorizationToken = await ecr.getAuthorizationToken();
      if (requestOptionsWithAuth.headers) {
        if (authorizationToken.authorizationData && authorizationToken.authorizationData[0]) {
          const tokenValue = authorizationToken.authorizationData[0].authorizationToken;
          requestOptionsWithAuth.headers.Authorization = `Basic ${tokenValue}`;
        }
      }
      // Public ECR gallery
    } else if (image.registry.url.includes(ECR_PUBLIC_GALLERY_HOSTNAME)) {
      const response = await axios.request({
        method: 'GET',
        url: 'https://public.ecr.aws/token/',
        headers: {
          Accept: 'application/json',
        },
      });
      if (requestOptionsWithAuth.headers) {
        requestOptionsWithAuth.headers.Authorization = `Bearer ${response.data.token}`;
      }
    }
    return requestOptionsWithAuth;
  }

  /**
   * Get authentication information for pull
   */
  getAuthPull(): undefined | { username?: string; password?: string } {
    return this.configuration.accesskeyid
      ? {
          username: this.configuration.accesskeyid,
          password: this.configuration.secretaccesskey,
        }
      : undefined;
  }
}
