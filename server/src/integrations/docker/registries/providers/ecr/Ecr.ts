import axios from 'axios';
import { SSMServicesTypes } from '../../../typings';
import Registry from '../../Registry';

const ECR_PUBLIC_GALLERY_HOSTNAME = 'public.ecr.aws';

/**
 * Elastic Container Registry integration.
 */
export default class Ecr extends Registry {
  getConnectedConfigurationSchema() {
    return [
      {
        name: 'accesskeyid',
        type: 'string',
      },
      {
        name: 'secretaccesskey',
        type: 'string',
      },
      {
        name: 'region',
        type: 'string',
      },
    ];
  }

  // @ts-expect-error alternatives types
  getConfigurationSchema() {
    return this.joi.alternatives([
      this.joi.object().allow({}),
      this.joi.object().keys({
        accesskeyid: this.joi.string().required(),
        secretaccesskey: this.joi.string().required(),
        region: this.joi.string().required(),
      }),
    ]);
  }

  /**
   * Sanitize sensitive data
   * @returns {*}
   */
  maskConfiguration() {
    return {
      ...this.configuration,
      accesskeyid: Ecr.mask(this.configuration.accesskeyid),
      secretaccesskey: Ecr.mask(this.configuration.secretaccesskey),
      region: this.configuration.region,
    };
  }

  /**
   * Return true if image has not registryUrl.
   * @param image the image
   * @returns {boolean}
   */
  // eslint-disable-next-line class-methods-use-this
  match(image: SSMServicesTypes.Image) {
    this.childLogger.info(`[ECR] - match`);
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
  // eslint-disable-next-line class-methods-use-this
  normalizeImage(image: SSMServicesTypes.Image) {
    const imageNormalized = image;
    imageNormalized.registry.name = 'ecr';
    if (!imageNormalized.registry.url.startsWith('https://')) {
      imageNormalized.registry.url = `https://${imageNormalized.registry.url}/v2`;
    }
    return imageNormalized;
  }

  async authenticate(
    image: SSMServicesTypes.Image,
    requestOptions: SSMServicesTypes.RequestOptionsType,
  ) {
    const requestOptionsWithAuth = requestOptions;
    // Private registry
    if (this.configuration.accesskeyid && this.configuration.secretaccesskey) {
      const ECR = await import('aws-sdk/clients/ecr.js');
      const ecr = new ECR.default({
        credentials: {
          accessKeyId: this.configuration.accesskeyid,
          secretAccessKey: this.configuration.secretaccesskey,
        },
        region: this.configuration.region,
      });
      const authorizationToken = await ecr.getAuthorizationToken().promise();
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

  getAuthPull() {
    return this.configuration.accesskeyid
      ? {
          username: this.configuration.accesskeyid,
          password: this.configuration.secretaccesskey,
        }
      : undefined;
  }
}
