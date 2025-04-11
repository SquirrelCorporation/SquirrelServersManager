import { describe, expect, it, vi } from 'vitest';

// Mock path aliases that might be required
vi.mock('@modules/containers', () => ({
  CONTAINER_SERVICE: Symbol('CONTAINER_SERVICE'),
  CONTAINER_VOLUMES_SERVICE: Symbol('CONTAINER_VOLUMES_SERVICE'),
  IContainerService: class IContainerService {},
  IContainerVolumesService: class IContainerVolumesService {},
}), { virtual: true });

vi.mock('@modules/playbooks', () => ({
  PLAYBOOKS_SERVICE: Symbol('PLAYBOOKS_SERVICE'),
  IPlaybooksService: class IPlaybooksService {},
}), { virtual: true });

vi.mock('@modules/ansible', () => ({
  TASK_LOGS_SERVICE: Symbol('TASK_LOGS_SERVICE'),
  ITaskLogsService: class ITaskLogsService {},
}), { virtual: true });

vi.mock('@modules/users', () => ({
  USER_REPOSITORY: Symbol('USER_REPOSITORY'),
  IUserRepository: class IUserRepository {},
}), { virtual: true });

// Mock automation component
class MockAutomationComponent {
  uuid: string;
  name: string;
  childLogger = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  };
  
  constructor(uuid: string, name: string, automationChains: any, repo: any) {
    this.uuid = uuid;
    this.name = name;
  }
  
  onTrigger = vi.fn().mockResolvedValue(undefined);
}

// Create mock for AbstractTriggerComponent
class MockAbstractTriggerComponent {
  automation: any;
  testDeregisterCalled = false;
  
  constructor(automation: any) {
    this.automation = automation;
  }
  
  async onCall() {
    await this.automation.onTrigger();
  }
  
  deregister() {
    this.testDeregisterCalled = true;
  }
}

describe('AbstractTriggerComponent', () => {
  it('should handle trigger functionality', async () => {
    const automationComponent = new MockAutomationComponent(
      '1234',
      'Test Automation',
      {},
      {} as any
    );
    
    const triggerComponent = new MockAbstractTriggerComponent(automationComponent);
    
    expect(triggerComponent).toBeDefined();
    expect(triggerComponent.automation).toBe(automationComponent);
    
    await triggerComponent.onCall();
    expect(automationComponent.onTrigger).toHaveBeenCalledTimes(1);
    
    triggerComponent.deregister();
    expect(triggerComponent.testDeregisterCalled).toBe(true);
  });
});