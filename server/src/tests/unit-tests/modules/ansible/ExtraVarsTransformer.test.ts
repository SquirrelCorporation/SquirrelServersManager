import { API } from 'ssm-shared-lib';
import { describe, expect, test } from 'vitest';
import ExtraVarsTransformer from '../../../../modules/ansible/extravars/ExtraVarsTransformer';

describe('transformExtraVars function', () => {
  test('should transform list of extraVars into object correctly', () => {
    const input: API.ExtraVar[] = [
      { extraVar: 'var1', value: 'value1' },
      { extraVar: 'var2', value: 'value2' },
      { extraVar: 'var3', value: 'value3' },
    ];
    const result = ExtraVarsTransformer.transformExtraVars(input);
    expect(result).toEqual({
      var1: 'value1',
      var2: 'value2',
      var3: 'value3',
    });
  });

  test('empty input', () => {
    const input: API.ExtraVar[] = [];
    expect(ExtraVarsTransformer.transformExtraVars(input)).toEqual({});
  });

  test('should handle missing value field in extraVar', () => {
    const input: API.ExtraVar[] = [{ extraVar: 'var1', value: 'value1' }, { extraVar: 'var2' }];
    const result = ExtraVarsTransformer.transformExtraVars(input);
    expect(result).toEqual({
      var1: 'value1',
      var2: '',
    });
  });

  test('should handle missing extraVar field', () => {
    // @ts-expect-error incorrect typing test
    const input: API.ExtraVar[] = [{ value: 'value1' }, { extraVar: 'var2', value: 'value2' }];
    const result = ExtraVarsTransformer.transformExtraVars(input);
    expect(result).toEqual({
      undefined: 'value1',
      var2: 'value2',
    });
  });

  test('undefined input', () => {
    // @ts-expect-error incorrect typing test
    expect(() => ExtraVarsTransformer.transformExtraVars(undefined)).toThrow(
      'Error during transformExtraVars',
    );
  });

  test('null input', () => {
    // @ts-expect-error incorrect typing test
    expect(() => ExtraVarsTransformer.transformExtraVars(null)).toThrow(
      'Error during transformExtraVars',
    );
  });
});
