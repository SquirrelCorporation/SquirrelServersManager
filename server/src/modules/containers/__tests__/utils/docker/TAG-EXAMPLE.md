# Example: Updating Tag Tests

This example shows how to update the `tag.test.ts` file to work with the new clean architecture. 

## Original File (tag.test.ts)

The original file was at `/src/tests/unit-tests/modules/docker/tag.test.ts` and contained tests for tag utility functions.

## New Architecture Version

To update this file:

1. Rename to `tag.spec.ts` following NestJS test naming conventions

2. Update imports to match the new module architecture:
   ```typescript
   // Old
   import tag from '../../../../modules/containers/utils/tag';
   
   // New
   import tag from '../../../../../utils/tag';
   ```

3. Keep the actual test content largely the same, as it's testing utility functions

4. Add a header comment explaining that this file was migrated:
   ```typescript
   /**
    * This test file has been moved and renamed from /src/tests/unit-tests/modules/docker/tag.test.ts
    * 
    * It needs to be updated to match the new module architecture.
    * See MIGRATION-GUIDE.md for details on how to update.
    */
   ```

## Example Fixed File

See the example implemented in `tag.spec.ts` which should:
1. Keep all the original test functionality
2. Update the imports to match the new architecture
3. Include clear documentation about the migration