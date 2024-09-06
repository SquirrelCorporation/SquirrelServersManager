# Automations

## 🌰 In a Nutshell

:::info ℹ️ Sum-up
Automations allow you to schedule playbook or Docker action **executions** based on cron scheduled.
:::

## Principles
Automations are formed by two elements:
- A `trigger` (currently only cron-based)
- An `action`

### [Trigger]
The trigger is the "**when**" your automations will launch, and how often.
The only trigger available at this time is "Cron", a time-based trigger that will periodically start according to your settings.

### [Action]
The action is the "**what**" your automations will do.
Two actions are currently available:

|         Action         | Description                                                  |
|:----------------------:|:-------------------------------------------------------------|
|        **Playbook**        | Execute any playbooks registered in SSM                      |
|     **Docker Action**      | Run a Docker action such as `restart` for a specific container |

## Adding a new automation
![add-automation](/automations/add-automation.gif)

### 1. Open the drawer
Click on the blue button `Add a new automation`

### 2. Name your automation
At the top of the drawer, enter a **unique** name for your automation

### 3. Add a trigger
Choose a trigger and set up the value
![add-automation](/automations/setup-cron.gif)

### 4. Add an action
Choose an action and the targets for this action

Finally, click on submit

## Viewing automation logs
![automation-logs](/automations/automation-logs.gif)
To see the execution logs of your automation, click on the downward-facing arrow on the line of your automation and click on `Show execution logs`

## Deleting an automation
To delete an automation, click on the downward-facing arrow on the line of your automation and click on `Delete`
