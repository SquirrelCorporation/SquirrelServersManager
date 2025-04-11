import { HTTPSAgent } from 'ssh2';
import axios, { AxiosRequestConfig } from 'axios';
import PinoLogger from '../../../logger';

const logger = PinoLogger.child({ module: 'SshTunnel' }, { msgPrefix: '[SSH_TUNNEL] - ' });

export const createSshFetch = (connectConfig: any, ignoreSslErrors: boolean) => {
  // Create an HTTPSAgent with the ssh2 client configuration
  logger.debug(
    `Creating SSH agent with config: ${JSON.stringify(connectConfig)} - ignoreSslErrors: ${ignoreSslErrors} `,
  );
  const agent = new HTTPSAgent(connectConfig, {
    rejectUnauthorized: !ignoreSslErrors, // Ignore SSL cert errors
  });
  const makeRequest = async (
    input: string | URL,
    requestInit?: RequestInit,
    redirectCount: number = 0,
  ): Promise<any> => {
    try {
      const parsedUrl = new URL(input.toString());

      // Axios configuration
      const axiosConfig = {
        url: parsedUrl.toString(),
        method: requestInit?.method || 'GET',
        headers: requestInit?.headers,
        data: requestInit?.body,
        maxRedirects: redirectCount > 0 ? 5 - redirectCount : 5, // Handle redirects with a cap
        httpsAgent: agent, // Set the HTTPS agent for the SSH tunnel
      } as AxiosRequestConfig;

      const response = await axios(axiosConfig);

      // Handle redirects manually if needed
      if (response.status >= 300 && response.status < 400 && response.headers.location) {
        if (redirectCount >= 5) {
          throw new Error('Too many redirects');
        }

        const redirectUrl = new URL(response.headers.location, parsedUrl.toString()).toString();
        logger.error(`Redirecting to ${redirectUrl}`);
        return makeRequest(redirectUrl, requestInit, redirectCount + 1);
      }
      logger.debug('Response:' + JSON.stringify(response.data));
      // Return successful response
      return new Response(JSON.stringify(response.data), {
        status: response.status,
        statusText: response.statusText,
      });
    } catch (error: any) {
      logger.error(`Request failed with error: ${error.message}`);
      throw error;
    }
  };

  return async (input: string | URL, requestInit?: RequestInit): Promise<Response> => {
    return makeRequest(input, requestInit);
  };
};
