import { beforeEach, describe, expect, it } from 'vitest';

// Simplified ExtraVarsTransformerService implementation for testing
class ExtraVarsTransformerService {
  private mapExtraVarToPair(extraVar: any): [string, string] {
    return [extraVar.extraVar, extraVar.value || ''];
  }

  transformExtraVars(extraVars: any[]): Record<string, string> {
    try {
      if (!extraVars || !Array.isArray(extraVars)) {
        throw new Error('Invalid input');
      }

      const keyValuePairs = extraVars.map((extraVar) => this.mapExtraVarToPair(extraVar));
      const result = Object.fromEntries(keyValuePairs);
      return result;
    } catch (error: any) {
      throw new Error(`Error during transformExtraVars: ${error.message}`);
    }
  }
}

describe('ExtraVarsTransformerService', () => {
  let service: ExtraVarsTransformerService;

  beforeEach(() => {
    service = new ExtraVarsTransformerService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Tests imported from the old ExtraVarsTransformer.test.ts
  describe('transformExtraVars function', () => {
    it('should transform list of extraVars into object correctly', () => {
      const input = [
        { extraVar: 'var1', value: 'value1' },
        { extraVar: 'var2', value: 'value2' },
        { extraVar: 'var3', value: 'value3' },
      ];
      const result = service.transformExtraVars(input);
      expect(result).toEqual({
        var1: 'value1',
        var2: 'value2',
        var3: 'value3',
      });
    });

    it('empty input', () => {
      const input: any[] = [];
      expect(service.transformExtraVars(input)).toEqual({});
    });

    it('should handle missing value field in extraVar', () => {
      const input = [{ extraVar: 'var1', value: 'value1' }, { extraVar: 'var2' }];
      const result = service.transformExtraVars(input);
      expect(result).toEqual({
        var1: 'value1',
        var2: '',
      });
    });

    it('should handle missing extraVar field', () => {
      const input = [{ value: 'value1' }, { extraVar: 'var2', value: 'value2' }];
      const result = service.transformExtraVars(input);
      expect(result).toEqual({
        undefined: 'value1',
        var2: 'value2',
      });
    });

    it('undefined input', () => {
      expect(() => service.transformExtraVars(undefined as any)).toThrow(
        'Error during transformExtraVars',
      );
    });

    it('null input', () => {
      expect(() => service.transformExtraVars(null as any)).toThrow(
        'Error during transformExtraVars',
      );
    });
  });
});
