import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AutomationEngine } from '../automation-engine.service';
import { AutomationsController } from '../automations.controller';
import { AutomationsModule } from '../automations.module';
import { AutomationsService } from '../automations.service';
import { Automation, AutomationSchema } from '../schemas/automation.schema';

// Mock MongooseModule
vi.mock('@nestjs/mongoose', async () => {
  return {
    MongooseModule: {
      forFeature: vi.fn().mockReturnValue({
        module: class MockMongooseModule {},
        providers: [],
      }),
    },
    Prop: vi.fn().mockImplementation(() => {
      return (target: any, key: string) => {
        // This is a decorator mock implementation
      };
    }),
    Schema: vi.fn().mockImplementation(() => {
      return (target: any) => {
        // This is a decorator mock implementation
      };
    }),
    SchemaFactory: {
      createForClass: vi.fn().mockReturnValue({
        // Mock schema methods and properties
        index: vi.fn().mockReturnThis(),
      }),
    },
    InjectModel: vi.fn().mockImplementation((model) => {
      return (target: any, key: string, index: number) => {
        // This is a decorator mock implementation
      };
    }),
  };
});

describe('AutomationsModule', () => {
  let module: AutomationsModule;

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      imports: [AutomationsModule],
    }).compile();

    module = testModule.get<AutomationsModule>(AutomationsModule);
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have the correct imports', () => {
    // Verify MongooseModule.forFeature was called with the correct arguments
    expect(MongooseModule.forFeature).toHaveBeenCalledWith([
      { name: Automation.name, schema: AutomationSchema },
    ]);
  });

  it('should have the correct providers', () => {
    // Use the module's metadata to check providers
    const providers = Reflect.getMetadata('providers', AutomationsModule);
    expect(providers).toContain(AutomationsService);
    expect(providers).toContain(AutomationEngine);
  });

  it('should have the correct controllers', () => {
    // Use the module's metadata to check controllers
    const controllers = Reflect.getMetadata('controllers', AutomationsModule);
    expect(controllers).toContain(AutomationsController);
  });
});
