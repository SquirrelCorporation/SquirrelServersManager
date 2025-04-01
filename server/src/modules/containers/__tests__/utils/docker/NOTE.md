# Docker Test Files Migration

The Docker test files from `/src/tests/unit-tests/modules/docker` have been moved to `/src/modules/containers/__tests__/utils/docker`.

## Current Status

The files have been moved and a sample import path was updated (Docker.spec.ts), but most files still have incorrect import paths.

## Required Updates

1. Update all import paths from the old structure to the new Clean Architecture structure:
   - Registry providers moved to `application/services/components/registry/*-registry.component.ts`
   - Docker watcher moved to `application/services/components/watcher/providers/docker/docker-watcher.component.ts`
   - Container entity moved from database model to domain entity

2. Update class names to match the new naming conventions:
   - `Acr` → `AcrRegistryComponent`
   - `Docker` → `DockerWatcherComponent`
   - etc.

## See Also

A script (`update-imports.sh`) has been provided to update the imports. Run it from the docker test directory:

```bash
cd src/modules/containers/__tests__/utils/docker
chmod +x update-imports.sh
./update-imports.sh
```

After running the script, the tests will still need manual verification and likely additional adjustments to make them work with the new Clean Architecture patterns.