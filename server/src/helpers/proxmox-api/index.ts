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

export { proxmoxApi as default } from './constructor';
export { proxmoxApi } from './constructor';
export { type USBHostInfo, type USBInfo, QmMonitor } from './QmMonitor';
export { type ApiRequestable } from './proxy';
export {
  ProxmoxEngine,
  type ProxmoxEngineOptions,
  type ProxmoxEngineOptionsCommon,
  type ProxmoxEngineOptionsPass,
  type ProxmoxEngineOptionsToken,
} from './ProxmoxEngine';

// for stress test
// export { buildApiProxy } from './proxy';
