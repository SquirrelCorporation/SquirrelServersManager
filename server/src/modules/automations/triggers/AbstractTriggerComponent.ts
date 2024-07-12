import AutomationComponent from '../AutomationComponent';

abstract class AbstractTriggerComponent {
  public automation: AutomationComponent;

  protected constructor(automation: AutomationComponent) {
    this.automation = automation;
  }

  async onCall() {
    await this.automation.onTrigger();
  }

  deregister() {}
}
export default AbstractTriggerComponent;
