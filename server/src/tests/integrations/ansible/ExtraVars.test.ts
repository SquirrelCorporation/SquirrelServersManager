import { describe, expect, test, vi } from 'vitest';
import extraVarsOps from '../../../integrations/ansible/utils/ExtraVars';

describe('test ExtraVars', () => {
  vi.mock('../../../data/cache', () => ({
    getFromCache: () => 'mockedValue',
  }));

  test('findValueOfExtraVars function', async () => {
    const result = await extraVarsOps.findValueOfExtraVars(
      [{ extraVar: 'VAR_1', value: 'VALUE_1', required: true, canBeOverride: true }],
      [{ extraVar: 'VAR_1', value: 'FORCE_1' }],
    );
    expect(result[0].value, 'FORCE_1');
  });

  // Test case for `required` being `false`
  test('FindValueOfExtraVars when required is false', async () => {
    const result = await extraVarsOps.findValueOfExtraVars(
      [{ extraVar: 'VAR_1', value: 'VALUE_1', required: false, canBeOverride: false }],
      [{ extraVar: 'VAR_1', value: 'FORCE_1' }],
    );

    expect(result[0].value, 'mockedValue');
  });

  // Test case with different `extraVar`
  test('FindValueOfExtraVars when extraVar is different', async () => {
    const result = await extraVarsOps.findValueOfExtraVars(
      [{ extraVar: 'VAR_2', value: 'VALUE_1', required: true, canBeOverride: false }],
      [{ extraVar: 'VAR_1', value: 'FORCE_1' }],
    );

    expect(result[0].value, 'VALUE_1');
  });

  // Test case with forcedVar matching the extraVar with `canBeOverride` set as true
  test('FindValueOfExtraVars when forcedVar matches and canBeOverride is true', async () => {
    const result = await extraVarsOps.findValueOfExtraVars(
      [{ extraVar: 'VAR_1', value: 'VALUE_1', required: true, canBeOverride: true }],
      [{ extraVar: 'VAR_1', value: 'FORCE_1' }],
    );

    expect(result[0].value, 'FORCE_1');
  });

  // Test case with multiple ExtraVars and forcedVar
  test('FindValueOfExtraVars with multiple ExtraVars and forcedVar', async () => {
    const result = await extraVarsOps.findValueOfExtraVars(
      [
        { extraVar: 'VAR_1', value: 'VALUE_1', required: true, canBeOverride: true },
        { extraVar: 'VAR_2', value: 'VALUE_2', required: false, canBeOverride: false },
        { extraVar: 'VAR_3', value: 'VALUE_3', required: true, canBeOverride: true },
      ],
      [
        { extraVar: 'VAR_1', value: 'FORCE_1' },
        { extraVar: 'VAR_2', value: 'FORCE_2' },
      ],
    );

    // VAR_1 and VAR_3 can be override, so, their values should be the respective forced values.
    expect(result[0].value, 'FORCE_1');
    // VAR_2 cannot be overridden, and is not required, so, its value should be from the cache.
    expect(result[1].value, 'mockedValue');
    // VAR_3 does not have a provided forcedVar, so, its value should be from the cache.
    expect(result[2].value, 'mockedValue');
  });

  // Test case with multiple ExtraVars and no forcedVar
  test('FindValueOfExtraVars with multiple ExtraVars and no forcedVar', async () => {
    const result = await extraVarsOps.findValueOfExtraVars(
      [
        { extraVar: 'VAR_1', value: 'VALUE_1', required: true, canBeOverride: true },
        { extraVar: 'VAR_2', value: 'VALUE_2', required: false, canBeOverride: false },
        { extraVar: 'VAR_3', value: 'VALUE_3', required: true, canBeOverride: true },
      ],
      [],
    );

    // All ExtraVars should have values from the cache as no forcedVars are provided.
    expect(result[0].value, 'mockedValue');
    expect(result[1].value, 'mockedValue');
    expect(result[2].value, 'mockedValue');
  });
});
