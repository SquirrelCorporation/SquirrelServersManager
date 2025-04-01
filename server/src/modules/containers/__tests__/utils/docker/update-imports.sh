#!/bin/bash

# This script updates import paths in all test files to match the new module structure

# Update Container entity import
sed -i '' 's|import \(.*\) from '\''../../../../data/database/model/Container'\'';|import \1 from '\''../../../../../domain/entities/container.entity'\'';|g' *.spec.ts

# Update registry imports
sed -i '' 's|import Acr from '\''.*\/registries\/providers\/acr\/Acr'\'';|import { AcrRegistryComponent as Acr } from '\''../../../../../application/services/components/registry/acr-registry.component'\'';|g' *.spec.ts
sed -i '' 's|import Ecr from '\''.*\/registries\/providers\/ecr\/Ecr'\'';|import { EcrRegistryComponent as Ecr } from '\''../../../../../application/services/components/registry/ecr-registry.component'\'';|g' *.spec.ts
sed -i '' 's|import Gcr from '\''.*\/registries\/providers\/gcr\/Gcr'\'';|import { GcrRegistryComponent as Gcr } from '\''../../../../../application/services/components/registry/gcr-registry.component'\'';|g' *.spec.ts
sed -i '' 's|import Hub from '\''.*\/registries\/providers\/hub\/Hub'\'';|import { DockerHubRegistryComponent as Hub } from '\''../../../../../application/services/components/registry/docker-hub-registry.component'\'';|g' *.spec.ts
sed -i '' 's|import Ghcr from '\''.*\/registries\/providers\/ghcr\/Ghcr'\'';|import { GhcrRegistryComponent as Ghcr } from '\''../../../../../application/services/components/registry/ghcr-registry.component'\'';|g' *.spec.ts
sed -i '' 's|import Gitea from '\''.*\/registries\/providers\/gitea\/Gitea'\'';|import { GiteaRegistryComponent as Gitea } from '\''../../../../../application/services/components/registry/gitea-registry.component'\'';|g' *.spec.ts
sed -i '' 's|import Gitlab from '\''.*\/registries\/providers\/gitlab\/Gitlab'\'';|import { GitlabRegistryComponent as Gitlab } from '\''../../../../../application/services/components/registry/gitlab-registry.component'\'';|g' *.spec.ts
sed -i '' 's|import Quay from '\''.*\/registries\/providers\/quay\/Quay'\'';|import { QuayRegistryComponent as Quay } from '\''../../../../../application/services/components/registry/quay-registry.component'\'';|g' *.spec.ts
sed -i '' 's|import Custom from '\''.*\/registries\/providers\/custom\/Custom'\'';|import { CustomRegistryComponent as Custom } from '\''../../../../../application/services/components/registry/custom-registry.component'\'';|g' *.spec.ts
sed -i '' 's|import Forjejo from '\''.*\/registries\/providers\/forjejo\/Forjejo'\'';|import { ForgejoRegistryComponent as Forjejo } from '\''../../../../../application/services/components/registry/forgejo-registry.component'\'';|g' *.spec.ts
sed -i '' 's|import Lscr from '\''.*\/registries\/providers\/lscr\/Lscr'\'';|import { LscrRegistryComponent as Lscr } from '\''../../../../../application/services/components/registry/lscr-registry.component'\'';|g' *.spec.ts

# Update Docker import 
sed -i '' 's|import Docker from '\''.*\/watchers\/providers\/docker\/Docker'\'';|import { DockerWatcherComponent as Docker } from '\''../../../../../application/services/components/watcher/providers/docker/docker-watcher.component'\'';|g' *.spec.ts

echo "Import paths updated. You may need to manually fix any remaining issues."