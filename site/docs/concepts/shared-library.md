---
layout: FeatureGuideLayout
title: "Shared Library (@shared-lib)"
icon: 📚
time: 15 min read
signetColor: '#3498db' # Blue for Concepts
credits: true
---

:::tip In a Nutshell (🌰)
- `@shared-lib` centralizes common Enums, Types, Interfaces, Validation logic, and Form definitions for SSM.
- Ensures type safety and consistent data structures across the backend, frontend, and plugins.
- Key exports include status enums, API type definitions, validation schemas, and form structures.
:::

## Introduction to @shared-lib

The `@shared-lib` is a vital internal TypeScript library for Squirrel Servers Manager. It provides a single source of truth for data structures, enumerations, type definitions, and other shared logic used throughout the SSM ecosystem. This includes the main server, the web client, and any plugins.

Utilizing `@shared-lib` offers several benefits:
- **Consistency**: Ensures all parts of the application operate with the same understanding of data and states.
- **Type Safety**: Leverages TypeScript to catch errors at compile-time and improve code reliability.
- **Reduced Duplication**: Avoids redefining the same types or enums in multiple places.
- **Simplified Development**: Makes it easier to develop new features and plugins by providing well-defined shared modules.

## Core Exports Overview

The `index.ts` file in `@shared-lib/src` exports several modules, namespaced for clarity. Here's an overview of the primary exports:

### Enums

#### `SsmStatus` (from `./enums/status.ts`)
Defines various status codes used within SSM.

**`DeviceStatus`**
Indicates the state of a managed device.
```typescript
export enum DeviceStatus {
  REGISTERING = 0, // Device is in the process of being registered
  ONLINE = 1,      // Device is online and responsive
  OFFLINE = 2,     // Device is not reachable
  UNMANAGED = 3,   // Device is known but not actively managed
}
```

**`ContainerStatus`**
Indicates the state of a container.
```typescript
export enum ContainerStatus {
  RUNNING = 'running',
  PAUSED = 'paused',
  UNREACHABLE = 'unreachable',
  STOPPED = 'stopped'
}
```

#### Other Enum Exports
- **`SettingsKeys`** (from `./enums/settings.ts`): Likely contains keys for application settings.
- **`SsmProxmox`** (from `./enums/proxmox.ts`): Enums related to Proxmox integration.
- **`SsmAnsible`** (from `./enums/ansible.ts`): Enums specific to Ansible operations.
- **`StatsType`** (from `./enums/stats.ts`): Defines types for statistics collection.
- **`Repositories`** (from `./enums/repositories.ts`): Enums for repository types or states.
- **`SsmContainer`** (from `./enums/container.ts`): Broader container-related enums.
- **`SsmAgent`** (from `./enums/agent.ts`): Enums related to SSM agent operations or types.
- **`SsmAlert`** (from `./enums/alert.ts`): Enums for alert types or severities.
- **`SsmGit`** (from `./enums/git.ts`): Enums related to Git operations (e.g., for repositories).
- **`SsmDeviceDiagnostic`** (from `./enums/diagnostic.ts`): Enums for device diagnostic states or types.

### Types

#### `API` (from `./types/api.ts`)
Contains general type definitions for SSM's API request/response structures.
*(Content of `./types/api.ts` would be detailed here if read)*

#### `AnsibleAPI` (from `./types/ansible.ts`)
Defines structures for interacting with an Ansible-related API, likely for collections or roles.

**`JsonResponse`**
```typescript
export type JsonResponse = {
  meta: {
    count: number;
  };
  links: {
    first: string;
    previous?: null | string;
    next: string;
    last: string;
  };
  data: Data[];
};
```

**`Data`** (within `AnsibleAPI`)
Describes the structure of individual data items, which include repository details, collection versions, and namespace metadata.
```typescript
export type Data = {
  repository: {
    pulp_href: string;
    pulp_created: string;
    versions_href: string;
    pulp_labels: {
      [key: string]: string;
    };
    latest_version_href: string;
    name: string;
    description: string;
    retain_repo_versions: number;
    remote: string;
  };
  collection_version: {
    pulp_href: string;
    namespace: string;
    name: string;
    version: string;
    requires_ansible: string;
    pulp_created: string;
    contents: {
      name: string;
      description: string;
      content_type: string;
    }[];
    dependencies: {};
    description?: string;
    tags: {
      name: string;
    }[];
  };
  repository_version: string;
  namespace_metadata: {
    pulp_href: string;
    name: string;
    company: string;
    description: string;
    avatar_url: string;
  };
  is_highest: boolean;
  is_deprecated: boolean;
  is_signed: boolean;
};
```

#### Other Type Exports
- **`DirectoryTree`** (from `./types/tree.ts`): Likely defines the structure for representing directory trees.
- **`SsmEvents`** (from `./types/events.ts`): Type definitions for events used within the SSM system (e.g., WebSocket events).

### Validation

- **`Validation`** (from `./validation/index.ts`): Exports validation schemas or functions, likely built with a library like Zod or Joi, for validating data structures.

### Forms

- **`Automations`** (from `./form/automation.ts`): Contains structures or schemas related to automation forms (e.g., defining fields, validation for automation creation/editing).

### Namespaces

Raw re-exports from namespace files, providing more structured type information.

- **`Proxmox Namespaces`** (re-exported from `./namespace/proxmox.ts`): Detailed types and interfaces specific to Proxmox entities.
- **`System Information Namespaces`** (re-exported from `./namespace/system-information.ts`): Detailed types for system information data collected from devices.

## Usage Example

To use these shared modules in your project (e.g., a plugin or within SSM core components):

```typescript
import {
  SsmStatus,
  AnsibleAPI,
  Validation, // Assuming Validation exports a validator object or functions
  Automations // Assuming Automations exports form schemas or types
} from '@shared-lib';

// Example using DeviceStatus enum
function getDeviceState(device: { status: SsmStatus.DeviceStatus }): string {
  switch (device.status) {
    case SsmStatus.DeviceStatus.ONLINE:
      return 'Device is Online';
    case SsmStatus.DeviceStatus.OFFLINE:
      return 'Device is Offline';
    // ... other cases
    default:
      return 'Unknown status';
  }
}

// Example type usage for Ansible API data
async function fetchAnsibleCollections(): Promise<AnsibleAPI.JsonResponse | null> {
  // ... your fetch logic ...
  // const response = await fetch('/api/ansible-collections');
  // return response.json();
  return null; // Placeholder
}

// Placeholder for using a validation schema (actual usage depends on Validation module content)
// const automationData = { name: 'My Automation', schedule: '0 * * * *' };
// const validationResult = Validation.AutomationSchema?.safeParse(automationData);
// if (validationResult?.success) {
//   console.log('Automation data is valid');
// } else {
//   console.error('Validation errors:', validationResult?.error);
// }
```

This documentation provides a high-level overview. For detailed information on each module, refer to the source files within the `@shared-lib/src` directory. 