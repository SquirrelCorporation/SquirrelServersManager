# Infrastructure Layer Refactoring Summary

## Target Architecture

```
└── infrastructure/                    # Infrastructure layer
    ├── common/                        # Common utilities
    │   ├── directory-tree/            # Directory tree implementation
    │   │   ├── directory-tree.util.ts # (from directory-tree.ts)
    │   │   └── index.ts
    │   ├── dns/                       # DNS utilities
    │   │   ├── dns.util.ts            # (from dns-helper.ts)
    │   │   └── index.ts
    │   ├── docker/                    # Docker utilities
    │   │   ├── docker-compose.util.ts # (from DockerComposeHelper.ts)
    │   │   ├── docker-compose-json-transformer.util.ts # (from DockerComposeJSONTransformer.ts)
    │   │   ├── utils.ts               # (from utils.ts)
    │   │   └── index.ts
    │   ├── files/                     # File utilities
    │   │   ├── recursive-find.util.ts # (from recursive-find.ts)
    │   │   └── index.ts
    │   ├── query/                     # Query utilities
    │   │   ├── filter.util.ts         # (from FilterHelper.ts)
    │   │   ├── pagination.util.ts     # (from PaginationHelper.ts)
    │   │   ├── sorter.util.ts         # (from SorterHelper.ts)
    │   │   └── index.ts
    │   ├── redis/                     # Redis utilities
    │   │   ├── redis-info.util.ts     # (from redis-info.ts)
    │   │   └── index.ts
    │   ├── ansible/                   # Ansible utilities
    │   │   ├── ansible-task.util.ts   # (from AnsibleTaskHelper.ts)
    │   │   └── index.ts
    │   └── index.ts
    ├── adapters/                      # External adapters
    │   ├── git/                       # Git adapters (forked lib)
    │   │   ├── services/
    │   │   │   ├── inspect.service.ts          # (from inspect.ts) ✓
    │   │   │   ├── clone.service.ts            # (from clone.ts) ✓
    │   │   │   ├── sync.service.ts             # (from sync.ts) ✓
    │   │   │   ├── commit-and-sync.service.ts  # (from commitAndSync.ts) ✓
    │   │   │   ├── force-pull.service.ts       # (from forcePull.ts) ✓
    │   │   │   ├── init-git.service.ts         # (from initGit.ts) ✓
    │   │   │   └── index.ts
    │   │   ├── errors/
    │   │   │   ├── errors.util.ts     # (from errors.ts)
    │   │   │   └── index.ts
    │   │   ├── interfaces/            # Git interfaces
    │   │   │   ├── git.interface.ts   # (from interface.ts)
    │   │   │   └── index.ts
    │   │   ├── utils/                 # Git utilities
    │   │   │   ├── git.util.ts        # (from utils.ts)
    │   │   │   ├── default-info.util.ts # (from defaultGitInfo.ts)
    │   │   │   ├── credential.util.ts # (from credential.ts) ✓
    │   │   │   ├── init.util.ts       # (from init.ts) ✓
    │   │   │   └── index.ts
    │   │   ├── CREDIT.md
    │   │   └── index.ts
    │   ├── proxmox/                   # Proxmox adapters (forked lib)
    │   │   ├── services/
    │   │   │   ├── proxmox-engine.service.ts # (from ProxmoxEngine.ts)
    │   │   │   ├── qm-monitor.service.ts  # (from QmMonitor.ts)
    │   │   │   ├── constructor.service.ts # (from constructor.ts)
    │   │   │   ├── proxy.service.ts       # (from proxy.ts)
    │   │   │   └── index.ts
    │   │   ├── CREDIT.md
    │   │   └── index.ts
    │   └── ssh/                       # SSH adapters
    │       ├── ssh-credentials.adapter.ts # (from SSHCredentialsHelper.ts)
    │       ├── axios-ssh.adapter.ts       # (from axios-ssh.ts)
    │       ├── custom-agent.adapter.ts    # (from custom-agent.ts)
    │       └── index.ts
    └── security/                      # Security-related utilities
        ├── vault-crypto/              # Vault crypto (forked lib)
        │   ├── services/
        │   │   ├── vault.service.ts   # (from Vault.ts)
        │   │   └── index.ts
        │   ├── utils/
        │   │   ├── binascii.util.ts   # (from binascii.ts)
        │   │   ├── pkcs7.util.ts      # (from pkcs7.ts)
        │   │   └── index.ts
        │   ├── types/
        │   │   ├── vault.types.ts     # (from types/index.d.ts)
        │   │   └── index.ts
        │   └── index.ts
        └── index.ts
```

## Key Architecture Changes:

1. Move Helpers to Infrastructure:
   - Relocate all helpers under the infrastructure directory to align with Clean Architecture principles
   - Group helpers by their purpose into common utilities and adapters
2. Categorize Helpers:
   - Common Utilities: General use utilities that are used across the application
   - Adapters: Code that interacts with external libraries or services
   - Security: Security-related utilities
3. Standardize Naming:
   - Use .util.ts suffix for utility functions
   - Use .adapter.ts suffix for adapters
   - Use .service.ts suffix for service implementations
4. Improve Organization:
   - Group related helpers together (e.g., all Git-related helpers in one directory)
   - Separate forked libraries (like Git, Proxmox) into their own structured directories
   - Maintain CREDIT.md files to properly credit original libraries
5. Export Pattern:
   - Add index.ts files to each directory to export the public API
   - Follow the barrel pattern to simplify imports

## Migration Path

To implement this architecture without breaking existing code:

1. Create the new directory structure
2. Move and rename files to their new locations
3. Update imports in the moved files
4. Create index.ts files to export the public API
5. Update imports in the rest of the codebase incrementally

This architecture aligns with NestJS and Clean Architecture principles by:
1. Properly separating concerns
2. Moving helpers to the infrastructure layer where they belong
3. Using consistent naming conventions
4. Improving maintainability and discoverability
5. Preserving attribution for forked libraries

## Current Implementation Status

- ✅ Created the main infrastructure directory structure
- ✅ Set up common utilities directories (directory-tree, dns, docker, files, query, redis, ansible)
- ✅ Set up adapters for git, proxmox, and ssh
- ✅ Set up security utilities (vault-crypto)
- ✅ Created index.ts files for barrel exports
- ✅ Implemented consistent naming convention
- ✅ Updated imports to reflect new structure
- ✅ Completed moving all git service files
  - ✅ inspect.service.ts (from inspect.ts)
  - ✅ clone.service.ts (from clone.ts)
  - ✅ sync.service.ts (from sync.ts)
  - ✅ commit-and-sync.service.ts (from commitAndSync.ts)
  - ✅ force-pull.service.ts (from forcePull.ts)
  - ✅ init-git.service.ts (from initGit.ts)
- ✅ Added supporting git utility files
  - ✅ credential.util.ts (from credential.ts)
  - ✅ init.util.ts (from init.ts)
  - ✅ git.util.ts (from utils.ts)
- ✅ Updated direct imports in key modules to use the infrastructure paths directly
- ✅ Completely removed the old git helpers directory
- ✅ Fixed path and export issues in various infrastructure files
- ✅ Ensured the server builds successfully with the new structure
- ❌ Need to complete similar migration for other helper directories

## Next Steps

1. ~~Complete moving the git service files~~ ✅ Done
2. ~~Update all git service imports in key files~~ ✅ Done
3. ~~Remove the old git helpers directory~~ ✅ Done
4. ~~Fix any build issues related to the infrastructure changes~~ ✅ Done
5. Repeat the same approach for other helper categories (DNS, Docker, Query, Files, SSH, etc.)
6. Create a migration script to assist with updating the remaining imports throughout the codebase
7. Run tests to verify functionality
8. Document the new structure for the team

## Completed Git Migration Details

Successfully migrated all git helpers to the new infrastructure structure:

1. Created structured directory layout under `infrastructure/adapters/git/`:
   - `services/` - Contains all service implementations with `.service.ts` suffix
   - `utils/` - Contains utility functions with `.util.ts` suffix
   - `interfaces/` - Contains type definitions with `.interface.ts` suffix
   - `errors/` - Contains error utilities with `.util.ts` suffix

2. Fixed various infrastructure module issues:
   - Updated logger imports to use correct relative paths
   - Fixed duplicate exports in utilities
   - Standardized export patterns for consistency
   - Ensured appropriate naming conventions (services, adapters, utilities)

3. **Removed the old Git helpers directory:**
   - All git-related helpers have been completely removed from `/src/helpers/git/`
   - Updated import paths in all relevant files to use the new infrastructure paths
   - The server builds successfully with the git helpers directory completely removed

4. The server now builds successfully with the new infrastructure structure

Key implementation patterns:
- Named exports for utilities and interfaces
- Class-based implementations for services and adapters
- Barrel pattern exports in index.ts files
- Path aliases for simplified imports (@infrastructure/...)

## Next Phase Planning

While we have successfully migrated and removed the git helpers directory, the complete removal of the `/src/helpers` directory is not yet possible. Several modules still have dependencies on helpers that have not yet been migrated:

1. SSH helpers - Used for SSH connections, credentials, and custom agents
2. Query helpers - Used for filtering, pagination, and sorting
3. DNS helpers - Used for DNS resolution
4. Docker helpers - Used for Docker compose transformations
5. Ansible helpers - Used for Ansible task management
6. Vault-crypto helpers - Used for encryption and authentication

For the next phase, we should focus on one category at a time, similar to the approach used for git helpers, ensuring each migration is complete before moving to the next category.