# Docker Tests Migration Guide

## Overview

The docker test files have been moved from the old location at `/src/tests/unit-tests/modules/docker/` to the new location at `/src/modules/containers/__tests__/utils/docker/` following the new modular clean architecture structure.

## Current Status

The files have been migrated but face several challenges with running the tests:

1. Vitest configuration errors when trying to run the tests
2. Import path differences between old and new architecture
3. Class name changes (e.g., `Docker` → `DockerWatcherComponent`)
4. Interface differences 
5. Potential method signature changes

## Migration Approach

### Files Migrated

The following files were migrated from the old location to the new one:

- Acr.test.ts → Acr.spec.ts
- Component.test.ts → Component.spec.ts
- Custom.test.ts → Custom.spec.ts
- Docker.test.ts → Docker.spec.ts
- Ecr.test.ts → Ecr.spec.ts
- Forjejo.test.ts → Forjejo.spec.ts
- Gcr.test.ts → Gcr.spec.ts
- Ghcr.test.ts → Ghcr.spec.ts
- Gitea.test.ts → Gitea.spec.ts
- Gitlab.test.ts → Gitlab.spec.ts
- Hub.test.ts → Hub.spec.ts
- Lscr.test.ts → Lscr.spec.ts
- Quay.test.ts → Quay.spec.ts
- Registry.test.ts → Registry.spec.ts
- tag.test.ts → tag.spec.ts
- utils.test.ts → utils.spec.ts
- samples/ directory (supporting test data)

An update script (`update-imports.sh`) was created to assist in updating import paths.

### Required Updates

To fully update these tests, the following changes need to be made to each file:

1. Update import paths to match the new module structure:
   ```typescript
   // Old import
   import Docker from '../../../../modules/containers/watchers/providers/docker/Docker';
   
   // New import
   import { DockerWatcherComponent as Docker } from '../../../../../application/services/components/watcher/providers/docker/docker-watcher.component';
   ```

2. Update class references and imports for registry components:
   ```typescript
   // Old
   import Hub from '../../../../modules/containers/registries/providers/hub/Hub';
   
   // New
   import { DockerHubRegistryComponent as Hub } from '../../../../../application/services/components/registry/docker-hub-registry.component';
   ```

3. Update Container model references:
   ```typescript
   // Old
   import Container from '../../../../data/database/model/Container';
   
   // New
   import { IContainerEntity } from '../../../../../domain/entities/container.entity';
   ```

4. Update any method calls that may have changed signatures.

### Fix Configuration Issues

Currently, the Vitest configuration is causing issues with loading the tests. This could potentially be addressed by:

1. Creating a specific config file for these tests
2. Updating the workspace configuration to properly handle markdown files
3. Creating proper mock files for dependencies

## Next Steps

Due to the complexity of the configuration issues, the following approach is recommended:

1. Keep the migration work completed so far (files moved to correct location)
2. Update the import paths using the provided script
3. Address one test file at a time, starting with the simplest ones
4. Consider consulting with the team on resolving the Vitest configuration issues

A sample fixed test file (`fixed-docker.spec.ts`) has been created to demonstrate the path forward.