```ascii
  ,;;:;,
   ;;;;;
  ,:;;:;    ,'=.
  ;:;:;' .=" ,'_\
  ':;:;,/  ,__:=@
   ';;:;  =./)_
     `"=\_  )_"`
          ``'"`
```
Squirrel Servers Manager 🐿️
---
# Ansible Vaults Module

## Overview

The Ansible Vaults module provides functionality for managing encrypted Ansible vault files within the Squirrel Servers Manager application. It handles vault encryption, decryption, and management of vault credentials.

## Features

- Vault file encryption and decryption
- Vault credential management
- Integration with playbook repositories
- Secure storage of vault passwords
- Support for multiple vault IDs

## Architecture

The module follows the Clean Architecture pattern with proper separation of concerns:

### Domain Layer

Contains the core business entities and repository interfaces:

- **Entities**
  - `ansible-vault.entity.ts`: Core domain entity for Ansible vaults
  - Repository interfaces for data access

### Application Layer

Contains the business logic and services:

- **Services**
  - `ansible-vault.service.ts`: Core vault management service
  - `vault-crypto.service.ts`: Encryption/decryption service

### Infrastructure Layer

Contains implementations of repositories and external services:

- **Repositories**
  - `ansible-vault.repository.ts`: MongoDB repository implementation
- **Schemas**
  - `ansible-vault.schema.ts`: Mongoose schema for vault storage
- **Mappers**
  - `ansible-vault-repository.mapper.ts`: Maps between domain entities and database models

### Presentation Layer

Contains controllers and DTOs:

- **Controllers**
  - `ansible-vaults.controller.ts`: REST API endpoints for vault management

## Module Structure

```
ansible-vaults/
├── domain/
│   ├── entities/
│   │   └── ansible-vault.entity.ts
│   └── repositories/
│       └── ansible-vault-repository.interface.ts
├── application/
│   ├── services/
│   │   ├── ansible-vault.service.ts
│   │   └── vault-crypto.service.ts
│   └── interfaces/
│       └── vault-crypto-service.interface.ts
├── infrastructure/
│   ├── repositories/
│   │   └── ansible-vault.repository.ts
│   ├── schemas/
│   │   └── ansible-vault.schema.ts
│   └── mappers/
│       └── ansible-vault-repository.mapper.ts
├── presentation/
│   └── controllers/
│       └── ansible-vaults.controller.ts
├── ansible-vaults.module.ts
├── index.ts
└── README.md
```

## Integration

The module is used by other modules through dependency injection:

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ANSIBLE_VAULT, schema: AnsibleVaultSchema },
      { name: PlaybooksRegister.name, schema: PlaybooksRegisterSchema },
    ]),
  ],
  controllers: [AnsibleVaultsController],
  providers: [
    AnsibleVaultService,
    VaultCryptoService,
    AnsibleVaultRepositoryMapper,
    {
      provide: ANSIBLE_VAULT_REPOSITORY,
      useClass: AnsibleVaultRepository,
    },
  ],
  exports: [AnsibleVaultService, VaultCryptoService],
})
```

## Usage

The module provides services that can be injected into other modules:

```typescript
constructor(
  private readonly vaultCryptoService: VaultCryptoService,
  private readonly ansibleVaultService: AnsibleVaultService
) {}
```

## API Endpoints

The module exposes several REST endpoints through the `AnsibleVaultsController`:

- `GET /ansible/vaults`: List all vaults
- `GET /ansible/vaults/:id`: Get a specific vault
- `POST /ansible/vaults`: Create a new vault
- `PUT /ansible/vaults/:id`: Update a vault
- `DELETE /ansible/vaults/:id`: Delete a vault

## Recent Changes

- Implemented Clean Architecture pattern
- Added support for multiple vault IDs
- Enhanced security measures for vault password storage
- Improved integration with playbook repositories
- Added comprehensive test coverage 