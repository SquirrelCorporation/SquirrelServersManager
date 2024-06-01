import axios from 'axios';
import ECR from '@aws-sdk/client-ecr';
import type { SSMServicesTypes } from '../../../../../types/typings.d.ts';
import Registry from '../../Registry';

const ECR_PUBLIC_GALLERY_HOSTNAME = 'public.ecr.aws';

/**
 * Elastic Container Registry integration.
 */
class Ecr extends Registry {
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
      const ecr = new ECR.ECR({
        credentials: {
          accessKeyId: this.configuration.accesskeyid,
          secretAccessKey: this.configuration.secretaccesskey,
        },
        region: this.configuration.region,
      });
      console.log(JSON.stringify(ecr));
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

  getAuthPull() {
    return this.configuration.accesskeyid
      ? {
          username: this.configuration.accesskeyid,
          password: this.configuration.secretaccesskey,
        }
      : undefined;
  }
}

export default Ecr;
