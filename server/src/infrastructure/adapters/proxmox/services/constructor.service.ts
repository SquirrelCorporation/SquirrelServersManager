// Proxmox-API Interactive proxmox API for developpers how do not like reading docs
// Copyright (C) 2020-2022  Chemouni Uriel <uchemouni@gmail.com>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
import { ProxmoxModel } from 'ssm-shared-lib';
import ProxmoxEngine from './proxmox-engine.service';
import { ApiRequestable, buildApiProxy } from './proxy.service';
import { ProxmoxEngineOptions } from './proxmox-engine.service';

function isProxmoxEngine(val: ProxmoxEngineOptions | ApiRequestable): val is ApiRequestable {
  return 'doRequest' in val;
}

/**
 * Default main package function, this function return a javascript Proxy to use your proxmox API.
 *
 * @param options authentification option or a doRequest provider.
 *
 * @returns the proxy object
 */
export function proxmoxApi(options: ProxmoxEngineOptions | ApiRequestable): ProxmoxModel.Api {
  if (isProxmoxEngine(options)) {
    return buildApiProxy(options, '/api2/json');
  } else {
    return buildApiProxy(new ProxmoxEngine(options), '/api2/json');
  }
}

export default proxmoxApi;
