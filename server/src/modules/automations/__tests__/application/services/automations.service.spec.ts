import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AutomationEngine } from '../automation-engine.service';
import { AutomationsService } from '../automations.service';
import { CreateAutomationDto } from '../dto/create-automation.dto';
import { UpdateAutomationDto } from '../dto/update-automation.dto';
import { Automation, AutomationDocument } from '../schemas/automation.schema';

describe('AutomationsService', () => {
  let service: AutomationsService;
  let model: Model<AutomationDocument>;
  let automationEngine: AutomationEngine;
  let mockAutomationEngine: any;

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

  beforeEach(async () => {
    // Create mock model
    const mockModel = {
      find: vi.fn().mockReturnThis(),
      findOne: vi.fn().mockReturnThis(),
      create: vi.fn().mockResolvedValue(mockAutomation),
      updateOne: vi.fn().mockReturnThis(),
      deleteOne: vi.fn().mockReturnThis(),
      lean: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([mockAutomation]),
    };

    // Create mock automation engine with all required methods
    mockAutomationEngine = {
      registerComponent: vi.fn().mockResolvedValue(undefined),
      deregisterComponent: vi.fn().mockResolvedValue(undefined),
      executeAutomation: vi.fn().mockResolvedValue(undefined),
      getRegisteredComponents: vi.fn().mockResolvedValue([mockAutomation]),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AutomationsService,
        {
          provide: getModelToken(Automation.name),
          useValue: mockModel,
        },
        {
          provide: AutomationEngine,
          useValue: mockAutomationEngine,
        },
      ],
    }).compile();

    service = moduleRef.get<AutomationsService>(AutomationsService);
    model = moduleRef.get<Model<AutomationDocument>>(getModelToken(Automation.name));
    automationEngine = moduleRef.get<AutomationEngine>(AutomationEngine);

    // Ensure the automationEngine is properly set in the service
    // This is a workaround for potential DI issues in the test environment
    Object.defineProperty(service, 'automationEngine', {
      value: mockAutomationEngine,
      writable: true,
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all automations', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockAutomation]);
      expect(model.find).toHaveBeenCalled();
      expect(model.lean).toHaveBeenCalled();
      expect(model.exec).toHaveBeenCalled();
    });
  });

  describe('findAllEnabled', () => {
    it('should return all enabled automations', async () => {
      const result = await service.findAllEnabled();
      expect(result).toEqual([mockAutomation]);
      expect(model.find).toHaveBeenCalledWith({ enabled: true });
      expect(model.lean).toHaveBeenCalled();
      expect(model.exec).toHaveBeenCalled();
    });
  });

  describe('findByUuid', () => {
    it('should return a single automation by uuid', async () => {
      // Mock findOne to return a single automation
      vi.spyOn(model, 'findOne').mockReturnValueOnce({
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValueOnce(mockAutomation),
      } as any);

      const result = await service.findByUuid('test-uuid');
      expect(result).toEqual(mockAutomation);
      expect(model.findOne).toHaveBeenCalledWith({ uuid: 'test-uuid' });
    });
  });

  describe('create', () => {
    it('should create a new automation', async () => {
      const createDto: CreateAutomationDto = {
        name: 'Test Automation',
        automationChains: mockAutomation.automationChains,
        enabled: true,
      };
      const result = await service.create(createDto);
      expect(result).toEqual(mockAutomation);
      expect(model.create).toHaveBeenCalledWith(createDto);
      expect(mockAutomationEngine.registerComponent).toHaveBeenCalledWith(mockAutomation);
    });
  });

  describe('update', () => {
    it('should update an existing automation', async () => {
      const updateDto: UpdateAutomationDto = {
        name: 'Updated Automation',
        automationChains: mockAutomation.automationChains,
      };

      // Create a deep clone of mockAutomation to avoid reference issues
      const originalAutomation = JSON.parse(JSON.stringify(mockAutomation));

      // Create the updated automation object
      const updatedAutomation = {
        ...originalAutomation,
        name: 'Updated Automation',
      };

      // Setup the findByUuid spy for the first call
      const findByUuidSpy = vi.spyOn(service, 'findByUuid');
      findByUuidSpy.mockResolvedValueOnce(originalAutomation);
      findByUuidSpy.mockResolvedValueOnce(updatedAutomation);

      // Reset the mocks to ensure clean call history
      mockAutomationEngine.deregisterComponent.mockClear();
      mockAutomationEngine.registerComponent.mockClear();

      await service.update('test-uuid', updateDto);

      // Verify that deregisterComponent was called with the original automation
      expect(mockAutomationEngine.deregisterComponent).toHaveBeenCalledWith(originalAutomation);

      // Verify updateOne was called with the correct parameters
      expect(model.updateOne).toHaveBeenCalledWith({ uuid: 'test-uuid' }, updateDto);

      // Verify that registerComponent was called with the updated automation
      expect(mockAutomationEngine.registerComponent).toHaveBeenCalledWith(updatedAutomation);
    });

    it('should throw an error if automation not found', async () => {
      const updateDto: UpdateAutomationDto = {
        name: 'Updated Automation',
      };

      // Mock findByUuid to return null
      vi.spyOn(service, 'findByUuid').mockResolvedValueOnce(null);

      await expect(service.update('test-uuid', updateDto)).rejects.toThrow(
        'Automation with uuid: test-uuid not found',
      );

      expect(mockAutomationEngine.deregisterComponent).not.toHaveBeenCalled();
      expect(model.updateOne).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete an automation', async () => {
      // Mock findByUuid to return the automation first
      vi.spyOn(service, 'findByUuid').mockResolvedValueOnce(mockAutomation);

      // Reset the mock to ensure clean call history
      mockAutomationEngine.deregisterComponent.mockClear();

      await service.delete('test-uuid');

      expect(mockAutomationEngine.deregisterComponent).toHaveBeenCalledWith(mockAutomation);
      expect(model.deleteOne).toHaveBeenCalledWith({ uuid: 'test-uuid' });
    });

    it('should throw an error if automation not found', async () => {
      // Mock findByUuid to return null
      vi.spyOn(service, 'findByUuid').mockResolvedValueOnce(null);

      await expect(service.delete('test-uuid')).rejects.toThrow(
        'Automation with uuid: test-uuid not found',
      );

      expect(mockAutomationEngine.deregisterComponent).not.toHaveBeenCalled();
      expect(model.deleteOne).not.toHaveBeenCalled();
    });
  });

  describe('execute', () => {
    it('should execute an automation successfully', async () => {
      // Mock findByUuid to return the automation first
      vi.spyOn(service, 'findByUuid').mockResolvedValueOnce(mockAutomation);

      // Mock setLastExecutionStatus
      vi.spyOn(service, 'setLastExecutionStatus').mockResolvedValueOnce();

      // Reset the mock to ensure clean call history
      mockAutomationEngine.executeAutomation.mockClear();

      await service.execute('test-uuid');

      expect(mockAutomationEngine.executeAutomation).toHaveBeenCalledWith(mockAutomation);
      expect(service.setLastExecutionStatus).toHaveBeenCalledWith('test-uuid', 'success');
    });

    it('should handle execution failure', async () => {
      // Mock findByUuid to return the automation first
      vi.spyOn(service, 'findByUuid').mockResolvedValueOnce(mockAutomation);

      // Mock setLastExecutionStatus
      vi.spyOn(service, 'setLastExecutionStatus').mockResolvedValueOnce();

      // Mock executeAutomation to throw an error
      mockAutomationEngine.executeAutomation.mockRejectedValueOnce(new Error('Execution failed'));

      await expect(service.execute('test-uuid')).rejects.toThrow('Execution failed');
      expect(service.setLastExecutionStatus).toHaveBeenCalledWith('test-uuid', 'failed');
    });

    it('should throw an error if automation not found', async () => {
      // Mock findByUuid to return null
      vi.spyOn(service, 'findByUuid').mockResolvedValueOnce(null);

      await expect(service.execute('test-uuid')).rejects.toThrow(
        'Automation with uuid: test-uuid not found',
      );
    });
  });

  describe('setLastExecutionStatus', () => {
    it('should update the automation execution status', async () => {
      await service.setLastExecutionStatus('test-uuid', 'success');

      expect(model.updateOne).toHaveBeenCalledWith(
        { uuid: 'test-uuid' },
        {
          lastExecutionStatus: 'success',
          lastExecutionTime: expect.any(Date),
        },
      );
    });
  });
});
