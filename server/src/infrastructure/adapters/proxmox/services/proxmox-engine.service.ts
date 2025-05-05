import { URLSearchParams } from 'url';
import axios, { AxiosInstance, RawAxiosRequestHeaders } from 'axios';
import PinoLogger from '../../../../logger';
import { ApiRequestable } from './proxy.service';

const logger = PinoLogger.child({ module: 'ProxmoxEngine' }, { msgPrefix: '[PROXMOX_ENGINE] - ' });

const USER_AGENT = 'proxmox-api (https://github.com/UrielCh/proxmox-api)';

export interface ProxmoxEngineOptionsCommon {
  host: string;
  port?: number;
  schema?: 'https' | 'http';
  authTimeout?: number;
  queryTimeout?: number;
  debug?: 'curl' | 'fetch';
}

export interface ProxmoxEngineOptionsPass extends ProxmoxEngineOptionsCommon {
  username?: string;
  password: string;
}

export interface ProxmoxEngineOptionsToken extends ProxmoxEngineOptionsCommon {
  tokenID: string;
  tokenSecret: string;
}

export type ProxmoxEngineOptions = (ProxmoxEngineOptionsToken | ProxmoxEngineOptionsPass) & {
  fetch?: (url: string | URL, options?: RequestInit) => Promise<Response>; // Optional custom fetch function
};

const baseHeader: RawAxiosRequestHeaders = { Accept: '*/*', 'User-Agent': USER_AGENT };

export class ProxmoxEngine implements ApiRequestable {
  public CSRFPreventionToken?: string;
  public ticket?: string;
  private readonly username: string;
  private readonly password: string;
  private baseUrl: string;
  private authTimeout: number;
  private queryTimeout: number;
  private debug?: 'curl' | 'fetch';
  private axiosInstance: AxiosInstance;
  private customFetch?: (url: string | URL, options?: RequestInit) => Promise<Response>; // Custom fetch function

  constructor(options: ProxmoxEngineOptions) {
    const schema = options.schema || 'https';
    const port = options.port ? `:${options.port}` : '';
    this.baseUrl = `${schema}://${options.host}${port}`;
    this.authTimeout = options.authTimeout || 5000;
    this.queryTimeout = options.queryTimeout || 60000;
    this.debug = options.debug;
    this.customFetch = options.fetch; // Store custom fetch if provided
    logger.info(
      `Connecting to Proxmox API at ${this.customFetch !== undefined ? 'custom' : 'default'} location ${this.baseUrl}`,
    );
    if ('tokenID' in options && options.tokenSecret) {
      this.username = '';
      this.password = '';
      if (!options.tokenID.match(/.*@.+\!.+/)) {
        throw new Error('Invalid tokenID. Format should look like USER@REALM!TOKENID');
      }
      if (
        !options.tokenSecret.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
      ) {
        throw new Error(
          'Invalid tokenSecret, expected lowercased UUID like 12345678-1234-1234-1234-1234567890ab',
        );
      }
      this.ticket = `PVEAPIToken=${options.tokenID}=${options.tokenSecret}`;
    } else {
      const optPass = options as ProxmoxEngineOptionsPass;
      if (!optPass.username || !optPass.password) {
        throw new Error('Username and password are required for Proxmox connection');
      }
      this.username = optPass.username;
      this.password = optPass.password;
    }

    // Initialize Axios Instance as a fallback
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: this.queryTimeout,
      headers: { 'User-Agent': USER_AGENT },
    });
  }

  get host(): string {
    const url = new URL(this.baseUrl);
    return `${url.hostname}${url.port ? `:${url.port}` : ''}`;
  }

  /**
   * Perform a request to the Proxmox API, supporting both Axios and custom fetch
   */
  public async doRequest(
    method: string,
    path: string,
    pathTemplate: string,
    params?: { [key: string]: any },
    retries = 0,
  ): Promise<any> {
    const { CSRFPreventionToken, ticket } = await this.getTicket();

    // Set up headers
    const headers: RawAxiosRequestHeaders = baseHeader;
    if (!this.username) {
      headers.Authorization = ticket; // Token-based auth
    } else {
      headers.cookie = `PVEAuthCookie=${ticket}`;
      headers.CSRFPreventionToken = CSRFPreventionToken;
    }

    const url = `${this.baseUrl}${path}`;
    let body: any = undefined;

    // Handle query params or POST/PUT body
    if (params && typeof params === 'object') {
      if (method === 'POST' || method === 'PUT') {
        body = new URLSearchParams(params).toString();
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
    }

    // Custom fetch logic if the `fetch` option is provided
    if (this.customFetch) {
      const fetchOptions: RequestInit = {
        method,
        headers: headers as Record<string, string>, // Fetch uses this format
        body: body || null,
      };

      try {
        const response = await this.customFetch(url, fetchOptions);
        if (!response.ok) {
          throw new Error(`Fetch failed with status ${response.status}`);
        }
        const responseData = await response.json();
        return (responseData as any).data;
      } catch (error) {
        this.debugRequest(method, path, headers, params, body, error);
        retries++;
        if (retries < 2) {
          return this.doRequest(method, path, pathTemplate, params, retries);
        }
        throw error;
      }
    }

    // Fallback to Axios if no custom fetch
    try {
      const response = await this.axiosInstance.request({
        method: method.toUpperCase() as any,
        url: path,
        headers,
        data: body, // Used for POST/PUT body
        params: method === 'GET' || method === 'DELETE' ? params : undefined, // Query params for GET/DELETE
      });

      return response.data?.data; // Return the `data` field from Proxmox API response
    } catch (error: any) {
      this.debugRequest(method, path, headers, params, body, error);

      retries++;
      if (retries < 2) {
        return this.doRequest(method, path, pathTemplate, params, retries);
      }

      throw new Error(`Request failed with method "${method}" to "${path}": ${error.message}`);
    }
  }

  /**
   * Debug the request in `curl` or `fetch` format
   */
  private debugRequest(
    method: string,
    path: string,
    headers: RawAxiosRequestHeaders,
    params: any,
    body: any,
    error: any,
  ): void {
    if (this.debug === 'curl') {
      const authHeader = headers.Authorization
        ? `-H "Authorization: ${headers.Authorization}"`
        : `-H "CSRFPreventionToken: ${headers.CSRFPreventionToken}" --cookie "${headers.cookie}"`;
      const dataString = body ? `--data '${body}'` : '';
      logger.error(
        `curl -X ${method.toUpperCase()} ${authHeader} ${dataString} ${this.baseUrl}${path}`,
      );
    } else if (this.debug === 'fetch') {
      const fetchOptions = {
        method: method.toUpperCase(),
        headers,
        body,
      };
      logger.error(`fetch("${this.baseUrl}${path}", ${JSON.stringify(fetchOptions, null, 2)});`);
    } else {
      logger.error(`Request failed: ${error.message}`);
    }
  }

  /**
   * Obtain the ticket/token. Login if not available.
   */
  private async getTicket(): Promise<{ ticket: string; CSRFPreventionToken: string }> {
    if (this.ticket) {
      if (!this.username) {
        return { ticket: this.ticket, CSRFPreventionToken: '' };
      }
      if (this.CSRFPreventionToken) {
        return { ticket: this.ticket, CSRFPreventionToken: this.CSRFPreventionToken };
      }
    }

    const url = `${this.baseUrl}/api2/json/access/ticket`;
    const body = new URLSearchParams({
      username: this.username,
      password: this.password,
    }).toString();

    // Use custom fetch for login
    if (this.customFetch) {
      const fetchOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': body.length.toString(),
        },
        body,
      };

      try {
        logger.info('getTicket - Logging in with custom fetch');
        const response = await this.customFetch(url, fetchOptions);
        logger.debug('getTicket - Custom fetch response' + JSON.stringify(response));
        if (!response.ok) {
          throw new Error(`Authentication failed with status ${response.status}`);
        }
        const responseData = await response.json();
        const { ticket, CSRFPreventionToken } = (responseData as any).data;
        this.ticket = ticket;
        this.CSRFPreventionToken = CSRFPreventionToken;
        return { ticket, CSRFPreventionToken };
      } catch (error: any) {
        throw new Error(`Authentication failed: ${error.message}`);
      }
    }

    // Fallback to Axios for login
    try {
      logger.info('getTicket - Logging in with default Axios');
      const response = await this.axiosInstance.post(url, body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': body.length.toString(),
        },
        timeout: this.authTimeout,
      });

      const { ticket, CSRFPreventionToken } = response.data.data;
      this.ticket = ticket;
      this.CSRFPreventionToken = CSRFPreventionToken;
      return { ticket, CSRFPreventionToken };
    } catch (error: any) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }
}

export default ProxmoxEngine;
