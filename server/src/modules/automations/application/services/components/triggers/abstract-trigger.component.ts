import { AutomationComponent } from '../automation.component';

export abstract class AbstractTriggerComponent {
  public automation: AutomationComponent;

  constructor(automation: AutomationComponent) {
    this.automation = automation;
  }

  async onCall() {
    await this.automation.onTrigger();
  }

  deregister() {}
}
