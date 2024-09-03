import { API, SsmAnsible } from 'ssm-shared-lib';
import { describe, expect, test, vi } from 'vitest';
import ExtraVars from '../../../../modules/ansible/extravars/ExtraVars';
import extraVarsOps from '../../../../modules/ansible/extravars/ExtraVars';

vi.mock('../../../../data/cache', () => ({
  getFromCache: async () => 'mockedValue',
}));

vi.mock('../../../../logger', () => ({
  default: {
    child: () => ({
      info: vi.fn(),
      debug: vi.fn(),
      error: vi.fn(),
    }),
  },
}));

vi.mock('../../../../data/database/repository/DeviceRepo', async () => {
  const actual = await vi.importActual<any>('../../../../data/database/repository/DeviceRepo');
  return {
    default: {
      ...actual,
      findOneByUuid: async () => {
        return { ip: '192.168.1.1' };
      },
    },
  };
});

describe('test ExtraVars', () => {
  test('findValueOfExtraVars should return substituted variables', async () => {
    const extraVars: API.ExtraVars = [
      { extraVar: 'var1', type: SsmAnsible.ExtraVarsType.SHARED },
      {
        extraVar: SsmAnsible.DefaultContextExtraVarsList.DEVICE_IP,
        type: SsmAnsible.ExtraVarsType.CONTEXT,
      },
    ];
    const forcedValues: API.ExtraVars = [{ extraVar: 'var1', value: 'forcedValue1' }];
    const targets = ['target1'];

    const result = await ExtraVars.findValueOfExtraVars(extraVars, forcedValues, false, targets);

    expect(result).toEqual([
      { extraVar: 'var1', type: SsmAnsible.ExtraVarsType.SHARED, value: 'forcedValue1' },
      {
        extraVar: SsmAnsible.DefaultContextExtraVarsList.DEVICE_IP,
        type: SsmAnsible.ExtraVarsType.CONTEXT,
        value: '192.168.1.1',
      },
    ]);
  });

  // Test case for `required` being `false`
  test('FindValueOfExtraVars when required is false', async () => {
    const result = await extraVarsOps.findValueOfExtraVars(
      [
        {
          extraVar: 'VAR_1',
          required: false,
          type: SsmAnsible.ExtraVarsType.SHARED,
        },
      ],
      [{ extraVar: 'VAR_1', value: 'FORCE_1' }],
    );

    expect(result[0].value, 'mockedValue');
  });

  // Test case with different `extraVar`
  test('FindValueOfExtraVars when extraVar is different', async () => {
    const result = await extraVarsOps.findValueOfExtraVars(
      [
        {
          extraVar: 'VAR_2',
          required: true,
          type: SsmAnsible.ExtraVarsType.SHARED,
        },
      ],
      [{ extraVar: 'VAR_1', value: 'FORCE_1' }],
    );

    expect(result[0].value, 'mockedValue');
  });

  // Test case with multiple ExtraVars and forcedVar
  test('FindValueOfExtraVars with multiple ExtraVars and forcedVar', async () => {
    const result = await extraVarsOps.findValueOfExtraVars(
      [
        {
          extraVar: 'VAR_1',
          required: true,
          type: SsmAnsible.ExtraVarsType.MANUAL,
        },
        {
          extraVar: 'VAR_2',
          required: false,
          type: SsmAnsible.ExtraVarsType.SHARED,
        },
        {
          extraVar: 'VAR_3',
          required: true,
          type: SsmAnsible.ExtraVarsType.SHARED,
        },
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
        {
          extraVar: 'VAR_1',
          required: true,
          type: SsmAnsible.ExtraVarsType.SHARED,
        },
        {
          extraVar: 'VAR_2',
          required: false,
          type: SsmAnsible.ExtraVarsType.SHARED,
        },
        {
          extraVar: 'VAR_3',
          required: true,
          type: SsmAnsible.ExtraVarsType.SHARED,
        },
      ],
      [],
    );

    // All ExtraVars should have values from the cache as no forcedVars are provided.
    expect(result[0].value, 'mockedValue');
    expect(result[1].value, 'mockedValue');
    expect(result[2].value, 'mockedValue');
  });

  test('getSubstitutedExtraVar should return forced value if available', async () => {
    const extraVar: API.ExtraVar = { extraVar: 'var1', type: SsmAnsible.ExtraVarsType.SHARED };
    const forcedValues: API.ExtraVars = [{ extraVar: 'var1', value: 'forcedValue1' }];

    const result = await (ExtraVars as any).getSubstitutedExtraVar(extraVar, forcedValues);

    expect(result).toBe('forcedValue1');
  });

  test('getSubstitutedExtraVar should return cached value for SHARED type', async () => {
    const extraVar: API.ExtraVar = { extraVar: 'var1', type: SsmAnsible.ExtraVarsType.SHARED };

    const result = await (ExtraVars as any).getSubstitutedExtraVar(extraVar);

    expect(result).toBe('mockedValue');
  });

  test('getContextExtraVarValue should return device IP for CONTEXT type', async () => {
    const extraVar: API.ExtraVar = {
      extraVar: SsmAnsible.DefaultContextExtraVarsList.DEVICE_IP,
      type: SsmAnsible.ExtraVarsType.CONTEXT,
    };
    const targets = ['target1'];

    const result = await (ExtraVars as any).getContextExtraVarValue(extraVar, targets);

    expect(result).toBe('192.168.1.1');
  });

  test('getContextExtraVarValue should throw error if multiple targets are provided for CONTEXT type', async () => {
    const extraVar: API.ExtraVar = {
      extraVar: SsmAnsible.DefaultContextExtraVarsList.DEVICE_IP,
      type: SsmAnsible.ExtraVarsType.CONTEXT,
    };
    const targets = ['target1', 'target2'];

    await expect((ExtraVars as any).getContextExtraVarValue(extraVar, targets)).rejects.toThrow(
      'Cannot use CONTEXT variable with multiple targets',
    );
  });
});
