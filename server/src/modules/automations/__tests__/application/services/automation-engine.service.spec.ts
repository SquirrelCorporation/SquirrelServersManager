import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AutomationEngine } from '../automation-engine.service';
import { AutomationComponent } from '../components/automation.component';
import { Automation, AutomationDocument } from '../schemas/automation.schema';

vi.mock('../components/automation.component');

const mockAutomation = {
  uuid: 'test-uuid',
  name: 'Test Automation',
  automationChains: {
    trigger: {
      type: 'cron',
      expression: '0 0 * * *',
    },
    actions: [
      {
        type: 'docker',
        operation: 'start',
        containerId: 'test-container',
      },
    ],
  },
  enabled: true,
} as Automation;

describe('AutomationEngine', () => {
  let engine: AutomationEngine;
  let model: Model<AutomationDocument>;
  let mockAutomationComponent: any;

  beforeEach(async () => {
    // Create a mock for AutomationComponent
    mockAutomationComponent = {
      init: vi.fn().mockResolvedValue(undefined),
      deregister: vi.fn(),
      synchronousExecution: vi.fn().mockResolvedValue(undefined),
    };

    // Reset the mock constructor
    vi.mocked(AutomationComponent).mockClear();
    vi.mocked(AutomationComponent).mockImplementation(() => mockAutomationComponent);

    const module = await Test.createTestingModule({
      providers: [
        AutomationEngine,
        {
          provide: getModelToken(Automation.name),
          useValue: {
            find: vi.fn().mockReturnValue({
              lean: vi.fn().mockReturnValue({
                exec: vi.fn().mockResolvedValue([mockAutomation]),
              }),
            }),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: vi.fn(),
            error: vi.fn(),
            warn: vi.fn(),
            debug: vi.fn(),
            verbose: vi.fn(),
          },
        },
      ],
    }).compile();

    engine = module.get<AutomationEngine>(AutomationEngine);
    model = module.get<Model<AutomationDocument>>(getModelToken(Automation.name));

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should be defined', () => {
    expect(engine).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize all enabled automations', async () => {
      const registerComponentsSpy = vi
        .spyOn(engine, 'registerComponents')
        .mockResolvedValue(undefined);

      await engine.onModuleInit();

      expect(registerComponentsSpy).toHaveBeenCalled();
    });
  });

  describe('getStates', () => {
    it('should return the current state of automations', () => {
      // Set up some state
      engine['automations'] = { 'test-uuid': mockAutomationComponent };

      const result = engine.getStates();

      expect(result).toEqual({ automation: { 'test-uuid': mockAutomationComponent } });
    });
  });

  describe('registerComponents', () => {
    it('should register all enabled automations', async () => {
      const registerComponentSpy = vi
        .spyOn(engine, 'registerComponent')
        .mockResolvedValue(undefined);

      await engine.registerComponents();

      expect(model.find).toHaveBeenCalledWith({ enabled: true });
      expect(registerComponentSpy).toHaveBeenCalledWith(mockAutomation);
    });

    it('should handle no enabled automations', async () => {
      vi.mocked(model.find).mockReturnValueOnce({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const registerComponentSpy = vi.spyOn(engine, 'registerComponent');

      await engine.registerComponents();

      expect(registerComponentSpy).not.toHaveBeenCalled();
    });

    it('should handle errors during registration', async () => {
      const error = new Error('Registration error');
      vi.spyOn(engine, 'registerComponent').mockRejectedValueOnce(error);

      await expect(engine.registerComponents()).rejects.toThrow('Registration error');
    });
  });

  describe('registerComponent', () => {
    it('should register a new automation component', async () => {
      await engine.registerComponent(mockAutomation);

      expect(AutomationComponent).toHaveBeenCalledWith(
        mockAutomation.uuid,
        mockAutomation.name,
        mockAutomation.automationChains,
      );

      expect(mockAutomationComponent.init).toHaveBeenCalled();
      expect(engine['automations'][mockAutomation.uuid]).toBe(mockAutomationComponent);
    });

    it('should validate automation data before registering', async () => {
      const invalidAutomation = { ...mockAutomation, uuid: undefined } as any;

      await expect(engine.registerComponent(invalidAutomation)).rejects.toThrow(
        'Invalid automation data: missing uuid or name',
      );

      expect(AutomationComponent).not.toHaveBeenCalled();
    });

    it('should validate automation chains before registering', async () => {
      const invalidAutomation = { ...mockAutomation, automationChains: undefined } as any;

      await expect(engine.registerComponent(invalidAutomation)).rejects.toThrow(
        'Invalid automation data: missing automationChains',
      );

      expect(AutomationComponent).not.toHaveBeenCalled();
    });

    it('should clean up if initialization fails', async () => {
      mockAutomationComponent.init.mockRejectedValueOnce(new Error('Init failed'));

      await expect(engine.registerComponent(mockAutomation)).rejects.toThrow('Init failed');

      expect(engine['automations'][mockAutomation.uuid]).toBeUndefined();
    });
  });

  describe('deregisterComponent', () => {
    it('should deregister an automation component', async () => {
      // Setup: register a component first
      engine['automations'][mockAutomation.uuid] = mockAutomationComponent;

      await engine.deregisterComponent(mockAutomation);

      expect(mockAutomationComponent.deregister).toHaveBeenCalled();
      expect(engine['automations'][mockAutomation.uuid]).toBeUndefined();
    });

    it('should throw an error if component not found', async () => {
      await expect(engine.deregisterComponent(mockAutomation)).rejects.toThrow(
        `Could not deregister automation component with uuid: ${mockAutomation.uuid}`,
      );
    });

    it('should handle errors during deregistration', async () => {
      // Setup: register a component first
      engine['automations'][mockAutomation.uuid] = mockAutomationComponent;

      // Mock deregister to throw an error
      mockAutomationComponent.deregister.mockImplementationOnce(() => {
        throw new Error('Deregister error');
      });

      await expect(engine.deregisterComponent(mockAutomation)).rejects.toThrow('Deregister error');
    });
  });

  describe('executeAutomation', () => {
    it('should execute an automation', async () => {
      // Setup: register a component first
      engine['automations'][mockAutomation.uuid] = mockAutomationComponent;

      await engine.executeAutomation(mockAutomation);

      expect(mockAutomationComponent.synchronousExecution).toHaveBeenCalled();
    });

    it('should throw an error if automation not registered', async () => {
      await expect(engine.executeAutomation(mockAutomation)).rejects.toThrow(
        `Automation with uuid: ${mockAutomation.uuid} not registered`,
      );
    });

    it('should handle errors during execution', async () => {
      // Setup: register a component first
      engine['automations'][mockAutomation.uuid] = mockAutomationComponent;

      // Mock synchronousExecution to throw an error
      mockAutomationComponent.synchronousExecution.mockRejectedValueOnce(
        new Error('Execution error'),
      );

      await expect(engine.executeAutomation(mockAutomation)).rejects.toThrow('Execution error');
    });
  });
});
