import axios, { AxiosRequestConfig } from 'axios';
import ThirdParty from '../ThirdParty';

/**
 * HTTP Trigger implementation
 */
class Http extends ThirdParty<any> {
  /**
   * Get the Trigger configuration schema.
   * @returns {*}
   */
  getConfigurationSchema() {
    return this.joi.object().keys({
      url: this.joi.string().uri({
        scheme: ['http', 'https'],
      }),
      method: this.joi.string().allow('GET').allow('POST').default('POST'),
    });
  }

  /**
   * Send an HTTP Request with new image version details.
   *
   * @param container the container
   * @returns {Promise<void>}
   */
  async trigger(container) {
    return this.sendHttpRequest(container);
  }

  /**
   * Send an HTTP Request with new image versions details.
   * @param containers
   * @returns {Promise<*>}
   */
  async triggerBatch(containers) {
    return this.sendHttpRequest(containers);
  }

  async sendHttpRequest(body) {
    const request: AxiosRequestConfig = {
      method: this.configuration.method,
      url: this.configuration.url,
    };
    if (this.configuration.method === 'POST') {
      request.data = body;
    } else if (this.configuration.method === 'GET') {
      request.url += '?' + body;
    }
    const res = await axios(request);
    if (res.status === 200) {
      return res;
    }
    throw new Error();
  }
}
