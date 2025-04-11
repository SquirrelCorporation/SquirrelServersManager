import { beforeEach, describe, expect, it, vi } from 'vitest';

// Constants to simulate the shared library
const SsmAnsible = {
  ExtraVarsType: {
    SHARED: 'SHARED',
    CONTEXT: 'CONTEXT',
    MANUAL: 'MANUAL',
  },
  DefaultContextExtraVarsList: {
    DEVICE_IP: '_ssm_deviceIP',
    DEVICE_ID: '_ssm_deviceId',
    AGENT_LOG_PATH: '_ssm_agentLogPath',
    AGENT_TYPE: '_ssm_agentType',
    API_KEY: '_ssm_apiKey',
  },
};

// Simplified ExtraVarsService implementation for testing
class ExtraVarsService {
  private readonly devicesService: any;
  private readonly userRepository: any;
  private readonly cacheManager: any;

  constructor(devicesService: any, userRepository: any, cacheManager: any) {
    this.devicesService = devicesService;
    this.userRepository = userRepository;
    this.cacheManager = cacheManager;
  }

  async findValueOfExtraVars(
    extraVars: any[],
    forcedValues?: any[],
    emptySubstitute?: boolean,
    targets?: string[],
  ): Promise<any[]> {
    const substitutedExtraVars: any[] = [];

    for (const e of extraVars) {
      const value = await this.getSubstitutedExtraVar(e, forcedValues, targets);

      if (!value && !emptySubstitute) {
        if (e.required) {
          throw new Error(`ExtraVar value not found ! (${e.extraVar})`);
        }
      } else {
        substitutedExtraVars.push({ ...e, value: value || undefined });
      }
    }

    return substitutedExtraVars;
  }

  private async getSubstitutedExtraVar(
    extraVar: any,
    forcedValues?: any[],
    targets?: string[],
  ): Promise<string | undefined> {
    const forcedValue = this.getForcedValue(extraVar, forcedValues);
    if (forcedValue) {
      return forcedValue;
    }

    if (extraVar.type === SsmAnsible.ExtraVarsType.SHARED) {
      return (await this.cacheManager.get(extraVar.extraVar)) || '';
    }

    if (extraVar.type === SsmAnsible.ExtraVarsType.CONTEXT) {
      return await this.getContextExtraVarValue(extraVar, targets);
    }

    return undefined;
  }

  private getForcedValue(extraVar: any, forcedValues?: any[]): string | undefined {
    return forcedValues?.find((e) => e.extraVar === extraVar.extraVar)?.value;
  }

  private async getContextExtraVarValue(
    extraVar: any,
    targets?: string[],
  ): Promise<string | undefined> {
    if (!targets) {
      return undefined;
    }
    if (targets.length > 1) {
      throw new Error(`Cannot use CONTEXT variable with multiple targets - '${extraVar.extraVar}'`);
    }

    const device = await this.devicesService.findOneByUuid(targets[0]);
    const user = await this.userRepository.findFirst();

    if (!device) {
      throw new Error(`Targeted device not found - (device: ${targets?.[0]})`);
    }

    switch (extraVar.extraVar) {
      case SsmAnsible.DefaultContextExtraVarsList.DEVICE_ID:
        return targets[0];
      case SsmAnsible.DefaultContextExtraVarsList.DEVICE_IP:
        return device.ip;
      case SsmAnsible.DefaultContextExtraVarsList.AGENT_LOG_PATH:
        return device.agentLogPath;
      case SsmAnsible.DefaultContextExtraVarsList.AGENT_TYPE:
        return device.agentType;
      case SsmAnsible.DefaultContextExtraVarsList.API_KEY:
        return user?.apiKey;
      default:
        return undefined;
    }
  }
}

describe('ExtraVarsService', () => {
  let service: ExtraVarsService;
  let mockDevicesService: any;
  let mockUserRepository: any;
  let mockCacheManager: any;

  beforeEach(() => {
    mockDevicesService = {
      findOneByUuid: vi.fn().mockResolvedValue({ ip: '192.168.1.1' }),
    };

    mockUserRepository = {
      findFirst: vi.fn().mockResolvedValue({ apiKey: 'test' }),
    };

    mockCacheManager = {
      get: vi.fn().mockResolvedValue('mockedValue'),
    };

    service = new ExtraVarsService(mockDevicesService, mockUserRepository, mockCacheManager);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Tests imported from the old ExtraVars.test.ts file
  describe('findValueOfExtraVars', () => {
    it('should return substituted variables', async () => {
      const extraVars = [
        { extraVar: 'var1', type: SsmAnsible.ExtraVarsType.SHARED },
        {
          extraVar: SsmAnsible.DefaultContextExtraVarsList.DEVICE_IP,
          type: SsmAnsible.ExtraVarsType.CONTEXT,
        },
      ];
      const forcedValues = [{ extraVar: 'var1', value: 'forcedValue1' }];
      const targets = ['target1'];

      const result = await service.findValueOfExtraVars(extraVars, forcedValues, false, targets);

      expect(result).toEqual([
        { extraVar: 'var1', type: SsmAnsible.ExtraVarsType.SHARED, value: 'forcedValue1' },
        {
          extraVar: SsmAnsible.DefaultContextExtraVarsList.DEVICE_IP,
          type: SsmAnsible.ExtraVarsType.CONTEXT,
          value: '192.168.1.1',
        },
      ]);
    });

    it('when required is false', async () => {
      const result = await service.findValueOfExtraVars(
        [
          {
            extraVar: 'VAR_1',
            required: false,
            type: SsmAnsible.ExtraVarsType.SHARED,
          },
        ],
        [{ extraVar: 'VAR_1', value: 'FORCE_1' }],
      );

      expect(result[0].value).toBe('FORCE_1');
    });

    it('when extraVar is different', async () => {
      const result = await service.findValueOfExtraVars(
        [
          {
            extraVar: 'VAR_2',
            required: true,
            type: SsmAnsible.ExtraVarsType.SHARED,
          },
        ],
        [{ extraVar: 'VAR_1', value: 'FORCE_1' }],
      );

      expect(result[0].value).toBe('mockedValue');
    });

    it('with multiple ExtraVars and forcedVar', async () => {
      const result = await service.findValueOfExtraVars(
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

      // VAR_1 should be forced
      expect(result[0].value).toBe('FORCE_1');
      // VAR_2 should be forced
      expect(result[1].value).toBe('FORCE_2');
      // VAR_3 doesn't have a provided forcedVar, so its value should be from the cache
      expect(result[2].value).toBe('mockedValue');
    });

    it('with multiple ExtraVars and no forcedVar', async () => {
      const result = await service.findValueOfExtraVars(
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

      // All ExtraVars should have values from the cache as no forcedVars are provided
      expect(result[0].value).toBe('mockedValue');
      expect(result[1].value).toBe('mockedValue');
      expect(result[2].value).toBe('mockedValue');
    });

    it('getContextExtraVarValue should throw error if multiple targets are provided for CONTEXT type', async () => {
      const extraVars = [
        {
          extraVar: SsmAnsible.DefaultContextExtraVarsList.DEVICE_IP,
          type: SsmAnsible.ExtraVarsType.CONTEXT,
        },
      ];
      const targets = ['target1', 'target2'];

      await expect(
        service.findValueOfExtraVars(extraVars, undefined, false, targets),
      ).rejects.toThrow('Cannot use CONTEXT variable with multiple targets');
    });
  });
});
