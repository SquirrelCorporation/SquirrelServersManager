# Docker Unit Tests

These tests were moved from `/src/tests/unit-tests/modules/docker` to follow the new modular structure under `/src/modules/containers/__tests__/utils/docker`.

## Current Status

The files have been moved and renamed from `.test.ts` to `.spec.ts`, but need further updates to match the new architecture.

## Required Updates

See the [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md) for details on the changes needed to make these tests work with the updated architecture.

## Key Files

- `fixed-docker.spec.ts` - A sample file showing how imports should be updated
- `update-imports.sh` - Script to help update import paths
- `MIGRATION-GUIDE.md` - Detailed migration guide

## Running the Tests

Due to configuration issues with Vitest, the tests cannot currently be run directly. The migration approach focuses on:

1. Properly moving files to the correct location (done)
2. Updating imports to match the new architecture (partially done)
3. Creating detailed documentation for completing the migration (done)

When resolving the Vitest configuration issues, the tests can be run using:

```bash
cd /Users/emmanuelcosta/WebstormProjects/SquirrelServersManager/server
npx vitest run src/modules/containers/__tests__/utils/docker/*.spec.ts
```