// Proxmox-API Interactive proxmox API for developpers how do not like reading docs
// Copyright (C) 2020-2022  Chemouni Uriel <uchemouni@gmail.com>
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { URL } from 'url';
import { RequestInit, Response, fetch } from 'undici';
import { type ApiRequestable } from './proxy';

const USER_AGENT = 'proxmox-api';

/**
 * Common Proxmox authentification properties
 */
export interface ProxmoxEngineOptionsCommon {
  /**
   * Proxmox address
   * currently used as hostname, so it can not contains a port number.
   */
  host: string;
  /**
   * Proxmox connexion port, default is 8006
   */
  port?: number;
  /**
   * http protocol, can be http or https, default is https
   */
  schema?: 'https' | 'http';
  /**
   * separated timeout for authentification call, default is 5 second
   */
  authTimeout?: number;
  /**
   * timeout for proxmox request, default is 60 seconds
   */
  queryTimeout?: number;
  /**
   * print the request in curl or fetch format
   */
  debug?: 'curl' | 'fetch';
}

/**
 * Proxmox authentification as user / password
 */
export interface ProxmoxEngineOptionsPass extends ProxmoxEngineOptionsCommon {
  /**
   * Your username, if not specified will use root@pam
   */
  username?: string;
  /**
   * The password
   */
  password: string;
}

/**
 * Proxmox authentification as tokenID / tokenSecret
 */
export interface ProxmoxEngineOptionsToken extends ProxmoxEngineOptionsCommon {
  tokenID: string;
  tokenSecret: string;
}

// type FetchInterface = typeof fetch;
export type FetchInterface = (url: string | URL, options?: RequestInit) => Promise<Response>;

/**
 * Type Union for proxmox Authentification options
 */
export type ProxmoxEngineOptions = (ProxmoxEngineOptionsToken | ProxmoxEngineOptionsPass) & {
  fetch?: FetchInterface;
};

const baseHeader: { [key: string]: string } = { Accept: '*/*', 'User-Agent': USER_AGENT };

/**
 * Default Proxmox doRequest provider, this Class will be used if you provide Proxmox authentication options to the Proxy generator
 */
export class ProxmoxEngine implements ApiRequestable {
  public CSRFPreventionToken?: string;
  public ticket?: string;
  private readonly username: string;
  private readonly password: string;
  private hostname: string; // was named host
  private port?: number;
  private readonly schema: 'http' | 'https';
  private authTimeout: number;
  private queryTimeout: number;
  private debug?: 'curl' | 'fetch';
  private fetch: FetchInterface;

  constructor(options: ProxmoxEngineOptions) {
    //if ((options as ProxmoxEngineOptionsToken).tokenID) {
    this.fetch = options.fetch || fetch;
    if ('tokenID' in options && options.tokenSecret) {
      //const optToken = options as ProxmoxEngineOptionsToken;
      this.username = '';
      this.password = '';
      if (!options.tokenID.match(/.*@.+\!.+/)) {
        const msg = 'invalid tokenID, format should look be like USER@REALM!TOKENID';
        console.error(msg);
        throw Error(msg);
      }
      if (
        !options.tokenSecret.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
      ) {
        const msg =
          'invalid tokenSecret, format should be an lowercased UUID like 12345678-1234-1234-1234-1234567890ab';
        console.error(msg);
        throw Error(msg);
      }
      // USER@REALM!TOKENID
      this.ticket = `PVEAPIToken=${options.tokenID}=${options.tokenSecret}`;
    } else {
      const optPass = options as ProxmoxEngineOptionsPass;
      this.username = optPass.username || 'root@pam';
      this.password = optPass.password;
      if (!this.password) {
        const msg = `password is missing for Proxmox connection`;
        console.error(msg);
        throw Error(msg);
      }
    }
    this.hostname = options.host;
    this.port = options.port;
    this.schema = options.schema || 'https';
    this.authTimeout = options.authTimeout || 5000;
    this.queryTimeout = options.queryTimeout || 60000;
    this.debug = options.debug;
  }

  get host(): string {
    if (!this.port) {
      return this.hostname;
    }
    return `${this.hostname}:${this.port}`;
  }

  /**
   *
   * @param method http method GET POST PUT of DELETE
   * @param path http path
   * @param pathTemplate http path without var replacements *
   * @param params query params
   * @param retries retries id
   * @returns data from remote response
   */
  public async doRequest(
    method: string,
    path: string,
    pathTemplate: string,
    params?: { [key: string]: any },
    retries = 0,
  ): Promise<any> {
    const { CSRFPreventionToken, ticket } = await this.getTicket();
    // ensure that method is uppercased
    method = method.toUpperCase();
    // Remove null / undefined values once
    if (!retries && params) {
      for (const k in params) {
        if (
          Object.prototype.hasOwnProperty.call(params, k) &&
          (params[k] === null || params[k] === undefined)
        ) {
          delete params[k];
        }
      }
    }
    const headers = { ...baseHeader };
    // auth
    if (!this.username) {
      headers.Authorization = ticket; // PVEAPIToken=USER@REALM!TOKENID=UUID
    } else {
      headers.cookie = `PVEAuthCookie=${ticket}`;
      headers.CSRFPreventionToken = CSRFPreventionToken;
    }
    // parameters
    let body: any | undefined = undefined;

    // proxmox base url
    const requestUrl = new URL(`${this.schema}://${this.host}${path}`);

    if (typeof params === 'object' && Object.keys(params).length > 0) {
      let searchParams: URLSearchParams;
      if (method === 'PUT' || method === 'POST') {
        searchParams = new URLSearchParams();
      } else {
        searchParams = requestUrl.searchParams as URLSearchParams;
      }
      for (const k of Object.keys(params)) {
        const v = params[k];
        if (v === true) {
          searchParams.set(k, '1');
        } else if (v === false) {
          searchParams.set(k, '0');
        } else if (Array.isArray(v)) {
          for (const e of v) {
            searchParams.append(k, `${e}`);
          }
        } else {
          searchParams.set(k, `${v}`);
        }
      }
      if (method === 'PUT' || method === 'POST') {
        body = searchParams.toString();
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        headers['Content-Length'] = body.length.toString();
      }
    }
    let res: Response | null = null;
    const fetchInit: RequestInit = { method, body, headers };

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), this.queryTimeout);
      fetchInit.signal = controller.signal;
      res = await this.fetch(requestUrl, fetchInit);
      clearTimeout(id);
    } catch (e) {
      // console.log(error.name === 'AbortError');
      // debug as CURL
      if (this.debug) {
        if (this.debug === 'curl') {
          let auth = '';
          if (headers.cookie) {
            auth = `-H "CSRFPreventionToken: ${CSRFPreventionToken}" --cookie ${JSON.stringify(headers.cookie)}`;
          } else {
            auth = `-H "Authorization: ${ticket}" --cookie ${JSON.stringify(headers.cookie)}`;
          }
          let data = '';
          if (body) {
            data = `--data ${JSON.stringify(body)}`;
          }
          if (method === 'POST') {
            console.log(`curl -v --insecure  ${auth} ${data} ${requestUrl}`);
          } else if (method === 'GET') {
            console.log(`curl -v --insecure ${auth} ${requestUrl}`);
          } else {
            console.log(`curl -v -X ${method} ${auth} ${data} ${requestUrl}`);
          }
        } else if (this.debug === 'fetch') {
          // debug as fetch
          console.log(`fetch("${requestUrl}", ${JSON.stringify(fetchInit)})`);
        }
      }
      retries++;
      if (retries < 2) {
        return this.doRequest(method, path, pathTemplate, params, retries);
      }

      // throw Error
      let errMsg = `Failed to call ${method} ${requestUrl}`;
      const err = e as any;
      if (err.cause && err.cause.message) {
        errMsg += ` cause by:${err.cause.message}`;
      }
      const error = Error(errMsg);
      (error as any).cause = e;
      throw error;
    }
    if (res === null) {
      throw Error(`Failed to fetch ${method} ${requestUrl} return null`);
    }
    const contentType = res.headers.get('content-type');
    let data: { data: any; errors?: any } = { data: null };
    if (contentType === 'application/json;charset=UTF-8') {
      try {
        data = (await res.json()) as { data: any; errors?: any };
      } catch {
        data.errors = 'Failed to parse response json';
      }
    } else if (contentType === 'application/octet-stream') {
      data.data = res.body;
    } else if (!contentType) {
      data.errors = '';
      try {
        data.errors = await res.text(); // await req.text();
      } catch {
        // ignore reading error;
      }
    } else {
      // should never append
      throw Error(
        `${method} ${requestUrl} unexpected contentType "${contentType}" status Line:${res.status} ${res.text}`,
      );
      // data.data = req.text();
    }
    switch (res.status) {
      case 400:
        throw Error(
          `${method} ${requestUrl} return Error ${res.status} ${res.statusText}: ${JSON.stringify(data)}`,
        );
      case 500:
        throw Error(
          `${method} ${requestUrl} return Error ${res.status} ${res.statusText}: ${JSON.stringify(data)}`,
        );
      case 401:
        if (
          res.statusText === 'invalid PVE ticket' ||
          res.statusText === 'permission denied - invalid PVE ticket'
        ) {
          this.ticket = undefined;
          if (!this.username) {
            retries = 10;
          }
          retries++;
          if (retries < 2) {
            return this.doRequest(method, path, pathTemplate, params, retries);
          }
        }
        throw Error(
          `${method} ${requestUrl} return Error ${res.status} ${res.statusText}: ${JSON.stringify(data)}`,
        );
      case 200:
        return data.data;
      default:
        throw Error(
          `${method} ${requestUrl} connection failed with ${res.status} ${res.statusText} return: ${JSON.stringify(data)}`,
        );
    }
  }

  /**
   * return the current ticket/token, or create new ones, is previous one had been discared, or missing.
   * @returns Proxmox API ticket and CSRFPreventionToken
   */
  public async getTicket(): Promise<{ ticket: string; CSRFPreventionToken: string }> {
    if (this.ticket) {
      if (!this.username) {
        return { ticket: this.ticket, CSRFPreventionToken: '' };
      }
      if (this.CSRFPreventionToken) {
        return { ticket: this.ticket, CSRFPreventionToken: this.CSRFPreventionToken };
      }
    }

    // update ticket endpoint
    const requestUrl = `${this.schema}://${this.host}/api2/json/access/ticket`;

    try {
      const { password, username } = this;
      const body = new URLSearchParams({ username, password }).toString();
      const headers = {
        ...baseHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': body.length.toString(),
      };
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), this.authTimeout);
      const method = 'POST';
      const { signal } = controller;
      const r = await this.fetch(requestUrl, { method, headers, signal, body });
      clearTimeout(id);
      const text = await r.text();
      if (r.status !== 200) {
        throw Error(`login failed with ${r.status}: ${r.statusText} ${text}`);
      }
      const respObj = JSON.parse(text) as {
        data: { cap: any; ticket: string; CSRFPreventionToken: string; username: string };
      };
      const { CSRFPreventionToken, ticket } = respObj.data;
      this.CSRFPreventionToken = CSRFPreventionToken;
      this.ticket = ticket;
      return { ticket, CSRFPreventionToken };
    } catch (e) {
      const error = Error(`Auth ${requestUrl} Failed!`);
      (error as any).cause = e;
      throw error;
    }
  }
}

export default ProxmoxEngine;
