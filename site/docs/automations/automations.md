# Automations

:::info ℹ️ What is it?
Automations allow you to schedule for a playbook or docker action **execution**.
:::

## Principles
Automations are formed thanks to 2 elements:
- A `trigger` (only cron based for now)
- An `action`

### Trigger
The trigger is the "**when**" your automations will launch, and how often.
The only trigger available at this time is "Cron", a time based trigger, that will periodically start following your settings 

### Action
The action is the "**what**" your automations will do.
Two actions are available at this time:

|         Action         | Description                                                  | 
|:----------------------:|:-------------------------------------------------------------|
|        **Playbook**        | Execute any playbooks registered in SSM                      |
|     **Docker Action**      | Run a Docker actions such as `restart` a specific container. |

## Adding a new automation
![add-automation](/automations/add-automation.gif)

### 1. Open the drawer
Click on the blue button `Add a new automation`

### 2. Name your automation
On top on the drawer, enter a **unique** name for your automation

### 3. Add a trigger
Choose a trigger and set up the value
![add-automation](/automations/setup-cron.gif)
### 4. Add an action
Choose a action, and the targets of this action

Finally, click on submit

## Showing an automation logs
![automation-logs](/automations/automation-logs.gif)
To see the execution logs of your automation, click on the back facing arrow on the line of your device and click on `Show execution logs`

## Deleting an automation
To delete an automation, click on the back facing arrow on the line of your device and click on `Delete`
