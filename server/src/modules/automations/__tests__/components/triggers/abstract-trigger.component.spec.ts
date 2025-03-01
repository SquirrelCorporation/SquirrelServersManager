import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AutomationComponent } from '../../../components/automation.component';
import { AbstractTriggerComponent } from '../../../components/triggers/abstract-trigger.component';

// Create a concrete implementation of the abstract class for testing
class TestTriggerComponent extends AbstractTriggerComponent {
  testDeregisterCalled = false;

  deregister() {
    this.testDeregisterCalled = true;
  }
}

describe('AbstractTriggerComponent', () => {
  let testTriggerComponent: TestTriggerComponent;
  let automationComponent: AutomationComponent;

  beforeEach(() => {
    // Create a mock automation component
    automationComponent = new AutomationComponent('1234', 'Test Automation', {});
    automationComponent.onTrigger = vi.fn().mockResolvedValue(undefined);

    // Create the test trigger component
    testTriggerComponent = new TestTriggerComponent(automationComponent);
  });

  it('should be defined', () => {
    expect(testTriggerComponent).toBeDefined();
  });

  it('should store the automation component reference', () => {
    expect(testTriggerComponent.automation).toBe(automationComponent);
  });

  it('should call automation.onTrigger when onCall is called', async () => {
    await testTriggerComponent.onCall();
    expect(automationComponent.onTrigger).toHaveBeenCalledTimes(1);
  });

  it('should implement a deregister method', () => {
    testTriggerComponent.deregister();
    expect(testTriggerComponent.testDeregisterCalled).toBe(true);
  });
});
