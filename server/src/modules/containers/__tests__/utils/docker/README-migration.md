# Docker Tests Migration

These test files were migrated from `/src/tests/unit-tests/modules/docker` to follow the new modular structure under `/src/modules/containers/__tests__/utils/docker`.

## Import Path Updates Required

The tests need to be updated to use the new file paths in the refactored architecture:

### Class Mapping

| Old Path | New Path |
|----------|----------|
| `../../../../modules/containers/watchers/providers/docker/Docker` | `../../../../../application/services/components/watcher/providers/docker/docker-watcher.component` |
| `../../../../modules/containers/registries/providers/acr/Acr` | `../../../../../application/services/components/registry/acr-registry.component` |
| `../../../../modules/containers/registries/providers/ecr/Ecr` | `../../../../../application/services/components/registry/ecr-registry.component` |
| `../../../../modules/containers/registries/providers/gcr/Gcr` | `../../../../../application/services/components/registry/gcr-registry.component` |
| `../../../../modules/containers/registries/providers/hub/Hub` | `../../../../../application/services/components/registry/docker-hub-registry.component` |
| `../../../../modules/containers/registries/providers/ghcr/Ghcr` | `../../../../../application/services/components/registry/ghcr-registry.component` |
| `../../../../modules/containers/registries/providers/gitea/Gitea` | `../../../../../application/services/components/registry/gitea-registry.component` |
| `../../../../modules/containers/registries/providers/gitlab/Gitlab` | `../../../../../application/services/components/registry/gitlab-registry.component` |
| `../../../../modules/containers/registries/providers/quay/Quay` | `../../../../../application/services/components/registry/quay-registry.component` |
| `../../../../modules/containers/registries/providers/custom/Custom` | `../../../../../application/services/components/registry/custom-registry.component` |
| `../../../../modules/containers/registries/providers/forjejo/Forjejo` | `../../../../../application/services/components/registry/forgejo-registry.component` |
| `../../../../modules/containers/registries/providers/lscr/Lscr` | `../../../../../application/services/components/registry/lscr-registry.component` |
| `../../../../data/database/model/Container` | `../../../../../domain/entities/container.entity` |

### Class Name Changes

The new classes are named differently in the imports:

```typescript
// Old way
import Acr from '...path/Acr';

// New way
import { AcrRegistryComponent as Acr } from '...path/acr-registry.component';
```

Each test file needs to be updated with the correct imports and class names.

## Next Steps

1. Update all import paths in test files
2. Verify and fix any methods that might have been renamed
3. Run the tests to ensure they still work